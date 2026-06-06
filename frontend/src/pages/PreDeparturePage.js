import React, { useState, useEffect } from 'react';
import { predepartureAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const CHECKLIST_ICONS = {
  accommodation: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  flight_booked: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  visa_copy: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  ),
  forex_card: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  baggage_essentials: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
};

const ITEM_COLORS = [
  { bg: 'bg-blue-500', light: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800/50', text: 'text-blue-600 dark:text-blue-400' },
  { bg: 'bg-violet-500', light: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800/50', text: 'text-violet-600 dark:text-violet-400' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800/50', text: 'text-emerald-600 dark:text-emerald-400' },
  { bg: 'bg-amber-500', light: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800/50', text: 'text-amber-600 dark:text-amber-400' },
  { bg: 'bg-pink-500', light: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200 dark:border-pink-800/50', text: 'text-pink-600 dark:text-pink-400' },
];

const PreDeparturePage = () => {
  const { t, lang } = useLanguage();
  const [completedItems, setCompletedItems] = useState({});
  const [loading, setLoading] = useState(true);

  const checklistItems = [
    { key: 'accommodation', label: t('prepAccommodation'), desc: lang === 'en' ? 'Book student hostel or shared apartment near your campus.' : 'আপনার ক্যাম্পাসের কাছাকাছি শিক্ষার্থী হোস্টেল বা যৌথ অ্যাপার্টমেন্ট বুক করুন।' },
    { key: 'flight_booked', label: t('prepFlight'), desc: lang === 'en' ? 'Purchase flight tickets and check baggage allowances.' : 'উড়োজাহাজের টিকিট কিনুন এবং লাগেজ এলাউন্স চেক করুন।' },
    { key: 'visa_copy', label: t('prepVisa'), desc: lang === 'en' ? 'Keep digital and physical copies of your study visa & passport.' : 'আপনার স্টাডি ভিসা এবং পাসপোর্টের ডিজিটাল এবং শারীরিক অনুলিপি রাখুন।' },
    { key: 'forex_card', label: t('prepForex'), desc: lang === 'en' ? 'Load multi-currency travel card and keep minor cash.' : 'মাল্টি-কারেন্সি ট্রাভেল কার্ড লোড করুন এবং কিছু নগদ অর্থ রাখুন।' },
    { key: 'baggage_essentials', label: t('prepBaggage'), desc: lang === 'en' ? 'Pack warm clothes, academic transcripts, and emergency medicine.' : 'উষ্ণ পোশাক, একাডেমিক সার্টিফিকেট এবং জরুরী ওষুধ প্যাক করুন।' },
  ];

  useEffect(() => { fetchPreDeparture(); }, []);

  const fetchPreDeparture = async () => {
    try {
      setLoading(true);
      const res = await predepartureAPI.get();
      const mapped = {};
      res.data.forEach(item => { mapped[item.item_key] = item.is_completed; });
      setCompletedItems(mapped);
    } catch (err) {
      console.error('Failed to fetch pre-departure checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (itemKey) => {
    const nextVal = !completedItems[itemKey];
    setCompletedItems(prev => ({ ...prev, [itemKey]: nextVal }));
    try {
      await predepartureAPI.update({ item_key: itemKey, is_completed: nextVal });
    } catch (err) {
      console.error('Failed to toggle pre-departure item:', err);
      setCompletedItems(prev => ({ ...prev, [itemKey]: !nextVal }));
    }
  };

  const completedCount = checklistItems.filter(item => completedItems[item.key]).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  const getTravelMessage = () => {
    if (progressPercent === 100) return lang === 'en' ? 'All set for takeoff! Bon voyage!' : 'ভ্রমণের জন্য সম্পূর্ণ প্রস্তুত! শুভ যাত্রা!';
    if (progressPercent >= 60) return lang === 'en' ? 'Almost ready — just a few more items!' : 'প্রায় প্রস্তুত — আর কিছু বাকি!';
    if (progressPercent >= 20) return lang === 'en' ? 'Good start! Keep checking off items.' : 'চমৎকার শুরু! বাকিগুলো সম্পন্ন করুন।';
    return lang === 'en' ? "Let's start preparing for your travel!" : 'চলুন আপনার ভ্রমণের প্রস্তুতি শুরু করি!';
  };

  const getProgressColor = () => {
    if (progressPercent === 100) return 'from-emerald-400 to-teal-400';
    if (progressPercent >= 60) return 'from-blue-400 to-indigo-400';
    if (progressPercent >= 20) return 'from-amber-400 to-orange-400';
    return 'from-gray-400 to-gray-300';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 dark:text-gray-100">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.12),transparent_60%)]"></div>
        <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-8 top-0 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-xs font-bold uppercase tracking-widest">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {t('prepReadyText')}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{t('prepTitle')}</h1>
              <p className="text-sky-100/80 text-sm md:text-base">{t('prepSubtitle')}</p>
            </div>

            {/* Circular Progress */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8"/>
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="white" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercent / 100)}`}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white">{progressPercent}%</span>
                  <span className="text-white/60 text-[10px] font-semibold uppercase">Ready</span>
                </div>
              </div>
              <p className="text-sky-200/80 text-xs font-semibold text-center">{completedCount} of {checklistItems.length} complete</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 pt-5 border-t border-white/20 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-white/80">
              <span>{getTravelMessage()}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-white/15 h-3 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-700 ease-out`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-black text-gray-800 dark:text-white text-lg">
            {lang === 'en' ? 'Travel Checklist' : 'ভ্রমণ চেকলিস্ট'}
          </h2>
          <span className="text-xs font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800/40">
            {completedCount}/{checklistItems.length}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-500">{t('btnLoading')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {checklistItems.map((item, idx) => {
              const isChecked = !!completedItems[item.key];
              const colors = ITEM_COLORS[idx % ITEM_COLORS.length];
              const Icon = CHECKLIST_ICONS[item.key];

              return (
                <div
                  key={item.key}
                  onClick={() => handleToggleItem(item.key)}
                  className={`flex items-start gap-5 px-6 py-5 cursor-pointer select-none transition-all group ${
                    isChecked
                      ? 'bg-gray-50/50 dark:bg-gray-900/10'
                      : 'hover:bg-gray-50/70 dark:hover:bg-gray-700/20'
                  }`}
                >
                  {/* Icon */}
                  <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isChecked
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : `${colors.light} ${colors.text} border ${colors.border}`
                  }`}>
                    {isChecked ? (
                      <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : Icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-base transition-all ${
                      isChecked
                        ? 'line-through text-gray-400 dark:text-gray-500'
                        : 'text-gray-800 dark:text-white'
                    }`}>
                      {item.label}
                    </h3>
                    <p className={`text-sm leading-relaxed mt-0.5 transition-all ${
                      isChecked
                        ? 'text-gray-300 dark:text-gray-600'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.desc}
                    </p>
                  </div>

                  {/* Toggle indicator */}
                  <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                  }`}>
                    {isChecked && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {!loading && progressPercent === 100 && (
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-t border-emerald-100 dark:border-emerald-800/30 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                {lang === 'en' ? 'You\'re all set!' : 'আপনি সম্পূর্ণ প্রস্তুত!'}
              </p>
              <p className="text-emerald-600/70 dark:text-emerald-500/70 text-xs">
                {lang === 'en' ? 'Have a safe and amazing journey ahead!' : 'আপনার জন্য একটি নিরাপদ ও অসাধারণ যাত্রা কামনা করি!'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreDeparturePage;
