import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Terms of Service</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-4 italic">Last Updated: April 19, 2026</p>
      
      <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing and using StudyGlobe, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">2. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating an account.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">3. Use of AI Features</h2>
          <p>The AI-generated roadmaps and recommendations are for informational purposes only. While we strive for accuracy, these outputs are based on available data and AI models. Users should verify application requirements with official university sources.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">4. Intellectual Property</h2>
          <p>The content, features, and functionality of StudyGlobe are and will remain the exclusive property of the StudyGlobe Capstone Project team and its licensors.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">5. Limitation of Liability</h2>
          <p>In no event shall StudyGlobe be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the platform.</p>
        </section>

        <section className="pt-6 border-t border-gray-100 dark:border-gray-700">
          <p>For any questions regarding these terms, please reach out to <span className="text-blue-600 dark:text-blue-400 font-medium">legal@studyglobe.com</span></p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
