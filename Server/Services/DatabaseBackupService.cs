namespace Server.Services;

/// <summary>
/// Background service that periodically backs up SQLite database to Azure Blob Storage
/// </summary>
public class DatabaseBackupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseBackupService> _logger;
    private readonly TimeSpan _backupInterval;
    private readonly bool _enabled;

    public DatabaseBackupService(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        ILogger<DatabaseBackupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        
        _enabled = configuration.GetValue<bool>("DatabaseBackup:Enabled", false);
        var intervalMinutes = configuration.GetValue<int>("DatabaseBackup:IntervalMinutes", 15);
        _backupInterval = TimeSpan.FromMinutes(intervalMinutes);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_enabled)
        {
            _logger.LogInformation("Database backup service is disabled");
            return;
        }

        _logger.LogInformation("Database backup service started. Backup interval: {Interval}", _backupInterval);

        // Wait a bit before first backup to let app initialize
        await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var syncService = scope.ServiceProvider.GetService<ISqliteBlobSyncService>();
                
                if (syncService != null)
                {
                    _logger.LogInformation("Starting scheduled database backup...");
                    await syncService.UploadDatabaseAsync();
                    _logger.LogInformation("Scheduled backup completed successfully");
                }
                else
                {
                    _logger.LogWarning("SQLite sync service not available");
                }

                await Task.Delay(_backupInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when stopping
                _logger.LogInformation("Database backup service is stopping");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during scheduled database backup. Will retry in {Interval}", _backupInterval);
                
                // Wait before retry even on error
                try
                {
                    await Task.Delay(_backupInterval, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    // Expected when stopping
                }
            }
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Database backup service stopping - performing final backup...");
        
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var syncService = scope.ServiceProvider.GetService<ISqliteBlobSyncService>();
            
            if (syncService != null)
            {
                await syncService.UploadDatabaseAsync();
                _logger.LogInformation("Final backup completed");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during final backup");
        }

        await base.StopAsync(cancellationToken);
    }
}
