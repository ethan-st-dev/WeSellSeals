using Microsoft.EntityFrameworkCore;
using Server.Data;

namespace Server.Services;

/// <summary>
/// Background service that handles database initialization and syncing
/// </summary>
public class DatabaseInitializationService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseInitializationService> _logger;

    public DatabaseInitializationService(
        IServiceProvider serviceProvider,
        ILogger<DatabaseInitializationService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting database initialization...");

        using var scope = _serviceProvider.CreateScope();
        
        var syncService = scope.ServiceProvider.GetService<ISqliteBlobSyncService>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        try
        {
            // If using SQLite with blob sync, download the database first
            if (syncService != null)
            {
                var dbExists = await syncService.DatabaseExistsInBlobAsync();
                if (dbExists)
                {
                    _logger.LogInformation("Database exists in blob storage, downloading...");
                    await syncService.DownloadDatabaseAsync();
                }
                else
                {
                    _logger.LogInformation("No database in blob storage, will create new one");
                }
            }

            // Run migrations
            _logger.LogInformation("Running database migrations...");
            await dbContext.Database.MigrateAsync(cancellationToken);
            _logger.LogInformation("Database migrations completed");

            // Upload back to blob if using sync
            if (syncService != null)
            {
                _logger.LogInformation("Uploading database to blob storage...");
                await syncService.UploadDatabaseAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during database initialization");
            throw;
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Stopping database initialization service");
        return Task.CompletedTask;
    }
}
