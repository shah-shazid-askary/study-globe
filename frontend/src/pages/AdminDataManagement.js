import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { countriesAPI, universitiesAPI } from '../services/api';

/* ── Modern SVG icons ──────────────────────────────────────── */
const GlobeIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const BuildingIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);
const PencilIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const BackIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
const DatabaseIcon = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);
const CheckIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ── Shared input/label styles ─────────────────────────────── */
const labelCls = 'block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5';
const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 placeholder:text-gray-300 dark:placeholder:text-gray-600';

const AdminDataManagement = () => {
  const [activeTab, setActiveTab]   = useState('country');
  const [countries, setCountries]   = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [message, setMessage]       = useState('');
  const [error, setError]           = useState('');
  const [isEditing, setIsEditing]   = useState(false);
  const [editId, setEditId]         = useState(null);

  const [countryForm, setCountryForm] = useState({ id: '', name: '' });
  const [univForm, setUnivForm]       = useState({
    id: '', Name: '', country_id: '', city: '', type: '', website: '', description: ''
  });

  useEffect(() => { fetchAllData(); }, []);

  useEffect(() => {
    if (message || error) {
      const t = setTimeout(() => { setMessage(''); setError(''); }, 5000);
      return () => clearTimeout(t);
    }
  }, [message, error]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [cRes, uRes] = await Promise.all([countriesAPI.getAll(), universitiesAPI.getAll()]);
      setCountries(cRes.data);
      setUniversities(uRes.data);
    } catch (err) {
      setError('Failed to fetch data from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (e) => setCountryForm({ ...countryForm, [e.target.name]: e.target.value });
  const handleUnivChange    = (e) => setUnivForm({ ...univForm, [e.target.name]: e.target.value });

  const resetForms = () => {
    setCountryForm({ id: '', name: '' });
    setUnivForm({ id: '', Name: '', country_id: '', city: '', type: '', website: '', description: '' });
    setIsEditing(false);
    setEditId(null);
  };

  const startEditCountry = (c) => {
    setCountryForm({ id: c.id, name: c.name });
    setIsEditing(true); setEditId(c.id); setActiveTab('country');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditUniv = (u) => {
    setUnivForm({ id: u.id, Name: u.Name, country_id: u.country_id, city: u.city || '', type: u.type || '', website: u.website || '', description: u.description || '' });
    setIsEditing(true); setEditId(u.id); setActiveTab('university');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCountry = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This will also delete ALL universities in this country!`)) return;
    try { await countriesAPI.delete(id); setMessage('Country deleted.'); fetchAllData(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to delete country.'); }
  };

  const deleteUniv = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await universitiesAPI.delete(id); setMessage('University deleted.'); fetchAllData(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to delete university.'); }
  };

  const submitCountry = async (e) => {
    e.preventDefault(); setMessage(''); setError('');
    try {
      if (isEditing) { await countriesAPI.update(editId, countryForm); setMessage(`Country "${countryForm.name}" updated!`); }
      else           { await countriesAPI.create(countryForm);          setMessage(`Country "${countryForm.name}" created!`); }
      resetForms(); fetchAllData();
    } catch (err) { setError(err.response?.data?.error || 'Failed to process country.'); }
  };

  const submitUniversity = async (e) => {
    e.preventDefault(); setMessage(''); setError('');
    try {
      if (isEditing) { await universitiesAPI.update(editId, univForm); setMessage(`University "${univForm.Name}" updated!`); }
      else           { await universitiesAPI.create(univForm);          setMessage(`University "${univForm.Name}" created!`); }
      resetForms(); fetchAllData();
    } catch (err) { setError(err.response?.data?.error || 'Failed to process university.'); }
  };

  const tabs = [
    { key: 'country',    label: isEditing && activeTab === 'country'    ? 'Edit Country'    : 'Country',    icon: <GlobeIcon className="w-4 h-4" />,    gradient: 'from-sky-400 to-blue-600' },
    { key: 'university', label: isEditing && activeTab === 'university' ? 'Edit University' : 'University', icon: <BuildingIcon className="w-4 h-4" />, gradient: 'from-violet-500 to-purple-600' },
  ];

  return (
    <div className="space-y-8 pb-20">

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-emerald-900 to-teal-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.15),transparent_60%)]" />
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-center gap-6">
          <Link
            to="/admin"
            className="absolute top-5 right-5 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
          >
            <BackIcon className="w-3.5 h-3.5" /> Back
          </Link>

          <div className="w-16 h-16 shrink-0 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-emerald-300">
            <DatabaseIcon />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white/80 text-xs font-bold uppercase tracking-widest mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {loading ? 'Syncing…' : `${countries.length} Countries · ${universities.length} Universities`}
            </div>
            <h1 className="text-3xl font-black text-white">Data Management</h1>
            <p className="text-emerald-200/70 text-sm mt-1">Add, edit, or remove data from the global database.</p>
          </div>

          {isEditing && (
            <button
              onClick={resetForms}
              className="md:ml-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
            >
              <XIcon className="w-3.5 h-3.5" /> Cancel Editing
            </button>
          )}
        </div>
      </div>

      {/* ── Toast notifications ──────────────────────────────── */}
      {message && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-4 text-sm font-bold">
          <CheckIcon className="w-4 h-4 shrink-0" /> {message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-2xl p-4 text-sm font-bold">
          <XIcon className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Form Card ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">

        {/* Tab bar */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setMessage(''); setError(''); }}
              disabled={isEditing && activeTab !== tab.key}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-gray-800 text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-500'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <span className={activeTab === tab.key ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form body */}
        <div className="p-8">
          {activeTab === 'country' ? (
            <form onSubmit={submitCountry} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>ID (Optional)</label>
                  <input type="number" name="id" value={countryForm.id} onChange={handleCountryChange} placeholder="Auto-generated" disabled={isEditing} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Country Name <span className="text-red-400">*</span></label>
                  <input type="text" name="name" value={countryForm.name} onChange={handleCountryChange} required placeholder="e.g. Germany" className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm">
                  <CheckIcon className="w-4 h-4" />
                  {isEditing ? 'Update Country' : 'Save Country'}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForms} className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold px-6 py-3 rounded-xl transition text-sm">
                    <XIcon className="w-4 h-4" /> Cancel
                  </button>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={submitUniversity} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>ID (Optional)</label>
                  <input type="number" name="id" value={univForm.id} onChange={handleUnivChange} placeholder="Auto-generated" disabled={isEditing} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>University Name <span className="text-red-400">*</span></label>
                  <input type="text" name="Name" value={univForm.Name} onChange={handleUnivChange} required placeholder="e.g. University of Berlin" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Country <span className="text-red-400">*</span></label>
                  <select name="country_id" value={univForm.country_id} onChange={handleUnivChange} required className={inputCls}>
                    <option value="">Choose Country</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input type="text" name="city" value={univForm.city} onChange={handleUnivChange} placeholder="e.g. Berlin" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Institution Type</label>
                  <input type="text" name="type" value={univForm.type} onChange={handleUnivChange} placeholder="e.g. Public / Private" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Official Website</label>
                  <input type="url" name="website" value={univForm.website} onChange={handleUnivChange} placeholder="https://…" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea name="description" value={univForm.description} onChange={handleUnivChange} rows="3" placeholder="Short overview of the institution…" className={inputCls} />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-black px-8 py-3 rounded-xl transition-all shadow-lg shadow-violet-500/20 text-sm">
                  <CheckIcon className="w-4 h-4" />
                  {isEditing ? 'Update University' : 'Save University'}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForms} className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold px-6 py-3 rounded-xl transition text-sm">
                    <XIcon className="w-4 h-4" /> Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── Data Table ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">

        {/* Table header bar */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          {activeTab === 'country'
            ? <GlobeIcon className="w-4 h-4 text-sky-500" />
            : <BuildingIcon className="w-4 h-4 text-violet-500" />
          }
          <h2 className="text-sm font-black text-gray-800 dark:text-white">
            {activeTab === 'country' ? 'Existing Countries' : 'Existing Universities'}
          </h2>
          <span className="ml-1 text-[10px] bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full uppercase font-bold border border-violet-200 dark:border-violet-800/50">
            Database View
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50/60 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">ID</th>
                {activeTab === 'country' ? (
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Name</th>
                ) : (<>
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">University</th>
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">City</th>
                </>)}
                <th className="px-6 py-3 text-right text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 italic text-sm">Syncing with database…</td></tr>
              ) : activeTab === 'country' ? (
                countries.length === 0
                  ? <tr><td colSpan="3" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">No countries found.</td></tr>
                  : countries.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-gray-400 dark:text-gray-500">{c.id}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-100">
                          <GlobeIcon className="w-3.5 h-3.5 text-sky-500 shrink-0" /> {c.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button onClick={() => startEditCountry(c)} className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-xs font-bold px-3 py-1.5 rounded-xl transition-all">
                            <PencilIcon /> Edit
                          </button>
                          <button onClick={() => deleteCountry(c.id, c.name)} className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/30 text-xs font-bold px-3 py-1.5 rounded-xl transition-all">
                            <TrashIcon /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                universities.length === 0
                  ? <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">No universities found.</td></tr>
                  : universities.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-gray-400 dark:text-gray-500">{u.id}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-100">
                          <BuildingIcon className="w-3.5 h-3.5 text-violet-500 shrink-0" /> {u.Name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{u.countries?.name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{u.city || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button onClick={() => startEditUniv(u)} className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-xs font-bold px-3 py-1.5 rounded-xl transition-all">
                            <PencilIcon /> Edit
                          </button>
                          <button onClick={() => deleteUniv(u.id, u.Name)} className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/30 text-xs font-bold px-3 py-1.5 rounded-xl transition-all">
                            <TrashIcon /> Delete
                          </button>
                        </div>
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
