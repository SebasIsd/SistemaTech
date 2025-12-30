// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import MainLayout from './components/MainLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminUsers from './pages/AdminUsers'        // o AdminUsersFull
import Dashboard from './pages/Dashboard'           // el dashboard chévere que te di
import Productos from './pages/Productos'           // Página de productos e inventario
import LotesProducto from './pages/LotesProducto'
import NuevaFactura from './pages/NuevaFactura'     // Página para crear nuevas facturas
import Clientes from './pages/Clientes'
import DetalleFactura from './pages/DetalleFactura' // Página de detalles de factura
import Facturas from './pages/Facturas'             // Página de lista de facturas

function App() {
  return (
    <AppContent />
  )
}

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // No autenticado → solo login y register
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Autenticado → layout + rutas protegidas
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/facturas/nueva" element={<NuevaFactura />} />  // Asume que la creasdo
        <Route path="/facturas/:id" element={<DetalleFactura />} />
        <Route path="/facturas" element={<Facturas />} />

        
        {user.rol === 'admin' && (
          <Route path="/admin/usuarios" element={<AdminUsers />} />
        )}
        {user.rol === 'admin' && (
          <Route path="/clientes" element={<Clientes />} />
        )}
        {user.rol === 'admin' && (
          <Route path="/productos" element={<Productos />} />
        )}
        {user.rol === 'admin' && (
          <Route path="/productos/:id/lotes" element={<LotesProducto />} />
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  )
}

export default App