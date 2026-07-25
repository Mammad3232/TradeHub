import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Tv, Shirt, Home as HomeIcon, BookOpen, Dumbbell, Coffee,
  Smartphone, Laptop, Headphones,
  User, UserCheck, Footprints, Watch,
  Armchair, Lightbulb, Soup, Bed,
  Sparkles, Brain, Smile,
  Flame, Activity, CupSoda, Zap, Milk,
  Layers,
} from 'lucide-react';

/* ─────────────────────────────────────────────────── Types */
export interface SubGroup {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: keyof typeof colorStyles;
  subGroups: SubGroup[];
}

export interface ProductCatalogItem {
  id: number;
  categoryId: string;
  subGroupId: string;
  brand: string;
  name: string;
  price: number;
  rating: number;
  image: string;
}

/* ─────── Full static Tailwind strings — JIT-safe */
export const colorStyles = {
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500',    active: 'bg-blue-500/20 border-blue-500',    glow: 'shadow-[0_0_24px_rgba(59,130,246,0.45)]'    },
  pink:    { bg: 'bg-pink-500/10',    text: 'text-pink-400',    border: 'border-pink-500',    active: 'bg-pink-500/20 border-pink-500',    glow: 'shadow-[0_0_24px_rgba(236,72,153,0.45)]'    },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500',   active: 'bg-amber-500/20 border-amber-500',   glow: 'shadow-[0_0_24px_rgba(245,158,11,0.45)]'   },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500', active: 'bg-emerald-500/20 border-emerald-500', glow: 'shadow-[0_0_24px_rgba(16,185,129,0.45)]' },
  cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500',    active: 'bg-cyan-500/20 border-cyan-500',    glow: 'shadow-[0_0_24px_rgba(6,182,212,0.45)]'     },
  purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500',  active: 'bg-purple-500/20 border-purple-500',  glow: 'shadow-[0_0_24px_rgba(168,85,247,0.45)]'  },
} as const;

/* ──────────────────────────────────────── Category Data (all 6) */
export const categoriesData: Category[] = [
  {
    id: 'electronics', name: 'Electronics', icon: Tv, color: 'blue',
    subGroups: [
      { id: 'phones',     name: 'Phones & Tablets',   icon: Smartphone },
      { id: 'laptops',    name: 'Computers & Laptops', icon: Laptop     },
      { id: 'appliances', name: 'Home Appliances',     icon: Tv         },
      { id: 'audio',      name: 'Audio & Gadgets',     icon: Headphones },
    ],
  },
  {
    id: 'fashion', name: 'Fashion', icon: Shirt, color: 'pink',
    subGroups: [
      { id: 'men',         name: "Men's Clothing",   icon: User       },
      { id: 'women',       name: "Women's Clothing", icon: UserCheck  },
      { id: 'shoes',       name: 'Shoes & Sneakers', icon: Footprints },
      { id: 'accessories', name: 'Accessories',      icon: Watch      },
    ],
  },
  {
    id: 'home', name: 'Home Decor', icon: HomeIcon, color: 'amber',
    subGroups: [
      { id: 'furniture', name: 'Furniture',         icon: Armchair  },
      { id: 'lighting',  name: 'Lighting',           icon: Lightbulb },
      { id: 'kitchen',   name: 'Kitchenware',        icon: Soup      },
      { id: 'textiles',  name: 'Textiles & Bedding', icon: Bed       },
    ],
  },
  {
    id: 'books', name: 'Books', icon: BookOpen, color: 'emerald',
    subGroups: [
      { id: 'fiction',  name: 'Fiction & Novels',  icon: BookOpen },
      { id: 'scifi',    name: 'Sci-Fi & Fantasy',  icon: Sparkles },
      { id: 'personal', name: 'Personal Dev.',     icon: Brain    },
      { id: 'kids',     name: 'Kids Books',        icon: Smile    },
    ],
  },
  {
    id: 'fitness', name: 'Fitness', icon: Dumbbell, color: 'cyan',
    subGroups: [
      { id: 'gym',         name: 'Gym Equipment',  icon: Dumbbell },
      { id: 'sportswear',  name: 'Sportswear',     icon: Shirt    },
      { id: 'supplements', name: 'Supplements',    icon: Flame    },
      { id: 'wearables',   name: 'Smart Wearables',icon: Activity },
    ],
  },
  {
    id: 'beverages', name: 'Beverages', icon: Coffee, color: 'purple',
    subGroups: [
      { id: 'hot',     name: 'Hot Drinks',      icon: Coffee  },
      { id: 'cold',    name: 'Cold Drinks',     icon: CupSoda },
      { id: 'energy',  name: 'Energy & Sports', icon: Zap     },
      { id: 'organic', name: 'Organic Juices',  icon: Milk    },
    ],
  },
];

