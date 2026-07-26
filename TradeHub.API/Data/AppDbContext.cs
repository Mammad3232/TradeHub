using Microsoft.EntityFrameworkCore;
using TradeHub.API.Models;

namespace TradeHub.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Subcategory> Subcategories => Set<Subcategory>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.FullName).IsRequired().HasMaxLength(150);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(250);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Role).HasConversion<string>();
        });

        // Brand Configuration
        modelBuilder.Entity<Brand>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.Property(b => b.Name).IsRequired().HasMaxLength(150);
            entity.Property(b => b.LogoUrl).HasMaxLength(500);
            entity.HasIndex(b => b.Name).IsUnique();
        });

        // Category Configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
        });

        // Subcategory Configuration
        modelBuilder.Entity<Subcategory>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Name).IsRequired().HasMaxLength(100);
            entity.Property(s => s.Slug).IsRequired().HasMaxLength(100);

            // Many subcategories belong to one category
            entity.HasOne(s => s.Category)
                  .WithMany(c => c.Subcategories)
                  .HasForeignKey(s => s.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Product Configuration
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(300);
            entity.Property(p => p.Description).HasMaxLength(2000);
            entity.Property(p => p.Price).HasColumnType("decimal(18,2)");
            entity.Property(p => p.ImageUrl).HasMaxLength(500);

            // Nullable — null / 0 means "no threshold configured"
            entity.Property(p => p.LowStockThreshold).IsRequired(false);

            // Many products belong to one category
            entity.HasOne(p => p.Category)
                  .WithMany(c => c.Products)
                  .HasForeignKey(p => p.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Many products optionally belong to one subcategory
            entity.HasOne(p => p.Subcategory)
                  .WithMany(s => s.Products)
                  .HasForeignKey(p => p.SubcategoryId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull);

            // Many products optionally belong to one brand
            entity.HasOne(p => p.Brand)
                  .WithMany(b => b.Products)
                  .HasForeignKey(p => p.BrandId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Order Configuration
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.Property(o => o.TotalPrice).HasColumnType("decimal(18,2)");
            entity.Property(o => o.Status).HasConversion<string>();

            entity.HasOne(o => o.User)
                  .WithMany(u => u.Orders)
                  .HasForeignKey(o => o.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // OrderItem Configuration
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(oi => oi.Id);
            entity.Property(oi => oi.UnitPrice).HasColumnType("decimal(18,2)");

            entity.HasOne(oi => oi.Order)
                  .WithMany(o => o.OrderItems)
                  .HasForeignKey(oi => oi.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(oi => oi.Product)
                  .WithMany(p => p.OrderItems)
                  .HasForeignKey(oi => oi.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Review Configuration
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Rating).IsRequired();
            entity.Property(r => r.Comment).HasMaxLength(1000);

            entity.HasOne(r => r.Product)
                  .WithMany(p => p.Reviews)
                  .HasForeignKey(r => r.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.User)
                  .WithMany(u => u.Reviews)
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Notification Configuration
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Message).IsRequired().HasMaxLength(500);
            entity.Property(n => n.Type)
                  .IsRequired()
                  .HasMaxLength(50)
                  .HasDefaultValue(NotificationType.NewOrder);

            // Notifications survive even if the related order is deleted (SetNull)
            entity.HasOne(n => n.RelatedOrder)
                  .WithMany()
                  .HasForeignKey(n => n.RelatedOrderId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull);

            // CRITICAL: Notifications survive even if the related product is deleted (SetNull)
            // Without this, deleting a product that has LowStock notifications would throw a
            // FK constraint violation.
            entity.HasOne(n => n.RelatedProduct)
                  .WithMany(p => p.Notifications)
                  .HasForeignKey(n => n.RelatedProductId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Seed Data
        SeedData.Seed(modelBuilder);
    }
}