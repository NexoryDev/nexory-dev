import { createContext, useContext, useState, useEffect } from 'react';
import de from '../i18n/de.json';
import en from '../i18n/en.json';

const translations = { de, en };
const LanguageContext = createContext(null);

function getInitialLanguage() {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage === 'de' || savedLanguage === 'en') {
    return savedLanguage;
  }

  const browserLanguage = navigator.language?.slice(0, 2).toLowerCase();
  return browserLanguage === 'de' ? 'de' : 'en';
}

function sendLanguageToBackend(language) {
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  if (isLocal) {
    return Promise.resolve();
  }

  return fetch('/api/language.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`language sync failed: ${response.status}`);
      }
    })
    .catch(() => {
      // Backend sync is best effort only.
    });
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;

    sendLanguageToBackend(language);
  }, [language]);

  function t(key) {
    return translations[language]?.[key] ?? translations.en?.[key] ?? key;
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
