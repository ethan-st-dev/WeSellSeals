using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data;

public static class SeedData
{
    public static async Task SeedProducts(ApplicationDbContext context)
    {
        // Only seed if database is empty
        if (await context.Products.AnyAsync())
        {
            return;
        }

        var products = new List<Server.Models.Product>
        {
            // Seals
            new() {
                Id = "seal-1",
                Title = "Harbor Seal Classic",
                Price = 9.99m,
                ImageUrl = "/seal-logo2.png",
                ShortDescription = "A compact, adorable harbor seal figure ideal for displays.",
                LongDescription = "This classic seal model is printed in high detail and is suitable for collectors and display use. Measures 3 inches long.",
                Category = "seals",
                Subcategory = "harbor",
                Tags = "classic,small,beginner-friendly,marine"
            },
            new() {
                Id = "seal-2",
                Title = "Playful Pup Seal",
                Price = 12.5m,
                ImageUrl = "https://picsum.photos/seed/playful-seal/800/600",
                ShortDescription = "Energetic pose, perfect for gifts and kids.",
                LongDescription = "Smooth, durable finish with playful pose; great as a present.",
                ModelUrl = "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
                Category = "seals",
                Subcategory = "harbor",
                Tags = "playful,gift,kids,marine"
            },
            new() {
                Id = "seal-3",
                Title = "Elephant Seal Giant",
                Price = 32.99m,
                ImageUrl = "https://picsum.photos/seed/n-elephant/800/600",
                ShortDescription = "Massive male with distinctive trunk-like proboscis.",
                Category = "seals",
                Subcategory = "elephant",
                Tags = "large,proboscis,marine,collector"
            },
            new() {
                Id = "seal-4",
                Title = "Leopard Seal Hunter",
                Price = 29.99m,
                ImageUrl = "https://picsum.photos/seed/leopard-seal/800/600",
                ShortDescription = "Fierce predator with spotted coat pattern.",
                Category = "seals",
                Subcategory = "leopard",
                Tags = "antarctic,predator,spotted,marine"
            },

            // Sci-Fi Models
            new() {
                Id = "scifi-1",
                Title = "Starfighter X-Wing",
                Price = 24.99m,
                ImageUrl = "https://picsum.photos/seed/xwing/800/600",
                ShortDescription = "Classic space superiority fighter with iconic design.",
                LongDescription = "Detailed model of the legendary starfighter, perfect for sci-fi collections.",
                Category = "sci-fi",
                Subcategory = "spacecraft",
                Tags = "spaceship,fighter,detailed,iconic"
            },
            new() {
                Id = "scifi-2",
                Title = "Cyberpunk Drone",
                Price = 18.99m,
                ImageUrl = "https://picsum.photos/seed/cyberdrone/800/600",
                ShortDescription = "Futuristic surveillance drone with neon accents.",
                Category = "sci-fi",
                Subcategory = "drones",
                Tags = "cyberpunk,futuristic,neon,tech"
            },
            new() {
                Id = "scifi-3",
                Title = "Space Marine Warrior",
                Price = 21.99m,
                ImageUrl = "https://picsum.photos/seed/spacemarine/800/600",
                ShortDescription = "Armored soldier in powered exosuit.",
                Category = "sci-fi",
                Subcategory = "characters",
                Tags = "warrior,armor,soldier,heroic"
            },
            new() {
                Id = "scifi-4",
                Title = "Alien Creature",
                Price = 19.99m,
                ImageUrl = "https://picsum.photos/seed/alien-creature/800/600",
                ShortDescription = "Mysterious extraterrestrial life form.",
                Category = "sci-fi",
                Subcategory = "creatures",
                Tags = "alien,creature,mysterious,unique"
            },
            new() {
                Id = "scifi-5",
                Title = "Robot Companion",
                Price = 16.99m,
                ImageUrl = "https://picsum.photos/seed/robot-friend/800/600",
                ShortDescription = "Friendly service robot with expressive design.",
                ModelUrl = "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
                Category = "sci-fi",
                Subcategory = "robots",
                Tags = "robot,friendly,companion,cute"
            },
            new() {
                Id = "scifi-6",
                Title = "Spaceship Command Bridge",
                Price = 39.99m,
                ImageUrl = "https://picsum.photos/seed/bridge/800/600",
                ShortDescription = "Detailed starship command center diorama.",
                Category = "sci-fi",
                Subcategory = "environments",
                Tags = "spaceship,interior,diorama,detailed"
            },

            // Pirates
            new() {
                Id = "pirate-1",
                Title = "Pirate Captain",
                Price = 17.99m,
                ImageUrl = "https://picsum.photos/seed/pirate-captain/800/600",
                ShortDescription = "Swashbuckling captain with tricorn hat and cutlass.",
                Category = "pirates",
                Subcategory = "characters",
                Tags = "captain,character,detailed,historical"
            },
            new() {
                Id = "pirate-2",
                Title = "Galleon Ship Model",
                Price = 49.99m,
                ImageUrl = "https://picsum.photos/seed/galleon/800/600",
                ShortDescription = "Majestic pirate ship with full rigging.",
                LongDescription = "Highly detailed sailing ship model with intricate rigging and cannons.",
                Category = "pirates",
                Subcategory = "ships",
                Tags = "ship,galleon,detailed,large"
            },
            new() {
                Id = "pirate-3",
                Title = "Treasure Chest",
                Price = 12.99m,
                ImageUrl = "https://picsum.photos/seed/treasure/800/600",
                ShortDescription = "Overflowing chest filled with gold and jewels.",
                Category = "pirates",
                Subcategory = "props",
                Tags = "treasure,gold,prop,diorama"
            },

            // Fantasy
            new() {
                Id = "fantasy-1",
                Title = "Dragon Wyrmling",
                Price = 26.99m,
                ImageUrl = "https://picsum.photos/seed/baby-dragon/800/600",
                ShortDescription = "Young dragon with detailed scales and wings.",
                Category = "fantasy",
                Subcategory = "creatures",
                Tags = "dragon,creature,detailed,mythical"
            },
            new() {
                Id = "fantasy-2",
                Title = "Elven Archer",
                Price = 19.99m,
                ImageUrl = "https://picsum.photos/seed/elf-archer/800/600",
                ShortDescription = "Graceful elf warrior with bow and arrow.",
                Category = "fantasy",
                Subcategory = "characters",
                Tags = "elf,archer,warrior,character"
            },
            new() {
                Id = "fantasy-3",
                Title = "Wizard Tower",
                Price = 35.99m,
                ImageUrl = "https://picsum.photos/seed/wizard-tower/800/600",
                ShortDescription = "Mystical tower with glowing windows.",
                Category = "fantasy",
                Subcategory = "buildings",
                Tags = "tower,building,magical,detailed"
            },

            // Vehicles
            new() {
                Id = "vehicle-1",
                Title = "Classic Muscle Car",
                Price = 28.99m,
                ImageUrl = "https://picsum.photos/seed/muscle-car/800/600",
                ShortDescription = "1970s American muscle car with racing stripes.",
                Category = "vehicles",
                Subcategory = "cars",
                Tags = "car,classic,muscle,vintage"
            },
            new() {
                Id = "vehicle-2",
                Title = "Military Tank",
                Price = 32.99m,
                ImageUrl = "https://picsum.photos/seed/tank/800/600",
                ShortDescription = "Modern battle tank with detailed treads.",
                Category = "vehicles",
                Subcategory = "military",
                Tags = "tank,military,armored,detailed"
            },

            // Architecture
            new() {
                Id = "arch-1",
                Title = "Gothic Cathedral",
                Price = 45.99m,
                ImageUrl = "https://picsum.photos/seed/cathedral/800/600",
                ShortDescription = "Ornate medieval cathedral with spires.",
                Category = "architecture",
                Subcategory = "historical",
                Tags = "cathedral,gothic,detailed,large"
            },
            new() {
                Id = "arch-2",
                Title = "Modern Skyscraper",
                Price = 38.99m,
                ImageUrl = "https://picsum.photos/seed/skyscraper/800/600",
                ShortDescription = "Contemporary glass and steel tower.",
                Category = "architecture",
                Subcategory = "modern",
                Tags = "skyscraper,modern,building,urban"
            },

            // Animals
            new() {
                Id = "animal-1",
                Title = "Lion Pride Leader",
                Price = 23.99m,
                ImageUrl = "https://picsum.photos/seed/lion/800/600",
                ShortDescription = "Majestic lion with flowing mane.",
                Category = "animals",
                Subcategory = "wildlife",
                Tags = "lion,wildlife,majestic,africa"
            },
            new() {
                Id = "animal-2",
                Title = "Eagle Soaring",
                Price = 19.99m,
                ImageUrl = "https://picsum.photos/seed/eagle/800/600",
                ShortDescription = "Eagle in flight with spread wings.",
                Category = "animals",
                Subcategory = "birds",
                Tags = "eagle,bird,flight,majestic"
            },

            // Characters
            new() {
                Id = "char-1",
                Title = "Superhero Action Figure",
                Price = 24.99m,
                ImageUrl = "https://picsum.photos/seed/superhero/800/600",
                ShortDescription = "Dynamic superhero in heroic pose.",
                Category = "characters",
                Subcategory = "heroes",
                Tags = "superhero,action,heroic,detailed"
            }
        };

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();
    }
}
