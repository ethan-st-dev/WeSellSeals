using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Server.Services;

public interface IBlobStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
    Task<bool> DeleteFileAsync(string fileUrl);
    Task<Stream> DownloadFileAsync(string fileUrl);
    string GetFileUrl(string fileName);
}

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient? _blobServiceClient;
    private readonly string _containerName;
    private readonly bool _useLocalStorage;
    private readonly string _localStoragePath = string.Empty;
    private readonly ILogger<BlobStorageService> _logger;

    public BlobStorageService(IConfiguration configuration, ILogger<BlobStorageService> logger)
    {
        _logger = logger;
        var connectionString = configuration["AzureStorage:ConnectionString"];
        _containerName = configuration["AzureStorage:ContainerName"] ?? "product-assets";
        
        // Check if local storage is explicitly set
        _useLocalStorage = configuration.GetValue<bool>("AzureStorage:UseLocalStorage", true);
        _localStoragePath = configuration["AzureStorage:LocalStoragePath"] ?? "../Client/public/uploads";
        
        if (!_useLocalStorage && !string.IsNullOrEmpty(connectionString))
        {
            // For production or Azurite: use Azure Blob Storage
            try
            {
                _blobServiceClient = new BlobServiceClient(connectionString);
                var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                containerClient.CreateIfNotExists(PublicAccessType.Blob);
                _logger.LogInformation("Connected to blob storage: {ContainerName}", _containerName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect to blob storage, falling back to local storage");
                _useLocalStorage = true;
            }
        }
        
        if (_useLocalStorage)
        {
            // For development: use local file storage
            var fullPath = Path.GetFullPath(_localStoragePath);
            if (!Directory.Exists(fullPath))
            {
                Directory.CreateDirectory(fullPath);
                _logger.LogInformation("Created local storage directory: {Path}", fullPath);
            }
            _logger.LogInformation("Using local storage at: {Path}", fullPath);
        }
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        if (_useLocalStorage)
        {
            return await UploadToLocalStorageAsync(fileStream, fileName);
        }
        else
        {
            return await UploadToBlobStorageAsync(fileStream, fileName, contentType);
        }
    }

    private async Task<string> UploadToLocalStorageAsync(Stream fileStream, string fileName)
    {
        var fullPath = Path.GetFullPath(_localStoragePath);
        var filePath = Path.Combine(fullPath, fileName);
        
        using var fileStreamOutput = File.Create(filePath);
        await fileStream.CopyToAsync(fileStreamOutput);
        
        _logger.LogInformation("Uploaded file to local storage: {FileName}", fileName);
        return $"/uploads/{fileName}";
    }

    private async Task<string> UploadToBlobStorageAsync(Stream fileStream, string fileName, string contentType)
    {
        if (_blobServiceClient == null)
            throw new InvalidOperationException("Blob service client not initialized");

        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

        var blobClient = containerClient.GetBlobClient(fileName);
        
        var blobHttpHeaders = new BlobHttpHeaders
        {
            ContentType = contentType
        };

        await blobClient.UploadAsync(fileStream, new BlobUploadOptions 
        { 
            HttpHeaders = blobHttpHeaders 
        });

        _logger.LogInformation("Uploaded file to Azure Blob Storage: {FileName}", fileName);
        return blobClient.Uri.ToString();
    }

    public async Task<bool> DeleteFileAsync(string fileUrl)
    {
        if (_useLocalStorage)
        {
            return await DeleteFromLocalStorageAsync(fileUrl);
        }
        else
        {
            return await DeleteFromBlobStorageAsync(fileUrl);
        }
    }

    private Task<bool> DeleteFromLocalStorageAsync(string fileUrl)
    {
        try
        {
            var fileName = Path.GetFileName(fileUrl);
            var fullPath = Path.GetFullPath(_localStoragePath);
            var filePath = Path.Combine(fullPath, fileName);
            
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation("Deleted file from local storage: {FileName}", fileName);
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from local storage: {FileUrl}", fileUrl);
            return Task.FromResult(false);
        }
    }

    private async Task<bool> DeleteFromBlobStorageAsync(string fileUrl)
    {
        if (_blobServiceClient == null)
            return false;

        try
        {
            var uri = new Uri(fileUrl);
            var fileName = Path.GetFileName(uri.LocalPath);
            
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);
            
            var result = await blobClient.DeleteIfExistsAsync();
            _logger.LogInformation("Deleted file from Azure Blob Storage: {FileName}", fileName);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from Azure Blob Storage: {FileUrl}", fileUrl);
            return false;
        }
    }

    public async Task<Stream> DownloadFileAsync(string fileUrl)
    {
        if (_useLocalStorage)
        {
            return await DownloadFromLocalStorageAsync(fileUrl);
        }
        else
        {
            return await DownloadFromBlobStorageAsync(fileUrl);
        }
    }

    private Task<Stream> DownloadFromLocalStorageAsync(string fileUrl)
    {
        var fileName = Path.GetFileName(fileUrl);
        var fullPath = Path.GetFullPath(_localStoragePath);
        var filePath = Path.Combine(fullPath, fileName);
        
        if (!File.Exists(filePath))
            throw new FileNotFoundException($"File not found: {fileName}");
            
        return Task.FromResult<Stream>(File.OpenRead(filePath));
    }

    private async Task<Stream> DownloadFromBlobStorageAsync(string fileUrl)
    {
        if (_blobServiceClient == null)
            throw new InvalidOperationException("Blob service client not initialized");

        var uri = new Uri(fileUrl);
        var fileName = Path.GetFileName(uri.LocalPath);
        
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        var blobClient = containerClient.GetBlobClient(fileName);
        
        var response = await blobClient.DownloadAsync();
        return response.Value.Content;
    }

    public string GetFileUrl(string fileName)
    {
        if (_useLocalStorage)
        {
            return $"/uploads/{fileName}";
        }
        else
        {
            if (_blobServiceClient == null)
                throw new InvalidOperationException("Blob service client not initialized");
                
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);
            return blobClient.Uri.ToString();
        }
    }
}
