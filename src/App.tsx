import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Header }   from './components/Header';
import { Footer }   from './components/Footer';
import { Sidebar }  from './components/Sidebar';

// ── Pages ─────────────────────────────────────────────────────────────────────
import { Home }             from './pages/Home';
import { Login }            from './pages/Login';
import { Register }         from './pages/Register';
import { VerifyCode }       from './pages/VerifyCode';
import { ResetPassword }    from './pages/ResetPassword';
import { ProductDetail }    from './pages/ProductDetail';
import { Cart }             from './pages/Cart';
import { Checkout }         from './pages/Checkout';
import { MyOrders }         from './pages/MyOrders';
import { VendorDashboard }  from './pages/VendorDashboard';
import { VendorProducts }   from './pages/VendorProducts';
import { AdminDashboard }   from './pages/AdminDashboard';
import { DealsPage }        from './pages/DealsPage';
import { VendorsPage }      from './pages/VendorsPage';
import { NewArrivalsPage }  from './pages/NewArrivalsPage';
import { BecomeVendorPage } from './pages/BecomeVendorPage';
import { NotFound }         from './pages/NotFound';
import { WishlistPage }      from './pages/WishlistPage';
import { ContactPage }       from './pages/ContactPage';
import { AboutPage }         from './pages/AboutPage';
import { LegalPage }         from './pages/LegalPage';
import { HelpPage }          from './pages/HelpPage';
import { CareersPage }       from './pages/CareersPage';
import { BlogPage }          from './pages/BlogPage';
import { CategoryPage }      from './pages/CategoryPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { AdminRoute }        from './components/AdminRoute';
import { VendorRoute }       from './components/VendorRoute';
import { ScrollToTop }       from './components/ScrollToTop';

// ── Shared user type (single source of truth for the whole app) ───────────────
export interface CurrentUser {
  isLoggedIn: boolean;
  name:       string;
  role:       'Admin' | 'Vendor' | 'Customer' | 'Guest';
  email?:     string;
  logoUrl?:   string;
  avatarUrl?: string;
}

/**
 * Normalizes any stored user object into a valid CurrentUser.
 * Handles legacy shapes from Login.tsx (role:'seller'/'buyer') and
 * mockUser shapes (role:'Admin'/'Vendor').
 */
export function normalizeUser(raw: Record<string, unknown>): CurrentUser | null {
  if (!raw || !raw.name) return null;

  // Map DB role strings to app role strings
  const roleMap: Record<string, CurrentUser['role']> = {
    seller: 'Vendor',
    buyer:  'Customer',
    admin:  'Admin',
    Admin:  'Admin',
    Vendor: 'Vendor',
    Customer: 'Customer',
  };

  const rawRole = String(raw.role ?? '');
  const rawEmail = String(raw.email ?? '').toLowerCase();

  let role: CurrentUser['role'] = roleMap[rawRole] ?? 'Customer';
  if (rawEmail === 'admin@vendora.store') {
    role = 'Admin';
  }

  return {
    isLoggedIn: true,
    name:       String(raw.name ?? ''),
    email:      raw.email ? String(raw.email) : undefined,
    role,
    logoUrl:    raw.logoUrl ? String(raw.logoUrl) : undefined,
    avatarUrl:  raw.avatarUrl ? String(raw.avatarUrl) : undefined,
  };
}

import { AlertTriangle } from 'lucide-react';

export interface SiteSettings {
  siteName: string;
  supportEmail?: string;
  commissionRate?: number;
  maintenanceMode?: boolean;
  requireTwoFactor?: boolean;
}

interface LayoutProps {
  currentUser: CurrentUser;
  siteSettings: SiteSettings;
  onSignOut: () => void;
}

const MaintenanceBanner = () => (
  <div className="bg-red-600 text-white text-xs sm:text-sm font-extrabold px-4 py-2 text-center flex items-center justify-center gap-2 shadow-lg sticky top-0 z-[100] animate-in slide-in-from-top duration-200 select-none">
    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
    <span>⚠️ System is currently in maintenance mode. Storefront checkouts are disabled.</span>
  </div>
);

