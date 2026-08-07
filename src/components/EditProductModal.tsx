import React, { useState, useEffect, useCallback } from "react";
import { patchStoredProduct } from "../utils/productStorage";
import {
  X,
  Package,
  DollarSign,
  Layers,
  FileText,
  Hash,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  Trash2,
  FolderTree,
  Tag,
  Store,
  TriangleAlert,
  Sparkles,
} from "lucide-react";
import { updateProduct, getBrands, getImageUrl, type Brand } from "../services/productService";
import apiClient from "../services/apiClient";
import { useShop } from "../context/ShopContext";

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
  productCount: number;
  subcategories?: Subcategory[];
}

export interface EditProductModalProps {
  isOpen: boolean;
  product: any | null;
  onClose: () => void;
  onSuccess: (updatedProduct?: any) => void;
}

interface EditFormState {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  categoryId: number;
  subcategoryId?: number | null;
  brandId?: number | null;
}

const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Electronics",
    productCount: 0,
    subcategories: [
      { id: 1, categoryId: 1, name: "Phones & Tablets", slug: "phones" },
      { id: 2, categoryId: 1, name: "Computers & Laptops", slug: "laptops" },
      { id: 3, categoryId: 1, name: "Home Appliances", slug: "appliances" },
      { id: 4, categoryId: 1, name: "Audio & Gadgets", slug: "audio" },
    ],
  },
  {
    id: 2,
    name: "Fashion",
    productCount: 0,
    subcategories: [
      { id: 5, categoryId: 2, name: "Men's Clothing", slug: "men" },
      { id: 6, categoryId: 2, name: "Women's Clothing", slug: "women" },
      { id: 7, categoryId: 2, name: "Shoes & Sneakers", slug: "shoes" },
      { id: 8, categoryId: 2, name: "Accessories", slug: "accessories" },
    ],
  },
  {
    id: 3,
    name: "Home Decor",
    productCount: 0,
    subcategories: [
      { id: 9, categoryId: 3, name: "Furniture", slug: "furniture" },
      { id: 10, categoryId: 3, name: "Lighting", slug: "lighting" },
      { id: 11, categoryId: 3, name: "Kitchenware", slug: "kitchen" },
      { id: 12, categoryId: 3, name: "Textiles & Bedding", slug: "textiles" },
    ],
  },
  {
    id: 4,
    name: "Books",
    productCount: 0,
    subcategories: [
      { id: 13, categoryId: 4, name: "Fiction & Novels", slug: "fiction" },
      { id: 14, categoryId: 4, name: "Sci-Fi & Fantasy", slug: "scifi" },
      { id: 15, categoryId: 4, name: "Personal Dev.", slug: "personal" },
      { id: 16, categoryId: 4, name: "Kids Books", slug: "kids" },
    ],
  },
  {
    id: 5,
    name: "Fitness",
    productCount: 0,
    subcategories: [
      { id: 17, categoryId: 5, name: "Gym Equipment", slug: "gym" },
      { id: 18, categoryId: 5, name: "Sportswear", slug: "sportswear" },
      { id: 19, categoryId: 5, name: "Supplements", slug: "supplements" },
      { id: 20, categoryId: 5, name: "Smart Wearables", slug: "wearables" },
    ],
  },
  {
    id: 6,
    name: "Beverages",
    productCount: 0,
    subcategories: [
      { id: 21, categoryId: 6, name: "Hot Drinks", slug: "hot" },
      { id: 22, categoryId: 6, name: "Cold Drinks", slug: "cold" },
      { id: 23, categoryId: 6, name: "Energy Drinks", slug: "energy" },
      { id: 24, categoryId: 6, name: "Organic Juices", slug: "organic" },
    ],
  },
];

const FALLBACK_BRANDS: Brand[] = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Samsung" },
  { id: 3, name: "Sony" },
  { id: 4, name: "Bose" },
  { id: 5, name: "Dyson" },
  { id: 6, name: "Logitech" },
  { id: 7, name: "LG" },
  { id: 8, name: "Nike" },
  { id: 9, name: "Adidas" },
  { id: 10, name: "Zara" },
  { id: 11, name: "H&M" },
  { id: 12, name: "Casio" },
  { id: 13, name: "IKEA" },
  { id: 14, name: "Philips" },
  { id: 15, name: "Gymshark" },
  { id: 16, name: "Garmin" },
  { id: 17, name: "Decathlon" },
  { id: 18, name: "Starbucks" },
  { id: 19, name: "Penguin Books" },
  { id: 20, name: "O'Reilly Media" },
];

function getVendorName(): string {
  for (const key of ["vendora_user", "mockUser", "vendora_active_user"]) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name) return parsed.name as string;
      }
    } catch {
      /* ignore */
    }
  }
  return "Your Store";
}

const isImagePath = (str?: string): boolean => {
  if (!str) return false;
  const s = str.trim();
  if (!s) return false;
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('blob:') ||
    s.startsWith('data:') ||
    s.startsWith('/') ||
    s.includes('/uploads/') ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i.test(s)
  );
};

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onSuccess,
}) => {
  const { pushToast, bumpProductListVersion } = useShop();

  const [form, setForm] = useState<EditFormState>({
    name: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    lowStockThreshold: undefined,
    categoryId: 1,
    subcategoryId: null,
    brandId: null,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [vendorName, setVendorName] = useState<string>("Your Store");

  useEffect(() => {
    if (isOpen) {
      setVendorName(getVendorName());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    apiClient
      .get<never, Category[]>("/categories")
      .then((data) => setCategories(data && data.length > 0 ? data : FALLBACK_CATEGORIES))
      .catch(() => setCategories(FALLBACK_CATEGORIES));

    getBrands()
      .then((data) => setBrands(data && data.length > 0 ? data : FALLBACK_BRANDS))
      .catch(() => setBrands(FALLBACK_BRANDS));
  }, [isOpen]);

  // Populate data when product prop changes or modal opens
  useEffect(() => {
    if (!isOpen || !product) return;

    const rawName = product.name || product.title || "";
    const rawDesc = product.description || "";
    const rawPrice = typeof product.price === "number" ? product.price : parseFloat(product.price) || 0;
    const rawStock =
      typeof product.stockQuantity === "number"
        ? product.stockQuantity
        : typeof product.stock === "number"
        ? product.stock
        : parseInt(product.stock) || 0;
    const rawLowStock = product.lowStockThreshold ?? product.lowStockAlert ?? undefined;

    // Match category
    let foundCatId = product.categoryId || 1;
    if (!product.categoryId && product.category) {
      const catMatch = (categories.length > 0 ? categories : FALLBACK_CATEGORIES).find(
        (c) => c.name.toLowerCase() === String(product.category).toLowerCase()
      );
      if (catMatch) foundCatId = catMatch.id;
    }

    setForm({
      name: rawName,
      description: rawDesc,
      price: rawPrice,
      stockQuantity: rawStock,
      lowStockThreshold: rawLowStock,
      categoryId: foundCatId,
      subcategoryId: product.subcategoryId || null,
      brandId: product.brandId || null,
    });

    const rawImg = product.image || product.imageUrl || "";
    if (isImagePath(rawImg)) {
      setExistingImageUrl(rawImg);
    } else {
      setExistingImageUrl(null);
    }
    setSelectedFile(null);
    setImagePreview(null);
    setError(null);
    setSaved(false);
  }, [isOpen, product, categories]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const activeCategory = categories.find((c) => c.id === form.categoryId);
  const availableSubcategories = activeCategory?.subcategories ?? [];

  const handleClose = () => {
    setSelectedFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setExistingImageUrl(null);
    setDragActive(false);
    setError(null);
    setLoading(false);
    setSaved(false);
    onClose();
  };

  const set = <K extends keyof EditFormState>(field: K, val: EditFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (error) setError(null);
  };

  const handleCategoryChange = (catId: number) => {
    setForm((prev) => ({
      ...prev,
      categoryId: catId,
      subcategoryId: null,
    }));
    if (error) setError(null);
  };

  const processFile = (file: File) => {
    const valid = ["image/jpeg", "image/png", "image/webp"];
    if (!valid.includes(file.type)) {
      return setError("Invalid file format. Please upload a .jpg, .png, or .webp image.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return setError("File is too large. Maximum allowed size is 5 MB.");
    }
    setError(null);
    setSelectedFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setExistingImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return setError("Product name is required.");
    if (form.categoryId < 1) return setError("Please select a Category.");
    if (form.price <= 0) return setError("Price must be greater than zero.");
    if (form.stockQuantity < 0) return setError("Stock quantity cannot be negative.");

    setError(null);
    setLoading(true);

    const activeCat = (categories.length > 0 ? categories : FALLBACK_CATEGORIES).find(
      (c) => c.id === form.categoryId
    );

    const finalImage =
      imagePreview ||
      (selectedFile ? URL.createObjectURL(selectedFile) : null) ||
      existingImageUrl ||
      product?.image ||
      product?.imageUrl ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";

    try {
      let updatedProduct: any = null;
      if (product?.id) {
        try {
          updatedProduct = await updateProduct(product.id, {
            name: form.name.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            stockQuantity: Number(form.stockQuantity),
            lowStockThreshold:
              form.lowStockThreshold != null && Number(form.lowStockThreshold) > 0
                ? Number(form.lowStockThreshold)
                : null,
            categoryId: Number(form.categoryId),
            subcategoryId: form.subcategoryId ? Number(form.subcategoryId) : null,
            brandId: form.brandId ? Number(form.brandId) : null,
            imageFile: selectedFile,
          });
        } catch {
          // Fallback for mock mode
          updatedProduct = {
            ...product,
            id: product.id,
            name: form.name.trim(),
            title: form.name.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            stockQuantity: Number(form.stockQuantity),
            stock: Number(form.stockQuantity),
            category: activeCat?.name || product.category || "Electronics",
            image: finalImage,
            imageUrl: finalImage,
          };
        }
      }

      // Merge ALL original product fields first, then apply only the changed values.
      // This prevents fields like brand, subcategory, rating, status, vendorId etc.
      // from being silently lost when patchStoredProduct merges the update.
      const formattedItem = {
        ...(product ?? {}),                                           // ← keep every existing field
        id: product?.id || Date.now(),
        title: form.name.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        category: activeCat?.name || product?.category || 'Electronics',
        subcategoryId: form.subcategoryId || product?.subcategoryId || null,
        subcategory: (() => {
          const sub = (activeCat as any)?.subcategories?.find(
            (s: any) => s.id === form.subcategoryId
          );
          return sub?.name || product?.subcategory || null;
        })(),
        subcategorySlug: (() => {
          const sub = (activeCat as any)?.subcategories?.find(
            (s: any) => s.id === form.subcategoryId
          );
          return sub?.slug || product?.subcategorySlug || null;
        })(),
        price: Number(form.price),
        stock: Number(form.stockQuantity),
        stockQuantity: Number(form.stockQuantity),
        image: finalImage,
        imageUrl: finalImage,
        status: product?.status || 'Active',
      };

      // Persist to localStorage — upsert only this product without touching others
      try {
        patchStoredProduct(formattedItem);
        window.dispatchEvent(new CustomEvent('tradehub_products_updated'));
        window.dispatchEvent(new Event('tradehub:products-changed'));
      } catch {
        /* ignore */
      }

      setSaved(true);
      bumpProductListVersion();
      pushToast(`"${form.name.trim()}" has been updated successfully!`, "info");

      setTimeout(() => {
        onSuccess(formattedItem);
        handleClose();
      }, 600);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || "Failed to update product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  const inputClass =
    "w-full bg-[#151C2C] border border-slate-700/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const labelClass = "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5";

  const displayImageSrc = imagePreview || (existingImageUrl ? getImageUrl(existingImageUrl) : null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0B1120] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-[#0F172A]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Edit Product</h2>
              <p className="text-xs text-slate-400">Update your store catalog listing</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mr-8 bg-slate-800/60 border border-slate-700/50 rounded-full px-3 py-1">
            <Store className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-300 max-w-[130px] truncate">
              {vendorName}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col gap-6">
            {error && (
              <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {saved && (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Product updated successfully! Saving changes...</span>
              </div>
            )}

            {/* 1. Product Name */}
            <div>
              <label htmlFor="ep-name" className={labelClass}>
                Product Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <input
                  id="ep-name"
                  type="text"
                  required
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={`${inputClass} pl-9`}
                  disabled={loading}
                />
              </div>
            </div>

            {/* 2. Category, Subcategory, Brand: grid grid-cols-3 gap-4 */}
            <div className="grid grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label htmlFor="ep-category" className={labelClass}>
                  Category <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <select
                    id="ep-category"
                    required
                    value={form.categoryId === 0 ? "" : form.categoryId}
                    onChange={(e) => handleCategoryChange(Number(e.target.value))}
                    className={`${inputClass} pl-9 appearance-none cursor-pointer`}
                    disabled={loading}
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subcategory */}
              <div>
                <label htmlFor="ep-subcategory" className={labelClass}>
                  Subcategory
                </label>
                <div className="relative">
                  <FolderTree className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <select
                    id="ep-subcategory"
                    value={form.subcategoryId ?? ""}
                    onChange={(e) => set("subcategoryId", e.target.value ? Number(e.target.value) : null)}
                    className={`${inputClass} pl-9 appearance-none cursor-pointer`}
                    disabled={loading || !form.categoryId || form.categoryId === 0}
                  >
                    <option value="">
                      {!form.categoryId || form.categoryId === 0
                        ? "Select Category first..."
                        : "Select subcategory..."}
                    </option>
                    {availableSubcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Brand */}
              <div>
                <label htmlFor="ep-brand" className={labelClass}>
                  Brand
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <select
                    id="ep-brand"
                    value={form.brandId ?? ""}
                    onChange={(e) => set("brandId", e.target.value ? Number(e.target.value) : null)}
                    className={`${inputClass} pl-9 appearance-none cursor-pointer`}
                    disabled={loading}
                  >
                    <option value="">
                      Select brand...
                    </option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Price, Stock Quantity, Low Stock Alert: grid grid-cols-3 gap-4 */}
            <div className="grid grid-cols-3 gap-4">
              {/* Price */}
              <div>
                <label htmlFor="ep-price" className={labelClass}>
                  Price ($) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <input
                    id="ep-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="299.99"
                    value={form.price || ""}
                    onChange={(e) => set("price", Number(e.target.value))}
                    className={`${inputClass} pl-9`}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label htmlFor="ep-stock" className={labelClass}>
                  Stock Quantity <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <input
                    id="ep-stock"
                    type="number"
                    min="0"
                    required
                    placeholder="50"
                    value={form.stockQuantity || ""}
                    onChange={(e) => set("stockQuantity", Number(e.target.value))}
                    className={`${inputClass} pl-9`}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Low Stock Alert */}
              <div>
                <label htmlFor="ep-low-stock" className={labelClass}>
                  Low Stock Alert
                </label>
                <div className="relative">
                  <TriangleAlert className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <input
                    id="ep-low-stock"
                    type="number"
                    min="0"
                    placeholder="e.g. 5 (0 = Off)"
                    value={form.lowStockThreshold ?? ""}
                    onChange={(e) =>
                      set("lowStockThreshold", e.target.value === "" ? undefined : Number(e.target.value))
                    }
                    className={`${inputClass} pl-9`}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* 4. Description */}
            <div>
              <label htmlFor="ep-description" className={labelClass}>
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <textarea
                  id="ep-description"
                  rows={3}
                  placeholder="Describe key features, specs, materials..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  className={`${inputClass} pl-9 resize-none`}
                  disabled={loading}
                />
              </div>
            </div>

            {/* 5. Image Area */}
            <div>
              <label className={labelClass}>Product Image</label>
              {displayImageSrc ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group h-44">
                  <img
                    src={displayImageSrc}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove Image</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    dragActive
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-slate-800 hover:border-slate-700 bg-[#151C2C]/50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium mb-1">
                    Drag and drop image here, or{" "}
                    <label htmlFor="ep-file" className="text-indigo-400 hover:underline cursor-pointer font-bold">
                      browse
                    </label>
                  </p>
                  <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP up to 5MB</p>
                  <input
                    id="ep-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            {/* 6. Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-semibold transition-colors cursor-pointer"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || saved}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Updated!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
