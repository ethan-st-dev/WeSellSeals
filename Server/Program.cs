using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using Server.Models;
using Server.Services;
using Stripe;
using DotNetEnv;

// Load .env file if it exists (for local development)
if (System.IO.File.Exists(".env"))
{
    Env.Load();
}

var builder = WebApplication.CreateBuilder(args);

// Configure Stripe - read from environment variable or appsettings
StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("Stripe__SecretKey") 
    ?? builder.Configuration["Stripe:SecretKey"];

// Add services to the container.
// Configure database based on environment
if (builder.Environment.EnvironmentName == "Testing")
{
    // Testing: Use InMemory database
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseInMemoryDatabase("TestDatabase"));
}
else if (builder.Environment.IsProduction())
{
    // Production: Use Azure SQL Database
    var connectionString = builder.Configuration.GetConnectionString("AzureSqlConnection")
        ?? throw new InvalidOperationException("Connection string 'AzureSqlConnection' not found.");
    
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString));
}
else
{
    // Development: Use SQLite
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Data Source=wesellseals.db";
    
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite(connectionString));
}

// Configure Clerk JWT Authentication
var clerkDomain = builder.Configuration["Clerk:Domain"] ?? "fluent-wahoo-53.clerk.accounts.dev";
var clerkAuthority = $"https://{clerkDomain}";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = clerkAuthority;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = clerkAuthority,
            ValidateAudience = false, // Clerk doesn't use audience by default
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true
        };
    });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", 
                "http://localhost:5174",
                "https://localhost:5173",
                "https://localhost:5174",
                "https://wesellseals-client.azurestaticapps.net"
              )
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod()
              .SetIsOriginAllowedToAllowWildcardSubdomains();
    });
});

builder.Services.AddAuthorization();

// Register Blob Storage Service
builder.Services.AddSingleton<IBlobStorageService, BlobStorageService>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.EnsureCreated();
    
    // Seed sample data in development
    if (app.Environment.IsDevelopment())
    {
        await SeedData.SeedProducts(dbContext);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Only use HTTPS redirection in development - Azure handles SSL termination
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Log startup information
app.Logger.LogInformation("WeSellSeals API starting...");
app.Logger.LogInformation("Environment: {Environment}", app.Environment.EnvironmentName);
app.Logger.LogInformation("CORS enabled for production domains");

// Health check endpoint
app.MapGet("/", () => Results.Ok(new { 
    status = "ok", 
    service = "WeSellSeals API",
    version = "1.0.0",
    timestamp = DateTime.UtcNow 
}));

app.MapGet("/api", () => Results.Ok(new { 
    status = "ok", 
    message = "WeSellSeals API is running",
    version = "1.0.0"
}));

// Helper method to get or create user from Clerk token
static async Task<ApplicationUser?> GetOrCreateUserFromClerk(HttpContext context, ApplicationDbContext dbContext)
{
    if (context.User.Identity?.IsAuthenticated != true)
    {
        return null;
    }

    // Get Clerk user ID from the JWT token (sub claim)
    var clerkUserId = context.User.FindFirst("sub")?.Value 
                   ?? context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    
    if (string.IsNullOrEmpty(clerkUserId))
    {
        return null;
    }

    // Check if user exists in our database
    var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == clerkUserId);
    
    if (user == null)
    {
        // Create new user record with Clerk ID
        var email = context.User.FindFirst("email")?.Value 
                 ?? context.User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        
        user = new ApplicationUser
        {
            Id = clerkUserId,
            UserName = email ?? clerkUserId,
            Email = email,
            EmailConfirmed = true // Clerk handles email verification
        };
        
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
    }
    
    return user;
}

// Authentication endpoints (now handled by Clerk on the frontend)
// These are kept for backwards compatibility but can be removed
// Authentication endpoints (now handled by Clerk on the frontend)
// These are kept for backwards compatibility but can be removed
app.MapPost("/api/auth/register", () => 
{
    return Results.Ok(new { message = "Registration is now handled by Clerk. Please use the /signup page." });
});

app.MapPost("/api/auth/login", () =>
{
    return Results.Ok(new { message = "Login is now handled by Clerk. Please use the /login page." });
});

