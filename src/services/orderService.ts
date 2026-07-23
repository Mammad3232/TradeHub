import apiClient from './apiClient';

export interface OrderItemInput {
  productId: number;
  quantity: number;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  totalPrice: number;
  status: string;
  items: OrderItemResponse[];
}

export const createOrder = async (items: OrderItemInput[]): Promise<OrderResponse> => {
  return await apiClient.post<never, OrderResponse>('/orders', { items });
};

export const getMyOrders = async (): Promise<OrderResponse[]> => {
  return await apiClient.get<never, OrderResponse[]>('/orders');
};

export const getOrderById = async (id: number): Promise<OrderResponse> => {
  return await apiClient.get<never, OrderResponse>(`/orders/${id}`);
};

export const updateOrderStatus = async (id: number, status: string): Promise<OrderResponse> => {
  return await apiClient.put<never, OrderResponse>(`/orders/${id}/status`, { status });
};
