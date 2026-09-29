import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProductsPage from './pages/ProductsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import GarmentsPage from './pages/admin/GarmentsPage'
import DesignsPage from './pages/admin/DesignsPage'
import FabricsPage from './pages/admin/FabricsPage'
import OrdersPage from './pages/admin/OrdersPage'
import ProductDetailPage from './pages/ProductDetailPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:productId" element={<ProductDetailPage />} />
      <Route path="/user" element={<Navigate to="/" replace />} />
      <Route path="/cart" element={<CartPage />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/garments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <GarmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/designs"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DesignsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fabrics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FabricsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
