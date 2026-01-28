using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    
    public DbSet<Purchase> Purchases { get; set; }
    public DbSet<Models.Product> Products { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<Purchase>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId);
            
        modelBuilder.Entity<Purchase>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);
            
        modelBuilder.Entity<Models.Product>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);
    }
}
