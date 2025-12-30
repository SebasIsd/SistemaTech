// src/components/Sidebar.jsx
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom'; // ← importante: usaremos NavLink
import { 
  FaShoppingCart, 
  FaChartBar, 
  FaBox, 
  FaUsersCog, 
  FaUserPlus, 
  FaSignOutAlt,
  FaFileInvoice
} from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout } = useAuth();

  // Clases para el link activo
  const navLinkClass = ({ isActive }) => 
    `w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${
      isActive 
        ? 'bg-blue-700 text-white' 
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <div className="w-72 h-screen bg-gray-900 text-gray-100 flex flex-col shadow-2xl">
      {/* Logo / Título */}
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-blue-400">Facturación Pro</h2>
        <p className="text-sm text-gray-500 mt-1">v1.0</p>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 px-3 py-6 space-y-1">

        <NavLink to="/facturas/nueva" className={navLinkClass}>
          <FaFileInvoice className="text-xl" />
          <span>Facturas</span>
        </NavLink>

        <NavLink to="/facturas" className={navLinkClass}>
          <FaBox className="text-xl" />
          <span>Detalles Facturas</span>
        </NavLink>

        {/* Sección solo para administradores */}
        {user?.rol === 'admin' && (
          <>
            <div className="pt-4 mt-4 border-t border-gray-700">
              <p className="px-3 text-xs uppercase text-gray-500 mb-2">Administración</p>
            </div>

            <NavLink to="/admin/usuarios" className={navLinkClass}>
              <FaUsersCog className="text-xl" />
              <span>Gestión de Usuarios</span>
            </NavLink>

            <NavLink to="/reportes" className={navLinkClass}>
              <FaChartBar className="text-xl" />
              <span>Reportes Gerenciales</span>
            </NavLink>

            {/* Puedes agregar más opciones de admin aquí */}
            <NavLink to="/productos" className={navLinkClass}>
              <FaBox className="text-xl" />
              <span>Productos e Inventario</span>
            </NavLink>

            <NavLink to="/clientes" className={navLinkClass}>
              <FaUserPlus className="text-xl" />
              <span>Gestión de Clientes</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Zona inferior - usuario y logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="mb-4 px-3">
          <p className="text-sm text-gray-400">Conectado como:</p>
          <p className="font-medium truncate">
            {user?.name || user?.email}
          </p>
          <p className="text-xs text-blue-400 mt-1">({user?.rol})</p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 bg-red-600/80 hover:bg-red-700 text-white p-3 rounded-lg transition"
        >
          <FaSignOutAlt />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;