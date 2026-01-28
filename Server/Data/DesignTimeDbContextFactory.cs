using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Server.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        
        // Check for connection string in environment variable (used by CI/CD)
        var connectionString = Environment.GetEnvironmentVariable("AZURE_SQL_CONNECTION_STRING");
        
        if (!string.IsNullOrEmpty(connectionString))
        {
            // Use SQL Server for Azure or CI/CD
            optionsBuilder.UseSqlServer(connectionString);
        }
        else
        {
            // Default to local SQL Server for development migrations
            optionsBuilder.UseSqlServer("Server=localhost,1433;Database=wesellseals_dev;User ID=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;");
        }
        
        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
