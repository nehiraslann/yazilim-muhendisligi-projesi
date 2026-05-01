const sanitizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
    .normalize('NFKD');

export const normalizeColor = (color) => {
  if (!color) return '';

  const normalized = sanitizeText(color);
  if (normalized.includes('mavi')) return 'mavi';
  if (normalized.includes('yesil')) return 'yesil';
  if (normalized.includes('beyaz')) return 'beyaz';
  if (normalized.includes('siyah')) return 'siyah';
  if (normalized.includes('bej')) return 'bej';
  if (normalized.includes('bordo')) return 'bordo';
  if (normalized.includes('pembe')) return 'pembe';
  if (normalized.includes('sari')) return 'sari';
  if (normalized.includes('kahve')) return 'kahverengi';

  return normalized;
};

export const generateItemDisplayName = (item) => {
  const color = normalizeColor(item.color_name);
  const displayColor = color.charAt(0).toUpperCase() + color.slice(1);
  const category = sanitizeText(item.category_name || '');

  const categoryLabels = {
    tops: 'Top',
    bottoms: 'Bottom',
    dresses: 'Dress',
    outerwear: 'Jacket',
    shoes: 'Shoes',
    bags: 'Bag',
    accessories: 'Accessory',
  };

  const cleanCategory = categoryLabels[category] || item.category_name || 'Item';
  return `${displayColor} ${cleanCategory}`;
};
