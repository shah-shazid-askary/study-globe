import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfileQuery, useCountriesQuery, useProgramsQuery } from '../hooks/useAppQueries';
import { queryKeys } from '../lib/queryClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MultiSelectSearch from '../components/MultiSelectSearch';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    phone: '',
    current_education_level: '',
    field_of_interest: '',
    preferred_countries: '',
    budget_range: '',
    target_intake: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [recommendations, setRecommendations] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState('');

  const { data: profileData, isLoading: loadingProfile } = useProfileQuery();
  const { data: dbCountries = [] } = useCountriesQuery();
  const { data: allPrograms = [] } = useProgramsQuery({});
  const dbFields = useMemo(() => {
    const allFields = allPrograms.map((p) => p.field).filter(Boolean);
    return [...new Set(allFields)].sort();
  }, [allPrograms]);

  useEffect(() => {
    if (profileData && Object.keys(profileData).length > 0) {
      setFormData({
        full_name: profileData.full_name || '',
        date_of_birth: profileData.date_of_birth || '',
        phone: profileData.phone || '',
        current_education_level: profileData.current_education_level || '',
        field_of_interest: profileData.field_of_interest || '',
        preferred_countries: Array.isArray(profileData.preferred_countries)
          ? profileData.preferred_countries.join(', ')
          : (profileData.preferred_countries || ''),
        budget_range: profileData.budget_range || '',
        target_intake: profileData.target_intake || '',
      });
    }
  }, [profileData]);

  const loading = loadingProfile;

  useEffect(() => {
    if (!loading && location.hash === '#generate-plan') {
      setTimeout(() => {
        const element = document.getElementById('generate-plan');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-blue-400', 'transition-all', 'duration-1000');
          setTimeout(() => element.classList.remove('ring-4', 'ring-blue-400'), 2500);
        }
      }, 100);
    }
  }, [loading, location.hash]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await profileAPI.update(formData);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      if (formData.full_name && formData.full_name.trim()) {
        updateUser({ full_name: formData.full_name.trim() });
      }
      setMessage({ type: 'success', text: lang === 'en' ? 'Profile updated successfully!' : 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message || (lang === 'en' ? 'Failed to update profile.' : 'প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে।') });
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePlan = async () => {
    setLoadingAi(true);
    setAiError('');
    try {
      const res = await profileAPI.getRecommendations();
      setRecommendations(res.data.recommendations);
    } catch (err) {
      setAiError(err.response?.data?.error || (lang === 'en' ? 'Failed to generate recommendations.' : 'সুপারিশ তৈরি করতে ব্যর্থ হয়েছে।'));
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin"></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your profile…</p>
        </div>
      </div>
    );
  }

  const textFields = [
    { label: lang === 'en' ? 'Full Name' : 'পুরো নাম', name: 'full_name', type: 'text', placeholder: 'e.g. John Doe', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )},
    { label: lang === 'en' ? 'Phone' : 'ফোন', name: 'phone', type: 'text', placeholder: 'e.g. +880 1700-000000', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
    )},
    { label: lang === 'en' ? 'Date of Birth' : 'জন্ম তারিখ', name: 'date_of_birth', type: 'date', placeholder: '', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    )},
    { label: lang === 'en' ? 'Budget Range' : 'বাজেট পরিসর', name: 'budget_range', type: 'text', placeholder: 'e.g. $10,000–$20,000/yr', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
  ];

  const educationLevels = ['Bachelor', 'Masters', 'PhD'];
  const upcomingIntakes = ['Fall 2026', 'Spring 2027', 'Fall 2027', 'Spring 2028', 'Fall 2028'];
  const displayName = formData.full_name || user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  const inputCls = "w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition";

  // Profile completion calc
  const filledFields = [formData.full_name, formData.phone, formData.date_of_birth, formData.current_education_level, formData.field_of_interest, formData.preferred_countries, formData.budget_range, formData.target_intake].filter(Boolean);
  const completionPct = Math.round((filledFields.length / 8) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 dark:text-gray-100">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]"></div>
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 p-8">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-2xl font-black text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-white/80 text-[11px] font-bold uppercase tracking-widest mb-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                {lang === 'en' ? 'Student Profile' : 'শিক্ষার্থী প্রোফাইল'}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight truncate">
                {lang === 'en' ? `Welcome, ${displayName}!` : `স্বাগতম, ${displayName}!`}
              </h1>
              <p className="text-indigo-200/80 text-sm mt-1 truncate">
                {formData.full_name || user?.full_name ? `${formData.full_name || user?.full_name} · ` : ''}{user?.email}
              </p>
            </div>
          </div>

          {/* Completion Bar */}
          <div className="mt-6 pt-5 border-t border-white/20 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-white/80">
              <span>{lang === 'en' ? 'Profile Completion' : 'প্রোফাইল সম্পূর্ণতা'}</span>
              <span>{completionPct}%</span>
            </div>
            <div className="w-full bg-white/15 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  completionPct === 100 ? 'bg-emerald-400' : completionPct >= 60 ? 'bg-blue-300' : 'bg-amber-400'
                }`}
                style={{ width: `${completionPct}%` }}
              />
            </div>
            {completionPct < 100 && (
              <p className="text-indigo-200/60 text-xs">{lang === 'en' ? 'Fill all fields to unlock personalized AI recommendations.' : 'সম্পূর্ণ প্রোফাইল পূরণ করুন এআই সুপারিশ পেতে।'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message.text && (
        <div className={`rounded-2xl p-4 text-sm border font-medium flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
            : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
        }`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            message.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-red-100 dark:bg-red-900/50'
          }`}>
            {message.type === 'success' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </div>
          {message.text}
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-base font-black text-gray-800 dark:text-white">
            {lang === 'en' ? 'Edit Profile' : 'প্রোফাইল সম্পাদনা'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {textFields.map(({ label, name, type, placeholder, icon }) => (
              <div key={name}>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                  <span className="text-indigo-500">{icon}</span>
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>

          <div>
            <MultiSelectSearch
              label={lang === 'en' ? 'Field of Interest' : 'আগ্রহের ক্ষেত্র'}
              options={dbFields}
              selected={formData.field_of_interest ? formData.field_of_interest.split(', ').filter(Boolean) : []}
              onChange={(selectedArray) => setFormData({ ...formData, field_of_interest: selectedArray.join(', ') })}
              placeholder={lang === 'en' ? 'Select field(s)' : 'আগ্রহের ক্ষেত্র নির্বাচন করুন'}
              lang={lang}
            />
          </div>

          <div>
            <MultiSelectSearch
              label={lang === 'en' ? 'Preferred Country' : 'পছন্দের দেশ'}
              options={dbCountries.map(c => c.name)}
              selected={formData.preferred_countries ? formData.preferred_countries.split(', ').filter(Boolean) : []}
              onChange={(selectedArray) => setFormData({ ...formData, preferred_countries: selectedArray.join(', ') })}
              placeholder={lang === 'en' ? 'Select country(ies)' : 'পছন্দের দেশ নির্বাচন করুন'}
              lang={lang}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                {lang === 'en' ? 'Target Intake' : 'লক্ষ্য ভর্তি মৌসুম'}
              </label>
              <select name="target_intake" value={formData.target_intake} onChange={handleChange} className={inputCls}>
                <option value="">{lang === 'en' ? 'Select intake season' : 'ভর্তি মৌসুম বেছে নিন'}</option>
                {upcomingIntakes.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                {lang === 'en' ? 'Target Degree Level' : 'লক্ষ্য ডিগ্রি স্তর'}
              </label>
              <select name="current_education_level" value={formData.current_education_level} onChange={handleChange} className={inputCls}>
                <option value="">{lang === 'en' ? 'Select level' : 'স্তর বেছে নিন'}</option>
                {educationLevels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {lang === 'en' ? 'Saving…' : 'সংরক্ষণ হচ্ছে...'}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {lang === 'en' ? 'Save Profile' : 'প্রোফাইল সংরক্ষণ'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* AI Recommendations */}
      <div id="generate-plan" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-50 dark:bg-violet-950/50 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-black text-gray-800 dark:text-white">
              {lang === 'en' ? 'AI Personalized Plan' : 'এআই ব্যক্তিগতকৃত পরিকল্পনা'}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">{lang === 'en' ? 'Powered by Gemma AI' : 'Gemma AI দ্বারা চালিত'}</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {!recommendations && !loadingAi && (
            <div className="text-center py-4 space-y-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                {lang === 'en'
                  ? 'Fill out and save your profile, then let our AI match you with the best universities and programs.'
                  : 'আপনার প্রোফাইল পূরণ ও সংরক্ষণ করুন, তারপর আমাদের এআই আপনার জন্য সেরা বিশ্ববিদ্যালয় ও প্রোগ্রাম খুঁজে দেবে।'}
              </p>
              <button
                onClick={handleGeneratePlan}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
                {lang === 'en' ? 'Generate Personalized Plan' : 'ব্যক্তিগতকৃত পরিকল্পনা তৈরি করুন'}
              </button>
            </div>
          )}

          {loadingAi && (
            <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-800/40 rounded-2xl p-8 flex flex-col items-center gap-4">
              <div className="flex gap-1.5">
                {[0, 150, 300].map(delay => (
                  <span key={delay} className="w-3 h-3 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
              <p className="text-violet-700 dark:text-violet-400 font-bold text-sm animate-pulse">
                {lang === 'en' ? 'Analyzing your profile & finding the best matches…' : 'প্রোফাইল বিশ্লেষণ করা হচ্ছে এবং সেরা মিল খোঁজা হচ্ছে…'}
              </p>
            </div>
          )}

          {aiError && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl p-4 flex items-center justify-between gap-4">
              <span className="text-sm">{aiError}</span>
              <button onClick={handleGeneratePlan} className="shrink-0 text-xs font-bold underline hover:no-underline">
                {lang === 'en' ? 'Retry' : 'পুনরায় চেষ্টা'}
              </button>
            </div>
          )}

          {recommendations && !loadingAi && (
            <div className="space-y-4">
              <div className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h3: ({ node, ...props }) => <h3 className="text-base font-black text-indigo-700 dark:text-indigo-400 mt-4 mb-2" {...props} />,
                    p: ({ node, ...props }) => <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 text-sm text-gray-600 dark:text-gray-300 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-black text-gray-900 dark:text-white" {...props} />,
                  }}
                >
                  {recommendations}
                </ReactMarkdown>
              </div>
              <button
                onClick={handleGeneratePlan}
                className="flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 text-sm font-bold transition mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {lang === 'en' ? 'Regenerate Plan' : 'পরিকল্পনা পুনরায় তৈরি করুন'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
