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
            optionsBuilder.UseSqlServer(connectionString);
        }
        else if (args.Length > 0)
        {
            // Fallback: connection string passed via command line args
            optionsBuilder.UseSqlServer(args[0]);
        }
        else
        {
            // Default to SQLite for local development migrations
            optionsBuilder.UseSqlite("Data Source=wesellseals.db");
        }
        
        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
