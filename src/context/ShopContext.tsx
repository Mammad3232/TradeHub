import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

// --- Types --------------------------------------------------------------------

export interface CartItem {
  id: number;
  title: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
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
  addToCart: (item: Omit<CartItem, "quantity">) => void;
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
        if (Array.isArray(parsed)) return parsed;
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
        if (Array.isArray(parsed)) return parsed;
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

  // -- Cart ------------------------------------------------------------------

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: number, qty: number) => {
    if (qty < 1) return;
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartTotal = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // -- Toasts ----------------------------------------------------------------

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
    (id: number) => wishlistItems.some((i) => i.id === id),
    [wishlistItems]
  );

  const wishlistCount = wishlistItems.length;

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
    setWishlistItems([]);
    pushToast(`Moved ${count} item${count > 1 ? 's' : ''} to cart!`, 'cart');
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
