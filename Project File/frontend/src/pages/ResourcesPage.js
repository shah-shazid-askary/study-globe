import React, { useState, useEffect } from 'react';
import { resourcesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ResourcesPage = () => {
  const { t, lang } = useLanguage();
  const { isAdmin } = useAuth();
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePreviewUrl, setActivePreviewUrl] = useState(null);
  
  // Admin form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({ category: 'IELTS Academic', title: '', description: '', external_url: '', file_path: '' });
  
  const categories = ['All', 'IELTS Academic', 'IELTS General', 'TOEFL Preparation', 'Visa Templates'];

  useEffect(() => {
    fetchResources();
  }, []);

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

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!newResource.title.trim() || !newResource.category) return;

    try {
      await resourcesAPI.create(newResource);
      setNewResource({ category: 'IELTS Academic', title: '', description: '', external_url: '', file_path: '' });
      setShowAddForm(false);
      fetchResources();
    } catch (err) {
      console.error('Failed to create resource:', err);
    }
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
      if (embed.includes('/view')) {
        embed = embed.split('/view')[0] + '/preview';
      } else if (embed.includes('/edit')) {
        embed = embed.split('/edit')[0] + '/preview';
      }
      return embed;
    }
    return url;
  };

  const filteredResources = selectedCategory === 'All'
    ? resources
    : resources.filter(res => res.category === selectedCategory);

  return (
    <div className="space-y-8 dark:text-gray-100 relative">
      
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <span className="bg-rose-700/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            {lang === 'en' ? 'Prep Library' : 'প্রস্তুতি লাইব্রেরি'}
          </span>
          <h1 className="text-3xl font-black">{t('resourceTitle')}</h1>
          <p className="opacity-90 max-w-xl text-sm md:text-base">{t('resourceSubtitle')}</p>
        </div>
        <div className="absolute right-0 bottom-0 text-9xl opacity-10 font-bold select-none pointer-events-none translate-y-6 translate-x-6">
          📚
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white shadow-sm scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
              }`}
            >
              {cat === 'All' ? t('resourceAll') : cat}
            </button>
          ))}
        </div>

        {/* Admin action button */}
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(prev => !prev)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-sm self-start sm:self-center transition-all active:scale-95"
          >
            {showAddForm ? t('btnCancel') : `+ ${t('btnAdd')} Resource`}
          </button>
        )}
      </div>

      {/* Admin Add Form Card */}
      {isAdmin && showAddForm && (
        <form onSubmit={handleCreateResource} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4 max-w-2xl">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Upload New Study Resource</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t('resourceCategory')}</label>
              <select
                value={newResource.category}
                onChange={(e) => setNewResource(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-900"
              >
                <option value="IELTS Academic">IELTS Academic</option>
                <option value="IELTS General">IELTS General</option>
                <option value="TOEFL Preparation">TOEFL Preparation</option>
                <option value="Visa Templates">Visa Templates</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Resource Title</label>
              <input
                type="text"
                value={newResource.title}
                onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., IELTS Writing Task 2 Checklist"
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
            <textarea
              value={newResource.description}
              onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide context or key tips in this file..."
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-900"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">External Resource URL (Optional)</label>
              <input
                type="url"
                value={newResource.external_url}
                onChange={(e) => setNewResource(prev => ({ ...prev, external_url: e.target.value }))}
                placeholder="https://ielts.org/..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Direct Download Link (Optional)</label>
              <input
                type="text"
                value={newResource.file_path}
                onChange={(e) => setNewResource(prev => ({ ...prev, file_path: e.target.value }))}
                placeholder="https://drive.google.com/..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              {t('btnSave')}
            </button>
          </div>
        </form>
      )}

      {/* Resources Cards Grid */}
      {loading ? (
        <p className="text-gray-500 text-center py-6">{t('btnLoading')}</p>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
          <span className="text-5xl">📚</span>
          <p className="text-gray-500 text-sm mt-3">{lang === 'en' ? 'No resources added in this category yet.' : 'এই বিভাগে এখনও কোনো রিসোর্স যোগ করা হয়নি।'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(res => {
            const displayUrl = res.external_url || res.file_path;
            const isGoogleDrive = displayUrl && displayUrl.includes('drive.google.com');

            return (
              <div
                key={res.id}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <span className="inline-block bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {res.category}
                  </span>
                  <h3 className="font-extrabold text-lg text-gray-800 dark:text-white leading-snug">{res.title}</h3>
                  {res.description && (
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{res.description}</p>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                  {isGoogleDrive && (
                    <button
                      onClick={() => setActivePreviewUrl(getEmbedUrl(displayUrl))}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    >
                      📖 {lang === 'en' ? 'Read In-App' : 'অ্যাপের ভেতরে পড়ুন'}
                    </button>
                  )}
                  {res.external_url && (
                    <a
                      href={res.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full font-bold py-2 px-4 rounded-xl text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                        isGoogleDrive 
                          ? 'border border-rose-500 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20' 
                          : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                      }`}
                    >
                      🔗 {t('resourceExternalLink')}
                    </a>
                  )}
                  {res.file_path && !isGoogleDrive && (
                    <a
                      href={res.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full border border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold py-2 px-4 rounded-xl text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      📥 {t('resourceDownload')}
                    </a>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteResource(res.id)}
                      className="w-full border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold py-1.5 px-4 rounded-xl text-xs transition-all active:scale-95"
                    >
                      🗑️ {t('btnDelete')} Resource
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── DYNAMIC PDF IN-APP VIEW MODAL ───────────────────────── */}
      {activePreviewUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-5xl w-full h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-gray-700">
            
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-rose-700 to-pink-700 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📖</span>
                <div>
                  <h2 className="text-lg font-black">{lang === 'en' ? 'StudyGuide Reader' : 'স্টাডি গাইড রিডার'}</h2>
                  <p className="text-[10px] opacity-75">{lang === 'en' ? 'Integrated Centralized Material Viewer' : 'ইন-অ্যাপ কেন্দ্রীভূত ফাইল রিডার'}</p>
                </div>
              </div>
              <button
                onClick={() => setActivePreviewUrl(null)}
                className="text-white hover:text-rose-100 font-bold text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content - Google Drive Iframe Preview */}
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-hidden">
              <iframe
                src={activePreviewUrl}
                width="100%"
                height="100%"
                title="In-App Document Preview"
                allow="autoplay"
                className="border-none"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-700 flex justify-end shrink-0">
              <button
                onClick={() => setActivePreviewUrl(null)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-6 rounded-xl text-xs md:text-sm transition-all active:scale-95"
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
