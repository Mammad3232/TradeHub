import apiClient from "./apiClient";

export interface Brand {
  id: number;
  name: string;
  logoUrl?: string | null;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  stockQuantity: number;
  lowStockThreshold?: number | null;
  image: string;
  categoryId: number;
  category: string;
  subcategoryId?: number | null;
  subcategory?: string | null;
  subcategorySlug?: string | null;
  brandId?: number | null;
  brand?: string | null;
  rating: number;
  averageRating?: number;
  reviewCount?: number;
  isActive: boolean;
  createdAt: string;
  vendorName?: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  stockQuantity: number;
  lowStockThreshold?: number | null;
  categoryId: number;
  subcategoryId?: number | null;
  brandId?: number | null;
  imageUrl?: string;
  imageFile?: File | null;
}

export interface ProductFilterParams {
  category?: string;
  categoryId?: number;
  subcategoryId?: number;
  subcategorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  searchTerm?: string;
  /** Multi-select brand IDs sent as repeated query params: ?brandIds=1&brandIds=2 */
  brandIds?: number[];
  /** Minimum average rating floor (e.g. 4 = "4 stars & up") */
  minRating?: number;
}

export const getProducts = async (params?: ProductFilterParams): Promise<Product[]> => {
  if (!params || Object.keys(params).length === 0) {
    return await apiClient.get<never, Product[]>('/products');
  }

  // Build URLSearchParams manually to support repeated keys for brandIds array
  const qs = new URLSearchParams();
  if (params.category)        qs.set('category', params.category);
  if (params.categoryId)      qs.set('categoryId', String(params.categoryId));
  if (params.subcategoryId)   qs.set('subcategoryId', String(params.subcategoryId));
  if (params.subcategorySlug)  qs.set('subcategorySlug', params.subcategorySlug);
  if (params.minPrice != null) qs.set('minPrice', String(params.minPrice));
  if (params.maxPrice != null) qs.set('maxPrice', String(params.maxPrice));
  if (params.searchTerm)      qs.set('searchTerm', params.searchTerm);
  else if (params.search)     qs.set('search', params.search);
  if (params.minRating != null) qs.set('minRating', String(params.minRating));
  // Repeat brandIds as separate keys so ASP.NET Core binds them as List<int>
  if (params.brandIds?.length) {
    params.brandIds.forEach((id) => qs.append('brandIds', String(id)));
  }

  return await apiClient.get<never, Product[]>(`/products?${qs.toString()}`);
};

export const getProductById = async (id: number): Promise<Product> => {
  return await apiClient.get<never, Product>(`/products/${id}`);
};

export const getBrands = async (): Promise<Brand[]> => {
  return await apiClient.get<never, Brand[]>("/brands");
};

export const createProduct = async (data: CreateProductInput): Promise<Product> => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("description", data.description || "");
  formData.append("price", data.price.toString());
  formData.append("stockQuantity", data.stockQuantity.toString());
  if (data.lowStockThreshold != null) {
    formData.append("lowStockThreshold", data.lowStockThreshold.toString());
  }
  formData.append("categoryId", data.categoryId.toString());
  if (data.subcategoryId) {
    formData.append("subcategoryId", data.subcategoryId.toString());
  }
  if (data.brandId) {
    formData.append("brandId", data.brandId.toString());
  }

  if (data.imageFile) {
    formData.append("imageFile", data.imageFile);
  }

  return await apiClient.post<never, Product>("/products", formData);
};

export const updateProduct = async (id: number, data: Partial<CreateProductInput>): Promise<Product> => {
  return await apiClient.put<never, Product>(`/products/${id}`, data);
};

export const deleteProduct = async (id: number): Promise<void> => {
  return await apiClient.delete(`/products/${id}`);
};

export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("blob:")) {
    return imagePath;
  }
  return `http://localhost:5229${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

// ── Session GUID Helper for Guest / User View Tracking ─────────────────────────
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem("tradehub_session_id");
  if (!sessionId) {
    sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'session-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
    localStorage.setItem("tradehub_session_id", sessionId);
  }
  return sessionId;
};

// ── Tracking & Recommendation Services ───────────────────────────────────────
export const trackProductView = async (productId: number, userId?: number | null): Promise<void> => {
  try {
    const sessionId = getSessionId();
    // Fire-and-forget — does not throw or block UI
    await apiClient.post(`/products/${productId}/view`, {
      sessionId,
      userId: userId || null
    });
  } catch (error) {
    // Silently ignore tracking errors to avoid disrupting user experience
    console.debug('Failed to record product view:', error);
  }
};

export const getRecommendations = async (productId: number): Promise<Product[]> => {
  try {
    return await apiClient.get<never, Product[]>(`/products/${productId}/recommendations`);
  } catch (error) {
    console.error('Failed to fetch product recommendations:', error);
    return [];
  }
};

export const getRecentlyViewed = async (excludeProductId?: number): Promise<Product[]> => {
  try {
    const sessionId = getSessionId();
    const excludeParam = excludeProductId ? `&excludeProductId=${excludeProductId}` : '';
    return await apiClient.get<never, Product[]>(`/products/recently-viewed?sessionId=${encodeURIComponent(sessionId)}${excludeParam}`);
  } catch (error) {
    console.error('Failed to fetch recently viewed products:', error);
    return [];
  }
};

export interface CreateReviewInput {
  rating: number;
  comment?: string;
}

export const submitReview = async (productId: number, input: CreateReviewInput): Promise<Product> => {
  return await apiClient.post<never, Product>(`/products/${productId}/reviews`, input);
};