app.MapPost("/api/auth/logout", () =>
{
    return Results.Ok(new { message = "Logout is now handled by Clerk on the frontend." });
});

app.MapGet("/api/auth/user", async (HttpContext context, ApplicationDbContext dbContext) =>
{
    var user = await GetOrCreateUserFromClerk(context, dbContext);
    if (user != null)
    {
        return Results.Ok(new AuthResponse 
        { 
            Success = true, 
            Email = user.Email 
        });
    }
    
    return Results.Unauthorized();
}).RequireAuthorization();

// Stripe Payment Intent endpoint
app.MapPost("/api/payments/create-payment-intent", async (
    CheckoutRequest request,
    HttpContext context,
    ApplicationDbContext dbContext) =>
{
    try
    {
        var user = await GetOrCreateUserFromClerk(context, dbContext);
        if (user == null)
        {
            return Results.Unauthorized();
        }
        
        // Check if user already owns any of these seals
        var sealIds = request.Items.Select(i => i.SealId).ToList();
        var existingPurchases = await dbContext.Purchases
            .Where(p => p.UserId == user.Id && sealIds.Contains(p.SealId))
            .Select(p => p.SealId)
            .ToListAsync();
        
        if (existingPurchases.Any())
        {
            return Results.BadRequest(new { 
                success = false, 
                message = "You already own one or more of these seals" 
            });
        }
        
        // Calculate total amount in cents
        var totalAmount = (long)(request.Items.Sum(i => i.Price) * 100);
        
        // Create payment intent
        var paymentIntentService = new PaymentIntentService();
        var paymentIntent = await paymentIntentService.CreateAsync(new PaymentIntentCreateOptions
        {
            Amount = totalAmount,
            Currency = "usd",
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
            {
                Enabled = true,
            },
            Metadata = new Dictionary<string, string>
            {
                { "userId", user.Id },
                { "sealIds", string.Join(",", sealIds) },
                { "sealTitles", string.Join("|", request.Items.Select(i => i.Title)) },
                { "sealPrices", string.Join(",", request.Items.Select(i => i.Price)) }
            }
        });
        
        return Results.Ok(new { 
            clientSecret = paymentIntent.ClientSecret,
            paymentIntentId = paymentIntent.Id
        });
    }
    catch (StripeException ex)
    {
        return Results.Problem(
            detail: ex.Message,
            statusCode: 500,
            title: "Stripe API Error"
        );
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: ex.Message,
            statusCode: 500,
            title: "Payment Error"
        );
    }
}).RequireAuthorization();

// Confirm payment and record purchases
app.MapPost("/api/payments/confirm-payment", async (
    HttpContext context,
    ApplicationDbContext dbContext) =>
{
    try
    {
        var user = await GetOrCreateUserFromClerk(context, dbContext);
        if (user == null)
        {
            return Results.Unauthorized();
        }

        var requestBody = await context.Request.ReadFromJsonAsync<ConfirmPaymentRequest>();
        if (requestBody == null || string.IsNullOrEmpty(requestBody.PaymentIntentId))
        {
            return Results.BadRequest(new { message = "Payment intent ID is required" });
        }

        // Verify payment intent with Stripe
        var paymentIntentService = new PaymentIntentService();
        var paymentIntent = await paymentIntentService.GetAsync(requestBody.PaymentIntentId);

        if (paymentIntent.Status != "succeeded")
        {
            return Results.BadRequest(new { message = "Payment has not succeeded" });
        }

        // Extract metadata and create purchases
        var userId = paymentIntent.Metadata["userId"];
        if (userId != user.Id)
        {
            return Results.Unauthorized();
        }

        var sealIds = paymentIntent.Metadata["sealIds"].Split(',');
        var sealTitles = paymentIntent.Metadata["sealTitles"].Split('|');
        var sealPrices = paymentIntent.Metadata["sealPrices"].Split(',')
            .Select(p => decimal.Parse(p))
            .ToArray();

        // Check if purchases already exist
        var existingPurchases = await dbContext.Purchases
            .Where(p => p.UserId == user.Id && sealIds.Contains(p.SealId))
            .Select(p => p.SealId)
            .ToListAsync();

        // Only add new purchases
        var newSealIds = sealIds.Where(id => !existingPurchases.Contains(id)).ToList();
        if (newSealIds.Any())
        {
            var purchases = new List<Server.Models.Purchase>();
            for (int i = 0; i < sealIds.Length; i++)
            {
                if (newSealIds.Contains(sealIds[i]))
                {
                    purchases.Add(new Server.Models.Purchase
                    {
                        UserId = userId,
                        SealId = sealIds[i],
                        SealTitle = sealTitles[i],
                        Price = sealPrices[i],
                        PurchasedAt = DateTime.UtcNow
                    });
                }
            }

            dbContext.Purchases.AddRange(purchases);
            await dbContext.SaveChangesAsync();
        }

        return Results.Ok(new { success = true, message = "Payment confirmed and purchases recorded" });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: ex.Message,
            statusCode: 500,
            title: "Payment Confirmation Error"
        );
    }
}).RequireAuthorization();

