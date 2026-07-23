import apiClient from './apiClient';

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  role: 'Admin' | 'Vendor' | 'Customer';
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}

export const loginApi = async (credentials: LoginParams): Promise<AuthResponse> => {
  const response = await apiClient.post<never, AuthResponse>('/auth/login', credentials);
  if (response.token) {
    localStorage.setItem('tradehub_token', response.token);
  }
  return response;
};

export const registerApi = async (data: RegisterParams): Promise<AuthResponse> => {
  const response = await apiClient.post<never, AuthResponse>('/auth/register', data);
  if (response.token) {
    localStorage.setItem('tradehub_token', response.token);
  }
  return response;
};

export const logoutApi = (): void => {
  localStorage.removeItem('tradehub_token');
  localStorage.removeItem('vendora_user');
  localStorage.removeItem('mockUser');
  localStorage.removeItem('vendora_active_user');
};
