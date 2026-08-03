import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Star, ShoppingCart, Heart, Check, Loader2,
  SearchX, Tag, X, Layers, Filter, RotateCcw, FolderTree, ChevronRight, Grid,
  DollarSign, SlidersHorizontal, Award, Search, ArrowUpDown, Eye,
} from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useCurrency } from "../context/CurrencyContext";
import { useTranslation } from "react-i18next";
import { QuickViewModal } from "./QuickViewModal";
import { getProducts } from "../services/api";
import { getBrands, type Brand } from "../services/productService";
import {
  mockCatalogProducts, categoriesData, colorStyles,
  findCategory, findSubcategory, type Category, type SubGroup,
} from "./ShopByCategory";

/* ─── Types ─────────────────────────────────────────────────── */
export interface ProductCardItem {
  id: number;
  title: string;
  brand: string;
  category: string;
  subcategoryId?: number | null;
  subcategory?: string | null;
  subcategorySlug?: string | null;
  brandId?: number | null;
  price: number;
  oldPrice?: number | null;
  rating: number;
  image: string;
  badge?: "Sale" | "New" | "Hot" | null;
  discount?: number;
  stock?: number;
  stockQuantity?: number;
}

/* ─── Image resolution helper ────────────────────────────────── */
const BACKEND_ORIGIN = "http://localhost:5229";
const PLACEHOLDER =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80";

