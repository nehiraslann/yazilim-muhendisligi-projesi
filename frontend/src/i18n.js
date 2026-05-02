import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import trTranslations from './locales/tr/translation.json';
import enTranslations from './locales/en/translation.json';
import { getPrimaryLanguage, LANGUAGE_STORAGE_KEY } from './utils/i18nUtils';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'tr';
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'tr';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: trTranslations },
      en: { translation: enTranslations }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', (language) => {
  if (typeof window === 'undefined') return;

  const normalizedLanguage = getPrimaryLanguage(language);
  localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage);
  document.documentElement.lang = normalizedLanguage;
});

export default i18n;
