import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { countriesAPI, guidelinesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Countries = () => {
  const { isAdmin } = useAuth();
  const { t, lang } = useLanguage();
  
  const [allCountries, setAllCountries] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Guidelines Modal State
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [guidelines, setGuidelines] = useState(null);
  const [loadingGuidelines, setLoadingGuidelines] = useState(false);
  const [activeTab, setActiveTab] = useState('visa'); // 'visa', 'work', 'costs', 'general'
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ visa_rules: '', work_permit_rules: '', living_costs: '', general_requirements: '' });

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await countriesAPI.getAll();
        setAllCountries(res.data);
      } catch (err) {
        setError('Failed to load countries. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  const handleOpenGuidelines = async (country) => {
    setSelectedCountry(country);
    setLoadingGuidelines(true);
    setActiveTab('visa');
    setIsEditing(false);
    
    try {
      const res = await guidelinesAPI.get(country.id);
      setGuidelines(res.data);
      setEditForm({
        visa_rules: res.data.visa_rules || '',
        work_permit_rules: res.data.work_permit_rules || '',
        living_costs: res.data.living_costs || '',
        general_requirements: res.data.general_requirements || ''
      });
    } catch (err) {
      console.error('Failed to load guidelines:', err);
    } finally {
      setLoadingGuidelines(false);
    }
  };

  const handleSaveGuidelines = async (e) => {
    e.preventDefault();
    if (!selectedCountry) return;

    try {
      const res = await guidelinesAPI.update(selectedCountry.id, editForm);
      setGuidelines(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save guidelines:', err);
    }
  };

  const handleClear = () => {
    setSearchText('');
    inputRef.current?.focus();
  };

  const filtered = allCountries.filter((c) =>
    c.name?.toLowerCase().includes(searchText.toLowerCase().trim())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="dark:text-gray-100 relative">
      {/* ── Premium Gradient Hero Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-6 mb-6 shadow-lg">
        <div className="absolute -right-6 -top-6 text-8xl opacity-10 select-none pointer-events-none">🌍</div>
        <div className="absolute -right-2 bottom-0 text-6xl opacity-10 select-none pointer-events-none">✈️</div>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-1 relative z-10">
          {lang === 'en' ? '🌍 Study Destinations' : '🌍 উচ্চশিক্ষার গন্তব্যসমূহ'}
        </h1>
        <p className="text-emerald-100/90 text-sm relative z-10">
          {lang === 'en' ? 'Browse and search countries where you can study abroad' : 'বিদেশে পড়াশোনা করার জন্য দেশসমূহ ব্রাউজ এবং অনুসন্ধান করুন'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            🔍
          </span>
          <select
            ref={inputRef}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg pl-9 pr-16 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          >
            <option value="">{lang === 'en' ? 'Search by country name…' : 'দেশ নির্বাচন করুন…'}</option>
            {allCountries.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          {searchText && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white text-xl leading-none"
              title="Clear"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      {!error && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {searchText.trim()
            ? <>Showing <strong>{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''} for "<span className="text-blue-600 dark:text-blue-400">{searchText.trim()}</span>"</>
            : <><strong>{allCountries.length}</strong> countr{allCountries.length !== 1 ? 'ies' : 'y'} available</>
          }
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌐</div>
          <p className="text-gray-500 text-lg">
            No countries found{searchText.trim() ? ` for "${searchText.trim()}"` : ''}.
          </p>
          {searchText && (
            <button
              onClick={handleClear}
              className="mt-3 text-blue-600 underline text-sm hover:text-blue-800"
            >
              Clear search and show all
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((country) => (
            <div
              key={country.id}
              className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏳️</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">{country.name}</h3>
                    {country.code && (
                      <span className="text-xs text-gray-400 uppercase tracking-wider">{country.code}</span>
                    )}
                  </div>
                </div>
                {country.description && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm line-clamp-3">{country.description}</p>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-5 mt-4 border-t border-gray-50 dark:border-gray-700">
                <Link
                  to={`/universities?country_id=${country.id}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs md:text-sm transition-all text-center"
                >
                  🎓 {lang === 'en' ? 'Explore Universities' : 'বিশ্ববিদ্যালয় দেখুন'}
                </Link>
                <button
                  onClick={() => handleOpenGuidelines(country)}
                  className="w-full border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 font-bold py-2 px-4 rounded-xl text-xs md:text-sm transition-all"
                >
                  🛂 {lang === 'en' ? 'Visa & Work Guidelines' : 'ভিসা ও কাজের নির্দেশিকা'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── DYNAMIC COUNTRY GUIDELINES MODAL (Overlay) ────────────── */}
      {selectedCountry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-gray-700">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏳️</span>
                <div>
                  <h2 className="text-xl md:text-2xl font-black">{selectedCountry.name} - {t('guideTitle')}</h2>
                  <p className="text-xs opacity-75">{lang === 'en' ? 'Official guidelines for international applicants' : 'আন্তর্জাতিক শিক্ষার্থীদের জন্য অফিসিয়াল গাইড'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCountry(null)}
                className="text-white hover:text-blue-100 font-bold text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {loadingGuidelines ? (
                <p className="text-gray-500 text-center py-10">{t('btnLoading')}</p>
              ) : isEditing ? (
                /* Admin Editing Form */
                <form onSubmit={handleSaveGuidelines} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('guideVisa')}</label>
                    <textarea
                      value={editForm.visa_rules}
                      onChange={(e) => setEditForm(prev => ({ ...prev, visa_rules: e.target.value }))}
                      rows="4"
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('guideWork')}</label>
                    <textarea
                      value={editForm.work_permit_rules}
                      onChange={(e) => setEditForm(prev => ({ ...prev, work_permit_rules: e.target.value }))}
                      rows="4"
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('guideCost')}</label>
                    <textarea
                      value={editForm.living_costs}
                      onChange={(e) => setEditForm(prev => ({ ...prev, living_costs: e.target.value }))}
                      rows="4"
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('guideGeneral')}</label>
                    <textarea
                      value={editForm.general_requirements}
                      onChange={(e) => setEditForm(prev => ({ ...prev, general_requirements: e.target.value }))}
                      rows="4"
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl p-3 text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                    >
                      {t('btnCancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                    >
                      {t('btnSave')}
                    </button>
                  </div>
                </form>
              ) : (
                /* Tab Panels Display */
                <div className="space-y-6">
                  {/* Tab Navigation */}
                  <div className="flex border-b border-gray-100 dark:border-gray-700 gap-2 overflow-x-auto pb-1">
                    {[
                      { key: 'visa', label: t('guideVisa') },
                      { key: 'work', label: t('guideWork') },
                      { key: 'costs', label: t('guideCost') },
                      { key: 'general', label: t('guideGeneral') }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`whitespace-nowrap px-4 py-2 text-xs md:text-sm font-bold border-b-2 transition-all ${
                          activeTab === tab.key
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Panel Content */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl min-h-[150px] border border-gray-50 dark:border-gray-700">
                    {activeTab === 'visa' && (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {guidelines?.visa_rules || (lang === 'en' ? 'Visa requirements have not been set for this country yet.' : 'এই দেশের জন্য ভিসার নির্দেশিকা এখনও সেট করা হয়নি।')}
                      </div>
                    )}
                    {activeTab === 'work' && (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {guidelines?.work_permit_rules || (lang === 'en' ? 'Work permit rules have not been set for this country yet.' : 'এই দেশের জন্য কাজের অনুমতির নিয়মাবলী এখনও সেট করা হয়নি।')}
                      </div>
                    )}
                    {activeTab === 'costs' && (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {guidelines?.living_costs || (lang === 'en' ? 'Estimated living cost details have not been set for this country yet.' : 'জীবনযাত্রার আনুমানিক খরচের বিবরণী এখনও সেট করা হয়নি।')}
                      </div>
                    )}
                    {activeTab === 'general' && (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {guidelines?.general_requirements || (lang === 'en' ? 'General requirements have not been set for this country yet.' : 'সাধারণ প্রয়োজনীয় তথ্যসমূহ এখনও সেট করা হয়নি।')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
              {isAdmin && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs md:text-sm transition-all"
                >
                  ✏️ {lang === 'en' ? 'Edit Guidelines' : 'নির্দেশিকা পরিবর্তন'}
                </button>
              )}
              <div className="flex-1 text-right">
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl text-xs md:text-sm transition-all active:scale-95"
                >
                  {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Countries;
