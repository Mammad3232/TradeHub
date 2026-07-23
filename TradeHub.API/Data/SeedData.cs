using Microsoft.EntityFrameworkCore;
using TradeHub.API.Models;

namespace TradeHub.API.Data;

/// <summary>
/// Provides initial seed data for the database via EF Core migrations.
/// Data is deterministic so migrations only run once.
/// </summary>
public static class SeedData
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        // ── Categories (6 — matching the frontend's category filter list) ──
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Electronics" },
            new Category { Id = 2, Name = "Fashion" },
            new Category { Id = 3, Name = "Home Decor" },
            new Category { Id = 4, Name = "Books" },
            new Category { Id = 5, Name = "Fitness" },
            new Category { Id = 6, Name = "Beverages" }
        );

        // ── Users (passwords are BCrypt hashes of "Password123") ──────────
        // Hash generated from: BCrypt.Net.BCrypt.HashPassword("Password123")
        const string defaultHash = "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO";

        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                FullName = "Admin User",
                Email = "admin@vendora.store",
                PasswordHash = defaultHash,
                Role = UserRole.Admin,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = 2,
                FullName = "Vendor One",
                Email = "vendor@vendora.store",
                PasswordHash = defaultHash,
                Role = UserRole.Vendor,
                CreatedAt = new DateTime(2026, 1, 5, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = 3,
                FullName = "John Buyer",
                Email = "buyer@vendora.store",
                PasswordHash = defaultHash,
                Role = UserRole.Customer,
                CreatedAt = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // ── Products (20 — realistic names, Unsplash image URLs) ──────────
        modelBuilder.Entity<Product>().HasData(
            // Electronics (CategoryId = 1)
            new Product { Id = 1,  Name = "Aether Sound Wave Wireless Headphones",         Description = "Premium over-ear wireless headphones with 40-hour battery life and active noise cancellation.", Price = 299.99m, StockQuantity = 45, ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60", CategoryId = 1, IsActive = true, CreatedAt = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 2,  Name = "Vanguard Ergonomic Mechanical Keyboard",         Description = "Compact TKL mechanical keyboard with per-key RGB lighting and PBT keycaps.", Price = 149.00m, StockQuantity = 80, ImageUrl = "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60", CategoryId = 1, IsActive = true, CreatedAt = new DateTime(2026, 1, 16, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 3,  Name = "ProView 4K Ultra HD Monitor 27\"",               Description = "IPS panel monitor with 144Hz refresh rate, 1ms response time, and USB-C PD 65W charging.", Price = 549.00m, StockQuantity = 22, ImageUrl = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=60", CategoryId = 1, IsActive = true, CreatedAt = new DateTime(2026, 1, 17, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 4,  Name = "Pulse Pro Smart Fitness Tracking Ring",           Description = "Advanced biometric ring tracking heart rate, sleep stages, SpO2, and recovery scores.", Price = 159.00m, StockQuantity = 60, ImageUrl = "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=60", CategoryId = 1, IsActive = true, CreatedAt = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc) },

            // Fashion (CategoryId = 2)
            new Product { Id = 5,  Name = "Apex Leather Bomber Jacket",                     Description = "Premium full-grain leather bomber jacket with quilted lining and custom YKK zippers.", Price = 249.50m, StockQuantity = 35, ImageUrl = "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=60", CategoryId = 2, IsActive = true, CreatedAt = new DateTime(2026, 2, 5, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 6,  Name = "Urban Streetwear Performance Sneakers",           Description = "Lightweight runners with responsive foam sole and breathable engineered mesh upper.", Price = 129.99m, StockQuantity = 120, ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60", CategoryId = 2, IsActive = true, CreatedAt = new DateTime(2026, 2, 6, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 7,  Name = "Classic Oxford Button-Down Shirt",                Description = "100% premium Oxford cotton shirt with a tailored slim fit, perfect for business casual.", Price = 79.00m, StockQuantity = 200, ImageUrl = "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=60", CategoryId = 2, IsActive = true, CreatedAt = new DateTime(2026, 2, 10, 0, 0, 0, DateTimeKind.Utc) },

            // Home Decor (CategoryId = 3)
            new Product { Id = 8,  Name = "Iris Smart Ambient Light & Lamp",                Description = "Tunable white and color smart lamp with app control, voice assistant support, and 16M color options.", Price = 59.99m, StockQuantity = 90, ImageUrl = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=60", CategoryId = 3, IsActive = true, CreatedAt = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 9,  Name = "Lumina Ceramic Essential Oil Diffuser",           Description = "Ultrasonic aromatherapy diffuser with 7 ambient LED colors and auto shut-off.", Price = 45.00m, StockQuantity = 75, ImageUrl = "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=60", CategoryId = 3, IsActive = true, CreatedAt = new DateTime(2026, 3, 5, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 10, Name = "Marble & Walnut Desk Organizer Set",              Description = "Handcrafted organizer set combining Italian marble and solid walnut for a premium workspace.", Price = 89.00m, StockQuantity = 40, ImageUrl = "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&auto=format&fit=crop&q=60", CategoryId = 3, IsActive = true, CreatedAt = new DateTime(2026, 3, 10, 0, 0, 0, DateTimeKind.Utc) },

            // Books (CategoryId = 4)
            new Product { Id = 11, Name = "Modern Web Architecture & Systems (Hardcover)",   Description = "In-depth guide covering distributed systems, microservices, event-driven architecture, and cloud-native patterns.", Price = 39.99m, StockQuantity = 150, ImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60", CategoryId = 4, IsActive = true, CreatedAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 12, Name = "The Design of Everyday Systems & Interfaces",     Description = "Essential reading on UX principles, cognitive affordances, and designing intuitive product experiences.", Price = 49.00m, StockQuantity = 100, ImageUrl = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=60", CategoryId = 4, IsActive = true, CreatedAt = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 13, Name = "Clean Code: A Handbook of Agile Craftsmanship",  Description = "Robert C. Martin's classic guide to writing readable, maintainable, and testable code.", Price = 44.99m, StockQuantity = 85, ImageUrl = "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&auto=format&fit=crop&q=60", CategoryId = 4, IsActive = true, CreatedAt = new DateTime(2026, 4, 5, 0, 0, 0, DateTimeKind.Utc) },

            // Fitness (CategoryId = 5)
            new Product { Id = 14, Name = "Titan Rubber Hex Dumbbell Set (2x 15kg)",        Description = "Commercial-grade hex dumbbells with non-slip rubber coating and ergonomic contoured handles.", Price = 89.99m, StockQuantity = 55, ImageUrl = "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=60", CategoryId = 5, IsActive = true, CreatedAt = new DateTime(2026, 4, 10, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 15, Name = "AeroGrip Resistance Band Set (5 Levels)",         Description = "Latex resistance bands in 5 progressive tension levels for home workout, rehab, and mobility training.", Price = 34.99m, StockQuantity = 200, ImageUrl = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60", CategoryId = 5, IsActive = true, CreatedAt = new DateTime(2026, 4, 12, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 16, Name = "VitalStride Pro Running Shoes",                   Description = "Carbon fiber plate running shoes with ZoomX foam for elite race-day performance.", Price = 219.00m, StockQuantity = 65, ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60", CategoryId = 5, IsActive = true, CreatedAt = new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 17, Name = "SmartScale Pro Body Composition Analyzer",        Description = "Wi-Fi connected smart scale measuring 17 body metrics including muscle mass, visceral fat, and bone density.", Price = 79.99m, StockQuantity = 48, ImageUrl = "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&auto=format&fit=crop&q=60", CategoryId = 5, IsActive = true, CreatedAt = new DateTime(2026, 5, 5, 0, 0, 0, DateTimeKind.Utc) },

            // Beverages (CategoryId = 6)
            new Product { Id = 18, Name = "Terra Espresso Roast Artisan Coffee Beans (1kg)", Description = "Single-origin Ethiopian Yirgacheffe beans, dark roast, with tasting notes of dark chocolate and blackberry.", Price = 32.50m, StockQuantity = 300, ImageUrl = "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=60", CategoryId = 6, IsActive = true, CreatedAt = new DateTime(2026, 5, 10, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 19, Name = "Organic Alpine Herbal Tea Reserve Selection",     Description = "Premium blended herbal teas sourced from Swiss Alpine meadows — 60 enveloped sachets.", Price = 24.00m, StockQuantity = 250, ImageUrl = "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60", CategoryId = 6, IsActive = true, CreatedAt = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 20, Name = "Matcha Ceremonial Grade (100g Tin)",              Description = "Stone-ground first-harvest Japanese ceremonial matcha with vibrant green color and umami sweetness.", Price = 42.00m, StockQuantity = 180, ImageUrl = "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop&q=60", CategoryId = 6, IsActive = true, CreatedAt = new DateTime(2026, 5, 20, 0, 0, 0, DateTimeKind.Utc) }
        );

        // ── Orders (10 orders with varied statuses across last 30 days) ────
        modelBuilder.Entity<Order>().HasData(
            new Order { Id = 1,  UserId = 3, OrderDate = new DateTime(2026, 6, 24, 10, 0, 0, DateTimeKind.Utc), TotalPrice = 448.99m, Status = OrderStatus.Delivered },
            new Order { Id = 2,  UserId = 3, OrderDate = new DateTime(2026, 6, 26, 14, 0, 0, DateTimeKind.Utc), TotalPrice = 129.99m, Status = OrderStatus.Delivered },
            new Order { Id = 3,  UserId = 3, OrderDate = new DateTime(2026, 6, 28, 9,  0, 0, DateTimeKind.Utc), TotalPrice = 89.99m,  Status = OrderStatus.Delivered },
            new Order { Id = 4,  UserId = 2, OrderDate = new DateTime(2026, 7,  1, 11, 0, 0, DateTimeKind.Utc), TotalPrice = 549.00m, Status = OrderStatus.Shipped },
            new Order { Id = 5,  UserId = 3, OrderDate = new DateTime(2026, 7,  5, 16, 0, 0, DateTimeKind.Utc), TotalPrice = 279.98m, Status = OrderStatus.Shipped },
            new Order { Id = 6,  UserId = 2, OrderDate = new DateTime(2026, 7, 10, 8,  0, 0, DateTimeKind.Utc), TotalPrice = 193.99m, Status = OrderStatus.Confirmed },
            new Order { Id = 7,  UserId = 3, OrderDate = new DateTime(2026, 7, 15, 13, 0, 0, DateTimeKind.Utc), TotalPrice = 84.50m,  Status = OrderStatus.Confirmed },
            new Order { Id = 8,  UserId = 2, OrderDate = new DateTime(2026, 7, 18, 10, 0, 0, DateTimeKind.Utc), TotalPrice = 159.00m, Status = OrderStatus.Pending },
            new Order { Id = 9,  UserId = 3, OrderDate = new DateTime(2026, 7, 20, 15, 0, 0, DateTimeKind.Utc), TotalPrice = 72.49m,  Status = OrderStatus.Pending },
            new Order { Id = 10, UserId = 3, OrderDate = new DateTime(2026, 7, 22, 17, 0, 0, DateTimeKind.Utc), TotalPrice = 249.50m, Status = OrderStatus.Cancelled }
        );

        // ── Order Items ────────────────────────────────────────────────────
        modelBuilder.Entity<OrderItem>().HasData(
            new OrderItem { Id = 1,  OrderId = 1,  ProductId = 1,  Quantity = 1, UnitPrice = 299.99m },
            new OrderItem { Id = 2,  OrderId = 1,  ProductId = 2,  Quantity = 1, UnitPrice = 149.00m },
            new OrderItem { Id = 3,  OrderId = 2,  ProductId = 6,  Quantity = 1, UnitPrice = 129.99m },
            new OrderItem { Id = 4,  OrderId = 3,  ProductId = 14, Quantity = 1, UnitPrice = 89.99m  },
            new OrderItem { Id = 5,  OrderId = 4,  ProductId = 3,  Quantity = 1, UnitPrice = 549.00m },
            new OrderItem { Id = 6,  OrderId = 5,  ProductId = 11, Quantity = 1, UnitPrice = 39.99m  },
            new OrderItem { Id = 7,  OrderId = 5,  ProductId = 12, Quantity = 1, UnitPrice = 49.00m  },
            new OrderItem { Id = 8,  OrderId = 5,  ProductId = 13, Quantity = 1, UnitPrice = 44.99m  },
            new OrderItem { Id = 9,  OrderId = 5,  ProductId = 8,  Quantity = 2, UnitPrice = 59.99m  },
            new OrderItem { Id = 10, OrderId = 6,  ProductId = 5,  Quantity = 1, UnitPrice = 249.50m },
            new OrderItem { Id = 11, OrderId = 7,  ProductId = 18, Quantity = 1, UnitPrice = 32.50m  },
            new OrderItem { Id = 12, OrderId = 7,  ProductId = 19, Quantity = 1, UnitPrice = 24.00m  },
            new OrderItem { Id = 13, OrderId = 7,  ProductId = 9,  Quantity = 1, UnitPrice = 45.00m  },
            new OrderItem { Id = 14, OrderId = 8,  ProductId = 4,  Quantity = 1, UnitPrice = 159.00m },
            new OrderItem { Id = 15, OrderId = 9,  ProductId = 19, Quantity = 2, UnitPrice = 24.00m  },
            new OrderItem { Id = 16, OrderId = 9,  ProductId = 20, Quantity = 1, UnitPrice = 42.00m  },
            new OrderItem { Id = 17, OrderId = 10, ProductId = 5,  Quantity = 1, UnitPrice = 249.50m }
        );
    }
}
