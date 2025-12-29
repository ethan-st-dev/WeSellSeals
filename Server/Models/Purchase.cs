namespace Server.Models;

public class Purchase
{
    public int Id { get; set; }
    public required string UserId { get; set; }
    public required string SealId { get; set; }
    public required string SealTitle { get; set; }
    public decimal Price { get; set; }
    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public ApplicationUser? User { get; set; }
}
