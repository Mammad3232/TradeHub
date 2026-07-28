import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RawPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneInput: any = typeof RawPhoneInput === 'function' ? RawPhoneInput : (RawPhoneInput as any)?.default || RawPhoneInput;
import {
  User, MapPin, Package, Settings as SettingsIcon, Download, FileText,
  ArrowRight, CheckCircle2, Truck, RotateCcw, Bell, Lock,
  Globe, ShieldAlert, Eye, EyeOff, Trash2, KeyRound, Plus,
  Edit3, Star, Loader2, X, Check,
} from 'lucide-react';
import { getMyOrders, getOrderTracking, downloadOrderInvoice, type OrderResponse, type OrderTrackingData } from '../services/orderService';
import { getImageUrl } from '../services/productService';
import {
  getMyProfile, updateMyProfile, changePassword,
  getAddresses, createAddress, updateAddress, deleteAddress, setPrimaryAddress,
  getUserPreferences, updateUserPreferences, deleteMyAccount,
  type ProfileData, type AddressData, type UpsertAddressPayload, type UserPreferencesPayload,
} from '../services/accountService';
import { usePreferences, normalizeCurrency, normalizeLanguage, type SupportedCurrency, type SupportedLanguage } from '../context/PreferencesContext';

// ── Status helpers ─────────────────────────────────────────────────────────────

type DisplayStatus = 'Delivered' | 'In Transit' | 'Cancelled' | 'Pending';

const toDisplayStatus = (raw: string): DisplayStatus => {
  if (raw === 'Delivered') return 'Delivered';
  if (raw === 'Shipped')   return 'In Transit';
  if (raw === 'Cancelled') return 'Cancelled';
  return 'Pending';
};