/* ──────────────────────────────────────── Robust Category Lookup Helpers */
export const findCategory = (query?: string | null): Category | null => {
  if (!query) return null;
  const q = query.toLowerCase().trim();
  return (
    categoriesData.find(
      (c) =>
        c.id.toLowerCase() === q ||
        c.name.toLowerCase() === q ||
        c.id.toLowerCase().includes(q) ||
        q.includes(c.id.toLowerCase())
    ) ?? null
  );
};

export const findSubcategory = (category: Category | null, query?: string | null): SubGroup | null => {
  if (!category || !query) return null;
  const q = query.toLowerCase().trim();
  return (
    category.subGroups.find(
      (s) =>
        s.id.toLowerCase() === q ||
        s.name.toLowerCase() === q ||
        s.id.toLowerCase().includes(q) ||
        q.includes(s.id.toLowerCase())
    ) ?? null
  );
};

/* ─────────────────────────────────────── Full Product Catalog Data */
export const mockCatalogProducts: ProductCatalogItem[] = [
  // Electronics — Phones
  { id: 1,  categoryId: 'electronics', subGroupId: 'phones',      brand: 'Apple',         name: 'iPhone 15 Pro Max',        price: 1199,  rating: 4.9, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80' },
  { id: 2,  categoryId: 'electronics', subGroupId: 'phones',      brand: 'Samsung',       name: 'Galaxy S24 Ultra',         price: 1299,  rating: 4.8, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80' },
  { id: 3,  categoryId: 'electronics', subGroupId: 'phones',      brand: 'Xiaomi',        name: 'Xiaomi 14 Pro',            price: 899,   rating: 4.5, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80' },
  { id: 4,  categoryId: 'electronics', subGroupId: 'phones',      brand: 'Apple',         name: 'iPad Pro 12.9"',           price: 1099,  rating: 4.9, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80' },
  // Electronics — Laptops
  { id: 5,  categoryId: 'electronics', subGroupId: 'laptops',     brand: 'Apple',         name: 'MacBook Pro M3',           price: 1599,  rating: 5.0, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80' },
  { id: 6,  categoryId: 'electronics', subGroupId: 'laptops',     brand: 'Asus',          name: 'ROG Zephyrus G14',         price: 1499,  rating: 4.7, image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format&fit=crop&q=80' },
  { id: 7,  categoryId: 'electronics', subGroupId: 'laptops',     brand: 'Lenovo',        name: 'ThinkPad X1 Carbon',       price: 1349,  rating: 4.6, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80' },
  // Electronics — Audio
  { id: 8,  categoryId: 'electronics', subGroupId: 'audio',       brand: 'Sony',          name: 'WH-1000XM5 Headphones',    price: 349,   rating: 4.8, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
  { id: 9,  categoryId: 'electronics', subGroupId: 'audio',       brand: 'Bose',          name: 'QuietComfort Ultra',       price: 429,   rating: 4.7, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80' },
  { id: 10, categoryId: 'electronics', subGroupId: 'audio',       brand: 'JBL',           name: 'JBL Charge 5 Speaker',     price: 179,   rating: 4.5, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80' },
  // Electronics — Appliances
  { id: 11, categoryId: 'electronics', subGroupId: 'appliances',  brand: 'Dyson',         name: 'Dyson V15 Detect Vacuum',  price: 749,   rating: 4.9, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80' },
  { id: 12, categoryId: 'electronics', subGroupId: 'appliances',  brand: 'LG',            name: 'LG OLED 65" C3 Smart TV',  price: 1799,  rating: 4.8, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834b?w=600&auto=format&fit=crop&q=80' },
  // Fashion — Men
  { id: 13, categoryId: 'fashion',     subGroupId: 'men',         brand: 'Zara',          name: 'Slim Fit Tailored Chino',  price: 49.99, rating: 4.3, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80' },
  { id: 14, categoryId: 'fashion',     subGroupId: 'men',         brand: 'H&M',           name: 'Linen Blend Casual Shirt', price: 29.99, rating: 4.1, image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80' },
  { id: 15, categoryId: 'fashion',     subGroupId: 'men',         brand: 'Massimo Dutti', name: 'Italian Wool Overcoat',    price: 299,   rating: 4.7, image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&auto=format&fit=crop&q=80' },
  // Fashion — Women
  { id: 16, categoryId: 'fashion',     subGroupId: 'women',       brand: 'Mango',         name: 'Satin Wrap Midi Dress',    price: 79.99, rating: 4.5, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80' },
  { id: 17, categoryId: 'fashion',     subGroupId: 'women',       brand: 'Zara',          name: 'Ribbed Knit Turtleneck',   price: 45.99, rating: 4.4, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80' },
  // Fashion — Shoes
  { id: 18, categoryId: 'fashion',     subGroupId: 'shoes',       brand: 'Nike',          name: 'Air Max 270 Sneakers',     price: 150,   rating: 4.6, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80' },
  { id: 19, categoryId: 'fashion',     subGroupId: 'shoes',       brand: 'Adidas',        name: 'Ultraboost 23 Runners',    price: 180,   rating: 4.7, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80' },
  { id: 20, categoryId: 'fashion',     subGroupId: 'shoes',       brand: 'Puma',          name: 'Suede Classic XXI Shoes',  price: 89,    rating: 4.4, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80' },
  // Fashion — Accessories
  { id: 21, categoryId: 'fashion',     subGroupId: 'accessories',  brand: 'Casio',        name: 'G-Shock GA-2100 Watch',    price: 99,    rating: 4.6, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' },
  // Home Decor — Furniture
  { id: 22, categoryId: 'home',        subGroupId: 'furniture',   brand: 'IKEA',          name: 'KALLAX Shelf Unit',        price: 139,   rating: 4.4, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80' },
  { id: 23, categoryId: 'home',        subGroupId: 'furniture',   brand: 'JYSK',          name: 'Rocking Chair VAMDRUP',    price: 249,   rating: 4.2, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop&q=80' },
  // Home Decor — Lighting
  { id: 24, categoryId: 'home',        subGroupId: 'lighting',    brand: 'Philips',       name: 'Hue Play Light Bar Pair',  price: 79,    rating: 4.7, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80' },
  { id: 25, categoryId: 'home',        subGroupId: 'lighting',    brand: 'Osram',         name: 'Smart+ LED Ambient Bulb',  price: 24,    rating: 4.3, image: 'https://images.unsplash.com/photo-1513506003901-1e6a35068d4d?w=600&auto=format&fit=crop&q=80' },
  // Home Decor — Kitchen
  { id: 26, categoryId: 'home',        subGroupId: 'kitchen',     brand: 'Tefal',         name: 'Ingenio Cookware Set',     price: 99,    rating: 4.5, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop&q=80' },
  { id: 27, categoryId: 'home',        subGroupId: 'kitchen',     brand: 'Karaca',        name: 'Biogranit Frying Pan',     price: 59,    rating: 4.3, image: 'https://images.unsplash.com/photo-1584990347449-a2d4c2c044bf?w=600&auto=format&fit=crop&q=80' },
  // Home Decor — Textiles
  { id: 28, categoryId: 'home',        subGroupId: 'textiles',    brand: 'English Home',  name: 'Velvet Soft Throw Blanket',price: 45,    rating: 4.5, image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&auto=format&fit=crop&q=80' },
  // Books — Fiction
  { id: 29, categoryId: 'books',       subGroupId: 'fiction',     brand: 'Penguin Books', name: 'The Midnight Library',     price: 14.99, rating: 4.6, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80' },
  { id: 30, categoryId: 'books',       subGroupId: 'fiction',     brand: 'HarperCollins', name: 'The Alchemist Hardcover',  price: 10.99, rating: 4.8, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80' },
  { id: 31, categoryId: 'books',       subGroupId: 'fiction',     brand: 'Random House',  name: 'Normal People Novel',      price: 12.99, rating: 4.5, image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80' },
  // Books — Sci-Fi
  { id: 32, categoryId: 'books',       subGroupId: 'scifi',       brand: 'Tor Books',     name: 'Dune Deluxe Hardcover',    price: 24.99, rating: 4.9, image: 'https://images.unsplash.com/photo-1608431793807-630028240b9b?w=600&auto=format&fit=crop&q=80' },
  { id: 33, categoryId: 'books',       subGroupId: 'scifi',       brand: 'Del Rey',       name: "Ender's Game Special Ed.", price: 12.99, rating: 4.8, image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80' },
  // Books — Personal Dev
  { id: 34, categoryId: 'books',       subGroupId: 'personal',    brand: 'Portfolio',     name: 'Atomic Habits Hardcover',  price: 17.99, rating: 4.9, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80' },
  { id: 35, categoryId: 'books',       subGroupId: 'personal',    brand: "O'Reilly Media",name: 'Clean Code Craftsmanship',  price: 44.99, rating: 4.8, image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&auto=format&fit=crop&q=80' },
  // Fitness — Gym
  { id: 36, categoryId: 'fitness',     subGroupId: 'gym',         brand: 'Rogue',         name: 'Ohio Olympic Power Bar',   price: 349,   rating: 4.9, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80' },
  { id: 37, categoryId: 'fitness',     subGroupId: 'gym',         brand: 'Bowflex',       name: 'SelectTech 552 Dumbbells', price: 429,   rating: 4.7, image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&auto=format&fit=crop&q=80' },
  { id: 38, categoryId: 'fitness',     subGroupId: 'gym',         brand: 'Decathlon',     name: 'Heavy Resistance Band Set',price: 29,    rating: 4.3, image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&auto=format&fit=crop&q=80' },
  // Fitness — Sportswear
  { id: 39, categoryId: 'fitness',     subGroupId: 'sportswear',  brand: 'Nike',          name: 'Dri-FIT Pro Training Tee', price: 35,    rating: 4.5, image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80' },
  { id: 40, categoryId: 'fitness',     subGroupId: 'sportswear',  brand: 'Gymshark',      name: 'Vital Seamless Leggings',  price: 55,    rating: 4.7, image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80' },
  // Fitness — Wearables
  { id: 41, categoryId: 'fitness',     subGroupId: 'wearables',   brand: 'Garmin',        name: 'Forerunner 955 Solar Watch',price: 499,  rating: 4.8, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80' },
  // Beverages — Hot Drinks
  { id: 42, categoryId: 'beverages',   subGroupId: 'hot',         brand: 'Starbucks',     name: 'Pike Place Roast Whole Bean',price: 19.99, rating: 4.6, image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop&q=80' },
  { id: 43, categoryId: 'beverages',   subGroupId: 'hot',         brand: 'Nescafé',       name: 'Gold Blend Instant Coffee',price: 9.99,  rating: 4.4, image: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=600&auto=format&fit=crop&q=80' },
  // Beverages — Cold
  { id: 44, categoryId: 'beverages',   subGroupId: 'cold',        brand: 'Coca-Cola',     name: 'Coca-Cola Zero Sugar 24-Can',price: 14.99, rating: 4.5, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&auto=format&fit=crop&q=80' },
  { id: 45, categoryId: 'beverages',   subGroupId: 'cold',        brand: 'Pepsi',         name: 'Pepsi Max Zero 24-Can Pack', price: 13.99, rating: 4.4, image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&auto=format&fit=crop&q=80' },
  // Beverages — Energy
  { id: 46, categoryId: 'beverages',   subGroupId: 'energy',      brand: 'Red Bull',      name: 'Red Bull Energy 24-Pack',  price: 34.99, rating: 4.8, image: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=600&auto=format&fit=crop&q=80' },
  { id: 47, categoryId: 'beverages',   subGroupId: 'energy',      brand: 'Monster',       name: 'Monster Energy 12-Pack',   price: 24.99, rating: 4.6, image: 'https://images.unsplash.com/photo-1567103472667-6898f3a79cf2?w=600&auto=format&fit=crop&q=80' },
];

/* ─────────────────────────────────────────── Props */
interface ShopByCategoryProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

/* ──────────────────────────────────────── Component */
export const ShopByCategory: React.FC<ShopByCategoryProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const activeCategoryObj = findCategory(selectedCategory);

  const handleCategoryClick = (category: Category) => {
    if (activeCategoryObj?.id === category.id) {
      // Toggle off — deselect category
      onSelectCategory(null);
    } else {
      onSelectCategory(category.id);
    }
  };

  return (
    <section className="w-full py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Explore Categories</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Browse Marketplace
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-1">
              Select a category to explore departments and discover products from top brands.
            </p>
          </div>
        </div>

        {/* ── LEVEL 1: Main Category Cards (Top Row) ────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoriesData.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategoryObj?.id === category.id;
            const style = colorStyles[category.color];

            return (
              <div
                key={category.id}
                role="button"
                tabIndex={0}
                onClick={() => handleCategoryClick(category)}
                onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(category)}
                className={[
                  'group flex flex-col items-center justify-center p-6 rounded-2xl border',
                  'cursor-pointer transition-all duration-300 hover:-translate-y-1 select-none',
                  isActive
                    ? `${style.border} ${style.glow} -translate-y-1 scale-[1.03] bg-[#0B1120]`
                    : 'border-slate-800/80 bg-[#0B1120] hover:border-slate-600',
                ].join(' ')}
              >
                <div
                  className={[
                    'w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors',
                    isActive ? style.bg : 'bg-slate-800 group-hover:bg-slate-700',
                  ].join(' ')}
                >
                  <Icon
                    className={[
                      'w-7 h-7',
                      isActive ? style.text : 'text-slate-400 group-hover:text-white',
                    ].join(' ')}
                  />
                </div>
                <span
                  className={[
                    'font-semibold text-sm',
                    isActive ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200',
                  ].join(' ')}
                >
                  {category.name}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
