import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFileInvoice, FaSearch, FaEye, FaDollarSign, FaCalendar, FaUser } from 'react-icons/fa';

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/facturas');
        if (!res.ok) throw new Error('Error al cargar facturas');
        const data = await res.json();
        setFacturas(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFacturas();
  }, []);

  const filteredFacturas = facturas.filter(factura => 
    factura.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    factura.cliente_identificacion.includes(searchTerm) ||
    factura.id.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <FaFileInvoice className="text-blue-600" /> Gestión de Facturas
          </h1>
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar facturas..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">No. Factura</th>
                  <th className="px-6 py-4 text-left">Cliente</th>
                  <th className="px-6 py-4 text-left">Fecha</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFacturas.length > 0 ? (
                  filteredFacturas.map(factura => {
                    const subtotal = factura.detalles ? 
                      factura.detalles.reduce((acc, det) => acc + (det.cantidad * det.precio_unitario), 0) : 
                      factura.subtotal;
                    const total = factura.total || (subtotal + (subtotal * 0.12));
                    
                    return (
                      <tr key={factura.id} className="hover:bg-blue-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">FAC-{factura.id.toString().padStart(6, '0')}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            <FaUser className="text-blue-500" /> {factura.cliente_nombre}
                          </div>
                          <div className="text-sm text-slate-500">{factura.cliente_identificacion}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <FaCalendar /> {new Date(factura.fecha_emision).toLocaleDateString('es-EC')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-bold text-slate-800 flex items-center gap-2 justify-end">
                            <FaDollarSign className="text-green-500" /> ${total}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link 
                            to={`/facturas/${factura.id}`} 
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                            title="Ver factura"
                          >
                            <FaEye />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 bg-slate-50">
                      <div className="flex flex-col items-center justify-center">
                        <FaFileInvoice className="text-4xl text-slate-300 mb-3" />
                        <p className="text-lg font-medium">No hay facturas registradas</p>
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
  );
};

export default Facturas;