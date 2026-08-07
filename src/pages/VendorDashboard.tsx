import React, { useState, useRef, useEffect } from 'react';
import { patchStoredProduct, removeStoredProduct } from '../utils/productStorage';
import { getImageUrl } from '../services/productService';
import {
  LayoutDashboard, Package, ShoppingCart, TrendingUp, Settings, LogOut,
  DollarSign, Users, ArrowUpRight, ArrowDownRight, Pencil, Trash2, Plus,
  X, Check, CreditCard, Building2, Mail, Store, Eye, AlertCircle,
  CheckCircle2, Activity, Percent, Save, UploadCloud, AtSign, Share2,
  Globe, Loader2, Calendar, MapPin, Clock, ChevronRight, Truck, Image as ImageIcon, Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RecentOrdersTable } from '../components/RecentOrdersTable';

// ─── Types ─────────────────────────────────────────────────────────────────────

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
type ProductStatus = 'Active' | 'Draft' | 'Out of Stock';

interface Product {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  stock: number;
  lowStockThreshold?: number;
  status: ProductStatus;
  image: string;
  description: string;
}

const SUBCATEGORIES_MAP: Record<string, string[]> = {
  'Electronics': ['Phones & Tablets', 'Computers & Laptops', 'Home Appliances', 'Audio & Gadgets'],
  'Fashion': ["Men's Clothing", "Women's Clothing", 'Shoes & Sneakers', 'Accessories'],
  'Home Decor': ['Furniture', 'Lighting', 'Kitchenware', 'Textiles & Bedding'],
  'Furniture': ['Chairs & Sofas', 'Tables & Desks', 'Beds & Wardrobes', 'Outdoor Furniture'],
  'Books': ['Fiction & Novels', 'Sci-Fi & Fantasy', 'Personal Dev.', 'Kids Books'],
  'Fitness': ['Gym Equipment', 'Sportswear', 'Supplements', 'Smart Wearables'],
  'Beverages': ['Hot Drinks', 'Cold Drinks', 'Energy Drinks', 'Organic Juices'],
};

const BRANDS_LIST = [
  'Generic / Unbranded', 'Apple', 'Samsung', 'Sony', 'Bose', 'Dyson', 'Logitech', 'LG',
  'Nike', 'Adidas', 'Zara', 'H&M', 'Casio', 'IKEA', 'Philips', 'Starbucks'
];

interface OrderItem { emoji: string; name: string; qty: number; price: number; }
interface Order {
  id: string; customer: string; email: string; date: string;
  total: number; payment: string; status: OrderStatus;
  address: string; items: OrderItem[];
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Wireless ANC Headphones',    category: 'Electronics', price: 149.99, stock: 42,  status: 'Active',        image: '🎧', description: 'Premium noise-cancelling wireless headphones with 30h battery.' },
  { id: 2, name: 'Mechanical Gaming Keyboard',  category: 'Electronics', price: 89.99,  stock: 18,  status: 'Active',        image: '⌨️', description: 'Tactile RGB mechanical keyboard with Cherry MX switches.' },
  { id: 3, name: 'Ergonomic Office Chair',      category: 'Furniture',   price: 329.00, stock: 7,   status: 'Active',        image: '🪑', description: 'Lumbar-support mesh chair for all-day comfort.' },
  { id: 4, name: '4K Ultra-Wide Monitor',       category: 'Electronics', price: 549.99, stock: 0,   status: 'Out of Stock',  image: '🖥️', description: '34-inch curved 4K ultrawide, 165Hz gaming monitor.' },
  { id: 5, name: 'Leather Minimalist Wallet',   category: 'Fashion',     price: 34.99,  stock: 120, status: 'Active',        image: '👛', description: 'Slim genuine leather bifold wallet, RFID protected.' },
  { id: 6, name: 'Smart Fitness Tracker',       category: 'Fitness',     price: 79.99,  stock: 55,  status: 'Draft',         image: '⌚', description: 'Heart-rate, SpO2 and sleep tracking smartband.' },
];

const INITIAL_ORDERS: Order[] = [
  { id: '#VND-8821', customer: 'Sarah Johnson',  email: 'sarah@email.com',  date: '2025-07-18', total: 239.98, payment: 'Card',          status: 'Delivered',
    address: '42 Maple Avenue, New York, NY 10001, USA',
    items: [{ emoji:'🎧', name:'Wireless ANC Headphones', qty:1, price:149.99 }, { emoji:'👛', name:'Leather Minimalist Wallet', qty:2, price:44.99 }] },
  { id: '#VND-8820', customer: 'Marcus Lee',     email: 'marcus@email.com', date: '2025-07-17', total: 549.99, payment: 'PayPal',        status: 'Shipped',
    address: '17 Oak Street, San Francisco, CA 94102, USA',
    items: [{ emoji:'🖥️', name:'4K Ultra-Wide Monitor', qty:1, price:549.99 }] },
  { id: '#VND-8819', customer: 'Aisha Patel',    email: 'aisha@email.com',  date: '2025-07-16', total: 89.99,  payment: 'Card',          status: 'Processing',
    address: '8 Elm Close, London, E1 6RF, United Kingdom',
    items: [{ emoji:'⌨️', name:'Mechanical Gaming Keyboard', qty:1, price:89.99 }] },
  { id: '#VND-8818', customer: 'Tom Ritter',     email: 'tom@email.com',    date: '2025-07-15', total: 364.99, payment: 'Bank Transfer', status: 'Pending',
    address: 'Bahnhofstr. 12, 80335 München, Germany',
    items: [{ emoji:'🪑', name:'Ergonomic Office Chair', qty:1, price:329.00 }, { emoji:'⌚', name:'Smart Fitness Tracker', qty:1, price:35.99 }] },
  { id: '#VND-8817', customer: 'Lena Müller',    email: 'lena@email.com',   date: '2025-07-14', total: 34.99,  payment: 'Card',          status: 'Delivered',
    address: 'Kurfürstendamm 23, 10719 Berlin, Germany',
    items: [{ emoji:'👛', name:'Leather Minimalist Wallet', qty:1, price:34.99 }] },
  { id: '#VND-8816', customer: 'Carlos Mendez',  email: 'carlos@email.com', date: '2025-07-12', total: 79.99,  payment: 'PayPal',        status: 'Cancelled',
    address: 'Av. Insurgentes Sur 1234, Ciudad de México, CDMX 03920, México',
    items: [{ emoji:'⌚', name:'Smart Fitness Tracker', qty:1, price:79.99 }] },
];

