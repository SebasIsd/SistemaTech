// src/pages/AdminUsersFull.jsx
import { useState, useEffect } from 'react';
import { FaUserShield, FaUser, FaTrash, FaCheck, FaTimes, FaEdit } from 'react-icons/fa';

const AdminUsersFull = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rol: '', is_active: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      if (!res.ok) throw new Error('No se pudieron cargar los usuarios');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    if (!confirm(`¿${user.is_active ? 'Desactivar' : 'Activar'} al usuario ${user.name}?`)) return;

    try {
      const newStatus = user.is_active ? 0 : 1;
      const res = await fetch(`http://localhost:5000/api/users/${user.id}/active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus })
      });

      if (!res.ok) throw new Error('No se pudo cambiar el estado');
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Realmente deseas ELIMINAR este usuario? Esta acción no se puede deshacer.')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('No se pudo eliminar');
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({ rol: user.rol, is_active: user.is_active });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ rol: '', is_active: null });
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rol: editForm.rol,
          is_active: editForm.is_active
        })
      });

      if (!res.ok) throw new Error('No se pudo actualizar');
      setUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, rol: editForm.rol, is_active: editForm.is_active } : u))
      );
      cancelEdit();
    } catch (err) {
      alert('Error al guardar cambios: ' + err.message);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
      {error}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <span className="text-sm text-gray-500">Total: {users.length} usuarios</span>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === user.id ? (
                    <select
                      value={editForm.rol}
                      onChange={e => setEditForm({ ...editForm, rol: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.rol === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.rol === 'admin' ? 'Admin' : 'Usuario'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === user.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => saveEdit(user.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Guardar"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-red-600 hover:text-red-900"
                        title="Cancelar"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => startEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Editar rol"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => handleToggleActive(user)}
                        className={user.is_active ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                        title={user.is_active ? "Desactivar" : "Activar"}
                      >
                        {user.is_active ? <FaTimes /> : <FaCheck />}
                      </button>

                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar usuario"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay usuarios registrados aún
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersFull;