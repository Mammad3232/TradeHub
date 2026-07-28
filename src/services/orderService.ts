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

export interface OrderTrackingStep {
  title: string;
  description: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface OrderTrackingData {
  orderId: number;
  status: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  steps: OrderTrackingStep[];
}

export const getOrderTracking = async (id: number): Promise<OrderTrackingData> => {
  return await apiClient.get<never, OrderTrackingData>(`/orders/${id}/track`);
};

export const downloadOrderInvoice = async (id: number): Promise<void> => {
  const response = await apiClient.get<never, Blob>(`/orders/${id}/invoice`, {
    responseType: 'blob',
  });

  const blob = new Blob([response], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Invoice_Order_${id}.txt`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

