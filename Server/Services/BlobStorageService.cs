using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Server.Services;

public interface IBlobStorageService
{
    Task<Stream?> DownloadModelAsync(string sealId);
    Task<Stream?> DownloadImageAsync(string sealId);
    Task<string> UploadModelAsync(string sealId, Stream fileStream, string contentType);
    Task<string> UploadImageAsync(string sealId, Stream fileStream, string contentType);
    Task DeleteModelAsync(string sealId);
    Task DeleteImageAsync(string sealId);
}

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _modelsContainerName = "seal-models";
    private readonly string _imagesContainerName = "seal-images";

    public BlobStorageService(IConfiguration configuration)
    {
        var connectionString = Environment.GetEnvironmentVariable("AzureStorage__ConnectionString")
            ?? configuration["AzureStorage:ConnectionString"];
        
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("Azure Storage connection string is not configured");
        }

        _blobServiceClient = new BlobServiceClient(connectionString);
    }

    private async Task<BlobContainerClient> GetContainerClientAsync(string containerName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
        return containerClient;
    }

    public async Task<Stream?> DownloadModelAsync(string sealId)
    {
        try
        {
            var containerClient = await GetContainerClientAsync(_modelsContainerName);
            var blobClient = containerClient.GetBlobClient($"{sealId}.glb");

            if (!await blobClient.ExistsAsync())
            {
                return null;
            }

            var response = await blobClient.DownloadAsync();
            return response.Value.Content;
        }
        catch
        {
            return null;
        }
    }

    public async Task<Stream?> DownloadImageAsync(string sealId)
    {
        try
        {
            var containerClient = await GetContainerClientAsync(_imagesContainerName);
            
            // Try different image extensions
            var extensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            foreach (var ext in extensions)
            {
                var blobClient = containerClient.GetBlobClient($"{sealId}{ext}");
                if (await blobClient.ExistsAsync())
                {
                    var response = await blobClient.DownloadAsync();
                    return response.Value.Content;
                }
            }

            return null;
        }
        catch
        {
            return null;
        }
    }

    public async Task<string> UploadModelAsync(string sealId, Stream fileStream, string contentType)
    {
        var containerClient = await GetContainerClientAsync(_modelsContainerName);
        var blobClient = containerClient.GetBlobClient($"{sealId}.glb");

        var blobHttpHeaders = new BlobHttpHeaders
        {
            ContentType = contentType
        };

        await blobClient.UploadAsync(fileStream, new BlobUploadOptions
        {
            HttpHeaders = blobHttpHeaders
        });

        return blobClient.Uri.ToString();
    }

    public async Task<string> UploadImageAsync(string sealId, Stream fileStream, string contentType)
    {
        var containerClient = await GetContainerClientAsync(_imagesContainerName);
        
        // Determine file extension from content type
        var extension = contentType switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => ".jpg"
        };

        var blobClient = containerClient.GetBlobClient($"{sealId}{extension}");

        var blobHttpHeaders = new BlobHttpHeaders
        {
            ContentType = contentType
        };

        await blobClient.UploadAsync(fileStream, new BlobUploadOptions
        {
            HttpHeaders = blobHttpHeaders
        });

        return blobClient.Uri.ToString();
    }

    public async Task DeleteModelAsync(string sealId)
    {
        var containerClient = await GetContainerClientAsync(_modelsContainerName);
        var blobClient = containerClient.GetBlobClient($"{sealId}.glb");
        await blobClient.DeleteIfExistsAsync();
    }

    public async Task DeleteImageAsync(string sealId)
    {
        var containerClient = await GetContainerClientAsync(_imagesContainerName);
        
        // Try to delete all possible image extensions
        var extensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        foreach (var ext in extensions)
        {
            var blobClient = containerClient.GetBlobClient($"{sealId}{ext}");
            await blobClient.DeleteIfExistsAsync();
        }
    }
}
