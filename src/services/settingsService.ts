import apiClient from './apiClient';

export interface SiteSettingsDto {
  id?: number;
  siteName: string;
  supportEmail?: string;
  commissionRate?: number;
  maintenanceMode?: boolean;
  requireTwoFactor?: boolean;
  logoUrl?: string;
  faviconUrl?: string;
  updatedAt?: string;
}

const BACKEND_ORIGIN = 'http://localhost:5229';

export function getFullImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `${BACKEND_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function getSettingsApi(): Promise<SiteSettingsDto> {
  const data = await apiClient.get('/admin/settings');
  return data;
}

export async function uploadLogoApi(file: File): Promise<{ logoUrl: string; settings: SiteSettingsDto }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/admin/settings/upload-logo', formData);
  return response;
}

export async function uploadFaviconApi(file: File): Promise<{ faviconUrl: string; settings: SiteSettingsDto }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/admin/settings/upload-favicon', formData);
  return response;
}

export async function removeLogoApi(): Promise<{ settings: SiteSettingsDto }> {
  const response = await apiClient.post('/admin/settings/remove-logo');
  return response;
}

export async function removeFaviconApi(): Promise<{ settings: SiteSettingsDto }> {
  const response = await apiClient.post('/admin/settings/remove-favicon');
  return response;
}

export async function updateSettingsApi(formData: FormData): Promise<SiteSettingsDto> {
  const response = await apiClient.post('/admin/settings', formData);
  return response;
}