// ── Layout Wrappers ───────────────────────────────────────────────────────────

/** Public routes — Header + Footer */
const PublicLayout: React.FC<LayoutProps> = ({ currentUser, siteSettings, onSignOut }) => (
  <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
    {siteSettings.maintenanceMode && <MaintenanceBanner />}
    <Header currentUser={currentUser} siteSettings={siteSettings} onSignOut={onSignOut} />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer currentUser={currentUser} />
  </div>
);

/** Vendor routes — Header + Sidebar, no public footer */
const VendorLayout: React.FC<LayoutProps> = ({ currentUser, siteSettings, onSignOut }) => (
  <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
    {siteSettings.maintenanceMode && <MaintenanceBanner />}
    <Header currentUser={currentUser} siteSettings={siteSettings} onSignOut={onSignOut} />
    <div className="flex flex-1">
      <Sidebar role="vendor" storeName="My Store" onSignOut={onSignOut} />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  </div>
);

/** Admin routes — Header + Sidebar */
const AdminLayout: React.FC<LayoutProps> = ({ currentUser, siteSettings, onSignOut }) => (
  <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
    {siteSettings.maintenanceMode && <MaintenanceBanner />}
    <Header currentUser={currentUser} siteSettings={siteSettings} onSignOut={onSignOut} />
    <div className="flex flex-1">
      <Sidebar role="admin" onSignOut={onSignOut} />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  </div>
);

// ── App ───────────────────────────────────────────────────────────────────────

import { ShopProvider } from './context/ShopContext';
import { NotificationProvider } from './context/NotificationContext';
import { AdminOrderToastContainer } from './components/AdminOrderToastContainer';
import { RoleUpdateToast }         from './components/RoleUpdateToast';
import { logoutApi } from './services/authService';

