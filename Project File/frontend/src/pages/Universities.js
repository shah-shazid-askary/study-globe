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

  useEffect(() => {
    fetchUniversities('');
    const fetchAllUniversities = async () => {
      try {
        const res = await universitiesAPI.getAll();
        setDbUniversities(res.data.sort((a, b) => a.Name.localeCompare(b.Name)));
      } catch (err) { }
    };
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
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Universities</h1>
      <p className="text-gray-500 mb-6">Search and explore universities around the world</p>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex gap-3 items-center shadow-sm"
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
            className="w-full border border-gray-300 rounded-lg pl-9 pr-16 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          >
            <option value="">Search by university name…</option>
            {dbUniversities.map(uni => (
              <option key={uni.id} value={uni.Name}>{uni.Name}</option>
            ))}
          </select>
          {searchText && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none"
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
        <div className="text-sm text-gray-500 mb-4">
          {appliedSearch
            ? <>Showing <strong>{universities.length}</strong> result{universities.length !== 1 ? 's' : ''} for "<span className="text-blue-600">{appliedSearch}</span>"</>
            : <><strong>{universities.length}</strong> universit{universities.length !== 1 ? 'ies' : 'y'} found</>
          }
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-4 mb-6">
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
          <p className="text-gray-500 text-lg">No universities found{appliedSearch ? ` for "${appliedSearch}"` : ''}.</p>
          {appliedSearch && (
            <button onClick={handleClear} className="mt-3 text-blue-600 underline text-sm hover:text-blue-800">
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
              className="block bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{uni.Name}</h3>
              <p className="text-sm text-blue-600 font-medium mb-1">{uni.countries?.name}</p>
              {uni.city && <p className="text-xs text-gray-400 mb-2">📍 {uni.city}</p>}
              {uni.type && <p className="text-xs text-gray-500 mb-3">🎓 {uni.type}</p>}
              {uni.website && (
                <p className="text-xs text-blue-400 mb-3 truncate">🌐 {uni.website}</p>
              )}
              <span className="mt-3 inline-block text-blue-600 text-sm font-medium">
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
