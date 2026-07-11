import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';

import HomePage from './pages/public/HomePage';
import MenuPage from './pages/public/MenuPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import DashboardPage from './pages/customer/DashboardPage';
import OrdersPage from './pages/customer/OrdersPage';
import ProfilePage from './pages/customer/ProfilePage';
import AddressesPage from './pages/customer/AddressesPage';
import FavoritesPage from './pages/customer/FavoritesPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import PaymentPage from './pages/customer/PaymentPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminOrdersPage from './pages/admin/OrdersPage';
import AdminKitchenPage from './pages/admin/KitchenPage';
import AdminMenuPage from './pages/admin/MenuManagementPage';
import AdminOffersPage from './pages/admin/OffersPage';
import AdminQRPage from './pages/admin/QRPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <BrowserRouter>
                <Toaster position="top-right" richColors closeButton />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
                  <Route path="/menu" element={<PublicLayout><MenuPage /></PublicLayout>} />
                  <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
                  <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
                  <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />

                  {/* Customer authenticated routes */}
                  <Route path="/dashboard" element={<ProtectedRoute><PublicLayout><DashboardPage /></PublicLayout></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><PublicLayout><OrdersPage /></PublicLayout></ProtectedRoute>} />
                  <Route path="/orders/:orderId" element={<ProtectedRoute><PublicLayout><PaymentPage /></PublicLayout></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><PublicLayout><ProfilePage /></PublicLayout></ProtectedRoute>} />
                  <Route path="/addresses" element={<ProtectedRoute><PublicLayout><AddressesPage /></PublicLayout></ProtectedRoute>} />
                  <Route path="/favorites" element={<ProtectedRoute><PublicLayout><FavoritesPage /></PublicLayout></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><PublicLayout><CheckoutPage /></PublicLayout></ProtectedRoute>} />
                  <Route path="/payment" element={<ProtectedRoute><PublicLayout><PaymentPage /></PublicLayout></ProtectedRoute>} />
                  <Route path="/payment/:orderId" element={<ProtectedRoute><PublicLayout><PaymentPage /></PublicLayout></ProtectedRoute>} />

                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboardPage /></AdminLayout></AdminRoute>} />
                  <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrdersPage /></AdminLayout></AdminRoute>} />
                  <Route path="/admin/kitchen" element={<AdminRoute><AdminLayout><AdminKitchenPage /></AdminLayout></AdminRoute>} />
                  <Route path="/admin/menu" element={<AdminRoute><AdminLayout><AdminMenuPage /></AdminLayout></AdminRoute>} />
                  <Route path="/admin/offers" element={<AdminRoute><AdminLayout><AdminOffersPage /></AdminLayout></AdminRoute>} />
                  <Route path="/admin/qr" element={<AdminRoute><AdminLayout><AdminQRPage /></AdminLayout></AdminRoute>} />

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#fefce8] dark:bg-stone-950">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
