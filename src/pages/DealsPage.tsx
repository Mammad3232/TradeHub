import React, { useState, useEffect } from 'react';
import { Sparkles, ShoppingCart, Percent, AlertCircle } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface DealProduct {
  id: number;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  discountBadge: string;
  claimedPercentage: number;
  image: string;
  category: string;
}

const mockDeals: DealProduct[] = [
  {
    id: 101,
    title: 'Aether Sound Wave Wireless Headphones',
    originalPrice: 299.99,
    discountedPrice: 149.99,
    discountBadge: '-50% OFF',
    claimedPercentage: 65,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    category: 'Electronics',
  },
  {
    id: 102,
    title: 'Chronos Classic Minimalist Watch',
    originalPrice: 189.50,
    discountedPrice: 94.75,
    discountBadge: '-50% OFF',
    claimedPercentage: 42,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    category: 'Accessories',
  },
  {
    id: 103,
    title: 'Apex Leather Laptop Backpack',
    originalPrice: 120.00,
    discountedPrice: 72.00,
    discountBadge: '-40% OFF',
    claimedPercentage: 88,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
    category: 'Bags',
  },
  {
    id: 104,
    title: 'OmniFocus Smart Ring v2',
    originalPrice: 350.00,
    discountedPrice: 230.00,
    discountBadge: 'Save $120',
    claimedPercentage: 73,
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=500&auto=format&fit=crop&q=80',
    category: 'Electronics',
  },
  {
    id: 105,
    title: 'Prism Pro ANC Earbuds',
    originalPrice: 150.00,
    discountedPrice: 75.00,
    discountBadge: '-50% OFF',
    claimedPercentage: 19,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80',
    category: 'Electronics',
  },
  {
    id: 106,
    title: 'Lumina Ergo Mechanical Keyboard',
    originalPrice: 199.00,
    discountedPrice: 119.40,
    discountBadge: '-40% OFF',
    claimedPercentage: 55,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
    category: 'Accessories',
  },
];

export const DealsPage: React.FC = () => {
  const { formatPrice } = useCurrency();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 32, seconds: 15 });

  // ── Countdown Timer Effect ───────────────────────────────────
  useEffect(() => {
    // Total countdown time in seconds (4h 32m 15s)
    let totalSeconds = 4 * 3600 + 32 * 60 + 15;

    const timer = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(timer);
        return;
      }
      totalSeconds -= 1;

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      setTimeLeft({ hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (val: number): string => {
    return val < 10 ? `0${val}` : `${val}`;
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-8">
        
        {/* Banner with countdown */}
        <div className="bg-gradient-to-r from-red-600 to-amber-600 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-red-950/20">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 bg-white/10 px-3 py-1 rounded-full w-max text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Limited Time Offers</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Flash Deals Dashboard</h1>
            <p className="text-white/80 text-sm max-w-md">
              Grab premium products from top vendors at unbeatable prices. Act fast, inventory is extremely limited!
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="bg-slate-950/80 border border-white/10 px-6 py-4 rounded-2xl flex flex-col items-center justify-center min-w-[240px]">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Flash Deals end in
            </p>
            <div className="flex items-center gap-3 font-mono text-3xl font-extrabold text-white">
              <div className="flex flex-col items-center">
                <span>{formatTime(timeLeft.hours)}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">Hrs</span>
              </div>
              <span className="text-red-500 -mt-3">:</span>
              <div className="flex flex-col items-center">
                <span>{formatTime(timeLeft.minutes)}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">Min</span>
              </div>
              <span className="text-red-500 -mt-3">:</span>
              <div className="flex flex-col items-center">
                <span>{formatTime(timeLeft.seconds)}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">Sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockDeals.map((product) => {
            return (
              <div
                key={product.id}
                className="bg-[#151C2C] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700/80 transition-all duration-300 group flex flex-col relative"
              >
                {/* Discount Badge in Top Corner */}
                <div className="absolute top-3 right-3 z-10 bg-red-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  <span>{product.discountBadge}</span>
                </div>

                {/* Product Image */}
                <div className="h-52 w-full overflow-hidden bg-slate-950 relative rounded-t-2xl">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-3 left-3 bg-slate-900/80 text-slate-300 border border-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>

                {/* Card Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                      {product.title}
                    </h3>

                    {/* Price Row */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xl font-black text-white">
                        {formatPrice(product.discountedPrice)}
                      </span>
                      <span className="text-xs text-slate-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Stock claimed progress bar (FOMO) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                        <span>{product.claimedPercentage}% claimed</span>
                      </span>
                      <span className="text-slate-500">
                        {100 - product.claimedPercentage}% left
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          product.claimedPercentage > 80 
                            ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                            : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${product.claimedPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    type="button"
                    className="w-full bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs group-hover:border-transparent border border-slate-700/50"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Claim Deal</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
