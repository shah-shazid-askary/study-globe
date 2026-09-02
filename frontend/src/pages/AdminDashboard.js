import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

/* ── Modern inline SVG icons ─────────────────────────────── */
const ShieldCheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);
const UsersIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const ActivityIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const CrownIcon = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 19h20M4 15l4-8 4 4 4-8 4 8" />
    <rect x="2" y="19" width="20" height="2" rx="1" />
  </svg>
);
const ArrowRightIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const modules = [
  {
    to: '/admin/users',
    title: 'Account Permissions',
    desc: 'Review newly registered students and manually elevate authorized users to admin roles.',
    label: 'Manage Users',
    icon: <UsersIcon className="w-6 h-6" />,
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/20',
    pill: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
  },
  {
    to: '/admin/analytics',
    title: 'System Analytics',
    desc: 'View real-time chatbot logs, API rate limits, and Supabase database connection health metrics.',
    label: 'View Live Logs',
    icon: <ActivityIcon className="w-6 h-6" />,
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/20',
    pill: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/50',
  },
];


const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-violet-900 to-indigo-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.25),transparent_60%)]" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-0 w-56 h-56 bg-indigo-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6">
          {/* Icon */}
          <div className="w-20 h-20 shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center text-amber-300">
            <CrownIcon className="w-10 h-10" />
          </div>

          {/* Text */}
          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white/80 text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Admin Session Active
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">Admin Control Panel</h1>
            <p className="text-violet-200/80 text-sm">
              Welcome back, <span className="text-white font-bold">{user?.full_name || 'Administrator'}</span>. You have full system access.
            </p>
          </div>
        </div>
      </div>

      {/* ── Security Badge ──────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-5">
        <div className="shrink-0 w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <ShieldCheckIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Security Validation Passed</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-500 mt-0.5 leading-relaxed">
            You are viewing this page because your account holds native <strong>Administrative Privileges</strong>. Standard users are completely blocked from this view.
          </p>
        </div>
      </div>

      {/* ── Module Cards ────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-black text-gray-800 dark:text-white mb-4 px-1">Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((mod) => (
            <div
              key={mod.to}
              className={`group relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl ${mod.glow} hover:-translate-y-1 transition-all duration-300 flex flex-col`}
            >
              {/* Colour accent top bar */}
              <div className={`h-1 bg-gradient-to-r ${mod.gradient} group-hover:h-1.5 transition-all duration-300`} />

              <div className="p-6 flex flex-col flex-1 gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center text-white shadow-lg`}>
                  {mod.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-black text-gray-800 dark:text-white text-base mb-1">{mod.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{mod.desc}</p>
                </div>

                {/* CTA */}
                <Link
                  to={mod.to}
                  className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider px-3 py-2 rounded-xl border transition-all ${mod.pill} hover:scale-[1.02]`}
                >
                  {mod.label}
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
