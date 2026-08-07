/**
 * productStorage.ts
 * Single source of truth for all localStorage reads/writes of tradehub_products.
 *
 * Rules:
 *  1. getStoredProducts()   — returns the full current list (never null/undefined)
 *  2. saveStoredProducts()  — writes the full merged list to both keys
 *  3. seedProductsIfEmpty() — writes ONLY if the key does not exist yet
 *  4. patchStoredProduct()  — upsert one item without touching the rest
 *  5. removeStoredProduct() — remove one item without touching the rest
 *  6. broadcastChange()     — fires all events so UIs update immediately
 *
 * NEVER call localStorage.setItem('tradehub_products', ...) from anywhere else.
 */

export const PRODUCTS_KEY = 'tradehub_products';
export const LEGACY_KEY   = 'vendora_vendor_products';
const DELETED_KEY  = 'vendora_deleted_product_ids';

export const DEFAULT_SEED_PRODUCTS: any[] = [
  // ── FASHION (17 products) ──────────────────────────────────────────
  { id: 1, title: 'Apex Leather Bomber Jacket', name: 'Apex Leather Bomber Jacket', price: 249.50, category: 'Fashion', subcategory: "Men's Clothing", subcategorySlug: 'men', brand: 'Apex Goods Co.', rating: 4.9, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=60', stockQuantity: 35, stock: 35, status: 'Active' },
  { id: 2, title: 'Urban Streetwear Performance Sneakers', name: 'Urban Streetwear Performance Sneakers', price: 129.99, category: 'Fashion', subcategory: 'Shoes & Sneakers', subcategorySlug: 'shoes', brand: 'Nike', rating: 4.6, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60', stockQuantity: 120, stock: 120, status: 'Active' },
  { id: 3, title: 'Classic Oxford Button-Down Shirt', name: 'Classic Oxford Button-Down Shirt', price: 79.00, category: 'Fashion', subcategory: "Men's Clothing", subcategorySlug: 'men', brand: 'H&M', rating: 4.5, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=60', stockQuantity: 200, stock: 200, status: 'Active' },
  { id: 4, title: 'Nordic Minimalist Wool Blend Coat', name: 'Nordic Minimalist Wool Blend Coat', price: 219.00, category: 'Fashion', subcategory: "Women's Clothing", subcategorySlug: 'women', brand: 'Zara', rating: 4.7, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=60', stockQuantity: 40, stock: 40, status: 'Active' },
  { id: 5, title: 'Heritage Italian Silk Necktie Set', name: 'Heritage Italian Silk Necktie Set', price: 59.99, category: 'Fashion', subcategory: 'Accessories', subcategorySlug: 'accessories', brand: 'H&M', rating: 4.6, image: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800&auto=format&fit=crop&q=60', stockQuantity: 90, stock: 90, status: 'Active' },
  { id: 6, title: 'Vanguard Aviator Polarized Sunglasses', name: 'Vanguard Aviator Polarized Sunglasses', price: 139.00, category: 'Fashion', subcategory: 'Accessories', subcategorySlug: 'accessories', brand: 'Zara', rating: 4.8, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=60', stockQuantity: 75, stock: 75, status: 'Active' },
  { id: 7, title: 'Urban Commuter Canvas Duffle Bag', name: 'Urban Commuter Canvas Duffle Bag', price: 109.50, category: 'Fashion', subcategory: 'Accessories', subcategorySlug: 'accessories', brand: 'Nike', rating: 4.5, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60', stockQuantity: 60, stock: 60, status: 'Active' },
  { id: 8, title: 'AeroSoft Cashmere Knit Sweater', name: 'AeroSoft Cashmere Knit Sweater', price: 169.00, category: 'Fashion', subcategory: "Men's Clothing", subcategorySlug: 'men', brand: 'H&M', rating: 4.7, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=60', stockQuantity: 50, stock: 50, status: 'Active' },
  { id: 9, title: 'Chronos Automatic Minimalist Wristwatch', name: 'Chronos Automatic Minimalist Wristwatch', price: 289.00, category: 'Fashion', subcategory: 'Accessories', subcategorySlug: 'accessories', brand: 'Casio', rating: 4.9, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60', stockQuantity: 30, stock: 30, status: 'Active' },
  { id: 10, title: 'Slim Fit Tailored Chino', name: 'Slim Fit Tailored Chino', price: 49.99, category: 'Fashion', subcategory: "Men's Clothing", subcategorySlug: 'men', brand: 'Zara', rating: 4.3, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80', stockQuantity: 80, stock: 80, status: 'Active' },
  { id: 11, title: 'Linen Blend Casual Shirt', name: 'Linen Blend Casual Shirt', price: 29.99, category: 'Fashion', subcategory: "Men's Clothing", subcategorySlug: 'men', brand: 'H&M', rating: 4.1, image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80', stockQuantity: 110, stock: 110, status: 'Active' },
  { id: 12, title: 'Italian Wool Overcoat', name: 'Italian Wool Overcoat', price: 299.00, category: 'Fashion', subcategory: "Men's Clothing", subcategorySlug: 'men', brand: 'Massimo Dutti', rating: 4.7, image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&auto=format&fit=crop&q=80', stockQuantity: 25, stock: 25, status: 'Active' },
  { id: 13, title: 'Satin Wrap Midi Dress', name: 'Satin Wrap Midi Dress', price: 79.99, category: 'Fashion', subcategory: "Women's Clothing", subcategorySlug: 'women', brand: 'Mango', rating: 4.5, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80', stockQuantity: 65, stock: 65, status: 'Active' },
  { id: 14, title: 'Ribbed Knit Turtleneck', name: 'Ribbed Knit Turtleneck', price: 45.99, category: 'Fashion', subcategory: "Women's Clothing", subcategorySlug: 'women', brand: 'Zara', rating: 4.4, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80', stockQuantity: 95, stock: 95, status: 'Active' },
  { id: 15, title: 'Air Max 270 Sneakers', name: 'Air Max 270 Sneakers', price: 150.00, category: 'Fashion', subcategory: 'Shoes & Sneakers', subcategorySlug: 'shoes', brand: 'Nike', rating: 4.6, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80', stockQuantity: 140, stock: 140, status: 'Active' },
  { id: 16, title: 'Ultraboost 23 Runners', name: 'Ultraboost 23 Runners', price: 180.00, category: 'Fashion', subcategory: 'Shoes & Sneakers', subcategorySlug: 'shoes', brand: 'Adidas', rating: 4.7, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80', stockQuantity: 85, stock: 85, status: 'Active' },
  { id: 17, title: 'Suede Classic XXI Shoes', name: 'Suede Classic XXI Shoes', price: 89.00, category: 'Fashion', subcategory: 'Shoes & Sneakers', subcategorySlug: 'shoes', brand: 'Puma', rating: 4.4, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80', stockQuantity: 100, stock: 100, status: 'Active' },

  // ── ELECTRONICS (18 products) ──────────────────────────────────────
  { id: 18, title: 'Aether Sound Wave Wireless Headphones', name: 'Aether Sound Wave Wireless Headphones', price: 299.99, category: 'Electronics', subcategory: 'Audio & Gadgets', subcategorySlug: 'audio', brand: 'Bose', rating: 4.8, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60', stockQuantity: 40, stock: 40, status: 'Active' },
  { id: 19, title: 'Vanguard Ergonomic Mechanical Keyboard', name: 'Vanguard Ergonomic Mechanical Keyboard', price: 149.00, category: 'Electronics', subcategory: 'Computers & Laptops', subcategorySlug: 'laptops', brand: 'Logitech', rating: 4.7, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60', stockQuantity: 25, stock: 25, status: 'Active' },
  { id: 20, title: 'ProView 4K Ultra HD Monitor 27"', name: 'ProView 4K Ultra HD Monitor 27"', price: 549.00, category: 'Electronics', subcategory: 'Computers & Laptops', subcategorySlug: 'laptops', brand: 'Samsung', rating: 4.9, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=60', stockQuantity: 15, stock: 15, status: 'Active' },
  { id: 21, title: 'Pulse Pro Smart Fitness Tracking Ring', name: 'Pulse Pro Smart Fitness Tracking Ring', price: 159.00, category: 'Electronics', subcategory: 'Audio & Gadgets', subcategorySlug: 'audio', brand: 'Garmin', rating: 4.6, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=60', stockQuantity: 60, stock: 60, status: 'Active' },
  { id: 22, title: 'Orion Pro ANC Earbuds', name: 'Orion Pro ANC Earbuds', price: 189.99, category: 'Electronics', subcategory: 'Audio & Gadgets', subcategorySlug: 'audio', brand: 'Apple', rating: 4.8, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=60', stockQuantity: 110, stock: 110, status: 'Active' },
  { id: 23, title: 'Apex Precision Wireless Mouse', name: 'Apex Precision Wireless Mouse', price: 79.99, category: 'Electronics', subcategory: 'Computers & Laptops', subcategorySlug: 'laptops', brand: 'Logitech', rating: 4.7, image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=60', stockQuantity: 140, stock: 140, status: 'Active' },
  { id: 24, title: 'CinemaSound Portable Bluetooth Speaker', name: 'CinemaSound Portable Bluetooth Speaker', price: 119.00, category: 'Electronics', subcategory: 'Audio & Gadgets', subcategorySlug: 'audio', brand: 'Sony', rating: 4.6, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=60', stockQuantity: 95, stock: 95, status: 'Active' },
  { id: 25, title: 'Nexus 100W Multi-Port USB-C GaN Charger', name: 'Nexus 100W Multi-Port USB-C GaN Charger', price: 69.50, category: 'Electronics', subcategory: 'Audio & Gadgets', subcategorySlug: 'audio', brand: 'Apple', rating: 4.7, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=60', stockQuantity: 180, stock: 180, status: 'Active' },
  { id: 26, title: 'Aura Desk RGB Smart Ambient Lightbar', name: 'Aura Desk RGB Smart Ambient Lightbar', price: 89.99, category: 'Electronics', subcategory: 'Home Appliances', subcategorySlug: 'appliances', brand: 'Philips', rating: 4.5, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60', stockQuantity: 70, stock: 70, status: 'Active' },
  { id: 27, title: 'StreamCraft HD Pro Web Camera 1080p', name: 'StreamCraft HD Pro Web Camera 1080p', price: 99.00, category: 'Electronics', subcategory: 'Computers & Laptops', subcategorySlug: 'laptops', brand: 'Logitech', rating: 4.6, image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&auto=format&fit=crop&q=60', stockQuantity: 65, stock: 65, status: 'Active' },
  { id: 28, title: 'TitanShield 2TB NVMe Portable SSD', name: 'TitanShield 2TB NVMe Portable SSD', price: 179.99, category: 'Electronics', subcategory: 'Computers & Laptops', subcategorySlug: 'laptops', brand: 'Samsung', rating: 4.9, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=60', stockQuantity: 85, stock: 85, status: 'Active' },
  { id: 29, title: 'VaporCool Ergonomic Laptop Stand', name: 'VaporCool Ergonomic Laptop Stand', price: 49.99, category: 'Electronics', subcategory: 'Computers & Laptops', subcategorySlug: 'laptops', brand: 'Logitech', rating: 4.4, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=60', stockQuantity: 130, stock: 130, status: 'Active' },
  { id: 30, title: 'iPhone 15 Pro Max', name: 'iPhone 15 Pro Max', price: 1199.00, category: 'Electronics', subcategory: 'Phones & Tablets', subcategorySlug: 'phones', brand: 'Apple', rating: 4.9, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80', stockQuantity: 50, stock: 50, status: 'Active' },
  { id: 31, title: 'Galaxy S24 Ultra', name: 'Galaxy S24 Ultra', price: 1299.00, category: 'Electronics', subcategory: 'Phones & Tablets', subcategorySlug: 'phones', brand: 'Samsung', rating: 4.8, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80', stockQuantity: 45, stock: 45, status: 'Active' },
  { id: 32, title: 'Xiaomi 14 Pro', name: 'Xiaomi 14 Pro', price: 899.00, category: 'Electronics', subcategory: 'Phones & Tablets', subcategorySlug: 'phones', brand: 'Xiaomi', rating: 4.5, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80', stockQuantity: 60, stock: 60, status: 'Active' },
  { id: 33, title: 'iPad Pro 12.9"', name: 'iPad Pro 12.9"', price: 1099.00, category: 'Electronics', subcategory: 'Phones & Tablets', subcategorySlug: 'phones', brand: 'Apple', rating: 4.9, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80', stockQuantity: 30, stock: 30, status: 'Active' },
  { id: 34, title: 'MacBook Pro M3', name: 'MacBook Pro M3', price: 1599.00, category: 'Electronics', subcategory: 'Computers & Laptops', subcategorySlug: 'laptops', brand: 'Apple', rating: 5.0, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80', stockQuantity: 25, stock: 25, status: 'Active' },
  { id: 35, title: 'ROG Zephyrus G14', name: 'ROG Zephyrus G14', price: 1499.00, category: 'Electronics', subcategory: 'Computers & Laptops', subcategorySlug: 'laptops', brand: 'Asus', rating: 4.7, image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format&fit=crop&q=80', stockQuantity: 20, stock: 20, status: 'Active' },

  // ── HOME DECOR (12 products) ───────────────────────────────────────
  { id: 36, title: 'Iris Smart Ambient Light & Lamp', name: 'Iris Smart Ambient Light & Lamp', price: 59.99, category: 'Home Decor', subcategory: 'Lighting', subcategorySlug: 'lighting', brand: 'Philips', rating: 4.4, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=60', stockQuantity: 90, stock: 90, status: 'Active' },
  { id: 37, title: 'Lumina Ceramic Essential Oil Diffuser', name: 'Lumina Ceramic Essential Oil Diffuser', price: 45.00, category: 'Home Decor', subcategory: 'Lighting', subcategorySlug: 'lighting', brand: 'Philips', rating: 4.5, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=60', stockQuantity: 75, stock: 75, status: 'Active' },
  { id: 38, title: 'Marble & Walnut Desk Organizer Set', name: 'Marble & Walnut Desk Organizer Set', price: 89.00, category: 'Home Decor', subcategory: 'Furniture', subcategorySlug: 'furniture', brand: 'IKEA', rating: 4.7, image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&auto=format&fit=crop&q=60', stockQuantity: 40, stock: 40, status: 'Active' },
  { id: 39, title: 'Zenith Hand-Woven Boho Throw Blanket', name: 'Zenith Hand-Woven Boho Throw Blanket', price: 49.99, category: 'Home Decor', subcategory: 'Textiles & Bedding', subcategorySlug: 'textiles', brand: 'IKEA', rating: 4.6, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=60', stockQuantity: 110, stock: 110, status: 'Active' },
  { id: 40, title: 'Artisan Ceramic Flower Vase Trio', name: 'Artisan Ceramic Flower Vase Trio', price: 64.00, category: 'Home Decor', subcategory: 'Kitchenware', subcategorySlug: 'kitchen', brand: 'IKEA', rating: 4.5, image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=800&auto=format&fit=crop&q=60', stockQuantity: 85, stock: 85, status: 'Active' },
  { id: 41, title: 'Mid-Century Wooden Wall Clock 12"', name: 'Mid-Century Wooden Wall Clock 12"', price: 55.00, category: 'Home Decor', subcategory: 'Lighting', subcategorySlug: 'lighting', brand: 'IKEA', rating: 4.3, image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=60', stockQuantity: 95, stock: 95, status: 'Active' },
  { id: 42, title: 'Botanical Soy Wax Scented Candle', name: 'Botanical Soy Wax Scented Candle', price: 28.50, category: 'Home Decor', subcategory: 'Textiles & Bedding', subcategorySlug: 'textiles', brand: 'IKEA', rating: 4.8, image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=60', stockQuantity: 200, stock: 200, status: 'Active' },
  { id: 43, title: 'Minimalist Floating Wooden Wall Shelves', name: 'Minimalist Floating Wooden Wall Shelves', price: 74.99, category: 'Home Decor', subcategory: 'Furniture', subcategorySlug: 'furniture', brand: 'IKEA', rating: 4.6, image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=60', stockQuantity: 65, stock: 65, status: 'Active' },
  { id: 44, title: 'KALLAX Shelf Unit', name: 'KALLAX Shelf Unit', price: 139.00, category: 'Home Decor', subcategory: 'Furniture', subcategorySlug: 'furniture', brand: 'IKEA', rating: 4.4, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80', stockQuantity: 45, stock: 45, status: 'Active' },
  { id: 45, title: 'Rocking Chair VAMDRUP', name: 'Rocking Chair VAMDRUP', price: 249.00, category: 'Home Decor', subcategory: 'Furniture', subcategorySlug: 'furniture', brand: 'JYSK', rating: 4.2, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop&q=80', stockQuantity: 20, stock: 20, status: 'Active' },
  { id: 46, title: 'Hue Play Light Bar Pair', name: 'Hue Play Light Bar Pair', price: 79.00, category: 'Home Decor', subcategory: 'Lighting', subcategorySlug: 'lighting', brand: 'Philips', rating: 4.7, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80', stockQuantity: 80, stock: 80, status: 'Active' },
  { id: 47, title: 'Tefal Ingenio Cookware Set', name: 'Tefal Ingenio Cookware Set', price: 99.00, category: 'Home Decor', subcategory: 'Kitchenware', subcategorySlug: 'kitchen', brand: 'Tefal', rating: 4.5, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop&q=80', stockQuantity: 55, stock: 55, status: 'Active' },

  // ── BOOKS (9 products) ─────────────────────────────────────────────
  { id: 48, title: 'Modern Web Architecture & Systems', name: 'Modern Web Architecture & Systems', price: 39.99, category: 'Books', subcategory: 'Personal Dev.', subcategorySlug: 'personal', brand: "O'Reilly Media", rating: 4.9, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60', stockQuantity: 150, stock: 150, status: 'Active' },
  { id: 49, title: 'The Design of Everyday Systems & Interfaces', name: 'The Design of Everyday Systems & Interfaces', price: 49.00, category: 'Books', subcategory: 'Personal Dev.', subcategorySlug: 'personal', brand: "O'Reilly Media", rating: 4.8, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=60', stockQuantity: 100, stock: 100, status: 'Active' },
  { id: 50, title: 'Clean Code: A Handbook of Agile Craftsmanship', name: 'Clean Code: A Handbook of Agile Craftsmanship', price: 44.99, category: 'Books', subcategory: 'Personal Dev.', subcategorySlug: 'personal', brand: "O'Reilly Media", rating: 4.8, image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&auto=format&fit=crop&q=60', stockQuantity: 85, stock: 85, status: 'Active' },
  { id: 51, title: 'Mastering C# 12 & .NET 9 High Performance', name: 'Mastering C# 12 & .NET 9 High Performance', price: 59.99, category: 'Books', subcategory: 'Personal Dev.', subcategorySlug: 'personal', brand: "O'Reilly Media", rating: 4.8, image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=60', stockQuantity: 120, stock: 120, status: 'Active' },
  { id: 52, title: 'Zero to One: Notes on Startups and Future', name: 'Zero to One: Notes on Startups and Future', price: 27.00, category: 'Books', subcategory: 'Personal Dev.', subcategorySlug: 'personal', brand: 'Penguin Books', rating: 4.7, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=60', stockQuantity: 175, stock: 175, status: 'Active' },
  { id: 53, title: 'Atomic Habits: An Easy & Proven Way', name: 'Atomic Habits: An Easy & Proven Way', price: 24.99, category: 'Books', subcategory: 'Personal Dev.', subcategorySlug: 'personal', brand: 'Penguin Books', rating: 4.9, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=60', stockQuantity: 220, stock: 220, status: 'Active' },
  { id: 54, title: 'Designing Data-Intensive Applications', name: 'Designing Data-Intensive Applications', price: 54.50, category: 'Books', subcategory: 'Personal Dev.', subcategorySlug: 'personal', brand: "O'Reilly Media", rating: 4.9, image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=60', stockQuantity: 90, stock: 90, status: 'Active' },
  { id: 55, title: 'The Psychology of Money', name: 'The Psychology of Money', price: 22.00, category: 'Books', subcategory: 'Personal Dev.', subcategorySlug: 'personal', brand: 'Penguin Books', rating: 4.8, image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop&q=60', stockQuantity: 140, stock: 140, status: 'Active' },
  { id: 56, title: 'The Midnight Library', name: 'The Midnight Library', price: 14.99, category: 'Books', subcategory: 'Fiction & Novels', subcategorySlug: 'fiction', brand: 'Penguin Books', rating: 4.6, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', stockQuantity: 100, stock: 100, status: 'Active' },

  // ── FITNESS (9 products) ───────────────────────────────────────────
  { id: 57, title: 'Titan Rubber Hex Dumbbell Set (2x 15kg)', name: 'Titan Rubber Hex Dumbbell Set (2x 15kg)', price: 89.99, category: 'Fitness', subcategory: 'Gym Equipment', subcategorySlug: 'gym', brand: 'Decathlon', rating: 4.7, image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=60', stockQuantity: 55, stock: 55, status: 'Active' },
  { id: 58, title: 'AeroGrip Resistance Band Set (5 Levels)', name: 'AeroGrip Resistance Band Set (5 Levels)', price: 34.99, category: 'Fitness', subcategory: 'Gym Equipment', subcategorySlug: 'gym', brand: 'Decathlon', rating: 4.5, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60', stockQuantity: 200, stock: 200, status: 'Active' },
  { id: 59, title: 'VitalStride Pro Running Shoes', name: 'VitalStride Pro Running Shoes', price: 219.00, category: 'Fitness', subcategory: 'Sportswear', subcategorySlug: 'sportswear', brand: 'Nike', rating: 4.8, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60', stockQuantity: 65, stock: 65, status: 'Active' },
  { id: 60, title: 'SmartScale Pro Body Composition Analyzer', name: 'SmartScale Pro Body Composition Analyzer', price: 79.99, category: 'Fitness', subcategory: 'Smart Wearables', subcategorySlug: 'wearables', brand: 'Garmin', rating: 4.6, image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&auto=format&fit=crop&q=60', stockQuantity: 48, stock: 48, status: 'Active' },
  { id: 61, title: 'FlexCore Eco-Friendly TPE Yoga Mat 6mm', name: 'FlexCore Eco-Friendly TPE Yoga Mat 6mm', price: 42.50, category: 'Fitness', subcategory: 'Gym Equipment', subcategorySlug: 'gym', brand: 'Decathlon', rating: 4.5, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=60', stockQuantity: 130, stock: 130, status: 'Active' },
  { id: 62, title: 'Pulse Speed Bearing Skipping Jump Rope', name: 'Pulse Speed Bearing Skipping Jump Rope', price: 19.99, category: 'Fitness', subcategory: 'Gym Equipment', subcategorySlug: 'gym', brand: 'Decathlon', rating: 4.4, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=60', stockQuantity: 190, stock: 190, status: 'Active' },
  { id: 63, title: 'TheraGun Deep Tissue Percussion Massager', name: 'TheraGun Deep Tissue Percussion Massager', price: 149.00, category: 'Fitness', subcategory: 'Gym Equipment', subcategorySlug: 'gym', brand: 'Garmin', rating: 4.8, image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&auto=format&fit=crop&q=60', stockQuantity: 70, stock: 70, status: 'Active' },
  { id: 64, title: 'HydroMax 1.5L Insulated Stainless Steel Bottle', name: 'HydroMax 1.5L Insulated Stainless Steel Bottle', price: 38.00, category: 'Fitness', subcategory: 'Sportswear', subcategorySlug: 'sportswear', brand: 'Nike', rating: 4.7, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=60', stockQuantity: 160, stock: 160, status: 'Active' },
  { id: 65, title: 'Ohio Olympic Power Bar', name: 'Ohio Olympic Power Bar', price: 349.00, category: 'Fitness', subcategory: 'Gym Equipment', subcategorySlug: 'gym', brand: 'Rogue', rating: 4.9, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80', stockQuantity: 30, stock: 30, status: 'Active' },

  // ── BEVERAGES (7 products) ─────────────────────────────────────────
  { id: 66, title: 'Terra Espresso Roast Artisan Coffee Beans (1kg)', name: 'Terra Espresso Roast Artisan Coffee Beans (1kg)', price: 32.50, category: 'Beverages', subcategory: 'Hot Drinks', subcategorySlug: 'hot', brand: 'Starbucks', rating: 4.9, image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=60', stockQuantity: 300, stock: 300, status: 'Active' },
  { id: 67, title: 'Organic Alpine Herbal Tea Reserve Selection', name: 'Organic Alpine Herbal Tea Reserve Selection', price: 24.00, category: 'Beverages', subcategory: 'Hot Drinks', subcategorySlug: 'hot', brand: 'Starbucks', rating: 4.8, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60', stockQuantity: 250, stock: 250, status: 'Active' },
  { id: 68, title: 'Matcha Ceremonial Grade (100g Tin)', name: 'Matcha Ceremonial Grade (100g Tin)', price: 42.00, category: 'Beverages', subcategory: 'Hot Drinks', subcategorySlug: 'hot', brand: 'Starbucks', rating: 4.9, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop&q=60', stockQuantity: 180, stock: 180, status: 'Active' },
  { id: 69, title: 'Artisan Cold Brew Coffee Concentrate (1L)', name: 'Artisan Cold Brew Coffee Concentrate (1L)', price: 18.99, category: 'Beverages', subcategory: 'Cold Drinks', subcategorySlug: 'cold', brand: 'Starbucks', rating: 4.7, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=60', stockQuantity: 140, stock: 140, status: 'Active' },
  { id: 70, title: 'Sparkling Botanical Adaptogen Tonic 12-Pack', name: 'Sparkling Botanical Adaptogen Tonic 12-Pack', price: 36.00, category: 'Beverages', subcategory: 'Cold Drinks', subcategorySlug: 'cold', brand: 'Starbucks', rating: 4.6, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=60', stockQuantity: 110, stock: 110, status: 'Active' },
  { id: 71, title: 'Golden Milk Turmeric Latte Blend (250g)', name: 'Golden Milk Turmeric Latte Blend (250g)', price: 22.50, category: 'Beverages', subcategory: 'Hot Drinks', subcategorySlug: 'hot', brand: 'Starbucks', rating: 4.5, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=60', stockQuantity: 150, stock: 150, status: 'Active' },
  { id: 72, title: 'Pure Cascara Coffee Cherry Tea (200g)', name: 'Pure Cascara Coffee Cherry Tea (200g)', price: 19.50, category: 'Beverages', subcategory: 'Hot Drinks', subcategorySlug: 'hot', brand: 'Starbucks', rating: 4.6, image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&auto=format&fit=crop&q=60', stockQuantity: 120, stock: 120, status: 'Active' },
];

function parseArray(raw: string | null): any[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Fire every event that components listen for. */
export function broadcastChange(): void {
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('productsUpdated'));
  window.dispatchEvent(new Event('tradehub:products-changed'));
  window.dispatchEvent(new Event('tradehub-storage-update'));
  window.dispatchEvent(new Event('tradehub_products_updated'));
  window.dispatchEvent(new CustomEvent('tradehub_products_updated'));
}

/** Read the full product list from localStorage. Never throws. */
export function getStoredProducts(): any[] {
  const raw = localStorage.getItem(PRODUCTS_KEY) ?? localStorage.getItem(LEGACY_KEY);
  const parsed = parseArray(raw);
  if (!raw || !parsed || parsed.length === 0) {
    saveStoredProducts(DEFAULT_SEED_PRODUCTS, false);
    return DEFAULT_SEED_PRODUCTS;
  }
  return parsed;
}

/** Get the soft-deleted product ID deny-list. */
export function getDeletedIds(): number[] {
  return parseArray(localStorage.getItem(DELETED_KEY)) as number[];
}

/**
 * Overwrite the full product list and keep both keys in sync.
 * @param list      The complete merged product list.
 * @param broadcast Set false to skip event dispatch (batch writes).
 */
export function saveStoredProducts(list: any[], broadcast = true): void {
  try {
    const json = JSON.stringify(list);
    localStorage.setItem(PRODUCTS_KEY, json);
    localStorage.setItem(LEGACY_KEY,   json);
  } catch (e) {
    console.error('[productStorage] Failed to save products:', e);
  }
  if (broadcast) broadcastChange();
}

/**
 * Seed ONLY if the key does not already exist or is completely empty.
 * Safe to call on every app start — never overwrites existing user/admin data.
 */
export function seedProductsIfEmpty(seedData?: any[]): void {
  const existing = localStorage.getItem(PRODUCTS_KEY) || localStorage.getItem(LEGACY_KEY);
  const parsed = parseArray(existing);
  if (!existing || !parsed || parsed.length === 0) {
    const listToSeed = (seedData && seedData.length > 0) ? seedData : DEFAULT_SEED_PRODUCTS;
    saveStoredProducts(listToSeed, false);
  }
}

/**
 * Upsert (add or update) a single product without touching any other products.
 * Broadcasts changes automatically.
 */
export function patchStoredProduct(product: any): void {
  const current = getStoredProducts();
  const idx = current.findIndex((p: any) => p.id === product.id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...product };
  } else {
    current.unshift(product);
  }
  saveStoredProducts(current);
}

/**
 * Remove a single product by ID and record it in the deleted-IDs deny-list.
 * Broadcasts changes automatically.
 */
export function removeStoredProduct(id: number): void {
  try {
    const deletedIds = getDeletedIds();
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds));
    }
  } catch {}
  const current = getStoredProducts().filter((p: any) => p.id !== id);
  saveStoredProducts(current);
}

/**
 * Merge API products into the stored list:
 *  - Vendor-added (non-API) products are preserved at the front.
 *  - API items update matching stored items, preserving stored categories.
 *  - Deleted IDs are excluded.
 * Returns the merged list WITHOUT writing to storage.
 */
export function mergeApiProducts(apiProducts: any[]): any[] {
  const deletedIds = getDeletedIds();
  const stored     = getStoredProducts();

  const storedMap  = new Map<number, any>(stored.map((p) => [p.id, p]));
  const apiIds     = new Set<number>(apiProducts.map((p) => p.id));

  for (const ap of apiProducts) {
    if (deletedIds.includes(ap.id)) continue;
    const existing = storedMap.get(ap.id);
    const mergedObj = existing ? { ...existing, ...ap } : ap;
    if (existing && existing.category) {
      mergedObj.category = existing.category;
    }
    storedMap.set(ap.id, mergedObj);
  }

  const vendorOnly = stored.filter(
    (p) => !apiIds.has(p.id) && !deletedIds.includes(p.id)
  );
  const fromApi = apiProducts
    .filter((p) => !deletedIds.includes(p.id))
    .map((p)    => storedMap.get(p.id) ?? p);

  return [...vendorOnly, ...fromApi];
}

/**
 * Blocklist of known corrupted / offensive product names injected via DevTools.
 * Case-insensitive exact-match against the `name` or `title` field.
 * Extend this list whenever a new offensive entry is discovered.
 */
const CORRUPTED_NAME_BLOCKLIST: RegExp[] = [
  /damasnik/i,
  /elllili/i,
];

/**
 * Remove any product whose name/title appears in the corrupted-name blocklist.
 * Runs at app boot to purge data injected via browser DevTools.
 * Safe to call multiple times — no-ops if nothing matches.
 */
export function sanitizeStoredProducts(): void {
  try {
    const current = getStoredProducts();
    const cleaned = current.filter((p: any) => {
      const productName: string = (p.name ?? p.title ?? '').toString();
      return !CORRUPTED_NAME_BLOCKLIST.some((rx) => rx.test(productName));
    });

    if (cleaned.length !== current.length) {
      const removed = current.length - cleaned.length;
      console.warn(
        `[productStorage] Sanitizer removed ${removed} corrupted product(s) from localStorage.`
      );
      saveStoredProducts(cleaned);
    }
  } catch (e) {
    console.error('[productStorage] sanitizeStoredProducts failed:', e);
  }
}
