import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

/* ── Modern SVG icons ──────────────────────────────────────── */
const UsersIcon = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const ShieldIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const UserIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const ArrowUpIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);
const ArrowDownIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);
const BackIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
const CalendarIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const XIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const AlertIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/* ── In-app confirmation modal ─────────────────────────── */
const ConfirmModal = ({ modal, onConfirm, onCancel }) => {
  if (!modal) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">

        {/* Close */}
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
          <XIcon className="w-5 h-5" />
        </button>

        {/* Icon + heading */}
        <div className="flex items-start gap-4">
          <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
            modal.danger
              ? 'bg-red-100 dark:bg-red-950/40 text-red-500'
              : 'bg-violet-100 dark:bg-violet-950/40 text-violet-500'
          }`}>
            {modal.danger ? <AlertIcon className="w-5 h-5" /> : <ShieldIcon className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-black text-gray-800 dark:text-white text-base">{modal.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{modal.message}</p>
          </div>
        </div>

        {/* Actions */}
        {modal.infoOnly ? (
          <button
            onClick={onCancel}
            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2.5 rounded-xl transition text-sm"
          >
            Got it
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold py-2.5 rounded-xl transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 font-bold py-2.5 rounded-xl transition text-sm text-white ${
                modal.danger
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/20'
                  : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/20'
              }`}
            >
              {modal.confirmLabel || 'Confirm'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [modal, setModal]       = useState(null);   // { title, message, danger, infoOnly, confirmLabel, onConfirm }
  const { user: currentUser }   = useAuth();

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

  const openModal = (config) => setModal(config);
  const closeModal = () => setModal(null);

  const handleRoleToggle = (userId, currentRole) => {
    if (userId === currentUser?.id) {
      openModal({
        title: 'Action Not Allowed',
        message: 'You cannot modify your own account privileges here. Ask another administrator to change your role.',
        danger: true,
        infoOnly: true,
      });
      return;
    }
    const newRole      = currentRole === 'admin' ? 'student' : 'admin';
    const isPromoting  = newRole === 'admin';
    openModal({
      title: isPromoting ? 'Promote to Admin?' : 'Demote to Student?',
      message: isPromoting
        ? 'This user will gain full administrative access to the control panel, including user management and system analytics.'
        : 'This user will lose all administrative privileges and be downgraded to a standard student account.',
      danger: !isPromoting,
      confirmLabel: isPromoting ? 'Yes, Promote' : 'Yes, Demote',
      onConfirm: async () => {
        closeModal();
        try {
          await usersAPI.updateRole(userId, newRole);
          fetchUsers();
        } catch (err) {
          openModal({
            title: 'Update Failed',
            message: `Could not modify account privileges. ${err.response?.data?.error || err.message}`,
            danger: true,
            infoOnly: true,
          });
        }
      },
    });
  };

  const adminCount   = users.filter(u => u.role === 'admin').length;
  const studentCount = users.filter(u => u.role === 'student').length;


  return (
    <div className="space-y-8">
      {/* In-app confirmation modal */}
      <ConfirmModal modal={modal} onConfirm={modal?.onConfirm} onCancel={closeModal} />

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-indigo-900 to-blue-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.2),transparent_60%)]" />
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-center gap-6">
          {/* Back */}
          <Link
            to="/admin"
            className="absolute top-5 right-5 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
          >
            <BackIcon className="w-3.5 h-3.5" /> Back
          </Link>

          <div className="w-16 h-16 shrink-0 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-indigo-300">
            <UsersIcon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white/80 text-xs font-bold uppercase tracking-widest mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Access Control
            </div>
            <h1 className="text-3xl font-black text-white">Account Permissions</h1>
            <p className="text-indigo-200/70 text-sm mt-1">
              Manage user roles and privileges across the platform.
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary Stats ────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Accounts', value: users.length, gradient: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/20' },
          { label: 'Administrators', value: adminCount,   gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/20' },
          { label: 'Students',       value: studentCount, gradient: 'from-sky-500 to-blue-600',     glow: 'shadow-sky-500/20' },
        ].map((stat) => (
          <div key={stat.label} className={`group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl ${stat.glow} hover:-translate-y-1 transition-all duration-300`}>
            <div className={`h-1 bg-gradient-to-r ${stat.gradient} group-hover:h-1.5 transition-all duration-300`} />
            <div className="p-5 text-center">
              <p className="text-3xl font-black text-gray-800 dark:text-white">{stat.value}</p>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-2xl p-4 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* ── Users Table Card ─────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">

        {/* Table header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-base font-black text-gray-800 dark:text-white">
            Registered Accounts
            <span className="ml-2 text-xs font-bold bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/50">
              {users.length} total
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm font-semibold">Loading accounts…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {users.map(u => {
                  const isAdmin   = u.role === 'admin';
                  const isSelf    = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">

                      {/* User name + avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${
                            isAdmin ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-sky-400 to-blue-500'
                          }`}>
                            {(u.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-800 dark:text-gray-100">
                            {u.full_name}
                            {isSelf && <span className="ml-1.5 text-[10px] text-gray-400 dark:text-gray-500 font-semibold">(you)</span>}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {u.email}
                        </span>
                      </td>

                      {/* Role badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl border ${
                          isAdmin
                            ? 'bg-gradient-to-r from-violet-400/20 to-purple-500/20 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700/60'
                            : 'bg-gradient-to-r from-sky-400/20 to-blue-500/20 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700/60'
                        }`}>
                          {isAdmin ? <ShieldIcon /> : <UserIcon />}
                          {u.role.toUpperCase()}
                        </span>
                      </td>

                      {/* Joined date */}
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs">
                          <CalendarIcon />
                          {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>

                      {/* Action button */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRoleToggle(u.id, u.role)}
                          disabled={isSelf}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                            isAdmin
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/30'
                              : 'bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/40 hover:bg-violet-100 dark:hover:bg-violet-900/30'
                          }`}
                        >
                          {isAdmin ? <ArrowDownIcon /> : <ArrowUpIcon />}
                          {isAdmin ? 'Demote' : 'Promote'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
