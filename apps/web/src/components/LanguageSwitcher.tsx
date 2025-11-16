'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, use, useEffect } from 'react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Ensure we're on the client side to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Unwrap params Promise with React.use() for Next.js 15+
  const resolvedParams = params instanceof Promise ? use(params) : params;
  
  // Get current locale from params, with consistent fallback
  const currentLocale = isClient ? (resolvedParams?.locale as string) || 'en' : 'en';
  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  const getLocalizedPath = (locale: string) => {
    // Remove current locale from pathname and add new locale
    const pathWithoutLocale = pathname?.replace(/^\/[a-z]{2}/, '') || '';
    return `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
  };

  // Don't render interactive elements until client-side to avoid hydration issues
  if (!isClient) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700">
        <span className="text-lg">🇺🇸</span>
        <span className="hidden sm:block">English</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="hidden sm:block">{currentLanguage.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {languages.map((language) => (
              <Link
                key={language.code}
                href={getLocalizedPath(language.code)}
                onClick={() => setIsOpen(false)}
                className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                  currentLocale === language.code
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700'
                }`}
              >
                <span className="text-lg mr-3">{language.flag}</span>
                <span>{language.name}</span>
                {currentLocale === language.code && (
                  <svg className="w-4 h-4 ml-auto text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}