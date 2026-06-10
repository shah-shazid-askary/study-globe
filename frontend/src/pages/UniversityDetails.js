import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { universitiesAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useProfile } from '../context/ProfileContext';

// FIX: Added tabs for Intake (FR-07), Language (FR-08), Scholarships (FR-09) — all were missing
const TABS = [
  { key: 'Overview', label: '🏛 Overview' },
  { key: 'Programs', label: '📚 Programs' },
  { key: 'Intake', label: '📅 Intake' },
  { key: 'Language', label: '📝 Language' },
  { key: 'Scholarships', label: '🎁 Scholarships' },
];

const UniversityDetails = () => {
  const { id } = useParams();
  const { lang } = useLanguage();
  const { profile } = useProfile();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const uniRes = await universitiesAPI.getById(id);
        setUniversity(uniRes.data);
      } catch (err) {
        setError('University not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-lg p-4">{error}</div>;
  if (!university) return null;

  // Calculate Match Score Compatibility
  let matchScore = 50; // Starting baseline
  let checks = {
    level: false,
    country: false,
    budget: false
  };

  if (profile) {
    // 1. Target level match
    const targetLevel = profile.current_education_level; // e.g. "Bachelor" or "Masters"
    const hasProgramsOfLevel = university.programs?.some(p => 
      p.degree?.toLowerCase().includes(targetLevel?.toLowerCase()) ||
      p.degree_level?.toLowerCase().includes(targetLevel?.toLowerCase())
    );
    if (targetLevel && hasProgramsOfLevel) {
      matchScore += 20;
      checks.level = true;
    }

    // 2. Preferred country match
    const preferredCountry = profile.preferred_countries; // e.g., ["Canada"]
    const uniCountry = university.countries?.name;
    const isCountryMatch = Array.isArray(preferredCountry) 
      ? preferredCountry.some(c => c?.toLowerCase() === uniCountry?.toLowerCase())
      : preferredCountry?.toLowerCase() === uniCountry?.toLowerCase();
    
    if (uniCountry && isCountryMatch) {
      matchScore += 20;
      checks.country = true;
    }

    // 3. Tuition Budget match
    // Check if any program matches tuition target
    // profile.budget_range e.g. "$10,000–$20,000/yr" -> extract numbers
    const cleanNumbers = (str) => {
      if (!str) return [];
      return str.replace(/[^\d]/g, ' ').split(/\s+/).filter(Boolean).map(Number);
    };
    const budgetBounds = cleanNumbers(profile.budget_range);
    const maxBudget = budgetBounds.length > 0 ? Math.max(...budgetBounds) : null;
    
    const withinBudget = university.programs?.some(p => {
      const fee = Number(p.tuition_per_year);
      if (!maxBudget || isNaN(fee)) return true;
      return fee <= maxBudget;
    });

    if (maxBudget && withinBudget) {
      matchScore += 10;
      checks.budget = true;
    }
  }

  // Clamp score
  if (matchScore > 100) matchScore = 100;

  return (
    <div className="space-y-6">
      <Link to="/universities" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4 inline-block font-bold">
        ← {lang === 'en' ? 'Back to Universities' : 'বিশ্ববিদ্যালয় তালিকায় ফিরুন'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-1">{university.Name}</h1>
            <p className="text-blue-600 dark:text-blue-400 font-extrabold text-lg">{university.countries?.name}</p>
            {university.city && <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">📍 {university.city}</p>}
            {university.type && <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">🎓 {university.type}</p>}
          </div>
          {university.website && (
            <a 
              href={university.website.trim().startsWith('http') ? university.website.trim() : `https://${university.website.trim()}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline mt-4 inline-block"
            >
              🌐 {university.website.trim()}
            </a>
          )}
        </div>

        {/* Smart Match Score Panel */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg uppercase tracking-wider text-blue-100">
              {lang === 'en' ? 'AI Smart Match Score' : 'এআই স্মার্ট ম্যাচ স্কোর'}
            </h3>
            <p className="text-xs opacity-90 leading-relaxed">
              {lang === 'en' ? 'Calculated based on your active student profile metrics.' : 'আপনার সেভ করা প্রোফাইলের তথ্যের সাথে সামঞ্জস্যতা।'}
            </p>
          </div>

          <div className="my-4 text-center">
            <span className="text-5xl font-black">{matchScore}%</span>
            <p className="text-xs text-blue-100 uppercase tracking-widest font-extrabold mt-1">
              {matchScore >= 80 ? (lang === 'en' ? 'High Compatibility' : 'উচ্চ সামঞ্জস্যপূর্ণ') :
               matchScore >= 60 ? (lang === 'en' ? 'Medium Match' : 'মাঝারি সামঞ্জস্যপূর্ণ') :
               (lang === 'en' ? 'Review Requirements' : 'প্রয়োজনীয় তথ্য যাচাই করুন')}
            </p>
          </div>

          {/* Checklist indicators */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span>{checks.level ? '✅' : '❌'}</span>
              <span>{lang === 'en' ? 'Target Degree Matching' : 'কাঙ্ক্ষিত ডিগ্রির মিল'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{checks.country ? '✅' : '❌'}</span>
              <span>{lang === 'en' ? 'Country Preference Match' : 'পছন্দের দেশের মিল'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{checks.budget ? '✅' : '❌'}</span>
              <span>{lang === 'en' ? 'Tuition Fee Within Budget' : 'টিউশন ফি বাজেটের মধ্যে'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tab Nav */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === key
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* FR-05: Overview */}
      {activeTab === 'Overview' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">About</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{university.description || 'No description available.'}</p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <p className="text-xs text-blue-500 dark:text-blue-400 font-semibold uppercase mb-1">City</p>
              <p className="text-gray-800 dark:text-gray-200 font-medium">{university.city || '—'}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
              <p className="text-xs text-purple-500 dark:text-purple-400 font-semibold uppercase mb-1">Type</p>
              <p className="text-gray-800 dark:text-gray-200 font-medium capitalize">{university.type || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* FR-06: Programs */}
      {activeTab === 'Programs' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Academic Programs</h2>
          {!university.programs?.length ? (
            <p className="text-gray-500 dark:text-gray-400">No program information available.</p>
          ) : (
            <div className="space-y-3">
              {university.programs.map((p) => (
                <div key={p.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="font-semibold text-gray-800 dark:text-white">{p.degree} — {p.field}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {p.degree && <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">{p.degree}</span>}
                    {p.field && <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">{p.field}</span>}
                    {p.duration_years && <span className="text-xs text-gray-500 dark:text-gray-400">⏱ {p.duration_years} yrs</span>}
                    {p.tuition_per_year && <span className="text-xs text-gray-500 dark:text-gray-400">💰 ${Number(p.tuition_per_year).toLocaleString()}/yr</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FR-07: Intake */}
      {activeTab === 'Intake' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Intake Schedule</h2>
          {!university.intakes?.length ? (
            <p className="text-gray-500 dark:text-gray-400">No intake information available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/30 text-left">
                    <th className="py-2 px-4 font-semibold text-gray-600 dark:text-gray-300 rounded-tl-lg">Intake Name</th>
                    <th className="py-2 px-4 font-semibold text-gray-600 dark:text-gray-300 rounded-tr-lg">Start Month</th>
                  </tr>
                </thead>
                <tbody>
                  {university.intakes.map((intake) => (
                    <tr key={intake.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{intake.intake_name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{intake.start_month || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FR-08: Language Requirements */}
      {activeTab === 'Language' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Language Requirements</h2>
          {!university.language_requirements?.length ? (
            <p className="text-gray-500 dark:text-gray-400">No language requirement data available.</p>
          ) : (
            <div className="space-y-3">
              {university.language_requirements.map((req) => (
                <div key={req.id} className="flex items-start gap-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30 rounded-xl p-4">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white text-lg">{req.test_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Minimum Score: <strong className="text-gray-800 dark:text-gray-200">{req.min_score}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FR-09: Scholarships */}
      {activeTab === 'Scholarships' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Scholarship Eligibility</h2>
          {!university.scholarship_eligibility?.length ? (
            <p className="text-gray-500 dark:text-gray-400">No scholarship information available.</p>
          ) : (
            <div className="space-y-4">
              {university.scholarship_eligibility.map((s) => (
                <div key={s.id} className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">🎁 Scholarship #{s.id}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    <strong>Basis:</strong> {s.eligibility_basis}
                  </p>
                  {s.minimum_gpa && (
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400 mt-2">
                      Minimum GPA: {s.minimum_gpa}
                    </p>
                  )}
                  {s.additional_notes && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{s.additional_notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversityDetails;