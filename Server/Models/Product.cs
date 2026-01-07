namespace Server.Models;

public class Product
{
    public string Id { get; set; } = string.Empty;
    public required string Title { get; set; }
    public decimal Price { get; set; }
    public required string ShortDescription { get; set; }
    public string? LongDescription { get; set; }
    public required string Category { get; set; }
    public string? Subcategory { get; set; }
    public string Tags { get; set; } = string.Empty; // Stored as comma-separated values
    public string? ImageUrl { get; set; }
    public string? ModelUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class CreateProductRequest
{
    public required string Id { get; set; }
    public required string Title { get; set; }
    public decimal Price { get; set; }
    public required string ShortDescription { get; set; }
    public string? LongDescription { get; set; }
    public required string Category { get; set; }
    public string? Subcategory { get; set; }
    public List<string> Tags { get; set; } = new();
}

public class UpdateProductRequest
{
    public required string Title { get; set; }
    public decimal Price { get; set; }
    public required string ShortDescription { get; set; }
    public string? LongDescription { get; set; }
    public required string Category { get; set; }
    public string? Subcategory { get; set; }
    public List<string> Tags { get; set; } = new();
}