const resolveImage = (raw?: string): string => {
  if (!raw) return PLACEHOLDER;
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("blob:") ||
    raw.startsWith("data:")
  )
    return raw;
  return `${BACKEND_ORIGIN}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

/* ─── Props ──────────────────────────────────────────────────── */
interface ProductGridProps {
  selectedCategory?: string | null;
  selectedSubcategory?: string | null;
  selectedBrand?: string | null;
  priceRange?: { min: number; max: number };
  onSelectCategory?: (category: string | null) => void;
  onSelectSubcategory?: (subcategory: string | null) => void;
  onSelectBrand?: (brand: string | null) => void;
  onResetAllFilters?: () => void;
}

/* ─── Sidebar Section Wrapper ────────────────────────────────── */
interface SidebarSectionProps {
  title: string;
  icon: React.ReactNode;
  onClear?: (e: React.MouseEvent) => void;
  showClear?: boolean;
  children: React.ReactNode;
}
const SidebarSection: React.FC<SidebarSectionProps> = ({
  title, icon, onClear, showClear, children,
}) => (
  <div className="bg-[#0B1120] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-3">
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-bold text-sm text-white tracking-tight">{title}</h3>
      </div>
      {showClear && onClear && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onClear(e);
          }}
          className="text-[11px] text-purple-400 hover:underline font-semibold cursor-pointer transition-colors"
        >
          Clear
        </button>
      )}
    </div>
    {children}
  </div>
);

/* ─── Main Component ─────────────────────────────────────────── */
export const ProductGrid: React.FC<ProductGridProps> = ({
  selectedCategory = null,
  selectedSubcategory = null,
  selectedBrand = null,
  priceRange: propPriceRange,
  onSelectCategory,
  onSelectSubcategory,
  onSelectBrand,
  onResetAllFilters,
}) => {
  const { addToCart, toggleWishlist, isWishlisted, pushToast, setMiniCartOpen } =
    useShop();
  const { formatPrice, symbol } = useCurrency();
  const { t } = useTranslation();

  const [allProducts, setAllProducts] = useState<ProductCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardItem | null>(null);

  /* ── Sidebar local filter state ─────────────────────────────── */
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [minRating, setMinRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  /* ── Search, Sort & Pagination state ─────────────────────────── */
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("default");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const ITEMS_PER_PAGE = 9;

  // Debounced price values — only sent to API after user stops typing
  const [debouncedMin, setDebouncedMin] = useState<string>("");
  const [debouncedMax, setDebouncedMax] = useState<string>("");
  const [dbBrands, setDbBrands] = useState<Brand[]>([]);

  /* ── Refs for auto-scroll ───────────────────────────────────── */
  const gridTopRef = useRef<HTMLElement | null>(null);
  const isInitialMount = useRef<boolean>(true);

  /* Auto-scroll smoothly to top of Product Grid when pageNumber changes explicitly */
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pageNumber]);

  /* Fetch all brands from DB once on mount */
  useEffect(() => {
    getBrands()
      .then((data) => {
        if (data) setDbBrands(data);
      })
      .catch((err) => console.error("Failed to load brands", err));
  }, []);

  /* Debounce price inputs — wait 500ms after last keystroke */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedMin(minPrice), 500);
    return () => clearTimeout(t);
  }, [minPrice]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMax(maxPrice), 500);
    return () => clearTimeout(t);
  }, [maxPrice]);

  /* Stable brand key for dependency tracking */
  const selectedBrandsKey = useMemo(
    () => Array.from(selectedBrands).sort().join(","),
    [selectedBrands]
  );

  /* Reset pagination to page 1 whenever ANY filter changes */
  useEffect(() => {
    setPageNumber(1);
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    selectedBrandsKey,
    debouncedMin,
    debouncedMax,
    minRating,
    searchTerm,
    sortOption,
  ]);

  /* Reset sidebar filters when top-level category/subcategory changes */
  useEffect(() => {
    setSelectedBrands(new Set());
    setMinPrice("");
    setMaxPrice("");
    setDebouncedMin("");
    setDebouncedMax("");
    setMinRating(null);
    setSearchTerm("");
    setSortOption("default");
    setPageNumber(1);
  }, [selectedCategory, selectedSubcategory]);

  /* ── Active objects ─────────────────────────────────────────── */
  const activeCatObj: Category | null = useMemo(
    () => findCategory(selectedCategory),
    [selectedCategory]
  );
  const activeSubObj: SubGroup | null = useMemo(
    () => findSubcategory(activeCatObj, selectedSubcategory),
    [activeCatObj, selectedSubcategory]
  );
  const currentTheme = activeCatObj
    ? colorStyles[activeCatObj.color]
    : colorStyles.purple;

  /* ── Fallback static catalog ────────────────────────────────── */
  const fallbackCardProducts: ProductCardItem[] = useMemo(
    () =>
      mockCatalogProducts.map((p) => {
        const catObj = categoriesData.find((c) => c.id === p.categoryId);
        const subObj = catObj?.subGroups.find((s) => s.id === p.subGroupId);
        return {
          id: p.id,
          title: p.name,
          brand: p.brand,
          category: catObj?.name ?? p.categoryId,
          subcategoryId: null,
          subcategory: subObj?.name ?? p.subGroupId,
          subcategorySlug: p.subGroupId,
          price: p.price,
          rating: p.rating,
          image: p.image,
        };
      }),
    []
  );

  /* ── Fetch products from API — triggered by filter changes ──── */
  useEffect(() => {
    setLoading(true);

    const params: import("../services/productService").ProductFilterParams = {};
    if (activeCatObj) params.category = activeCatObj.id;
    if (activeSubObj) params.subcategorySlug = activeSubObj.id;
    if (debouncedMin) params.minPrice = parseFloat(debouncedMin);
    if (debouncedMax) params.maxPrice = parseFloat(debouncedMax);
    if (minRating != null) params.minRating = minRating;

    if (selectedBrands.size > 0) {
      const brandIds = Array.from(selectedBrands)
        .map((name) => {
          const match = dbBrands.find(
            (b) => b.name.toLowerCase() === name.toLowerCase()
          );
          return match?.id ?? null;
        })
        .filter((id): id is number => id !== null);

      if (brandIds.length > 0) params.brandIds = brandIds;
    }

    getProducts(Object.keys(params).length > 0 ? params : undefined)
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((p) => ({
            id: p.id,
            title: p.title,
            brand: p.brand || p.category.toUpperCase(),
            category: p.category,
            subcategoryId: p.subcategoryId,
            subcategory: p.subcategory,
            subcategorySlug: p.subcategorySlug,
            price: p.price,
            rating: p.rating || 4.5,
            image: resolveImage(p.image),
            stockQuantity: (p as any).stockQuantity ?? undefined,
            stock: (p as any).stockQuantity ?? undefined,
          })) as ProductCardItem[];

          const brandFiltered =
            selectedBrands.size > 0
              ? mapped.filter((p) => selectedBrands.has(p.brand))
              : mapped;
          setAllProducts(brandFiltered);
        } else {
          // Use fallback static data — apply all filters client-side
          let fb = fallbackCardProducts;
          if (activeCatObj)
            fb = fb.filter(
              (p) =>
                p.category.toLowerCase() === activeCatObj.name.toLowerCase() ||
                p.category.toLowerCase() === activeCatObj.id
            );
          if (activeSubObj)
            fb = fb.filter(
              (p) =>
                p.subcategorySlug?.toLowerCase() === activeSubObj.id.toLowerCase() ||
                p.subcategory?.toLowerCase().includes(activeSubObj.name.toLowerCase())
            );
          if (selectedBrands.size > 0)
            fb = fb.filter((p) => selectedBrands.has(p.brand));
          if (debouncedMin) fb = fb.filter((p) => p.price >= parseFloat(debouncedMin));
          if (debouncedMax) fb = fb.filter((p) => p.price <= parseFloat(debouncedMax));
          if (minRating != null) fb = fb.filter((p) => p.rating >= minRating);
          setAllProducts(fb);
        }
      })
      .catch(() => {
        let fb = fallbackCardProducts;
        if (activeCatObj)
          fb = fb.filter(
            (p) =>
              p.category.toLowerCase() === activeCatObj.name.toLowerCase() ||
              p.category.toLowerCase() === activeCatObj.id
          );
        if (activeSubObj)
          fb = fb.filter(
            (p) =>
              p.subcategorySlug?.toLowerCase() === activeSubObj.id.toLowerCase() ||
              p.subcategory?.toLowerCase().includes(activeSubObj.name.toLowerCase())
          );
        if (selectedBrands.size > 0)
          fb = fb.filter((p) => selectedBrands.has(p.brand));
        if (debouncedMin) fb = fb.filter((p) => p.price >= parseFloat(debouncedMin));
        if (debouncedMax) fb = fb.filter((p) => p.price <= parseFloat(debouncedMax));
        if (minRating != null) fb = fb.filter((p) => p.rating >= minRating);
        setAllProducts(fb);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeCatObj,
    activeSubObj,
    debouncedMin,
    debouncedMax,
    minRating,
    selectedBrandsKey,
  ]);

  /* ── Filtered & Sorted products list ────────────────────────── */
  const processedProducts = useMemo(() => {
    let list = [...allProducts];

    // Client-side search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Client-side sorting
    if (sortOption === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === "rating-desc") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [allProducts, searchTerm, sortOption]);

  /* ── Pagination ─────────────────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(processedProducts.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(pageNumber, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [processedProducts, currentPage]);

  /* ── Available brands ───────────────────────────────────────── */
  const availableBrands = useMemo(() => {
    const source = fallbackCardProducts.filter((p) => {
      let mc = true;
      if (activeCatObj) {
        const pc = p.category.toLowerCase();
        mc = pc === activeCatObj.name.toLowerCase() || pc === activeCatObj.id;
      }
      let ms = true;
      if (activeSubObj) {
        const ss = activeSubObj.id.toLowerCase();
        ms =
          p.subcategorySlug?.toLowerCase() === ss ||
          (p.subcategory?.toLowerCase().includes(ss) ?? false);
      }
      return mc && ms;
    });
    return Array.from(new Set(source.map((p) => p.brand).filter(Boolean))).sort();
  }, [fallbackCardProducts, activeCatObj, activeSubObj]);

  /* ── Dynamic price range calculation ───────────────────────── */
  const calculatedPriceRange = useMemo(() => {
    const source = (allProducts.length > 0 ? allProducts : fallbackCardProducts).filter((p) => {
      let mc = true;
      if (activeCatObj) {
        const pc = p.category.toLowerCase();
        mc = pc === activeCatObj.name.toLowerCase() || pc === activeCatObj.id;
      }
      let ms = true;
      if (activeSubObj) {
        const ss = activeSubObj.id.toLowerCase();
        ms =
          p.subcategorySlug?.toLowerCase() === ss ||
          (p.subcategory?.toLowerCase().includes(ss) ?? false);
      }
      return mc && ms;
    });

    const productsToUse = source.length > 0 ? source : fallbackCardProducts;
    if (productsToUse.length === 0) {
      return { min: 0, max: 1000 };
    }

    const prices = productsToUse.map((p) => p.price);
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    return { min, max };
  }, [allProducts, fallbackCardProducts, activeCatObj, activeSubObj]);

  const priceRange = propPriceRange ?? calculatedPriceRange;

  /* ── Handlers ───────────────────────────────────────────────── */
  const toggleBrand = useCallback((brand: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  }, []);

  const handleClearPrice = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    setMinPrice("");
    setMaxPrice("");
    setDebouncedMin("");
    setDebouncedMax("");
  }, []);

  const handleResetAll = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    setSelectedBrands(new Set());
    setMinPrice("");
    setMaxPrice("");
    setDebouncedMin("");
    setDebouncedMax("");
    setMinRating(null);
    setSearchTerm("");
    setSortOption("default");
    setPageNumber(1);
    onResetAllFilters?.();
  }, [onResetAllFilters]);

  const handleAddToCart = (product: ProductCardItem, e?: React.MouseEvent) => {
    e?.preventDefault();
    const availableStock = product.stockQuantity ?? product.stock;
    addToCart({
      id: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      image: product.image,
      stock: availableStock,
      stockQuantity: availableStock,
    });
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(
      () => setAddedIds((prev) => ({ ...prev, [product.id]: false })),
      1500
    );
    pushToast(
      `"${product.title.split(" ").slice(0, 3).join(" ")}..." added to cart!`,
      "cart"
    );
    setMiniCartOpen(true);
  };

  const handleToggleWishlist = (product: ProductCardItem, e?: React.MouseEvent) => {
    e?.preventDefault();
    const wasInList = isWishlisted(product.id);
    toggleWishlist({
      id: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      image: product.image,
    });
    pushToast(
      wasInList
        ? "Removed from wishlist"
        : `Added "${product.title.split(" ").slice(0, 3).join(" ")}..." to wishlist`,
      "wishlist"
    );
  };

  /* ── Has active filters check ───────────────────────────────── */
  const hasActiveFilters = Boolean(
    activeCatObj || activeSubObj || selectedBrand ||
    selectedBrands.size > 0 || minPrice || maxPrice || minRating || searchTerm || sortOption !== "default"
  );

  return (
    <section ref={gridTopRef} className="w-full bg-[#060913] py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Breadcrumb & Filter Pill Header ──────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800/80 pb-5 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span>Catalog</span>
              {activeCatObj && (
                <>
                  <span>/</span>
                  <span className={currentTheme.text}>{activeCatObj.name}</span>
                </>
              )}
              {activeSubObj && (
                <>
                  <span>/</span>
                  <span className="text-white">{activeSubObj.name}</span>
                </>
              )}
              {selectedBrand && (
                <>
                  <span>/</span>
                  <span className="text-amber-400">{selectedBrand}</span>
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeCatObj ? activeCatObj.name : t('catalog.title')}
            </h2>
            <p className="text-sm text-slate-400">
              {t('catalog.showing')}{" "}
              <span className="text-white font-bold">{processedProducts.length}</span>{" "}
              {t('catalog.productsMatching')}.
            </p>
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 mr-1">
                <Filter className="w-3 h-3 text-purple-400" />
                Active:
              </span>
              {activeCatObj && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); onSelectCategory?.(null); }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer ${currentTheme.border} ${currentTheme.bg} ${currentTheme.text} hover:opacity-80`}
                >
                  <Layers className="w-3 h-3" />
                  {activeCatObj.name}
                  <X className="w-3 h-3 ml-1" />
                </button>
              )}
              {activeSubObj && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); onSelectSubcategory?.(null); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500"
                >
                  <FolderTree className="w-3 h-3 text-purple-400" />
                  {activeSubObj.name}
                  <X className="w-3 h-3 ml-1" />
                </button>
              )}
              {selectedBrand && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); onSelectBrand?.(null); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer border-amber-500/50 bg-amber-500/10 text-amber-300 hover:border-amber-400"
                >
                  <Tag className="w-3 h-3 text-amber-400" />
                  {selectedBrand}
                  <X className="w-3 h-3 ml-1" />
                </button>
              )}
              {selectedBrands.size > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setSelectedBrands(new Set()); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer border-amber-500/50 bg-amber-500/10 text-amber-300 hover:border-amber-400"
                >
                  <Tag className="w-3 h-3 text-amber-400" />
                  {selectedBrands.size} brand{selectedBrands.size > 1 ? "s" : ""}
                  <X className="w-3 h-3 ml-1" />
                </button>
              )}
              {(minPrice || maxPrice) && (
                <button
                  type="button"
                  onClick={(e) => handleClearPrice(e)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400"
                >
                  <DollarSign className="w-3 h-3" />
                  {minPrice && maxPrice
                    ? `${formatPrice(Number(minPrice))}–${formatPrice(Number(maxPrice))}`
                    : minPrice
                    ? `≥${formatPrice(Number(minPrice))}`
                    : `≤${formatPrice(Number(maxPrice))}`}
                  <X className="w-3 h-3 ml-1" />
                </button>
              )}
              {minRating !== null && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setMinRating(null); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer border-amber-500/40 bg-amber-500/10 text-amber-300 hover:border-amber-400"
                >
                  <Star className="w-3 h-3 fill-amber-400" />
                  {minRating}★ & up
                  <X className="w-3 h-3 ml-1" />
                </button>
              )}
              {searchTerm && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setSearchTerm(""); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer border-purple-500/40 bg-purple-500/10 text-purple-300 hover:border-purple-400"
                >
                  <Search className="w-3 h-3" />
                  "{searchTerm}"
                  <X className="w-3 h-3 ml-1" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => handleResetAll(e)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All
              </button>
            </div>
          )}
        </div>

        {/* ── MAIN LAYOUT: SIDEBAR + PRODUCTS ─────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ════════════════════════════════════════════════════
              LEFT SIDEBAR — sticky, full-height advanced filters
              ════════════════════════════════════════════════════ */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">

            {/* ── 1. DEPARTMENTS ─────────────────────────────── */}
            <SidebarSection
              title={activeCatObj ? `${activeCatObj.name} ${t('catalog.departments')}` : t('catalog.departments')}
              icon={<FolderTree className={`w-4 h-4 ${activeCatObj ? currentTheme.text : "text-purple-400"}`} />}
              showClear={!!activeSubObj}
              onClear={(e) => { e.preventDefault(); onSelectSubcategory?.(null); }}
            >
              <div className="flex flex-col gap-1">
                {activeCatObj ? (
                  <>
                    {/* All category */}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); onSelectSubcategory?.(null); }}
                      className={[
                        "w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left",
                        !activeSubObj
                          ? `${currentTheme.bg} ${currentTheme.text} border ${currentTheme.border}`
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2.5">
                        <Grid className="w-4 h-4" />
                        <span>All {activeCatObj.name}</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {allProducts.filter(
                          (p) =>
                            p.category.toLowerCase() === activeCatObj.name.toLowerCase() ||
                            p.category.toLowerCase() === activeCatObj.id
                        ).length}
                      </span>
                    </button>

                    {/* Sub-departments */}
                    {activeCatObj.subGroups.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSelected =
                        activeSubObj?.id.toLowerCase() === sub.id.toLowerCase();
                      const count = allProducts.filter(
                        (p) =>
                          p.subcategorySlug?.toLowerCase() === sub.id.toLowerCase() ||
                          p.subcategory?.toLowerCase().includes(sub.name.toLowerCase())
                      ).length;

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={(e) => { e.preventDefault(); onSelectSubcategory?.(sub.id); }}
                          className={[
                            "w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left",
                            isSelected
                              ? `${currentTheme.bg} ${currentTheme.text} border ${currentTheme.border}`
                              : "text-slate-400 hover:bg-slate-800/60 hover:text-white",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-2.5">
                            <SubIcon className={`w-4 h-4 ${isSelected ? currentTheme.text : "text-slate-500"}`} />
                            <span>{sub.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected ? `${currentTheme.bg} ${currentTheme.text}` : "bg-slate-800 text-slate-500"
                            }`}>
                              {count}
                            </span>
                            {isSelected && <ChevronRight className={`w-3.5 h-3.5 ${currentTheme.text}`} />}
                          </div>
                        </button>
                      );
                    })}
                  </>
                ) : (
                  /* No category selected — show main categories */
                  categoriesData.map((cat) => {
                    const CatIcon = cat.icon;
                    const style = colorStyles[cat.color];
                    const count = allProducts.filter(
                      (p) =>
                        p.category.toLowerCase() === cat.name.toLowerCase() ||
                        p.category.toLowerCase() === cat.id
                    ).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={(e) => { e.preventDefault(); onSelectCategory?.(cat.id); }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <CatIcon className={`w-4 h-4 ${style.text}`} />
                          <span>{cat.name}</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">
                          {count}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </SidebarSection>

            {/* ── 2. PRICE RANGE ─────────────────────────────── */}
            <SidebarSection
              title={t('catalog.priceRange')}
              icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
              showClear={!!(minPrice || maxPrice)}
              onClear={(e) => handleClearPrice(e)}
            >
              <div className="space-y-3">
                {/* Min/Max inputs */}
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">{symbol}</span>
                    <input
                      type="number"
                      placeholder={String(priceRange.min)}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      onBlur={() => setDebouncedMin(minPrice)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          setDebouncedMin(minPrice);
                        }
                      }}
                      min={0}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-6 pr-2 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <span className="text-slate-600 text-xs font-bold flex-shrink-0">{t('catalog.to')}</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">{symbol}</span>
                    <input
                      type="number"
                      placeholder={String(priceRange.max)}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      onBlur={() => setDebouncedMax(maxPrice)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          setDebouncedMax(maxPrice);
                        }
                      }}
                      min={0}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-6 pr-2 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Quick-select price buckets */}
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: `${t('catalog.under')} ${formatPrice(50)}`, min: "", max: "50" },
                    { label: `${formatPrice(50)}–${formatPrice(200)}`, min: "50", max: "200" },
                    { label: `${formatPrice(200)}–${formatPrice(500)}`, min: "200", max: "500" },
                    { label: `${t('catalog.over')} ${formatPrice(500)}`, min: "500", max: "" },
                  ].map((bucket) => {
                    const isActive = minPrice === bucket.min && maxPrice === bucket.max;
                    return (
                      <button
                        key={bucket.label}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (isActive) {
                            setMinPrice("");
                            setMaxPrice("");
                            setDebouncedMin("");
                            setDebouncedMax("");
                          } else {
                            setMinPrice(bucket.min);
                            setMaxPrice(bucket.max);
                            setDebouncedMin(bucket.min);
                            setDebouncedMax(bucket.max);
                          }
                        }}
                        className={[
                          "text-[10px] font-semibold px-2 py-1.5 rounded-lg border transition-all cursor-pointer text-center",
                          isActive
                            ? "bg-emerald-500/15 border-emerald-500/60 text-emerald-300"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200",
                        ].join(" ")}
                      >
                        {bucket.label}
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic range display */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-800">
                  <span>{t('catalog.available')}: {formatPrice(priceRange.min)}</span>
                  <span className="text-slate-600">–</span>
                  <span>{formatPrice(priceRange.max)}</span>
                </div>
              </div>
            </SidebarSection>

            {/* ── 3. BRANDS (checkbox multi-select) ──────────── */}
            {availableBrands.length > 0 && (
              <SidebarSection
                title={t('catalog.brands')}
                icon={<Tag className="w-4 h-4 text-amber-400" />}
                showClear={selectedBrands.size > 0}
                onClear={(e) => { e.preventDefault(); setSelectedBrands(new Set()); }}
              >
                <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
                  {availableBrands.map((brand) => {
                    const isChecked = selectedBrands.has(brand);
                    const count = allProducts.filter((p) => p.brand === brand).length;
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={(e) => toggleBrand(brand, e)}
                        className={[
                          "w-full flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-all text-left",
                          isChecked
                            ? "bg-amber-500/10 border border-amber-500/30"
                            : "hover:bg-slate-800/60 border border-transparent",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={[
                              "w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-all",
                              isChecked
                                ? "bg-amber-500 border-amber-500"
                                : "bg-slate-900 border-slate-600 group-hover:border-slate-400",
                            ].join(" ")}
                          >
                            {isChecked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                          </span>
                          <span className={`text-xs font-semibold transition-colors ${isChecked ? "text-amber-300" : "text-slate-400 group-hover:text-white"}`}>
                            {brand}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </SidebarSection>
            )}

            {/* ── 4. RATING FILTER ───────────────────────────── */}
            <SidebarSection
              title={t('catalog.minRating')}
              icon={<Award className="w-4 h-4 text-yellow-400" />}
              showClear={minRating !== null}
              onClear={(e) => {
                e.preventDefault();
                setMinRating(null);
                setPageNumber(1);
              }}
            >
              <div className="flex flex-col gap-1.5">
                {[5, 4, 3, 2].map((stars) => {
                  const isSelected = minRating === stars;
                  const isHovered = hoveredRating === stars;

                  return (
                    <button
                      key={stars}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setMinRating((prev) => (prev === stars ? null : stars));
                        setPageNumber(1);
                      }}
                      onMouseEnter={() => setHoveredRating(stars)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className={[
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer",
                        isSelected
                          ? "bg-amber-500/15 border-amber-500/50"
                          : "border-transparent hover:bg-slate-800/60",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 transition-all ${
                                s <= stars
                                  ? isSelected || isHovered
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-amber-500/60 text-amber-500/60"
                                  : "fill-slate-800 text-slate-800"
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-xs font-semibold ${isSelected ? "text-amber-300" : "text-slate-400"}`}>
                          {stars} Stars & up
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </SidebarSection>

            {/* ── 5. RESET ALL button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={(e) => handleResetAll(e)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-bold hover:bg-rose-500/20 hover:border-rose-500/50 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('catalog.resetFilters')}
              </button>
            )}

          </aside>

          {/* ═══════════════════════════════════════
              RIGHT: SEARCH BAR, SORT & PRODUCT GRID
              ═══════════════════════════════════════ */}
          <main className="flex-1 w-full space-y-6">

            {/* Toolbar: Search input & Sort dropdown */}
            <div className="bg-[#0B1120] border border-slate-800/80 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search filter input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setSearchTerm(""); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-400 font-semibold flex-shrink-0">{t('catalog.sort')}:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                >
                  <option value="default">{t('catalog.featured')}</option>
                  <option value="price-asc">{t('catalog.priceLowHigh')}</option>
                  <option value="price-desc">{t('catalog.priceHighLow')}</option>
                  <option value="rating-desc">{t('catalog.highestRated')}</option>
                </select>
              </div>
            </div>

            {/* Grid contents */}
            {loading ? (
              /* Animated Skeleton Grid Loader */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0B1120] border border-slate-800/80 rounded-2xl overflow-hidden animate-pulse flex flex-col h-[380px]"
                  >
                    <div className="h-52 bg-slate-900/80 w-full" />
                    <div className="p-5 flex-1 flex flex-col gap-3">
                      <div className="h-3 bg-slate-800 rounded w-1/3" />
                      <div className="h-5 bg-slate-800 rounded w-3/4" />
                      <div className="h-4 bg-slate-800 rounded w-1/2" />
                      <div className="mt-auto pt-3 border-t border-slate-800 flex justify-between items-center">
                        <div className="h-6 bg-slate-800 rounded w-20" />
                        <div className="h-9 w-9 bg-slate-800 rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : processedProducts.length === 0 ? (
              /* Empty state */
              <div className="bg-[#0B1120] border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xl">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                  <SearchX className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No products found</h3>
                <p className="text-slate-400 text-xs max-w-xs mb-6 leading-relaxed">
                  No items match the selected combination of filters. Try broadening your search.
                </p>
                <button
                  type="button"
                  onClick={(e) => handleResetAll(e)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => {
                    const wishlisted = isWishlisted(product.id);
                    const justAdded = !!addedIds[product.id];

                    return (
                      <article
                        key={product.id}
                        className="group relative bg-[#0B1120] border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl"
                      >
                        {/* Image */}
                        <div className="relative h-52 w-full overflow-hidden bg-slate-950 rounded-t-2xl cursor-pointer">
                          <Link to={`/product/${product.id}`} className="block w-full h-full">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                            />
                          </Link>
                          {/* Centered Quick View button overlay */}
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setQuickViewProduct(product);
                              }}
                              className="pointer-events-auto inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              {t('product.quickView')}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleToggleWishlist(product, e)}
                            className={`absolute top-3 right-3 z-10 p-2.5 rounded-full backdrop-blur-md border transition-all cursor-pointer hover:scale-110 ${
                              wishlisted
                                ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                                : "bg-slate-900/80 border-slate-700/50 text-slate-400 hover:text-rose-400"
                            }`}
                            aria-label="Wishlist"
                          >
                            <Heart
                              className={`h-4 w-4 transition-all duration-200 ${
                                wishlisted ? "fill-rose-500 text-rose-500 scale-110" : ""
                              }`}
                            />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-5 flex flex-col gap-2.5">
                          <div className="flex items-center justify-between text-[10px] font-bold tracking-widest">
                            <span className="uppercase text-amber-400 font-extrabold">{product.brand}</span>
                            <span className="text-purple-400">{product.category}</span>
                          </div>
                          <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 transition-colors">
                            <Link to={`/product/${product.id}`} className="hover:text-purple-400 transition-colors">
                              {product.title}
                            </Link>
                          </h3>
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3.5 w-3.5 ${
                                    s <= Math.round(product.rating)
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-slate-800 text-slate-800"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-semibold text-slate-400 ml-1">
                              {product.rating.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800/80">
                            <span className="text-lg font-bold text-white">
                              {formatPrice(product.price)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleAddToCart(product, e)}
                              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                                justAdded
                                  ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 scale-110"
                                  : "border-slate-700 bg-slate-900/50 hover:bg-purple-600 hover:border-purple-500 hover:text-white text-slate-300"
                              }`}
                              aria-label="Add to cart"
                            >
                              {justAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-6 mt-8 gap-4">
                    <p className="text-xs text-slate-400 font-medium">
                      Showing{" "}
                      <span className="font-bold text-white">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                      </span>
                      –
                      <span className="font-bold text-white">
                        {Math.min(currentPage * ITEMS_PER_PAGE, processedProducts.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-white">{processedProducts.length}</span> products
                    </p>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setPageNumber((p) => Math.max(1, p - 1));
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setPageNumber(pg);
                          }}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            pg === currentPage
                              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                              : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          {pg}
                        </button>
                      ))}

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={(e) => {
                          e.preventDefault();
                          setPageNumber((p) => Math.min(totalPages, p + 1));
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

          </main>

        </div>
      </div>
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct as any}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </section>
  );
};