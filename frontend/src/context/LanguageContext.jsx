import { createContext, useContext, useState, useEffect } from 'react';
import de from '../i18n/de.json';
import en from '../i18n/en.json';

const translations = { de, en };
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'de' || saved === 'en') return saved;

    const browserLang = navigator.language?.slice(0, 2).toLowerCase();
    return browserLang === 'de' ? 'de' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;

    fetch('/api/language', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language }),
    }).catch(() => {
    });
  }, [language]);

  function t(key) {
    return translations[language]?.[key]
      ?? translations['en']?.[key]
      ?? key;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
