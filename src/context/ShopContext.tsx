import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";

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
  id: number;
  title: string;
  brand: string;
  price: number;
  image: string;
  category?: string;
  rating?: number;
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
  toggleWishlist: (item: WishlistItem) => void;
  isWishlisted: (id: number) => boolean;
  wishlistCount: number;
  moveToCart: (item: WishlistItem) => void;
  clearWishlist: () => void;
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
              quantity: Math.max(1, Number(i.quantity || 1)),
              stock: i.stock !== undefined && i.stock !== null ? Number(i.stock) : undefined,
            }));
        }
      } catch {
        /* ignore invalid JSON */
      }
    }
    return [];
  });

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem('tradehub_wishlist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((i): i is WishlistItem => !!i && typeof i === 'object' && i.id !== undefined)
            .map((i) => ({
              id: Number(i.id),
              title: String(i.title || 'Product'),
              brand: String(i.brand || 'Vendora'),
              price: Number(i.price || 0),
              image: String(i.image || ''),
              category: i.category ? String(i.category) : undefined,
              rating: i.rating ? Number(i.rating) : undefined,
            }));
        }
      } catch {
        /* ignore invalid JSON */
      }
    }
    return [];
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const toastIdRef = useRef(0);

  // Sync states to localStorage
  useEffect(() => {
    localStorage.setItem('tradehub_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('tradehub_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // -- Toasts (declared first to avoid Temporal Dead Zone reference errors) ──────
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

  // -- Stock helper -----------------------------------------------------------
  // Resolves available stock from any of the possible property names.
  // Returns undefined if truly unknown (no limit enforced in that case).
  const getItemStock = (
    item: Partial<CartItem> & { stockQuantity?: number; countInStock?: number; unitsInStock?: number }
  ): number | undefined => {
    const raw =
      item.stock ??
      item.stockQuantity ??
      (item as any).countInStock ??
      (item as any).unitsInStock;
    if (raw === undefined || raw === null) return undefined;
    const n = Number(raw);
    return isNaN(n) ? undefined : n;
  };

  // -- Cart ------------------------------------------------------------------

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number; stock?: number; stockQuantity?: number }) => {
      if (!item || item.id === undefined) return;
      const addQty = item.quantity ?? 1;
      // Resolve stock from any known alias
      const itemStock = getItemStock(item as any);
      let toastMsg: string | null = null;

      setCartItems((prev) => {
        const existing = prev.find((i) => i?.id === item.id);
        // Prefer newly supplied stock; fall back to what's already stored in cart
        const maxStock = itemStock ?? getItemStock(existing as any);
        const currentQty = existing ? (existing.quantity ?? 0) : 0;
        const targetQty = currentQty + addQty;

        if (maxStock !== undefined && maxStock > 0 && targetQty > maxStock) {
          toastMsg = `Maximum available stock reached (Only ${maxStock} item${maxStock > 1 ? 's' : ''} available).`;
          const clampedQty = maxStock; // never exceed stock
          if (existing) {
            return prev.map((i) =>
              i.id === item.id ? { ...i, stock: maxStock, quantity: clampedQty } : i
            );
          }
          return [
            ...prev,
            {
              id: item.id,
              title: item.title || 'Product',
              brand: item.brand || 'Vendora',
              price: item.price || 0,
              image: item.image || '',
              quantity: Math.min(addQty, maxStock),
              stock: maxStock,
            },
          ];
        }

        if (existing) {
          return prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  // Always persist the latest known stock value
                  stock: maxStock ?? i.stock,
                  quantity: (i.quantity ?? 0) + addQty,
                }
              : i
          );
        }

        return [
          ...prev,
          {
            id: item.id,
            title: item.title || 'Product',
            brand: item.brand || 'Vendora',
            price: item.price || 0,
            image: item.image || '',
            quantity: addQty,
            stock: maxStock,
          },
        ];
      });

      if (toastMsg) {
        pushToast(toastMsg, "info");
      }
    },
    [pushToast, getItemStock]
  );

  const removeFromCart = useCallback((id: number) => {
    setCartItems((prev) => prev.filter((i) => i && i.id !== id));
  }, []);

  const updateQty = useCallback(
    (id: number, qty: number) => {
      if (qty < 1) return;
      let toastMsg: string | null = null;

      setCartItems((prev) =>
        prev.map((i) => {
          if (i && i.id === id) {
            const maxStock = getItemStock(i as any);
            if (maxStock !== undefined && maxStock > 0 && qty > maxStock) {
              toastMsg = `Maximum available stock reached (Only ${maxStock} item${maxStock > 1 ? 's' : ''} available).`;
              return { ...i, quantity: maxStock };
            }
            return { ...i, quantity: qty };
          }
          return i;
        })
      );

      if (toastMsg) {
        pushToast(toastMsg, "info");
      }
    },
    [pushToast, getItemStock]
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

  // -- Wishlist --------------------------------------------------------------

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setWishlistItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      return exists
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item];
    });
  }, []);

  const isWishlisted = useCallback(
    (id: number) => wishlistItems.some((i) => i && i.id === id),
    [wishlistItems]
  );

  const wishlistCount = useMemo(() => {
    return wishlistItems.reduce((sum, i) => (i ? sum + 1 : sum), 0);
  }, [wishlistItems]);

  const moveToCart = useCallback(
    (item: WishlistItem) => {
      addToCart(item);
      setWishlistItems((prev) => prev.filter((i) => i.id !== item.id));
      const titleSnippet = item.title.split(' ').slice(0, 3).join(' ');
      pushToast(`Moved "${titleSnippet}…" to cart!`, 'cart');
    },
    [addToCart, pushToast]
  );

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
    pushToast('Wishlist cleared', 'wishlist');
  }, [pushToast]);

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
        toggleWishlist,
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
