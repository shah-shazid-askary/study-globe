import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { universitiesAPI } from '../services/api';

const Universities = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  const [searchText, setSearchText] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [dbUniversities, setDbUniversities] = useState([]);
  const inputRef = useRef(null);

  const fetchUniversities = async (search) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search && search.trim()) params.search = search.trim();
      // also support legacy country_id from URL
      const cid = searchParams.get('country_id');
      if (cid) params.country_id = cid;
      const res = await universitiesAPI.getAll(params);
      setUniversities(res.data);
    } catch (err) {
      setError('Failed to load universities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUniversities = async () => {
    try {
      const res = await universitiesAPI.getAll();
      setDbUniversities(res.data.sort((a, b) => a.Name.localeCompare(b.Name)));
    } catch (err) { }
  };

  useEffect(() => {
    fetchUniversities('');
    fetchAllUniversities();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedSearch(searchText);
    fetchUniversities(searchText);
  };

  const handleClear = () => {
    setSearchText('');
    setAppliedSearch('');
    fetchUniversities('');
    inputRef.current?.focus();
  };

  return (
    <div>
      {/* ── Premium Gradient Hero Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-500 rounded-3xl p-6 mb-6 shadow-lg">
        <div className="absolute -right-6 -top-6 text-8xl opacity-10 select-none pointer-events-none">🎓</div>
        <div className="absolute right-8 bottom-0 text-6xl opacity-10 select-none pointer-events-none">🏛️</div>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-1 relative z-10">🎓 Universities</h1>
        <p className="text-indigo-100/90 text-sm relative z-10">Search and explore universities around the world</p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 flex gap-3 items-center shadow-sm"
      >
        <div className="relative flex-1">
          {/* Search icon */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            🔍
          </span>
          <select
            ref={inputRef}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-650 rounded-lg pl-9 pr-16 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          >
            <option value="" className="bg-white dark:bg-gray-700">Search by university name…</option>
            {dbUniversities.map(uni => (
              <option key={uni.id} value={uni.Name} className="bg-white dark:bg-gray-700">{uni.Name}</option>
            ))}
          </select>
          {searchText && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap"
        >
          Search
        </button>
      </form>

      {/* Status bar */}
      {!loading && !error && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {appliedSearch
            ? <>Showing <strong>{universities.length}</strong> result{universities.length !== 1 ? 's' : ''} for "<span className="text-blue-600 dark:text-blue-400">{appliedSearch}</span>"</>
            : <><strong>{universities.length}</strong> {universities.length !== 1 ? 'universities' : 'university'} found</>
          }
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : universities.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No universities found{appliedSearch ? ` for "${appliedSearch}"` : ''}.</p>
          {appliedSearch && (
            <button onClick={handleClear} className="mt-3 text-blue-600 dark:text-blue-400 underline text-sm hover:text-blue-800 dark:hover:text-blue-300">
              Clear search and show all
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {universities.map((uni) => (
            <Link
              key={uni.id}
              to={`/universities/${uni.id}`}
              className="block bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{uni.Name}</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">{uni.countries?.name}</p>
              {uni.city && <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">📍 {uni.city}</p>}
              {uni.type && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">🎓 {uni.type}</p>}
              {uni.website && (
                <p className="text-xs text-blue-400 dark:text-blue-300 mb-3 truncate">🌐 {uni.website}</p>
              )}
              <span className="mt-3 inline-block text-blue-600 dark:text-blue-400 text-sm font-medium">
                View Details →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Universities;

