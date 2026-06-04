import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold text-blue-700 dark:text-blue-400">
            StudyGlobe
          </div>
          <div className="flex gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
            <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Terms of Service</Link>
            <a href="mailto:support@studyglobe.com" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Contact Support</a>
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-500 italic">
            &copy; {new Date().getFullYear()} StudyGlobe Capstone Project. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
