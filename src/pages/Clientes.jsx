import { useState, useEffect } from 'react';
import { FaEdit, FaUserSlash, FaSearch, FaUserPlus, FaPhone, FaMapMarkerAlt, FaIdCard, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '', 
    email: '', 
    telefono: '', 
    direccion: '', 
    identificacion: '', 
    tipo_documento: 'cedula'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Estados para modales
  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info', // info, success, warning, error
    onConfirm: null
  });

  // --- LÓGICA DE VALIDACIÓN ECUADOR ---
  const validarDocumento = (id, tipo) => {
    if (tipo === 'pasaporte') return id.length >= 5;
    if (id.length < 10) return false;

    const digitos = id.split('').map(Number);
    const provincia = digitos[0] * 10 + digitos[1];
    if (provincia < 1 || provincia > 24) return false;

    if (tipo === 'cedula' || (tipo === 'ruc' && digitos[2] < 6)) {
      const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
      let total = 0;
      for (let i = 0; i < 9; i++) {
        let val = digitos[i] * coeficientes[i];
        total += val > 9 ? val - 9 : val;
      }
      const verificador = (Math.ceil(total / 10) * 10) - total;
      return verificador === digitos[9];
    }
    return true;
  };

  const fetchClientes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/clientes');
      if (!res.ok) throw new Error('Error al cargar clientes');
      const data = await res.json();
      setClientes(data.filter(c => c.estado !== 0));
    } catch (error) {
      openModal('Error', error.message, 'error');
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const openModal = (title, message, type, onConfirm = null) => {
    setModal({
      open: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      title: '',
      message: '',
      type: 'info',
      onConfirm: null
    });
  };

  const confirmModal = async () => {
    if (modal.onConfirm) {
      await modal.onConfirm();
    }
    closeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación de campos
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!formData.identificacion.trim()) newErrors.identificacion = 'Identificación es requerida';
    if (!validarDocumento(formData.identificacion, formData.tipo_documento)) {
      newErrors.identificacion = 'Identificación no válida';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      let res;
      if (editingId) {
        // Actualizar cliente
        res = await fetch(`http://localhost:5000/api/clientes/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            email: formData.email,
            telefono: formData.telefono,
            direccion: formData.direccion,
            identificacion: formData.identificacion
          })
        });
        
        if (!res.ok) throw new Error('Error al actualizar cliente');
        openModal('Éxito', 'Cliente actualizado correctamente', 'success');
      } else {
        // Crear nuevo cliente
        res = await fetch('http://localhost:5000/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            email: formData.email,
            telefono: formData.telefono,
            direccion: formData.direccion,
            identificacion: formData.identificacion
          })
        });
        
        if (!res.ok) throw new Error('Error al crear cliente');
        openModal('Éxito', 'Cliente creado correctamente', 'success');
      }
      
      // Limpiar formulario y recargar datos
      setFormData({ nombre: '', email: '', telefono: '', direccion: '', identificacion: '', tipo_documento: 'cedula' });
      setEditingId(null);
      setErrors({});
      fetchClientes();
    } catch (error) {
      openModal('Error', error.message, 'error');
    }
  };

  const handleInactivar = async (id) => {
    const confirmInactivar = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/clientes/${id}`, {
          method: 'DELETE'
        });
        
        if (!res.ok) throw new Error('Error al inactivar cliente');
        openModal('Éxito', 'Cliente inactivado correctamente', 'success');
        fetchClientes();
      } catch (error) {
        openModal('Error', error.message, 'error');
      }
    };
    
    openModal(
      'Confirmar Inactivación', 
      '¿Desea inactivar este cliente? No aparecerá en facturación.', 
      'warning',
      confirmInactivar
    );
  };

  const handleEdit = (cliente) => {
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      identificacion: cliente.identificacion,
      tipo_documento: cliente.tipo_documento || 'cedula'
    });
    setEditingId(cliente.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormData({ nombre: '', email: '', telefono: '', direccion: '', identificacion: '', tipo_documento: 'cedula' });
    setEditingId(null);
    setErrors({});
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.identificacion.includes(searchTerm)
  );

  // Componente de Modal
  const Modal = () => {
    if (!modal.open) return null;

    const getIcon = () => {
      switch (modal.type) {
        case 'success': return <FaCheck className="text-green-500 text-3xl" />;
        case 'error': return <FaTimes className="text-red-500 text-3xl" />;
        case 'warning': return <FaExclamationTriangle className="text-yellow-500 text-3xl" />;
        default: return <FaExclamationTriangle className="text-blue-500 text-3xl" />;
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              {getIcon()}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{modal.title}</h3>
            <p className="text-gray-600 mb-6">{modal.message}</p>
            <div className="flex gap-3 w-full">
              {modal.onConfirm && (
                <button
                  onClick={confirmModal}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                >
                  Sí, continuar
                </button>
              )}
              <button
                onClick={closeModal}
                className={`flex-1 py-2.5 rounded-lg font-bold transition-colors ${
                  modal.onConfirm 
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {modal.onConfirm ? 'Cancelar' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen font-sans text-gray-700">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER & BUSCADOR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl text-white">
              <FaIdCard className="text-xl"/>
            </div>
            GESTIÓN DE CLIENTES
          </h1>
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o identificación..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORMULARIO */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FaUserPlus />
                </div> 
                {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              {editingId && (
                <button 
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">Tipo Documento</label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.tipo_documento}
                  onChange={(e) => setFormData({...formData, tipo_documento: e.target.value})}
                >
                  <option value="cedula">Cédula</option>
                  <option value="ruc">RUC</option>
                  <option value="pasaporte">Pasaporte</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">Identificación</label>
                <input 
                  type="text" 
                  placeholder="Identificación" 
                  required
                  className={`w-full p-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.identificacion ? 'border-red-500' : 'border-gray-200'
                  }`}
                  value={formData.identificacion}
                  onChange={(e) => setFormData({...formData, identificacion: e.target.value})}
                />
                {errors.identificacion && <p className="text-red-500 text-xs mt-1">{errors.identificacion}</p>}
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">Nombre Completo</label>
                <input 
                  type="text" 
                  placeholder="Nombre Completo" 
                  required
                  className={`w-full p-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nombre ? 'border-red-500' : 'border-gray-200'
                  }`}
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">Teléfono</label>
                  <input 
                    type="text" 
                    placeholder="Teléfono" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">Email</label>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">Dirección</label>
                <textarea 
                  placeholder="Dirección"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  <FaCheck /> {editingId ? 'Actualizar' : 'Registrar'}
                </button>
                
                {editingId && (
                  <button 
                    type="button"
                    onClick={handleCancelEdit}
                    className="py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* TABLA DE CLIENTES */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4">Cliente / ID</th>
                    <th className="px-6 py-4">Contacto</th>
                    <th className="px-6 py-4">Dirección</th>
                    <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClientes.length > 0 ? (
                    filteredClientes.map(c => (
                      <tr key={c.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800">{c.nombre}</p>
                          <p className="text-xs text-blue-600 font-medium">{c.identificacion}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <FaPhone size={12}/> {c.telefono || '--'}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate max-w-[120px]">{c.email || '--'}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-[150px] truncate">
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt className="text-red-400" size={10}/> 
                            {c.direccion || 'No registrada'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-3">
                            <button 
                              onClick={() => handleEdit(c)} 
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Editar cliente"
                            >
                              <FaEdit size={16}/>
                            </button>
                            <button 
                              onClick={() => handleInactivar(c.id)} 
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Inactivar cliente"
                            >
                              <FaUserSlash size={16}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                        <div className="flex flex-col items-center justify-center">
                          <FaUserSlash className="text-4xl text-gray-300 mb-3" />
                          <p className="text-lg font-medium">No se encontraron clientes</p>
                          <p className="text-sm">Registra un nuevo cliente para comenzar</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal */}
      <Modal />
    </div>
  );
};

export default Clientes;