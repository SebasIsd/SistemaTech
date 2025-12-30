import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowLeft, FaBox, FaTag, FaCalendarAlt, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const LotesProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lotes, setLotes] = useState([]);
  const [producto, setProducto] = useState(null);
  const [formData, setFormData] = useState({
    cantidad: '', fecha_entrada: '', precio_costo: '', fecha_vencimiento: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para modales
  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  // Función segura para formatear moneda
  const formatMoney = (amount) => {
    const numericAmount = parseFloat(amount);
    return isNaN(numericAmount) ? "0.00" : numericAmount.toFixed(2);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, lotesRes] = await Promise.all([
          fetch(`http://localhost:5000/api/productos/${id}`),
          fetch(`http://localhost:5000/api/productos/${id}/lotes`)
        ]);
        setProducto(await prodRes.json());
        setLotes(await lotesRes.json());
      } catch (error) {
        console.error("Error:", error);
        openModal('Error', 'Error al cargar datos', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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

  const handleDelete = async (loteId) => {
    const confirmDelete = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/lotes/${loteId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar lote');
        
        // Refrescar lista
        const res = await fetch(`http://localhost:5000/api/productos/${id}/lotes`);
        setLotes(await res.json());
        openModal('Éxito', 'Lote eliminado correctamente', 'success');
      } catch (error) {
        console.error("Error:", error);
        openModal('Error', 'Error al eliminar lote', 'error');
      }
    };

    openModal(
      'Confirmar Eliminación',
      '¿Realmente deseas eliminar este lote?',
      'warning',
      confirmDelete
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `http://localhost:5000/api/lotes/${editingId}` : `http://localhost:5000/api/productos/${id}/lotes`;
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cantidad: parseInt(formData.cantidad),
          precio_costo: parseFloat(formData.precio_costo || 0)
        })
      });

      if (!response.ok) throw new Error('Error al guardar lote');
      
      // Refrescar lista
      const res = await fetch(`http://localhost:5000/api/productos/${id}/lotes`);
      setLotes(await res.json());
      setFormData({ cantidad: '', fecha_entrada: '', precio_costo: '', fecha_vencimiento: '' });
      setEditingId(null);
      openModal('Éxito', editingId ? 'Lote actualizado correctamente' : 'Lote guardado correctamente', 'success');
    } catch (error) {
      console.error("Error:", error);
      openModal('Error', 'Error al guardar lote', 'error');
    }
  };

  if (loading) return (
    <div className="p-10 text-center bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
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
    <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Encabezado */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-500 hover:text-black font-bold gap-2"
          >
            <FaArrowLeft /> Volver
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-800">Lotes: {producto?.nombre}</h1>
            <p className="text-green-600 font-bold">Stock Actual: {producto?.stock_total}</p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="font-bold mb-4 flex items-center gap-2 text-lg text-gray-800">
            <FaBox className="text-blue-500"/> {editingId ? 'Editar Lote' : 'Añadir Nuevo Stock'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Cantidad</label>
              <input
                type="number" 
                placeholder="Cantidad" 
                required
                value={formData.cantidad}
                onChange={e => setFormData({...formData, cantidad: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Fecha Ingreso</label>
              <input
                type="date" 
                required
                value={formData.fecha_entrada}
                onChange={e => setFormData({...formData, fecha_entrada: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Precio Costo</label>
              <input
                type="number" 
                step="0.01" 
                placeholder="Precio Costo"
                value={formData.precio_costo}
                onChange={e => setFormData({...formData, precio_costo: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 py-3 transition shadow-lg shadow-blue-100"
              >
                {editingId ? 'Actualizar' : 'Guardar Lote'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 className="font-semibold">Historial de Lotes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="p-4">Fecha Ingreso</th>
                  <th className="p-4 text-right">Disponible</th>
                  <th className="p-4 text-right">Costo Unit.</th>
                  <th className="p-4 text-center">Vencimiento</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lotes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                      <div className="flex flex-col items-center justify-center">
                        <FaBox className="text-4xl text-gray-300 mb-3" />
                        <p className="text-lg font-medium">No hay lotes registrados</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  lotes.map(lote => (
                    <tr key={lote.id} className="border-t hover:bg-blue-50/50 transition">
                      <td className="p-4">{lote.fecha_entrada}</td>
                      <td className="p-4 text-right font-bold">{lote.cantidad_disponible}</td>
                      <td className="p-4 text-right text-blue-600 font-bold">${formatMoney(lote.precio_costo)}</td>
                      <td className="p-4 text-center">
                        {lote.fecha_vencimiento ? (
                           <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-bold">{lote.fecha_vencimiento}</span>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => setEditingId(lote.id) || setFormData(lote)} 
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <FaEdit/>
                        </button>
                        <button 
                          onClick={() => handleDelete(lote.id)} 
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <FaTrash/>
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

export default LotesProducto;