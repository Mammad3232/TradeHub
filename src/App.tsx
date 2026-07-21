import React, { useState } from 'react';
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
import { ContactPage }      from './pages/ContactPage';
import { AdminRoute }       from './components/AdminRoute';

// ── Shared user type (single source of truth for the whole app) ───────────────
export interface CurrentUser {
  isLoggedIn: boolean;
  name:       string;
  role:       'Admin' | 'Vendor' | 'Customer' | 'Guest';
  email?:     string;
}

interface LayoutProps {
  currentUser: CurrentUser;
}

// ── Layout Wrappers ───────────────────────────────────────────────────────────

/** Public routes — Header + Footer */
const PublicLayout: React.FC<LayoutProps> = ({ currentUser }) => (
  <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
    <Header currentUser={currentUser} />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

/** Vendor routes — Header + Sidebar, no public footer */
const VendorLayout: React.FC<LayoutProps> = ({ currentUser }) => (
  <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
    <Header currentUser={currentUser} />
    <div className="flex flex-1">
      <Sidebar role="vendor" storeName="My Store" />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  </div>
);

/** Admin routes — Header + Sidebar */
const AdminLayout: React.FC<LayoutProps> = ({ currentUser }) => (
  <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
    <Header currentUser={currentUser} />
    <div className="flex flex-1">
      <Sidebar role="admin" />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  </div>
);

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  /**
   * ── GLOBAL AUTH STATE ──────────────────────────────────────────────────────
   * Single source of truth for the current user session.
   *
   * TOGGLE THESE TO TEST DIFFERENT STATES:
   *   Guest:    { isLoggedIn: false, name: '',           role: 'Guest'    }
   *   Customer: { isLoggedIn: true,  name: 'Jane Smith', role: 'Customer' }
   *   Admin:    { isLoggedIn: true,  name: 'Admin User', role: 'Admin'    }
   */
  const [currentUser] = useState<CurrentUser>({
    isLoggedIn: true,
    name:       'Admin User',
    role:       'Admin',
    email:      'admin@vendora.store',
  });

  return (
    <Router>
      <Routes>
        {/* ── Public Routes (Navbar + Footer) ────────────────────────── */}
        <Route element={<PublicLayout currentUser={currentUser} />}>
          <Route path="/"               element={<Home />} />
          <Route path="/product/:id"    element={<ProductDetail />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/verify-code"    element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ── Customer Routes ──────────────────────────────────────── */}
          <Route path="/cart"           element={<Cart />} />
          <Route path="/checkout"       element={<Checkout />} />
          <Route path="/my-orders"      element={<MyOrders />} />
          <Route path="/deals"          element={<DealsPage />} />
          <Route path="/vendors"        element={<VendorsPage />} />
          <Route path="/new-arrivals"   element={<NewArrivalsPage />} />
          <Route path="/vendor-register" element={<BecomeVendorPage />} />
          <Route path="/contact"        element={<ContactPage />} />
        </Route>

        {/* ── Vendor Routes ────────────────────────────────────────── */}
        <Route path="/vendor/dashboard"  element={<VendorDashboard />} />
        <Route element={<VendorLayout currentUser={currentUser} />}>
          <Route path="/vendor/products"   element={<VendorProducts />} />
        </Route>

        {/* ── Admin Routes (protected by AdminRoute guard) ─────────── */}
        <Route element={<AdminLayout currentUser={currentUser} />}>
          <Route
            path="/admin"
            element={
              <AdminRoute currentUser={currentUser}>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/:tab"
            element={
              <AdminRoute currentUser={currentUser}>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Route>

        {/* ── 404 Catch-All ──────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
