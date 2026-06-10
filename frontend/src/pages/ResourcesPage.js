import React, { useState, useEffect } from 'react';
import { resourcesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const CategoryIcon = ({ type, className = 'w-4 h-4' }) => {
  const icons = {
    All: (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>),
    'IELTS Academic': (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>),
    'IELTS General': (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
    'TOEFL Preparation': (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>),
    'Visa Templates': (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>),
  };
  return icons[type] || icons.All;
};

const CATEGORY_META = {
  'All':               { color: 'from-gray-500 to-slate-600', bg: 'bg-gray-50 dark:bg-gray-700/30', text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-600' },
  'IELTS Academic':    { color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/50' },
  'IELTS General':     { color: 'from-sky-500 to-cyan-600', bg: 'bg-sky-50 dark:bg-sky-950/30', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800/50' },
  'TOEFL Preparation': { color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800/50' },
  'Visa Templates':    { color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/50' },
};

const ResourcesPage = () => {
  const { t, lang } = useLanguage();
  const { isAdmin } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePreviewUrl, setActivePreviewUrl] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const defaultResourceState = { category: 'IELTS Academic', title: '', description: '', external_url: '', file_path: '' };
  const [newResource, setNewResource] = useState(defaultResourceState);

  const categories = ['All', 'IELTS Academic', 'IELTS General', 'TOEFL Preparation', 'Visa Templates'];

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await resourcesAPI.getAll();
      setResources(res.data);
    } catch (err) {
      console.error('Failed to retrieve resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const [saveError, setSaveError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!newResource.title.trim() || !newResource.category) return;
    setSaveError('');
    setSaveLoading(true);
    try {
      if (editingResource) {
        await resourcesAPI.update(editingResource.id, newResource);
      } else {
        await resourcesAPI.create(newResource);
      }
      setNewResource(defaultResourceState);
      setEditingResource(null);
      setShowAddForm(false);
      fetchResources();
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      if (status === 401) {
        setSaveError('Session expired. Please log out and log in again.');
      } else if (status === 403) {
        setSaveError('Admin permission required. Make sure your account has admin role.');
      } else {
        setSaveError(`Failed to save: ${msg}`);
      }
      console.error('Failed to save resource:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEditClick = (res) => {
    setEditingResource(res);
    setNewResource({
      category: res.category || 'IELTS Academic',
      title: res.title || '',
      description: res.description || '',
      external_url: res.external_url || '',
      file_path: res.file_path || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm(lang === 'en' ? 'Are you sure you want to delete this resource?' : 'আপনি কি নিশ্চিত যে আপনি এই রিসোর্সটি মুছে ফেলতে চান?')) return;
    try {
      await resourcesAPI.delete(id);
      fetchResources();
    } catch (err) {
      console.error('Failed to delete resource:', err);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      let embed = url;
      if (embed.includes('/view')) embed = embed.split('/view')[0] + '/preview';
      else if (embed.includes('/edit')) embed = embed.split('/edit')[0] + '/preview';
      return embed;
    }
    return url;
  };

  const filteredResources = selectedCategory === 'All'
    ? resources
    : resources.filter(res => res.category === selectedCategory);

  return (
    <div className="space-y-6 dark:text-gray-100">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]"></div>
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-8 bottom-0 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-xs font-bold uppercase tracking-widest">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {lang === 'en' ? 'Prep Library' : 'প্রস্তুতি লাইব্রেরি'}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{t('resourceTitle')}</h1>
              <p className="text-blue-100/80 text-sm md:text-base max-w-xl">{t('resourceSubtitle')}</p>
            </div>
            <div className="hidden md:flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shrink-0">
              <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>

          {/* Category quick stats */}
          <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/20">
            {categories.slice(1).map(cat => {
              const count = resources.filter(r => r.category === cat).length;
              return (
                <div key={cat} className="text-center">
                  <div className="text-xl font-black text-white">{count}</div>
                  <div className="text-blue-200/70 flex justify-center mt-0.5">
                    <CategoryIcon type={cat} className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const meta = CATEGORY_META[cat];
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${meta.color} text-white shadow-md scale-105`
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:scale-105'
                }`}
              >
                <CategoryIcon type={cat} className="w-4 h-4" />
                {cat === 'All' ? t('resourceAll') : cat}
                {cat === 'All' && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                    {resources.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
                setEditingResource(null);
                setNewResource(defaultResourceState);
              } else {
                setShowAddForm(true);
                setEditingResource(null);
                setNewResource(defaultResourceState);
              }
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2 px-5 rounded-xl text-sm transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={showAddForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
            </svg>
            {showAddForm ? t('btnCancel') : `${t('btnAdd')} Resource`}
          </button>
        )}
      </div>

      {/* Admin Add Form */}
      {isAdmin && showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-indigo-200 dark:border-indigo-800/50 space-y-4">
          <h3 className="font-black text-lg text-gray-800 dark:text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              {editingResource ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </span>
            {editingResource ? 'Edit Study Resource' : 'Upload New Study Resource'}
          </h3>
          <form onSubmit={handleCreateResource} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">{t('resourceCategory')}</label>
                <select
                  value={newResource.category}
                  onChange={(e) => setNewResource(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Resource Title</label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., IELTS Writing Task 2 Checklist"
                  required
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea
                value={newResource.description}
                onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide context or key tips..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">External URL (Optional)</label>
                <input type="url" value={newResource.external_url} onChange={(e) => setNewResource(prev => ({ ...prev, external_url: e.target.value }))} placeholder="https://ielts.org/..." className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Google Drive Link (Optional)</label>
                <input type="text" value={newResource.file_path} onChange={(e) => setNewResource(prev => ({ ...prev, file_path: e.target.value }))} placeholder="https://drive.google.com/..." className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
            {saveError && (
              <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl p-3 text-sm font-medium">
                ⚠️ {saveError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingResource(null);
                  setNewResource(defaultResourceState);
                  setSaveError('');
                }} 
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {t('btnCancel')}
              </button>
              <button type="submit" disabled={saveLoading} className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition">
                {saveLoading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>}
                {editingResource ? 'Update' : t('btnSave')}
              </button>
            </div>
          </form>
        </div>
      )}


      {/* Resources Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">{t('btnLoading')}</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-indigo-400 dark:text-indigo-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-semibold">{lang === 'en' ? 'No resources in this category yet.' : 'এই বিভাগে এখনও কোনো রিসোর্স যোগ করা হয়নি।'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map(res => {
            const displayUrl = res.external_url || res.file_path;
            const isGoogleDrive = displayUrl && displayUrl.includes('drive.google.com');
            const meta = CATEGORY_META[res.category] || CATEGORY_META['All'];

            return (
              <div
                key={res.id}
                className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className={`h-1 bg-gradient-to-r ${meta.color} group-hover:h-1.5 transition-all duration-300`}></div>

                <div className="p-6 flex flex-col flex-1 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} ${meta.text} border ${meta.border}`}>
                      <CategoryIcon type={res.category} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className={`text-[11px] font-black uppercase tracking-wider ${meta.text}`}>{res.category}</span>
                      <h3 className="font-extrabold text-gray-800 dark:text-white text-sm leading-snug mt-0.5">{res.title}</h3>
                    </div>
                  </div>

                  {res.description && (
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">{res.description}</p>
                  )}

                  <div className="space-y-2 pt-2 border-t border-gray-50 dark:border-gray-700 mt-auto">
                    {isGoogleDrive && (
                      <button
                        onClick={() => setActivePreviewUrl(getEmbedUrl(displayUrl))}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {lang === 'en' ? 'Read In-App' : 'অ্যাপের ভেতরে পড়ুন'}
                      </button>
                    )}
                    {res.external_url && (
                      <a
                        href={res.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 active:scale-95 ${
                          isGoogleDrive
                            ? `border-2 ${meta.border} ${meta.text} hover:opacity-80`
                            : `bg-gradient-to-r ${meta.color} text-white shadow-sm hover:shadow-md`
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {t('resourceExternalLink')}
                      </a>
                    )}
                    {res.file_path && !isGoogleDrive && (
                      <a
                        href={res.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full border-2 ${meta.border} ${meta.text} hover:opacity-80 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 active:scale-95`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {t('resourceDownload')}
                      </a>
                    )}
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(res)}
                          className="flex-1 border border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 font-bold py-2 px-4 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteResource(res.id)}
                          className="flex-1 border border-red-200 dark:border-red-800/40 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold py-2 px-4 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {t('btnDelete')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PDF Preview Modal */}
      {activePreviewUrl && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-5xl w-full h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-blue-700 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-black">{lang === 'en' ? 'StudyGuide Reader' : 'স্টাডি গাইড রিডার'}</h2>
                  <p className="text-[10px] opacity-75">{lang === 'en' ? 'Integrated Material Viewer' : 'ইন-অ্যাপ ফাইল রিডার'}</p>
                </div>
              </div>
              <button
                onClick={() => setActivePreviewUrl(null)}
                className="w-9 h-9 flex items-center justify-center bg-white/15 hover:bg-white/25 rounded-xl text-white font-bold text-lg transition"
              >×</button>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-hidden">
              <iframe src={activePreviewUrl} width="100%" height="100%" title="In-App Document Preview" allow="autoplay" className="border-none" />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-700 flex justify-end shrink-0">
              <button
                onClick={() => setActivePreviewUrl(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all active:scale-95"
              >
                {lang === 'en' ? 'Close Reader' : 'রিডার বন্ধ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
