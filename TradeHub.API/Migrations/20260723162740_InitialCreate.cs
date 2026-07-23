using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TradeHub.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StockQuantity = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Orders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Electronics" },
                    { 2, "Fashion" },
                    { 3, "Home Decor" },
                    { 4, "Books" },
                    { 5, "Fitness" },
                    { 6, "Beverages" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@vendora.store", "Admin User", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Admin" },
                    { 2, new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), "vendor@vendora.store", "Vendor One", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Vendor" },
                    { 3, new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), "buyer@vendora.store", "John Buyer", "$2a$11$5k5RfW7HkXfDGt8L.V1AZOQtJSvDz3FMK4l0B3f1Rr3DxBR2CzCaO", "Customer" }
                });

            migrationBuilder.InsertData(
                table: "Orders",
                columns: new[] { "Id", "OrderDate", "Status", "TotalPrice", "UserId" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 6, 24, 10, 0, 0, 0, DateTimeKind.Utc), "Delivered", 448.99m, 3 },
                    { 2, new DateTime(2026, 6, 26, 14, 0, 0, 0, DateTimeKind.Utc), "Delivered", 129.99m, 3 },
                    { 3, new DateTime(2026, 6, 28, 9, 0, 0, 0, DateTimeKind.Utc), "Delivered", 89.99m, 3 },
                    { 4, new DateTime(2026, 7, 1, 11, 0, 0, 0, DateTimeKind.Utc), "Shipped", 549.00m, 2 },
                    { 5, new DateTime(2026, 7, 5, 16, 0, 0, 0, DateTimeKind.Utc), "Shipped", 279.98m, 3 },
                    { 6, new DateTime(2026, 7, 10, 8, 0, 0, 0, DateTimeKind.Utc), "Confirmed", 193.99m, 2 },
                    { 7, new DateTime(2026, 7, 15, 13, 0, 0, 0, DateTimeKind.Utc), "Confirmed", 84.50m, 3 },
                    { 8, new DateTime(2026, 7, 18, 10, 0, 0, 0, DateTimeKind.Utc), "Pending", 159.00m, 2 },
                    { 9, new DateTime(2026, 7, 20, 15, 0, 0, 0, DateTimeKind.Utc), "Pending", 72.49m, 3 },
                    { 10, new DateTime(2026, 7, 22, 17, 0, 0, 0, DateTimeKind.Utc), "Cancelled", 249.50m, 3 }
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsActive", "Name", "Price", "StockQuantity" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Premium over-ear wireless headphones with 40-hour battery life and active noise cancellation.", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60", true, "Aether Sound Wave Wireless Headphones", 299.99m, 45 },
                    { 2, 1, new DateTime(2026, 1, 16, 0, 0, 0, 0, DateTimeKind.Utc), "Compact TKL mechanical keyboard with per-key RGB lighting and PBT keycaps.", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60", true, "Vanguard Ergonomic Mechanical Keyboard", 149.00m, 80 },
                    { 3, 1, new DateTime(2026, 1, 17, 0, 0, 0, 0, DateTimeKind.Utc), "IPS panel monitor with 144Hz refresh rate, 1ms response time, and USB-C PD 65W charging.", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=60", true, "ProView 4K Ultra HD Monitor 27\"", 549.00m, 22 },
                    { 4, 1, new DateTime(2026, 2, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Advanced biometric ring tracking heart rate, sleep stages, SpO2, and recovery scores.", "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=60", true, "Pulse Pro Smart Fitness Tracking Ring", 159.00m, 60 },
                    { 5, 2, new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Premium full-grain leather bomber jacket with quilted lining and custom YKK zippers.", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=60", true, "Apex Leather Bomber Jacket", 249.50m, 35 },
                    { 6, 2, new DateTime(2026, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Lightweight runners with responsive foam sole and breathable engineered mesh upper.", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60", true, "Urban Streetwear Performance Sneakers", 129.99m, 120 },
                    { 7, 2, new DateTime(2026, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), "100% premium Oxford cotton shirt with a tailored slim fit, perfect for business casual.", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=60", true, "Classic Oxford Button-Down Shirt", 79.00m, 200 },
                    { 8, 3, new DateTime(2026, 3, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Tunable white and color smart lamp with app control, voice assistant support, and 16M color options.", "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=60", true, "Iris Smart Ambient Light & Lamp", 59.99m, 90 },
                    { 9, 3, new DateTime(2026, 3, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Ultrasonic aromatherapy diffuser with 7 ambient LED colors and auto shut-off.", "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=60", true, "Lumina Ceramic Essential Oil Diffuser", 45.00m, 75 },
                    { 10, 3, new DateTime(2026, 3, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Handcrafted organizer set combining Italian marble and solid walnut for a premium workspace.", "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&auto=format&fit=crop&q=60", true, "Marble & Walnut Desk Organizer Set", 89.00m, 40 },
                    { 11, 4, new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "In-depth guide covering distributed systems, microservices, event-driven architecture, and cloud-native patterns.", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60", true, "Modern Web Architecture & Systems (Hardcover)", 39.99m, 150 },
                    { 12, 4, new DateTime(2026, 4, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Essential reading on UX principles, cognitive affordances, and designing intuitive product experiences.", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=60", true, "The Design of Everyday Systems & Interfaces", 49.00m, 100 },
                    { 13, 4, new DateTime(2026, 4, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Robert C. Martin's classic guide to writing readable, maintainable, and testable code.", "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&auto=format&fit=crop&q=60", true, "Clean Code: A Handbook of Agile Craftsmanship", 44.99m, 85 },
                    { 14, 5, new DateTime(2026, 4, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Commercial-grade hex dumbbells with non-slip rubber coating and ergonomic contoured handles.", "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=60", true, "Titan Rubber Hex Dumbbell Set (2x 15kg)", 89.99m, 55 },
                    { 15, 5, new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), "Latex resistance bands in 5 progressive tension levels for home workout, rehab, and mobility training.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60", true, "AeroGrip Resistance Band Set (5 Levels)", 34.99m, 200 },
                    { 16, 5, new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Carbon fiber plate running shoes with ZoomX foam for elite race-day performance.", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60", true, "VitalStride Pro Running Shoes", 219.00m, 65 },
                    { 17, 5, new DateTime(2026, 5, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Wi-Fi connected smart scale measuring 17 body metrics including muscle mass, visceral fat, and bone density.", "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&auto=format&fit=crop&q=60", true, "SmartScale Pro Body Composition Analyzer", 79.99m, 48 },
                    { 18, 6, new DateTime(2026, 5, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Single-origin Ethiopian Yirgacheffe beans, dark roast, with tasting notes of dark chocolate and blackberry.", "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=60", true, "Terra Espresso Roast Artisan Coffee Beans (1kg)", 32.50m, 300 },
                    { 19, 6, new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Premium blended herbal teas sourced from Swiss Alpine meadows — 60 enveloped sachets.", "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60", true, "Organic Alpine Herbal Tea Reserve Selection", 24.00m, 250 },
                    { 20, 6, new DateTime(2026, 5, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Stone-ground first-harvest Japanese ceremonial matcha with vibrant green color and umami sweetness.", "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop&q=60", true, "Matcha Ceremonial Grade (100g Tin)", 42.00m, 180 }
                });

            migrationBuilder.InsertData(
                table: "OrderItems",
                columns: new[] { "Id", "OrderId", "ProductId", "Quantity", "UnitPrice" },
                values: new object[,]
                {
                    { 1, 1, 1, 1, 299.99m },
                    { 2, 1, 2, 1, 149.00m },
                    { 3, 2, 6, 1, 129.99m },
                    { 4, 3, 14, 1, 89.99m },
                    { 5, 4, 3, 1, 549.00m },
                    { 6, 5, 11, 1, 39.99m },
                    { 7, 5, 12, 1, 49.00m },
                    { 8, 5, 13, 1, 44.99m },
                    { 9, 5, 8, 2, 59.99m },
                    { 10, 6, 5, 1, 249.50m },
                    { 11, 7, 18, 1, 32.50m },
                    { 12, 7, 19, 1, 24.00m },
                    { 13, 7, 9, 1, 45.00m },
                    { 14, 8, 4, 1, 159.00m },
                    { 15, 9, 19, 2, 24.00m },
                    { 16, 9, 20, 1, 42.00m },
                    { 17, 10, 5, 1, 249.50m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_ProductId",
                table: "OrderItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId",
                table: "Orders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
