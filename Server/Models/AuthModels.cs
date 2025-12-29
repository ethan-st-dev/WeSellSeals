namespace Server.Models;

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Email { get; set; }
}

public class CheckoutRequest
{
    public List<CheckoutItem> Items { get; set; } = new();
}

public class CheckoutItem
{
    public required string SealId { get; set; }
    public required string Title { get; set; }
    public decimal Price { get; set; }
}

public class CheckMultipleRequest
{
    public List<string> SealIds { get; set; } = new();
}

public class ConfirmPaymentRequest
{
    public required string PaymentIntentId { get; set; }
}
