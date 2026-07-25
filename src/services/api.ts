import { getProducts as fetchProductsApi, type Product, type ProductFilterParams } from './productService';

export type { Product, ProductFilterParams };

/**
 * Compatibility wrapper for getProducts(category?: string | ProductFilterParams)
 */
export const getProducts = async (category?: string | ProductFilterParams): Promise<Product[]> => {
  try {
    const params: ProductFilterParams | undefined =
      typeof category === 'string' ? { category } : category;
    return await fetchProductsApi(params);
  } catch (err) {
    console.error("Failed to fetch products from backend:", err);
    return [];
  }
};
