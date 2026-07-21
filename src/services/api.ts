import productsData from '../mocks/products.json';

export interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  vendorName: string;
  image: string;
  rating: number;
}

/**
 * Simulates a network call to fetch products with a 500ms delay.
 */
export const getProducts = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(productsData as Product[]);
    }, 500);
  });
};
