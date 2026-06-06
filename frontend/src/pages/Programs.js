import React, { useState, useEffect } from 'react';
import { programsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

/* ── Degree colour system ─────────────────────────────── */
const degreeMeta = {
  Bachelor: {
    color:        'from-sky-400 to-blue-600',
    activePill:   'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30 scale-105',
    inactivePill: 'bg-sky-500/15 text-sky-100 border border-sky-400/30 hover:bg-sky-500/25',
    badge:        'bg-gradient-to-r from-sky-400/20 to-blue-500/20 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700/60',
    cardTop:      'from-sky-400 to-blue-600',
    dot:          'bg-sky-500',
    tag:          'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
  },
  Masters: {
    color:        'from-violet-500 to-purple-600',
    activePill:   'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 scale-105',
    inactivePill: 'bg-violet-500/15 text-violet-100 border border-violet-400/30 hover:bg-violet-500/25',
    badge:        'bg-gradient-to-r from-violet-400/20 to-purple-500/20 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700/60',
    cardTop:      'from-violet-500 to-purple-600',
    dot:          'bg-violet-500',
    tag:          'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
  },
  PhD: {
    color:        'from-amber-400 to-orange-600',
    activePill:   'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 scale-105',
    inactivePill: 'bg-amber-500/15 text-amber-100 border border-amber-400/30 hover:bg-amber-500/25',
    badge:        'bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60',
    cardTop:      'from-amber-400 to-orange-600',
    dot:          'bg-amber-500',
    tag:          'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  },
};

/* ── Per-degree modern SVG icons ─────────────────────── */
const DegreeIcon = ({ type, className = 'w-4 h-4' }) => {
  const icons = {
    /* Graduation cap – clean modern version */
    Bachelor: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10L12 5 2 10l10 5 10-5z" />
        <path d="M6 12.5v5C8 19.5 10 20.5 12 20.5s4-1 6-3v-5" />
        <line x1="22" y1="10" x2="22" y2="16" />
      </svg>
    ),
    /* Rosette / verified-award – Masters */
    Masters: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M8.56 2.75c.18.47.47.9.85 1.21L12 6l2.59-2.04a3.37 3.37 0 00.85-1.21" />
        <path d="M6 12l-2 10 8-3 8 3-2-10" />
        <polyline points="9 12 12 15 15 12" />
      </svg>
    ),
    /* Microscope / research – PhD */
    PhD: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  };
  return icons[type] || null;
};

