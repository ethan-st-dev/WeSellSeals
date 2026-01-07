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

    // RegisterAndLoginUser helper removed - authentication now handled by Clerk

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

    // Tests requiring authentication removed - payment endpoints require Clerk JWT tokens
}
