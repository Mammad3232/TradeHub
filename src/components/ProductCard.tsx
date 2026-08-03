import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Store, ShoppingCart, Heart, Eye } from 'lucide-react';
import type { Product } from '../services/api';
import { useShop } from '../context/ShopContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTranslation } from 'react-i18next';
import { QuickViewModal } from './QuickViewModal';

// ── Image URL resolver ────────────────────────────────────────────────────────
// If the backend returns a relative path (e.g. /uploads/products/xyz.jpg),
// prepend the backend origin. Absolute URLs are passed through unchanged.
const BACKEND_ORIGIN = 'http://localhost:5229';

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E" +
  "%3Crect width='400' height='300' fill='%230f172a'/%3E" +
  "%3Crect x='160' y='100' width='80' height='60' rx='8' fill='%231e293b'/%3E" +
  "%3Ccircle cx='185' cy='120' r='8' fill='%2334d399' opacity='.4'/%3E" +
  "%3Cpolygon points='175,150 205,130 205,150' fill='%2334d399' opacity='.4'/%3E" +
  "%3C/svg%3E";

const resolveImage = (raw?: string): string => {
  if (!raw) return PLACEHOLDER;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('blob:') || raw.startsWith('data:')) {
    return raw;
  }
  return `${BACKEND_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`;
};

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
  const { addToCart, pushToast, toggleWishlist, isWishlisted } = useShop();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const isWish = isWishlisted ? isWishlisted(product.id) : false;
  const [wishlisted, setWishlisted] = useState(isWish);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => resolveImage(product.image));
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const itemTitle = product.title || (product as any).name || 'Product';
    const availableStock = product.stockQuantity ?? (product as any).stock ?? 50;

    addToCart({
      id: product.id,
      title: itemTitle,
      brand: product.brand || '',
      price: product.price,
      image: product.image,
      stock: availableStock,
      stockQuantity: availableStock,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
    pushToast(`"${itemTitle.split(' ').slice(0, 3).join(' ')}..." added to cart!`, 'cart');
  };

  const handleToggleWishlist = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setWishlisted((v) => !v);
    if (toggleWishlist) {
      toggleWishlist({
        id: product.id,
        title: product.title || (product as any).name || 'Product',
        brand: product.brand || '',
        price: product.price,
        image: product.image,
        category: product.category,
        rating: product.rating,
      });
    }
  };

  return (
    <article className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">

      {/* ── Image Section ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-950 h-56 w-full rounded-t-2xl cursor-pointer">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={imgSrc}
            alt={product.title}
            className="w-full h-full object-cover object-center rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgSrc(PLACEHOLDER)}
          />
        </Link>

        {/* Overlay actions (appear on hover) with centered Quick View button */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsQuickViewOpen(true);
            }}
            className="pointer-events-auto inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4.5 py-2 rounded-xl shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            {t('product.quickView')}
          </button>
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 text-slate-400 hover:text-white transition-all hover:scale-110 cursor-pointer"
          aria-label="Wishlist"
        >
          <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-red-400 text-red-400' : ''}`} />
        </button>

        {/* Category badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
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
            {product.vendorName || product.category || 'Vendora Store'}
          </Link>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-100 text-sm leading-snug line-clamp-2 transition-colors">
          <Link to={`/product/${product.id}`} className="hover:text-indigo-400 transition-colors">
            {product.title}
          </Link>
        </h3>

        {/* Star rating */}
        <StarRating rating={product.rating} />

        {/* Price row */}
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-slate-800/80">
          <div>
            <span className="text-xl font-extrabold text-white">{formatPrice(product.price)}</span>
            {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
              <span className="text-xs text-slate-500 line-through ml-1.5">{formatPrice(Number(product.oldPrice))}</span>
            )}
          </div>
          <span className="text-xs text-emerald-400 font-medium">In Stock</span>
        </div>

        {/* ── Add to Cart Button ──────────────────────────────────── */}
        <button
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-2 font-semibold text-sm py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer ${
            addedToCart
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/15 hover:shadow-indigo-500/25 active:scale-[.98]'
          }`}
        >
          <ShoppingCart className={`h-4 w-4 transition-transform ${addedToCart ? '' : 'group-hover:scale-110'}`} />
          {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
        </button>
      </div>

      {isQuickViewOpen && (
        <QuickViewModal
          product={product}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </article>
  );
};
