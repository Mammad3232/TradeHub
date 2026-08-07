import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingBag, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useProductContext } from '../context/ProductContext';
import { getProducts, type Product } from '../services/api';

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || searchParams.get('search') || searchParams.get('searchTerm') || '';
  const category = searchParams.get('category') || '';
  const { products: contextProducts } = useProductContext();

  const [sortBy, setSortBy] = useState<string>('relevance');
  const [apiProducts, setApiProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;
    getProducts({
      search: query || undefined,
      category: category && category !== 'All' ? category : undefined,
    })
      .then((data) => {
        if (isMounted) {
          setApiProducts(data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch products from backend API in SearchResultsPage:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [query, category]);

  // Filter products by Product Name (title) and Category from single-source ProductContext
  const filteredProducts = useMemo<Product[]>(() => {
    const baseSource = (contextProducts.length > 0 ? contextProducts : apiProducts) as unknown as Product[];
    const seen = new Set();
    let list = baseSource.filter((p) => {
      if (!p || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    if (category && category !== 'All') {
      const catLower = category.toLowerCase().trim();
      list = list.filter((p) => {
        const pCat = (p.category || '').toLowerCase().trim();
        return pCat === catLower || pCat.includes(catLower) || catLower.includes(pCat);
      });
    }

    if (query.trim()) {
      const term = query.toLowerCase().trim();
      list = list.filter((product) => {
        const titleMatch = ((product as any).name || product.title || '').toLowerCase().includes(term);
        return titleMatch;
      });
    }

    return list;
  }, [query, category, apiProducts]);

  // Sort filtered products based on sortBy selection
  const sortedProducts = useMemo<Product[]>(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'name':
        return list.sort((a, b) => {
          const nameA = (a.title || (a as any).name || '').toLowerCase();
          const nameB = (b.title || (b as any).name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      default:
        return list;
    }
  }, [filteredProducts, sortBy]);

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
              <Search className="w-4 h-4" />
              <span>Search Results</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {query ? `Search results for: "${query}"` : 'All Search Results'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Found {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} matching your search term.
            </p>
          </div>

          {/* ── Functional Sort By Dropdown ── */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#111827] border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-300 shadow-lg">
              <SlidersHorizontal className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-purple-300 font-extrabold focus:outline-none cursor-pointer pr-1"
                aria-label="Sort products by"
              >
                <option value="relevance" className="bg-[#111827] text-white">Relevance</option>
                <option value="price-asc" className="bg-[#111827] text-white">Price: Low to High</option>
                <option value="price-desc" className="bg-[#111827] text-white">Price: High to Low</option>
                <option value="rating" className="bg-[#111827] text-white">Highest Rated</option>
                <option value="name" className="bg-[#111827] text-white">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Empty State ─────────────────────────────────────────────────── */}
        {sortedProducts.length === 0 ? (
          <div className="bg-[#0E1524] border border-slate-800 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-2xl space-y-6 my-12 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
              <Search className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">No products found for "{query}"</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                We couldn't find any products matching your search term. Try searching for "Headphones", "Jacket", "Lamp", or "Coffee".
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-xl shadow-purple-600/30"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse All Products</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ── Product Grid ───────────────────────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
