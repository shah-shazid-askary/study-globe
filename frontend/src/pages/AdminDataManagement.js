import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { countriesAPI, universitiesAPI } from '../services/api';

const AdminDataManagement = () => {
  const [activeTab, setActiveTab] = useState('country');
  const [countries, setCountries] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Country Form State
  const [countryForm, setCountryForm] = useState({ id: '', name: '' });

  // University Form State
  const [univForm, setUnivForm] = useState({
    id: '', Name: '', country_id: '', city: '', type: '', website: '', description: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [cRes, uRes] = await Promise.all([
        countriesAPI.getAll(),
        universitiesAPI.getAll()
      ]);
      setCountries(cRes.data);
      setUniversities(uRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
      setError('Failed to fetch data from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (e) => setCountryForm({ ...countryForm, [e.target.name]: e.target.value });
  const handleUnivChange = (e) => setUnivForm({ ...univForm, [e.target.name]: e.target.value });

  const resetForms = () => {
    setCountryForm({ id: '', name: '' });
    setUnivForm({ id: '', Name: '', country_id: '', city: '', type: '', website: '', description: '' });
    setIsEditing(false);
    setEditId(null);
  };

  const startEditCountry = (c) => {
    setCountryForm({ id: c.id, name: c.name });
    setIsEditing(true);
    setEditId(c.id);
    setActiveTab('country');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditUniv = (u) => {
    setUnivForm({
      id: u.id,
      Name: u.Name,
      country_id: u.country_id,
      city: u.city || '',
      type: u.type || '',
      website: u.website || '',
      description: u.description || ''
    });
    setIsEditing(true);
    setEditId(u.id);
    setActiveTab('university');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCountry = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will also delete ALL universities in this country!`)) return;
    try {
      await countriesAPI.delete(id);
      setMessage('Country deleted successfully.');
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete country.');
    }
  };

  const deleteUniv = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await universitiesAPI.delete(id);
      setMessage('University deleted successfully.');
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete university.');
    }
  };

  const submitCountry = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      if (isEditing) {
        await countriesAPI.update(editId, countryForm);
        setMessage(`Country '${countryForm.name}' updated successfully!`);
      } else {
        await countriesAPI.create(countryForm);
        setMessage(`Country '${countryForm.name}' created successfully!`);
      }
      resetForms();
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process country.');
    }
  };

  const submitUniversity = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      if (isEditing) {
        await universitiesAPI.update(editId, univForm);
        setMessage(`University '${univForm.Name}' updated successfully!`);
      } else {
        await universitiesAPI.create(univForm);
        setMessage(`University '${univForm.Name}' created successfully!`);
      }
      resetForms();
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process university.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-gray-500 hover:text-blue-600 transition">← Back to Panel</Link>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">System Data Management</h1>
        </div>
        {isEditing && (
          <button onClick={resetForms} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors">
            Cancel Editing
          </button>
        )}
      </div>

      {message && <div className="bg-green-50 text-green-700 p-4 rounded-xl font-medium border border-green-100 animate-in fade-in duration-300">{message}</div>}
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl font-medium border border-red-100 animate-in fade-in duration-300">{error}</div>}

      {/* ── Tabs and Form ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => { setActiveTab('country'); setMessage(''); setError(''); }}
            disabled={isEditing && activeTab !== 'country'}
            className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider transition ${activeTab === 'country' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600 disabled:opacity-50'}`}
          >
            {isEditing && activeTab === 'country' ? 'Edit Country' : 'Add Country'}
          </button>
          <button
            onClick={() => { setActiveTab('university'); setMessage(''); setError(''); }}
            disabled={isEditing && activeTab !== 'university'}
            className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider transition ${activeTab === 'university' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600 disabled:opacity-50'}`}
          >
            {isEditing && activeTab === 'university' ? 'Edit University' : 'Add University'}
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'country' ? (
            <form onSubmit={submitCountry} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">ID (Optional)</label>
                  <input type="number" name="id" value={countryForm.id} onChange={handleCountryChange} placeholder="Auto-gen" disabled={isEditing} className="w-full border-gray-200 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all outline-none disabled:bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Name *</label>
                  <input type="text" name="name" value={countryForm.name} onChange={handleCountryChange} required className="w-full border-gray-200 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full md:w-auto bg-blue-600 text-white font-bold px-10 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                {isEditing ? 'Update Country' : 'Save New Country'}
              </button>
            </form>
          ) : (
            <form onSubmit={submitUniversity} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">ID (Optional)</label>
                  <input type="number" name="id" value={univForm.id} onChange={handleUnivChange} placeholder="Auto-gen" disabled={isEditing} className="w-full border-gray-200 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">University Name *</label>
                  <input type="text" name="Name" value={univForm.Name} onChange={handleUnivChange} required className="w-full border-gray-200 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Country *</label>
                  <select name="country_id" value={univForm.country_id} onChange={handleUnivChange} required className="w-full border-gray-200 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Choose Country</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">City</label>
                  <input type="text" name="city" value={univForm.city} onChange={handleUnivChange} className="w-full border-gray-200 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Institution Type</label>
                  <input type="text" name="type" value={univForm.type} onChange={handleUnivChange} className="w-full border-gray-200 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Official Website</label>
                  <input type="url" name="website" value={univForm.website} onChange={handleUnivChange} className="w-full border-gray-200 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea name="description" value={univForm.description} onChange={handleUnivChange} rows="3" className="w-full border-gray-200 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
              </div>
              <button type="submit" className="w-full md:w-auto bg-blue-600 text-white font-bold px-10 py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                {isEditing ? 'Update University' : 'Save New University'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── Table Management Section ────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {activeTab === 'country' ? '🌍 Existing Countries' : '🏫 Existing Universities'}
          <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full uppercase">Database View</span>
        </h2>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              {activeTab === 'country' ? (
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">University Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">City</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              )}
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic">Syncing with database...</td></tr>
              ) : activeTab === 'country' ? (
                countries.length === 0 ? (
                  <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-400">No countries found.</td></tr>
                ) : countries.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-gray-400">{c.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{c.name}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => startEditCountry(c)} className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-wider">Edit</button>
                      <button onClick={() => deleteCountry(c.id, c.name)} className="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                universities.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">No universities found.</td></tr>
                ) : universities.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-400">{u.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{u.Name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.countries?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.city || '—'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => startEditUniv(u)} className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-wider">Edit</button>
                      <button onClick={() => deleteUniv(u.id, u.Name)} className="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDataManagement;
