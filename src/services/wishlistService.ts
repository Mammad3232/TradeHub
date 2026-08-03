const API_BASE = 'http://localhost:5229/api/wishlist';

export interface ApiWishlistItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  category: string;
  brand: string;
  priceWhenAdded: number;
  currentPrice: number;
  hasPriceDropped: boolean;
  stockQuantity: number;
  isActive: boolean;
  addedAt: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token') || localStorage.getItem('tradehub_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Fetch all wishlist items for the currently logged-in user.
 */
export async function getWishlistApi(): Promise<ApiWishlistItem[]> {
  const res = await fetch(API_BASE, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch wishlist (${res.status})`);
  }

  const json = await res.json();
  if (json && json.success && Array.isArray(json.data)) {
    return json.data;
  }
  return [];
}

/**
 * Add a product to the currently logged-in user's wishlist.
 */
export async function addToWishlistApi(productId: number): Promise<ApiWishlistItem> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId }),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    const errorMsg = json?.message || `Failed to add product #${productId} to wishlist`;
    throw new Error(errorMsg);
  }

  return json.data;
}

/**
 * Remove a wishlist item by ID for the currently logged-in user.
 */
export async function removeFromWishlistApi(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    const errorMsg = json?.message || `Failed to remove wishlist item #${id}`;
    throw new Error(errorMsg);
  }
}
