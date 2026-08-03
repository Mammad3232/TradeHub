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
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<ProductView> ProductViews => Set<ProductView>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<PriceAlert> PriceAlerts => Set<PriceAlert>();

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
            entity.Property(u => u.PhoneNumber).HasMaxLength(30).IsRequired(false);
            entity.Property(u => u.Location).HasMaxLength(200).IsRequired(false);
            entity.Property(u => u.AvatarUrl).HasMaxLength(500).IsRequired(false);
        });

        // Address Configuration
        modelBuilder.Entity<Address>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Label).IsRequired().HasMaxLength(100);
            entity.Property(a => a.FullName).IsRequired().HasMaxLength(150);
            entity.Property(a => a.Street).IsRequired().HasMaxLength(300);
            entity.Property(a => a.City).IsRequired().HasMaxLength(100);
            entity.Property(a => a.State).HasMaxLength(100);
            entity.Property(a => a.PostalCode).HasMaxLength(20);
            entity.Property(a => a.Country).IsRequired().HasMaxLength(100);
            entity.Property(a => a.Phone).HasMaxLength(30).IsRequired(false);

            entity.HasOne(a => a.User)
                  .WithMany(u => u.Addresses)
                  .HasForeignKey(a => a.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
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
            entity.Property(p => p.OldPrice).HasColumnType("decimal(18,2)").IsRequired(false);
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

            // Composite index for co-purchase recommendation query performance.
            // The query: "find all other products that share an OrderId with this ProductId"
            // hits this index directly — critical for scalability as orders grow.
            entity.HasIndex(oi => new { oi.ProductId, oi.OrderId })
                  .HasDatabaseName("IX_OrderItems_ProductId_OrderId");
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
            entity.HasOne(n => n.RelatedProduct)
                  .WithMany(p => p.Notifications)
                  .HasForeignKey(n => n.RelatedProductId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull);

            // PriceDrop notifications survive if the wishlist item is later removed (NoAction to prevent SQL Server multiple cascade paths)
            entity.HasOne(n => n.RelatedWishlistItem)
                  .WithMany()
                  .HasForeignKey(n => n.RelatedWishlistItemId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.NoAction);

            // Per-customer notifications: survive user deletion (NoAction to prevent SQL Server multiple cascade paths)
            entity.HasOne(n => n.User)
                  .WithMany()
                  .HasForeignKey(n => n.UserId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.NoAction);
        });

        // ProductView Configuration
        modelBuilder.Entity<ProductView>(entity =>
        {
            entity.HasKey(pv => pv.Id);

            entity.Property(pv => pv.SessionId)
                  .IsRequired()
                  .HasMaxLength(100);

            // Index on SessionId — drives GET /api/products/recently-viewed?sessionId=...
            entity.HasIndex(pv => pv.SessionId)
                  .HasDatabaseName("IX_ProductViews_SessionId");

            // Index on ProductId — could be used for view-count analytics
            entity.HasIndex(pv => pv.ProductId)
                  .HasDatabaseName("IX_ProductViews_ProductId");

            // FK: ProductView → Product (cascade delete — if product is removed, views go too)
            entity.HasOne(pv => pv.Product)
                  .WithMany()
                  .HasForeignKey(pv => pv.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);

            // FK: ProductView → User (set null — views survive if user account is deleted)
            entity.HasOne(pv => pv.User)
                  .WithMany()
                  .HasForeignKey(pv => pv.UserId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // WishlistItem Configuration
        modelBuilder.Entity<WishlistItem>(entity =>
        {
            entity.HasKey(wi => wi.Id);
            entity.Property(wi => wi.PriceWhenAdded).HasColumnType("decimal(18,2)");

            // CRITICAL: Cascade delete on ProductId.
            // If an admin hard-deletes a product, all wishlist rows referencing it
            // are automatically removed — no orphan data, no FK constraint violation.
            entity.HasOne(wi => wi.Product)
                  .WithMany(p => p.WishlistItems)
                  .HasForeignKey(wi => wi.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Cascade delete on UserId.
            // Deleting a user removes all their wishlist entries cleanly.
            entity.HasOne(wi => wi.User)
                  .WithMany(u => u.WishlistItems)
                  .HasForeignKey(wi => wi.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            // DB-level unique constraint: a user can only add a product once.
            // This backs up the application-level duplicate check with a safety net.
            entity.HasIndex(wi => new { wi.UserId, wi.ProductId })
                  .IsUnique()
                  .HasDatabaseName("IX_WishlistItems_UserId_ProductId");
        });

        // PriceAlert Configuration
        modelBuilder.Entity<PriceAlert>(entity =>
        {
            entity.HasKey(pa => pa.Id);
            entity.Property(pa => pa.PriceAtAlert).HasColumnType("decimal(18,2)");

            // Cascade delete: removing a wishlist item also removes all its price alert history.
            entity.HasOne(pa => pa.WishlistItem)
                  .WithMany(wi => wi.PriceAlerts)
                  .HasForeignKey(pa => pa.WishlistItemId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Index for the job's duplicate-check query: find the latest alert for a WishlistItemId
            entity.HasIndex(pa => pa.WishlistItemId)
                  .HasDatabaseName("IX_PriceAlerts_WishlistItemId");
        });

        // Seed Data
        SeedData.Seed(modelBuilder);
    }
}