export const buildNotifications = (tasks, docs, profile, prepItems, lang) => {
  const list = [];

  (tasks || []).forEach((task) => {
    if (task.status !== 'completed' && task.due_date) {
      const due = new Date(task.due_date);
      const diffDays = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        list.push({
          id: `task-${task.id}`,
          title: lang === 'en' ? 'Upcoming Deadline' : 'আসন্ন শেষ সময়',
          detail: lang === 'en'
            ? `Task "${task.title}" is due on ${task.due_date}`
            : `কাজের শেষ সময় ${task.due_date} ("${task.title}")`,
          type: 'task',
          isUrgent: diffDays <= 2,
          date: task.due_date,
          taskObj: task,
        });
      }
    }
  });

  const requiredTypes = [
    'Statement of Purpose (SOP)',
    'Letter of Recommendation 1 (LOR 1)',
    'Letter of Recommendation 2 (LOR 2)',
    'Academic Transcript',
    'Passport Copy',
  ];

  requiredTypes.forEach((docType) => {
    const found = (docs || []).find((d) => d.document_type === docType);
    if (!found || found.status === 'missing') {
      list.push({
        id: `doc-missing-${docType}`,
        title: lang === 'en' ? 'Missing Document' : 'অনুপস্থিত নথিপত্র',
        detail: lang === 'en'
          ? `Please upload your ${docType}`
          : `দয়া করে আপনার ${docType} আপলোড করুন`,
        type: 'document',
        status: 'missing',
        docType,
        isUrgent: false,
      });
    } else if (found.status === 'uploaded') {
      list.push({
        id: `doc-verify-${found.id}`,
        title: lang === 'en' ? 'Verification Pending' : 'যাচাইকরণ পেন্ডিং',
        detail: lang === 'en'
          ? `${docType} is uploaded and waiting for review`
          : `${docType} আপলোড করা হয়েছে এবং যাচাইয়ের অপেক্ষায় আছে`,
        type: 'document',
        status: 'uploaded',
        docType,
        isUrgent: false,
      });
    }
  });

  if (profile) {
    const fields = [
      { name: 'Full Name', val: profile.full_name },
      { name: 'Date of Birth', val: profile.date_of_birth },
      { name: 'Phone', val: profile.phone },
      { name: 'Education Level', val: profile.current_education_level },
      { name: 'Field of Interest', val: profile.field_of_interest },
      { name: 'Preferred Countries', val: profile.preferred_countries },
      { name: 'Budget Range', val: profile.budget_range },
      { name: 'Target Intake', val: profile.target_intake },
    ];
    const missingFields = fields
      .filter((f) => {
        if (Array.isArray(f.val)) return f.val.length === 0;
        return f.val === null || f.val === undefined || String(f.val).trim() === '';
      })
      .map((f) => f.name);

    if (missingFields.length > 0) {
      const pct = Math.round(((fields.length - missingFields.length) / fields.length) * 100);
      list.push({
        id: 'profile-incomplete',
        title: lang === 'en' ? 'Profile Incomplete' : 'প্রোফাইল অসম্পূর্ণ',
        detail: lang === 'en'
          ? `Your profile is only ${pct}% complete. Missing details required for AI admission roadmaps.`
          : `আপনার প্রোফাইল মাত্র ${pct}% সম্পূর্ণ। এআই রোডম্যাপ পাওয়ার জন্য প্রয়োজনীয় বিবরণগুলি যুক্ত করুন।`,
        type: 'profile',
        isUrgent: false,
        missingFields,
        pct,
      });
    }
  }

  (prepItems || [])
    .filter((item) => !item.is_completed)
    .forEach((item) => {
      list.push({
        id: `prep-${item.id}`,
        title: lang === 'en' ? 'Travel Prep Pending' : 'ভ্রমণ প্রস্তুতি পেন্ডিং',
        detail: lang === 'en'
          ? `Reminder: Complete step "${item.title}" for your departure checklist.`
          : `অনুস্মারক: আপনার ভ্রমণ চেকলিস্টের "${item.title}" ধাপটি সম্পন্ন করুন।`,
        type: 'predeparture',
        isUrgent: false,
        prepItem: item,
      });
    });

  return list;
};
