using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TradeHub.API.Migrations
{
    /// <inheritdoc />
    public partial class ExpandSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 11,
                column: "Name",
                value: "Modern Web Architecture & Systems");

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsActive", "Name", "Price", "StockQuantity" },
                values: new object[,]
                {
                    { 21, 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "True wireless earbuds with spatial audio, IPX7 water resistance, and wireless charging case.", "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=60", true, "Orion Pro ANC Earbuds", 189.99m, 110 },
                    { 22, 1, new DateTime(2026, 2, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Ultra-lightweight gaming mouse with 26K DPI optical sensor and PTFE feet.", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=60", true, "Apex Precision Wireless Mouse", 79.99m, 140 },
                    { 23, 1, new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), "360-degree immersive sound with deep bass, 24-hour playtime, and IP67 dust/water rating.", "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=60", true, "CinemaSound Portable Bluetooth Speaker", 119.00m, 95 },
                    { 24, 1, new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Ultra-compact fast charger for laptops, tablets, and phones simultaneously.", "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=60", true, "Nexus 100W Multi-Port USB-C GaN Charger", 69.50m, 180 },
                    { 25, 1, new DateTime(2026, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Screen-bar monitor light with dual ambient backlighting and smart auto-dimming sensor.", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60", true, "Aura Desk RGB Smart Ambient Lightbar", 89.99m, 70 },
                    { 26, 1, new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), "1080p 60fps streaming webcam with autofocus, dual noise-canceling mics, and privacy shutter.", "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&auto=format&fit=crop&q=60", true, "StreamCraft HD Pro Web Camera 1080p", 99.00m, 65 },
                    { 27, 1, new DateTime(2026, 2, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Rugged aluminum external SSD with read speeds up to 2000MB/s and drop protection.", "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=60", true, "TitanShield 2TB NVMe Portable SSD", 179.99m, 85 },
                    { 28, 1, new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), "Adjustable aluminum laptop riser with built-in quiet dual cooling fans.", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=60", true, "VaporCool Ergonomic Laptop Stand", 49.99m, 130 },
                    { 29, 2, new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Elegant mid-length wool trench coat with double-breasted button closure.", "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=60", true, "Nordic Minimalist Wool Blend Coat", 219.00m, 40 },
                    { 30, 2, new DateTime(2026, 2, 12, 0, 0, 0, 0, DateTimeKind.Utc), "Handmade 100% Mulberry silk tie set with matching pocket square and cuff links.", "https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800&auto=format&fit=crop&q=60", true, "Heritage Italian Silk Necktie Set", 59.99m, 90 },
                    { 31, 2, new DateTime(2026, 2, 13, 0, 0, 0, 0, DateTimeKind.Utc), "Titanium frame sunglasses with TAC 100% UV400 anti-glare polarized lenses.", "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=60", true, "Vanguard Aviator Polarized Sunglasses", 139.00m, 75 },
                    { 32, 2, new DateTime(2026, 2, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Water-resistant heavy canvas weekender travel bag with genuine leather trim.", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60", true, "Urban Commuter Canvas Duffle Bag", 109.50m, 60 },
                    { 33, 2, new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Ultra-soft 100% Mongolian cashmere crewneck sweater for cold weather warmth.", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=60", true, "AeroSoft Cashmere Knit Sweater", 169.00m, 50 },
                    { 34, 2, new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), "Sapphire crystal glass timepiece with 21-jewel Japanese automatic movement.", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60", true, "Chronos Automatic Minimalist Wristwatch", 289.00m, 30 },
                    { 35, 3, new DateTime(2026, 3, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Soft cotton woven throw blanket with fringe detail, perfect for sofa styling.", "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=60", true, "Zenith Hand-Woven Boho Throw Blanket", 49.99m, 110 },
                    { 36, 3, new DateTime(2026, 3, 12, 0, 0, 0, 0, DateTimeKind.Utc), "Set of 3 matte textured stoneware vases designed for pampas grass and dried blooms.", "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=800&auto=format&fit=crop&q=60", true, "Artisan Ceramic Flower Vase Trio", 64.00m, 85 },
                    { 37, 3, new DateTime(2026, 3, 13, 0, 0, 0, 0, DateTimeKind.Utc), "Silent non-ticking sweep movement clock crafted from natural solid teak wood.", "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=60", true, "Mid-Century Wooden Wall Clock 12\"", 55.00m, 95 },
                    { 38, 3, new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Hand-poured soy candle with notes of cedarwood, amber, and wild lavender in a glass jar.", "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=60", true, "Botanical Soy Wax Scented Candle", 28.50m, 200 },
                    { 39, 3, new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Set of 2 heavy-duty oak floating shelves with hidden mounting brackets.", "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=60", true, "Minimalist Floating Wooden Wall Shelves", 74.99m, 65 },
                    { 40, 4, new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Comprehensive technical reference on advanced C# language features, async programming, and memory tuning.", "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=60", true, "Mastering C# 12 & .NET 9 High Performance", 59.99m, 120 },
                    { 41, 4, new DateTime(2026, 4, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Peter Thiel's groundbreaking book on how to build companies that create new things.", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=60", true, "Zero to One: Notes on Startups and Future", 27.00m, 175 },
                    { 42, 4, new DateTime(2026, 4, 8, 0, 0, 0, 0, DateTimeKind.Utc), "James Clear's framework for improving every day through tiny changes and system building.", "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=60", true, "Atomic Habits: An Easy & Proven Way", 24.99m, 220 },
                    { 43, 4, new DateTime(2026, 4, 9, 0, 0, 0, 0, DateTimeKind.Utc), "Martin Kleppmann's authoritative guide to data systems architecture, scalability, and fault tolerance.", "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=60", true, "Designing Data-Intensive Applications", 54.50m, 90 },
                    { 44, 4, new DateTime(2026, 4, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Timeless lessons on wealth, greed, and happiness by Morgan Housel.", "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop&q=60", true, "The Psychology of Money", 22.00m, 140 },
                    { 45, 5, new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Extra thick non-slip alignment yoga mat with carrying strap.", "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=60", true, "FlexCore Eco-Friendly TPE Yoga Mat 6mm", 42.50m, 130 },
                    { 46, 5, new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Tangle-free steel cable speed jump rope with aluminum anti-slip handles.", "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=60", true, "Pulse Speed Bearing Skipping Jump Rope", 19.99m, 190 },
                    { 47, 5, new DateTime(2026, 5, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Powerful brushless motor muscle recovery massage gun with 6 interchangeable heads.", "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&auto=format&fit=crop&q=60", true, "TheraGun Deep Tissue Percussion Massager", 149.00m, 70 },
                    { 48, 5, new DateTime(2026, 5, 9, 0, 0, 0, 0, DateTimeKind.Utc), "Double-wall vacuum insulated water bottle keeping drinks cold for 24 hours.", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=60", true, "HydroMax 1.5L Insulated Stainless Steel Bottle", 38.00m, 160 },
                    { 49, 6, new DateTime(2026, 5, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Steeped for 24 hours from organic specialty Arabica beans. Bold, smooth, and low acidity.", "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=60", true, "Artisan Cold Brew Coffee Concentrate (1L)", 18.99m, 140 },
                    { 50, 6, new DateTime(2026, 5, 22, 0, 0, 0, 0, DateTimeKind.Utc), "Refreshing sparkling tonic infused with ashwagandha, elderberry, and hibiscus.", "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=60", true, "Sparkling Botanical Adaptogen Tonic 12-Pack", 36.00m, 110 },
                    { 51, 6, new DateTime(2026, 5, 23, 0, 0, 0, 0, DateTimeKind.Utc), "Warming blend of organic turmeric, ginger, cinnamon, and black pepper for golden milk.", "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=60", true, "Golden Milk Turmeric Latte Blend (250g)", 22.50m, 150 },
                    { 52, 6, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), "Upcycled dried coffee cherries delivering a sweet, fruity tea rich in antioxidants.", "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&auto=format&fit=crop&q=60", true, "Pure Cascara Coffee Cherry Tea (200g)", 19.50m, 120 }
                });

            migrationBuilder.InsertData(
                table: "Reviews",
                columns: new[] { "Id", "Comment", "CreatedAt", "ProductId", "Rating", "UserId" },
                values: new object[,]
                {
                    { 1, "The active noise cancellation is unreal! Worth every penny.", new DateTime(2026, 6, 1, 10, 0, 0, 0, DateTimeKind.Utc), 1, 5, 3 },
                    { 6, "Genuine leather smelling amazing. Fits like a glove!", new DateTime(2026, 6, 12, 18, 0, 0, 0, DateTimeKind.Utc), 5, 5, 3 },
                    { 11, "Must-read for modern backend developers. Clear code examples.", new DateTime(2026, 6, 22, 13, 0, 0, 0, DateTimeKind.Utc), 11, 5, 3 }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "FullName",
                value: "Vendor One Store");

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 4, new DateTime(2026, 1, 6, 0, 0, 0, 0, DateTimeKind.Utc), "techworld@vendor.store", "TechWorld Electronics", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Vendor" },
                    { 5, new DateTime(2026, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), "apexapparel@vendor.store", "Apex Apparel Co", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Vendor" },
                    { 6, new DateTime(2026, 1, 8, 0, 0, 0, 0, DateTimeKind.Utc), "lumina@vendor.store", "Lumina Home & Living", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Vendor" },
                    { 7, new DateTime(2026, 1, 9, 0, 0, 0, 0, DateTimeKind.Utc), "bookhaven@vendor.store", "BookHaven Publishing", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Vendor" },
                    { 8, new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), "fitpulse@vendor.store", "FitPulse Athletics", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Vendor" },
                    { 9, new DateTime(2026, 1, 11, 0, 0, 0, 0, DateTimeKind.Utc), "artisan@vendor.store", "Artisan Roasters", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Vendor" },
                    { 10, new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), "nordic@vendor.store", "Nordic Design Studio", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Vendor" },
                    { 11, new DateTime(2026, 1, 13, 0, 0, 0, 0, DateTimeKind.Utc), "cyberedge@vendor.store", "CyberEdge Gaming Labs", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Vendor" },
                    { 12, new DateTime(2026, 1, 14, 0, 0, 0, 0, DateTimeKind.Utc), "ecostyle@vendor.store", "EcoStyle Sustainable", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Vendor" },
                    { 13, new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "zenith@vendor.store", "Zenith Acoustics", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Vendor" },
                    { 14, new DateTime(2026, 1, 18, 0, 0, 0, 0, DateTimeKind.Utc), "alice@buyer.com", "Alice Vance", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Customer" },
                    { 15, new DateTime(2026, 1, 20, 0, 0, 0, 0, DateTimeKind.Utc), "bob@buyer.com", "Bob Smith", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Customer" },
                    { 16, new DateTime(2026, 1, 22, 0, 0, 0, 0, DateTimeKind.Utc), "charlie@buyer.com", "Charlie Brown", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Customer" },
                    { 17, new DateTime(2026, 1, 25, 0, 0, 0, 0, DateTimeKind.Utc), "diana@buyer.com", "Diana Prince", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Customer" }
                });

            migrationBuilder.InsertData(
                table: "Reviews",
                columns: new[] { "Id", "Comment", "CreatedAt", "ProductId", "Rating", "UserId" },
                values: new object[,]
                {
                    { 2, "Super comfortable for long coding sessions. Battery lasts for days.", new DateTime(2026, 6, 5, 14, 30, 0, 0, DateTimeKind.Utc), 1, 5, 14 },
                    { 3, "Tactile feel is great. RGB software could be slightly better.", new DateTime(2026, 6, 6, 11, 20, 0, 0, DateTimeKind.Utc), 2, 4, 15 },
                    { 4, "Colors are vibrant and 144Hz makes everything buttery smooth.", new DateTime(2026, 6, 8, 16, 45, 0, 0, DateTimeKind.Utc), 3, 5, 16 },
                    { 5, "Sleep tracking insights helped me improve my bedtime routine significantly.", new DateTime(2026, 6, 10, 9, 15, 0, 0, DateTimeKind.Utc), 4, 5, 17 },
                    { 7, "Very lightweight shoes, perfect for daily morning runs.", new DateTime(2026, 6, 14, 8, 30, 0, 0, DateTimeKind.Utc), 6, 4, 14 },
                    { 8, "Fabric quality is superb. Doesn't wrinkle easily after wash.", new DateTime(2026, 6, 15, 12, 10, 0, 0, DateTimeKind.Utc), 7, 5, 15 },
                    { 9, "App control is super seamless. Love the warmth modes for nighttime.", new DateTime(2026, 6, 18, 20, 0, 0, 0, DateTimeKind.Utc), 8, 5, 16 },
                    { 10, "Fills the living room with nice lavender scent in minutes.", new DateTime(2026, 6, 20, 15, 20, 0, 0, DateTimeKind.Utc), 9, 4, 17 },
                    { 12, "A timeless classic. Changed how I structure my C# methods.", new DateTime(2026, 6, 24, 17, 30, 0, 0, DateTimeKind.Utc), 13, 5, 14 },
                    { 13, "Heft and grip are perfect. No chemical smell on the rubber.", new DateTime(2026, 6, 25, 9, 0, 0, 0, DateTimeKind.Utc), 14, 5, 15 },
                    { 14, "Rich crema and smooth dark chocolate notes. Best morning espresso!", new DateTime(2026, 6, 28, 7, 45, 0, 0, DateTimeKind.Utc), 18, 5, 16 },
                    { 15, "Vibrant bright green color, zero bitterness. High quality grade.", new DateTime(2026, 6, 29, 10, 10, 0, 0, DateTimeKind.Utc), 20, 5, 17 },
                    { 16, "Noise isolation rivals over-ear models. Bass response is crisp.", new DateTime(2026, 7, 1, 14, 0, 0, 0, DateTimeKind.Utc), 21, 5, 3 },
                    { 17, "Mouse sensor is spot-on for FPS games. Glides effortlessly.", new DateTime(2026, 7, 2, 19, 20, 0, 0, DateTimeKind.Utc), 22, 4, 14 },
                    { 18, "Charges my MacBook and phone at full speed from one wall plug.", new DateTime(2026, 7, 5, 11, 0, 0, 0, DateTimeKind.Utc), 24, 5, 15 },
                    { 19, "Heavy wool blend keeps me warm in freezing wind. Top tier craftsmanship.", new DateTime(2026, 7, 7, 16, 0, 0, 0, DateTimeKind.Utc), 29, 5, 16 },
                    { 20, "The automatic rotor movement is visible through back case. Stunning watch.", new DateTime(2026, 7, 9, 21, 30, 0, 0, DateTimeKind.Utc), 34, 5, 17 },
                    { 21, "Beautiful minimalist aesthetic for my dining table setup.", new DateTime(2026, 7, 11, 13, 10, 0, 0, DateTimeKind.Utc), 36, 4, 3 },
                    { 22, "Deep dive into .NET 9 performance tuning. Highly recommended!", new DateTime(2026, 7, 12, 15, 45, 0, 0, DateTimeKind.Utc), 40, 5, 14 },
                    { 23, "Life-changing practical advice on habit formation.", new DateTime(2026, 7, 14, 18, 0, 0, 0, DateTimeKind.Utc), 42, 5, 15 },
                    { 24, "Melts away leg soreness after intense leg day workouts.", new DateTime(2026, 7, 16, 20, 15, 0, 0, DateTimeKind.Utc), 47, 5, 16 },
                    { 25, "Smooth cold brew with zero harshness. Add oat milk for perfection.", new DateTime(2026, 7, 18, 8, 30, 0, 0, DateTimeKind.Utc), 49, 5, 17 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 39);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 41);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 43);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 44);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 45);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 46);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 48);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 50);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 51);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 52);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 40);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 42);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 47);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 49);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 11,
                column: "Name",
                value: "Modern Web Architecture & Systems (Hardcover)");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "FullName",
                value: "Vendor One");
        }
    }
}
