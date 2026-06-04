import React, { useState, useEffect } from 'react';
import { predepartureAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const PreDeparturePage = () => {
  const { t, lang } = useLanguage();
  const [completedItems, setCompletedItems] = useState({});
  const [loading, setLoading] = useState(true);

  // Standard Travel Checklist Items
  const checklistItems = [
    { key: 'accommodation', label: t('prepAccommodation'), emoji: '🏠', desc: lang === 'en' ? 'Book student hostel or shared apartment near your campus.' : 'আপনার ক্যাম্পাসের কাছাকাছি শিক্ষার্থী হোস্টেল বা যৌথ অ্যাপার্টমেন্ট বুক করুন।' },
    { key: 'flight_booked', label: t('prepFlight'), emoji: '✈️', desc: lang === 'en' ? 'Purchase flight tickets and check baggage allowances.' : 'উড়োজাহাজের টিকিট কিনুন এবং লাগেজ এলাউন্স চেক করুন।' },
    { key: 'visa_copy', label: t('prepVisa'), emoji: '🛂', desc: lang === 'en' ? 'Keep digital and physical copies of your study visa & passport.' : 'আপনার স্টাডি ভিসা এবং পাসপোর্টের ডিজিটাল এবং শারীরিক অনুলিপি রাখুন।' },
    { key: 'forex_card', label: t('prepForex'), emoji: '💳', desc: lang === 'en' ? 'Load multi-currency travel card and keep minor cash.' : 'মাল্টি-কারেন্সি ট্রাভেল কার্ড লোড করুন এবং কিছু নগদ অর্থ রাখুন।' },
    { key: 'baggage_essentials', label: t('prepBaggage'), emoji: '🧳', desc: lang === 'en' ? 'Pack warm clothes, academic transcripts, and emergency medicine.' : 'উষ্ণ পোশাক, একাডেমিক সার্টিফিকেট এবং জরুরী ওষুধ প্যাক করুন।' }
  ];

  useEffect(() => {
    fetchPreDeparture();
  }, []);

  const fetchPreDeparture = async () => {
    try {
      setLoading(true);
      const res = await predepartureAPI.get();
      const mapped = {};
      res.data.forEach(item => {
        mapped[item.item_key] = item.is_completed;
      });
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
      // Rollback on error
      setCompletedItems(prev => ({ ...prev, [itemKey]: !nextVal }));
    }
  };

  const completedCount = checklistItems.filter(item => completedItems[item.key]).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  // Dynamic travel message
  const getTravelMessage = () => {
    if (progressPercent === 100) return lang === 'en' ? '✈️ All set for takeoff! Have a safe and amazing journey!' : '✈️ ভ্রমণের জন্য সম্পূর্ণ প্রস্তুত! শুভ এবং নিরাপদ যাত্রা হোক!';
    if (progressPercent >= 60) return lang === 'en' ? '🎒 Packing looks solid, almost ready to fly!' : '🎒 প্যাকিং প্রায় শেষ, ওড়ার জন্য প্রায় প্রস্তুত!';
    if (progressPercent >= 20) return lang === 'en' ? '🗺️ Good start! Keep checking off items.' : '🗺️ চমৎকার শুরু! বাকি জিনিসপত্রগুলো চেকলিস্ট করতে থাকুন।';
    return lang === 'en' ? '📋 Let\'s start preparing for your travel!' : '📋 চলুন আপনার ভ্রমণের প্রস্তুতি শুরু করি!';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 dark:text-gray-100">
      
      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <span className="bg-amber-600/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            {t('prepReadyText')}
          </span>
          <h1 className="text-3xl font-black">{t('prepTitle')}</h1>
          <p className="opacity-90 max-w-xl text-sm md:text-base">{t('prepSubtitle')}</p>
          
          {/* Gauge Meter */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
              <span>{getTravelMessage()}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-amber-600/30 h-4 rounded-full overflow-hidden border border-white/20">
              <div
                className="bg-white h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 text-9xl opacity-10 font-bold select-none pointer-events-none translate-y-6 translate-x-6">
          ✈️
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        {loading ? (
          <p className="text-gray-500 text-center py-6">{t('btnLoading')}</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {checklistItems.map(item => {
              const isChecked = !!completedItems[item.key];

              return (
                <div
                  key={item.key}
                  onClick={() => handleToggleItem(item.key)}
                  className="flex items-start gap-4 py-5 hover:bg-gray-50/50 dark:hover:bg-gray-900/10 px-4 rounded-xl cursor-pointer transition-all select-none"
                >
                  <div className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Handled by onClick of full div
                      className="w-5 h-5 text-amber-500 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                    />
                  </div>
                  <div className="text-2xl mt-0.5">{item.emoji}</div>
                  <div className="space-y-1">
                    <h3 className={`font-bold text-base text-gray-800 dark:text-white ${isChecked ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                      {item.label}
                    </h3>
                    <p className={`text-xs md:text-sm text-gray-500 dark:text-gray-400 ${isChecked ? 'opacity-50' : ''}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default PreDeparturePage;
