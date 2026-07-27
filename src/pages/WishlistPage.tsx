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
} from 'lucide-react';
import { useShop, type WishlistItem } from '../context/ShopContext';

export const WishlistPage: React.FC = () => {
  const {
    wishlistItems,
    addToCart,
    toggleWishlist,
    moveToCart,
    clearWishlist,
    moveAllToCart,
    pushToast,
  } = useShop();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [addedIds, setAddedIds]                 = useState<Record<number, boolean>>({});

  const handleAddToCart = (product: WishlistItem, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    try {
      if (!product || product.id === undefined) return;
      if (!addToCart) {
        console.error('addToCart method unavailable');
        pushToast('Unable to add item to cart', 'cart');
        return;
      }

      const titleStr = product.title || (product as any).name || 'Product';
      const priceVal = typeof product.price === 'number' && !isNaN(product.price) ? product.price : Number(product.price) || 0;

      addToCart({
        id: product.id,
        title: titleStr,
        brand: product.brand || 'Vendora',
        price: priceVal,
        image: product.image || '',
      });

      setAddedIds((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [product.id]: false }));
      }, 1500);

      const titleSnippet = titleStr.split(' ').slice(0, 3).join(' ');
      pushToast(`"${titleSnippet}…" added to cart!`, 'cart');
    } catch (err) {
      console.error('Error adding item to cart:', err);
      pushToast('An error occurred while adding item to cart', 'cart');
    }
  };

  const handleAddAllToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    try {
      if (!addToCart) {
        console.error('addToCart method unavailable');
        pushToast('Unable to add items to cart', 'cart');
        return;
      }

      if (!wishlistItems || wishlistItems.length === 0) return;

      const validItems = wishlistItems.filter((item): item is WishlistItem => !!item && item.id !== undefined);
      if (validItems.length === 0) return;

      validItems.forEach((item) => {
        const titleStr = item.title || (item as any).name || 'Product';
        const priceVal = typeof item.price === 'number' && !isNaN(item.price) ? item.price : Number(item.price) || 0;

        addToCart({
          id: item.id,
          title: titleStr,
          brand: item.brand || 'Vendora',
          price: priceVal,
          image: item.image || '',
        });
      });

      const count = validItems.length;
      pushToast(`Added all ${count} item${count > 1 ? 's' : ''} to cart!`, 'cart');
    } catch (err) {
      console.error('Error adding all items to cart:', err);
      pushToast('An error occurred while adding items to cart', 'cart');
    }
  };

  // Extract unique categories from saved wishlist items
  const categories = useMemo(() => {
    const catSet = new Set<string>();
    wishlistItems.forEach((item) => {
      if (item.category) catSet.add(item.category);
    });
    return ['All', ...Array.from(catSet)];
  }, [wishlistItems]);

  // Filter items based on active category tab
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return wishlistItems;
    return wishlistItems.filter((item) => item.category === selectedCategory);
  }, [wishlistItems, selectedCategory]);

  const handleConfirmClear = () => {
    clearWishlist();
    setIsClearModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ── Page Header Section ────────────────────────────────────────── */}
        <div className="bg-[#0E1524] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
          {/* Background Ambient Glow */}
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
              {wishlistItems.length === 0
                ? 'Your wishlist is currently empty.'
                : `You have ${wishlistItems.length} saved product${wishlistItems.length > 1 ? 's' : ''} in your collection.`}
            </p>
          </div>

          {/* Batch Actions Header Controls */}
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

        {/* ── Empty State View ───────────────────────────────────────────── */}
        {wishlistItems.length === 0 ? (
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
        ) : (
          <>
            {/* ── Category Filters Header ────────────────────────────────────── */}
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
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Filtered Product Grid ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((product) => {
                const isInStock = (product as WishlistItem & { inStock?: boolean }).inStock !== false;

                return (
                  <article
                    key={product.id}
                    className="group relative bg-[#0E1524] border border-slate-800 rounded-3xl overflow-hidden flex flex-col hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl"
                  >
                    {/* Product Image Box */}
                    <div className="relative h-60 w-full overflow-hidden bg-slate-950 rounded-t-3xl">
                      <img
                        src={product.image}
                        alt={product.title}
                        className={`w-full h-full object-cover rounded-t-3xl transition-transform duration-500 ${
                          isInStock ? 'group-hover:scale-105' : 'grayscale opacity-75'
                        }`}
                      />

                      {/* Faded overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      {/* Out of Stock Badge */}
                      {!isInStock && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-600 text-white shadow-lg shadow-rose-600/30">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {/* Category Badge if in stock */}
                      {isInStock && product.category && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-600/80 backdrop-blur-md text-white shadow-lg">
                            {product.category}
                          </span>
                        </div>
                      )}

                      {/* Trash / Remove Button */}
                      <button
                        type="button"
                        onClick={() => {
                          toggleWishlist(product);
                          pushToast('Removed from wishlist', 'wishlist');
                        }}
                        className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 hover:scale-110 transition-all cursor-pointer"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>{product.brand}</span>
                      </div>

                      <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors">
                        {product.title}
                      </h3>

                      {/* Rating stars */}
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= Math.round(product.rating || 5)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-slate-800 text-slate-800'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-slate-400 ml-1">{product.rating.toFixed(1)}</span>
                        </div>
                      )}

                      {/* Price & Add to Cart Action */}
                      <div className="mt-auto pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-lg font-black text-white">${product.price.toFixed(2)}</span>
                        </div>

                        {isInStock ? (
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(product, e)}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                              addedIds[product.id]
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : 'bg-purple-600 hover:bg-purple-500 border-purple-500 text-white shadow-purple-600/20'
                            }`}
                          >
                            {addedIds[product.id] ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Add to Cart</span>
                              </>
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

      {/* ── Clear Wishlist Confirmation Modal Overlay ───────────────────────── */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0E1524] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6">
            {/* Modal Header */}
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

            {/* Modal Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to clear your entire wishlist? All saved products will be permanently removed from your wishlist.
            </p>

            {/* Modal Footer Buttons */}
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
