export const fallbackImage = 'https://placehold.co/400x500/f5f0ea/8a735a?text=G%C3%B6rsel+Yok';

export const isValidImage = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};

const normalizeAssetBase = (value) => value.replace(/\/api\/?$/, '').replace(/\/$/, '');

const getAssetBase = () => normalizeAssetBase(import.meta.env.VITE_API_URL || 'http://localhost:3000');

export const formatUrl = (url) => {
  if (!url) return fallbackImage;

  let parsedUrl = url.trim();
  const assetBase = getAssetBase();

  if (/^https?:\/\/localhost:5000/i.test(parsedUrl)) {
    parsedUrl = parsedUrl.replace(/^https?:\/\/localhost:5000/i, assetBase);
  }

  if (parsedUrl.startsWith('http://') || parsedUrl.startsWith('https://')) return parsedUrl;
  if (parsedUrl.startsWith('/')) return `${assetBase}${parsedUrl}`;
  return `${assetBase}/images_2/${parsedUrl}`;
};