function App() {
  /**
   * ── GLOBAL AUTH STATE ──────────────────────────────────────────────────────
   * Single source of truth for the current user session.
   * Reads from localStorage ('vendora_user') on mount; defaults to unauthenticated guest state.
   */
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    const savedUser = localStorage.getItem('vendora_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as CurrentUser;
        if (parsed && typeof parsed === 'object' && parsed.isLoggedIn) {
          const savedVendorSettings = localStorage.getItem('vendora_vendor_settings');
          if (savedVendorSettings && !parsed.logoUrl) {
            try {
              const vs = JSON.parse(savedVendorSettings);
              if (vs?.logoUrl) {
                parsed.logoUrl = vs.logoUrl;
                parsed.avatarUrl = vs.logoUrl;
              }
            } catch {}
          }
          return parsed;
        }
      } catch {
        /* ignore invalid JSON */
      }
    }
    return { isLoggedIn: false, role: 'Guest', name: '' };
  });

  /**
   * ── GLOBAL SITE SETTINGS STATE ─────────────────────────────────────────────
   */
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('vendora_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SiteSettings;
        if (parsed && typeof parsed === 'object' && parsed.siteName) {
          return parsed;
        }
      } catch {
        /* ignore invalid JSON */
      }
    }
    return { siteName: 'Vendora', supportEmail: 'support@vendora.store', commissionRate: 5 };
  });

  const updateSiteSettings = (newSettings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('vendora_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // ── Login Handler (called by Login.tsx after successful auth)
  const handleAppLogin = (user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem('vendora_user', JSON.stringify(user));
    localStorage.setItem('mockUser', JSON.stringify(user));
    localStorage.setItem('vendora_active_user', JSON.stringify(user));
  };

  // ── Sign Out Handler
  const handleSignOut = () => {
    logoutApi(); // clears tradehub_token + all legacy session keys
    setCurrentUser({
      isLoggedIn: false,
      name:       '',
      role:       'Guest',
    });
  };

  // Listen for user state updates (e.g. from Vendor Settings logo changes) to instantly sync global Header
  useEffect(() => {
    const handleUserUpdate = () => {
      const savedUser = localStorage.getItem('vendora_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as CurrentUser;
          if (parsed && typeof parsed === 'object' && parsed.isLoggedIn) {
            setCurrentUser(parsed);
          }
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('vendora_user_update', handleUserUpdate);
    return () => window.removeEventListener('vendora_user_update', handleUserUpdate);
  }, []);

  return (
    <ShopProvider>
      <Router>
        <NotificationProvider userRole={currentUser.role} isLoggedIn={currentUser.isLoggedIn}>
          <>
            <AdminOrderToastContainer />
            <RoleUpdateToast />
            <ScrollToTop />
            <Routes>
              {/* ── Public Routes (Navbar + Footer) ────────────────────────── */}
              <Route element={<PublicLayout currentUser={currentUser} siteSettings={siteSettings} onSignOut={handleSignOut} />}>
                <Route path="/"               element={<Home />} />
                <Route path="/product/:id"    element={<ProductDetail />} />
                <Route path="/login"          element={<Login handleLogin={handleAppLogin} onLogin={handleAppLogin} />} />
                <Route path="/auth"           element={<Login handleLogin={handleAppLogin} onLogin={handleAppLogin} />} />
                <Route path="/register"       element={<Register />} />
                <Route path="/verify-code"    element={<VerifyCode />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* ── Customer Routes ──────────────────────────────────────── */}
                <Route path="/cart"            element={<Cart />} />
                <Route path="/wishlist"        element={<WishlistPage />} />
                <Route path="/checkout"        element={<Checkout />} />
                <Route path="/my-orders"       element={<MyOrders />} />
                <Route path="/deals"           element={<DealsPage />} />
                <Route path="/vendors"         element={<VendorsPage />} />
                <Route path="/new-arrivals"    element={<NewArrivalsPage />} />
                <Route path="/vendor-register" element={<BecomeVendorPage />} />
                <Route path="/contact"         element={<ContactPage />} />
                <Route path="/about"           element={<AboutPage />} />
                <Route path="/careers"         element={<CareersPage />} />
                <Route path="/blog"            element={<BlogPage />} />
                <Route path="/press"           element={<BlogPage />} />
                <Route path="/help"            element={<HelpPage />} />
                <Route path="/privacy"         element={<LegalPage type="privacy" />} />
                <Route path="/terms"           element={<LegalPage type="terms" />} />
                <Route path="/category/:categoryName" element={<CategoryPage />} />
                <Route path="/search"          element={<SearchResultsPage />} />
              </Route>

              {/* ── Vendor Routes (protected: Vendor | Admin | Seller only) ─ */}
              <Route
                path="/vendor/dashboard"
                element={
                  <VendorRoute currentUser={currentUser}>
                    <VendorDashboard />
                  </VendorRoute>
                }
              />
              <Route element={<VendorLayout currentUser={currentUser} siteSettings={siteSettings} onSignOut={handleSignOut} />}>
                <Route
                  path="/vendor/products"
                  element={
                    <VendorRoute currentUser={currentUser}>
                      <VendorProducts />
                    </VendorRoute>
                  }
                />
              </Route>

              {/* ── Admin Routes (protected by AdminRoute guard) ─────────── */}
              <Route element={<AdminLayout currentUser={currentUser} siteSettings={siteSettings} onSignOut={handleSignOut} />}>
                <Route
                  path="/admin"
                  element={
                    <AdminRoute currentUser={currentUser}>
                      <AdminDashboard siteSettings={siteSettings} updateSiteSettings={updateSiteSettings} />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/:tab"
                  element={
                    <AdminRoute currentUser={currentUser}>
                      <AdminDashboard siteSettings={siteSettings} updateSiteSettings={updateSiteSettings} />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute currentUser={currentUser}>
                      <AdminDashboard siteSettings={siteSettings} updateSiteSettings={updateSiteSettings} />
                    </AdminRoute>
                  }
                />
              </Route>

              {/* ── 404 Catch-All ──────────────────────────────────────────── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </>
        </NotificationProvider>
      </Router>
    </ShopProvider>
  );
}

export default App;
