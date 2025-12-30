import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPrint, FaFileInvoice, FaUser, FaCalendar, FaDollarSign, FaHashtag, FaBox } from 'react-icons/fa';

const DetallesFactura = () => {
  const { id } = useParams(); // Aquí se obtiene el ID de la URL
  const navigate = useNavigate();
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/facturas');
      return;
    }
    
    const fetchFactura = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/facturas/${id}`);
        if (!res.ok) throw new Error('Error al cargar factura');
        const data = await res.json();
        setFactura(data);
      } catch (error) {
        console.error('Error:', error);
        alert('Factura no encontrada');
        navigate('/facturas');
      } finally {
        setLoading(false);
      }
    };
    fetchFactura();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!factura) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <FaFileInvoice className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600">Factura no encontrada</h2>
          <button
            onClick={() => navigate('/facturas')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Volver a Facturas
          </button>
        </div>
      </div>
    );
  }

  // Calculamos los totales si no vienen del backend
  const subtotal = factura.detalles ? 
    factura.detalles.reduce((acc, det) => acc + (det.cantidad * det.precio_unitario), 0) : 
    factura.subtotal;
  const iva = factura.iva || (subtotal * 0.12);
  const total = factura.total || (subtotal + iva);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8 print:bg-white print:p-8">
      <div className="max-w-4xl mx-auto print:max-w-none print:w-full">
        {/* Botones para impresión y navegación */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <button
            onClick={() => navigate('/facturas')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold"
          >
            <FaArrowLeft /> Volver a Facturas
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-100"
          >
            <FaPrint /> Imprimir Factura
          </button>
        </div>

        {/* Contenido de la factura */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 print:shadow-none print:border-0">
          
          {/* Header de la factura */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white print:bg-blue-600">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                  <FaFileInvoice className="text-blue-200" /> FACTURA ELECTRÓNICA
                </h1>
                <p className="text-blue-100 mt-1 opacity-80">RUC: 1798567432001</p>
              </div>
              <div className="text-right">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-200">No. de Factura</p>
                  <p className="text-2xl font-black tracking-tighter mt-1">FAC-{factura.id.toString().padStart(6, '0')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de la factura */}
          <div className="p-8 space-y-8 print:p-6">
            
            {/* Encabezado de la factura */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-slate-400 text-xs tracking-widest uppercase mb-3">Datos del Emisor</h3>
                <div className="space-y-2">
                  <p className="font-bold text-slate-800">EMPRESA COMERCIAL S.A.</p>
                  <p className="text-sm text-slate-600">Av. Amazonas E12-345 y Naciones Unidas</p>
                  <p className="text-sm text-slate-600">Quito - Ecuador</p>
                  <p className="text-sm text-slate-600">RUC: 1798567432001</p>
                  <p className="text-sm text-slate-600">Tel: (02) 2567-890</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-slate-400 text-xs tracking-widest uppercase mb-3">Datos del Cliente</h3>
                <div className="space-y-2">
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                    <FaUser className="text-blue-500" /> {factura.cliente_nombre}
                  </p>
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <FaHashtag className="text-blue-500" /> {factura.cliente_identificacion}
                  </p>
                  <p className="text-sm text-slate-600">Dirección: {factura.cliente_direccion || 'No registrada'}</p>
                  <p className="text-sm text-slate-600">Teléfono: {factura.cliente_telefono || 'No registrado'}</p>
                </div>
              </div>
            </div>

            {/* Información de emisión */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha de Emisión</p>
                <p className="font-bold text-slate-800 flex items-center gap-2">
                  <FaCalendar className="text-blue-500" /> {new Date(factura.fecha_emision).toLocaleDateString('es-EC')}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usuario</p>
                <p className="font-bold text-slate-800">Admin</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Punto de Emisión</p>
                <p className="font-bold text-slate-800">Principal 001</p>
              </div>
            </div>

            {/* Detalles de productos */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-400 text-xs tracking-widest uppercase">Detalle de Productos</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                      <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cantidad</th>
                      <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Precio Unit.</th>
                      <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {factura.detalles.map((detalle, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{detalle.producto_nombre}</p>
                          <p className="text-sm text-slate-500">{detalle.producto_descripcion}</p>
                        </td>
                        <td className="p-4 text-right font-bold text-slate-800">{detalle.cantidad}</td>
                        <td className="p-4 text-right font-bold text-slate-800">${detalle.precio_unitario}</td>
                        <td className="p-4 text-right font-bold text-slate-800">${(detalle.cantidad * detalle.precio_unitario).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumen de totales */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subtotal</p>
                  <p className="text-xl font-black text-slate-800">${subtotal}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">IVA 12%</p>
                  <p className="text-xl font-black text-slate-800">${iva}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descuento</p>
                  <p className="text-xl font-black text-slate-800">$0.00</p>
                </div>
                <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-3">
                  <p className="text-xs font-bold uppercase tracking-wider">TOTAL</p>
                  <p className="text-2xl font-black">${total}</p>
                </div>
              </div>
            </div>

            {/* Pie de página */}
            <div className="border-t border-slate-100 pt-6 text-center text-sm text-slate-500 print:hidden">
              <p>Esta factura electrónica cumple con los requisitos establecidos por el SRI</p>
              <p className="mt-1">Generada automáticamente por el sistema de facturación</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesFactura;