using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Server.Services;

public class AzureBlobStorageService : IFileStorageService
{
    private readonly BlobContainerClient _containerClient;
    private readonly ILogger<AzureBlobStorageService> _logger;
    private readonly string _containerName;

    public AzureBlobStorageService(IConfiguration configuration, ILogger<AzureBlobStorageService> logger)
    {
        _logger = logger;
        var connectionString = configuration["FileStorage:AzureBlobConnectionString"]
            ?? throw new InvalidOperationException("Azure Blob Storage connection string is not configured");
        
        _containerName = configuration["FileStorage:ContainerName"] ?? "models";

        var blobServiceClient = new BlobServiceClient(connectionString);
        _containerClient = blobServiceClient.GetBlobContainerClient(_containerName);

        // Ensure container exists
        _containerClient.CreateIfNotExists(PublicAccessType.Blob);
        _logger.LogInformation("Azure Blob Storage initialized with container: {ContainerName}", _containerName);
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        try
        {
            // Generate unique filename to prevent conflicts
            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var blobClient = _containerClient.GetBlobClient(uniqueFileName);

            var blobHttpHeaders = new BlobHttpHeaders
            {
                ContentType = contentType
            };

            await blobClient.UploadAsync(fileStream, new BlobUploadOptions
            {
                HttpHeaders = blobHttpHeaders
            });

            _logger.LogInformation("File uploaded to Azure Blob Storage: {FileName}", uniqueFileName);
            return blobClient.Uri.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to Azure Blob Storage: {FileName}", fileName);
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(string fileUrl)
    {
        try
        {
            var fileName = Path.GetFileName(new Uri(fileUrl).LocalPath);
            var blobClient = _containerClient.GetBlobClient(fileName);

            var result = await blobClient.DeleteIfExistsAsync();
            
            if (result.Value)
            {
                _logger.LogInformation("File deleted from Azure Blob Storage: {FileName}", fileName);
            }

            return result.Value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from Azure Blob Storage: {FileUrl}", fileUrl);
            return false;
        }
    }

    public string GetFileUrl(string fileName)
    {
        var blobClient = _containerClient.GetBlobClient(fileName);
        return blobClient.Uri.ToString();
    }
}
