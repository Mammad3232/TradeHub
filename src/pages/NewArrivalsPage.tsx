import React, { useState } from 'react';
import { ShoppingCart, Star, Sparkles, SlidersHorizontal, Check } from 'lucide-react';

interface NewProduct {
  id: number;
  title: string;
  price: number;
  rating: number;
  reviewsCount: number;
  image: string;
  category: string;
  dateAdded: string; // for sorting
  popularity: number; // for sorting
}

const mockNewArrivals: NewProduct[] = [
  {
    id: 201,
    title: 'Aether Sound Wave Wireless Headphones',
    price: 299.99,
    rating: 4.9,
    reviewsCount: 184,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    category: 'Electronics',
    dateAdded: '2026-07-15',
    popularity: 92,
  },
  {
    id: 202,
    title: 'Chronos Classic Minimalist Watch',
    price: 189.50,
    rating: 4.8,
    reviewsCount: 120,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    category: 'Accessories',
    dateAdded: '2026-07-14',
    popularity: 88,
  },
  {
    id: 203,
    title: 'Apex Leather Laptop Backpack',
    price: 120.00,
    rating: 4.7,
    reviewsCount: 95,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
    category: 'Bags',
    dateAdded: '2026-07-16',
    popularity: 76,
  },
  {
    id: 204,
    title: 'Zenith Pro Ergo Mouse',
    price: 89.99,
    rating: 4.6,
    reviewsCount: 38,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80',
    category: 'Electronics',
    dateAdded: '2026-07-13',
    popularity: 64,
  },
  {
    id: 205,
    title: 'Nomad Premium Hydration Flask',
    price: 45.00,
    rating: 4.9,
    reviewsCount: 154,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80',
    category: 'Accessories',
    dateAdded: '2026-07-12',
    popularity: 95,
  },
  {
    id: 206,
    title: 'Aura Smart Ambient Lightbar',
    price: 135.00,
    rating: 4.8,
    reviewsCount: 62,
    image: 'https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=500&auto=format&fit=crop&q=80',
    category: 'Electronics',
    dateAdded: '2026-07-11',
    popularity: 81,
  },
];

export const NewArrivalsPage: React.FC = () => {
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [addedItems, setAddedItems] = useState<number[]>([]);

  // ── Sort Logic ───────────────────────────────────────────────
  const sortedProducts = [...mockNewArrivals].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    } else {
      return b.popularity - a.popularity;
    }
  });

  const handleAddToCart = (id: number) => {
    setAddedItems((prev) => [...prev, id]);
    setTimeout(() => {
      setAddedItems((prev) => prev.filter((item) => item !== id));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-500/15 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Newly Released</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">New Arrivals</h1>
            <p className="text-slate-400 text-sm max-w-md">
              Freshly dropped items curated from the best makers on the Vendora platform.
            </p>
          </div>

          {/* Sorting / Filter Bar */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-400 mr-1">Sort by:</span>
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  sortBy === 'latest' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Latest
              </button>
              <button
                type="button"
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  sortBy === 'popular' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Popular
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => {
            const isAdded = addedItems.includes(product.id);

            return (
              <div 
                key={product.id}
                className="bg-[#151C2C] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700/80 transition-all duration-300 group flex flex-col relative"
              >
                {/* Glowing "NEW" Badge */}
                <div className="absolute top-3 left-3 z-10 bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-md shadow-lg shadow-emerald-500/10 border border-emerald-400/20 uppercase tracking-widest animate-pulse">
                  Just Arrived
                </div>

                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-950 rounded-t-2xl">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      {product.category}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                      {product.title}
                    </h3>
                  </div>

                  <div className="space-y-4 pt-1">
                    {/* Rating & Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black text-white">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-xs">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-slate-200">{product.rating}</span>
                        <span>({product.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Quick Add Button */}
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={isAdded}
                      className={`w-full font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs ${
                        isAdded 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
