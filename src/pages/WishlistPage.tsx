import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  HeartOff,
  ShoppingCart,
  Trash2,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
  X,
  Layers,
  Star,
  Check,
  TrendingDown,
  Loader2,
  LogIn,
} from 'lucide-react';
import { useShop, type WishlistItem } from '../context/ShopContext';
import { useCurrency } from '../context/CurrencyContext';

// ── Helpers ────────────────────────────────────────────────────────────────────
const BACKEND_ORIGIN = 'http://localhost:5229';

function resolveImage(raw?: string | null): string {
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) return raw;
  return `${BACKEND_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

function getStoredUser() {
  try {
    const raw =
      localStorage.getItem('vendora_user') ||
      localStorage.getItem('mockUser') ||
      localStorage.getItem('vendora_active_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Component ──────────────────────────────────────────────────────────────────
export const WishlistPage: React.FC = () => {
  const { formatPrice } = useCurrency();
  const {
    wishlistItems,
    wishlistLoading,
    addToCart,
    removeFromWishlist,
    clearWishlist,
    pushToast,
  } = useShop();

  // ── Auth detection ───────────────────────────────────────────────────────────
  const storedUser = getStoredUser();
  const isLoggedIn = !!storedUser;

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleAddToCart = (item: WishlistItem, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!item) return;
    addToCart({ id: item.id, title: item.title, brand: item.brand, price: item.price, image: item.image, stockQuantity: item.stockQuantity });
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAddedIds((prev) => ({ ...prev, [item.id]: false })), 1500);
    pushToast(`"${item.title.split(' ').slice(0, 3).join(' ')}…" added to cart!`, 'cart');
  };

  const handleRemove = async (item: WishlistItem) => {
    setRemovingIds((prev) => new Set(prev).add(item.id));
    try {
      await removeFromWishlist(item.id);
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleAddAllToCart = () => {
    if (wishlistItems.length === 0) return;
    wishlistItems.forEach((item) =>
      addToCart({ id: item.id, title: item.title, brand: item.brand, price: item.price, image: item.image, stockQuantity: item.stockQuantity })
    );
    pushToast(`Added all ${wishlistItems.length} item${wishlistItems.length > 1 ? 's' : ''} to cart!`, 'cart');
  };

  const handleConfirmClear = async () => {
    await clearWishlist();
    setIsClearModalOpen(false);
  };

  // ── Derived UI values ─────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const catSet = new Set<string>();
    wishlistItems.forEach((item) => { if (item.category) catSet.add(item.category); });
    return ['All', ...Array.from(catSet)];
  }, [wishlistItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return wishlistItems;
    return wishlistItems.filter((item) => item.category === selectedCategory);
  }, [wishlistItems, selectedCategory]);

  const priceDropCount = wishlistItems.filter((i) => i.hasPriceDropped).length;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Page Header ──────────────────────────────────────────────────────── */}
        <div className="bg-[#0E1524] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-extrabold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>Saved Items</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              My Wishlist
            </h1>
            <p className="text-sm text-slate-400">
              {wishlistLoading
                ? 'Loading your wishlist…'
                : wishlistItems.length === 0
                ? 'Your wishlist is currently empty.'
                : `You have ${wishlistItems.length} saved product${wishlistItems.length > 1 ? 's' : ''} in your collection.`}
            </p>
            {/* Price drop summary badge */}
            {priceDropCount > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mt-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>🎉 {priceDropCount} item{priceDropCount > 1 ? 's have' : ' has'} dropped in price!</span>
              </div>
            )}
          </div>

          {wishlistItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 relative z-10">
              <button
                type="button"
                onClick={handleAddAllToCart}
                className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add All to Cart</span>
              </button>
              <button
                type="button"
                onClick={() => setIsClearModalOpen(true)}
                className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-rose-500/15 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Wishlist</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Guest CTA to log in ───────────────────────────────────────────────── */}
        {!isLoggedIn && wishlistItems.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 text-sm">
            <LogIn className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-amber-300">
              <span className="font-bold">Log in to enable price drop alerts!</span>{' '}
              <span className="text-amber-400/80">We'll notify you when prices fall on your saved items.</span>
            </p>
            <Link to="/login" className="ml-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-colors flex-shrink-0">
              Log In
            </Link>
          </div>
        )}

        {/* ── Loading spinner ───────────────────────────────────────────────────── */}
        {wishlistLoading && (
          <div className="flex justify-center py-20 text-purple-400">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        )}

        {/* ── Empty State ───────────────────────────────────────────────────────── */}
        {!wishlistLoading && wishlistItems.length === 0 && (
          <div className="bg-[#0E1524] border border-slate-800 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-2xl space-y-6 my-12 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <HeartOff className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Your Wishlist is Empty</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Explore our catalog to save your favorite products, track price drops, and move items to your cart anytime.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-xl shadow-purple-600/30"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ── Product Grid ──────────────────────────────────────────────────────── */}
        {!wishlistLoading && wishlistItems.length > 0 && (
          <>
            {/* Category Filter Pills */}
            {categories.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest mr-2 flex-shrink-0">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Category:</span>
                </div>
                {categories.map((cat) => {
                  const count = cat === 'All'
                    ? wishlistItems.length
                    : wishlistItems.filter((i) => i.category === cat).length;
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                          : 'bg-[#0E1524] text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => {
                const isInStock = item.stockQuantity === undefined || item.stockQuantity > 0;
                const isRemoving = removingIds.has(item.id);

                return (
                  <article
                    key={`${item.wishlistItemId ?? item.id}`}
                    className={`group relative bg-[#0E1524] border rounded-3xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300 shadow-xl ${
                      item.hasPriceDropped
                        ? 'border-emerald-500/40 hover:border-emerald-400/60'
                        : 'border-slate-800 hover:border-purple-500/50'
                    }`}
                  >
                    {/* Price Drop Glow if applicable */}
                    {item.hasPriceDropped && (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none rounded-3xl" />
                    )}

                    {/* Image */}
                    <div className="relative h-60 w-full overflow-hidden bg-slate-950 rounded-t-3xl">
                      <Link to={`/product/${item.id}`} className="block w-full h-full">
                        <img
                          src={resolveImage(item.image)}
                          alt={item.title}
                          className={`w-full h-full object-cover rounded-t-3xl transition-transform duration-500 ${
                            isInStock ? 'group-hover:scale-105' : 'grayscale opacity-75'
                          }`}
                        />
                      </Link>

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      {/* Price drop badge */}
                      {item.hasPriceDropped && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            Price Drop!
                          </span>
                        </div>
                      )}

                      {/* Out of stock badge */}
                      {!isInStock && !item.hasPriceDropped && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-600 text-white shadow-lg shadow-rose-600/30">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {/* Category badge */}
                      {isInStock && !item.hasPriceDropped && item.category && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-600/80 backdrop-blur-md text-white shadow-lg">
                            {item.category}
                          </span>
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        disabled={isRemoving}
                        className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 hover:scale-110 transition-all cursor-pointer disabled:opacity-50"
                        title="Remove from Wishlist"
                      >
                        {isRemoving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>{item.brand}</span>
                      </div>

                      <h3 className="font-bold text-white text-sm leading-snug line-clamp-2">
                        <Link to={`/product/${item.id}`} className="hover:text-purple-300 transition-colors">
                          {item.title}
                        </Link>
                      </h3>

                      {item.rating && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= Math.round(item.rating ?? 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-800 text-slate-800'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-400 ml-1">{item.rating.toFixed(1)}</span>
                        </div>
                      )}

                      {/* Price section */}
                      <div className="mt-auto pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                        <div className="flex flex-col">
                          <span className={`text-lg font-black ${item.hasPriceDropped ? 'text-emerald-400' : 'text-white'}`}>
                            {formatPrice(item.price)}
                          </span>
                          {item.hasPriceDropped && item.priceWhenAdded !== undefined && (
                            <span className="text-xs text-slate-500 line-through">
                              was {formatPrice(item.priceWhenAdded)}
                            </span>
                          )}
                        </div>

                        {isInStock ? (
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(item, e)}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                              addedIds[item.id]
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : 'bg-purple-600 hover:bg-purple-500 border-purple-500 text-white shadow-purple-600/20'
                            }`}
                          >
                            {addedIds[item.id] ? (
                              <><Check className="w-3.5 h-3.5" /><span>Added!</span></>
                            ) : (
                              <><ShoppingCart className="w-3.5 h-3.5" /><span>Add to Cart</span></>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-500 text-xs font-bold opacity-60 cursor-not-allowed flex items-center gap-1.5"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Unavailable</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

      </div>

      {/* ── Clear Wishlist Modal ──────────────────────────────────────────────── */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0E1524] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Clear Wishlist?</h3>
                  <p className="text-xs text-slate-400">This action will remove all saved items.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to clear your entire wishlist? All saved products will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                Yes, Clear It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
