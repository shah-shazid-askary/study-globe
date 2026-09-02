import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { lang } = useLanguage();

  const navLinks = [
    { to: '/countries',    emoji: '🌍', en: 'Countries',            bn: 'দেশ সমূহ' },
    { to: '/universities', emoji: '🎓', en: 'Universities',         bn: 'বিশ্ববিদ্যালয়' },
    { to: '/programs',     emoji: '📚', en: 'Programs',             bn: 'প্রোগ্রাম' },
    { to: '/applications', emoji: '📋', en: 'Application Planner',  bn: 'আবেদন পরিকল্পনা' },
    { to: '/predeparture', emoji: '✈️', en: 'Pre-Departure',        bn: 'ভ্রমণ প্রস্তুতি' },
    { to: '/resources',    emoji: '📖', en: 'Prep Resources',       bn: 'প্রস্তুতি রিসোর্স' },
  ];

  const legalLinks = [
    { to: '/privacy', emoji: '🔒', en: 'Privacy Policy',     bn: 'গোপনীয়তা নীতি' },
    { to: '/terms',   emoji: '⚖️', en: 'Terms of Service',   bn: 'ব্যবহারের শর্তাবলী' },
  ];

  const stats = [
    { icon: '🌍', value: '54+',   en: 'Countries',    bn: 'দেশ' },
    { icon: '🎓', value: '5,000+',en: 'Universities', bn: 'বিশ্ববিদ্যালয়' },
    { icon: '📚', value: '12,000+',en: 'Programs',    bn: 'প্রোগ্রাম' },
    { icon: '🤖', value: 'AI',    en: 'Powered',      bn: 'চালিত' },
  ];

  return (
    <footer className="relative overflow-hidden bg-gray-950 text-white">

      {/* ── Decorative top gradient border ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />

      {/* ── Background glow orbs ── */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-indigo-700/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* ── STATS STRIP ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl px-5 py-4 transition-all duration-300 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{s.icon}</span>
              <div>
                <p className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-none">
                  {s.value}
                </p>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                  {lang === 'en' ? s.en : s.bn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN 3-COL GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">

          {/* Col 1 – Brand block */}
          <div className="md:col-span-5 space-y-5">
            {/* Logo */}
            <div className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              StudyGlobe
            </div>

            {/* Tagline */}
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {lang === 'en'
                ? 'Your AI-powered global study portal — personalized roadmaps, smart matching, and end-to-end application support across 54+ countries.'
                : 'আপনার এআই-চালিত গ্লোবাল স্টাডি পোর্টাল — ব্যক্তিগত রোডম্যাপ, স্মার্ট ম্যাচিং এবং ৫৪+ দেশে সম্পূর্ণ আবেদন সহায়তা।'}
            </p>

            {/* CTA pill */}
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg shadow-blue-900/30 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-blue-700/40"
            >
              <span>🚀</span>
              {lang === 'en' ? 'Start Your Journey' : 'যাত্রা শুরু করুন'}
            </Link>

            {/* Trust badge row */}
            <div className="flex items-center gap-3 flex-wrap pt-1">
              <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-bold px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                {lang === 'en' ? 'All systems live' : 'সিস্টেম সচল'}
              </span>

            </div>
          </div>

          {/* Col 2 – Portal navigation */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
              {lang === 'en' ? 'Explore Portal' : 'পোর্টাল নেভিগেশন'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-semibold transition-all duration-200 group"
                >
                  <span className="text-base group-hover:scale-110 transition-transform duration-200">{link.emoji}</span>
                  <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                    {lang === 'en' ? link.en : link.bn}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3 – Legal & contact */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
              {lang === 'en' ? 'Support & Legal' : 'সহায়তা ও আইনি'}
            </h4>
            <div className="flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-semibold transition-all duration-200 group"
                >
                  <span className="text-base group-hover:scale-110 transition-transform duration-200">{link.emoji}</span>
                  <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                    {lang === 'en' ? link.en : link.bn}
                  </span>
                </Link>
              ))}

              {/* Contact email */}
              <a
                href="mailto:support@studyglobe.com"
                className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-semibold transition-all duration-200 group"
              >
                <span className="text-base group-hover:scale-110 transition-transform duration-200">✉️</span>
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                  {lang === 'en' ? 'Contact Support' : 'সহায়তা যোগাযোগ'}
                </span>
              </a>


            </div>
          </div>

        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 text-[11px] font-semibold text-gray-600">
          <p>
            © {new Date().getFullYear()} StudyGlobe Capstone.{' '}
            {lang === 'en' ? 'All rights reserved.' : 'সর্বস্বত্ব সংরক্ষিত।'}
          </p>
          <p className="text-gray-700 italic">
            {lang === 'en'
              ? 'Empowering global scholars, one roadmap at a time.'
              : 'প্রতিটি রোডম্যাপে বৈশ্বিক শিক্ষার্থীদের ক্ষমতায়ন।'}
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
