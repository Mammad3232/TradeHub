import apiClient from './apiClient';

export interface UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  role: 'Admin' | 'Vendor' | 'Customer';
  createdAt: string;
  status: 'Active' | 'Suspended';
}

export const getAllUsersApi = async (): Promise<UserResponseDto[]> => {
  const response = await apiClient.get<never, UserResponseDto[]>('/users');
  return response;
};

export const updateUserRoleApi = async (userId: number, role: string): Promise<UserResponseDto> => {
  const response = await apiClient.put<never, UserResponseDto>(`/users/${userId}/role`, { role });
  return response;
};
