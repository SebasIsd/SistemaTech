import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaBoxOpen, FaSearch, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', precio: '', categoria: '', requiere_lote: true
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Estados para modales
  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/productos');
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
      openModal('Error', 'Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

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
    if (!formData.nombre || !formData.precio) {
      openModal('Error', 'Nombre y precio son obligatorios', 'error');
      return;
    }

    try {
      const url = editingId 
        ? `http://localhost:5000/api/productos/${editingId}`
        : 'http://localhost:5000/api/productos';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, precio: parseFloat(formData.precio) })
      });

      if (!response.ok) throw new Error('Error al guardar el producto');

      fetchProductos();
      setFormData({ nombre: '', descripcion: '', precio: '', categoria: '', requiere_lote: true });
      setEditingId(null);
      openModal('Éxito', editingId ? 'Producto actualizado correctamente' : 'Producto creado correctamente', 'success');
    } catch (error) {
      console.error(error);
      openModal('Error', 'Error al guardar el producto', 'error');
    }
  };

  const startEdit = (prod) => {
    setFormData({
      nombre: prod.nombre,
      descripcion: prod.descripcion || '',
      precio: prod.precio,
      categoria: prod.categoria || '',
      requiere_lote: !!prod.requiere_lote
    });
    setEditingId(prod.id);
  };

  const handleDelete = async (id) => {
    const confirmDelete = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/productos/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar producto');
        fetchProductos();
        openModal('Éxito', 'Producto eliminado correctamente', 'success');
      } catch (error) {
        console.error(error);
        openModal('Error', 'Error al eliminar producto', 'error');
      }
    };

    openModal(
      'Confirmar Eliminación',
      '¿Realmente deseas eliminar este producto?',
      'warning',
      confirmDelete
    );
  };

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.categoria && p.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
    <div className="p-6 space-y-8 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {editingId ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Precio *</label>
              <input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={e => setFormData({...formData, precio: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Categoría</label>
              <input
                type="text"
                value={formData.categoria}
                onChange={e => setFormData({...formData, categoria: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={e => setFormData({...formData, descripcion: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.requiere_lote}
                onChange={e => setFormData({...formData, requiere_lote: e.target.checked})}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Requiere control de lotes (FIFO)</label>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setFormData({nombre:'', descripcion:'', precio:'', categoria:'', requiere_lote:true}); }}
                  className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-100"
              >
                {editingId ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de productos */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 className="text-xl font-semibold">Lista de Productos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Total</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Lotes</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProductos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                      <div className="flex flex-col items-center justify-center">
                        <FaBoxOpen className="text-4xl text-gray-300 mb-3" />
                        <p className="text-lg font-medium">No hay productos {searchTerm ? 'que coincidan con la búsqueda' : 'aún'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProductos.map(prod => (
                    <tr key={prod.id} className="hover:bg-blue-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{prod.nombre}</div>
                        <div className="text-sm text-gray-500">{prod.descripcion?.substring(0, 60) || ''}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{prod.categoria || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                        ${prod.precio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <span className={`font-bold ${
                          prod.stock_total === 0 ? 'text-red-600' :
                          prod.stock_total < 5 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {prod.stock_total}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {prod.requiere_lote ? (
                          <NavLink
                            to={`/productos/${prod.id}/lotes`}
                            className="text-indigo-600 hover:text-indigo-900 font-bold"
                          >
                            Ver lotes ({prod.stock_total})
                          </NavLink>
                        ) : (
                          <span className="text-gray-400">No aplica</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => startEdit(prod)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 mr-2"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Modal */}
      <Modal />
    </div>
  );
};

export default Productos;