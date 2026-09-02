import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Carousel from '../components/Carousel';
import NewsReel from '../components/NewsReel';

const getCountryFlagUrl = (countryName) => {
  const name = countryName?.toLowerCase()?.trim() || '';
  const codeMap = {
    'argentina': 'ar',
    'australia': 'au',
    'austria': 'at',
    'belgium': 'be',
    'brazil': 'br',
    'canada': 'ca',
    'chile': 'cl',
    'china': 'cn',
    'croatia': 'hr',
    'cyprus': 'cy',
    'czech republic': 'cz',
    'denmark': 'dk',
    'estonia': 'ee',
    'finland': 'fi',
    'france': 'fr',
    'germany': 'de',
    'greece': 'gr',
    'hong kong': 'hk',
    'hungary': 'hu',
    'india': 'in',
    'indonesia': 'id',
    'ireland': 'ie',
    'italy': 'it',
    'japan': 'jp',
    'latvia': 'lv',
    'lithuania': 'lt',
    'luxembourg': 'lu',
    'malaysia': 'my',
    'mexico': 'mx',
    'netherlands': 'nl',
    'new zealand': 'nz',
    'norway': 'no',
    'philippines': 'ph',
    'poland': 'pl',
    'portugal': 'pt',
    'qatar': 'qa',
    'romania': 'ro',
    'russia': 'ru',
    'saudi arabia': 'sa',
    'singapore': 'sg',
    'slovenia': 'si',
    'south africa': 'za',
    'south korea': 'kr',
    'spain': 'es',
    'sweden': 'se',
    'switzerland': 'ch',
    'taiwan': 'tw',
    'thailand': 'th',
    'turkey': 'tr',
    'uae': 'ae',
    'united arab emirates': 'ae',
    'ukraine': 'ua',
    'united kingdom': 'gb',
    'uk': 'gb',
    'united states': 'us',
    'united states of america': 'us',
    'usa': 'us',
    'us': 'us',
    'vietnam': 'vn'
  };
  const code = codeMap[name];
  return code ? `https://flagcdn.com/w80/${code}.png` : null;
};

