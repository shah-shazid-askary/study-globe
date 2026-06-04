import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Privacy Policy</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-4 italic">Last Updated: April 19, 2026</p>
      
      <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, update your profile, or use our AI roadmap features. This includes your name, email address, education history, and study preferences.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide, maintain, and improve our services.</li>
            <li>To generate personalized AI-driven study roadmaps.</li>
            <li>To communicate with you about updates, security alerts, and support.</li>
            <li>To process and manage your university and program preferences.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">3. Data Security</h2>
          <p>We implement a variety of security measures to maintain the safety of your personal information. Your data is stored securely using industry-standard encryption and access controls provided by Supabase and Vercel.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">4. Cookies</h2>
          <p>StudyGlobe uses cookies and similar tracking technologies to track activity on our service and hold certain information to improve your user experience.</p>
        </section>

        <section className="pt-6 border-t border-gray-100 dark:border-gray-700">
          <p>If you have any questions about this Privacy Policy, please contact us at <span className="text-blue-600 dark:text-blue-400 font-medium">privacy@studyglobe.com</span></p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
