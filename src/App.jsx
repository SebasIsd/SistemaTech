import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';

const Root = () => {
  const { user } = useAuth();

  // Caso A: No hay usuario -> Pantalla de Login limpia
  if (!user) {
    return <Login />;
  }

  // Caso B: Hay usuario -> Estructura completa del sistema
  return (
    <MainLayout>
      {/* Aquí es donde luego usaremos React Router para cambiar entre páginas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold">Bienvenido, {user.nombre}</h1>
        <p className="mt-2 text-gray-600">
          Has ingresado como <span className="font-bold text-blue-600">{user.rol}</span>.
        </p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
            <h3 className="font-bold">Acceso Rápido</h3>
            <p className="text-sm">Hoy has realizado 0 ventas.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

export default App;