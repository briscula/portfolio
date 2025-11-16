'use client';

import dynamic from 'next/dynamic';

// Dynamically import LanguageSwitcher with no SSR to prevent hydration issues
const LanguageSwitcher = dynamic(() => import('./LanguageSwitcher'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700">
      <span className="text-lg">🇺🇸</span>
      <span className="hidden sm:block">English</span>
    </div>
  ),
});

export default LanguageSwitcher;