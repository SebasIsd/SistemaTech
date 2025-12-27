import { useAuth } from '../context/AuthContext';
import { FaShoppingCart, FaChartBar, FaBox, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-8 border-b border-gray-700 pb-2">
        Mi Tienda
      </h2>
      
      <nav className="flex-1">
        {/* Botón disponible para TODOS */}
        <button className="w-full text-left p-2 hover:bg-gray-700 rounded mb-2 flex items-center gap-2">
          <FaShoppingCart /> Ventas
        </button>

        {/* Botón disponible solo para ADMIN */}
        {user?.rol === 'admin' && (
          <button className="w-full text-left p-2 hover:bg-gray-700 rounded mb-2 text-yellow-400 flex items-center gap-2">
            <FaChartBar /> Reportes Gerenciales
          </button>
        )}

        <button className="w-full text-left p-2 hover:bg-gray-700 rounded mb-2 flex items-center gap-2">
          <FaBox /> Inventario
        </button>
      </nav>

      <button 
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 p-2 rounded mt-auto flex items-center justify-center gap-2"
      >
        <FaSignOutAlt /> Cerrar Sesión
      </button>
    </div>
  );
};

export default Sidebar;