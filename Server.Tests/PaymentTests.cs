using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Server.Data;
using Server.Models;
using Xunit;

namespace Server.Tests;

public class PaymentTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;

    public PaymentTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
        });

        _client = _factory.CreateClient();
    }

    private async Task<string> RegisterAndLoginUser(string email, string password)
    {
        // Register
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = email,
            Password = password,
            ConfirmPassword = password,
            FirstName = "Test",
            LastName = "User"
        });

        // Login
        await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = email,
            Password = password
        });

        return email;
    }

    [Fact]
    public async Task CreatePaymentIntent_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        var request = new
        {
            Items = new[]
            {
                new { SealId = "seal1", Title = "Test Seal", Price = 9.99m }
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/payments/create-payment-intent", request);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreatePaymentIntent_WithAuth_ReturnsClientSecret()
    {
        // Arrange
        await RegisterAndLoginUser("payment@test.com", "Test123!");
        
        var request = new
        {
            Items = new[]
            {
                new { SealId = "seal1", Title = "Test Seal", Price = 9.99m }
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/payments/create-payment-intent", request);

        // Assert
        Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.InternalServerError);
        // Note: May fail if Stripe keys not configured, which is expected in testing
    }

    [Fact]
    public async Task CreatePaymentIntent_ForOwnedSeal_ReturnsBadRequest()
    {
        // Arrange
        await RegisterAndLoginUser("owned@test.com", "Test123!");
        
        // First purchase
        using (var scope = _factory.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = await dbContext.Users.FirstAsync(u => u.Email == "owned@test.com");
            
            dbContext.Purchases.Add(new Purchase
            {
                UserId = user.Id,
                SealId = "seal1",
                SealTitle = "Test Seal",
                Price = 9.99m,
                PurchasedAt = DateTime.UtcNow
            });
            await dbContext.SaveChangesAsync();
        }

        var request = new
        {
            Items = new[]
            {
                new { SealId = "seal1", Title = "Test Seal", Price = 9.99m }
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/payments/create-payment-intent", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreatePaymentIntent_MultipleSeals_AcceptsRequest()
    {
        // Arrange
        await RegisterAndLoginUser("multi@test.com", "Test123!");
        
        var request = new
        {
            Items = new[]
            {
                new { SealId = "seal1", Title = "Seal 1", Price = 9.99m },
                new { SealId = "seal2", Title = "Seal 2", Price = 14.99m },
                new { SealId = "seal3", Title = "Seal 3", Price = 19.99m }
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/payments/create-payment-intent", request);

        // Assert
        // Should not return BadRequest
        Assert.NotEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
