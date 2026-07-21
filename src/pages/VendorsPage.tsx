import React from 'react';
import { Star, Store, Package, ArrowRight, Award, ShieldCheck } from 'lucide-react';

interface VendorStore {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  productsCount: number;
  bannerImage: string;
  logoImage: string;
  featured: boolean;
}

const mockVendors: VendorStore[] = [
  {
    id: 1,
    name: 'Aether Audio Labs',
    category: 'Electronics',
    rating: 4.9,
    reviewsCount: 184,
    productsCount: 64,
    bannerImage: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&auto=format&fit=crop&q=80',
    logoImage: 'https://images.unsplash.com/photo-15740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80',
    featured: true,
  },
  {
    id: 2,
    name: 'Chronos Horology',
    category: 'Accessories',
    rating: 4.8,
    reviewsCount: 120,
    productsCount: 42,
    bannerImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80',
    logoImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80',
    featured: true,
  },
  {
    id: 3,
    name: 'Apex Goods Co.',
    category: 'Bags & Luggage',
    rating: 4.7,
    reviewsCount: 95,
    productsCount: 38,
    bannerImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
    logoImage: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=100&auto=format&fit=crop&q=80',
    featured: false,
  },
  {
    id: 4,
    name: 'Lumina Tech Labs',
    category: 'Computers & Tech',
    rating: 4.9,
    reviewsCount: 310,
    productsCount: 112,
    bannerImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80',
    logoImage: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=100&auto=format&fit=crop&q=80',
    featured: true,
  },
  {
    id: 5,
    name: 'SoleStyle Footwear',
    category: 'Fashion & Shoes',
    rating: 4.6,
    reviewsCount: 78,
    productsCount: 56,
    bannerImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
    logoImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=100&auto=format&fit=crop&q=80',
    featured: false,
  },
  {
    id: 6,
    name: 'Hearth & Home Co.',
    category: 'Furniture & Decor',
    rating: 4.8,
    reviewsCount: 145,
    productsCount: 88,
    bannerImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&auto=format&fit=crop&q=80',
    logoImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&auto=format&fit=crop&q=80',
    featured: false,
  },
];

export const VendorsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-8">
        
        {/* Page Header */}
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 text-xs px-3 py-1.5 rounded-full border border-indigo-500/15 font-bold uppercase tracking-wider">
            <Store className="h-3.5 w-3.5" />
            <span>Marketplace Directory</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Top Certified Vendors</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Browse through our verified stores selling authentic products. Directly supported by Buyer Protection.
          </p>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {mockVendors.map((vendor) => {
            return (
              <div 
                key={vendor.id}
                className="bg-[#151C2C] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700/80 transition-all duration-300 group flex flex-col shadow-lg shadow-slate-950/20"
              >
                {/* Store Banner */}
                <div className="h-36 w-full overflow-hidden bg-slate-950 relative">
                  <img 
                    src={vendor.bannerImage} 
                    alt={`${vendor.name} Banner`} 
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 opacity-60"
                  />
                  {vendor.featured && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Award className="h-3.5 w-3.5" />
                      Featured Store
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 bg-slate-900/90 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-800 uppercase tracking-wider">
                    {vendor.category}
                  </span>
                </div>

                {/* Body details with overlapping circular logo */}
                <div className="px-5 pb-5 flex-grow flex flex-col justify-between relative pt-12">
                  
                  {/* Store Logo overlapping banner */}
                  <div className="absolute -top-9 left-5 h-16 w-16 rounded-xl border border-slate-800 bg-[#151C2C] overflow-hidden p-1 shadow-lg">
                    <img 
                      src={vendor.logoImage} 
                      alt={`${vendor.name} Logo`} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Store Info */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors leading-snug">
                        {vendor.name}
                      </h3>
                      <span title="Verified Seller">
                        <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      </span>
                    </div>

                    {/* Ratings */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-300">
                        {vendor.rating}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({vendor.reviewsCount} reviews)
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2.5 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5 text-slate-500" />
                        <span>{vendor.productsCount} Products</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    type="button"
                    className="w-full mt-5 bg-transparent hover:bg-indigo-600 border border-indigo-500/50 hover:border-transparent text-indigo-400 hover:text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <span>Visit Store</span>
                    <ArrowRight className="h-3.5 w-3.5" />
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
