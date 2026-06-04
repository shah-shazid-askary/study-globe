import React, { useState, useEffect } from 'react';
import { programsAPI } from '../services/api';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ degree_level: '', field: '' });
  const [dbFields, setDbFields] = useState([]);

  const fetchPrograms = async (f) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (f.degree_level) params.degree_level = f.degree_level;
      if (f.field) params.field = f.field;
      const res = await programsAPI.getAll(params);
      setPrograms(res.data);
    } catch (err) {
      setError('Failed to load programs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchPrograms(filters); 
    const fetchFields = async () => {
      try {
        const res = await programsAPI.getAll({});
        const all = res.data.map(p => p.field).filter(Boolean);
        setDbFields([...new Set(all)].sort());
      } catch (err) {}
    };
    fetchFields();
  }, []);

  const handleFilter = (e) => { e.preventDefault(); fetchPrograms(filters); };
  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Academic Programs</h1>

      <form onSubmit={handleFilter}
        className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Degree Level</label>
          <select name="degree_level" value={filters.degree_level} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-44 focus:ring-2 focus:ring-blue-400 focus:outline-none">
            <option value="">All Levels</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Masters">Masters</option>
            <option value="PhD">PhD</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Field of Study</label>
          <select name="field" value={filters.field} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-52 focus:ring-2 focus:ring-blue-400 focus:outline-none">
            <option value="">All Fields</option>
            {dbFields.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <button type="submit"
          className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors">
          Search
        </button>
        <button type="button"
          onClick={() => { const c = { degree_level: '', field: '' }; setFilters(c); fetchPrograms(c); }}
          className="text-gray-400 hover:text-gray-600 text-sm underline">
          Clear
        </button>
      </form>

      {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-4 mb-6">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : programs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No programs found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {programs.map((p) => (
            <div key={p.id} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all">
              <h3 className="font-semibold text-gray-800 mb-1">{p.degree} — {p.field}</h3>
              <p className="text-sm text-blue-600 mb-3">{p.universities?.Name}</p>
              <div className="flex flex-wrap gap-2">
                {p.degree && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{p.degree}</span>}
                {p.field && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{p.field}</span>}
                {p.duration_years && <span className="text-xs text-gray-500">⏱ {p.duration_years} yrs</span>}
                {p.tuition_per_year && <span className="text-xs text-gray-500">💰 ${Number(p.tuition_per_year).toLocaleString()}/yr</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Programs;
