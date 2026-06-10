import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { guidelinesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCountriesQuery } from '../hooks/useAppQueries';

const getCountryFlagUrl = (countryName) => {
  const name = countryName?.toLowerCase()?.trim() || '';
  const codeMap = {
    'argentina': 'ar', 'australia': 'au', 'austria': 'at', 'belgium': 'be',
    'brazil': 'br', 'canada': 'ca', 'chile': 'cl', 'china': 'cn',
    'croatia': 'hr', 'cyprus': 'cy', 'czech republic': 'cz', 'denmark': 'dk',
    'estonia': 'ee', 'finland': 'fi', 'france': 'fr', 'germany': 'de',
    'greece': 'gr', 'hong kong': 'hk', 'hungary': 'hu', 'india': 'in',
    'indonesia': 'id', 'ireland': 'ie', 'italy': 'it', 'japan': 'jp',
    'latvia': 'lv', 'lithuania': 'lt', 'luxembourg': 'lu', 'malaysia': 'my',
    'mexico': 'mx', 'netherlands': 'nl', 'new zealand': 'nz', 'norway': 'no',
    'philippines': 'ph', 'poland': 'pl', 'portugal': 'pt', 'qatar': 'qa',
    'romania': 'ro', 'russia': 'ru', 'saudi arabia': 'sa', 'singapore': 'sg',
    'slovenia': 'si', 'south africa': 'za', 'south korea': 'kr', 'spain': 'es',
    'sweden': 'se', 'switzerland': 'ch', 'taiwan': 'tw', 'thailand': 'th',
    'turkey': 'tr', 'uae': 'ae', 'united arab emirates': 'ae', 'ukraine': 'ua',
    'united kingdom': 'gb', 'uk': 'gb', 'united states': 'us',
    'united states of america': 'us', 'usa': 'us', 'us': 'us', 'vietnam': 'vn'
  };
  const code = codeMap[name];
  return code ? `https://flagcdn.com/w80/${code}.png` : null;
};

