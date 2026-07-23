import apiClient from './apiClient';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  stockQuantity: number;
  image: string;
  categoryId: number;
  category: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
  vendorName?: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  categoryId: number;
}

export interface ProductFilterParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export const getProducts = async (params?: ProductFilterParams): Promise<Product[]> => {
  return await apiClient.get<never, Product[]>('/products', { params });
};

export const getProductById = async (id: number): Promise<Product> => {
  return await apiClient.get<never, Product>(`/products/${id}`);
};

export const createProduct = async (data: CreateProductInput): Promise<Product> => {
  return await apiClient.post<never, Product>('/products', data);
};

export const updateProduct = async (id: number, data: Partial<CreateProductInput>): Promise<Product> => {
  return await apiClient.put<never, Product>(`/products/${id}`, data);
};

export const deleteProduct = async (id: number): Promise<void> => {
  return await apiClient.delete(`/products/${id}`);
};
