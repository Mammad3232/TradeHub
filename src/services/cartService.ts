import apiClient from "./apiClient";

export interface ApiCartItem {
  id: number;
  title: string;
  brand: string;
  price: number;
  oldPrice?: number | null;
  stockQuantity: number;
  image: string;
  isActive: boolean;
}

export interface UpdateCartItemInput {
  productId: number;
  quantity: number;
}

export interface UpdateCartResponse {
  productId: number;
  requestedQuantity: number;
  allowedQuantity: number;
  stockQuantity: number;
  isStockExceeded: boolean;
}

export const fetchCartStocks = async (productIds: number[]): Promise<ApiCartItem[]> => {
  if (!productIds || productIds.length === 0) return [];
  const idsParam = productIds.join(',');
  return await apiClient.get<never, ApiCartItem[]>(`/cart?ids=${encodeURIComponent(idsParam)}`);
};

export const updateCartItemStock = async (
  productId: number,
  quantity: number
): Promise<UpdateCartResponse> => {
  return await apiClient.post<UpdateCartItemInput, UpdateCartResponse>('/cart/update', {
    productId,
    quantity,
  });
};
