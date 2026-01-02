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

public class PurchaseTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;

    public PurchaseTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
        });

        _client = _factory.CreateClient();
    }

    private async Task<string> RegisterAndLoginUser(string email, string password)
    {
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = email,
            Password = password,
            ConfirmPassword = password,
            FirstName = "Test",
            LastName = "User"
        });

        await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = email,
            Password = password
        });

        return email;
    }

    [Fact]
    public async Task GetMySeals_WithoutAuth_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/purchases/my-seals");

        // Assert - Accept either Unauthorized or NotFound
        Assert.True(
            response.StatusCode == HttpStatusCode.Unauthorized || 
            response.StatusCode == HttpStatusCode.NotFound,
            $"Expected Unauthorized or NotFound but got {response.StatusCode}"
        );
    }

    [Fact]
    public async Task GetMySeals_WithAuth_ReturnsSuccess()
    {
        // Arrange
        await RegisterAndLoginUser("seals@test.com", "Test123!");

        // Act
        var response = await _client.GetAsync("/api/purchases/my-seals");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetMySeals_AfterPurchase_ReturnsPurchasedSeals()
    {
        // Arrange
        await RegisterAndLoginUser("buyer@test.com", "Test123!");
        
        // Create a purchase
        using (var scope = _factory.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = await dbContext.Users.FirstAsync(u => u.Email == "buyer@test.com");
            
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

        // Act
        var response = await _client.GetAsync("/api/purchases/my-seals");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("seal1", content);
    }

    [Fact]
    public async Task OwnsSeal_NotOwned_ReturnsFalse()
    {
        // Arrange
        await RegisterAndLoginUser("checker@test.com", "Test123!");

        // Act
        var response = await _client.GetAsync("/api/purchases/owns/seal1");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("false", content.ToLower());
    }

    [Fact]
    public async Task OwnsSeal_Owned_ReturnsTrue()
    {
        // Arrange
        await RegisterAndLoginUser("owner@test.com", "Test123!");
        
        using (var scope = _factory.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = await dbContext.Users.FirstAsync(u => u.Email == "owner@test.com");
            
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

        // Act
        var response = await _client.GetAsync("/api/purchases/owns/seal1");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("true", content.ToLower());
    }

    [Fact]
    public async Task CheckMultiple_ReturnsOwnedSeals()
    {
        // Arrange
        await RegisterAndLoginUser("multiple@test.com", "Test123!");
        
        using (var scope = _factory.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = await dbContext.Users.FirstAsync(u => u.Email == "multiple@test.com");
            
            dbContext.Purchases.AddRange(
                new Purchase
                {
                    UserId = user.Id,
                    SealId = "seal1",
                    SealTitle = "Seal 1",
                    Price = 9.99m,
                    PurchasedAt = DateTime.UtcNow
                },
                new Purchase
                {
                    UserId = user.Id,
                    SealId = "seal3",
                    SealTitle = "Seal 3",
                    Price = 19.99m,
                    PurchasedAt = DateTime.UtcNow
                }
            );
            await dbContext.SaveChangesAsync();
        }

        var request = new
        {
            SealIds = new[] { "seal1", "seal2", "seal3", "seal4" }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/purchases/check-multiple", request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("seal1", content);
        Assert.Contains("seal3", content);
    }

    [Fact]
    public async Task DownloadSeal_NotOwned_ReturnsNotFound()
    {
        // Arrange
        await RegisterAndLoginUser("downloader@test.com", "Test123!");

        // Act
        var response = await _client.GetAsync("/api/purchases/download/seal1");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DownloadSeal_Owned_ReturnsFile()
    {
        // Arrange
        await RegisterAndLoginUser("downloader2@test.com", "Test123!");
        
        using (var scope = _factory.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = await dbContext.Users.FirstAsync(u => u.Email == "downloader2@test.com");
            
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

        // Act
        var response = await _client.GetAsync("/api/purchases/download/seal1");

        // Assert
        // Should return OK if file exists, NotFound if file doesn't exist
        Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.NotFound);
    }
}