// Webhook to handle successful payments
app.MapPost("/api/payments/webhook", async (
    HttpContext context,
    ApplicationDbContext dbContext) =>
{
    var json = await new StreamReader(context.Request.Body).ReadToEndAsync();
    
    try
    {
        var stripeEvent = EventUtility.ConstructEvent(
            json,
            context.Request.Headers["Stripe-Signature"],
            builder.Configuration["Stripe:WebhookSecret"] ?? ""
        );
        
        if (stripeEvent.Type == "payment_intent.succeeded")
        {
            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
            
            if (paymentIntent?.Metadata != null)
            {
                var userId = paymentIntent.Metadata["userId"];
                var sealIds = paymentIntent.Metadata["sealIds"].Split(',');
                var sealTitles = paymentIntent.Metadata["sealTitles"].Split('|');
                var sealPrices = paymentIntent.Metadata["sealPrices"].Split(',')
                    .Select(p => decimal.Parse(p))
                    .ToArray();
                
                var purchases = new List<Server.Models.Purchase>();
                for (int i = 0; i < sealIds.Length; i++)
                {
                    purchases.Add(new Server.Models.Purchase
                    {
                        UserId = userId,
                        SealId = sealIds[i],
                        SealTitle = sealTitles[i],
                        Price = sealPrices[i],
                        PurchasedAt = DateTime.UtcNow
                    });
                }
                
                dbContext.Purchases.AddRange(purchases);
                await dbContext.SaveChangesAsync();
            }
        }
        
        return Results.Ok();
    }
    catch (StripeException)
    {
        return Results.BadRequest();
    }
});

// Purchase/Checkout endpoints
app.MapPost("/api/purchases/checkout", async (
    CheckoutRequest request, 
    HttpContext context, 
    ApplicationDbContext dbContext) =>
{
    var user = await GetOrCreateUserFromClerk(context, dbContext);
    if (user == null)
    {
        return Results.Unauthorized();
    }
    
    // Check if user already owns any of these seals
    var sealIds = request.Items.Select(i => i.SealId).ToList();
    var existingPurchases = await dbContext.Purchases
        .Where(p => p.UserId == user.Id && sealIds.Contains(p.SealId))
        .Select(p => p.SealId)
        .ToListAsync();
    
    if (existingPurchases.Any())
    {
        return Results.BadRequest(new { 
            success = false, 
            message = "You already own one or more of these seals" 
        });
    }
    
    // Create purchases
    var purchases = request.Items.Select(item => new Purchase
    {
        UserId = user.Id,
        SealId = item.SealId,
        SealTitle = item.Title,
        Price = item.Price,
        PurchasedAt = DateTime.UtcNow
    }).ToList();
    
    dbContext.Purchases.AddRange(purchases);
    await dbContext.SaveChangesAsync();
    
    return Results.Ok(new { 
        success = true, 
        message = "Purchase successful",
        purchasedIds = purchases.Select(p => p.SealId).ToList()
    });
}).RequireAuthorization();

app.MapGet("/api/purchases/my-seals", async (
    HttpContext context,
    ApplicationDbContext dbContext) =>
{
    var user = await GetOrCreateUserFromClerk(context, dbContext);
    if (user == null)
    {
        return Results.Unauthorized();
    }
    
    var purchases = await dbContext.Purchases
        .Where(p => p.UserId == user.Id)
        .OrderByDescending(p => p.PurchasedAt)
        .Select(p => new {
            p.SealId,
            p.SealTitle,
            p.Price,
            p.PurchasedAt
        })
        .ToListAsync();
    
    return Results.Ok(new { success = true, purchases });
}).RequireAuthorization();