const Countries = () => {
  const { isAdmin } = useAuth();
  const { t, lang } = useLanguage();
  const { data: allCountries = [], isLoading: loading, isError } = useCountriesQuery();
  const [searchText, setSearchText] = useState('');
  const error = isError ? 'Failed to load countries. Please try again.' : '';
  const inputRef = useRef(null);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [guidelines, setGuidelines] = useState(null);
  const [loadingGuidelines, setLoadingGuidelines] = useState(false);
  const [activeTab, setActiveTab] = useState('visa');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ visa_rules: '', work_permit_rules: '', living_costs: '', general_requirements: '' });

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

  const tabs = [
    { key: 'visa', label: t('guideVisa'), icon: '🛂', color: 'from-blue-500 to-cyan-500' },
    { key: 'work', label: t('guideWork'), icon: '💼', color: 'from-violet-500 to-purple-600' },
    { key: 'costs', label: t('guideCost'), icon: '💰', color: 'from-emerald-500 to-teal-600' },
    { key: 'general', label: t('guideGeneral'), icon: '📋', color: 'from-orange-500 to-amber-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin"></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading destinations…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:text-gray-100 space-y-6 relative">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]"></div>
        {/* Decorative blobs */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-8 bottom-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-xs font-bold uppercase tracking-widest">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"/>
                </svg>
                {lang === 'en' ? 'Study Abroad' : 'বিদেশে পড়াশোনা'}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                {lang === 'en' ? 'Explore Study Destinations' : 'উচ্চশিক্ষার গন্তব্যসমূহ'}
              </h1>
              <p className="text-emerald-100/80 text-sm md:text-base max-w-lg">
                {lang === 'en' ? 'Browse countries, unlock visa guidelines, and discover your next academic adventure.' : 'দেশ ব্রাউজ করুন, ভিসা নির্দেশিকা জানুন, এবং আপনার পরবর্তী একাডেমিক অ্যাডভেঞ্চার খুঁজুন।'}
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shrink-0">
              <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-black text-white">{allCountries.length}</div>
              <div className="text-emerald-200/80 text-xs">{lang === 'en' ? 'Countries' : 'দেশ'}</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">4</div>
              <div className="text-emerald-200/80 text-xs">{lang === 'en' ? 'Guideline Areas' : 'নির্দেশিকা বিভাগ'}</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">∞</div>
              <div className="text-emerald-200/80 text-xs">{lang === 'en' ? 'Opportunities' : 'সুযোগ'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            ref={inputRef}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-900 rounded-xl pl-10 pr-10 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white text-xl leading-none"
              title="Clear"
            >×</button>
          )}
        </div>
        {!error && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 pl-1">
            {searchText.trim()
              ? <><strong className="text-gray-600 dark:text-gray-300">{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''} for "<span className="text-emerald-600 dark:text-emerald-400">{searchText.trim()}</span>"</>
              : <><strong className="text-gray-600 dark:text-gray-300">{allCountries.length}</strong> countr{allCountries.length !== 1 ? 'ies' : 'y'} available</>
            }
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-200 dark:border-red-800 rounded-xl p-4">
          {error}
        </div>
      )}

      {/* Countries Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg font-semibold">No countries found{searchText.trim() ? ` for "${searchText.trim()}"` : ''}.</p>
          {searchText && (
            <button onClick={handleClear} className="mt-3 text-emerald-600 underline text-sm hover:text-emerald-800">
              Clear search and show all
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((country) => (
            <div
              key={country.id}
              className="group relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-all duration-300 flex flex-col"
            >
              {/* Top accent */}
              <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 group-hover:h-1.5 transition-all duration-300"></div>

              <div className="p-6 flex flex-col flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    {getCountryFlagUrl(country.name) ? (
                      <img
                        src={getCountryFlagUrl(country.name)}
                        alt={`${country.name} flag`}
                        className="w-14 h-10 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-600 group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-14 h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center text-xl">🌍</div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-800 dark:text-white leading-tight">{country.name}</h3>
                    {country.code && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">{country.code}</span>
                    )}
                  </div>
                </div>

                {country.description && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">{country.description}</p>
                )}

                <div className="flex flex-col gap-2.5 pt-2 mt-auto">
                  <Link
                    to={`/universities?country_id=${country.id}`}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all text-center flex items-center justify-center gap-2 shadow-sm hover:shadow-md group/btn"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    {lang === 'en' ? 'Explore Universities' : 'বিশ্ববিদ্যালয় দেখুন'}
                  </Link>
                  <button
                    onClick={() => handleOpenGuidelines(country)}
                    className="w-full border-2 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-bold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {lang === 'en' ? 'Visa & Work Guidelines' : 'ভিসা ও কাজের নির্দেশিকা'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guidelines Modal */}
      {selectedCountry && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-gray-700">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-4 relative z-10">
                {getCountryFlagUrl(selectedCountry.name) ? (
                  <img
                    src={getCountryFlagUrl(selectedCountry.name)}
                    alt={`${selectedCountry.name} flag`}
                    className="w-12 h-8 object-cover rounded-lg shadow-lg border-2 border-white/30"
                  />
                ) : (
                  <span className="text-3xl">🌍</span>
                )}
                <div>
                  <h2 className="text-xl md:text-2xl font-black">{selectedCountry.name}</h2>
                  <p className="text-xs text-white/70">{lang === 'en' ? 'Official guidelines for international applicants' : 'আন্তর্জাতিক শিক্ষার্থীদের জন্য অফিসিয়াল গাইড'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCountry(null)}
                className="relative z-10 w-9 h-9 flex items-center justify-center bg-white/15 hover:bg-white/25 rounded-xl text-white font-bold text-lg transition"
              >×</button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {loadingGuidelines ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-medium">{t('btnLoading')}</p>
                </div>
              ) : isEditing ? (
                <form onSubmit={handleSaveGuidelines} className="space-y-4">
                  {[
                    { key: 'visa_rules', label: t('guideVisa') },
                    { key: 'work_permit_rules', label: t('guideWork') },
                    { key: 'living_costs', label: t('guideCost') },
                    { key: 'general_requirements', label: t('guideGeneral') },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
                      <textarea
                        value={editForm[key]}
                        onChange={(e) => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                        rows="4"
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  ))}
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      {t('btnCancel')}
                    </button>
                    <button type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition">
                      {t('btnSave')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  {/* Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {tabs.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-bold ${
                          activeTab === tab.key
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                            : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <span className="text-xl">{tab.icon}</span>
                        <span className="text-xs leading-tight text-center">{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 min-h-[160px]">
                    {tabs.map(tab => (
                      activeTab === tab.key && (
                        <div key={tab.key} className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300 animate-fadeIn">
                          {guidelines?.[
                            tab.key === 'visa' ? 'visa_rules' :
                            tab.key === 'work' ? 'work_permit_rules' :
                            tab.key === 'costs' ? 'living_costs' : 'general_requirements'
                          ] || (
                            <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                              <span className="text-3xl opacity-40">{tab.icon}</span>
                              <p className="text-gray-400 dark:text-gray-500 italic">
                                {lang === 'en' ? 'No information added for this section yet.' : 'এই বিভাগে এখনও তথ্য যোগ করা হয়নি।'}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
              {isAdmin && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {lang === 'en' ? 'Edit Guidelines' : 'নির্দেশিকা পরিবর্তন'}
                </button>
              )}
              <div className="flex-1 text-right">
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all active:scale-95"
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
