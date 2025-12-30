import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaFileInvoiceDollar, FaSearch, FaUserCircle, FaHashtag, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const NuevaFactura = () => {
  const navigate = useNavigate();
  
  // Estados para Clientes
  const [clientes, setClientes] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);

  // Estados para Productos y Factura
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [detalles, setDetalles] = useState([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);

  // Estados para modales
  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  useEffect(() => {
    // Cargar Clientes y Productos al iniciar
    Promise.all([
      fetch('http://localhost:5000/api/clientes').then(res => res.json()),
      fetch('http://localhost:5000/api/productos').then(res => res.json())
    ]).then(([dataClientes, dataProductos]) => {
      setClientes(dataClientes);
      setProductosDisponibles(dataProductos);
    }).catch(err => console.error("Error cargando datos:", err));
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

  // Filtrar clientes por nombre o identificación (Insensible a mayúsculas/minúsculas)
  const clientesFiltrados = clientes.filter(c => {
    const terminoBusqueda = busquedaCliente.toLowerCase();
    const nombreCliente = c.nombre ? c.nombre.toLowerCase() : "";
    const identificacionCliente = c.identificacion ? c.identificacion : "";

    return nombreCliente.includes(terminoBusqueda) || identificacionCliente.includes(terminoBusqueda);
  });

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente(`${cliente.nombre} (${cliente.identificacion})`);
    setMostrarListaClientes(false);
  };

  const handleAddDetalle = () => {
    setDetalles([...detalles, { producto_id: '', cantidad: 1, precio_unitario: 0 }]);
  };

  const handleRemoveDetalle = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const handleChangeDetalle = (index, field, value) => {
    const newDetalles = [...detalles];
    if (field === 'producto_id') {
      const prod = productosDisponibles.find(p => p.id === parseInt(value));
      newDetalles[index].precio_unitario = prod?.precio || 0;
    }
    newDetalles[index][field] = value;
    setDetalles(newDetalles);
  };

  const totalFactura = detalles.reduce((acc, det) => acc + (det.cantidad * (parseFloat(det.precio_unitario) || 0)), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clienteSeleccionado) {
      openModal('Error', 'Por favor seleccione un cliente', 'error');
      return;
    }
    
    const detallesValidos = detalles.every(det => det.producto_id && det.cantidad > 0);
    if (!detallesValidos) {
      openModal('Error', 'Complete todos los campos de productos', 'error');
      return;
    }
    
    const confirmSubmit = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/facturas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cliente_id: clienteSeleccionado.id, 
            usuario_id: 1, 
            detalles 
          }),
        });
        
        if (res.ok) {
          openModal('Éxito', 'Factura creada correctamente', 'success', () => navigate('/facturas'));
        } else {
          throw new Error('Error al crear factura');
        }
      } catch (error) {
        openModal('Error', 'Error al procesar la venta', 'error');
      }
    };
    
    openModal(
      'Confirmar Factura',
      `¿Desea crear la factura para ${clienteSeleccionado.nombre} por un total de $${totalFactura.toFixed(2)}?`,
      'warning',
      confirmSubmit
    );
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8 font-sans text-slate-700">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          
          {/* Header Superior */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                  <FaFileInvoiceDollar className="text-blue-200" /> NUEVA VENTA
                </h1>
                <p className="text-blue-100 mt-1 opacity-80">Punto de Emisión: Principal 001</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Total a Recaudar</span>
                <div className="text-4xl font-black tracking-tighter mt-1">${totalFactura.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Sección Cliente con Buscador Predictivo */}
            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-2 ml-1 italic">
                <FaUserCircle /> INFORMACIÓN DEL CLIENTE
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre o número de cédula/RUC..."
                  value={busquedaCliente}
                  onChange={(e) => {
                    setBusquedaCliente(e.target.value);
                    setMostrarListaClientes(true);
                  }}
                  onFocus={() => setMostrarListaClientes(true)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                />
                
                {/* Menú desplegable del buscador */}
                {mostrarListaClientes && busquedaCliente.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                    {clientesFiltrados.length > 0 ? (
                      clientesFiltrados.map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => seleccionarCliente(c)}
                          className="p-4 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center transition-colors"
                        >
                          <div>
                            <p className="font-bold text-slate-800">{c.nombre}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <FaHashtag size={10}/> {c.identificacion}
                            </p>
                          </div>
                          <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full font-bold text-slate-400">ID: {c.id}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-sm italic">No se encontraron clientes</div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Vista previa del cliente seleccionado */}
              {clienteSeleccionado && (
                <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-blue-800">{clienteSeleccionado.nombre}</h3>
                      <p className="text-sm text-blue-600 flex items-center gap-1">
                        <FaHashtag size={10}/> {clienteSeleccionado.identificacion}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setClienteSeleccionado(null);
                        setBusquedaCliente('');
                      }}
                      className="text-blue-400 hover:text-red-500"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Listado de Productos */}
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-400 text-xs tracking-widest uppercase">Detalle de Productos</h3>
                <button 
                  type="button" 
                  onClick={handleAddDetalle}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-bold transition-all"
                >
                  <FaPlus className="bg-blue-100 p-1 rounded-full" /> Agregar ítem
                </button>
              </div>

              <div className="space-y-3">
                {detalles.map((det, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                    <div className="flex-1">
                      <select 
                        value={det.producto_id}
                        onChange={(e) => handleChangeDetalle(index, 'producto_id', e.target.value)}
                        className="w-full bg-white p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400 transition-all font-semibold text-slate-600 appearance-none"
                      >
                        <option value="">Seleccione un producto...</option>
                        {productosDisponibles.map(p => (
                          <option key={p.id} value={p.id}>{p.nombre} — ${p.precio}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-full md:w-32">
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0"
                          value={det.cantidad}
                          min="1"
                          onChange={(e) => handleChangeDetalle(index, 'cantidad', e.target.value)}
                          className="w-full p-3 pl-8 bg-white border border-slate-200 rounded-xl font-black text-center focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                        />
                        <span className="absolute left-3 top-3.5 text-[10px] font-bold text-slate-400 uppercase">CT</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end md:w-48 px-2">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Subtotal</p>
                        <p className="text-xl font-black text-slate-700">
                          ${(det.cantidad * (det.precio_unitario || 0)).toFixed(2)}
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveDetalle(index)} 
                        className="ml-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer de Acción */}
            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-slate-400 text-sm italic">
                * Verifique los datos del cliente antes de procesar la factura electrónica.
              </div>
              <button 
                type="submit" 
                className="w-full md:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-green-100 transition-all transform active:scale-95 flex items-center justify-center gap-3 tracking-wide"
              >
                <FaFileInvoiceDollar /> CONFIRMAR Y EMITIR FACTURA
              </button>
            </div>

          </form>
        </div>
      </div>
      
      {/* Modal */}
      <Modal />
    </div>
  );
};

export default NuevaFactura;