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
  categoryId: number;
  imageUrl?: string;
  imageFile?: File | null;
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
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('description', data.description || '');
  formData.append('price', data.price.toString());
  formData.append('stockQuantity', data.stockQuantity.toString());
  formData.append('categoryId', data.categoryId.toString());

  if (data.imageFile) {
    formData.append('imageFile', data.imageFile);
  }

  return await apiClient.post<never, Product>('/products', formData);
};

export const updateProduct = async (id: number, data: Partial<CreateProductInput>): Promise<Product> => {
  return await apiClient.put<never, Product>(`/products/${id}`, data);
};

export const deleteProduct = async (id: number): Promise<void> => {
  return await apiClient.delete(`/products/${id}`);
};

/** Helper to prepend API base URL for uploaded static images (e.g. /uploads/products/xyz.jpg) */
export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:')) {
    return imagePath;
  }
  return `http://localhost:5229${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
