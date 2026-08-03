import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { getWishlistApi, addToWishlistApi, removeFromWishlistApi } from "../services/wishlistService";
import { fetchCartStocks, updateCartItemStock } from "../services/cartService";



const BACKEND_ORIGIN = 'http://localhost:5229';

function resolveImage(raw?: string | null): string {
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) return raw;
  return `${BACKEND_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

// --- Types --------------------------------------------------------------------

export interface CartItem {
  id: number;
  title: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
}

export interface WishlistItem {
  id: number;              // Product ID
  wishlistItemId?: number; // DB primary key for WishlistItem (used for DELETE API)
  title: string;
  brand: string;
  price: number;           // Current Product.Price
  image: string;
  category?: string;
  rating?: number;
  priceWhenAdded?: number;
  hasPriceDropped?: boolean;
  stockQuantity?: number;
  isActive?: boolean;
  addedAt?: string;
}

export interface ToastMessage {
  id: number;
  text: string;
  type: "cart" | "wishlist" | "info";
}

interface ShopContextValue {
  // Cart
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number; stock?: number; stockQuantity?: number }) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Wishlist
  wishlistItems: WishlistItem[];
  wishlistLoading: boolean;
  syncWishlist: () => Promise<void>;
  toggleWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (id: number) => Promise<void>;
  isWishlisted: (id: number) => boolean;
  wishlistCount: number;
  moveToCart: (item: WishlistItem) => void;
  clearWishlist: () => Promise<void>;
  moveAllToCart: () => void;

  // Toasts
  toasts: ToastMessage[];
  pushToast: (text: string, type?: ToastMessage["type"]) => void;
  dismissToast: (id: number) => void;

  // Mini-cart drawer
  miniCartOpen: boolean;
  setMiniCartOpen: (v: boolean) => void;
}

// --- Context ------------------------------------------------------------------

const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
  return ctx;
}

// --- Provider -----------------------------------------------------------------

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('tradehub_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((i): i is CartItem => !!i && typeof i === 'object' && i.id !== undefined)
            .map((i) => ({
              id: Number(i.id),
              title: String(i.title || 'Product'),
              brand: String(i.brand || 'Vendora'),
              price: Number(i.price || 0),
              image: String(i.image || ''),
              quantity: Math.min(MAX_CART_QTY, Math.max(1, Number(i.quantity || 1))),
              stock: i.stock !== undefined && i.stock !== null ? Number(i.stock) : undefined,
              stockQuantity: i.stockQuantity !== undefined && i.stockQuantity !== null ? Number(i.stockQuantity) : undefined,
            }));
        }
      } catch {
        /* ignore invalid JSON */
      }
    }
    return [];
  });

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('tradehub_token');
    // If user is logged in, initialize empty while syncWishlist fetches from backend
    if (token) return [];
    const saved = localStorage.getItem('tradehub_wishlist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((i): i is WishlistItem => !!i && typeof i === 'object' && i.id !== undefined)
            .map((i) => ({
              id: Number(i.id),
              wishlistItemId: i.wishlistItemId ? Number(i.wishlistItemId) : undefined,
              title: String(i.title || 'Product'),
              brand: String(i.brand || 'Vendora'),
              price: Number(i.price || 0),
              image: String(i.image || ''),
              category: i.category ? String(i.category) : undefined,
              rating: i.rating ? Number(i.rating) : undefined,
              priceWhenAdded: i.priceWhenAdded !== undefined ? Number(i.priceWhenAdded) : undefined,
              hasPriceDropped: Boolean(i.hasPriceDropped),
              stockQuantity: i.stockQuantity !== undefined ? Number(i.stockQuantity) : undefined,
              isActive: i.isActive !== undefined ? Boolean(i.isActive) : true,
              addedAt: i.addedAt ? String(i.addedAt) : undefined,
            }));
        }
      } catch {
        /* ignore invalid JSON */
      }
    }
    return [];
  });

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const toastIdRef = useRef(0);

  // Sync cart state to localStorage
  useEffect(() => {
    localStorage.setItem('tradehub_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync wishlist state to localStorage for guest users
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('tradehub_token');
    if (!token) {
      localStorage.setItem('tradehub_wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems]);

  // -- Toasts ────────────────────────────────────────────────────────────────
  const pushToast = useCallback(
    (text: string, type: ToastMessage["type"] = "info") => {
      const id = ++toastIdRef.current;
      setToasts((prev) => [...prev, { id, text, type }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        3000
      );
    },
    []
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // -- Wishlist API Sync ──────────────────────────────────────────────────────
  const syncWishlist = useCallback(async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('tradehub_token');
    if (!token) return;
    setWishlistLoading(true);
    try {
      const data = await getWishlistApi();
      const mapped: WishlistItem[] = data.map((w) => ({
        id: w.productId,
        wishlistItemId: w.id,
        title: w.productName,
        brand: w.brand || 'Vendora',
        price: w.currentPrice,
        image: resolveImage(w.imageUrl),
        category: w.category || 'General',
        priceWhenAdded: w.priceWhenAdded,
        hasPriceDropped: w.hasPriceDropped,
        stockQuantity: w.stockQuantity,
        isActive: w.isActive,
        addedAt: w.addedAt,
      }));
      setWishlistItems(mapped);
    } catch (err: any) {
      console.error('Failed to sync wishlist with API:', err);
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  useEffect(() => {
    syncWishlist();
  }, [syncWishlist]);

  // -- Live Cart Stock Sync Effect --------------------------------------------
  useEffect(() => {
    const ids = cartItems.map((i) => i?.id).filter((id): id is number => typeof id === 'number' && id > 0);
    if (ids.length === 0) return;

    fetchCartStocks(ids)
      .then((liveItems) => {
        if (!liveItems || liveItems.length === 0) return;
        const stockMap = new Map(liveItems.map((item) => [item.id, item]));

        setCartItems((prev) =>
          prev.map((i) => {
            if (!i) return i;
            const live = stockMap.get(i.id);
            if (live) {
              const liveStock = live.stockQuantity;
              const clampedQty = liveStock > 0 ? Math.min(i.quantity, liveStock) : 1;
              return {
                ...i,
                stock: liveStock,
                stockQuantity: liveStock,
                price: live.price,
                quantity: clampedQty,
              };
            }
            return i;
          })
        );
      })
      .catch((err) => {
        console.warn('[ShopContext] Cart live stock sync failed:', err?.message || err);
      });
  }, [cartItems.map((i) => i?.id).filter(Boolean).join(',')]);

  // -- Stock helper -----------------------------------------------------------
  const getItemStock = (
    item?: (Partial<CartItem> & { stockQuantity?: number; countInStock?: number; unitsInStock?: number }) | null
  ): number | undefined => {
    if (!item) return undefined;
    const raw =
      item.stockQuantity ??
      item.stock ??
      (item as any)?.countInStock ??
      (item as any)?.unitsInStock;
    if (raw === undefined || raw === null) return undefined;
    const n = Number(raw);
    return isNaN(n) ? undefined : n;
  };

  // -- Cart ------------------------------------------------------------------

  const addToCart = useCallback(
    (item?: (Omit<CartItem, "quantity"> & { quantity?: number; stock?: number; stockQuantity?: number }) | null) => {
      if (!item || item.id === undefined || item.id === null) return;
      const addQty = item.quantity ?? 1;
      const itemStock = getItemStock(item as any);
      let toastMsg: string | null = null;

      setCartItems((prev) => {
        const safePrev = Array.isArray(prev) ? prev.filter((i): i is CartItem => !!i && i.id !== undefined) : [];
        const existing = safePrev.find((i) => i.id === item.id);
        const maxStock = itemStock ?? getItemStock(existing);
        const currentQty = existing ? (existing.quantity ?? 0) : 0;
        const targetQty = currentQty + addQty;

        if (maxStock !== undefined && maxStock >= 0 && targetQty > maxStock) {
          toastMsg = maxStock === 0
            ? `"${item.title || 'Product'}" is currently out of stock.`
            : `Only ${maxStock} item${maxStock > 1 ? 's' : ''} available in stock.`;
          const clampedQty = Math.max(1, maxStock);
          if (existing) {
            return safePrev.map((i) =>
              i.id === item.id ? { ...i, stock: maxStock, stockQuantity: maxStock, quantity: clampedQty } : i
            );
          }
          return [
            ...safePrev,
            {
              id: item.id,
              title: item.title || 'Product',
              brand: item.brand || 'Vendora',
              price: typeof item.price === 'number' && !isNaN(item.price) ? item.price : Number(item.price) || 0,
              image: item.image || '',
              quantity: Math.min(addQty, maxStock),
              stock: maxStock,
              stockQuantity: maxStock,
            },
          ];
        }

        if (existing) {
          return safePrev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  stock: maxStock ?? i.stock,
                  stockQuantity: maxStock ?? i.stockQuantity,
                  quantity: (i.quantity ?? 0) + addQty,
                }
              : i
          );
        }

        return [
          ...safePrev,
          {
            id: item.id,
            title: item.title || 'Product',
            brand: item.brand || 'Vendora',
            price: typeof item.price === 'number' && !isNaN(item.price) ? item.price : Number(item.price) || 0,
            image: item.image || '',
            quantity: addQty,
            stock: maxStock,
            stockQuantity: maxStock,
          },
        ];
      });

      if (toastMsg) {
        pushToast(toastMsg, "info");
      }
    },
    [pushToast]
  );

  const removeFromCart = useCallback((id: number) => {
    setCartItems((prev) => prev.filter((i) => i && i.id !== id));
  }, []);

  const updateQty = useCallback(
    (id: number, qty: number) => {
      const parsed = Math.floor(Number(qty));
      if (!Number.isFinite(parsed) || parsed < 1) return;

      let toastMsg: string | null = null;
      let targetQty = parsed;

      setCartItems((prev) =>
        prev.map((i) => {
          if (i && i.id === id) {
            const maxStock = getItemStock(i as any);
            if (maxStock !== undefined && maxStock >= 0) {
              if (parsed > maxStock) {
                toastMsg = maxStock === 0
                  ? `"${i.title}" is currently out of stock.`
                  : `Only ${maxStock} item${maxStock > 1 ? 's' : ''} available in stock.`;
                targetQty = Math.max(1, maxStock);
                return { ...i, stock: maxStock, stockQuantity: maxStock, quantity: targetQty };
              }
            }
            return { ...i, quantity: parsed };
          }
          return i;
        })
      );

      if (toastMsg) {
        pushToast(toastMsg, "info");
      }

      // Backend API validation (PUT/POST /api/cart/update)
      updateCartItemStock(id, targetQty).catch((err: any) => {
        const errorData = err?.response?.data;
        if (errorData?.data?.stockQuantity !== undefined) {
          const liveStock = errorData.data.stockQuantity;
          const allowed = errorData.data.allowedQuantity ?? Math.min(targetQty, liveStock);
          const finalAllowed = Math.max(1, allowed);

          setCartItems((prev) =>
            prev.map((item) =>
              item && item.id === id
                ? { ...item, stock: liveStock, stockQuantity: liveStock, quantity: finalAllowed }
                : item
            )
          );

          if (errorData?.message) {
            pushToast(errorData.message, "info");
          }
        }
      });
    },
    [pushToast]
  );

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, i) => {
      if (!i) return sum;
      const price = typeof i.price === 'number' && !isNaN(i.price) ? i.price : 0;
      const qty = typeof i.quantity === 'number' && !isNaN(i.quantity) ? i.quantity : 1;
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, i) => {
      if (!i) return sum;
      const qty = typeof i.quantity === 'number' && !isNaN(i.quantity) ? i.quantity : 0;
      return sum + qty;
    }, 0);
  }, [cartItems]);

  // -- Wishlist Handlers ─────────────────────────────────────────────────────

  const toggleWishlist = useCallback(
    async (item: WishlistItem) => {
      const token = localStorage.getItem('token') || localStorage.getItem('tradehub_token');
      const existing = wishlistItems.find((i) => i.id === item.id);

      if (existing) {
        // Optimistically remove from state
        setWishlistItems((prev) => prev.filter((i) => i.id !== item.id));
        pushToast('Removed from wishlist', 'wishlist');

        if (token) {
          try {
            const deleteId = existing.wishlistItemId ?? existing.id;
            await removeFromWishlistApi(deleteId);
          } catch (err: any) {
            // Revert on API error
            setWishlistItems((prev) => [...prev, existing]);
            pushToast(err?.message || 'Failed to remove from wishlist', 'info');
          }
        }
      } else {
        // Optimistically add to state
        setWishlistItems((prev) => [...prev, item]);
        pushToast(`Saved "${item.title.split(' ').slice(0, 3).join(' ')}…" to wishlist`, 'wishlist');

        if (token) {
          try {
            const added = await addToWishlistApi(item.id);
            // Update item with server data (WishlistItem ID & price snapshot)
            setWishlistItems((prev) =>
              prev.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      wishlistItemId: added.id,
                      priceWhenAdded: added.priceWhenAdded,
                      hasPriceDropped: added.hasPriceDropped,
                      stockQuantity: added.stockQuantity,
                      isActive: added.isActive,
                    }
                  : i
              )
            );
          } catch (err: any) {
            // Revert on API error
            setWishlistItems((prev) => prev.filter((i) => i.id !== item.id));
            pushToast(err?.message || 'Failed to add to wishlist', 'info');
          }
        }
      }
    },
    [wishlistItems, pushToast]
  );

  const removeFromWishlist = useCallback(
    async (id: number) => {
      const token = localStorage.getItem('token') || localStorage.getItem('tradehub_token');
      const item = wishlistItems.find((i) => i.id === id || i.wishlistItemId === id);
      if (!item) return;

      setWishlistItems((prev) => prev.filter((i) => i.id !== item.id));
      pushToast('Removed from wishlist', 'wishlist');

      if (token) {
        try {
          const deleteId = item.wishlistItemId ?? item.id;
          await removeFromWishlistApi(deleteId);
        } catch (err: any) {
          setWishlistItems((prev) => [...prev, item]);
          pushToast(err?.message || 'Failed to remove item', 'info');
        }
      }
    },
    [wishlistItems, pushToast]
  );

  const isWishlisted = useCallback(
    (id: number) => wishlistItems.some((i) => i && i.id === id),
    [wishlistItems]
  );

  const wishlistCount = useMemo(() => {
    return wishlistItems.reduce((sum, i) => (i ? sum + 1 : sum), 0);
  }, [wishlistItems]);

  const moveToCart = useCallback(
    (item: WishlistItem) => {
      if (!item || item.id === undefined) return;
      addToCart(item);
      const titleStr = item.title || (item as any).name || 'Product';
      const titleSnippet = titleStr.split(' ').slice(0, 3).join(' ');
      pushToast(`Added "${titleSnippet}…" to cart!`, 'cart');
    },
    [addToCart, pushToast]
  );

  const clearWishlist = useCallback(async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('tradehub_token');
    const prevItems = [...wishlistItems];
    setWishlistItems([]);
    pushToast('Wishlist cleared', 'wishlist');

    if (token && prevItems.length > 0) {
      try {
        await Promise.all(
          prevItems.map((i) => {
            const deleteId = i.wishlistItemId ?? i.id;
            return removeFromWishlistApi(deleteId).catch(() => {});
          })
        );
      } catch {
        /* ignore */
      }
    }
  }, [wishlistItems, pushToast]);

  const moveAllToCart = useCallback(() => {
    if (wishlistItems.length === 0) return;
    wishlistItems.forEach((item) => addToCart(item));
    const count = wishlistItems.length;
    pushToast(`Added ${count} item${count > 1 ? 's' : ''} to cart!`, 'cart');
  }, [wishlistItems, addToCart, pushToast]);

  return (
    <ShopContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartTotal,
        cartCount,
        wishlistItems,
        wishlistLoading,
        syncWishlist,
        toggleWishlist,
        removeFromWishlist,
        isWishlisted,
        wishlistCount,
        moveToCart,
        clearWishlist,
        moveAllToCart,
        toasts,
        pushToast,
        dismissToast,
        miniCartOpen,
        setMiniCartOpen,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
