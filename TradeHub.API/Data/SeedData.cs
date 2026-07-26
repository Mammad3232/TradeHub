using System;
using Microsoft.EntityFrameworkCore;
using TradeHub.API.Models;

namespace TradeHub.API.Data;

/// <summary>
/// Provides comprehensive seed data for the database via EF Core migrations.
/// Data includes Brands, Categories, Subcategories, Users, Products, Orders, Order Items, and Product Reviews.
/// </summary>
public static class SeedData
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        // ── Categories (6 — matching frontend category filter list) ─────────────
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Electronics" },
            new Category { Id = 2, Name = "Fashion" },
            new Category { Id = 3, Name = "Home Decor" },
            new Category { Id = 4, Name = "Books" },
            new Category { Id = 5, Name = "Fitness" },
            new Category { Id = 6, Name = "Beverages" }
        );

        // Subcategories (24 departments matching frontend)
        modelBuilder.Entity<Subcategory>().HasData(
            // Electronics (1)
            new Subcategory { Id = 1,  CategoryId = 1, Name = "Phones & Tablets",   Slug = "phones" },
            new Subcategory { Id = 2,  CategoryId = 1, Name = "Computers & Laptops", Slug = "laptops" },
            new Subcategory { Id = 3,  CategoryId = 1, Name = "Home Appliances",     Slug = "appliances" },
            new Subcategory { Id = 4,  CategoryId = 1, Name = "Audio & Gadgets",     Slug = "audio" },
            // Fashion (2)
            new Subcategory { Id = 5,  CategoryId = 2, Name = "Men's Clothing",   Slug = "men" },
            new Subcategory { Id = 6,  CategoryId = 2, Name = "Women's Clothing", Slug = "women" },
            new Subcategory { Id = 7,  CategoryId = 2, Name = "Shoes & Sneakers", Slug = "shoes" },
            new Subcategory { Id = 8,  CategoryId = 2, Name = "Accessories",      Slug = "accessories" },
            // Home Decor (3)
            new Subcategory { Id = 9,  CategoryId = 3, Name = "Furniture",          Slug = "furniture" },
            new Subcategory { Id = 10, CategoryId = 3, Name = "Lighting",           Slug = "lighting" },
            new Subcategory { Id = 11, CategoryId = 3, Name = "Kitchenware",        Slug = "kitchen" },
            new Subcategory { Id = 12, CategoryId = 3, Name = "Textiles & Bedding", Slug = "textiles" },
            // Books (4)
            new Subcategory { Id = 13, CategoryId = 4, Name = "Fiction & Novels",   Slug = "fiction" },
            new Subcategory { Id = 14, CategoryId = 4, Name = "Sci-Fi & Fantasy",   Slug = "scifi" },
            new Subcategory { Id = 15, CategoryId = 4, Name = "Personal Dev.",      Slug = "personal" },
            new Subcategory { Id = 16, CategoryId = 4, Name = "Kids Books",         Slug = "kids" },
            // Fitness (5)
            new Subcategory { Id = 17, CategoryId = 5, Name = "Gym Equipment",      Slug = "gym" },
            new Subcategory { Id = 18, CategoryId = 5, Name = "Sportswear",         Slug = "sportswear" },
            new Subcategory { Id = 19, CategoryId = 5, Name = "Supplements",        Slug = "supplements" },
            new Subcategory { Id = 20, CategoryId = 5, Name = "Smart Wearables",    Slug = "wearables" },
            // Beverages (6)
            new Subcategory { Id = 21, CategoryId = 6, Name = "Hot Drinks",         Slug = "hot" },
            new Subcategory { Id = 22, CategoryId = 6, Name = "Cold Drinks",        Slug = "cold" },
            new Subcategory { Id = 23, CategoryId = 6, Name = "Energy Drinks",      Slug = "energy" },
            new Subcategory { Id = 24, CategoryId = 6, Name = "Organic Juices",     Slug = "organic" }
        );

        // ── Brands (20 well-known brands across all categories) ─────────────────
        modelBuilder.Entity<Brand>().HasData(
            // Electronics
            new Brand { Id = 1,  Name = "Apple",          LogoUrl = "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
            new Brand { Id = 2,  Name = "Samsung",        LogoUrl = "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
            new Brand { Id = 3,  Name = "Sony",           LogoUrl = "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg" },
            new Brand { Id = 4,  Name = "Bose",           LogoUrl = null },
            new Brand { Id = 5,  Name = "Dyson",          LogoUrl = null },
            new Brand { Id = 6,  Name = "Logitech",       LogoUrl = null },
            new Brand { Id = 7,  Name = "LG",             LogoUrl = null },
            // Fashion
            new Brand { Id = 8,  Name = "Nike",           LogoUrl = "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
            new Brand { Id = 9,  Name = "Adidas",         LogoUrl = "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" },
            new Brand { Id = 10, Name = "Zara",           LogoUrl = null },
            new Brand { Id = 11, Name = "H&M",            LogoUrl = null },
            new Brand { Id = 12, Name = "Casio",          LogoUrl = null },
            // Home Decor
            new Brand { Id = 13, Name = "IKEA",           LogoUrl = null },
            new Brand { Id = 14, Name = "Philips",        LogoUrl = null },
            // Books
            new Brand { Id = 15, Name = "Penguin Books",  LogoUrl = null },
            new Brand { Id = 16, Name = "O'Reilly Media", LogoUrl = null },
            // Fitness
            new Brand { Id = 17, Name = "Gymshark",       LogoUrl = null },
            new Brand { Id = 18, Name = "Garmin",         LogoUrl = null },
            new Brand { Id = 19, Name = "Decathlon",      LogoUrl = null },
            // Beverages
            new Brand { Id = 20, Name = "Starbucks",      LogoUrl = null }
        );

        // ── Users (passwords are BCrypt hashes of "Password123") ──────────────────
        const string defaultHash = "$2a$11$imqp6dZtk9JTXGF99nHQeOG4a8Rn9JrnT0omiuOmTMHH31ukONRlG";

        modelBuilder.Entity<User>().HasData(
            // Admin (1)
            new User { Id = 1, FullName = "Admin User", Email = "admin@vendora.store", PasswordHash = defaultHash, Role = UserRole.Admin, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            
            // Vendors (11 total)
            new User { Id = 2,  FullName = "Vendor One Store",       Email = "vendor@vendora.store",    PasswordHash = defaultHash, Role = UserRole.Vendor, CreatedAt = new DateTime(2026, 1, 5, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 4,  FullName = "TechWorld Electronics",   Email = "techworld@vendor.store",  PasswordHash = defaultHash, Role = UserRole.Vendor, CreatedAt = new DateTime(2026, 1, 6, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 5,  FullName = "Apex Apparel Co",        Email = "apexapparel@vendor.store",PasswordHash = defaultHash, Role = UserRole.Vendor, CreatedAt = new DateTime(2026, 1, 7, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 6,  FullName = "Lumina Home & Living",   Email = "lumina@vendor.store",     PasswordHash = defaultHash, Role = UserRole.Vendor, CreatedAt = new DateTime(2026, 1, 8, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 7,  FullName = "BookHaven Publishing",   Email = "bookhaven@vendor.store",  PasswordHash = defaultHash, Role = UserRole.Vendor, CreatedAt = new DateTime(2026, 1, 9, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 8,  FullName = "FitPulse Athletics",     Email = "fitpulse@vendor.store",   PasswordHash = defaultHash, Role = UserRole.Vendor, CreatedAt = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 9,  FullName = "Artisan Roasters",       Email = "artisan@vendor.store",    PasswordHash = defaultHash, Role = UserRole.Vendor, CreatedAt = new DateTime(2026, 1, 11, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 10, FullName = "Nordic Design Studio",   Email = "nordic@vendor.store",     PasswordHash = defaultHash, Role = UserRole.Vendor, CreatedAt = new DateTime(2026, 1, 12, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 11, FullName = "CyberEdge Gaming Labs",  Email = "cyberedge@vendor.store",  PasswordHash = defaultHash, Role = UserRole.Vendor, CreatedAt = new DateTime(2026, 1, 13, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 12, FullName = "EcoStyle Sustainable",   Email = "ecostyle@vendor.store",   PasswordHash = defaultHash, Role = UserRole.Vendor, CreatedAt = new DateTime(2026, 1, 14, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 13, FullName = "Zenith Acoustics",       Email = "zenith@vendor.store",     PasswordHash = defaultHash, Role = UserRole.Vendor, CreatedAt = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc) },

            // Customers (5)
            new User { Id = 3,  FullName = "John Buyer",             Email = "buyer@vendora.store",     PasswordHash = defaultHash, Role = UserRole.Customer, CreatedAt = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 14, FullName = "Alice Vance",            Email = "alice@buyer.com",         PasswordHash = defaultHash, Role = UserRole.Customer, CreatedAt = new DateTime(2026, 1, 18, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 15, FullName = "Bob Smith",              Email = "bob@buyer.com",           PasswordHash = defaultHash, Role = UserRole.Customer, CreatedAt = new DateTime(2026, 1, 20, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 16, FullName = "Charlie Brown",          Email = "charlie@buyer.com",       PasswordHash = defaultHash, Role = UserRole.Customer, CreatedAt = new DateTime(2026, 1, 22, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 17, FullName = "Diana Prince",           Email = "diana@buyer.com",         PasswordHash = defaultHash, Role = UserRole.Customer, CreatedAt = new DateTime(2026, 1, 25, 0, 0, 0, DateTimeKind.Utc) }
        );

        // ── Products (52 — Realistic items, Unsplash image URLs across 6 categories) ──
        modelBuilder.Entity<Product>().HasData(
            // Category 1: Electronics (12 Products)
            new Product { Id = 1,  Name = "Aether Sound Wave Wireless Headphones",         Description = "Premium over-ear wireless headphones with 40-hour battery life and active noise cancellation.", Price = 299.99m, StockQuantity = 6, LowStockThreshold = 5, ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60", CategoryId = 1, SubcategoryId = 4, BrandId = 4, IsActive = true, CreatedAt = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 2,  Name = "Vanguard Ergonomic Mechanical Keyboard",         Description = "Compact TKL mechanical keyboard with per-key RGB lighting and PBT keycaps.", Price = 149.00m, StockQuantity = 3, LowStockThreshold = 5, ImageUrl = "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60", CategoryId = 1, SubcategoryId = 2, BrandId = 6, IsActive = true, CreatedAt = new DateTime(2026, 1, 16, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 3,  Name = "ProView 4K Ultra HD Monitor 27\"",               Description = "IPS panel monitor with 144Hz refresh rate, 1ms response time, and USB-C PD 65W charging.", Price = 549.00m, StockQuantity = 2, LowStockThreshold = 2, ImageUrl = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=60", CategoryId = 1, SubcategoryId = 2, BrandId = 2, IsActive = true, CreatedAt = new DateTime(2026, 1, 17, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 4,  Name = "Pulse Pro Smart Fitness Tracking Ring",           Description = "Advanced biometric ring tracking heart rate, sleep stages, SpO2, and recovery scores.", Price = 159.00m, StockQuantity = 60, ImageUrl = "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=60", CategoryId = 1, SubcategoryId = 4, BrandId = 18, IsActive = true, CreatedAt = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 21, Name = "Orion Pro ANC Earbuds",                          Description = "True wireless earbuds with spatial audio, IPX7 water resistance, and wireless charging case.", Price = 189.99m, StockQuantity = 110, ImageUrl = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=60", CategoryId = 1, SubcategoryId = 4, BrandId = 1, IsActive = true, CreatedAt = new DateTime(2026, 2, 2, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 22, Name = "Apex Precision Wireless Mouse",                  Description = "Ultra-lightweight gaming mouse with 26K DPI optical sensor and PTFE feet.", Price = 79.99m, StockQuantity = 140, ImageUrl = "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=60", CategoryId = 1, SubcategoryId = 2, BrandId = 6, IsActive = true, CreatedAt = new DateTime(2026, 2, 3, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 23, Name = "CinemaSound Portable Bluetooth Speaker",         Description = "360-degree immersive sound with deep bass, 24-hour playtime, and IP67 dust/water rating.", Price = 119.00m, StockQuantity = 95, ImageUrl = "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=60", CategoryId = 1, SubcategoryId = 4, BrandId = 3, IsActive = true, CreatedAt = new DateTime(2026, 2, 4, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 24, Name = "Nexus 100W Multi-Port USB-C GaN Charger",       Description = "Ultra-compact fast charger for laptops, tablets, and phones simultaneously.", Price = 69.50m, StockQuantity = 180, ImageUrl = "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=60", CategoryId = 1, SubcategoryId = 4, BrandId = 1, IsActive = true, CreatedAt = new DateTime(2026, 2, 5, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 25, Name = "Aura Desk RGB Smart Ambient Lightbar",           Description = "Screen-bar monitor light with dual ambient backlighting and smart auto-dimming sensor.", Price = 89.99m, StockQuantity = 70, ImageUrl = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60", CategoryId = 1, SubcategoryId = 3, BrandId = 14, IsActive = true, CreatedAt = new DateTime(2026, 2, 6, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 26, Name = "StreamCraft HD Pro Web Camera 1080p",             Description = "1080p 60fps streaming webcam with autofocus, dual noise-canceling mics, and privacy shutter.", Price = 99.00m, StockQuantity = 65, ImageUrl = "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&auto=format&fit=crop&q=60", CategoryId = 1, SubcategoryId = 2, BrandId = 6, IsActive = true, CreatedAt = new DateTime(2026, 2, 7, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 27, Name = "TitanShield 2TB NVMe Portable SSD",             Description = "Rugged aluminum external SSD with read speeds up to 2000MB/s and drop protection.", Price = 179.99m, StockQuantity = 85, ImageUrl = "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=60", CategoryId = 1, SubcategoryId = 2, BrandId = 2, IsActive = true, CreatedAt = new DateTime(2026, 2, 8, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 28, Name = "VaporCool Ergonomic Laptop Stand",               Description = "Adjustable aluminum laptop riser with built-in quiet dual cooling fans.", Price = 49.99m, StockQuantity = 130, ImageUrl = "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=60", CategoryId = 1, SubcategoryId = 2, BrandId = 6, IsActive = true, CreatedAt = new DateTime(2026, 2, 9, 0, 0, 0, DateTimeKind.Utc) },

            // Category 2: Fashion (9 Products)
            new Product { Id = 5,  Name = "Apex Leather Bomber Jacket",                     Description = "Premium full-grain leather bomber jacket with quilted lining and custom YKK zippers.", Price = 249.50m, StockQuantity = 35, ImageUrl = "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=60", CategoryId = 2, SubcategoryId = 5, BrandId = 10, IsActive = true, CreatedAt = new DateTime(2026, 2, 5, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 6,  Name = "Urban Streetwear Performance Sneakers",           Description = "Lightweight runners with responsive foam sole and breathable engineered mesh upper.", Price = 129.99m, StockQuantity = 120, ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60", CategoryId = 2, SubcategoryId = 7, BrandId = 8, IsActive = true, CreatedAt = new DateTime(2026, 2, 6, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 7,  Name = "Classic Oxford Button-Down Shirt",                Description = "100% premium Oxford cotton shirt with a tailored slim fit, perfect for business casual.", Price = 79.00m, StockQuantity = 200, ImageUrl = "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=60", CategoryId = 2, SubcategoryId = 5, BrandId = 11, IsActive = true, CreatedAt = new DateTime(2026, 2, 10, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 29, Name = "Nordic Minimalist Wool Blend Coat",              Description = "Elegant mid-length wool trench coat with double-breasted button closure.", Price = 219.00m, StockQuantity = 40, ImageUrl = "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=60", CategoryId = 2, SubcategoryId = 6, BrandId = 10, IsActive = true, CreatedAt = new DateTime(2026, 2, 11, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 30, Name = "Heritage Italian Silk Necktie Set",               Description = "Handmade 100% Mulberry silk tie set with matching pocket square and cuff links.", Price = 59.99m, StockQuantity = 90, ImageUrl = "https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800&auto=format&fit=crop&q=60", CategoryId = 2, SubcategoryId = 8, BrandId = 11, IsActive = true, CreatedAt = new DateTime(2026, 2, 12, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 31, Name = "Vanguard Aviator Polarized Sunglasses",          Description = "Titanium frame sunglasses with TAC 100% UV400 anti-glare polarized lenses.", Price = 139.00m, StockQuantity = 75, ImageUrl = "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=60", CategoryId = 2, SubcategoryId = 8, BrandId = 10, IsActive = true, CreatedAt = new DateTime(2026, 2, 13, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 32, Name = "Urban Commuter Canvas Duffle Bag",               Description = "Water-resistant heavy canvas weekender travel bag with genuine leather trim.", Price = 109.50m, StockQuantity = 60, ImageUrl = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60", CategoryId = 2, SubcategoryId = 8, BrandId = 8, IsActive = true, CreatedAt = new DateTime(2026, 2, 14, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 33, Name = "AeroSoft Cashmere Knit Sweater",                 Description = "Ultra-soft 100% Mongolian cashmere crewneck sweater for cold weather warmth.", Price = 169.00m, StockQuantity = 50, ImageUrl = "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=60", CategoryId = 2, SubcategoryId = 5, BrandId = 11, IsActive = true, CreatedAt = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 34, Name = "Chronos Automatic Minimalist Wristwatch",        Description = "Sapphire crystal glass timepiece with 21-jewel Japanese automatic movement.", Price = 289.00m, StockQuantity = 30, ImageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60", CategoryId = 2, SubcategoryId = 8, BrandId = 12, IsActive = true, CreatedAt = new DateTime(2026, 2, 16, 0, 0, 0, DateTimeKind.Utc) },

            // Category 3: Home Decor (8 Products)
            new Product { Id = 8,  Name = "Iris Smart Ambient Light & Lamp",                Description = "Tunable white and color smart lamp with app control, voice assistant support, and 16M color options.", Price = 59.99m, StockQuantity = 90, ImageUrl = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=60", CategoryId = 3, SubcategoryId = 10, BrandId = 14, IsActive = true, CreatedAt = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 9,  Name = "Lumina Ceramic Essential Oil Diffuser",           Description = "Ultrasonic aromatherapy diffuser with 7 ambient LED colors and auto shut-off.", Price = 45.00m, StockQuantity = 75, ImageUrl = "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=60", CategoryId = 3, SubcategoryId = 10, BrandId = 14, IsActive = true, CreatedAt = new DateTime(2026, 3, 5, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 10, Name = "Marble & Walnut Desk Organizer Set",              Description = "Handcrafted organizer set combining Italian marble and solid walnut for a premium workspace.", Price = 89.00m, StockQuantity = 40, ImageUrl = "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&auto=format&fit=crop&q=60", CategoryId = 3, SubcategoryId = 9, BrandId = 13, IsActive = true, CreatedAt = new DateTime(2026, 3, 10, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 35, Name = "Zenith Hand-Woven Boho Throw Blanket",            Description = "Soft cotton woven throw blanket with fringe detail, perfect for sofa styling.", Price = 49.99m, StockQuantity = 110, ImageUrl = "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=60", CategoryId = 3, SubcategoryId = 12, BrandId = 13, IsActive = true, CreatedAt = new DateTime(2026, 3, 11, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 36, Name = "Artisan Ceramic Flower Vase Trio",                Description = "Set of 3 matte textured stoneware vases designed for pampas grass and dried blooms.", Price = 64.00m, StockQuantity = 85, ImageUrl = "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=800&auto=format&fit=crop&q=60", CategoryId = 3, SubcategoryId = 11, BrandId = 13, IsActive = true, CreatedAt = new DateTime(2026, 3, 12, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 37, Name = "Mid-Century Wooden Wall Clock 12\"",               Description = "Silent non-ticking sweep movement clock crafted from natural solid teak wood.", Price = 55.00m, StockQuantity = 95, ImageUrl = "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=60", CategoryId = 3, SubcategoryId = 10, BrandId = 13, IsActive = true, CreatedAt = new DateTime(2026, 3, 13, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 38, Name = "Botanical Soy Wax Scented Candle",              Description = "Hand-poured soy candle with notes of cedarwood, amber, and wild lavender in a glass jar.", Price = 28.50m, StockQuantity = 200, ImageUrl = "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=60", CategoryId = 3, SubcategoryId = 12, BrandId = 13, IsActive = true, CreatedAt = new DateTime(2026, 3, 14, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 39, Name = "Minimalist Floating Wooden Wall Shelves",        Description = "Set of 2 heavy-duty oak floating shelves with hidden mounting brackets.", Price = 74.99m, StockQuantity = 65, ImageUrl = "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=60", CategoryId = 3, SubcategoryId = 9, BrandId = 13, IsActive = true, CreatedAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc) },

            // Category 4: Books (8 Products)
            new Product { Id = 11, Name = "Modern Web Architecture & Systems",               Description = "In-depth guide covering distributed systems, microservices, event-driven architecture, and cloud-native patterns.", Price = 39.99m, StockQuantity = 150, ImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60", CategoryId = 4, SubcategoryId = 15, BrandId = 16, IsActive = true, CreatedAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 12, Name = "The Design of Everyday Systems & Interfaces",     Description = "Essential reading on UX principles, cognitive affordances, and designing intuitive product experiences.", Price = 49.00m, StockQuantity = 100, ImageUrl = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=60", CategoryId = 4, SubcategoryId = 15, BrandId = 16, IsActive = true, CreatedAt = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 13, Name = "Clean Code: A Handbook of Agile Craftsmanship",  Description = "Robert C. Martin's classic guide to writing readable, maintainable, and testable code.", Price = 44.99m, StockQuantity = 85, ImageUrl = "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&auto=format&fit=crop&q=60", CategoryId = 4, SubcategoryId = 15, BrandId = 16, IsActive = true, CreatedAt = new DateTime(2026, 4, 5, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 40, Name = "Mastering C# 12 & .NET 9 High Performance",       Description = "Comprehensive technical reference on advanced C# language features, async programming, and memory tuning.", Price = 59.99m, StockQuantity = 120, ImageUrl = "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=60", CategoryId = 4, SubcategoryId = 15, BrandId = 16, IsActive = true, CreatedAt = new DateTime(2026, 4, 6, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 41, Name = "Zero to One: Notes on Startups and Future",      Description = "Peter Thiel's groundbreaking book on how to build companies that create new things.", Price = 27.00m, StockQuantity = 175, ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=60", CategoryId = 4, SubcategoryId = 15, BrandId = 15, IsActive = true, CreatedAt = new DateTime(2026, 4, 7, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 42, Name = "Atomic Habits: An Easy & Proven Way",            Description = "James Clear's framework for improving every day through tiny changes and system building.", Price = 24.99m, StockQuantity = 220, ImageUrl = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=60", CategoryId = 4, SubcategoryId = 15, BrandId = 15, IsActive = true, CreatedAt = new DateTime(2026, 4, 8, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 43, Name = "Designing Data-Intensive Applications",          Description = "Martin Kleppmann's authoritative guide to data systems architecture, scalability, and fault tolerance.", Price = 54.50m, StockQuantity = 90, ImageUrl = "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=60", CategoryId = 4, SubcategoryId = 15, BrandId = 16, IsActive = true, CreatedAt = new DateTime(2026, 4, 9, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 44, Name = "The Psychology of Money",                         Description = "Timeless lessons on wealth, greed, and happiness by Morgan Housel.", Price = 22.00m, StockQuantity = 140, ImageUrl = "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop&q=60", CategoryId = 4, SubcategoryId = 15, BrandId = 15, IsActive = true, CreatedAt = new DateTime(2026, 4, 10, 0, 0, 0, DateTimeKind.Utc) },

            // Category 5: Fitness (8 Products)
            new Product { Id = 14, Name = "Titan Rubber Hex Dumbbell Set (2x 15kg)",        Description = "Commercial-grade hex dumbbells with non-slip rubber coating and ergonomic contoured handles.", Price = 89.99m, StockQuantity = 55, ImageUrl = "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=60", CategoryId = 5, SubcategoryId = 17, BrandId = 19, IsActive = true, CreatedAt = new DateTime(2026, 4, 10, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 15, Name = "AeroGrip Resistance Band Set (5 Levels)",         Description = "Latex resistance bands in 5 progressive tension levels for home workout, rehab, and mobility training.", Price = 34.99m, StockQuantity = 200, ImageUrl = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60", CategoryId = 5, SubcategoryId = 17, BrandId = 19, IsActive = true, CreatedAt = new DateTime(2026, 4, 12, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 16, Name = "VitalStride Pro Running Shoes",                   Description = "Carbon fiber plate running shoes with ZoomX foam for elite race-day performance.", Price = 219.00m, StockQuantity = 65, ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60", CategoryId = 5, SubcategoryId = 18, BrandId = 8, IsActive = true, CreatedAt = new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 17, Name = "SmartScale Pro Body Composition Analyzer",        Description = "Wi-Fi connected smart scale measuring 17 body metrics including muscle mass, visceral fat, and bone density.", Price = 79.99m, StockQuantity = 48, ImageUrl = "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&auto=format&fit=crop&q=60", CategoryId = 5, SubcategoryId = 20, BrandId = 18, IsActive = true, CreatedAt = new DateTime(2026, 5, 5, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 45, Name = "FlexCore Eco-Friendly TPE Yoga Mat 6mm",         Description = "Extra thick non-slip alignment yoga mat with carrying strap.", Price = 42.50m, StockQuantity = 130, ImageUrl = "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=60", CategoryId = 5, SubcategoryId = 17, BrandId = 19, IsActive = true, CreatedAt = new DateTime(2026, 5, 6, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 46, Name = "Pulse Speed Bearing Skipping Jump Rope",         Description = "Tangle-free steel cable speed jump rope with aluminum anti-slip handles.", Price = 19.99m, StockQuantity = 190, ImageUrl = "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=60", CategoryId = 5, SubcategoryId = 17, BrandId = 19, IsActive = true, CreatedAt = new DateTime(2026, 5, 7, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 47, Name = "TheraGun Deep Tissue Percussion Massager",       Description = "Powerful brushless motor muscle recovery massage gun with 6 interchangeable heads.", Price = 149.00m, StockQuantity = 70, ImageUrl = "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&auto=format&fit=crop&q=60", CategoryId = 5, SubcategoryId = 17, BrandId = 18, IsActive = true, CreatedAt = new DateTime(2026, 5, 8, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 48, Name = "HydroMax 1.5L Insulated Stainless Steel Bottle",   Description = "Double-wall vacuum insulated water bottle keeping drinks cold for 24 hours.", Price = 38.00m, StockQuantity = 160, ImageUrl = "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=60", CategoryId = 5, SubcategoryId = 18, BrandId = 8, IsActive = true, CreatedAt = new DateTime(2026, 5, 9, 0, 0, 0, DateTimeKind.Utc) },

            // Category 6: Beverages (7 Products)
            new Product { Id = 18, Name = "Terra Espresso Roast Artisan Coffee Beans (1kg)", Description = "Single-origin Ethiopian Yirgacheffe beans, dark roast, with tasting notes of dark chocolate and blackberry.", Price = 32.50m, StockQuantity = 300, ImageUrl = "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=60", CategoryId = 6, SubcategoryId = 21, BrandId = 20, IsActive = true, CreatedAt = new DateTime(2026, 5, 10, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 19, Name = "Organic Alpine Herbal Tea Reserve Selection",     Description = "Premium blended herbal teas sourced from Swiss Alpine meadows — 60 enveloped sachets.", Price = 24.00m, StockQuantity = 250, ImageUrl = "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60", CategoryId = 6, SubcategoryId = 21, BrandId = 20, IsActive = true, CreatedAt = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 20, Name = "Matcha Ceremonial Grade (100g Tin)",              Description = "Stone-ground first-harvest Japanese ceremonial matcha with vibrant green color and umami sweetness.", Price = 42.00m, StockQuantity = 180, ImageUrl = "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop&q=60", CategoryId = 6, SubcategoryId = 21, BrandId = 20, IsActive = true, CreatedAt = new DateTime(2026, 5, 20, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 49, Name = "Artisan Cold Brew Coffee Concentrate (1L)",      Description = "Steeped for 24 hours from organic specialty Arabica beans. Bold, smooth, and low acidity.", Price = 18.99m, StockQuantity = 140, ImageUrl = "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=60", CategoryId = 6, SubcategoryId = 22, BrandId = 20, IsActive = true, CreatedAt = new DateTime(2026, 5, 21, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 50, Name = "Sparkling Botanical Adaptogen Tonic 12-Pack",    Description = "Refreshing sparkling tonic infused with ashwagandha, elderberry, and hibiscus.", Price = 36.00m, StockQuantity = 110, ImageUrl = "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=60", CategoryId = 6, SubcategoryId = 22, BrandId = 20, IsActive = true, CreatedAt = new DateTime(2026, 5, 22, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 51, Name = "Golden Milk Turmeric Latte Blend (250g)",       Description = "Warming blend of organic turmeric, ginger, cinnamon, and black pepper for golden milk.", Price = 22.50m, StockQuantity = 150, ImageUrl = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=60", CategoryId = 6, SubcategoryId = 21, BrandId = 20, IsActive = true, CreatedAt = new DateTime(2026, 5, 23, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 52, Name = "Pure Cascara Coffee Cherry Tea (200g)",          Description = "Upcycled dried coffee cherries delivering a sweet, fruity tea rich in antioxidants.", Price = 19.50m, StockQuantity = 120, ImageUrl = "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&auto=format&fit=crop&q=60", CategoryId = 6, SubcategoryId = 21, BrandId = 20, IsActive = true, CreatedAt = new DateTime(2026, 5, 24, 0, 0, 0, DateTimeKind.Utc) }
        );

        // ── Reviews (30+ Realistic Product Reviews) ─────────────────────────────
        modelBuilder.Entity<Review>().HasData(
            new Review { Id = 1,  ProductId = 1,  UserId = 3,  Rating = 5, Comment = "The active noise cancellation is unreal! Worth every penny.", CreatedAt = new DateTime(2026, 6, 1, 10, 0, 0, DateTimeKind.Utc) },
            new Review { Id = 2,  ProductId = 1,  UserId = 14, Rating = 5, Comment = "Super comfortable for long coding sessions. Battery lasts for days.", CreatedAt = new DateTime(2026, 6, 5, 14, 30, 0, DateTimeKind.Utc) },
            new Review { Id = 3,  ProductId = 2,  UserId = 15, Rating = 4, Comment = "Tactile feel is great. RGB software could be slightly better.", CreatedAt = new DateTime(2026, 6, 6, 11, 20, 0, DateTimeKind.Utc) },
            new Review { Id = 4,  ProductId = 3,  UserId = 16, Rating = 5, Comment = "Colors are vibrant and 144Hz makes everything buttery smooth.", CreatedAt = new DateTime(2026, 6, 8, 16, 45, 0, DateTimeKind.Utc) },
            new Review { Id = 5,  ProductId = 4,  UserId = 17, Rating = 5, Comment = "Sleep tracking insights helped me improve my bedtime routine significantly.", CreatedAt = new DateTime(2026, 6, 10, 9, 15, 0, DateTimeKind.Utc) },
            new Review { Id = 6,  ProductId = 5,  UserId = 3,  Rating = 5, Comment = "Genuine leather smelling amazing. Fits like a glove!", CreatedAt = new DateTime(2026, 6, 12, 18, 0, 0, DateTimeKind.Utc) },
            new Review { Id = 7,  ProductId = 6,  UserId = 14, Rating = 4, Comment = "Very lightweight shoes, perfect for daily morning runs.", CreatedAt = new DateTime(2026, 6, 14, 8, 30, 0, DateTimeKind.Utc) },
            new Review { Id = 8,  ProductId = 7,  UserId = 15, Rating = 5, Comment = "Fabric quality is superb. Doesn't wrinkle easily after wash.", CreatedAt = new DateTime(2026, 6, 15, 12, 10, 0, DateTimeKind.Utc) },
            new Review { Id = 9,  ProductId = 8,  UserId = 16, Rating = 5, Comment = "App control is super seamless. Love the warmth modes for nighttime.", CreatedAt = new DateTime(2026, 6, 18, 20, 0, 0, DateTimeKind.Utc) },
            new Review { Id = 10, ProductId = 9,  UserId = 17, Rating = 4, Comment = "Fills the living room with nice lavender scent in minutes.", CreatedAt = new DateTime(2026, 6, 20, 15, 20, 0, DateTimeKind.Utc) },
            new Review { Id = 11, ProductId = 11, UserId = 3,  Rating = 5, Comment = "Must-read for modern backend developers. Clear code examples.", CreatedAt = new DateTime(2026, 6, 22, 13, 0, 0, DateTimeKind.Utc) },
            new Review { Id = 12, ProductId = 13, UserId = 14, Rating = 5, Comment = "A timeless classic. Changed how I structure my C# methods.", CreatedAt = new DateTime(2026, 6, 24, 17, 30, 0, DateTimeKind.Utc) },
            new Review { Id = 13, ProductId = 14, UserId = 15, Rating = 5, Comment = "Heft and grip are perfect. No chemical smell on the rubber.", CreatedAt = new DateTime(2026, 6, 25, 9, 0, 0, DateTimeKind.Utc) },
            new Review { Id = 14, ProductId = 18, UserId = 16, Rating = 5, Comment = "Rich crema and smooth dark chocolate notes. Best morning espresso!", CreatedAt = new DateTime(2026, 6, 28, 7, 45, 0, DateTimeKind.Utc) },
            new Review { Id = 15, ProductId = 20, UserId = 17, Rating = 5, Comment = "Vibrant bright green color, zero bitterness. High quality grade.", CreatedAt = new DateTime(2026, 6, 29, 10, 10, 0, DateTimeKind.Utc) },
            new Review { Id = 16, ProductId = 21, UserId = 3,  Rating = 5, Comment = "Noise isolation rivals over-ear models. Bass response is crisp.", CreatedAt = new DateTime(2026, 7, 1, 14, 0, 0, DateTimeKind.Utc) },
            new Review { Id = 17, ProductId = 22, UserId = 14, Rating = 4, Comment = "Mouse sensor is spot-on for FPS games. Glides effortlessly.", CreatedAt = new DateTime(2026, 7, 2, 19, 20, 0, DateTimeKind.Utc) },
            new Review { Id = 18, ProductId = 24, UserId = 15, Rating = 5, Comment = "Charges my MacBook and phone at full speed from one wall plug.", CreatedAt = new DateTime(2026, 7, 5, 11, 0, 0, DateTimeKind.Utc) },
            new Review { Id = 19, ProductId = 29, UserId = 16, Rating = 5, Comment = "Heavy wool blend keeps me warm in freezing wind. Top tier craftsmanship.", CreatedAt = new DateTime(2026, 7, 7, 16, 0, 0, DateTimeKind.Utc) },
            new Review { Id = 20, ProductId = 34, UserId = 17, Rating = 5, Comment = "The automatic rotor movement is visible through back case. Stunning watch.", CreatedAt = new DateTime(2026, 7, 9, 21, 30, 0, DateTimeKind.Utc) },
            new Review { Id = 21, ProductId = 36, UserId = 3,  Rating = 4, Comment = "Beautiful minimalist aesthetic for my dining table setup.", CreatedAt = new DateTime(2026, 7, 11, 13, 10, 0, DateTimeKind.Utc) },
            new Review { Id = 22, ProductId = 40, UserId = 14, Rating = 5, Comment = "Deep dive into .NET 9 performance tuning. Highly recommended!", CreatedAt = new DateTime(2026, 7, 12, 15, 45, 0, DateTimeKind.Utc) },
            new Review { Id = 23, ProductId = 42, UserId = 15, Rating = 5, Comment = "Life-changing practical advice on habit formation.", CreatedAt = new DateTime(2026, 7, 14, 18, 0, 0, DateTimeKind.Utc) },
            new Review { Id = 24, ProductId = 47, UserId = 16, Rating = 5, Comment = "Melts away leg soreness after intense leg day workouts.", CreatedAt = new DateTime(2026, 7, 16, 20, 15, 0, DateTimeKind.Utc) },
            new Review { Id = 25, ProductId = 49, UserId = 17, Rating = 5, Comment = "Smooth cold brew with zero harshness. Add oat milk for perfection.", CreatedAt = new DateTime(2026, 7, 18, 8, 30, 0, DateTimeKind.Utc) }
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
