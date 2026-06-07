import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import CustomerLayout from './components/customer/CustomerLayout';
import { useCart } from './hooks/useCart';
//Public 
import LandingPage from '@/pages/LandingPage';

// Admin Pages
import LoginPage from '@/pages/admin/LoginPage';
import DashboardPage from '@/pages/admin/DashboardPage';
import OrderDetailPage from '@/pages/admin/OrderDetailPage';
import CategoryPage from '@/pages/admin/CategoryPage';
import ServicePage from '@/pages/admin/ServicePage';
import RegionPage from '@/pages/admin/RegionPage';
import UserPage from '@/pages/admin/UserPage';

// Customer Pages
import CustomerLoginPage from '@/pages/customer/LoginPage';
import CustomerRegisterPage from '@/pages/customer/RegisterPage';
import CustomerHomePage from '@/pages/customer/HomePage';
import CustomerOrderPage from '@/pages/customer/OrderPage';
import CustomerActiveOrderPage from '@/pages/customer/ActiveOrderPage';
import CustomerOrderDetailPage from '@/pages/customer/OrderDetailCustomerPage';
import CustomerHistoryPage from '@/pages/customer/HistoryPage';
import CustomerProfilePage from '@/pages/customer/ProfilePage';

// -------------------------------------------------------
// Admin Protected Route — pakai Outlet (pattern benar)
// -------------------------------------------------------
const AdminProtectedRoute = () => {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
};

// -------------------------------------------------------
// Customer Protected Route — pakai Outlet (pattern benar)
// -------------------------------------------------------
const CustomerProtectedRoute = () => {
  const token = localStorage.getItem('customer_token');
  if (!token) return <Navigate to="/customer/login" replace />;
  return <Outlet />;
};

// -------------------------------------------------------
// Customer Routes Wrapper
// useCart diinisialisasi SATU KALI di sini
// diteruskan via props ke Layout dan semua halaman
// -------------------------------------------------------
const CustomerRoutes = () => {
  const cart = useCart();

  return (
    <CustomerLayout cart={cart}>
      <Routes>
        <Route path="home" element={<CustomerHomePage cart={cart} />} />
        <Route path="order" element={<CustomerOrderPage cart={cart} />} />
        <Route path="orders/active" element={<CustomerActiveOrderPage cart={cart} />} />
        <Route path="orders/:code" element={<CustomerOrderDetailPage cart={cart} />} />
        <Route path="history" element={<CustomerHistoryPage cart={cart} />} />
        <Route path="profile" element={<CustomerProfilePage cart={cart} />} />
      </Routes>
    </CustomerLayout>
  );
};

// -------------------------------------------------------
// App
// -------------------------------------------------------
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route path="/" element={<LandingPage />} />

        {/* ── Admin Public ── */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* ── Admin Protected ── */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/orders/:code" element={<OrderDetailPage />} />
            <Route path="/admin/categories" element={<CategoryPage />} />
            <Route path="/admin/services" element={<ServicePage />} />
            <Route path="/admin/regions" element={<RegionPage />} />
            <Route path="/admin/users" element={<UserPage />} />
          </Route>
        </Route>

        {/* ── Customer Public ── */}
        <Route path="/customer/login" element={<CustomerLoginPage />} />
        <Route path="/customer/register" element={<CustomerRegisterPage />} />

        {/* ── Customer Protected ── */}
        <Route element={<CustomerProtectedRoute />}>
          <Route path="/customer/*" element={<CustomerRoutes />} />
        </Route>

        {/* Fallback — URL tidak dikenal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;