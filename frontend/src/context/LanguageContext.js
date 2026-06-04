import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    navDashboard: "Dashboard",
    navCountries: "Countries",
    navUniversities: "Universities",
    navPrograms: "Programs",
    navProfile: "Profile",
    navAdmin: "Admin",
    navLogout: "Logout",
    navLogin: "Login",
    navRegister: "Register",
    langName: "English",

    // Common UI buttons & alerts
    btnSave: "Save Changes",
    btnCancel: "Cancel",
    btnDelete: "Delete",
    btnUpdate: "Update",
    btnAdd: "Add New",
    btnLoading: "Loading...",
    btnUpload: "Upload",

    // Dashboard
    dashTitle: "Student Dashboard",
    dashWelcome: "Welcome back, {name}!",
    dashSubtitle: "Manage your applications, check guidelines, prepare for your journey, and prep for IELTS/TOEFL.",
    
    // Application Tasks
    taskManagerTitle: "Application Planner",
    taskManagerSubtitle: "Track deadlines, steps, and progress for each school application.",
    taskCompleted: "Completed Tasks",
    taskCompletedRing: "Completion Progress",
    taskTitle: "Task Title",
    taskDueDate: "Due Date",
    taskStatus: "Status",
    taskActions: "Actions",
    taskAddModal: "Add Application Task",
    taskPlaceholder: "e.g., Send WES Credentials",
    statusPending: "Pending",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    
    // Document Checklist
    docTitle: "Document Checklist",
    docSubtitle: "Keep track of required documents. Submit your Google Drive URLs below.",
    docType: "Document Type",
    docStatus: "Status",
    docDriveUrl: "Google Drive Share Link",
    docMissing: "Missing",
    docSubmitted: "Submitted",
    docVerified: "Verified",
    docVerifyBtn: "Submit URL",
    docLinkPlaceholder: "https://drive.google.com/...",

    // Pre-Departure
    prepTitle: "Pre-Departure Checklist",
    prepSubtitle: "Prepare for your international travel with this essential checklist.",
    prepReadyText: "Ready for Takeoff",
    prepAccommodation: "Secure Student Housing",
    prepFlight: "Book Flight Tickets",
    prepVisa: "Stamp & Copy Study Visa",
    prepForex: "Obtain Forex/Multi-currency Card",
    prepBaggage: "Pack Travel & Study Essentials",

    // Country guidelines
    guideTitle: "Country Visa & Work Guidelines",
    guideVisa: "Visa Requirements",
    guideWork: "Work Permit Rules",
    guideCost: "Estimated Cost of Living",
    guideGeneral: "General Guidelines",
    
    // Resource library
    resourceTitle: "Resource & Preparation Library",
    resourceSubtitle: "Curated materials and resources for IELTS, TOEFL, and Visa guidelines.",
    resourceCategory: "Category",
    resourceAll: "All Resources",
    resourceExternalLink: "Visit Resource Link",
    resourceDownload: "Download Materials",

    // Notification Alerts
    notifTitle: "Action Center Alerts",
    notifUrgent: "URGENT",
    notifWarning: "WARNING",
    notifNoAlerts: "No urgent alerts or deadlines at this time.",

    // AI SOP Reviewer
    sopReviewBtn: "AI SOP Review",
    sopReviewTitle: "AI Statement of Purpose (SOP) Analyzer"
  },
  bn: {
    // Navigation
    navDashboard: "ড্যাশবোর্ড",
    navCountries: "দেশসমূহ",
    navUniversities: "বিশ্ববিদ্যালয়সমূহ",
    navPrograms: "প্রোগ্রামসমূহ",
    navProfile: "প্রোফাইল",
    navAdmin: "এডমিন",
    navLogout: "লগআউট",
    navLogin: "লগইন",
    navRegister: "নিবন্ধন",
    langName: "বাংলা",

    // Common UI buttons & alerts
    btnSave: "পরিবর্তন সংরক্ষণ করুন",
    btnCancel: "বাতিল",
    btnDelete: "মুছে ফেলুন",
    btnUpdate: "আপডেট",
    btnAdd: "নতুন যোগ করুন",
    btnLoading: "লোড হচ্ছে...",
    btnUpload: "আপলোড",

    // Dashboard
    dashTitle: "শিক্ষার্থী ড্যাশবোর্ড",
    dashWelcome: "স্বাগতম, {name}!",
    dashSubtitle: "আপনার আবেদনগুলি পরিচালনা করুন, নির্দেশিকা দেখুন, ভ্রমণের প্রস্তুতি নিন এবং IELTS/TOEFL এর প্রস্তুতি নিন।",

    // Application Tasks
    taskManagerTitle: "আবেদন পরিকল্পনাকারী",
    taskManagerSubtitle: "প্রতিটি বিশ্ববিদ্যালয়ের আবেদনের শেষ সময়, পদক্ষেপ এবং অগ্রগতি ট্র্যাক করুন।",
    taskCompleted: "সম্পন্ন কাজসমূহ",
    taskCompletedRing: "সম্পন্ন হওয়ার অগ্রগতি",
    taskTitle: "কাজের নাম",
    taskDueDate: "শেষ সময়",
    taskStatus: "অবস্থা",
    taskActions: "পদক্ষেপ",
    taskAddModal: "আবেদন কাজ যোগ করুন",
    taskPlaceholder: "যেমন: WES সার্টিফিকেট প্রেরণ",
    statusPending: "অপেক্ষমান",
    statusInProgress: "চলমান",
    statusCompleted: "সম্পন্ন",

    // Document Checklist
    docTitle: "নথিপত্র চেকলিস্ট",
    docSubtitle: "প্রয়োজনীয় নথিপত্র ট্র্যাক করুন। আপনার গুগল ড্রাইভ লিঙ্কটি নিচে জমা দিন।",
    docType: "নথির ধরণ",
    docStatus: "অবস্থা",
    docDriveUrl: "গুগল ড্রাইভ শেয়ার লিঙ্ক",
    docMissing: "অনুপস্থিত",
    docSubmitted: "জমা দেওয়া হয়েছে",
    docVerified: "যাচাইকৃত",
    docVerifyBtn: "লিঙ্ক জমা দিন",
    docLinkPlaceholder: "https://drive.google.com/...",

    // Pre-Departure
    prepTitle: "ভ্রমণ পূর্ববর্তী চেকলিস্ট",
    prepSubtitle: "আপনার আন্তর্জাতিক ভ্রমণের জন্য এই প্রয়োজনীয় চেকলিস্টটি প্রস্তুত করুন।",
    prepReadyText: "ভ্রমণের প্রস্তুতি",
    prepAccommodation: "শিক্ষার্থী আবাসন নিশ্চিত করুন",
    prepFlight: "উড়োজাহাজের টিকিট বুক করুন",
    prepVisa: "স্টাডি ভিসা কপি ও স্ট্যাম্প করুন",
    prepForex: "ফরেক্স/মাল্টি-কারেন্সি কার্ড সংগ্রহ করুন",
    prepBaggage: "ভ্রমণ ও পড়ার প্রয়োজনীয় জিনিসপত্র প্যাক করুন",

    // Country guidelines
    guideTitle: "দেশের ভিসা এবং কাজের নির্দেশিকা",
    guideVisa: "ভিসা প্রয়োজনীয়তা",
    guideWork: "কাজের অনুমতি নিয়মাবলী",
    guideCost: "আনুমানিক জীবনযাত্রার খরচ",
    guideGeneral: "সাধারণ নির্দেশিকা",

    // Resource library
    resourceTitle: "রিসোর্স ও প্রস্তুতি লাইব্রেরি",
    resourceSubtitle: "IELTS, TOEFL এবং ভিসার জন্য সংগৃহীত প্রস্তুতিমূলক রিসোর্সসমূহ।",
    resourceCategory: "বিভাগ",
    resourceAll: "সব রিসোর্স",
    resourceExternalLink: "রিসোর্স লিঙ্ক দেখুন",
    resourceDownload: "উপকরণ ডাউনলোড করুন",

    // Notification Alerts
    notifTitle: "গুরুত্বপূর্ণ অ্যাকশন সেন্টার অ্যালার্ট",
    notifUrgent: "জরুরী",
    notifWarning: "সতর্কতা",
    notifNoAlerts: "এই মুহূর্তে কোনো জরুরী অ্যালার্ট বা ডেডলাইন নেই।",

    // AI SOP Reviewer
    sopReviewBtn: "এআই এসওপি রিভিউ",
    sopReviewTitle: "এআই স্টেটমেন্ট অফ পারপাস (SOP) বিশ্লেষক"
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'bn' : 'en'));
  };

  const t = (key, params = {}) => {
    let text = translations[lang][key] || translations['en'][key] || key;
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
