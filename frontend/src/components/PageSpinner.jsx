import React from 'react';

const PageSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
    <p className="text-gray-500 dark:text-gray-400 text-sm">Loading…</p>
  </div>
);

export default PageSpinner;