const Landing = () => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('ai');
  const [openFaq, setOpenFaq] = useState(null);

  // Localization Dictionary
  const content = {
    en: {
      heroTagline: "Elevate Your Academic Future",
      heroTitle: "Your Smart Gateway to ",
      heroTitleHighlight: "Global Education",
      heroSubtitle: "StudyGlobe merges advanced AI roadmap generators, live program databases, and expert document reviews into one seamless ecosystem to guide your study abroad journey.",
      btnGetStarted: "Get Started Now",
      btnBrowseUniv: "Explore Universities",
      statsTitle: "StudyGlobe in Numbers",
      featuresTitle: "Everything You Need for Your ",
      featuresTitleHighlight: "Global Journey",
      featuresSubtitle: "Explore features designed to streamline every step from test preparation to university enrollment.",
      roadmapTitle: "Your Path to Global Success",
      roadmapSubtitle: "A step-by-step interactive breakdown of your international education journey.",
      previewTitle: "Experience the Platform",
      previewSubtitle: "Get a sneak peek of our high-fidelity student tools, powered by intelligent algorithms.",
      faqTitle: "Frequently Asked Questions",
      faqSubtitle: "Got questions? We have the answers to help you start your journey.",
      ctaTitle: "Ready to Change Your Life?",
      ctaSubtitle: "Join 10,000+ students who transformed their dreams into reality. The world is waiting.",
      ctaButton: "Create Free Account",
    },
    bn: {
      heroTagline: "আপনার শিক্ষাগত ভবিষ্যৎকে করুন আরও উন্নত",
      heroTitle: "বিশ্বব্যাপী উচ্চশিক্ষার ",
      heroTitleHighlight: "স্মার্ট প্রবেশদ্বার",
      heroSubtitle: "স্টাডিগ্লোব আপনার বিদেশ যাত্রাকে সহজ করতে নিয়ে এসেছে এআই রোডম্যাপ জেনারেটর, লাইভ প্রোগ্রাম ডেটাবেস এবং বিশেষজ্ঞের মাধ্যমে ডকুমেন্ট রিভিউ করার সমন্বিত প্ল্যাটফর্ম।",
      btnGetStarted: "এখনই শুরু করুন",
      btnBrowseUniv: "বিশ্ববিদ্যালয়সমূহ খুঁজুন",
      statsTitle: "সংখ্যায় স্টাডিগ্লোব",
      featuresTitle: "আপনার বিশ্বযাত্রার জন্য ",
      featuresTitleHighlight: "প্রয়োজনীয় সবকিছু",
      featuresSubtitle: "টেস্ট প্রস্তুতি থেকে শুরু করে বিশ্ববিদ্যালয়ে ভর্তি পর্যন্ত প্রতিটি পদক্ষেপকে সহজ করার জন্য ডিজাইন করা ফিচারসমূহ।",
      roadmapTitle: "বিশ্বব্যাপী সাফল্যের পথ",
      roadmapSubtitle: "আপনার আন্তর্জাতিক শিক্ষা যাত্রার ধাপে ধাপে ইন্টারেক্টিভ বিশ্লেষণ।",
      previewTitle: "প্ল্যাটফর্মের অভিজ্ঞতা নিন",
      previewSubtitle: "বুদ্ধিমান অ্যালগরিদম দ্বারা পরিচালিত আমাদের স্টুডেন্ট টুলসের একটি চমৎকার রূপরেখা দেখুন।",
      faqTitle: "সাধারণ জিজ্ঞাসা",
      faqSubtitle: "প্রশ্ন আছে? আপনার যাত্রা শুরু করতে আমাদের কাছে রয়েছে সব সমাধান।",
      ctaTitle: "আপনার জীবন পরিবর্তন করতে প্রস্তুত?",
      ctaSubtitle: "স্বপ্নকে বাস্তবে রূপ দেওয়া ১০,০০০+ শিক্ষার্থীর সাথে যোগ দিন। পৃথিবী আপনার অপেক্ষায়।",
      ctaButton: "ফ্রি অ্যাকাউন্ট তৈরি করুন",
    }
  };

  const t = (key) => content[lang]?.[key] || content['en'][key] || key;

  const stats = [
    { label: lang === 'en' ? 'Universities' : 'বিশ্ববিদ্যালয়', value: '500+' },
    { label: lang === 'en' ? 'Scholarships' : 'স্কলারশিপ', value: '$10M+' },
    { label: lang === 'en' ? 'Success Rate' : 'সাফল্যের হার', value: '94%' },
    { label: lang === 'en' ? 'Countries Covered' : 'অন্তর্ভুক্ত দেশ', value: '54+' },
  ];

  const features = [
    {
      title: lang === 'en' ? 'AI Smart Match' : 'এআই স্মার্ট ম্যাচ',
      desc: lang === 'en' 
        ? 'Get personalized academic roadmap recommendations and eligibility matching scores based on your grades and interests.' 
        : 'আপনার গ্রেড এবং আগ্রহের ভিত্তিতে ব্যক্তিগতকৃত একাডেমিক রোডম্যাপ এবং যোগ্যতা ম্যাচিং স্কোর পান।',
      icon: (
        <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M9.963 8.282A7.856 7.856 0 0 0 12 3a7.856 7.856 0 0 0 2.037 5.282A7.856 7.856 0 0 0 19.32 10 7.856 7.856 0 0 0 14.037 11.718 7.856 7.856 0 0 0 12 17a7.856 7.856 0 0 0-2.037-5.282 7.856 7.856 0 0 0-5.282-2.037 7.856 7.856 0 0 0 5.282-2.037z" />
        </svg>
      ),
      badge: 'AI',
      colorClass: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400',
    },
    {
      title: lang === 'en' ? 'Global Directory' : 'বিশ্বব্যাপী ডিরেক্টরি',
      desc: lang === 'en' 
        ? 'Explore 5,000+ detailed courses with accurate intake timelines, IELTS/TOEFL requirements, and tuition fees.' 
        : 'সঠিক ইনটেক টাইমলাইন, আইইএলটিএস/টোফেল যোগ্যতা এবং টিউশন ফি সহ ৫,০০০+ বিস্তারিত কোর্স অন্বেষণ করুন।',
      icon: (
        <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
      badge: '54 Countries',
      colorClass: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: lang === 'en' ? 'SOP & LOR Analyzer' : 'এসওপি ও এলওআর অ্যানালাইজার',
      desc: lang === 'en' 
        ? 'Upload statement of purpose draft and letters of recommendation to get dynamic formatting and context audits.' 
        : 'ডায়নামিক ফরম্যাটিং এবং প্রসঙ্গ অডিট পেতে স্টেটমেন্ট অফ পারপাস এবং সুপারিশপত্রের ড্রাফট আপলোড করুন।',
      icon: (
        <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      badge: 'Instant Feedback',
      colorClass: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-600 dark:text-purple-400',
    },
    {
      title: lang === 'en' ? 'Application Planner' : 'আবেদন পরিকল্পনাকারী',
      desc: lang === 'en' 
        ? 'Manage document checklists, submit verification links, track deadlines, and receive real-time notifications.' 
        : 'নথিপত্রের চেকলিস্ট পরিচালনা করুন, ভেরিফিকেশন লিঙ্ক জমা দিন, ডেডলাইন ট্র্যাক করুন এবং রিয়েল-টাইম সতর্কতা পান।',
      icon: (
        <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 12l2 2 4-4" />
          <path d="M9 16h6" />
        </svg>
      ),
      badge: 'Stay On Track',
      colorClass: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
    },
  ];

  const steps = [
    {
      num: '01',
      title: lang === 'en' ? 'Build Profile' : 'প্রোফাইল তৈরি',
      desc: lang === 'en' ? 'Set academic scores, test points, and select multiple fields of interest.' : 'একাডেমিক স্কোর, টেস্ট পয়েন্ট সেট করুন এবং আপনার পছন্দের বিষয়সমূহ সিলেক্ট করুন।',
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
    {
      num: '02',
      title: lang === 'en' ? 'AI Smart Match' : 'এআই ম্যাচিং',
      desc: lang === 'en' ? 'Discover programs tailored to your preferences with dynamic probability scores.' : 'ডায়নামিক সম্ভাব্য স্কোর সহ আপনার পছন্দের উপযোগী প্রোগ্রামগুলো খুঁজে বের করুন।',
      icon: (
        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="15" x2="23" y2="15" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="15" x2="4" y2="15" />
        </svg>
      )
    },
    {
      num: '03',
      title: lang === 'en' ? 'Submit Documents' : 'নথিপত্র সাবমিশন',
      desc: lang === 'en' ? 'Prepare and upload transcripts, passport, and use AI to review your SOP/LOR.' : 'ট্রান্সক্রিপ্ট, পাসপোর্ট প্রস্তুত করুন এবং এআই দিয়ে আপনার SOP/LOR মূল্যায়ন করুন।',
      icon: (
        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      )
    },
    {
      num: '04',
      title: lang === 'en' ? 'Embark Journey' : 'ভ্রমণ শুরু',
      desc: lang === 'en' ? 'Use the pre-departure checklist to stamp study visa, book accommodation, and flights.' : 'স্টাডি ভিসা স্ট্যাম্প করতে, আবাসন এবং ফ্লাইটের টিকিট বুক করতে আমাদের চেকলিস্ট ব্যবহার করুন।',
      icon: (
        <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l8 2.5z" />
        </svg>
      )
    }
  ];

  const testimonials = [
    {
      quote: lang === 'en' 
        ? "StudyGlobe completely eliminated the guesswork out of my applications. The AI feedback on my SOP was remarkably detailed and helpful."
        : "স্টাডিগ্লোব আমার আবেদনের প্রতিটি দ্বিধা দূর করেছে। আমার এসওপিতে এআই এর দেওয়া বিশ্লেষণ অত্যন্ত তথ্যবহুল ও সাহায্যকারী ছিল।",
      name: "Tashfia Rahman",
      title: lang === 'en' ? "M.Sc. Student at TU Munich, Germany" : "এম.এসসি শিক্ষার্থী, টিইউ মিউনিখ, জার্মানি",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces"
    },
    {
      quote: lang === 'en' 
        ? "Having access to 54 countries with updated budget requirements allowed me to choose a program that suited my financial goals perfectly."
        : "হালনাগাদ বাজেট সহ ৫৪টি দেশের বিবরণ এক জায়গায় পাওয়ায় আমার আর্থিক লক্ষ্য অনুযায়ী সঠিক প্রোগ্রামটি বেছে নেওয়া অনেক সহজ হয়েছে।",
      name: "Sajid Hasan",
      title: lang === 'en' ? "B.Eng. Student at University of Toronto, Canada" : "বি.ইঞ্জি. শিক্ষার্থী, টরন্টো বিশ্ববিদ্যালয়, কানাডা",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
    }
  ];

  const faqs = [
    {
      q: lang === 'en' ? "How does the AI Smart Match calculate matches?" : "এআই স্মার্ট ম্যাচ কীভাবে ম্যাচিং হিসাব করে?",
      a: lang === 'en' 
        ? "The AI Smart Match algorithm cross-references your current CGPA, IELTS/TOEFL test results, preferred fields of interest, and budgets with university historical patterns and admissions criteria to output a percentage probability score."
        : "এআই স্মার্ট ম্যাচ অ্যালগরিদম আপনার সিজিপিএ, আইইএলটিএস/টোফেল পরীক্ষার ফলাফল, পছন্দের বিষয় এবং বাজেটকে বিশ্ববিদ্যালয়গুলোর বিগত ভর্তির মানদণ্ডের সাথে তুলনা করে সম্ভাব্যতার শতকরা হার বের করে।"
    },
    {
      q: lang === 'en' ? "Can I get my Statement of Purpose (SOP) verified instantly?" : "আমি কি আমার স্টেটমেন্ট অফ পারপাস (SOP) তাৎক্ষণিকভাবে যাচাই করতে পারব?",
      a: lang === 'en'
        ? "Yes! Our integrated SOP Evaluator uses a customized local Gemma AI model to instantly check grammar, sentence flow, vocabulary impact, and alignment with your target program."
        : "হ্যাঁ! আমাদের ইন্টিগ্রেটেড এসওপি মূল্যায়নকারী একটি কাস্টমাইজড লোকাল গেমা এআই মডেল ব্যবহার করে তাত্ক্ষণিকভাবে ব্যাকরণ, বাক্য গঠন, শব্দভাণ্ডার এবং লক্ষ্যযুক্ত প্রোগ্রামের সাথে সামঞ্জস্যতা পরীক্ষা করে।"
    },
    {
      q: lang === 'en' ? "Is there any cost associated with applying through StudyGlobe?" : "স্টাডিগ্লোবের মাধ্যমে আবেদন করার জন্য কোনো খরচ আছে কি?",
      a: lang === 'en'
        ? "No, creating an account, browsing courses, utilizing the task manager, checklist tools, and AI analyzer are completely free of charge."
        : "না, অ্যাকাউন্ট তৈরি করা, কোর্স ব্রাউজ করা, টাস্ক ম্যানেজার, চেকলিস্ট টুলস এবং এআই অ্যানালাইজার ব্যবহার করা সম্পূর্ণ বিনামূল্যে।"
    }
  ];

  return (
    <div className="space-y-24 pb-24 -mt-8 dark:text-gray-100 transition-colors duration-300">
      {/* Top News Reel */}
      <div className="-mx-4 md:-mx-8 lg:-mx-8">
        <NewsReel />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left relative z-10">
            {/* Tagline Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              {t('heroTagline')}
            </span>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight">
              {t('heroTitle')}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {t('heroTitleHighlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl">
              {t('heroSubtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 text-center"
              >
                {t('btnGetStarted')}
                <span className="ml-2">➔</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold py-3.5 px-8 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all hover:scale-105 active:scale-95 text-center"
              >
                {t('btnBrowseUniv')}
              </Link>
            </div>
          </div>

          {/* Featured Carousel Widget */}
          <div className="lg:col-span-6 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-3xl blur-[120px] opacity-15 dark:opacity-30 -z-10 pointer-events-none" />
            <div className="border border-gray-150 dark:border-gray-700 rounded-3xl p-2 bg-white/50 dark:bg-gray-800/30 backdrop-blur-md shadow-2xl">
              <Carousel />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-3xl -z-10 blur-xl" />
        <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700 transition-all">
          <div className="text-center mb-8">
            <h2 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t('statsTitle')}</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center space-y-2 group">
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent transform group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Platform Sneak Peek mockup section */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            {t('previewTitle')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
            {t('previewSubtitle')}
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl max-w-5xl mx-auto">
          {/* Mockup Tab Headers */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-2 md:p-4 gap-2">
            {[
              {
                id: 'ai',
                label: lang === 'en' ? 'AI Smart Match' : 'এআই স্মার্ট ম্যাচ',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4M8 16h.01M16 16h.01" />
                  </svg>
                )
              },
              {
                id: 'tracker',
                label: lang === 'en' ? 'Application Checklist' : 'আবেদন চেকলিস্ট',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                )
              },
              {
                id: 'explore',
                label: lang === 'en' ? 'University Search' : 'বিশ্ববিদ্যালয় সার্চ',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                )
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-150 dark:hover:bg-gray-700/60'
                }`}
              >
                <span className="shrink-0">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Mockup Frame Content */}
          <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-gray-900/40 min-h-[350px] flex items-center justify-center">
            {activeTab === 'ai' && (
              <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-xl">🤖</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-800 dark:text-white">AI Smart Match Evaluator</h4>
                      <p className="text-[10px] text-gray-400">Targeting: Computer Science Programs</p>
                    </div>
                  </div>
                  <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 text-xs font-black px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-900">
                    AI Model
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Academic Match Score</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">96%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 dark:bg-blue-400 h-full rounded-full w-[96%]"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Financial Compatibility</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">88%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full w-[88%]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl space-y-2 border border-gray-100 dark:border-gray-850">
                    <h5 className="text-xs font-black text-gray-700 dark:text-gray-300">AI Recommendation Checklist:</h5>
                    <ul className="text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
                      <li>✅ CGPA 3.82 exceeds admission averages by 0.3</li>
                      <li>✅ TOEFL score of 108 meets maximum requirements</li>
                      <li>⚠️ Consider adding 1 project link to SOP document</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tracker' && (
              <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 space-y-5 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
                  <h4 className="font-extrabold text-sm text-gray-800 dark:text-white">Application Planner</h4>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">Progress: 60%</span>
                </div>

                <div className="space-y-3">
                  {[
                    { text: 'Send WES Academic Credentials Evaluation', status: 'completed' },
                    { text: 'Analyze Statement of Purpose (SOP) with AI Reviewer', status: 'progress' },
                    { text: 'Secure 2 Letters of Recommendation (LOR) from Professors', status: 'pending' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] ${
                          item.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                          item.status === 'progress' ? 'border-blue-500 text-blue-500' : 'border-gray-300'
                        }`}>
                          {item.status === 'completed' && '✓'}
                          {item.status === 'progress' && '●'}
                        </span>
                        <span className={`text-xs ${item.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>
                          {item.text}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        item.status === 'completed' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' :
                        item.status === 'progress' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 animate-pulse' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {item.status === 'completed' ? 'Done' : item.status === 'progress' ? 'Active' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'explore' && (
              <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Search universities by course, location, or requirements..."
                    className="w-full bg-transparent text-xs outline-none text-gray-600 dark:text-gray-300"
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'University of Munich (TUM)', country: 'Germany', match: '96% Match' },
                    { name: 'University of Toronto', country: 'Canada', match: '91% Match' }
                  ].map((univ, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between h-28 hover:border-blue-500/50 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          {getCountryFlagUrl(univ.country) ? (
                            <img 
                              src={getCountryFlagUrl(univ.country)} 
                              alt={`${univ.country} flag`} 
                              className="w-7 h-5 object-cover rounded shadow-sm border border-gray-200 dark:border-gray-750 shrink-0" 
                            />
                          ) : (
                            <span className="text-base">🏳️</span>
                          )}
                          <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/50">
                            {univ.match}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-gray-800 dark:text-white mt-2 leading-tight">{univ.name}</h5>
                      </div>
                      <span className="text-[10px] text-gray-450 dark:text-gray-500 font-bold">{univ.country}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Showcase Grid */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            {t('featuresTitle')}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {t('featuresTitleHighlight')}
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
            {t('featuresSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white/85 dark:bg-gray-800/85 p-8 rounded-3xl border border-gray-150/80 dark:border-gray-700/80 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:-translate-y-2 hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-500 relative group flex flex-col justify-between overflow-hidden min-h-[280px] backdrop-blur-md"
            >
              {/* Soft colorful background circle glow */}
              <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full bg-gradient-to-br ${f.colorClass} blur-xl opacity-20 group-hover:opacity-45 group-hover:scale-125 transition-all duration-500`} />
              
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-4xl transform group-hover:scale-125 transition-transform duration-300">
                    {f.icon}
                  </span>
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-300 bg-gray-150/80 dark:bg-gray-900/80 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-lg font-black text-gray-800 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-300 text-xs leading-relaxed font-medium">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Path / How it Works section */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            {t('roadmapTitle')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
            {t('roadmapSubtitle')}
          </p>
        </div>

        <div className="relative">
          {/* Timeline Connector Line */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-100 dark:bg-gray-800 hidden lg:block -translate-y-1/2 -z-10" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl p-6 shadow-sm relative space-y-4 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 px-2 py-0.5 rounded-md">
                    {step.num}
                  </span>
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-800 dark:text-white mb-1">{step.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Slider/Cards Grid */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">
            {lang === 'en' ? 'Student Success Stories' : 'সাফল্যের গল্প'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/20" />
                <div>
                  <h4 className="font-extrabold text-sm text-gray-800 dark:text-white">{t.name}</h4>
                  <p className="text-[11px] text-gray-400 font-semibold">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">{t('faqTitle')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('faqSubtitle')}</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl overflow-hidden transition-all duration-300">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex justify-between items-center p-5 text-left font-extrabold text-xs sm:text-sm text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
              >
                <span>{faq.q}</span>
                <span className="text-lg transition-transform duration-300" style={{ transform: openFaq === idx ? 'rotate(45deg)' : 'none' }}>
                  ＋
                </span>
              </button>
              <div className="transition-all duration-300 ease-in-out" style={{ maxHeight: openFaq === idx ? '200px' : '0px', opacity: openFaq === idx ? 1 : 0, overflow: 'hidden' }}>
                <p className="p-5 border-t border-gray-50 dark:border-gray-750 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action (CTA) bottom section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 dark:from-blue-900 dark:via-indigo-950 dark:to-gray-950 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl transition-colors duration-300">
        <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black">{t('ctaTitle')}</h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            {t('ctaSubtitle')}
          </p>
          <div className="pt-4">
            <Link
              to="/register"
              className="bg-white hover:bg-blue-50 text-blue-700 font-black py-4 px-10 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl inline-block text-sm"
            >
              {t('ctaButton')}
            </Link>
          </div>
        </div>
        
        {/* Glowing visual background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-blue-500/35 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/35 rounded-full blur-[120px] pointer-events-none" />
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default Landing;
