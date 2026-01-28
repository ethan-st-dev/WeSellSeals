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
    // Development: Use local SQL Server (Docker)
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Server=localhost,1433;Database=wesellseals_dev;User ID=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;";
    
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString));
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
                "https://wesellseals-client.azurestaticapps.net",
                "https://brave-beach-02c856b1e.4.azurestaticapps.net"
              )
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders("*")
              .SetIsOriginAllowedToAllowWildcardSubdomains();
    });
});

builder.Services.AddAuthorization();

// Add antiforgery services (required for .DisableAntiforgery())
builder.Services.AddAntiforgery();

// Configure File Storage Service based on environment
if (builder.Environment.IsProduction())
{
    // Production: Use Azure Blob Storage
    builder.Services.AddScoped<IFileStorageService, AzureBlobStorageService>();
}
else
{
    // Development: Use Azurite (local Azure emulator)
    builder.Services.AddScoped<IFileStorageService, AzureBlobStorageService>();
}

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.EnsureCreated();
    
    // Seed data disabled - use admin panel to manage products
    // if (!app.Environment.IsProduction())
    // {
    //     Server.Data.SeedData.Initialize(dbContext);
    // }
    //meow
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Handle OPTIONS requests explicitly for CORS preflight - MUST be before routing
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 200;
        context.Response.Headers.Append("Access-Control-Allow-Origin", 
            context.Request.Headers["Origin"].ToString());
        context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        context.Response.Headers.Append("Access-Control-Allow-Headers", "Authorization, Content-Type");
        context.Response.Headers.Append("Access-Control-Allow-Credentials", "true");
        await context.Response.CompleteAsync();
        return;
    }
    await next();
});

// Only use HTTPS redirection in development - Azure handles SSL termination
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Serve static files from uploads directory for local development
if (!app.Environment.IsProduction())
{
    var uploadsPath = builder.Configuration["FileStorage:LocalPath"] ?? "uploads";
    if (!Directory.Exists(uploadsPath))
    {
        Directory.CreateDirectory(uploadsPath);
    }
    // Configure MIME types
    var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
    provider.Mappings[".glb"] = "model/gltf-binary";
    provider.Mappings[".gltf"] = "model/gltf+json";
    
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
            Path.Combine(Directory.GetCurrentDirectory(), uploadsPath)),
        RequestPath = "/uploads",
        ContentTypeProvider = provider,
        OnPrepareResponse = ctx =>
        {
            // Add CORS headers for model-viewer and other 3D tools
            ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
            ctx.Context.Response.Headers.Append("Access-Control-Allow-Methods", "GET");
            ctx.Context.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type");
        }
    });
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
    ApplicationDbContext dbContext) =>
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
    
    // In production, you would serve the actual 3D model file from storage
    // For now, return a placeholder GLB file
    var placeholderContent = System.Text.Encoding.UTF8.GetBytes(
        $"# {purchase.SealTitle} 3D Model\\n# Placeholder file - replace with actual GLB model"
    );
    
    return Results.File(
        placeholderContent,
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

// ===== PRODUCT ENDPOINTS =====

// Upload file (GLB model or image) - requires authentication
app.MapPost("/api/admin/upload", async (
    HttpRequest request,
    HttpContext context,
    ApplicationDbContext dbContext,
    IFileStorageService fileStorageService) =>
{
    var user = await GetOrCreateUserFromClerk(context, dbContext);
    if (user == null)
    {
        return Results.Unauthorized();
    }
    
    if (!request.HasFormContentType || request.Form.Files.Count == 0)
    {
        return Results.BadRequest(new { message = "No file uploaded" });
    }
    
    var file = request.Form.Files[0];
    
    // Validate file type (allow GLB and common image formats)
    var allowedExtensions = new[] { ".glb", ".jpg", ".jpeg", ".png", ".webp" };
    var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
    
    if (!allowedExtensions.Contains(fileExtension))
    {
        return Results.BadRequest(new { message = "Invalid file type. Allowed types: .glb, .jpg, .jpeg, .png, .webp" });
    }
    
    // Validate file size (max 50MB)
    if (file.Length > 50 * 1024 * 1024)
    {
        return Results.BadRequest(new { message = "File size exceeds 50MB limit" });
    }
    
    try
    {
        using var stream = file.OpenReadStream();
        var fileUrl = await fileStorageService.UploadFileAsync(stream, file.FileName, file.ContentType);
        
        return Results.Ok(new { url = fileUrl, fileName = file.FileName });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: ex.Message,
            statusCode: 500,
            title: "File Upload Error"
        );
    }
})
.RequireAuthorization()
.DisableAntiforgery(); // Required for file uploads

// Allow OPTIONS for CORS preflight
app.MapMethods("/api/admin/upload", new[] { "OPTIONS" }, () => Results.Ok());

// Proxy blob files to avoid CORS issues
app.MapGet("/api/files/{*blobPath}", async (string blobPath, IFileStorageService fileStorageService) =>
{
    try
    {
        // For Azure Blob Storage, we need to fetch the file and stream it
        if (fileStorageService is AzureBlobStorageService azureService)
        {
            var containerClient = azureService.GetContainerClient();
            var blobClient = containerClient.GetBlobClient(blobPath);
            
            if (await blobClient.ExistsAsync())
            {
                var download = await blobClient.DownloadAsync();
                var contentType = download.Value.Details.ContentType;
                
                return Results.Stream(download.Value.Content, contentType);
            }
            return Results.NotFound();
        }
        return Results.NotFound();
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
});

// Get all products
app.MapGet("/api/products", async (ApplicationDbContext dbContext) =>
{
    var products = await dbContext.Products
        .OrderByDescending(p => p.CreatedAt)
        .ToListAsync();
    
    return Results.Ok(products);
});

// Get product by ID
app.MapGet("/api/products/{id}", async (string id, ApplicationDbContext dbContext) =>
{
    var product = await dbContext.Products.FindAsync(id);
    
    if (product == null)
    {
        return Results.NotFound(new { message = "Product not found" });
    }
    
    return Results.Ok(product);
});

// Get products by category
app.MapGet("/api/products/category/{category}", async (string category, ApplicationDbContext dbContext) =>
{
    var products = await dbContext.Products
        .Where(p => p.Category == category)
        .OrderByDescending(p => p.CreatedAt)
        .ToListAsync();
    
    return Results.Ok(products);
});

// Create new product (requires authentication)
app.MapPost("/api/products", async (
    Server.Models.Product product,
    HttpContext context,
    ApplicationDbContext dbContext) =>
{
    var user = await GetOrCreateUserFromClerk(context, dbContext);
    if (user == null)
    {
        return Results.Unauthorized();
    }
    
    // Validate product
    if (string.IsNullOrEmpty(product.Title) || product.Price <= 0)
    {
        return Results.BadRequest(new { message = "Invalid product data" });
    }
    
    product.Id = Guid.NewGuid().ToString();
    product.CreatedAt = DateTime.UtcNow;
    
    dbContext.Products.Add(product);
    await dbContext.SaveChangesAsync();
    
    return Results.Created($"/api/products/{product.Id}", product);
}).RequireAuthorization();

// Update product (requires authentication)
app.MapPut("/api/products/{id}", async (
    string id,
    Server.Models.Product updatedProduct,
    HttpContext context,
    ApplicationDbContext dbContext) =>
{
    var user = await GetOrCreateUserFromClerk(context, dbContext);
    if (user == null)
    {
        return Results.Unauthorized();
    }
    
    var product = await dbContext.Products.FindAsync(id);
    if (product == null)
    {
        return Results.NotFound(new { message = "Product not found" });
    }
    
    // Update fields
    product.Title = updatedProduct.Title;
    product.Price = updatedProduct.Price;
    product.Image = updatedProduct.Image;
    product.ShortDescription = updatedProduct.ShortDescription;
    product.LongDescription = updatedProduct.LongDescription;
    product.ModelUrl = updatedProduct.ModelUrl;
    product.Category = updatedProduct.Category;
    product.Subcategory = updatedProduct.Subcategory;
    product.Tags = updatedProduct.Tags;
    product.UpdatedAt = DateTime.UtcNow;
    
    await dbContext.SaveChangesAsync();
    
    return Results.Ok(product);
}).RequireAuthorization();

// Delete product (requires authentication)
app.MapDelete("/api/products/{id}", async (
    string id,
    HttpContext context,
    ApplicationDbContext dbContext) =>
{
    var user = await GetOrCreateUserFromClerk(context, dbContext);
    if (user == null)
    {
        return Results.Unauthorized();
    }
    
    var product = await dbContext.Products.FindAsync(id);
    if (product == null)
    {
        return Results.NotFound(new { message = "Product not found" });
    }
    
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