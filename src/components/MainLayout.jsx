// src/components/MainLayout.jsx
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Sidebar fijo a la izquierda - ocupa toda la altura */}
      <div className="flex-shrink-0">
        <Sidebar />
      </div>

      {/* Contenido principal - ocupa el resto del espacio y puede hacer scroll */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {/* Opcional: header superior si lo quieres */}
        <header className="bg-white shadow-sm px-6 py-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Sistema de Facturación</h1>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Área de contenido real */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;