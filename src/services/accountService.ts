import apiClient from './apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProfileData {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  location?: string;
  role: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  phoneNumber?: string;
  location?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AddressData {
  id: number;
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isPrimary: boolean;
}

export interface UpsertAddressPayload {
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isPrimary: boolean;
}

// ── Account / Profile ─────────────────────────────────────────────────────────

export const getMyProfile = (): Promise<ProfileData> =>
  apiClient.get<never, ProfileData>('/account/me');

export const updateMyProfile = (payload: UpdateProfilePayload): Promise<ProfileData> =>
  apiClient.put<never, ProfileData>('/account/profile', payload);

export const uploadAvatar = (file: File): Promise<ProfileData> => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post<never, ProfileData>('/account/avatar', formData);
};

export const deleteAvatar = (): Promise<ProfileData> =>
  apiClient.delete<never, ProfileData>('/account/avatar');

export const changePassword = (payload: ChangePasswordPayload): Promise<void> =>
  apiClient.post<never, void>('/account/change-password', payload);

// ── Addresses ─────────────────────────────────────────────────────────────────

export const getAddresses = (): Promise<AddressData[]> =>
  apiClient.get<never, AddressData[]>('/addresses');

export const createAddress = (payload: UpsertAddressPayload): Promise<AddressData> =>
  apiClient.post<never, AddressData>('/addresses', payload);

export const updateAddress = (id: number, payload: UpsertAddressPayload): Promise<AddressData> =>
  apiClient.put<never, AddressData>(`/addresses/${id}`, payload);

export const deleteAddress = (id: number): Promise<void> =>
  apiClient.delete<never, void>(`/addresses/${id}`);

export const setPrimaryAddress = (id: number): Promise<void> =>
  apiClient.put<never, void>(`/addresses/${id}/primary`, {});

// ── Preferences & Account Deletion ────────────────────────────────────────────

export interface UserPreferencesPayload {
  orderUpdates: boolean;
  promotionalEmails: boolean;
  smsAlerts: boolean;
  language: string;
  currency: string;
}

export const getUserPreferences = (): Promise<UserPreferencesPayload> =>
  apiClient.get<never, UserPreferencesPayload>('/account/preferences');

export const updateUserPreferences = (payload: UserPreferencesPayload): Promise<UserPreferencesPayload> =>
  apiClient.put<never, UserPreferencesPayload>('/account/preferences', payload);

export const deleteMyAccount = (): Promise<void> =>
  apiClient.delete<never, void>('/account/me');
