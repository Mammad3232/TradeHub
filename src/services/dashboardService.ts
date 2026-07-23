import apiClient from './apiClient';

interface DayStats {
  day: string;
  total: number;
}

interface CategoryStat {
  category: string;
  count: number;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  salesByDay: DayStats[];
  categoryStats: CategoryStat[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return await apiClient.get<never, DashboardStats>('/dashboard/stats');
};
