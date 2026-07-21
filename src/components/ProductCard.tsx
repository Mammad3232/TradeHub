import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Store, ShoppingCart, Heart, Eye } from 'lucide-react';
import type { Product } from '../services/api';

interface ProductCardProps {
  product: Product;
}

// ── Star Rating ───────────────────────────────────────────────────────────────

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-700 text-slate-700'
          }`}
        />
      ))}
      <span className="ml-1.5 text-xs font-semibold text-slate-300">{rating.toFixed(1)}</span>
    </div>
  );
};

// ── Card ─────────────────────────────────────────────────────────────────────

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  return (
    <article className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">

      {/* ── Image Section ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-950 h-48">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay actions (appear on hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick-view button */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Link
            to={`/product/${product.id}`}
            className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20 hover:bg-white/20 transition-all"
          >
            <Eye className="h-3.5 w-3.5" />
            Quick View
          </Link>
        </div>

        {/* Wishlist button */}
        <button
          onClick={() => setWishlisted((v) => !v)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 text-slate-400 hover:text-white transition-all hover:scale-110"
          aria-label="Wishlist"
        >
          <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-red-400 text-red-400' : ''}`} />
        </button>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-slate-900/80 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-indigo-400 border border-indigo-500/20">
            {product.category}
          </span>
        </div>
      </div>

      {/* ── Body Section ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col p-5 gap-3">

        {/* Vendor */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Store className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
          <Link
            to={`/vendor/dashboard`}
            className="font-medium hover:text-indigo-400 transition-colors truncate"
          >
            {product.vendorName}
          </Link>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-100 text-sm leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
          {product.title}
        </h3>

        {/* Star rating */}
        <StarRating rating={product.rating} />

        {/* Price row */}
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-slate-800/80">
          <div>
            <span className="text-xl font-extrabold text-white">${product.price.toFixed(2)}</span>
            {/* Optional original price crossed out — placeholder */}
            {/* <span className="text-xs text-slate-500 line-through ml-1.5">$59.99</span> */}
          </div>
          <span className="text-xs text-emerald-400 font-medium">In Stock</span>
        </div>

        {/* ── Add to Cart Button ──────────────────────────────────── */}
        <button
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-2 font-semibold text-sm py-2.5 px-4 rounded-xl transition-all duration-200 ${
            addedToCart
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/15 hover:shadow-indigo-500/25 active:scale-[.98]'
          }`}
        >
          <ShoppingCart className={`h-4 w-4 transition-transform ${addedToCart ? '' : 'group-hover:scale-110'}`} />
          {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
};
