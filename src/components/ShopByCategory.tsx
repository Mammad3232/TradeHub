import React, { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Tv, Shirt, Home as HomeIcon, BookOpen, Dumbbell, Coffee,
  Smartphone, Laptop, Headphones,
  User, UserCheck, Footprints, Watch,
  Armchair, Lightbulb, Soup, Bed,
  Sparkles, Brain, Smile,
  Flame, Activity, CupSoda, Zap, Milk,
  ArrowRight, CheckCircle2, ShoppingCart, Star,
} from 'lucide-react';

/* ─────────────────────────────────────────────────── Types */
interface SubGroup {
  id: string;
  name: string;
  icon: LucideIcon;
  brands: string[];
}

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: keyof typeof colorStyles;
  subGroups: SubGroup[];
}

interface MockProduct {
  id: number;
  categoryId: string;
  subGroupId: string;
  brand: string;
  name: string;
  price: number;
  rating: number;
}

/* ─────── Full static Tailwind strings — JIT-safe */
const colorStyles = {
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500',    active: 'bg-blue-500/20 border-l-blue-500'    },
  pink:    { bg: 'bg-pink-500/10',    text: 'text-pink-400',    border: 'border-pink-500',    active: 'bg-pink-500/20 border-l-pink-500'    },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500',   active: 'bg-amber-500/20 border-l-amber-500'  },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500', active: 'bg-emerald-500/20 border-l-emerald-500' },
  cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500',    active: 'bg-cyan-500/20 border-l-cyan-500'    },
  purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500',  active: 'bg-purple-500/20 border-l-purple-500' },
} as const;

/* ──────────────────────────────────────── Category Data (all 6) */
const categoriesData: Category[] = [
  {
    id: 'electronics', name: 'Electronics', icon: Tv, color: 'blue',
    subGroups: [
      { id: 'phones',     name: 'Phones & Tablets',   icon: Smartphone, brands: ['Apple', 'Samsung', 'Xiaomi'] },
      { id: 'laptops',    name: 'Computers & Laptops', icon: Laptop,     brands: ['Apple', 'Asus', 'Lenovo'] },
      { id: 'appliances', name: 'Home Appliances',     icon: Tv,         brands: ['LG', 'Bosch', 'Dyson'] },
      { id: 'audio',      name: 'Audio & Gadgets',     icon: Headphones, brands: ['Sony', 'JBL', 'Bose'] },
    ],
  },
  {
    id: 'fashion', name: 'Fashion', icon: Shirt, color: 'pink',
    subGroups: [
      { id: 'men',         name: "Men's Clothing",   icon: User,       brands: ['Zara', 'H&M', 'Massimo Dutti'] },
      { id: 'women',       name: "Women's Clothing", icon: UserCheck,  brands: ['Mango', 'Zara', 'Bershka'] },
      { id: 'shoes',       name: 'Shoes & Sneakers', icon: Footprints, brands: ['Nike', 'Adidas', 'Puma'] },
      { id: 'accessories', name: 'Accessories',      icon: Watch,      brands: ['Casio', 'Ray-Ban', 'Swarovski'] },
    ],
  },
  {
    id: 'home', name: 'Home Decor', icon: HomeIcon, color: 'amber',
    subGroups: [
      { id: 'furniture', name: 'Furniture',          icon: Armchair,  brands: ['IKEA', 'JYSK', 'Ashley'] },
      { id: 'lighting',  name: 'Lighting',            icon: Lightbulb, brands: ['Philips', 'Osram', 'Eglo'] },
      { id: 'kitchen',   name: 'Kitchenware',         icon: Soup,      brands: ['Tefal', 'Karaca', 'Zwilling'] },
      { id: 'textiles',  name: 'Textiles & Bedding',  icon: Bed,       brands: ['English Home', 'Madame Coco', 'Tac'] },
    ],
  },
  {
    id: 'books', name: 'Books', icon: BookOpen, color: 'emerald',
    subGroups: [
      { id: 'fiction',  name: 'Fiction & Novels',    icon: BookOpen, brands: ['Penguin', 'HarperCollins', 'Random House'] },
      { id: 'scifi',    name: 'Sci-Fi & Fantasy',    icon: Sparkles, brands: ['Tor Books', 'Del Rey', 'Orbit'] },
      { id: 'personal', name: 'Personal Dev.',       icon: Brain,    brands: ['Portfolio', 'Hay House', 'Crown'] },
      { id: 'kids',     name: 'Kids Books',          icon: Smile,    brands: ['Scholastic', 'Disney', 'DK'] },
    ],
  },
  {
    id: 'fitness', name: 'Fitness', icon: Dumbbell, color: 'cyan',
    subGroups: [
      { id: 'gym',         name: 'Gym Equipment',   icon: Dumbbell, brands: ['Rogue', 'Bowflex', 'Decathlon'] },
      { id: 'sportswear',  name: 'Sportswear',      icon: Shirt,    brands: ['Nike', 'Adidas', 'Gymshark'] },
      { id: 'supplements', name: 'Supplements',     icon: Flame,    brands: ['Optimum Nutrition', 'Myprotein', 'BSN'] },
      { id: 'wearables',   name: 'Smart Wearables', icon: Activity, brands: ['Garmin', 'Fitbit', 'Apple Watch'] },
    ],
  },
  {
    id: 'beverages', name: 'Beverages', icon: Coffee, color: 'purple',
    subGroups: [
      { id: 'hot',     name: 'Hot Drinks',      icon: Coffee,  brands: ['Starbucks', 'Nescafé', 'Lipton'] },
      { id: 'cold',    name: 'Cold Drinks',     icon: CupSoda, brands: ['Coca-Cola', 'Pepsi', 'Fanta'] },
      { id: 'energy',  name: 'Energy & Sports', icon: Zap,     brands: ['Red Bull', 'Monster', 'Gatorade'] },
      { id: 'organic', name: 'Organic Juices',  icon: Milk,    brands: ['Innocent', 'Tropicana', 'Naked'] },
    ],
  },
];

