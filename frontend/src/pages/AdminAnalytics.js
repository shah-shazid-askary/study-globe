import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAnalyticsQuery } from '../hooks/useAppQueries';
import { queryKeys } from '../lib/queryClient';

/* ── Modern SVG icons ──────────────────────────────────────── */
const UsersIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const BuildingIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);
const ZapIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const RefreshIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const metricCards = [
  {
    key: 'users',
    label: 'Total Users',
    icon: <UsersIcon className="w-6 h-6" />,
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/20',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'universities',
    label: 'Total Universities',
    icon: <BuildingIcon className="w-6 h-6" />,
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/20',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    text: 'text-violet-600 dark:text-violet-400',
  },
  {
    key: 'status',
    label: 'Network Status',
    icon: <ZapIcon className="w-6 h-6" />,
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/20',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
];

const AdminAnalytics = () => {
  const queryClient = useQueryClient();
  const { data, isLoading: loading, dataUpdatedAt } = useAnalyticsQuery();
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const refreshMetrics = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics });

  if (loading || !data) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      <p className="text-gray-500 dark:text-gray-400 font-semibold">Connecting to system monitor…</p>
    </div>
  );

  const metricValues = {
    users: data.metrics.users,
    universities: data.metrics.universities,
    status: 'Stable',
  };

  return (
    <div className="space-y-8">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.2),transparent_60%)]" />
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 p-8 flex items-center gap-6">
          <div className="w-16 h-16 shrink-0 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-blue-300">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white/80 text-xs font-bold uppercase tracking-widest mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Live Monitor
            </div>
            <h1 className="text-3xl font-black text-white">System Analytics</h1>
            {lastUpdated && (
              <p className="text-blue-200/70 text-xs mt-1">
                Last refreshed at {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={refreshMetrics}
            className="ml-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Metric Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {metricCards.map((card) => (
          <div
            key={card.key}
            className={`group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl ${card.glow} hover:-translate-y-1 transition-all duration-300`}
          >
            <div className={`h-1 bg-gradient-to-r ${card.gradient} group-hover:h-1.5 transition-all duration-300`} />
            <div className="p-6 flex items-center gap-5">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg shrink-0`}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{card.label}</p>
                <p className={`text-3xl font-black ${card.key === 'status' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-white'}`}>
                  {metricValues[card.key]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Terminal Log View ───────────────────────────────── */}
      <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
        {/* Terminal title bar */}
        <div className="bg-gray-800 dark:bg-gray-900 px-5 py-3 border-b border-gray-700 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="ml-2 text-xs text-gray-400 font-mono tracking-widest">studyglobe / server / live-logs</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            STREAMING
          </span>
        </div>

        {/* Log lines */}
        <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto min-h-[320px] space-y-1.5">
          {data.logs.map((log, index) => (
            <div key={index} className="flex gap-4 opacity-90 hover:opacity-100 transition-opacity group">
              <span className="text-indigo-400 shrink-0 text-xs">[{log.time}]</span>
              <span className={`shrink-0 text-xs font-black w-10 ${
                log.level === 'WARN'  ? 'text-amber-400' :
                log.level === 'ERROR' ? 'text-red-400' :
                'text-emerald-400'
              }`}>
                {log.level}
              </span>
              <span className="text-gray-300 text-xs group-hover:text-white transition-colors">{log.message}</span>
            </div>
          ))}
          <div className="animate-pulse flex items-center gap-2 mt-6 text-gray-600 pt-4 border-t border-gray-800">
            <span className="text-violet-400">▌</span>
            <span className="text-xs tracking-widest text-gray-500">POLLING DIAGNOSTICS — 15s INTERVAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
