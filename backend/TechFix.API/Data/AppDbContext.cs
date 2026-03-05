using Microsoft.EntityFrameworkCore;
using TechFix.API.Models;

namespace TechFix.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<RepairOrder> Repairs => Set<RepairOrder>();
    public DbSet<ShopSettings> ShopSettings => Set<ShopSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Unique email index
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // RepairOrder → Client (cascade delete)
        modelBuilder.Entity<RepairOrder>()
            .HasOne(r => r.Client)
            .WithMany(c => c.Repairs)
            .HasForeignKey(r => r.ClientId)
            .OnDelete(DeleteBehavior.Cascade);

        // OrderNumber is set in C# before insert; just ensure it's not null
        modelBuilder.Entity<RepairOrder>()
            .Property(r => r.OrderNumber)
            .IsRequired()
            .HasMaxLength(30);
    }
}
