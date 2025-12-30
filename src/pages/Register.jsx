// src/pages/Register.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaEnvelope, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Validaciones básicas
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Todos los campos son obligatorios');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      await register(formData.name.trim(), formData.email.trim(), formData.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2800);
    } catch (err) {
      setError(err.message || 'Error al registrar. Intenta con otro email.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-3">¡Registro Exitoso!</h2>
          <p className="text-gray-600 mb-6">
            Tu cuenta ha sido creada correctamente.<br />
            Un administrador debe activarla antes de poder ingresar.
          </p>
          <p className="text-sm text-gray-500">Redirigiendo al login en unos segundos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
            <FaUser className="text-blue-600 text-4xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Crear Nueva Cuenta</h2>
          <p className="text-gray-600 mt-2">Regístrate para comenzar a facturar</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
            <FaExclamationTriangle className="text-xl" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Nombre completo</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Correo electrónico</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@empresa.com"
              />
            </div>
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Contraseña</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Confirmar</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Creando cuenta...</span>
              </>
            ) : (
              <>Registrarse</>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 text-sm">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline font-medium"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;