/* ─────────────────────────────── Mock Product Database */
const mockProducts: MockProduct[] = [
  // Electronics — Phones
  { id: 1,  categoryId: 'electronics', subGroupId: 'phones',      brand: 'Apple',               name: 'iPhone 15 Pro Max',       price: 1199,  rating: 4.9 },
  { id: 2,  categoryId: 'electronics', subGroupId: 'phones',      brand: 'Samsung',             name: 'Galaxy S24 Ultra',        price: 1299,  rating: 4.8 },
  { id: 3,  categoryId: 'electronics', subGroupId: 'phones',      brand: 'Xiaomi',              name: 'Xiaomi 14 Pro',           price: 899,   rating: 4.5 },
  { id: 4,  categoryId: 'electronics', subGroupId: 'phones',      brand: 'Apple',               name: 'iPad Pro 12.9"',          price: 1099,  rating: 4.9 },
  // Electronics — Laptops
  { id: 5,  categoryId: 'electronics', subGroupId: 'laptops',     brand: 'Apple',               name: 'MacBook Pro M3',          price: 1599,  rating: 5.0 },
  { id: 6,  categoryId: 'electronics', subGroupId: 'laptops',     brand: 'Asus',                name: 'ROG Zephyrus G14',        price: 1499,  rating: 4.7 },
  { id: 7,  categoryId: 'electronics', subGroupId: 'laptops',     brand: 'Lenovo',              name: 'ThinkPad X1 Carbon',      price: 1349,  rating: 4.6 },
  // Electronics — Audio
  { id: 8,  categoryId: 'electronics', subGroupId: 'audio',       brand: 'Sony',                name: 'WH-1000XM5',              price: 349,   rating: 4.8 },
  { id: 9,  categoryId: 'electronics', subGroupId: 'audio',       brand: 'Bose',                name: 'QuietComfort Ultra',      price: 429,   rating: 4.7 },
  { id: 10, categoryId: 'electronics', subGroupId: 'audio',       brand: 'JBL',                 name: 'JBL Charge 5',            price: 179,   rating: 4.5 },
  // Electronics — Appliances
  { id: 11, categoryId: 'electronics', subGroupId: 'appliances',  brand: 'Dyson',               name: 'Dyson V15 Detect',        price: 749,   rating: 4.9 },
  { id: 12, categoryId: 'electronics', subGroupId: 'appliances',  brand: 'LG',                  name: 'LG OLED 65" C3',          price: 1799,  rating: 4.8 },
  // Fashion — Men
  { id: 13, categoryId: 'fashion',     subGroupId: 'men',         brand: 'Zara',                name: 'Slim Fit Chino',          price: 49.99, rating: 4.3 },
  { id: 14, categoryId: 'fashion',     subGroupId: 'men',         brand: 'H&M',                 name: 'Linen Blend Shirt',       price: 29.99, rating: 4.1 },
  { id: 15, categoryId: 'fashion',     subGroupId: 'men',         brand: 'Massimo Dutti',       name: 'Wool Overcoat',           price: 299,   rating: 4.7 },
  // Fashion — Shoes
  { id: 16, categoryId: 'fashion',     subGroupId: 'shoes',       brand: 'Nike',                name: 'Air Max 270',             price: 150,   rating: 4.6 },
  { id: 17, categoryId: 'fashion',     subGroupId: 'shoes',       brand: 'Adidas',              name: 'Ultraboost 23',           price: 180,   rating: 4.7 },
  { id: 18, categoryId: 'fashion',     subGroupId: 'shoes',       brand: 'Puma',                name: 'Suede Classic XXI',       price: 89,    rating: 4.4 },
  // Home Decor — Furniture
  { id: 19, categoryId: 'home',        subGroupId: 'furniture',   brand: 'IKEA',                name: 'KALLAX Shelf Unit',       price: 139,   rating: 4.4 },
  { id: 20, categoryId: 'home',        subGroupId: 'furniture',   brand: 'JYSK',                name: 'Rocking Chair VAMDRUP',   price: 249,   rating: 4.2 },
  // Home Decor — Kitchen
  { id: 21, categoryId: 'home',        subGroupId: 'kitchen',     brand: 'Tefal',               name: 'Ingenio Expertise Set',   price: 99,    rating: 4.5 },
  { id: 22, categoryId: 'home',        subGroupId: 'kitchen',     brand: 'Karaca',              name: 'Biogranit Pan 28cm',      price: 59,    rating: 4.3 },
  // Books — Fiction
  { id: 23, categoryId: 'books',       subGroupId: 'fiction',     brand: 'Penguin',             name: 'The Midnight Library',    price: 14.99, rating: 4.6 },
  { id: 24, categoryId: 'books',       subGroupId: 'fiction',     brand: 'HarperCollins',       name: 'The Alchemist',           price: 10.99, rating: 4.8 },
  { id: 25, categoryId: 'books',       subGroupId: 'fiction',     brand: 'Random House',        name: 'Normal People',           price: 12.99, rating: 4.5 },
  // Books — Sci-Fi
  { id: 26, categoryId: 'books',       subGroupId: 'scifi',       brand: 'Tor Books',           name: 'Dune Deluxe Edition',     price: 24.99, rating: 4.9 },
  { id: 27, categoryId: 'books',       subGroupId: 'scifi',       brand: 'Del Rey',             name: "Ender's Game",            price: 12.99, rating: 4.8 },
  // Fitness — Gym
  { id: 28, categoryId: 'fitness',     subGroupId: 'gym',         brand: 'Rogue',               name: 'Ohio Power Bar',          price: 349,   rating: 4.9 },
  { id: 29, categoryId: 'fitness',     subGroupId: 'gym',         brand: 'Bowflex',             name: 'SelectTech 552 Dumbbells',price: 429,   rating: 4.7 },
  { id: 30, categoryId: 'fitness',     subGroupId: 'gym',         brand: 'Decathlon',           name: 'Resistance Band Set',     price: 29,    rating: 4.3 },
  // Fitness — Sportswear
  { id: 31, categoryId: 'fitness',     subGroupId: 'sportswear',  brand: 'Nike',                name: 'Dri-FIT Training Tee',    price: 35,    rating: 4.5 },
  { id: 32, categoryId: 'fitness',     subGroupId: 'sportswear',  brand: 'Gymshark',            name: 'Vital Seamless Leggings', price: 55,    rating: 4.7 },
  // Beverages — Hot Drinks
  { id: 33, categoryId: 'beverages',   subGroupId: 'hot',         brand: 'Starbucks',           name: 'Pike Place Roast 500g',   price: 19.99, rating: 4.6 },
  { id: 34, categoryId: 'beverages',   subGroupId: 'hot',         brand: 'Nescafé',             name: 'Gold Blend 200g',         price: 9.99,  rating: 4.4 },
  // Beverages — Energy
  { id: 35, categoryId: 'beverages',   subGroupId: 'energy',      brand: 'Red Bull',            name: 'Red Bull 24-Pack',        price: 34.99, rating: 4.8 },
  { id: 36, categoryId: 'beverages',   subGroupId: 'energy',      brand: 'Monster',             name: 'Monster Original 12-Pack',price: 24.99, rating: 4.6 },
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
  const [activeSubGroup, setActiveSubGroup] = useState<string | null>(null);
  const [activeBrand, setActiveBrand]       = useState<string>('All');

  // Derive active category object from prop string
  const activeCategory: Category | null =
    categoriesData.find(
      (c) => c.name.toLowerCase() === selectedCategory?.toLowerCase()
    ) ?? null;

  // Auto-select first sub-group when category changes
  useEffect(() => {
    if (activeCategory) {
      setActiveSubGroup(activeCategory.subGroups[0].id);
      setActiveBrand('All');
    } else {
      setActiveSubGroup(null);
      setActiveBrand('All');
    }
  }, [activeCategory?.id]);

  const handleCategoryClick = (category: Category) => {
    if (activeCategory?.id === category.id) {
      onSelectCategory(null);
    } else {
      onSelectCategory(category.name);
    }
  };

  const currentSubGroupData =
    activeCategory?.subGroups.find((s) => s.id === activeSubGroup) ?? null;

  const currentColors =
    activeCategory ? colorStyles[activeCategory.color] : colorStyles.blue;

  // Live filtering logic
  const filteredProducts = mockProducts.filter((p) => {
    const matchCategory = p.categoryId === activeCategory?.id;
    const matchSubGroup = p.subGroupId === activeSubGroup;
    const matchBrand    = activeBrand === 'All' || p.brand === activeBrand;
    return matchCategory && matchSubGroup && matchBrand;
  });

  return (
    <section className="w-full py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              Explore Categories
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              Discover millions of products from top brands tailored just for you.
            </p>
          </div>
        </div>

        {/* ── Level 1: Main Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoriesData.map((category) => {
            const Icon    = category.icon;
            const isActive = activeCategory?.id === category.id;
            const style   = colorStyles[category.color];

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
                    ? `${style.border} shadow-lg bg-[#0B1120]`
                    : 'border-slate-800 bg-[#0B1120] hover:border-slate-600',
                ].join(' ')}
              >
                <div className={[
                  'w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors',
                  isActive ? style.bg : 'bg-slate-800 group-hover:bg-slate-700',
                ].join(' ')}>
                  <Icon className={[
                    'w-7 h-7',
                    isActive ? style.text : 'text-slate-400 group-hover:text-white',
                  ].join(' ')} />
                </div>
                <span className={[
                  'font-semibold text-sm',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200',
                ].join(' ')}>
                  {category.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Level 2 + 3: Split-Pane Panel */}
        {activeCategory && (
          <div className="bg-[#0B1120] border border-slate-800 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">

            {/* LEFT: Vertical Sub-Category Menu */}
            <div className="w-full md:w-1/4 bg-[#111827] border-b md:border-b-0 md:border-r border-slate-800 p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                Departments
              </h3>
              <div className="flex flex-col gap-2">
                {activeCategory.subGroups.map((sub) => {
                  const SubIcon   = sub.icon;
                  const isSubActive = activeSubGroup === sub.id;

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => { setActiveSubGroup(sub.id); setActiveBrand('All'); }}
                      className={[
                        'flex items-center justify-between p-3 rounded-lg transition-all text-left border-l-4',
                        isSubActive
                          ? `${currentColors.active} text-white`
                          : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3">
                        <SubIcon className={`w-5 h-5 ${isSubActive ? currentColors.text : 'text-slate-500'}`} />
                        <span className="font-medium text-sm">{sub.name}</span>
                      </div>
                      {isSubActive && (
                        <ArrowRight className={`w-4 h-4 flex-shrink-0 ${currentColors.text}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Brand Filters + Live Product Grid */}
            {currentSubGroupData && (() => {
              const SubIcon = currentSubGroupData.icon;
              return (
                <div className="w-full md:w-3/4 p-6 flex flex-col min-h-[400px]">

                  {/* Brand Filter Pills */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button
                      type="button"
                      onClick={() => setActiveBrand('All')}
                      className={[
                        'px-4 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer',
                        activeBrand === 'All'
                          ? 'border-slate-400 bg-slate-800 text-white'
                          : 'border-slate-800 bg-[#151C2C] text-slate-400 hover:border-slate-600',
                      ].join(' ')}
                    >
                      All Brands
                      {activeBrand === 'All' && (
                        <CheckCircle2 className="inline-block ml-1.5 w-3 h-3 text-slate-400" />
                      )}
                    </button>

                    {currentSubGroupData.brands.map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => setActiveBrand(brand)}
                        className={[
                          'px-4 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer',
                          activeBrand === brand
                            ? `${currentColors.border} bg-slate-800 text-white`
                            : 'border-slate-800 bg-[#151C2C] text-slate-400 hover:border-slate-600',
                        ].join(' ')}
                      >
                        {brand}
                        {activeBrand === brand && (
                          <CheckCircle2 className={`inline-block ml-1.5 w-3 h-3 ${currentColors.text}`} />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Live Product Results */}
                  <div className="bg-[#060913] rounded-2xl p-4 flex-1 border border-slate-800/50">
                    <h4 className="text-slate-400 text-sm font-medium mb-4">
                      Showing{' '}
                      <span className="text-white font-bold">{filteredProducts.length}</span>{' '}
                      products for{' '}
                      {activeBrand !== 'All' ? activeBrand : currentSubGroupData.name}
                    </h4>

                    {filteredProducts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="bg-[#111827] border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-colors group cursor-pointer"
                          >
                            {/* Product Image Placeholder */}
                            <div className="w-full h-32 bg-[#1C2438] rounded-lg mb-3 flex items-center justify-center group-hover:bg-[#252D41] transition-colors">
                              <SubIcon className="w-10 h-10 text-slate-500 opacity-50" />
                            </div>

                            <div className="text-xs text-slate-500 mb-1">{product.brand}</div>
                            <h5 className="text-white font-semibold text-sm mb-3 truncate">
                              {product.name}
                            </h5>

                            <div className="flex items-center justify-between">
                              <span className="text-amber-400 font-bold">${product.price}</span>
                              <div className="flex items-center gap-1 text-slate-400 text-xs">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                {product.rating}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-2">
                        <ShoppingCart className="w-10 h-10 opacity-20" />
                        <p className="text-sm">No products found for this selection.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>
        )}

      </div>
    </section>
  );
};
