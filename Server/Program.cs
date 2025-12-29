using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

var builder = WebApplication.CreateBuilder(args);

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