export const LANGUAGE_STORAGE_KEY = 'styleai-language';

export const getPrimaryLanguage = (value) => {
  const language = typeof value === 'string' ? value : value?.language;
  return language?.split('-')[0] || 'tr';
};

export const isEnglishLanguage = (value) => getPrimaryLanguage(value) === 'en';

export const getLanguageToggleLabel = (value) => (isEnglishLanguage(value) ? 'TR' : 'EN');

export const getLanguageToggleTitle = (value) => (
  isEnglishLanguage(value) ? 'Türkçe Yap' : 'Switch to English'
);

export const toggleAppLanguage = (i18n) => (
  i18n.changeLanguage(isEnglishLanguage(i18n) ? 'tr' : 'en')
);

export const safeT = (t, key, fallback = '') => {
  const translated = t(key);
  return !translated || translated === key ? fallback : translated;
};
