import { createContext, useCallback, useMemo, useState } from 'react';

// Add Chichewa (ny) strings here as translations are reviewed. Missing keys fall back to English.
const messages = {
  en: {
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.diagnosis': 'Check my crop',
    'nav.planting': 'Can I plant?',
    'nav.recommendations': 'What to plant',
    'nav.officer': 'Outbreaks',
    'nav.admin': 'Admin',
    'nav.profile': 'My profile',
    'nav.logout': 'Log out',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.retry': 'Try again',
  },
  ny: {},
};

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('farmai.lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('farmai.lang', lang);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback((key) => messages[language]?.[key] ?? messages.en[key] ?? key, [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
