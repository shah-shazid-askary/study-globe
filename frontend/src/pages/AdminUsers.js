import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth(); // don't let admins demote themselves

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    if (userId === currentUser?.id) {
      alert("You cannot modify your own core privileges safely here!");
      return;
    }
    
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`Elevate user to ${newRole.toUpperCase()}?`)) return;
    
    try {
      await usersAPI.updateRole(userId, newRole);
      fetchUsers(); // Refresh live
    } catch (err) {
      alert(`Failed to modify account privileges! Error: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading accounts...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">👥 Account Permissions</h1>
      
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md mb-4">{error}</div>}

      <div className="bg-white p-6 rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
        <h2 className="text-xl font-bold mb-4">Registered Accounts ({users.length})</h2>
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Email Address</th>
              <th className="px-4 py-3">Current Role</th>
              <th className="px-4 py-3">Joined Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-4 font-medium text-gray-800">{u.full_name}</td>
                <td className="px-4 py-4 text-gray-500">{u.email}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-4 text-right">
                  <button 
                    onClick={() => handleRoleToggle(u.id, u.role)} 
                    className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    disabled={u.id === currentUser?.id}
                  >
                    {u.role === 'admin' ? 'Demote to Student' : 'Elevate to Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