const Programs = () => {
  const { t, lang } = useLanguage();
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

  const fetchFields = async () => {
    try {
      const res = await programsAPI.getAll({});
      const all = res.data.map(p => p.field).filter(Boolean);
      setDbFields([...new Set(all)].sort());
    } catch (err) {}
  };

  useEffect(() => { fetchPrograms(filters); fetchFields(); }, []);

  const handleFilter = (e) => { e.preventDefault(); fetchPrograms(filters); };
  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleClear = () => { const c = { degree_level: '', field: '' }; setFilters(c); fetchPrograms(c); };

  const activeMeta = filters.degree_level ? degreeMeta[filters.degree_level] : null;

  return (
    <div className="dark:text-gray-100 space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.12),transparent_60%)]"></div>
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-fuchsia-400/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-xs font-bold uppercase tracking-widest">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {lang === 'en' ? 'Academic Programs' : 'একাডেমিক প্রোগ্রাম'}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{t('navPrograms')}</h1>
              <p className="text-violet-100/80 text-sm md:text-base max-w-lg">
                {lang === 'en' ? 'Filter and discover the right academic program tailored to your goals and budget.' : 'আপনার লক্ষ্য এবং বাজেট অনুযায়ী সঠিক একাডেমিক প্রোগ্রামটি খুঁজুন।'}
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shrink-0">
              <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          {/* Level Pills – colour-coded */}
          <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-white/20">
            {Object.entries(degreeMeta).map(([level, meta]) => (
              <button
                key={level}
                onClick={() => { const c = { ...filters, degree_level: filters.degree_level === level ? '' : level }; setFilters(c); fetchPrograms(c); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  filters.degree_level === level
                    ? meta.activePill
                    : meta.inactivePill
                }`}
              >
                <DegreeIcon type={level} className="w-4 h-4 shrink-0" />
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleFilter} className="bg-white dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              {lang === 'en' ? 'Degree Level' : 'ডিগ্রি স্তর'}
            </label>
            <select
              name="degree_level"
              value={filters.degree_level}
              onChange={handleChange}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition"
            >
              <option value="">{lang === 'en' ? 'All Levels' : 'সব স্তর'}</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Masters">Masters</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              {lang === 'en' ? 'Field of Study' : 'অধ্যয়নের ক্ষেত্র'}
            </label>
            <select
              name="field"
              value={filters.field}
              onChange={handleChange}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition"
            >
              <option value="">{lang === 'en' ? 'All Fields' : 'সব ক্ষেত্র'}</option>
              {dbFields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md"
            >
              {lang === 'en' ? 'Apply' : 'প্রয়োগ'}
            </button>
            {(filters.degree_level || filters.field) && (
              <button
                type="button"
                onClick={handleClear}
                className="border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                {lang === 'en' ? 'Clear' : 'পরিষ্কার'}
              </button>
            )}
          </div>
        </div>

        {/* Active filter tags */}
        {(filters.degree_level || filters.field) && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            {filters.degree_level && (
              <span className={`inline-flex items-center gap-1.5 ${degreeMeta[filters.degree_level]?.badge} text-xs font-bold px-3 py-1 rounded-full`}>
                <DegreeIcon type={filters.degree_level} className="w-3.5 h-3.5 shrink-0" />
                <span>{filters.degree_level}</span>
                <button onClick={() => { const c = { ...filters, degree_level: '' }; setFilters(c); fetchPrograms(c); }} className="ml-0.5 hover:opacity-70">×</button>
              </span>
            )}
            {filters.field && (
              <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{filters.field}</span>
                <button onClick={() => { const c = { ...filters, field: '' }; setFilters(c); fetchPrograms(c); }} className="hover:opacity-70">×</button>
              </span>
            )}
          </div>
        )}
      </form>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-xl p-4">{error}</div>
      )}

      {/* Results count */}
      {!loading && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400 px-1">
          <strong className="text-gray-700 dark:text-gray-300">{programs.length}</strong> program{programs.length !== 1 ? 's' : ''} found
        </p>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading programs…</p>
        </div>
      ) : programs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">{lang === 'en' ? 'No programs found.' : 'কোনো প্রোগ্রাম পাওয়া যায়নি।'}</p>
          <button onClick={handleClear} className="mt-3 text-violet-600 underline text-sm">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {programs.map((p) => {
            const meta = degreeMeta[p.degree] || degreeMeta.Bachelor;
            return (
              <div
                key={p.id}
                className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Coloured top accent bar */}
                <div className={`h-1.5 bg-gradient-to-r ${meta.cardTop} group-hover:h-2 transition-all duration-300`}></div>

                <div className="p-6 space-y-4">
                  {/* Degree badge + Tuition */}
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 ${meta.badge} text-xs font-black px-3 py-1.5 rounded-xl`}>
                      <DegreeIcon type={p.degree} className="w-3.5 h-3.5 shrink-0" />
                      <span>{p.degree}</span>
                    </span>
                    {p.tuition_per_year && (
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 whitespace-nowrap">
                        ${Number(p.tuition_per_year).toLocaleString()}/yr
                      </span>
                    )}
                  </div>

                  {/* Title + University */}
                  <div>
                    <h3 className="font-black text-gray-800 dark:text-white text-base leading-snug">
                      {p.field || 'General Studies'}
                    </h3>
                    <p className="text-sm text-violet-600 dark:text-violet-400 font-semibold mt-1">{p.universities?.Name}</p>
                  </div>

                  {/* Tag row */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {p.degree && (
                      <span className={`text-xs ${meta.tag} px-2.5 py-1 rounded-full font-semibold flex items-center gap-1`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} inline-block`}></span>
                        {p.degree}
                      </span>
                    )}
                    {p.field && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full font-semibold">{p.field}</span>
                    )}
                    {p.duration_years && (
                      <span className="text-xs bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {p.duration_years} yrs
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Programs;
