using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Stripe;

var builder = WebApplication.CreateBuilder(args);

// Configure Stripe
StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    
    // User settings
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.SlidingExpiration = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod()
              .SetIsOriginAllowedToAllowWildcardSubdomains();
    });
});

builder.Services.AddAuthorization();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Authentication endpoints
app.MapPost("/api/auth/register", async (RegisterRequest request, UserManager<ApplicationUser> userManager) =>
{
    if (request.Password != request.ConfirmPassword)
    {
        return Results.BadRequest(new AuthResponse 
        { 
            Success = false, 
            Message = "Passwords do not match" 
        });
    }

    var user = new ApplicationUser 
    { 
        UserName = request.Email, 
        Email = request.Email 
    };

    var result = await userManager.CreateAsync(user, request.Password);

    if (result.Succeeded)
    {
        return Results.Ok(new AuthResponse 
        { 
            Success = true, 
            Message = "Registration successful",
            Email = user.Email
        });
    }

    return Results.BadRequest(new AuthResponse 
    { 
        Success = false, 
        Message = string.Join(", ", result.Errors.Select(e => e.Description))
    });
});

app.MapPost("/api/auth/login", async (LoginRequest request, SignInManager<ApplicationUser> signInManager) =>
{
    var result = await signInManager.PasswordSignInAsync(
        request.Email, 
        request.Password, 
        isPersistent: true, 
        lockoutOnFailure: false);

    if (result.Succeeded)
    {
        return Results.Ok(new AuthResponse 
        { 
            Success = true, 
            Message = "Login successful",
            Email = request.Email
        });
    }

    return Results.Unauthorized();
});

app.MapPost("/api/auth/logout", async (SignInManager<ApplicationUser> signInManager) =>
{
    await signInManager.SignOutAsync();
    return Results.Ok(new AuthResponse 
    { 
        Success = true, 
        Message = "Logout successful" 
    });
});

app.MapGet("/api/auth/user", async (HttpContext context, UserManager<ApplicationUser> userManager) =>
{
    if (context.User.Identity?.IsAuthenticated == true)
    {
        var user = await userManager.GetUserAsync(context.User);
        if (user != null)
        {
            return Results.Ok(new AuthResponse 
            { 
                Success = true, 
                Email = user.Email 
            });
        }
    }
    
    return Results.Unauthorized();
}).RequireAuthorization();

// Stripe Payment Intent endpoint
app.MapPost("/api/payments/create-payment-intent", async (
    CheckoutRequest request,
    HttpContext context,
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext dbContext) =>
{
    try
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }
        
        var user = await userManager.GetUserAsync(context.User);
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

// Webhook to handle successful payments
app.MapPost("/api/payments/webhook", async (
    HttpContext context,
    ApplicationDbContext dbContext,
    UserManager<ApplicationUser> userManager) =>
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
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext dbContext) =>
{
    if (context.User.Identity?.IsAuthenticated != true)
    {
        return Results.Unauthorized();
    }
    
    var user = await userManager.GetUserAsync(context.User);
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
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext dbContext) =>
{
    if (context.User.Identity?.IsAuthenticated != true)
    {
        return Results.Unauthorized();
    }
    
    var user = await userManager.GetUserAsync(context.User);
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

app.MapGet("/api/purchases/owns/{sealId}", async (
    string sealId,
    HttpContext context,
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext dbContext) =>
{
    if (context.User.Identity?.IsAuthenticated != true)
    {
        return Results.Ok(new { owns = false });
    }
    
    var user = await userManager.GetUserAsync(context.User);
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
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext dbContext) =>
{
    if (context.User.Identity?.IsAuthenticated != true)
    {
        return Results.Ok(new { ownedSealIds = new List<string>() });
    }
    
    var user = await userManager.GetUserAsync(context.User);
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

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}