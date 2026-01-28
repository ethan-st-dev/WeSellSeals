using Server.Models;
using System.Text.Json;

namespace Server.Data;

public static class SeedData
{
    public static void Initialize(ApplicationDbContext context)
    {
        // Only seed if database is empty
        if (context.Products.Any())
        {
            return;
        }

        var products = new List<Product>
        {
            new Product
            {
                Id = "seal-1",
                Title = "Harbor Seal Classic",
                Price = 9.99m,
                Image = "/seal-logo2.png",
                ShortDescription = "A compact, adorable harbor seal figure ideal for displays.",
                LongDescription = "This classic seal model is printed in high detail and is suitable for collectors and display use. Measures 3 inches long.",
                Category = "seals",
                Subcategory = "harbor",
                Tags = JsonSerializer.Serialize(new[] { "classic", "small", "beginner-friendly", "marine" }),
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = "seal-2",
                Title = "Playful Pup Seal",
                Price = 12.50m,
                Image = "https://picsum.photos/seed/playful-seal/800/600",
                ShortDescription = "Energetic pose, perfect for gifts and kids.",
                LongDescription = "Smooth, durable finish with playful pose; great as a present.",
                ModelUrl = "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
                Category = "seals",
                Subcategory = "harbor",
                Tags = JsonSerializer.Serialize(new[] { "playful", "gift", "kids", "marine" }),
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = "seal-3",
                Title = "Elephant Seal Jumbo",
                Price = 24.99m,
                Image = "https://picsum.photos/seed/elephant-seal/800/600",
                ShortDescription = "Large-scale model with intricate details for enthusiasts.",
                LongDescription = "This elephant seal statue showcases realistic textures and premium painting. Ideal for professional displays.",
                Category = "seals",
                Subcategory = "elephant",
                Tags = JsonSerializer.Serialize(new[] { "large", "premium", "detailed", "marine" }),
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = "seal-4",
                Title = "Baby Seal Figurine",
                Price = 7.99m,
                Image = "https://picsum.photos/seed/baby-seal/800/600",
                ShortDescription = "Adorable mini seal model, perfect for kids.",
                LongDescription = "A cute baby seal in white with soft details. Safe and durable for children ages 3+.",
                Category = "seals",
                Subcategory = "baby",
                Tags = JsonSerializer.Serialize(new[] { "cute", "small", "kids", "white", "marine" }),
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = "seal-5",
                Title = "Sea Lion Statue",
                Price = 18.75m,
                Image = "https://picsum.photos/seed/sea-lion/800/600",
                ShortDescription = "Elegant sea lion in a noble pose.",
                LongDescription = "Hand-painted sea lion statue with glossy finish. Great for home or office.",
                Category = "seals",
                Subcategory = "sea-lion",
                Tags = JsonSerializer.Serialize(new[] { "elegant", "medium", "hand-painted", "marine" }),
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = "robot-1",
                Title = "Futuristic Android",
                Price = 34.99m,
                Image = "https://picsum.photos/seed/android/800/600",
                ShortDescription = "A sleek android figure with LED eyes.",
                LongDescription = "High-tech android model featuring moveable joints and battery-powered LED eyes.",
                Category = "sci-fi",
                Subcategory = "robots",
                Tags = JsonSerializer.Serialize(new[] { "robot", "android", "futuristic", "LED" }),
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = "spaceship-1",
                Title = "Star Cruiser Model",
                Price = 49.99m,
                Image = "https://picsum.photos/seed/spaceship/800/600",
                ShortDescription = "Detailed replica of a classic space cruiser.",
                LongDescription = "Die-cast metal spaceship with opening cockpit and display stand included.",
                Category = "sci-fi",
                Subcategory = "vehicles",
                Tags = JsonSerializer.Serialize(new[] { "spaceship", "vehicle", "detailed", "metal" }),
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = "pirate-1",
                Title = "Pirate Captain Figure",
                Price = 16.99m,
                Image = "https://picsum.photos/seed/pirate-captain/800/600",
                ShortDescription = "Swashbuckling pirate captain with sword.",
                LongDescription = "Fully articulated pirate captain with removable accessories including sword, hat, and treasure chest.",
                Category = "pirates",
                Subcategory = "characters",
                Tags = JsonSerializer.Serialize(new[] { "pirate", "captain", "articulated", "accessories" }),
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = "dragon-1",
                Title = "Ancient Dragon",
                Price = 44.99m,
                Image = "https://picsum.photos/seed/dragon/800/600",
                ShortDescription = "Majestic dragon with spread wings.",
                LongDescription = "Hand-painted fantasy dragon with incredible detail. Wings span 12 inches.",
                Category = "fantasy",
                Subcategory = "creatures",
                Tags = JsonSerializer.Serialize(new[] { "dragon", "fantasy", "hand-painted", "large" }),
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = "car-1",
                Title = "Classic Sports Car",
                Price = 28.50m,
                Image = "https://picsum.photos/seed/sportscar/800/600",
                ShortDescription = "1:24 scale classic sports car model.",
                LongDescription = "Precision die-cast model of iconic 1960s sports car. Opening doors and hood.",
                Category = "vehicles",
                Subcategory = "cars",
                Tags = JsonSerializer.Serialize(new[] { "car", "classic", "die-cast", "1:24" }),
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Products.AddRange(products);
        context.SaveChanges();
    }
}
