using Server.Data;
using Server.Models;
using System.Text.Json;

namespace Server.Services;

public class DatabaseSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly IBlobStorageService _blobStorage;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(
        ApplicationDbContext context,
        IBlobStorageService blobStorage,
        ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _blobStorage = blobStorage;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        if (_context.Products.Any())
        {
            _logger.LogInformation("Database already seeded");
            return;
        }

        _logger.LogInformation("Starting database seeding from sample data...");

        try
        {
            // Read products configuration
            var sampleDataPath = Path.Combine(Directory.GetCurrentDirectory(), "SampleData");
            var productsJsonPath = Path.Combine(sampleDataPath, "products.json");
            
            if (!File.Exists(productsJsonPath))
            {
                _logger.LogError("Sample data file not found: {Path}", productsJsonPath);
                return;
            }

            var json = await File.ReadAllTextAsync(productsJsonPath);
            var data = JsonSerializer.Deserialize<SampleDataRoot>(json, new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            });

            if (data?.Products == null || !data.Products.Any())
            {
                _logger.LogWarning("No products found in sample data");
                return;
            }

            var products = new List<Product>();

            foreach (var item in data.Products)
            {
                // Upload model file if specified
                string? modelUrl = null;
                if (!string.IsNullOrEmpty(item.ModelFile))
                {
                    var modelPath = Path.Combine(sampleDataPath, item.ModelFile);
                    if (File.Exists(modelPath))
                    {
                        modelUrl = await UploadFileAsync(modelPath, "model/gltf-binary");
                        _logger.LogInformation("Uploaded model: {FileName} -> {Url}", item.ModelFile, modelUrl);
                    }
                    else
                    {
                        _logger.LogWarning("Model file not found: {Path}", modelPath);
                    }
                }

                // Upload image file if specified
                string? imageUrl = null;
                if (!string.IsNullOrEmpty(item.ImageFile))
                {
                    var imagePath = Path.Combine(sampleDataPath, item.ImageFile);
                    if (File.Exists(imagePath))
                    {
                        var contentType = GetContentType(imagePath);
                        imageUrl = await UploadFileAsync(imagePath, contentType);
                        _logger.LogInformation("Uploaded image: {FileName} -> {Url}", item.ImageFile, imageUrl);
                    }
                    else
                    {
                        _logger.LogWarning("Image file not found: {Path}", imagePath);
                    }
                }

                var product = new Product
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = item.Title,
                    Price = item.Price,
                    Image = imageUrl ?? "https://picsum.photos/800/600",
                    ShortDescription = item.ShortDescription,
                    LongDescription = item.LongDescription,
                    ModelUrl = modelUrl,
                    Category = item.Category,
                    Subcategory = item.Subcategory,
                    Tags = item.Tags,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                products.Add(product);
            }

            _context.Products.AddRange(products);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Successfully seeded {Count} products from sample data", products.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding database from sample data");
        }
    }

    private async Task<string> UploadFileAsync(string filePath, string contentType)
    {
        var fileName = Path.GetFileName(filePath);
        using var fileStream = File.OpenRead(filePath);
        return await _blobStorage.UploadFileAsync(fileStream, fileName, contentType);
    }

    private static string GetContentType(string filePath)
    {
        var extension = Path.GetExtension(filePath).ToLowerInvariant();
        return extension switch
        {
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".glb" => "model/gltf-binary",
            _ => "application/octet-stream"
        };
    }
}

// Data models for JSON deserialization
public class SampleDataRoot
{
    public List<SampleProduct> Products { get; set; } = new();
}

public class SampleProduct
{
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ShortDescription { get; set; } = string.Empty;
    public string? LongDescription { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Subcategory { get; set; }
    public string Tags { get; set; } = string.Empty;
    public string? ModelFile { get; set; }
    public string? ImageFile { get; set; }
}