const MONTHLY_DATA = [
  { month: 'Jan', value: 3200, pct: 38 }, { month: 'Feb', value: 4100, pct: 49 },
  { month: 'Mar', value: 3750, pct: 44 }, { month: 'Apr', value: 5200, pct: 62 },
  { month: 'May', value: 4800, pct: 57 }, { month: 'Jun', value: 6300, pct: 75 },
  { month: 'Jul', value: 7100, pct: 84 }, { month: 'Aug', value: 5900, pct: 70 },
  { month: 'Sep', value: 8400, pct: 100 },{ month: 'Oct', value: 7600, pct: 90 },
  { month: 'Nov', value: 6200, pct: 74 }, { month: 'Dec', value: 7800, pct: 93 },
];

const ANALYTICS_BY_RANGE: Record<string, typeof MONTHLY_DATA> = {
  'Last 7 Days':  MONTHLY_DATA.slice(9),
  'Last 30 Days': MONTHLY_DATA.slice(6),
  'This Year':    MONTHLY_DATA,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const stockBadge = (stock: number) => {
  if (stock === 0) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-red-500/10 text-red-400 border-red-500/20">Out of Stock</span>;
  if (stock < 10)  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-amber-500/10 text-amber-400 border-amber-500/20">Low Stock · {stock}</span>;
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">In Stock · {stock}</span>;
};

const orderTimelineSteps: Record<OrderStatus, number> = {
  Pending: 0, Processing: 1, Shipped: 2, Delivered: 3, Cancelled: -1,
};

const inputCls = 'w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/60 transition-all';

const isImageSrc = (img?: string) => {
  if (!img) return false;
  if (img === '📦' || [...img].length <= 2) return false;
  return (
    img.startsWith('data:image/') ||
    img.startsWith('http://') ||
    img.startsWith('https://') ||
    img.startsWith('/') ||
    img.startsWith('blob:') ||
    img.startsWith('uploads/') ||
    img.includes('/') ||
    img.includes('.')
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────

export const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const logoInputRef   = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // ── Navigation
  const [activeTab, setActiveTab] = useState('Dashboard');

  // ── Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('tradehub_products') || localStorage.getItem('vendora_vendor_products');
      if (stored && stored !== "[]") {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let deletedIds: number[] = [];
          try {
            const delRaw = localStorage.getItem('vendora_deleted_product_ids');
            if (delRaw) deletedIds = JSON.parse(delRaw);
          } catch {}

          return parsed
            .filter((p: any) => !deletedIds.includes(p.id))
            .map((p: any) => ({
              id: p.id,
              name: p.name || p.title || 'Product',
              category: p.category || 'Electronics',
              subcategory: p.subcategory || '',
              brand: p.brand || '',
              price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
              stock: typeof p.stock === 'number' ? p.stock : (p.stockQuantity ?? 0),
              lowStockThreshold: p.lowStockThreshold,
              status: p.status || (p.stock === 0 || p.stockQuantity === 0 ? 'Out of Stock' : 'Active'),
              image: p.image || p.imageUrl || p.img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
              description: p.description || '',
            }));
        }
      }
    } catch {}
    try {
      localStorage.setItem('tradehub_products', JSON.stringify(INITIAL_PRODUCTS));
    } catch {}
    return INITIAL_PRODUCTS;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Electronics',
    subcategory: 'Audio & Gadgets',
    brand: 'Generic / Unbranded',
    price: '',
    stock: '',
    lowStockThreshold: '5',
    status: 'Active' as ProductStatus,
    image: '📦',
    description: '',
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // ── Orders
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);

  // ── Analytics
  const [dateRange, setDateRange] = useState('This Year');

  // ── Settings (initialized from persistent storage or active session)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('vendora_vendor_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            storeName:      parsed.storeName ?? 'TechStore Co.',
            description:    parsed.description ?? 'Premium electronics and lifestyle products for the modern buyer.',
            email:          parsed.email ?? 'support@techstore.com',
            phoneCode:      parsed.phoneCode ?? '+1',
            phoneNumber:    parsed.phoneNumber ?? '(555) 204-9900',
            payoutMethod:   parsed.payoutMethod ?? 'Bank Transfer',
            iban:           parsed.iban ?? 'DE89 3704 0044 0532 0130 00',
            bankName:       parsed.bankName ?? 'Deutsche Bank',
            accountHolder:  parsed.accountHolder ?? 'TechStore Co. LLC',
            payoutSchedule: parsed.payoutSchedule ?? 'Monthly',
            instagram:      parsed.instagram ?? 'techstore.co',
            facebook:       parsed.facebook ?? 'TechStoreCo',
            website:        parsed.website ?? 'https://techstore.co',
            logoUrl:        parsed.logoUrl ?? '',
            bannerUrl:      parsed.bannerUrl ?? '',
            vacationMode:   parsed.vacationMode ?? false,
          };
        }
      } catch {
        /* ignore */
      }
    }
    // Fallback to active session logo if present
    const rawUser = localStorage.getItem('vendora_user') || localStorage.getItem('mockUser') || localStorage.getItem('vendora_active_user');
    let userLogo = '';
    let userName = 'TechStore Co.';
    let userEmail = 'support@techstore.com';
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u.logoUrl) userLogo = u.logoUrl;
        if (u.name) userName = u.name;
        if (u.email) userEmail = u.email;
      } catch {}
    }
    return {
      storeName:      userName,
      description:    'Premium electronics and lifestyle products for the modern buyer.',
      email:          userEmail,
      phoneCode:      '+1',
      phoneNumber:    '(555) 204-9900',
      payoutMethod:   'Bank Transfer',
      iban:           'DE89 3704 0044 0532 0130 00',
      bankName:       'Deutsche Bank',
      accountHolder:  userName + ' LLC',
      payoutSchedule: 'Monthly',
      instagram:      'techstore.co',
      facebook:       'TechStoreCo',
      website:        'https://techstore.co',
      logoUrl:        userLogo,
      bannerUrl:      '',
      vacationMode:   false,
    };
  });
  const [logoFile,   setLogoFile]   = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [saveState,  setSaveState]  = useState<'idle' | 'saving' | 'saved'>('idle');

  // Simulated API fetch of vendor settings on component mount
  useEffect(() => {
    const fetchVendorSettings = async () => {
      // Simulate 150ms network round-trip latency
      await new Promise((resolve) => setTimeout(resolve, 150));
      const saved = localStorage.getItem('vendora_vendor_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings((prev) => ({ ...prev, ...parsed }));
        } catch {
          /* ignore */
        }
      }
    };
    fetchVendorSettings();
  }, []);

  // Listen for storage changes across tabs & components
  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem('tradehub_products') || localStorage.getItem('vendora_vendor_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            let deletedIds: number[] = [];
            try {
              const delRaw = localStorage.getItem('vendora_deleted_product_ids');
              if (delRaw) deletedIds = JSON.parse(delRaw);
            } catch {}

            setProducts(
              parsed
                .filter((p: any) => !deletedIds.includes(p.id))
                .map((p: any) => ({
                  id: p.id,
                  name: p.name || p.title || 'Product',
                  category: p.category || 'Electronics',
                  subcategory: p.subcategory || '',
                  brand: p.brand || '',
                  price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
                  stock: typeof p.stock === 'number' ? p.stock : (p.stockQuantity ?? 0),
                  lowStockThreshold: p.lowStockThreshold,
                  status: p.status || (p.stock === 0 || p.stockQuantity === 0 ? 'Out of Stock' : 'Active'),
                  image: p.image || p.imageUrl || p.img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
                  description: p.description || '',
                }))
            );
          }
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('productsUpdated', handleStorageUpdate);
    window.addEventListener('tradehub-storage-update', handleStorageUpdate);
    window.addEventListener('tradehub:products-changed', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('productsUpdated', handleStorageUpdate);
      window.removeEventListener('tradehub-storage-update', handleStorageUpdate);
      window.removeEventListener('tradehub:products-changed', handleStorageUpdate);
    };
  }, []);

