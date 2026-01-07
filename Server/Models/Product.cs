using System.ComponentModel.DataAnnotations;

namespace Server.Models;

public class Product
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, 999999.99)]
    public decimal Price { get; set; }
    
    [Required]
    [MaxLength(500)]
    public string Image { get; set; } = string.Empty; // URL to Azure Blob or local image
    
    [Required]
    [MaxLength(500)]
    public string ShortDescription { get; set; } = string.Empty;
    
    [MaxLength(2000)]
    public string? LongDescription { get; set; }
    
    [MaxLength(500)]
    public string? ModelUrl { get; set; } // URL to GLB file in Azure Blob or local
    
    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string? Subcategory { get; set; }
    
    [Required]
    public string Tags { get; set; } = string.Empty; // JSON array stored as string
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