app.MapGet("/api/purchases/download/{sealId}", async (
    string sealId,
    HttpContext context,
    ApplicationDbContext dbContext,
    IBlobStorageService blobStorage) =>
{
    var user = await GetOrCreateUserFromClerk(context, dbContext);
    if (user == null)
    {
        return Results.Unauthorized();
    }
    
    // Verify user owns this seal
    var purchase = await dbContext.Purchases
        .FirstOrDefaultAsync(p => p.UserId == user.Id && p.SealId == sealId);
    
    if (purchase == null)
    {
        return Results.NotFound(new { message = "You do not own this seal" });
    }
    
    // Download the 3D model from blob storage
    var modelStream = await blobStorage.DownloadModelAsync(sealId);
    
    if (modelStream == null)
    {
        // Return placeholder if model not yet uploaded
        var placeholderContent = System.Text.Encoding.UTF8.GetBytes(
            $"# {purchase.SealTitle} 3D Model\n# Model file not yet available"
        );
        
        return Results.File(
            placeholderContent,
            contentType: "model/gltf-binary",
            fileDownloadName: $"{purchase.SealTitle.Replace(" ", "-")}.glb"
        );
    }
    
    return Results.File(
        modelStream,
        contentType: "model/gltf-binary",
        fileDownloadName: $"{purchase.SealTitle.Replace(" ", "-")}.glb"
    );
}).RequireAuthorization();

app.MapGet("/api/purchases/owns/{sealId}", async (
    string sealId,
    HttpContext context,
    ApplicationDbContext dbContext) =>
{
    if (context.User.Identity?.IsAuthenticated != true)
    {
        return Results.Ok(new { owns = false });
    }
    
    var user = await GetOrCreateUserFromClerk(context, dbContext);
    if (user == null)
    {
        return Results.Ok(new { owns = false });
    }
    
    var owns = await dbContext.Purchases
        .AnyAsync(p => p.UserId == user.Id && p.SealId == sealId);
    
    return Results.Ok(new { owns });
});

// Admin endpoint to upload 3D model
app.MapPost("/api/admin/upload-model/{sealId}", async (
    string sealId,
    HttpRequest request,
    IBlobStorageService blobStorage) =>
{
    if (!request.HasFormContentType || request.Form.Files.Count == 0)
    {
        return Results.BadRequest(new { message = "No file uploaded" });
    }

    var file = request.Form.Files[0];
    
    if (!file.FileName.EndsWith(".glb", StringComparison.OrdinalIgnoreCase))
    {
        return Results.BadRequest(new { message = "Only GLB files are supported" });
    }

    using var stream = file.OpenReadStream();
    var url = await blobStorage.UploadModelAsync(sealId, stream, "model/gltf-binary");
    
    return Results.Ok(new { success = true, url, sealId });
}).RequireAuthorization(); // TODO: Add admin role check

// Admin endpoint to upload seal image
app.MapPost("/api/admin/upload-image/{sealId}", async (
    string sealId,
    HttpRequest request,
    IBlobStorageService blobStorage) =>
{
    if (!request.HasFormContentType || request.Form.Files.Count == 0)
    {
        return Results.BadRequest(new { message = "No file uploaded" });
    }

    var file = request.Form.Files[0];
    
    var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
    if (!allowedTypes.Contains(file.ContentType))
    {
        return Results.BadRequest(new { message = "Only JPG, PNG, and WebP images are supported" });
    }

    using var stream = file.OpenReadStream();
    var url = await blobStorage.UploadImageAsync(sealId, stream, file.ContentType);
    
    return Results.Ok(new { success = true, url, sealId });
}).RequireAuthorization(); // TODO: Add admin role check


app.MapPost("/api/purchases/check-multiple", async (
    CheckMultipleRequest request,
    HttpContext context,
    ApplicationDbContext dbContext) =>
{
    if (context.User.Identity?.IsAuthenticated != true)
    {
        return Results.Ok(new { ownedSealIds = new List<string>() });
    }
    
    var user = await GetOrCreateUserFromClerk(context, dbContext);
    if (user == null)
    {
        return Results.Ok(new { ownedSealIds = new List<string>() });
    }
    
    var ownedSealIds = await dbContext.Purchases
        .Where(p => p.UserId == user.Id && request.SealIds.Contains(p.SealId))
        .Select(p => p.SealId)
        .ToListAsync();
    
    return Results.Ok(new { ownedSealIds });
});

