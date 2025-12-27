import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaSignInAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Asegúrate de tener react-router-dom instalado

const Login = () => {
  const [email, setEmail] = useState(''); // Cambié de username a email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate(); // Para redirigir después del login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validación de campos vacíos
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      setIsLoading(false);
      return;
    }

    try {
      // Intenta iniciar sesión con Supabase
      await login(email, password);
      // Si el login es exitoso, redirige
      navigate('/dashboard'); // Cambia por la ruta que quieras
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSignInAlt className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Sistema Facturación</h2>
          <p className="text-gray-600 mt-2">Inicia sesión para continuar</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-semibold mb-1 flex items-center gap-2">
              <FaUser className="text-gray-500" /> Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input 
                type="email" 
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(''); // Limpiar error al escribir
                }}
                placeholder="Ingresa tu email"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-semibold mb-1 flex items-center gap-2">
              <FaLock className="text-gray-500" /> Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input 
                type="password" 
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(''); // Limpiar error al escribir
                }}
                placeholder="Ingresa tu contraseña"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-md ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <FaSignInAlt /> Ingresar
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Regístrate o inicia sesión con un email y contraseña válidos</p>
        </div>
      </div>
    </div>
  );
};

export default Login;