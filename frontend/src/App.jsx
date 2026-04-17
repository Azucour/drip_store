// src/App.jsx - Root app with routing
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages – User
import HomePage         from './pages/HomePage';
import CategoryPage     from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage         from './pages/CartPage';
import CheckoutPage     from './pages/CheckoutPage';
import LoginPage        from './pages/LoginPage';
import SignupPage       from './pages/SignupPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderFailurePage from './pages/OrderFailurePage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import MyOrdersPage     from './pages/MyOrdersPage';
import SearchPage       from './pages/SearchPage';
import NotFoundPage     from './pages/NotFoundPage';

// Pages – Admin
import AdminLayout      from './pages/admin/AdminLayout';
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminProducts    from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders      from './pages/admin/AdminOrders';
import AdminInventory   from './pages/admin/AdminInventory';

// Route guards
import ProtectedRoute   from './routes/ProtectedRoute';
import AdminRoute       from './routes/AdminRoute';

// Scroll to top on every navigation
import ScrollToTop      from './components/common/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
              success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
            }}
          />

          <Routes>
            {/* ── Admin Panel (no main Navbar/Footer) ── */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/edit/:id" element={<AdminProductForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="inventory" element={<AdminInventory />} />
            </Route>

            {/* ── User-facing pages (with Navbar/Footer) ── */}
            <Route
              path="/*"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1 page-enter">
                    <Routes>
                      <Route path="/"                 element={<HomePage />} />
                      <Route path="/category/:cat"    element={<CategoryPage />} />
                      <Route path="/product/:id"      element={<ProductDetailPage />} />
                      <Route path="/search"           element={<SearchPage />} />
                      <Route path="/login"            element={<LoginPage />} />
                      <Route path="/signup"           element={<SignupPage />} />

                      {/* Protected routes */}
                      <Route path="/cart"             element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                      <Route path="/checkout"         element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                      <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
                      <Route path="/order-failure"    element={<ProtectedRoute><OrderFailurePage /></ProtectedRoute>} />
                      <Route path="/orders"           element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
                      <Route path="/orders/:id"       element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />

                      <Route path="*"                 element={<NotFoundPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
