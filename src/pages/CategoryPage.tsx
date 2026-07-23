import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layers, ShoppingBag, ArrowLeft, Filter } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import mockProducts from '../mocks/products.json';
import type { Product } from '../services/api';

const normalizeCategory = (str = '') => str.toLowerCase().replace(/[^a-z0-9]/g, '');

export const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();

  // Format category slug back to display title (e.g., "home-decor" -> "Home Decor")
  const formattedCategoryName = useMemo(() => {
    if (!categoryName) return 'All Products';
    return categoryName
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [categoryName]);

  // Robust category matching using character normalization
  const filteredProducts = useMemo<Product[]>(() => {
    if (!categoryName) return mockProducts as unknown as Product[];
    const normalizedTarget = normalizeCategory(categoryName);
    
    return (mockProducts as unknown as Product[]).filter((p) => {
      const normalizedPCat = normalizeCategory(p.category);
      return (
        normalizedPCat === normalizedTarget ||
        normalizedPCat.includes(normalizedTarget) ||
        normalizedTarget.includes(normalizedPCat)
      );
    });
  }, [categoryName]);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Page Header Banner ──────────────────────────────────────────── */}
        <div className="bg-[#0E1524] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </Link>

            <div className="flex items-center gap-2.5 text-purple-400 text-xs font-extrabold uppercase tracking-widest">
              <Layers className="w-4 h-4" />
              <span>Category Showcase</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {formattedCategoryName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} in this category.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 text-xs font-bold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>Filtered View</span>
            </div>
          </div>
        </div>

        {/* ── Empty State ─────────────────────────────────────────────────── */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[#0E1524] border border-slate-800 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-2xl space-y-6 my-12 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">No products found</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                We couldn't find any products in the "{formattedCategoryName}" category right now.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-xl shadow-purple-600/30"
              >
                <span>Return to Shop Home</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ── Product Grid ───────────────────────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
