import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
            👑
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Control Panel</h1>
            <p className="text-gray-500">Welcome back, {user?.full_name}</p>
          </div>
        </div>

        <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-5 mb-8">
          <p className="font-semibold">Security Validation Passed</p>
          <p className="text-sm">You are viewing this page because your account has native <strong>Administrative Privileges</strong>. Standard users are completely blocked from this view.</p>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Management Modules</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer bg-gray-50 flex flex-col items-start">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">👥 Account Permissions</h3>
            <p className="text-gray-600 text-sm mb-4">Review newly registered students and manually elevate authorized users to admin roles.</p>
            <Link to="/admin/users" className="mt-auto text-blue-600 font-medium text-sm hover:underline">Manage Users →</Link>
          </div>

          <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer bg-gray-50 flex flex-col items-start">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📊 System Analytics</h3>
            <p className="text-gray-600 text-sm mb-4">View real-time chatbot logs, API rate limits, and Supabase database connection health metrics.</p>
            <Link to="/admin/analytics" className="mt-auto text-blue-600 font-medium text-sm hover:underline">View Live Logs →</Link>
          </div>

          <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer bg-gray-50 flex flex-col items-start">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">💾 Data Management</h3>
            <p className="text-gray-600 text-sm mb-4">Add and manage foundational records like Countries and Universities in the database securely.</p>
            <Link to="/admin/data" className="mt-auto text-blue-600 font-medium text-sm hover:underline">Manage Data →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