/**
 * Compresses an image file using an HTML5 <canvas> element.
 * Resizes to a maximum dimension of 400px (width or height)
 * and exports as a JPEG with quality 0.6 (~15-30 KB Base64).
 */
const compressImageFile = (file: File, maxDim = 400, quality = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

  // ─── Image File Upload Handler (Canvas Compressed Base64) ────────────────
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const compressedBase64 = await compressImageFile(file, 400, 0.6);
      setProductForm((f) => ({ ...f, image: compressedBase64 }));
    } catch (err) {
      console.warn('Canvas compression fallback to standard FileReader:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setProductForm((f) => ({ ...f, image: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Electronics',
      subcategory: SUBCATEGORIES_MAP['Electronics']?.[0] ?? 'Audio & Gadgets',
      brand: 'Generic / Unbranded',
      price: '',
      stock: '',
      lowStockThreshold: '5',
      status: 'Active',
      image: '📦',
      description: '',
    });
    setShowProductModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category: p.category || 'Electronics',
      subcategory: p.subcategory || (SUBCATEGORIES_MAP[p.category || 'Electronics']?.[0] ?? 'Audio & Gadgets'),
      brand: p.brand || 'Generic / Unbranded',
      price: String(p.price),
      stock: String(p.stock),
      lowStockThreshold: p.lowStockThreshold !== undefined ? String(p.lowStockThreshold) : '5',
      status: p.status,
      image: p.image,
      description: p.description,
    });
    setShowProductModal(true);
  };

  const handleProductSave = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    try {
      if (!productForm.name.trim()) {
        alert('Please enter a product name.');
        return;
      }

      const numericPrice = parseFloat(productForm.price) || 0;
      if (numericPrice <= 0 && productForm.price !== '0') {
        alert('Please enter a valid product price.');
        return;
      }

      const numericStock = parseInt(productForm.stock, 10) || 0;
      const numericThreshold =
        productForm.lowStockThreshold !== ''
          ? parseInt(productForm.lowStockThreshold, 10) || 0
          : 0;

      const DEFAULT_PLACEHOLDER =
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

      let safeImage = productForm.image || '📦';
      if (typeof safeImage === 'string' && safeImage.startsWith('data:image/')) {
        if (safeImage.length > 500000) {
          console.warn('Uploaded Base64 image is too large (>500KB), falling back to standard placeholder image URL.');
          safeImage = DEFAULT_PLACEHOLDER;
        }
      }

      const parsed: Product = {
        id: editingProduct?.id ?? Date.now(),
        name: productForm.name.trim(),
        category: productForm.category,
        subcategory: productForm.subcategory || undefined,
        brand: productForm.brand || undefined,
        price: numericPrice,
        stock: numericStock,
        lowStockThreshold: numericThreshold,
        status: productForm.status,
        image: safeImage,
        description: productForm.description,
      };

      setProducts((prev) => {
        const updated = editingProduct
          ? prev.map((p) => (p.id === editingProduct.id ? parsed : p))
          : [parsed, ...prev];

        const isImageData = (img: string) =>
          img &&
          (img.startsWith('data:image/') ||
           img.startsWith('http://') ||
           img.startsWith('https://') ||
           img.startsWith('/') ||
           img.startsWith('blob:'));

        const mapStorable = (items: Product[], fallbackLargeImages = false) =>
          items.map((p) => {
            const hasImg = isImageData(p.image);
            const imgVal = hasImg
              ? fallbackLargeImages && p.image.startsWith('data:image/')
                ? DEFAULT_PLACEHOLDER
                : p.image
              : '';
            return {
              id: p.id,
              title: p.name,
              name: p.name,
              category: p.category,
              subcategory: p.subcategory ?? null,
              brand: p.brand ?? 'Generic',
              price: p.price,
              stock: p.stock,
              stockQuantity: p.stock,
              lowStockThreshold: p.lowStockThreshold,
              status: p.status,
              image: imgVal,
              imageUrl: imgVal,
              img: imgVal,
              description: p.description,
              rating: 4.5,
              averageRating: 4.5,
              reviewCount: 0,
              isNew: true,
              vendorName: 'Vendor Store',
              isActive: p.status === 'Active',
            };
          });

        // Use patchStoredProduct so only this product is upserted in the
        // full tradehub_products list — other products are never touched.
        try {
          const storableItem = mapStorable([parsed], false)[0];
          patchStoredProduct(storableItem);
        } catch (storageErr) {
          console.warn('LocalStorage quota error, retrying with placeholder image:', storageErr);
          try {
            const storableItemFallback = mapStorable([parsed], true)[0];
            patchStoredProduct(storableItemFallback);
          } catch (retryErr) {
            console.error('Failed to patch localStorage even with fallback image:', retryErr);
          }
        }
        // broadcastChange() is called inside patchStoredProduct automatically.

        return updated;
      });

      setShowProductModal(false);
    } catch (error) {
      console.error('Add Product Error:', error);
      alert(`Failed to save product: ${(error as Error)?.message || 'An unexpected error occurred.'}`);
    }
  };

  const handleDeleteProduct = (id: number) => {
    // removeStoredProduct handles the deny-list AND removes from the full
    // tradehub_products list without touching any other products.
    removeStoredProduct(id);

    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
  };


  const handleOrderStatusChange = (orderId: string, status: OrderStatus) =>
    setOrders(os => os.map(o => o.id === orderId ? { ...o, status } : o));

  const handleSettingsSave = () => {
    setSaveState('saving');

    const formData = new FormData();
    formData.append('storeName',      settings.storeName);
    formData.append('description',    settings.description);
    formData.append('email',          settings.email);
    formData.append('phoneCode',      settings.phoneCode);
    formData.append('phoneNumber',    settings.phoneNumber);
    formData.append('payoutMethod',   settings.payoutMethod);
    formData.append('iban',           settings.iban);
    formData.append('bankName',       settings.bankName);
    formData.append('accountHolder',  settings.accountHolder);
    formData.append('payoutSchedule', settings.payoutSchedule);
    formData.append('instagram',      settings.instagram);
    formData.append('facebook',       settings.facebook);
    formData.append('website',        settings.website);
    formData.append('vacationMode',   String(settings.vacationMode));

    if (logoFile) {
      formData.append('logoFile', logoFile, logoFile.name);
    } else if (!settings.logoUrl) {
      formData.append('logoUrl', '');
    }

    if (bannerFile) {
      formData.append('bannerFile', bannerFile, bannerFile.name);
    } else if (!settings.bannerUrl) {
      formData.append('bannerUrl', '');
    }

    // TODO: await apiClient.put('/api/vendor/settings', formData);
    setTimeout(() => {
      // 1. Persist settings to local storage so they survive F5 refresh
      localStorage.setItem('vendora_vendor_settings', JSON.stringify(settings));

      // 2. Instantly update active session user logoUrl and store/display name
      const userKeys = ['vendora_user', 'mockUser', 'vendora_active_user'];
      userKeys.forEach(key => {
        const rawUser = localStorage.getItem(key);
        if (rawUser) {
          try {
            const user = JSON.parse(rawUser);
            user.logoUrl = settings.logoUrl;
            user.avatarUrl = settings.logoUrl; // supporting both keys just in case
            if (settings.storeName) {
              user.name = settings.storeName;
            }
            localStorage.setItem(key, JSON.stringify(user));
          } catch {}
        }
      });

      // 3. Dispatch custom event so App.tsx instantly syncs global state (Header avatar)
      window.dispatchEvent(new Event('vendora_user_update'));

      setSaveState('saved');
      setLogoFile(null);
      setBannerFile(null);
      setTimeout(() => setSaveState('idle'), 2000);
    }, 1000);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSettings((s) => ({ ...s, logoUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setSettings((s) => ({ ...s, logoUrl: '' }));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSettings((s) => ({ ...s, bannerUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setSettings((s) => ({ ...s, bannerUrl: '' }));
  };

  const viewOrder = orders.find(o => o.id === viewOrderId) ?? null;
  const chartData = ANALYTICS_BY_RANGE[dateRange] ?? MONTHLY_DATA;

  const navItems = [
    { id: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
    { id: 'Products',  icon: <Package className="w-4 h-4" />,         label: 'Products', badge: products.length },
    { id: 'Orders',    icon: <ShoppingCart className="w-4 h-4" />,    label: 'Orders',   badge: orders.filter(o => o.status === 'Pending').length },
    { id: 'Analytics', icon: <TrendingUp className="w-4 h-4" />,      label: 'Analytics' },
    { id: 'Settings',  icon: <Settings className="w-4 h-4" />,        label: 'Settings' },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen w-full bg-[#060913] text-white overflow-hidden font-sans">

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside className="w-64 bg-[#0B1120] border-r border-slate-800/80 flex flex-col flex-shrink-0 hidden lg:flex text-left">
        <div className="h-20 flex items-center px-6 border-b border-slate-800/80 flex-shrink-0">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-purple-600/25">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Vendora Panel</span>
        </div>

        <nav className="flex-grow px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} type="button" onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer gap-3 ${
                activeTab === item.id ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}>
              {item.icon}
              <span className="flex-grow text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === item.id ? 'bg-white/20 text-white' : 'bg-purple-500/20 text-purple-400 border border-purple-500/20'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mx-4 mb-3 p-3 bg-purple-600/10 border border-purple-500/15 rounded-xl">
          <p className="text-xs text-purple-300 font-semibold">{settings.storeName}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{settings.email}</p>
        </div>

        <div className="p-4 border-t border-slate-800/80">
          <button type="button" onClick={() => navigate('/')}
            className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-semibold text-sm cursor-pointer gap-3">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Exit Dashboard</span>
          </button>
        </div>
      </aside>

      {/* ══════════════ MAIN ══════════════ */}
      <main className="flex-grow flex flex-col overflow-y-auto">

        {/* Top Bar */}
        <header className="h-20 bg-[#0B1120]/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-10 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{navItems.find(n => n.id === activeTab)?.label ?? 'Dashboard'}</h1>
            <p className="text-xs text-slate-400">Vendora Vendor Portal · {settings.storeName}</p>
          </div>
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Store Avatar"
                className="w-9 h-9 rounded-full object-cover border border-purple-500/30 shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-purple-600/15 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs select-none flex-shrink-0">
                {settings.storeName
                  .split(' ')
                  .map((s: string) => s[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'TS'}
              </div>
            )}
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto flex-grow">

          {/* ══════════ DASHBOARD ══════════ */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total Revenue',  value: '$24,592', sub: '+12.5%', icon: <DollarSign className="w-5 h-5" />,   color: 'emerald', up: true },
                  { label: 'Active Orders',  value: '142',     sub: '+8.2%',  icon: <ShoppingCart className="w-5 h-5" />, color: 'purple',  up: true },
                  { label: 'Total Products', value: String(products.length), sub: 'In catalog', icon: <Package className="w-5 h-5" />, color: 'blue', up: true },
                  { label: 'Store Views',    value: '12.4K',   sub: '+24.8%', icon: <Users className="w-5 h-5" />,        color: 'amber',   up: true },
                ].map(card => (
                  <div key={card.label} className="bg-[#111827] p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all shadow-xl text-left relative group">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-${card.color}-500/10 text-${card.color}-400 flex items-center justify-center`}>{card.icon}</div>
                      <span className={`flex items-center text-${card.color}-400 text-xs font-bold gap-0.5 bg-${card.color}-500/5 px-2 py-0.5 rounded-md border border-${card.color}-500/10`}>
                        {card.sub} {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">{card.label}</p>
                    <p className="text-2xl font-extrabold text-white mt-1">{card.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">Recent Orders</h2>
                  <button onClick={() => setActiveTab('Orders')} className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer">View all →</button>
                </div>
                <RecentOrdersTable />
              </div>
            </div>
          )}

          {/* ══════════ PRODUCTS ══════════ */}
          {activeTab === 'Products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Product Catalog</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())).length} of {products.length} items · {products.filter(p => p.stock === 0).length} out of stock</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[#111827] border border-slate-700 text-white text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-purple-500 placeholder:text-slate-500 w-48 sm:w-64 transition-all"
                    />
                  </div>
                  <button type="button" onClick={openAddModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-purple-600/20 cursor-pointer whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>
              </div>

              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/60">
                      {['Product', 'Category', 'Price', 'Stock Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())).map((p, i) => (
                      <tr key={p.id} className={`border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors ${i === products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())).length - 1 ? 'border-b-0' : ''}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {isImageSrc(p.image) ? (
                              <img
                                src={getImageUrl(p.image) || p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                                alt={p.name}
                                className="w-10 h-10 rounded-xl object-cover bg-slate-900 border border-slate-800 flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
                                }}
                              />
                            ) : (
                              <span className="text-2xl flex-shrink-0">{p.image || '📦'}</span>
                            )}
                            <div>
                              <p className="font-semibold text-white text-sm">{p.name}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px]">{p.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-400 text-sm">{p.category}</td>
                        <td className="px-5 py-4 text-white font-bold">${p.price.toFixed(2)}</td>
                        <td className="px-5 py-4">{stockBadge(p.stock)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => openEditModal(p)}
                              className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer" title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {deleteConfirmId === p.id ? (
                              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-xl px-2 py-1">
                                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                <span className="text-[11px] text-red-300 font-semibold">Delete?</span>
                                <button type="button" onClick={() => handleDeleteProduct(p.id)}
                                  className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-[11px] rounded-lg font-bold cursor-pointer transition-colors">Yes</button>
                                <button type="button" onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-[11px] rounded-lg cursor-pointer transition-colors">No</button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => setDeleteConfirmId(p.id)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════ ORDERS ══════════ */}
          {activeTab === 'Orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Order Management</h2>
                <p className="text-xs text-slate-400 mt-0.5">{orders.length} total · {orders.filter(o => o.status === 'Pending').length} pending</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map(s => {
                  const count = orders.filter(o => o.status === s).length;
                  const cls: Record<OrderStatus, string> = {
                    Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20', Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    Shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20', Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
                  };
                  return (
                    <span key={s} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${cls[s]}`}>
                      {s} <span className="opacity-70">{count}</span>
                    </span>
                  );
                })}
              </div>

              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/60">
                      {['Order ID', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, i) => (
                      <tr key={o.id} className={`border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors ${i === orders.length - 1 ? 'border-b-0' : ''}`}>
                        <td className="px-5 py-4 font-mono text-purple-400 text-xs font-bold">{o.id}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white text-sm">{o.customer}</p>
                          <p className="text-[11px] text-slate-500">{o.email}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-400 text-sm whitespace-nowrap">{o.date}</td>
                        <td className="px-5 py-4 text-white font-bold">${o.total.toFixed(2)}</td>
                        <td className="px-5 py-4 text-slate-400 text-sm">{o.payment}</td>
                        <td className="px-5 py-4">
                          <select value={o.status} onChange={e => handleOrderStatusChange(o.id, e.target.value as OrderStatus)}
                            className="bg-[#0B1120] border border-slate-700 text-xs font-bold text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer transition-colors hover:border-slate-600">
                            {(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <button type="button" onClick={() => setViewOrderId(o.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700/60">
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════ ANALYTICS ══════════ */}
          {activeTab === 'Analytics' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Analytics & Insights</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Performance metrics for your store</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                    className="bg-[#111827] border border-slate-700 text-sm font-semibold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer hover:border-slate-600 transition-colors">
                    {['Last 7 Days', 'Last 30 Days', 'This Year'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total Revenue',    value: '$24,592', sub: '+12.5% vs last year',   icon: <DollarSign className="w-5 h-5" />,  color: 'emerald', up: true  },
                  { label: 'Conversion Rate',  value: '3.84%',   sub: '+0.6% vs last month',   icon: <Percent className="w-5 h-5" />,    color: 'purple',  up: true  },
                  { label: 'Total Page Views', value: '148.2K',  sub: '+31% vs last quarter',  icon: <Eye className="w-5 h-5" />,        color: 'blue',    up: true  },
                  { label: 'Avg Bounce Rate',  value: '41.3%',   sub: '-5.2% improved',        icon: <Activity className="w-5 h-5" />,   color: 'amber',   up: false },
                ].map(card => (
                  <div key={card.label} className="bg-[#111827] p-5 rounded-2xl border border-slate-800/80 text-left">
                    <div className={`w-10 h-10 rounded-xl bg-${card.color}-500/10 text-${card.color}-400 flex items-center justify-center mb-3`}>{card.icon}</div>
                    <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">{card.label}</p>
                    <p className="text-2xl font-extrabold text-white mt-1 mb-1">{card.value}</p>
                    <p className={`text-xs font-semibold flex items-center gap-0.5 ${card.up ? 'text-emerald-400' : 'text-red-400'}`}>
                      {card.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}{card.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bar Chart */}
              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Monthly Revenue</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{dateRange}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" />
                    <span className="text-xs text-slate-400">Revenue ($)</span>
                  </div>
                </div>
                <div className="flex items-end gap-2 h-48">
                  {chartData.map(m => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group min-w-0">
                      <div className="w-full relative rounded-t-lg overflow-hidden transition-all duration-500" style={{ height: `${m.pct}%` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-700 to-purple-400 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-purple-300/60" />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          ${(m.value / 1000).toFixed(1)}K
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold truncate w-full text-center">{m.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 border-t border-slate-800/60 pt-3">
                  <span className="text-[10px] text-slate-600">$0</span>
                  <span className="text-[10px] text-slate-600">$4K</span>
                  <span className="text-[10px] text-slate-600">$8K</span>
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Top Selling Products</h3>
                  <span className="text-xs text-slate-500">{dateRange}</span>
                </div>
                <div className="divide-y divide-slate-800/40">
                  {[
                    { name: '4K Ultra-Wide Monitor',       emoji: '🖥️', units: 98,  revenue: 53899, pct: 34 },
                    { name: 'Wireless ANC Headphones',     emoji: '🎧', units: 210, revenue: 31497, pct: 20 },
                    { name: 'Ergonomic Office Chair',      emoji: '🪑', units: 67,  revenue: 22043, pct: 14 },
                    { name: 'Mechanical Gaming Keyboard',  emoji: '⌨️', units: 145, revenue: 13048, pct: 8  },
                    { name: 'Smart Fitness Tracker',       emoji: '⌚', units: 88,  revenue: 7039,  pct: 5  },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/20 transition-colors">
                      <span className="text-2xl w-10 text-center flex-shrink-0">{row.emoji}</span>
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{row.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-slate-800 rounded-full h-1.5 max-w-[140px] overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: `${row.pct * 2.5}%` }} />
                          </div>
                          <span className="text-[11px] text-slate-500">{row.units} units</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white font-bold text-sm">${row.revenue.toLocaleString()}</p>
                        <p className="text-[11px] text-purple-400 font-semibold">{row.pct}% share</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ SETTINGS ══════════ */}
          {activeTab === 'Settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-bold text-white">Store Settings</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage your public profile and payout details</p>
              </div>

              {/* Save banner */}
              {saveState === 'saved' && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl px-4 py-3 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Settings saved successfully!
                </div>
              )}

              {/* ── Store Profile ── */}
              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 p-6 space-y-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/15 text-purple-400 flex items-center justify-center"><Store className="w-4 h-4" /></div>
                  <h3 className="text-base font-bold text-white">Store Profile</h3>
                </div>

                {/* Logo Upload */}
                <div className="flex items-center gap-5">
                  {/* ── Preview container: strict 80×80 square, never stretches ── */}
                  <div
                    className="w-20 h-20 rounded-xl bg-[#0B1120] border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 group hover:border-purple-500/50 transition-colors cursor-pointer"
                    onClick={() => logoInputRef.current?.click()}
                    title="Click to upload a new logo"
                  >
                    {settings.logoUrl ? (
                      <img
                        src={settings.logoUrl}
                        alt="Store logo preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl select-none" aria-hidden>
                        {settings.storeName[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">Store Logo</p>
                    <p className="text-xs text-slate-500 mb-2.5">PNG, JPG or WEBP. Recommended 256×256px.</p>
                    <div className="flex items-center gap-2">
                      {/* Upload button */}
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        {settings.logoUrl ? 'Change' : 'Upload Image'}
                      </button>

                      {/* Remove button — only visible when a logo exists */}
                      {settings.logoUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                          title="Remove logo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Pending file indicator */}
                    {logoFile && (
                      <p className="text-[10px] text-purple-400 font-medium mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block" />
                        {logoFile.name} — pending save
                      </p>
                    )}
                  </div>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Store Name</label>
                    <input type="text" value={settings.storeName} onChange={e => setSettings(s => ({ ...s, storeName: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input type="email" value={settings.email} onChange={e => setSettings(s => ({ ...s, email: e.target.value }))} className={`${inputCls} pl-9`} />
                    </div>
                  </div>
                  {/* Advanced Phone Input */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Phone Number</label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-700 focus-within:ring-2 focus-within:ring-purple-500/40 focus-within:border-purple-500/60 transition-all">
                      <select value={settings.phoneCode} onChange={e => setSettings(s => ({ ...s, phoneCode: e.target.value }))}
                        className="bg-[#1A2333] border-r border-slate-700 text-sm text-slate-300 px-3 py-2.5 focus:outline-none cursor-pointer flex-shrink-0">
                        {['+994 🇦🇿', '+1 🇺🇸', '+90 🇹🇷', '+44 🇬🇧', '+49 🇩🇪', '+33 🇫🇷', '+7 🇷🇺', '+86 🇨🇳'].map(c => {
                          const code = c.split(' ')[0];
                          return <option key={code} value={code}>{c}</option>;
                        })}
                      </select>
                      <input type="tel" value={settings.phoneNumber} onChange={e => setSettings(s => ({ ...s, phoneNumber: e.target.value }))}
                        placeholder="(555) 000-0000"
                        className="flex-1 bg-[#0B1120] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Store Description</label>
                  <textarea rows={3} value={settings.description} onChange={e => setSettings(s => ({ ...s, description: e.target.value }))} className={`${inputCls} resize-none`} />
                </div>

                {/* Social Links */}
                <div className="pt-2 border-t border-slate-800/60">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Social Links</p>
                  <div className="space-y-3">
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400 pointer-events-none" />
                      <input type="text" value={settings.instagram} onChange={e => setSettings(s => ({ ...s, instagram: e.target.value }))}
                        placeholder="Instagram handle" className={`${inputCls} pl-9`} />
                    </div>
                    <div className="relative">
                      <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
                      <input type="text" value={settings.facebook} onChange={e => setSettings(s => ({ ...s, facebook: e.target.value }))}
                        placeholder="Facebook page name" className={`${inputCls} pl-9`} />
                    </div>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input type="url" value={settings.website} onChange={e => setSettings(s => ({ ...s, website: e.target.value }))}
                        placeholder="https://yourstore.com" className={`${inputCls} pl-9`} />
                    </div>
                  </div>
                </div>

                {/* ── Store Banner ── */}
                <div className="pt-4 border-t border-slate-800/60">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Store Banner</p>
                  {/* 3:1 aspect-ratio preview */}
                  <div className="relative w-full h-32 rounded-xl overflow-hidden bg-[#0B1120] border border-dashed border-slate-700 mb-3 group">
                    {settings.bannerUrl ? (
                      <img
                        src={settings.bannerUrl}
                        alt="Store banner preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-slate-600">
                        <ImageIcon className="w-6 h-6" />
                        <span className="text-xs font-medium">No banner uploaded</span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div
                      onClick={() => bannerInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <UploadCloud className="w-4 h-4" /> Click to change banner
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      {settings.bannerUrl ? 'Change Banner' : 'Upload Banner'}
                    </button>
                    {settings.bannerUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveBanner}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Banner
                      </button>
                    )}
                    {bannerFile && (
                      <p className="text-[10px] text-purple-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block" />
                        {bannerFile.name} — pending save
                      </p>
                    )}
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleBannerChange}
                  />
                  <p className="text-[10px] text-slate-600 mt-2">Recommended size: 1200×400px (3:1). PNG, JPG or WEBP.</p>
                </div>
              </div>

              {/* ── Payout & Financial Information ── */}
              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 p-6 space-y-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/15 text-emerald-400 flex items-center justify-center"><CreditCard className="w-4 h-4" /></div>
                  <div>
                    <h3 className="text-base font-bold text-white">Payout &amp; Financial Information</h3>
                    <p className="text-[11px] text-slate-500">Manage how and when you receive your earnings</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300/80">Payout details are encrypted and stored securely. Changes take 1–2 business days to reflect.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Payout Method */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Payout Method</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <select
                        value={settings.payoutMethod}
                        onChange={e => setSettings(s => ({ ...s, payoutMethod: e.target.value }))}
                        className={`${inputCls} pl-9 appearance-none cursor-pointer`}
                      >
                        {['Bank Transfer', 'Debit Card', 'PayPal', 'Stripe'].map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Payout Schedule */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Payout Schedule</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <select
                        value={settings.payoutSchedule}
                        onChange={e => setSettings(s => ({ ...s, payoutSchedule: e.target.value }))}
                        className={`${inputCls} pl-9 appearance-none cursor-pointer`}
                      >
                        {['Weekly', 'Monthly'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Bank Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                      <input
                        type="text"
                        value={settings.bankName}
                        onChange={e => setSettings(s => ({ ...s, bankName: e.target.value }))}
                        placeholder="e.g. Deutsche Bank"
                        className={`${inputCls} pl-9`}
                      />
                    </div>
                  </div>

                  {/* Account Holder */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Account Holder Name</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        type="text"
                        value={settings.accountHolder}
                        onChange={e => setSettings(s => ({ ...s, accountHolder: e.target.value }))}
                        placeholder="Full legal name or company"
                        className={`${inputCls} pl-9`}
                      />
                    </div>
                  </div>

                  {/* IBAN */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      {settings.payoutMethod === 'Bank Transfer' ? 'IBAN / Account Number' : 'Account / Email'}
                    </label>
                    <input
                      type="text"
                      value={settings.iban}
                      onChange={e => setSettings(s => ({ ...s, iban: e.target.value }))}
                      className={inputCls}
                      placeholder={settings.payoutMethod === 'Bank Transfer' ? 'DE89 3704 0044 ...' : 'account@email.com'}
                    />
                  </div>
                </div>
              </div>

              {/* ── Store Status / Vacation Mode ── */}
              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Store Status</h3>
                    <p className="text-[11px] text-slate-500">Control your store’s availability on the marketplace</p>
                  </div>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  settings.vacationMode
                    ? 'bg-amber-500/8 border-amber-500/25'
                    : 'bg-slate-900/60 border-slate-800'
                }`}>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${ settings.vacationMode ? 'text-amber-300' : 'text-white'}`}>
                      {settings.vacationMode ? '🏖️ Vacation Mode Active' : 'Store is Live'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {settings.vacationMode
                        ? 'Your products are temporarily hidden from marketplace search and new orders are paused.'
                        : 'Enabling Vacation Mode will temporarily hide your products from the marketplace search.'}
                    </p>
                  </div>

                  {/* Toggle switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.vacationMode}
                    onClick={() => setSettings(s => ({ ...s, vacationMode: !s.vacationMode }))}
                    className={`relative ml-5 flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111827] ${
                      settings.vacationMode
                        ? 'bg-amber-500 focus:ring-amber-500'
                        : 'bg-slate-700 focus:ring-purple-500'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                        settings.vacationMode ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Save button — 3-state */}
              <button type="button" onClick={handleSettingsSave} disabled={saveState !== 'idle'}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg ${
                  saveState === 'saved'   ? 'bg-emerald-600 text-white shadow-emerald-600/20' :
                  saveState === 'saving'  ? 'bg-purple-600/70 text-white shadow-purple-600/10 cursor-not-allowed' :
                                           'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'}`}>
                {saveState === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                {saveState === 'saved'  && <Check className="w-4 h-4" />}
                {saveState === 'idle'   && <Save className="w-4 h-4" />}
                {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

        </div>
      </main>

      {/* ══════════ PRODUCT MODAL ══════════ */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <form
            onSubmit={handleProductSave}
            className="relative w-full max-w-2xl bg-[#0B1120] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#0F172A]/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {editingProduct ? 'Update listing details for your store' : 'Create a listing for your store catalog'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Product Name *</label>
                <div className="relative">
                  <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <input type="text" placeholder="e.g. Premium Wireless Earbuds" value={productForm.name}
                    onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-[#151C2C] border border-slate-700/70 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors" />
                </div>
              </div>

              {/* Category, Department / Subcategory & Brand — 3 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Category</label>
                  <select value={productForm.category}
                    onChange={e => {
                      const newCat = e.target.value;
                      const defaultSub = SUBCATEGORIES_MAP[newCat]?.[0] ?? '';
                      setProductForm(f => ({ ...f, category: newCat, subcategory: defaultSub }));
                    }}
                    className="w-full bg-[#151C2C] border border-slate-700/70 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer appearance-none">
                    {['Electronics', 'Fashion', 'Home Decor', 'Furniture', 'Fitness', 'Books', 'Beverages'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Department / Subcategory</label>
                  <select value={productForm.subcategory}
                    onChange={e => setProductForm(f => ({ ...f, subcategory: e.target.value }))}
                    className="w-full bg-[#151C2C] border border-slate-700/70 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer appearance-none">
                    {(SUBCATEGORIES_MAP[productForm.category] || ['General']).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Brand</label>
                  <select value={productForm.brand}
                    onChange={e => setProductForm(f => ({ ...f, brand: e.target.value }))}
                    className="w-full bg-[#151C2C] border border-slate-700/70 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer appearance-none">
                    {BRANDS_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Price, Stock Quantity & Low Stock Alert — 3 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Price ($) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                    <input type="number" min="0" step="0.01" placeholder="0.00" value={productForm.price}
                      onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                      className="w-full bg-[#151C2C] border border-slate-700/70 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Stock Quantity</label>
                  <input type="number" min="0" placeholder="0" value={productForm.stock}
                    onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))}
                    className="w-full bg-[#151C2C] border border-slate-700/70 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Low Stock Alert</label>
                  <input type="number" min="0" placeholder="e.g. 5" value={productForm.lowStockThreshold}
                    onChange={e => setProductForm(f => ({ ...f, lowStockThreshold: e.target.value }))}
                    className="w-full bg-[#151C2C] border border-slate-700/70 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors" />
                </div>
              </div>

              {/* Status & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Status</label>
                  <select value={productForm.status} onChange={e => setProductForm(f => ({ ...f, status: e.target.value as ProductStatus }))}
                    className="w-full bg-[#151C2C] border border-slate-700/70 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors cursor-pointer appearance-none">
                    <option value="Active">Active</option><option value="Draft">Draft</option><option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Description</label>
                  <textarea rows={2} placeholder="Short product description..." value={productForm.description}
                    onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-[#151C2C] border border-slate-700/70 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none" />
                </div>
              </div>

              {/* Image Upload zone (with FileReader & Thumbnail Preview) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Product Image
                </label>
                {isImageSrc(productForm.image) ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group h-36 flex items-center justify-center">
                    <img
                      src={productForm.image}
                      alt="Product Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductForm((f) => ({ ...f, image: '📦' }));
                        }}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDropImage}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
                      dragOver
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-800 hover:border-slate-700 bg-[#151C2C]/50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-1.5 text-purple-400">
                      <span className="text-xl">{productForm.image || '📦'}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-slate-300 text-xs font-medium">
                      <UploadCloud className="w-4 h-4 text-purple-400" />
                      <span>Drag & drop image here or click to browse</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Supports PNG, JPG, WEBP up to 5 MB
                    </span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-800/80 bg-[#0F172A]/30">
              <button type="button" onClick={() => setShowProductModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-semibold transition-colors cursor-pointer">Cancel</button>
              <button type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 transition-all duration-200 cursor-pointer">
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════ ORDER DETAILS MODAL ══════════ */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setViewOrderId(null)} />
          <div className="relative bg-[#0E1524] border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
              <div>
                <h2 className="text-lg font-bold text-white">Order Details</h2>
                <p className="text-xs text-purple-400 font-mono font-bold">{viewOrder.id}</p>
              </div>
              <button type="button" onClick={() => setViewOrderId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
              {/* Customer & Address */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111827] rounded-xl p-4 border border-slate-800/60">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Customer</p>
                  </div>
                  <p className="text-sm font-bold text-white">{viewOrder.customer}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{viewOrder.email}</p>
                </div>
                <div className="bg-[#111827] rounded-xl p-4 border border-slate-800/60">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Order Date</p>
                  </div>
                  <p className="text-sm font-bold text-white">{viewOrder.date}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{viewOrder.payment}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-[#111827] rounded-xl p-4 border border-slate-800/60">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Shipping Address</p>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{viewOrder.address}</p>
              </div>

              {/* Items */}
              <div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-3">Items Ordered</p>
                <div className="space-y-2">
                  {viewOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#111827] rounded-xl p-3 border border-slate-800/60">
                      <span className="text-2xl w-10 text-center">{item.emoji}</span>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm font-bold text-white flex-shrink-0">${(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/60">
                  <span className="text-sm text-slate-400 font-semibold">Total</span>
                  <span className="text-lg font-extrabold text-white">${viewOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-4">Order Timeline</p>
                {viewOrder.status === 'Cancelled' ? (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400 font-semibold">Order was cancelled</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-0">
                    {(['Pending', 'Processing', 'Shipped', 'Delivered'] as const).map((step, idx) => {
                      const currentStep = orderTimelineSteps[viewOrder.status];
                      const isComplete = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      const stepIcons = [<Clock className="w-3.5 h-3.5" />, <Package className="w-3.5 h-3.5" />, <Truck className="w-3.5 h-3.5" />, <CheckCircle2 className="w-3.5 h-3.5" />];
                      return (
                        <React.Fragment key={step}>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              isCurrent ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-600/30' :
                              isComplete ? 'bg-emerald-600/30 border-emerald-500 text-emerald-400' :
                              'bg-slate-800 border-slate-700 text-slate-600'}`}>
                              {stepIcons[idx]}
                            </div>
                            <span className={`text-[10px] font-bold whitespace-nowrap ${isCurrent ? 'text-purple-400' : isComplete ? 'text-emerald-400' : 'text-slate-600'}`}>
                              {step}
                            </span>
                          </div>
                          {idx < 3 && (
                            <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${idx < currentStep ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800/60">
              <button type="button" onClick={() => setViewOrderId(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors cursor-pointer">Close</button>
              <button type="button"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors cursor-pointer flex items-center gap-2">
                <ChevronRight className="w-4 h-4" /> Go to Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorDashboard;