const statusStyles: Record<DisplayStatus, { badge: string; dot: string; icon: React.ElementType }> = {
  Delivered:   { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400', icon: CheckCircle2 },
  'In Transit':{ badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',         dot: 'bg-blue-400',    icon: Truck },
  Pending:     { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       dot: 'bg-amber-400',   icon: RotateCcw },
  Cancelled:   { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',          dot: 'bg-rose-400',    icon: X },
};

// ── Toast helper ───────────────────────────────────────────────────────────────

interface ToastState { message: string; type: 'success' | 'error' }

// ── Empty address form defaults ────────────────────────────────────────────────

const emptyAddress = (): UpsertAddressPayload => ({
  label: '', fullName: '', street: '', city: '',
  state: '', postalCode: '', country: '', phone: '', isPrimary: false,
});

// ── Component ──────────────────────────────────────────────────────────────────

export const MyOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'orders' | 'addresses' | 'settings'>('orders');

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<ToastState | null>(null);
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 1 — PERSONAL INFO
  // ─────────────────────────────────────────────────────────────────────────

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '', location: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((data) => {
        setProfile(data);
        setProfileForm({
          fullName: data.fullName ?? '',
          phoneNumber: data.phoneNumber ?? '',
          location: data.location ?? '',
        });
      })
      .catch(() => {
        // Fallback to localStorage
        const raw = localStorage.getItem('vendora_active_user') || localStorage.getItem('vendora_user');
        if (raw) {
          try {
            const p = JSON.parse(raw);
            setProfileForm({ fullName: p.name ?? '', phoneNumber: p.phone ?? '', location: p.location ?? '' });
          } catch { /* ignore */ }
        }
      });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateMyProfile({
        fullName: profileForm.fullName,
        phoneNumber: profileForm.phoneNumber || undefined,
        location: profileForm.location || undefined,
      });
      setProfile(updated);
      // Sync localStorage so Header avatar updates immediately
      const raw = localStorage.getItem('vendora_user');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const synced = { ...parsed, name: updated.fullName };
          localStorage.setItem('vendora_user', JSON.stringify(synced));
          localStorage.setItem('vendora_active_user', JSON.stringify(synced));
          window.dispatchEvent(new Event('vendora_user_update'));
        } catch { /* ignore */ }
      }
      showToast('Profile updated successfully!');
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 2 — MY ORDERS
  // ─────────────────────────────────────────────────────────────────────────

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState<OrderResponse | null>(null);
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<number | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<OrderResponse | null>(null);

  useEffect(() => {
    setLoadingOrders(true);
    getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, []);

  const handleTrackOrder = async (order: OrderResponse) => {
    setTrackingOrder(order);
    setLoadingTracking(true);
    setTrackingData(null);
    try {
      const data = await getOrderTracking(order.id);
      setTrackingData(data);
    } catch {
      setTrackingData(null);
    } finally {
      setLoadingTracking(false);
    }
  };

  const handleDownloadInvoice = async (orderId: number) => {
    setDownloadingInvoiceId(orderId);
    try {
      await downloadOrderInvoice(orderId);
      showToast('Invoice downloaded successfully!');
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to download invoice.', 'error');
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 3 — ADDRESSES
  // ─────────────────────────────────────────────────────────────────────────

  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addrModal, setAddrModal] = useState<{ open: boolean; editing: AddressData | null }>({ open: false, editing: null });
  const [addrForm, setAddrForm] = useState<UpsertAddressPayload>(emptyAddress());
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try { setAddresses(await getAddresses()); }
    catch { setAddresses([]); }
    finally { setLoadingAddresses(false); }
  }, []);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const validateAddrForm = (form: UpsertAddressPayload): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!form.label.trim()) {
      errors.label = 'Address label is required (e.g. Home, Office).';
    } else if (form.label.trim().length < 2) {
      errors.label = 'Label must be at least 2 characters.';
    } else if (form.label.trim().length > 100) {
      errors.label = 'Label cannot exceed 100 characters.';
    }

    if (!form.fullName.trim()) {
      errors.fullName = 'Full recipient name is required.';
    } else if (form.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    } else if (form.fullName.trim().length > 150) {
      errors.fullName = 'Full name cannot exceed 150 characters.';
    }

    if (!form.street.trim()) {
      errors.street = 'Street address is required.';
    } else if (form.street.trim().length < 5) {
      errors.street = 'Street address must be at least 5 characters.';
    } else if (form.street.trim().length > 300) {
      errors.street = 'Street address cannot exceed 300 characters.';
    }

    if (!form.city.trim()) {
      errors.city = 'City is required.';
    } else if (form.city.trim().length < 2) {
      errors.city = 'City must be at least 2 characters.';
    } else if (form.city.trim().length > 100) {
      errors.city = 'City cannot exceed 100 characters.';
    }

    if (form.state && form.state.trim().length > 100) {
      errors.state = 'State/Region cannot exceed 100 characters.';
    }

    if (!form.postalCode.trim()) {
      errors.postalCode = 'Postal code is required.';
    } else if (form.postalCode.trim().length < 3) {
      errors.postalCode = 'Postal code must be at least 3 characters.';
    } else if (form.postalCode.trim().length > 20) {
      errors.postalCode = 'Postal code cannot exceed 20 characters.';
    }

    if (!form.country.trim()) {
      errors.country = 'Country is required.';
    } else if (form.country.trim().length < 2) {
      errors.country = 'Country must be at least 2 characters.';
    } else if (form.country.trim().length > 100) {
      errors.country = 'Country cannot exceed 100 characters.';
    }

    if (form.phone) {
      const digitsOnly = form.phone.replace(/[^0-9]/g, '');
      if (digitsOnly.length > 0 && digitsOnly.length < 6) {
        errors.phone = 'Phone number is too short.';
      } else if (digitsOnly.length > 20) {
        errors.phone = 'Phone number cannot exceed 20 digits.';
      }
    }

    return errors;
  };

  const openAddModal = () => {
    setAddrForm(emptyAddress());
    setAddrError(null);
    setFieldErrors({});
    setAddrModal({ open: true, editing: null });
  };

  const openEditModal = (addr: AddressData) => {
    setAddrForm({
      label: addr.label, fullName: addr.fullName, street: addr.street,
      city: addr.city, state: addr.state, postalCode: addr.postalCode,
      country: addr.country, phone: addr.phone ?? '', isPrimary: addr.isPrimary,
    });
    setAddrError(null);
    setFieldErrors({});
    setAddrModal({ open: true, editing: addr });
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrError(null);

    const errors = validateAddrForm(addrForm);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setAddrError('Please correct the highlighted fields below.');
      return;
    }

    setFieldErrors({});
    setSavingAddr(true);
    try {
      if (addrModal.editing) {
        const updated = await updateAddress(addrModal.editing.id, addrForm);
        setAddresses(prev => prev.map(a => a.id === updated.id ? updated : a));
        showToast('Address updated successfully!');
      } else {
        const created = await createAddress(addrForm);
        setAddresses(prev => addrForm.isPrimary
          ? [created, ...prev.map(a => ({ ...a, isPrimary: false }))]
          : [...prev, created]);
        showToast('Address added successfully!');
      }
      setAddrModal({ open: false, editing: null });
      fetchAddresses();
    } catch (err: any) {
      const errMsg = err?.message ?? 'Failed to save address.';
      setAddrError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      await deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      showToast('Address removed.');
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to delete address.', 'error');
    }
  };

  const handleSetPrimary = async (id: number) => {
    try {
      await setPrimaryAddress(id);
      setAddresses(prev => prev.map(a => ({ ...a, isPrimary: a.id === id })));
      showToast('Primary address updated.');
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to set primary.', 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 4 — SETTINGS / CHANGE PASSWORD
  // ─────────────────────────────────────────────────────────────────────────

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const { currency: globalCurrency, language: globalLanguage, changeCurrency, changeLanguage, formatPrice } = usePreferences();
  const { t } = useTranslation();

  const [notifPrefs, setNotifPrefs] = useState<UserPreferencesPayload>({
    orderUpdates: true, promotionalEmails: false, smsAlerts: true,
    language: 'English', currency: 'USD ($)',
  });
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    getUserPreferences().then((p) => {
      setNotifPrefs(p);
      if (p.currency) changeCurrency(p.currency);
      if (p.language) changeLanguage(p.language);
    }).catch(() => {});
  }, [changeCurrency, changeLanguage]);

  const savePreference = async (updated: UserPreferencesPayload) => {
    setNotifPrefs(updated);
    if (updated.currency) changeCurrency(updated.currency);
    if (updated.language) changeLanguage(updated.language);
    setPrefsSaving(true);
    try {
      await updateUserPreferences(updated);
      showToast('Preference saved.');
    } catch {
      showToast('Failed to save preference.', 'error');
    } finally {
      setPrefsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.currentPassword) {
      setSecurityMessage({ text: 'Please enter your current password.', ok: false });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setSecurityMessage({ text: 'New password must be at least 6 characters.', ok: false });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setSecurityMessage({ text: 'New passwords do not match.', ok: false });
      return;
    }
    setChangingPass(true);
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setSecurityMessage({ text: 'Password changed successfully!', ok: true });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setSecurityMessage({ text: err?.message ?? 'Failed to change password.', ok: false });
    } finally {
      setChangingPass(false);
      setTimeout(() => setSecurityMessage(null), 5000);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteMyAccount();
    } catch { /* best-effort */ }
    finally {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const displayName = profile?.fullName || profileForm.fullName || 'My Account';
  const displayEmail = profile?.email || '';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="bg-[#060913] min-h-screen text-slate-200 pb-20 font-sans">

      {/* ── Global Toast ──────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[500] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold border animate-in slide-in-from-bottom-4 duration-300 ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
          {toast.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* Breadcrumb */}
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-all">
            <ArrowRight className="h-4 w-4 text-purple-400 rotate-180" />
            {t('profile.backToMarketplace')}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
          <aside className="lg:col-span-3 bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 w-full pb-6 border-b border-slate-800/80">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 p-1 shadow-xl shadow-purple-600/20 mx-auto flex items-center justify-center relative group ring-4 ring-purple-500/20">
                <span className="w-full h-full bg-[#111827] rounded-full flex items-center justify-center font-extrabold text-2xl text-white group-hover:bg-purple-900/20 transition-colors">
                  {initials || '?'}
                </span>
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#111827] rounded-full ring-2 ring-emerald-500/30" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white leading-tight">{displayName}</h3>
                <p className="text-xs text-slate-400 truncate mt-1">{displayEmail}</p>
                {profile?.role && (
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {profile.role}
                  </span>
                )}
              </div>
            </div>

            <nav className="w-full pt-6 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 lg:gap-1.5 text-xs sm:text-sm font-semibold scrollbar-none">
              {([ ['personal', t('profile.personalInfo'), User], ['orders', t('profile.myOrders'), Package], ['addresses', t('profile.addresses'), MapPin], ['settings', t('profile.settings'), SettingsIcon]] as const).map(([tab, label, Icon]) => (
                <button
                  key={tab} type="button" onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center justify-center lg:justify-start px-4 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap gap-3 ${activeTab === tab ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-grow text-left">{label}</span>
                  {tab === 'orders' && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${activeTab === 'orders' ? 'bg-purple-500 border-purple-400 text-white' : 'bg-[#0E1524] border-slate-800 text-slate-400'}`}>
                      {orders.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* ── RIGHT CONTENT ─────────────────────────────────────────────── */}
          <main className="lg:col-span-9 w-full space-y-6">

            {/* ══════════════════════════════════════════════════════════════
                TAB A — PERSONAL INFO
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'personal' && (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-left animate-in fade-in duration-200 space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">{t('profile.personalInfoTitle')}</h2>
                  <p className="text-xs text-slate-400 mt-1">{t('profile.personalInfoSubtitle')}</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    <div className="flex flex-col gap-2">
                      <label htmlFor="p-name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('profile.fullName')}</label>
                      <input id="p-name" type="text" required
                        value={profileForm.fullName}
                        onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="p-email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('profile.emailAddress')}</label>
                      <input id="p-email" type="email" disabled
                        value={profile?.email ?? ''}
                        className="w-full bg-[#0E1524]/60 border border-slate-800/60 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed font-semibold"
                      />
                      <p className="text-[10px] text-slate-600">{t('profile.emailNoChange')}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="p-phone" className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('profile.phoneNumber')}</label>
                      <input id="p-phone" type="text"
                        value={profileForm.phoneNumber}
                        onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="p-loc" className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('profile.locationCity')}</label>
                      <input id="p-loc" type="text"
                        value={profileForm.location}
                        onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                        placeholder="Baku, Azerbaijan"
                        className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <button type="submit" disabled={savingProfile}
                      className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-purple-600/20 active:scale-[.98] cursor-pointer"
                    >
                      {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                      {t('profile.saveAlterations')}
                    </button>
                    {profile?.createdAt && (
                      <p className="text-[11px] text-slate-600">{t('profile.memberSince')} {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB B — MY ORDERS
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in duration-200 text-left">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{t('orders.title')}</h2>
                  <p className="text-xs text-slate-400 mt-1">{t('orders.subtitle')}</p>
                </div>

                {loadingOrders ? (
                  <div className="flex items-center justify-center py-20 text-slate-500 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-sm">{t('orders.loading')}</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center shadow-xl">
                    <Package className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                    <h3 className="text-base font-bold text-white">{t('orders.noOrders')}</h3>
                    <p className="text-sm text-slate-400 mt-2">{t('orders.noOrdersSubtitle')}</p>
                    <Link to="/" className="inline-block mt-6 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all">
                      {t('orders.startShopping')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {orders.map((order) => {
                      const ds = toDisplayStatus(order.status);
                      const { badge, dot, icon: StatusIcon } = statusStyles[ds];
                      return (
                        <div key={order.id} className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl hover:border-slate-700 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-4">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
                              <div>
                                <span className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">{t('orders.orderId')}</span>
                                <span className="font-mono text-white font-bold text-sm mt-0.5 block">#{order.id}</span>
                              </div>
                              <div>
                                <span className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">{t('orders.placed')}</span>
                                <span className="font-semibold text-slate-200 mt-0.5 block">
                                  {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                              <div>
                                <span className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">{t('orders.totalLabel')}</span>
                                <span className="font-extrabold text-white text-sm mt-0.5 block">{formatPrice(order.totalPrice)}</span>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-bold border ${badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                              <StatusIcon className="w-3.5 h-3.5" />
                              {ds}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
                            {order.items.map((item) => (
                              <div key={item.productId} className="flex items-center gap-3 bg-[#0E1524]/60 p-3 rounded-xl border border-slate-800">
                                {item.productImage ? (
                                  <img src={getImageUrl(item.productImage)} alt={item.productName} className="w-12 h-12 rounded-lg object-cover border border-slate-800 flex-shrink-0" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                    <Package className="w-5 h-5 text-slate-600" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px]" title={item.productName}>{item.productName}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-slate-500 font-semibold bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                                      {t('orders.qty')}: {item.quantity}
                                    </span>
                                    <span className="text-xs text-slate-400 font-semibold font-mono">{formatPrice(item.unitPrice)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 text-xs font-bold">
                            <span className="text-slate-500 text-[11px] font-semibold">{t('orders.status')}: {order.status}</span>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => handleTrackOrder(order)}
                                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow transition-all active:scale-[.98] cursor-pointer text-xs font-bold"
                              >
                                {t('orders.trackOrder')}
                              </button>
                              <button type="button" title="View & Download Invoice" onClick={() => setInvoiceModalOrder(order)}
                                className="p-2.5 text-slate-400 hover:text-white bg-[#0E1524] border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB C — ADDRESSES
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'addresses' && (
              <div className="space-y-6 text-left animate-in fade-in duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Saved Addresses</h2>
                    <p className="text-xs text-slate-400 mt-1">Manage your billing and delivery addresses.</p>
                  </div>
                  <button type="button" onClick={openAddModal}
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-purple-600/20 active:scale-[.98] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                </div>

                {loadingAddresses ? (
                  <div className="flex items-center justify-center py-16 text-slate-500 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-sm">Loading addresses...</span>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center shadow-xl">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                    <h3 className="text-base font-bold text-white">No addresses saved</h3>
                    <p className="text-sm text-slate-400 mt-2">Add a shipping address to speed up checkout.</p>
                    <button type="button" onClick={openAddModal}
                      className="inline-block mt-6 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer"
                    >
                      Add First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-2">
                              {addr.isPrimary && (
                                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/25 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                  Primary
                                </span>
                              )}
                              {!addr.isPrimary && (
                                <button type="button" onClick={() => handleSetPrimary(addr.id)}
                                  title="Set as primary"
                                  className="text-[9px] font-bold uppercase tracking-wider text-slate-500 hover:text-purple-400 transition-colors border border-slate-800 hover:border-purple-500/30 px-2 py-0.5 rounded cursor-pointer"
                                >
                                  <Star className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-white text-sm">{addr.label}</h4>
                            <p className="text-xs font-semibold text-slate-300 mt-1">{addr.fullName}</p>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {addr.street}<br />
                              {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}<br />
                              {addr.country}
                            </p>
                            {addr.phone && <p className="text-xs text-slate-500 mt-1">{addr.phone}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-5 border-t border-slate-800 mt-5">
                          <button type="button" onClick={() => openEditModal(addr)} className="inline-flex items-center gap-1 hover:text-purple-400 transition-colors cursor-pointer">
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <span className="text-slate-800">|</span>
                          <button type="button" onClick={() => handleDeleteAddress(addr.id)} className="inline-flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB D — SETTINGS
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'settings' && (
              <div className="space-y-4 text-left animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Account Settings</h2>
                  <p className="text-xs text-slate-400 mt-1">Manage credentials, notifications, and regional preferences.</p>
                </div>

                {/* Security / Change Password */}
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">Account Security</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Update your password to keep your account safe.</p>
                    </div>
                  </div>

                  {securityMessage && (
                    <div className={`p-3 rounded-xl text-xs font-semibold border ${securityMessage.ok ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                      {securityMessage.text}
                    </div>
                  )}

                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'curr-pass', label: 'Current Password', field: 'currentPassword' as const, show: showCurrentPass, toggle: () => setShowCurrentPass(v => !v) },
                        { id: 'new-pass',  label: 'New Password',     field: 'newPassword' as const,     show: showNewPass,     toggle: () => setShowNewPass(v => !v) },
                        { id: 'conf-pass', label: 'Confirm Password', field: 'confirmPassword' as const,  show: showConfirmPass, toggle: () => setShowConfirmPass(v => !v) },
                      ].map(({ id, label, field, show, toggle }) => (
                        <div key={id} className="flex flex-col gap-1.5">
                          <label htmlFor={id} className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
                          <div className="relative">
                            <input id={id} type={show ? 'text' : 'password'}
                              value={passwords[field]}
                              onChange={e => setPasswords({ ...passwords, [field]: e.target.value })}
                              placeholder="••••••••"
                              className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium pr-10"
                            />
                            <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" disabled={changingPass}
                        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-purple-600/20 active:scale-[.98] cursor-pointer"
                      >
                        {changingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>

                {/* Notification Preferences */}
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white">Notification Preferences</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Control how and when you receive updates.</p>
                      </div>
                    </div>
                    {prefsSaving && <Loader2 className="w-4 h-4 animate-spin text-purple-400 flex-shrink-0" />}
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'orderUpdates' as const,      label: 'Order Delivery Updates',  desc: 'Real-time notifications on order status changes.' },
                      { key: 'promotionalEmails' as const, label: 'Promotional Emails',       desc: 'Exclusive discounts, seasonal sales, and recommendations.' },
                      { key: 'smsAlerts' as const,         label: 'SMS Alerts',               desc: 'Urgent delivery SMS on your mobile number.' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-[#0E1524] rounded-xl border border-slate-800">
                        <div>
                          <h4 className="text-xs font-bold text-white">{label}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                        </div>
                        <button type="button"
                          onClick={() => savePreference({ ...notifPrefs, [key]: !notifPrefs[key] })}
                          disabled={prefsSaving}
                          className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer disabled:opacity-60 flex-shrink-0 ml-4 ${notifPrefs[key] ? 'bg-purple-600' : 'bg-slate-700'}`}
                        >
                          <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${notifPrefs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regional Settings */}
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white">Regional Settings</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Configure your preferred language and currency.</p>
                      </div>
                    </div>
                    {prefsSaving && <Loader2 className="w-4 h-4 animate-spin text-purple-400 flex-shrink-0" />}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="reg-lang" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Language</label>
                      <select id="reg-lang"
                        value={globalLanguage === 'az' ? 'Azerbaijani' : globalLanguage === 'tr' ? 'Turkish' : globalLanguage === 'ru' ? 'Russian' : 'English'}
                        onChange={e => savePreference({ ...notifPrefs, language: e.target.value })}
                        disabled={prefsSaving}
                        className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium cursor-pointer disabled:opacity-60"
                      >
                        <option value="English">English</option>
                        <option value="Azerbaijani">Azerbaijani</option>
                        <option value="Turkish">Turkish</option>
                        <option value="Russian">Russian</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="reg-curr" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Currency</label>
                      <select id="reg-curr"
                        value={globalCurrency === 'AZN' ? 'AZN (₼)' : globalCurrency === 'EUR' ? 'EUR (€)' : 'USD ($)'}
                        onChange={e => savePreference({ ...notifPrefs, currency: e.target.value })}
                        disabled={prefsSaving}
                        className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium cursor-pointer disabled:opacity-60"
                      >
                        <option value="USD ($)">USD ($)</option>
                        <option value="AZN (₼)">AZN (₼)</option>
                        <option value="EUR (€)">EUR (€)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center gap-3 pb-3 border-b border-rose-500/20 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">Danger Zone</h3>
                      <p className="text-xs text-rose-300/70 mt-0.5">Irreversible and destructive account operations.</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-white">Delete Account</h4>
                      <p className="text-xs text-slate-400 mt-0.5 max-w-md">
                        Once deleted, all saved addresses, order history, and personal data are permanently removed.
                      </p>
                    </div>
                    <button type="button" onClick={() => setDeleteModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-rose-600/20 active:scale-[.98] cursor-pointer whitespace-nowrap"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Account
                    </button>
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DELETE ACCOUNT CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-rose-500/30 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-5 border-b border-rose-500/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Delete Account Permanently?</h3>
                <p className="text-xs text-rose-300/70 mt-0.5">This action cannot be undone.</p>
              </div>
              <button type="button" onClick={() => setDeleteModalOpen(false)} disabled={deletingAccount}
                className="ml-auto text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-4 bg-rose-500/5 border border-rose-500/15 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-rose-300">The following will be permanently deleted:</p>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Your profile and personal details</li>
                  <li>All saved addresses</li>
                  <li>Your complete order history</li>
                  <li>All account settings and preferences</li>
                </ul>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                You will be logged out immediately and will not be able to recover your account.
              </p>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setDeleteModalOpen(false)} disabled={deletingAccount}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel, Keep Account
                </button>
                <button type="button" onClick={handleDeleteAccount} disabled={deletingAccount}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {deletingAccount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  {deletingAccount ? 'Deleting...' : 'Yes, Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ADDRESS MODAL — Add / Edit
      ══════════════════════════════════════════════════════════════════════ */}
      {addrModal.open && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {addrModal.editing ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button type="button" onClick={() => setAddrModal({ open: false, editing: null })}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {addrError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{addrError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Label */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Label *</label>
                  <input maxLength={100} value={addrForm.label} onChange={e => { setAddrForm({ ...addrForm, label: e.target.value }); if (fieldErrors.label) setFieldErrors(prev => ({ ...prev, label: '' })); }}
                    placeholder="e.g. Home, Office"
                    className={`w-full bg-[#0E1524] border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${fieldErrors.label ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800'}`}
                  />
                  {fieldErrors.label && <p className="text-[11px] text-rose-400 font-semibold mt-0.5">{fieldErrors.label}</p>}
                </div>
                {/* Full Name */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Name *</label>
                  <input maxLength={150} value={addrForm.fullName} onChange={e => { setAddrForm({ ...addrForm, fullName: e.target.value }); if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: '' })); }}
                    placeholder="Recipient name"
                    className={`w-full bg-[#0E1524] border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${fieldErrors.fullName ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800'}`}
                  />
                  {fieldErrors.fullName && <p className="text-[11px] text-rose-400 font-semibold mt-0.5">{fieldErrors.fullName}</p>}
                </div>
                {/* Street */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Street Address *</label>
                  <input maxLength={300} value={addrForm.street} onChange={e => { setAddrForm({ ...addrForm, street: e.target.value }); if (fieldErrors.street) setFieldErrors(prev => ({ ...prev, street: '' })); }}
                    placeholder="123 Main St, Apt 4B"
                    className={`w-full bg-[#0E1524] border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${fieldErrors.street ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800'}`}
                  />
                  {fieldErrors.street && <p className="text-[11px] text-rose-400 font-semibold mt-0.5">{fieldErrors.street}</p>}
                </div>
                {/* City */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">City *</label>
                  <input maxLength={100} value={addrForm.city} onChange={e => { setAddrForm({ ...addrForm, city: e.target.value }); if (fieldErrors.city) setFieldErrors(prev => ({ ...prev, city: '' })); }}
                    placeholder="City"
                    className={`w-full bg-[#0E1524] border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${fieldErrors.city ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800'}`}
                  />
                  {fieldErrors.city && <p className="text-[11px] text-rose-400 font-semibold mt-0.5">{fieldErrors.city}</p>}
                </div>
                {/* State */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">State / Region</label>
                  <input maxLength={100} value={addrForm.state} onChange={e => { setAddrForm({ ...addrForm, state: e.target.value }); if (fieldErrors.state) setFieldErrors(prev => ({ ...prev, state: '' })); }}
                    placeholder="State"
                    className={`w-full bg-[#0E1524] border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${fieldErrors.state ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800'}`}
                  />
                  {fieldErrors.state && <p className="text-[11px] text-rose-400 font-semibold mt-0.5">{fieldErrors.state}</p>}
                </div>
                {/* Postal Code */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Postal Code *</label>
                  <input maxLength={20} value={addrForm.postalCode} onChange={e => { setAddrForm({ ...addrForm, postalCode: e.target.value }); if (fieldErrors.postalCode) setFieldErrors(prev => ({ ...prev, postalCode: '' })); }}
                    placeholder="AZ1000"
                    className={`w-full bg-[#0E1524] border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${fieldErrors.postalCode ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800'}`}
                  />
                  {fieldErrors.postalCode && <p className="text-[11px] text-rose-400 font-semibold mt-0.5">{fieldErrors.postalCode}</p>}
                </div>
                {/* Country */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Country *</label>
                  <input maxLength={100} value={addrForm.country} onChange={e => { setAddrForm({ ...addrForm, country: e.target.value }); if (fieldErrors.country) setFieldErrors(prev => ({ ...prev, country: '' })); }}
                    placeholder="Azerbaijan"
                    className={`w-full bg-[#0E1524] border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${fieldErrors.country ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800'}`}
                  />
                  {fieldErrors.country && <p className="text-[11px] text-rose-400 font-semibold mt-0.5">{fieldErrors.country}</p>}
                </div>
                {/* Smart Phone Input */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone Number (with Country Code)</label>
                  <div className="phone-input-theme">
                    <PhoneInput
                      country={'az'}
                      value={addrForm.phone || ''}
                      onChange={(phoneVal) => {
                        const formatted = phoneVal ? (phoneVal.startsWith('+') ? phoneVal : `+${phoneVal}`) : '';
                        setAddrForm({ ...addrForm, phone: formatted });
                        if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      enableSearch
                      searchPlaceholder="Search country..."
                      inputProps={{
                        name: 'phone',
                        maxLength: 20,
                      }}
                      containerClass="!w-full font-sans text-sm"
                      inputClass={`!w-full !bg-[#0E1524] !text-white !h-[42px] !rounded-xl !pl-14 transition-all !font-medium ${fieldErrors.phone ? '!border-rose-500' : '!border-slate-800 focus:!border-purple-500'}`}
                      buttonClass="!bg-[#0E1524] !border-slate-800 !rounded-l-xl !px-2.5 hover:!bg-slate-800/80 transition-colors"
                      dropdownClass="!bg-[#111827] !text-slate-200 !border-slate-800 !rounded-xl !shadow-2xl"
                    />
                  </div>
                  {fieldErrors.phone && <p className="text-[11px] text-rose-400 font-semibold mt-0.5">{fieldErrors.phone}</p>}
                </div>
                {/* Primary toggle */}
                <div className="col-span-2 flex items-center gap-3 p-3 bg-[#0E1524] rounded-xl border border-slate-800">
                  <button type="button" onClick={() => setAddrForm({ ...addrForm, isPrimary: !addrForm.isPrimary })}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${addrForm.isPrimary ? 'bg-purple-600' : 'bg-slate-700'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${addrForm.isPrimary ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-xs font-semibold text-slate-300">Set as primary address</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setAddrModal({ open: false, editing: null })} disabled={savingAddr}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button type="submit" disabled={savingAddr}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {savingAddr && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {savingAddr ? (addrModal.editing ? 'Saving...' : 'Adding Address...') : (addrModal.editing ? 'Save Changes' : 'Add Address')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ORDER TRACKING MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Track Order #{trackingOrder.id}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Status: <span className="font-semibold text-purple-400">{trackingOrder.status}</span></p>
              </div>
              <button type="button" onClick={() => { setTrackingOrder(null); setTrackingData(null); }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-sm">
              {/* Product preview header */}
              <div className="flex items-center gap-3 bg-[#0E1524] p-3 rounded-xl border border-slate-800">
                {trackingOrder.items.slice(0, 3).map((item) => (
                  item.productImage ? (
                    <img key={item.productId} src={getImageUrl(item.productImage)} alt={item.productName} className="w-10 h-10 rounded object-cover border border-slate-800" />
                  ) : (
                    <div key={item.productId} className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-slate-600" />
                    </div>
                  )
                ))}
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[200px]">
                    {trackingOrder.items.map(i => i.productName).join(', ')}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{t('orders.customer')} {trackingOrder.customerName}</p>
                </div>
              </div>

              {/* Carrier & Tracking Meta */}
              {trackingData && (
                <div className="grid grid-cols-2 gap-3 bg-[#0E1524]/60 p-3 rounded-xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('orders.carrier')}</span>
                    <span className="font-semibold text-slate-200">{trackingData.carrier}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('orders.trackingNumber')}</span>
                    <span className="font-mono text-purple-400 font-bold">{trackingData.trackingNumber}</span>
                  </div>
                </div>
              )}

              {/* Steps timeline */}
              {loadingTracking ? (
                <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                  <span className="text-xs">{t('orders.fetchingStatus')}</span>
                </div>
              ) : (
                <div className="space-y-5 relative pl-6">
                  <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-slate-800" />
                  {(trackingData?.steps || [
                    { title: 'Order Received', description: `Placed on ${new Date(trackingOrder.orderDate).toLocaleDateString()}`, isCompleted: true, isCurrent: trackingOrder.status === 'Pending' },
                    { title: 'Order Confirmed', description: 'Payment verified and seller notified.', isCompleted: ['Confirmed','Shipped','Delivered'].includes(trackingOrder.status), isCurrent: trackingOrder.status === 'Confirmed' },
                    { title: 'In Transit', description: 'Parcel shipped and on its way.', isCompleted: ['Shipped','Delivered'].includes(trackingOrder.status), isCurrent: trackingOrder.status === 'Shipped' },
                    { title: 'Delivered', description: 'Successfully received by buyer.', isCompleted: trackingOrder.status === 'Delivered', isCurrent: trackingOrder.status === 'Delivered' },
                  ]).map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className={`absolute -left-5 top-1 w-3.5 h-3.5 rounded-full ring-4 flex items-center justify-center ${step.isCurrent ? 'bg-purple-400 ring-purple-500/30 shadow-lg shadow-purple-500/50 animate-pulse' : step.isCompleted ? 'bg-emerald-500 ring-emerald-500/20' : 'bg-slate-800 ring-transparent'}`} />
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold text-xs ${step.isCurrent ? 'text-purple-400' : step.isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>{step.title}</h4>
                          {step.timestamp && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(step.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#0B1120] flex justify-between items-center">
              <button type="button" onClick={() => setInvoiceModalOrder(trackingOrder)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                {t('orders.viewInvoice')}
              </button>
              <button type="button" onClick={() => { setTrackingOrder(null); setTrackingData(null); }} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer">
                {t('orders.closeTracking')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          INVOICE SUMMARY MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {invoiceModalOrder && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0E1524]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{t('orders.invoice.title')}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Order #{invoiceModalOrder.id}</p>
                </div>
              </div>
              <button type="button" onClick={() => setInvoiceModalOrder(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto text-sm">

              {/* Top Details Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0E1524]/60 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('orders.invoice.billedTo')}</span>
                  <p className="font-bold text-white mt-1">{invoiceModalOrder.customerName}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{invoiceModalOrder.customerEmail}</p>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('orders.invoice.orderDateStatus')}</span>
                  <p className="font-semibold text-slate-300 mt-1">
                    {new Date(invoiceModalOrder.orderDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Status: {invoiceModalOrder.status}
                  </span>
                </div>
              </div>

              {/* Itemized Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('orders.invoice.orderItems')}</h4>
                <div className="bg-[#0E1524] rounded-xl border border-slate-800 overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="col-span-6">{t('orders.invoice.itemDescription')}</span>
                    <span className="col-span-2 text-center">{t('orders.invoice.qty')}</span>
                    <span className="col-span-2 text-right">{t('orders.invoice.price')}</span>
                    <span className="col-span-2 text-right">{t('orders.invoice.subtotal')}</span>
                  </div>

                  <div className="divide-y divide-slate-800/60">
                    {invoiceModalOrder.items.map((item) => (
                      <div key={item.productId} className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-xs">
                        <div className="col-span-6 flex items-center gap-3 min-w-0">
                          {item.productImage ? (
                            <img src={getImageUrl(item.productImage)} alt={item.productName} className="w-9 h-9 rounded object-cover border border-slate-800 flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded bg-slate-800 flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 text-slate-600" />
                            </div>
                          )}
                          <span className="font-semibold text-white truncate" title={item.productName}>{item.productName}</span>
                        </div>
                        <span className="col-span-2 text-center font-semibold text-slate-300">x{item.quantity}</span>
                        <span className="col-span-2 text-right font-mono text-slate-400">{formatPrice(item.unitPrice)}</span>
                        <span className="col-span-2 text-right font-mono font-bold text-white">{formatPrice(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex justify-end">
                <div className="w-full sm:w-64 space-y-2 text-xs bg-[#0E1524]/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>{t('orders.invoice.subtotal')}</span>
                    <span className="font-mono text-slate-200">{formatPrice(invoiceModalOrder.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{t('orders.invoice.shipping')}</span>
                    <span className="text-emerald-400 font-semibold">{t('common.free')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{t('orders.invoice.tax')}</span>
                    <span className="font-mono text-slate-200">{formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-extrabold text-white">
                    <span>{t('orders.invoice.totalAmount')}</span>
                    <span className="font-mono text-purple-400">{formatPrice(invoiceModalOrder.totalPrice)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-[#0B1120] flex items-center justify-between">
              <span className="text-[11px] text-slate-500 hidden sm:inline">{t('orders.invoice.receipt')}</span>
              <div className="flex items-center gap-3 ml-auto">
                <button type="button" onClick={() => setInvoiceModalOrder(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t('orders.invoice.close')}
                </button>
                <button type="button" onClick={() => handleDownloadInvoice(invoiceModalOrder.id)} disabled={downloadingInvoiceId === invoiceModalOrder.id}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-[.98] cursor-pointer disabled:opacity-60"
                >
                  {downloadingInvoiceId === invoiceModalOrder.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('orders.invoice.downloading')}
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      {t('orders.invoice.downloadPdf')}
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
