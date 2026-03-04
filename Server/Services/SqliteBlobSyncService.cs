using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Server.Services;

/// <summary>
/// Service to sync SQLite database with Azure Blob Storage for persistence
/// </summary>
public interface ISqliteBlobSyncService
{
    Task DownloadDatabaseAsync();
    Task UploadDatabaseAsync();
    Task<bool> DatabaseExistsInBlobAsync();
}

public class SqliteBlobSyncService : ISqliteBlobSyncService
{
    private readonly string _localDbPath;
    private readonly BlobServiceClient? _blobServiceClient;
    private readonly string _containerName = "database";
    private readonly string _blobName = "app.db";
    private readonly ILogger<SqliteBlobSyncService> _logger;

    public SqliteBlobSyncService(
        IConfiguration configuration,
        ILogger<SqliteBlobSyncService> logger)
    {
        _logger = logger;
        _localDbPath = "/home/site/wwwroot/app.db";
        
        var connectionString = configuration["FileStorage:AzureBlobConnectionString"];
        
        if (!string.IsNullOrEmpty(connectionString) && 
            !connectionString.Contains("devstoreaccount1")) // Skip if using Azurite emulator
        {
            try
            {
                _blobServiceClient = new BlobServiceClient(connectionString);
                _logger.LogInformation("SQLite blob sync service initialized");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to initialize blob sync service. Database will not be persisted.");
            }
        }
        else
        {
            _logger.LogInformation("Blob sync disabled (no connection string or using local emulator)");
        }
    }

    public async Task<bool> DatabaseExistsInBlobAsync()
    {
        if (_blobServiceClient == null) return false;

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            
            // Create container if it doesn't exist
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
            
            var blobClient = containerClient.GetBlobClient(_blobName);
            return await blobClient.ExistsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if database exists in blob storage");
            return false;
        }
    }

    public async Task DownloadDatabaseAsync()
    {
        if (_blobServiceClient == null)
        {
            _logger.LogInformation("Blob sync disabled, skipping download");
            return;
        }

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(_blobName);

            if (!await blobClient.ExistsAsync())
            {
                _logger.LogInformation("Database doesn't exist in blob storage yet");
                return;
            }

            _logger.LogInformation("Downloading database from blob storage...");
            
            // Download to temp file first
            var tempPath = _localDbPath + ".tmp";
            await blobClient.DownloadToAsync(tempPath);
            
            // Move temp file to actual location
            if (File.Exists(_localDbPath))
            {
                File.Delete(_localDbPath);
            }
            File.Move(tempPath, _localDbPath);
            
            _logger.LogInformation("Database downloaded successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading database from blob storage");
            throw;
        }
    }

    public async Task UploadDatabaseAsync()
    {
        if (_blobServiceClient == null)
        {
            _logger.LogInformation("Blob sync disabled, skipping upload");
            return;
        }

        if (!File.Exists(_localDbPath))
        {
            _logger.LogWarning("Local database file doesn't exist, skipping upload");
            return;
        }

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            
            // Create container if it doesn't exist
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
            
            var blobClient = containerClient.GetBlobClient(_blobName);

            _logger.LogInformation("Uploading database to blob storage...");
            
            await blobClient.UploadAsync(_localDbPath, overwrite: true);
            
            _logger.LogInformation("Database uploaded successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading database to blob storage");
            // Don't throw - we don't want to fail the app if backup fails
        }
    }
}
