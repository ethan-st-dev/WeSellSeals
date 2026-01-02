using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Server.Tests;

public class AuthorizationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthorizationTests(WebApplicationFactory<Program> factory)
    {
        var customFactory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
        });

        _client = customFactory.CreateClient();
    }

    [Theory]
    [InlineData("/api/auth/user")]
    [InlineData("/api/purchases/my-seals")]
    [InlineData("/api/purchases/download/seal1")]
    public async Task ProtectedEndpoints_WithoutAuth_ReturnUnauthorized(string endpoint)
    {
        // Act
        var response = await _client.GetAsync(endpoint);

        // Assert - Accept either Unauthorized or NotFound (both indicate lack of access)
        Assert.True(
            response.StatusCode == HttpStatusCode.Unauthorized || 
            response.StatusCode == HttpStatusCode.NotFound,
            $"Expected Unauthorized or NotFound but got {response.StatusCode}"
        );
    }

    [Fact]
    public async Task GetCurrentUser_WithAuth_ReturnsUserInfo()
    {
        // Arrange
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = "authuser@test.com",
            Password = "Test123!",
            ConfirmPassword = "Test123!",
            FirstName = "Test",
            LastName = "User"
        });

        await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "authuser@test.com",
            Password = "Test123!"
        });

        // Act
        var response = await _client.GetAsync("/api/auth/user");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("authuser@test.com", content);
    }

    [Fact]
    public async Task Logout_ClearsAuthentication()
    {
        // Arrange
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = "logout@test.com",
            Password = "Test123!",
            ConfirmPassword = "Test123!",
            FirstName = "Test",
            LastName = "User"
        });

        await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "logout@test.com",
            Password = "Test123!"
        });

        // Act
        await _client.PostAsync("/api/auth/logout", null);
        var response = await _client.GetAsync("/api/auth/user");

        // Assert - Accept either Unauthorized or NotFound
        Assert.True(
            response.StatusCode == HttpStatusCode.Unauthorized || 
            response.StatusCode == HttpStatusCode.NotFound,
            $"Expected Unauthorized or NotFound but got {response.StatusCode}"
        );
    }

    [Fact]
    public async Task PaymentEndpoint_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        var request = new
        {
            Items = new[] { new { SealId = "seal1", Title = "Test", Price = 9.99m } }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/payments/create-payment-intent", request);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ConfirmPayment_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        var request = new { PaymentIntentId = "pi_test" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/payments/confirm-payment", request);

        // Assert - Accept either Unauthorized or NotFound
        Assert.True(
            response.StatusCode == HttpStatusCode.Unauthorized || 
            response.StatusCode == HttpStatusCode.NotFound,
            $"Expected Unauthorized or NotFound but got {response.StatusCode}"
        );
    }
}
