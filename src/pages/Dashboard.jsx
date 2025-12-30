// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { FaShoppingCart, FaMoneyBillWave, FaUsers, FaFileInvoice, FaChartLine } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    ventasHoy: 0,
    ingresosMes: 0,
    usuariosActivos: 0,
    facturasPendientes: 0,
  });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ label: 'Ventas (COP)', data: [], backgroundColor: 'rgba(59, 130, 246, 0.7)' }],
  });
  const [ultimasFacturas, setUltimasFacturas] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Ventas de la semana',
        font: { size: 18 },
        color: '#1f2937',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => `$${value.toLocaleString()}` },
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Stats generales
        const statsRes = await fetch('http://localhost:5000/api/dashboard/stats');
        const statsData = await statsRes.json();
        setStats(statsData);

        // Datos gráfico
        const ventasRes = await fetch('http://localhost:5000/api/dashboard/ventas-semana');
        const ventasData = await ventasRes.json();
        setChartData({
          labels: ventasData.labels,
          datasets: [{ ...chartData.datasets[0], data: ventasData.data }],
        });

        // Últimas facturas
        const facturasRes = await fetch('http://localhost:5000/api/dashboard/ultimas-facturas');
        const facturasData = await facturasRes.json();
        setUltimasFacturas(facturasData);

        // Actividad reciente
        const actividadRes = await fetch('http://localhost:5000/api/dashboard/actividad-reciente');
        const actividadData = await actividadRes.json();
        setActividadReciente(actividadData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Cargando datos reales...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bienvenido de nuevo. Aquí tienes un resumen de tu negocio.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition">
          Nueva Venta
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ventas Hoy</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.ventasHoy}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaShoppingCart className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ingresos este mes</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${stats.ingresosMes.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaMoneyBillWave className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Usuarios Activos</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.usuariosActivos}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaUsers className="text-purple-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Facturas Pendientes</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.facturasPendientes}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FaFileInvoice className="text-orange-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico y tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de ventas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Últimas facturas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Últimas Facturas</h2>
          <div className="space-y-4">
            {ultimasFacturas.length > 0 ? (
              ultimasFacturas.map((factura) => (
                <div key={factura.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">FAC-{factura.id.toString().padStart(3, '0')}</p>
                    <p className="text-sm text-gray-600">{factura.cliente}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${factura.monto.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(factura.fecha).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay facturas recientes</p>
            )}
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          {actividadReciente.length > 0 ? (
            actividadReciente.map((act, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaChartLine className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{act.descripcion}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(act.created_at).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No hay actividad reciente</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;