// Product CRUD Endpoints

// Get all products
app.MapGet("/api/products", async (ApplicationDbContext dbContext) =>
{
    var products = await dbContext.Products.ToListAsync();
    return Results.Ok(products.Select(p => new
    {
        p.Id,
        p.Title,
        p.Price,
        Image = p.ImageUrl ?? "/seal-logo2.png",
        p.ShortDescription,
        p.LongDescription,
        ModelUrl = p.ModelUrl,
        p.Category,
        p.Subcategory,
        Tags = p.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
    }));
});

// Get single product
app.MapGet("/api/products/{id}", async (string id, ApplicationDbContext dbContext) =>
{
    var product = await dbContext.Products.FindAsync(id);
    if (product == null)
    {
        return Results.NotFound();
    }
    
    return Results.Ok(new
    {
        product.Id,
        product.Title,
        product.Price,
        Image = product.ImageUrl ?? "/seal-logo2.png",
        product.ShortDescription,
        product.LongDescription,
        ModelUrl = product.ModelUrl,
        product.Category,
        product.Subcategory,
        Tags = product.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
    });
});

// Create product with image and model files
app.MapPost("/api/products", async (
    HttpRequest request,
    ApplicationDbContext dbContext,
    IBlobStorageService blobStorage) =>
{
    // TODO: Add admin role check
    
    var form = await request.ReadFormAsync();
    
    // Parse JSON data from form
    var jsonData = form["data"].ToString();
    if (string.IsNullOrEmpty(jsonData))
    {
        return Results.BadRequest(new { message = "Product data is required" });
    }
    
    CreateProductRequest? productRequest;
    try
    {
        productRequest = System.Text.Json.JsonSerializer.Deserialize<CreateProductRequest>(jsonData, 
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }
    catch
    {
        return Results.BadRequest(new { message = "Invalid JSON data" });
    }
    
    if (productRequest == null)
    {
        return Results.BadRequest(new { message = "Invalid product data" });
    }
    
    // Check if product ID already exists
    if (await dbContext.Products.AnyAsync(p => p.Id == productRequest.Id))
    {
        return Results.BadRequest(new { message = "Product with this ID already exists" });
    }
    
    var product = new Server.Models.Product
    {
        Id = productRequest.Id,
        Title = productRequest.Title,
        Price = productRequest.Price,
        ShortDescription = productRequest.ShortDescription,
        LongDescription = productRequest.LongDescription,
        Category = productRequest.Category,
        Subcategory = productRequest.Subcategory,
        Tags = string.Join(",", productRequest.Tags),
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };
    
    // Upload image if provided
    var imageFile = form.Files.GetFile("image");
    if (imageFile != null)
    {
        var allowedImageTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedImageTypes.Contains(imageFile.ContentType))
        {
            return Results.BadRequest(new { message = "Only JPG, PNG, and WebP images are supported" });
        }
        
        using var imageStream = imageFile.OpenReadStream();
        product.ImageUrl = await blobStorage.UploadImageAsync(product.Id, imageStream, imageFile.ContentType);
    }
    
    // Upload model if provided
    var modelFile = form.Files.GetFile("model");
    if (modelFile != null)
    {
        if (modelFile.ContentType != "model/gltf-binary" && !modelFile.FileName.EndsWith(".glb"))
        {
            return Results.BadRequest(new { message = "Only GLB model files are supported" });
        }
        
        using var modelStream = modelFile.OpenReadStream();
        product.ModelUrl = await blobStorage.UploadModelAsync(product.Id, modelStream, "model/gltf-binary");
    }
    
    dbContext.Products.Add(product);
    await dbContext.SaveChangesAsync();
    
    return Results.Created($"/api/products/{product.Id}", new
    {
        product.Id,
        product.Title,
        product.Price,
        Image = product.ImageUrl ?? "/seal-logo2.png",
        product.ShortDescription,
        product.LongDescription,
        ModelUrl = product.ModelUrl,
        product.Category,
        product.Subcategory,
        Tags = product.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
    });
}).DisableAntiforgery().RequireAuthorization();

// Update product
app.MapPut("/api/products/{id}", async (
    string id,
    HttpRequest request,
    ApplicationDbContext dbContext,
    IBlobStorageService blobStorage) =>
{
    // TODO: Add admin role check
    
    var product = await dbContext.Products.FindAsync(id);
    if (product == null)
    {
        return Results.NotFound();
    }
    
    var form = await request.ReadFormAsync();
    
    // Parse JSON data from form
    var jsonData = form["data"].ToString();
    if (string.IsNullOrEmpty(jsonData))
    {
        return Results.BadRequest(new { message = "Product data is required" });
    }
    
    UpdateProductRequest? updateRequest;
    try
    {
        updateRequest = System.Text.Json.JsonSerializer.Deserialize<UpdateProductRequest>(jsonData,
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }
    catch
    {
        return Results.BadRequest(new { message = "Invalid JSON data" });
    }
    
    if (updateRequest == null)
    {
        return Results.BadRequest(new { message = "Invalid product data" });
    }
    
    // Update properties
    product.Title = updateRequest.Title;
    product.Price = updateRequest.Price;
    product.ShortDescription = updateRequest.ShortDescription;
    product.LongDescription = updateRequest.LongDescription;
    product.Category = updateRequest.Category;
    product.Subcategory = updateRequest.Subcategory;
    product.Tags = string.Join(",", updateRequest.Tags);
    product.UpdatedAt = DateTime.UtcNow;
    
    // Update image if provided
    var imageFile = form.Files.GetFile("image");
    if (imageFile != null)
    {
        var allowedImageTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedImageTypes.Contains(imageFile.ContentType))
        {
            return Results.BadRequest(new { message = "Only JPG, PNG, and WebP images are supported" });
        }
        
        // Delete old image
        await blobStorage.DeleteImageAsync(product.Id);
        
        using var imageStream = imageFile.OpenReadStream();
        product.ImageUrl = await blobStorage.UploadImageAsync(product.Id, imageStream, imageFile.ContentType);
    }
    
    // Update model if provided
    var modelFile = form.Files.GetFile("model");
    if (modelFile != null)
    {
        if (modelFile.ContentType != "model/gltf-binary" && !modelFile.FileName.EndsWith(".glb"))
        {
            return Results.BadRequest(new { message = "Only GLB model files are supported" });
        }
        
        // Delete old model
        await blobStorage.DeleteModelAsync(product.Id);
        
        using var modelStream = modelFile.OpenReadStream();
        product.ModelUrl = await blobStorage.UploadModelAsync(product.Id, modelStream, "model/gltf-binary");
    }
    
    await dbContext.SaveChangesAsync();
    
    return Results.Ok(new
    {
        product.Id,
        product.Title,
        product.Price,
        Image = product.ImageUrl ?? "/seal-logo2.png",
        product.ShortDescription,
        product.LongDescription,
        ModelUrl = product.ModelUrl,
        product.Category,
        product.Subcategory,
        Tags = product.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
    });
}).DisableAntiforgery().RequireAuthorization();

// Delete product
app.MapDelete("/api/products/{id}", async (
    string id,
    ApplicationDbContext dbContext,
    IBlobStorageService blobStorage) =>
{
    // TODO: Add admin role check
    
    var product = await dbContext.Products.FindAsync(id);
    if (product == null)
    {
        return Results.NotFound();
    }
    
    // Delete associated files from blob storage
    await blobStorage.DeleteImageAsync(product.Id);
    await blobStorage.DeleteModelAsync(product.Id);
    
    dbContext.Products.Remove(product);
    await dbContext.SaveChangesAsync();
    
    return Results.NoContent();
}).RequireAuthorization();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
    {
        var forecast = Enumerable.Range(1, 5).Select(index =>
                new WeatherForecast
                (
                    DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                    Random.Shared.Next(-20, 55),
                    summaries[Random.Shared.Next(summaries.Length)]
                ))
            .ToArray();
        return forecast;
    })
    .WithName("GetWeatherForecast");

app.Run();

// Make Program class accessible to tests
public partial class Program { }

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}