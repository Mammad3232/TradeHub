import { getProducts as fetchProductsApi, type Product } from './productService';

export type { Product };

/**
 * Legacy compatibility wrapper for getProducts()
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    return await fetchProductsApi();
  } catch (err) {
    console.error("Failed to fetch products from backend:", err);
    return [];
  }
};
