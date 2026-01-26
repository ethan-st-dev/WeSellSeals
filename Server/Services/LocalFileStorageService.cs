namespace Server.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadPath;
    private readonly string _baseUrl;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(IConfiguration configuration, ILogger<LocalFileStorageService> logger)
    {
        _uploadPath = configuration["FileStorage:LocalPath"] ?? "uploads";
        _baseUrl = configuration["FileStorage:BaseUrl"] ?? "http://localhost:5000";
        _logger = logger;

        // Ensure upload directory exists
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
            _logger.LogInformation("Created upload directory: {Path}", _uploadPath);
        }
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        try
        {
            // Generate unique filename to prevent conflicts
            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var filePath = Path.Combine(_uploadPath, uniqueFileName);

            using (var fileStreamOutput = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(fileStreamOutput);
            }

            _logger.LogInformation("File uploaded successfully: {FileName}", uniqueFileName);
            return GetFileUrl(uniqueFileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file: {FileName}", fileName);
            throw;
        }
    }

    public Task<bool> DeleteFileAsync(string fileUrl)
    {
        try
        {
            var fileName = Path.GetFileName(fileUrl);
            var filePath = Path.Combine(_uploadPath, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation("File deleted successfully: {FileName}", fileName);
                return Task.FromResult(true);
            }

            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file: {FileUrl}", fileUrl);
            return Task.FromResult(false);
        }
    }

    public string GetFileUrl(string fileName)
    {
        return $"{_baseUrl}/uploads/{fileName}";
    }
}
