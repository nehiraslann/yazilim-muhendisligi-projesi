const DEFAULT_LOCALE = 'tr-TR';

export const formatPrice = (value, locale = DEFAULT_LOCALE) => (
  `${Number(value || 0).toLocaleString(locale)} ₺`
);

export const formatShortDate = (value, locale = DEFAULT_LOCALE) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString(locale);
};
