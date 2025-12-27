import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 1. La barra lateral queda fija a la izquierda */}
      <Sidebar />

      {/* 2. El área de contenido crece para ocupar el resto del espacio */}
      <div className="flex-1 flex flex-col">
        {/* Aquí podrías poner un Header superior si quisieras */}
        <header className="bg-white shadow-sm p-4 text-right font-medium">
          Sistema de Facturación v1.0
        </header>

        {/* 3. El contenido dinámico se inyecta aquí */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
// esto permite envolver otras páginas con el layout
export default MainLayout;