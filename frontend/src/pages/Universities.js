import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { universitiesAPI, profileAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

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

const calculateMatchScore = (uni, profile) => {
  let matchScore = 50;
  if (!profile) return matchScore;
  const targetLevel = profile.current_education_level;
  const hasLevelMatch =
    (uni.type?.toLowerCase()?.includes(targetLevel?.toLowerCase())) ||
    (uni.programs?.some(p =>
      p.degree?.toLowerCase().includes(targetLevel?.toLowerCase()) ||
      p.degree_level?.toLowerCase().includes(targetLevel?.toLowerCase())
    ));
  if (targetLevel && hasLevelMatch) matchScore += 20;
  const preferredCountry = profile.preferred_countries;
  const uniCountry = uni.countries?.name;
  const isCountryMatch = Array.isArray(preferredCountry)
    ? preferredCountry.some(c => c?.toLowerCase() === uniCountry?.toLowerCase())
    : preferredCountry?.toLowerCase() === uniCountry?.toLowerCase();
  if (uniCountry && isCountryMatch) matchScore += 20;
  const cleanNumbers = (str) => {
    if (!str) return [];
    return str.replace(/[^\d]/g, ' ').split(/\s+/).filter(Boolean).map(Number);
  };
  const budgetBounds = cleanNumbers(profile.budget_range);
  const maxBudget = budgetBounds.length > 0 ? Math.max(...budgetBounds) : null;
  const withinBudget = uni.programs?.some(p => {
    const fee = Number(p.tuition_per_year);
    if (!maxBudget || isNaN(fee)) return true;
    return fee <= maxBudget;
  });
  if (maxBudget && (withinBudget || !uni.programs?.length)) matchScore += 10;
  if (matchScore > 100) matchScore = 100;
  return matchScore;
};

const getMatchColor = (score) => {
  if (score >= 80) return { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/50', dot: 'bg-emerald-500' };
  if (score >= 60) return { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/50', dot: 'bg-blue-500' };
  return { bg: 'bg-gray-50 dark:bg-gray-700/30', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700', dot: 'bg-gray-400' };
};

const Universities = () => {
  const { t, lang } = useLanguage();
  const [universities, setUniversities] = useState([]);
  const [profile, setProfile] = useState(null);
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
      const cid = searchParams.get('country_id');
      if (cid) params.country_id = cid;
      const res = await universitiesAPI.getAll(params);
      setUniversities(res.data);
      if (!search?.trim() && !cid) {
        setDbUniversities(res.data.sort((a, b) => a.Name.localeCompare(b.Name)));
      }
    } catch (err) {
      setError('Failed to load universities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities('');
    const loadProfile = async () => {
      try {
        const res = await profileAPI.get();
        setProfile(res.data);
      } catch (err) {}
    };
    loadProfile();
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
    <div className="dark:text-gray-100 space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-700"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.12),transparent_60%)]"></div>
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-8 bottom-0 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-xs font-bold uppercase tracking-widest">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {lang === 'en' ? 'University Explorer' : 'বিশ্ববিদ্যালয় এক্সপ্লোরার'}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                {t('navUniversities')}
              </h1>
              <p className="text-indigo-100/80 text-sm md:text-base max-w-lg">
                {lang === 'en' ? 'Search, compare and discover the best universities worldwide with AI-powered match scoring.' : 'বিশ্বের সেরা বিশ্ববিদ্যালয়গুলো অনুসন্ধান ও তুলনা করুন।'}
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shrink-0">
              <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          {profile && (
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <p className="text-white/80 text-xs">
                {lang === 'en' ? 'Profile loaded — match scores are personalized for you!' : 'প্রোফাইল লোড হয়েছে — ম্যাচ স্কোর আপনার জন্য ব্যক্তিগতকৃত!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex gap-3 items-center shadow-sm">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            ref={inputRef}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl pl-10 pr-10 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
              title="Clear search"
            >×</button>
          )}
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-sm hover:shadow-md"
        >
          {lang === 'en' ? 'Search' : 'খুঁজুন'}
        </button>
      </form>

      {/* Status */}
      {!loading && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400 px-1">
          {appliedSearch
            ? <><strong className="text-gray-700 dark:text-gray-300">{universities.length}</strong> result{universities.length !== 1 ? 's' : ''} for "<span className="text-indigo-600 dark:text-indigo-400">{appliedSearch}</span>"</>
            : <><strong className="text-gray-700 dark:text-gray-300">{universities.length}</strong> {universities.length !== 1 ? 'universities' : 'university'} found</>
          }
        </p>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-xl p-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading universities…</p>
        </div>
      ) : universities.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">No universities found{appliedSearch ? ` for "${appliedSearch}"` : ''}.</p>
          {appliedSearch && (
            <button onClick={handleClear} className="mt-3 text-indigo-600 dark:text-indigo-400 underline text-sm hover:text-indigo-800">
              Clear search and show all
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {universities.map((uni) => {
            const matchScore = calculateMatchScore(uni, profile);
            const matchColor = getMatchColor(matchScore);
            return (
              <Link
                key={uni.id}
                to={`/universities/${uni.id}`}
                className="group block bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-all duration-300"
              >
                <div className="h-1 bg-gradient-to-r from-indigo-400 via-blue-400 to-sky-500 group-hover:h-1.5 transition-all duration-300"></div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {getCountryFlagUrl(uni.countries?.name) ? (
                        <img
                          src={getCountryFlagUrl(uni.countries?.name)}
                          alt={`${uni.countries?.name} flag`}
                          className="w-7 h-5 object-cover rounded-md shadow-sm border border-gray-100 dark:border-gray-600 shrink-0"
                        />
                      ) : (
                        <span className="text-xl shrink-0">🏳️</span>
                      )}
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold truncate">{uni.countries?.name}</span>
                    </div>
                    {profile && (
                      <span className={`inline-flex items-center gap-1.5 ${matchColor.bg} ${matchColor.text} text-[11px] font-black px-2.5 py-1 rounded-full border ${matchColor.border} whitespace-nowrap shrink-0`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${matchColor.dot}`}></span>
                        {matchScore}% Match
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-black text-gray-800 dark:text-white leading-snug mb-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{uni.Name}</h3>
                    <div className="space-y-1">
                      {uni.city && (
                        <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {uni.city}
                        </p>
                      )}
                      {uni.type && (
                        <p className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          </svg>
                          {uni.type}
                        </p>
                      )}
                      {uni.website && (
                        <p className="flex items-center gap-1.5 text-xs text-indigo-500 dark:text-indigo-400 truncate">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span className="truncate">{uni.website}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide group-hover:gap-2 flex items-center gap-1 transition-all">
                      {lang === 'en' ? 'View Details' : 'বিস্তারিত দেখুন'}
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                    {uni.programs?.length > 0 && (
                      <span className="text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
                        {uni.programs.length} programs
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Universities;
