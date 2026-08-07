import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredProducts,
  saveStoredProducts,
  removeStoredProduct,
  DEFAULT_SEED_PRODUCTS,
  PRODUCTS_KEY,
  LEGACY_KEY,
  broadcastChange,
} from '../utils/productStorage';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ProductItem {
  id: number;
  title: string;
  name?: string;
  brand: string;
  category: string;
  subcategoryId?: number | null;
  subcategory?: string | null;
  subcategorySlug?: string | null;
  price: number;
  oldPrice?: number | null;
  rating: number;
  image: string;
  imageUrl?: string;
  badge?: 'Sale' | 'New' | 'Hot' | null;
  discount?: number;
  stock?: number;
  stockQuantity?: number;
  status?: string;
  isApproved?: boolean;
  vendorId?: number | string;
  vendorName?: string;
}

interface ProductContextValue {
  products: ProductItem[];
  rawProducts: ProductItem[];
  resyncProducts: () => void;
  deleteProduct: (id: number) => void;
  getDepartmentCount: (categoryName: string) => number;
  refreshProducts: () => void;
}

// ── Corruption Detection ───────────────────────────────────────────────────────

/**
 * Checks whether a stored product list is corrupted / unusable.
 * A list is considered corrupted ONLY if:
 *  - It is empty (0 items).
 *  - More than 50% of items share the exact same placeholder image (placeholder flood).
 *  - Any item has a completely blank/missing title AND name.
 * 
 * NOTE: Length < 72 is NOT corruption (it represents legitimate user/admin deletions).
 */
function isCorrupted(list: any[]): boolean {
  // 1. Truly empty list
  if (!list || list.length === 0) return true;

  // 2. Placeholder image flood (>50% identical images for list > 5 items)
  if (list.length > 5) {
    const imageCounts = new Map<string, number>();
    for (const p of list) {
      const img = (p.image ?? p.imageUrl ?? '').toString().trim();
      if (img) imageCounts.set(img, (imageCounts.get(img) ?? 0) + 1);
    }
    const maxRepeat = Math.max(...Array.from(imageCounts.values()), 0);
    if (maxRepeat > Math.floor(list.length * 0.5)) return true;
  }

  // 3. Any item with neither a title nor a name
  const hasMissing = list.some((p) => {
    const t = (p.title ?? p.name ?? '').toString().trim();
    return t === '' || t === 'undefined';
  });
  if (hasMissing) return true;

  return false;
}

/**
 * Load products from localStorage, auto-healing corruption on the spot.
 * Returns DEFAULT_SEED_PRODUCTS only if stored data is null, empty, or corrupted.
 */
function loadAndHeal(): ProductItem[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (raw) {
      const parsed: any[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && !isCorrupted(parsed)) {
        // Data is valid (even if items were deleted down from 72)
        return parsed as ProductItem[];
      }
      console.warn(
        '[ProductContext] Stored product list is empty or corrupted ' +
        `(${parsed?.length ?? 0} items). Auto-reseeding with ${DEFAULT_SEED_PRODUCTS.length} clean defaults.`
      );
    } else {
      console.info(
        `[ProductContext] No stored products found. Seeding ${DEFAULT_SEED_PRODUCTS.length} defaults.`
      );
    }
  } catch (e) {
    console.error('[ProductContext] Failed to parse stored products:', e);
  }

  // Persist clean defaults only if truly empty or corrupted
  saveStoredProducts(DEFAULT_SEED_PRODUCTS, false);
  broadcastChange();
  return DEFAULT_SEED_PRODUCTS as ProductItem[];
}

// ── Context ────────────────────────────────────────────────────────────────────

const ProductContext = createContext<ProductContextValue | null>(null);

export function useProductContext(): ProductContextValue {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    // Fallback for components rendered outside the provider tree
    const raw = loadAndHeal();
    return {
      products: raw,
      rawProducts: raw,
      resyncProducts: () => {},
      deleteProduct: (id: number) => {
        removeStoredProduct(id);
      },
      getDepartmentCount: (categoryName: string) => {
        if (!categoryName) return 0;
        const cat = categoryName.toLowerCase().trim();
        return raw.filter((p: any) => (p.category ?? '').toLowerCase().trim() === cat).length;
      },
      refreshProducts: () => {},
    };
  }
  return ctx;
}

export const useProducts = useProductContext;

// ── Provider ───────────────────────────────────────────────────────────────────

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<ProductItem[]>(() => loadAndHeal());

  const resyncProducts = useCallback(() => {
    const healed = loadAndHeal();
    setProducts(healed);
  }, []);

  const refreshProducts = useCallback(() => {
    resyncProducts();
  }, [resyncProducts]);

  const deleteProduct = useCallback((id: number) => {
    removeStoredProduct(id);
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    window.dispatchEvent(new CustomEvent('tradehub_products_updated'));
    window.dispatchEvent(new Event('tradehub_products_updated'));
  }, [products]);

  const getDepartmentCount = useCallback(
    (categoryName: string): number => {
      if (!categoryName) return 0;
      const cat = categoryName.toLowerCase().trim();
      return products.filter((p) => (p.category ?? '').toLowerCase().trim() === cat).length;
    },
    [products]
  );

  useEffect(() => {
    const healed = loadAndHeal();
    if (healed !== products && healed.length !== products.length) {
      setProducts(healed);
      broadcastChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleUpdate = () => resyncProducts();

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('productsUpdated', handleUpdate);
    window.addEventListener('tradehub:products-changed', handleUpdate);
    window.addEventListener('tradehub-storage-update', handleUpdate);
    window.addEventListener('tradehub_products_updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('productsUpdated', handleUpdate);
      window.removeEventListener('tradehub:products-changed', handleUpdate);
      window.removeEventListener('tradehub-storage-update', handleUpdate);
      window.removeEventListener('tradehub_products_updated', handleUpdate);
    };
  }, [resyncProducts]);

  return (
    <ProductContext.Provider
      value={{
        products,
        rawProducts: products,
        resyncProducts,
        deleteProduct,
        getDepartmentCount,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
