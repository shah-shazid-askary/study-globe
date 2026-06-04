import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await analyticsAPI.getSystemMetrics();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // simulate live poll 
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) return <div className="p-8 text-center text-gray-500">Connecting to system monitor...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 System Analytics</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Users</p>
            <p className="text-3xl font-bold text-gray-800">{data.metrics.users}</p>
          </div>
          <div className="text-4xl">👥</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Universities</p>
            <p className="text-3xl font-bold text-gray-800">{data.metrics.universities}</p>
          </div>
          <div className="text-4xl">🏛</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Network Status</p>
            <p className="text-xl font-bold text-green-600">Stable</p>
          </div>
          <div className="text-4xl">⚡</div>
        </div>
      </div>

      {/* Terminal View */}
      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 mt-8">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-3 text-xs text-gray-400 font-mono tracking-widest">SERVER / LIVE LOGS</span>
        </div>
        <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto min-h-[300px]">
          {data.logs.map((log, index) => (
            <div key={index} className="flex gap-4 mb-2 opacity-90 hover:opacity-100 transition-opacity">
              <span className="text-blue-400 shrink-0">[{log.time}]</span>
              <span className={`shrink-0 font-bold ${log.level === 'WARN' ? 'text-yellow-400' : 'text-green-400'}`}>
                {log.level}
              </span>
              <span className="text-gray-300">{log.message}</span>
            </div>
          ))}
          <div className="animate-pulse flex items-center gap-2 mt-4 text-gray-500">
            <span>_</span>
            <span className="text-xs tracking-widest">POLLING DIAGNOSTICS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
