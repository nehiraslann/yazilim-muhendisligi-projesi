/**
 * nameTranslator.js  (Backend)
 * Server-side product name translation utility.
 * Used by:
 *   - Migration script (to populate name_en column)
 *   - productController / recommendationController / outfitController
 *     when name_en is missing (graceful fallback)
 */

// ── Turkish → English word dictionary ────────────────────────────────────────
const TR_EN = {
  // Colors
  'Lila': 'Lilac', 'Sarı': 'Yellow', 'Sari': 'Yellow', 'Pembe': 'Pink',
  'Mavi': 'Blue', 'Yeşil': 'Green', 'Yesil': 'Green', 'Kırmızı': 'Red',
  'Siyah': 'Black', 'Beyaz': 'White', 'Gri': 'Grey', 'Mor': 'Purple',
  'Bej': 'Beige', 'Kahverengi': 'Brown', 'Lacivert': 'Navy', 'Bordo': 'Burgundy',
  'Turkuaz': 'Turquoise', 'Haki': 'Khaki', 'Hardal': 'Mustard', 'Krem': 'Cream',
  'Somon': 'Salmon', 'Pudra': 'Powder', 'Ekru': 'Ecru', 'Altın': 'Gold',
  'Gümüş': 'Silver', 'Taba': 'Tan', 'Antrasit': 'Charcoal',
  'Gök': 'Sky', 'Buz': 'Ice', 'Açık': 'Light', 'Koyu': 'Dark',
  'Gece': 'Night', 'Nane': 'Mint', 'Zeytin': 'Olive', 'Zümrüt': 'Emerald',
  'Gül': 'Rose', 'Kurusu': 'Dry', 'Vişne': 'Cherry', 'Kiremit': 'Terracotta',
  'Mercan': 'Coral',

  // Garment types — single words
  'Bluz': 'Blouse', 'Elbise': 'Dress', 'Etek': 'Skirt', 'Pantolon': 'Trousers',
  'Gömlek': 'Shirt', 'Kazak': 'Sweater', 'Ceket': 'Jacket', 'Hırka': 'Cardigan',
  'Mont': 'Coat', 'Kaban': 'Overcoat', 'Palto': 'Coat', 'Yelek': 'Vest',
  'Body': 'Bodysuit', 'Crop': 'Crop', 'Tunik': 'Tunic', 'Tulum': 'Jumpsuit',
  'Jile': 'Pinafore', 'Atlet': 'Tank Top', 'Triko': 'Knit',
  'Tişört': 'T-Shirt', 'Tisort': 'T-Shirt', 'T-Shirt': 'T-Shirt',
  'Tayt': 'Leggings', 'Şort': 'Shorts', 'Korse': 'Corset',
  'Top': 'Top', 'Svitşört': 'Sweatshirt', 'Sweatshirt': 'Sweatshirt',
  'Wideleg': 'Wide-Leg', 'Bustiyer': 'Bustier',
  'Trençkot': 'Trench Coat', 'Blazer': 'Blazer', 'Bomber': 'Bomber',

  // Shoes
  'Ayakkabı': 'Shoes', 'Bot': 'Boots', 'Çizme': 'Boots', 'Sandalet': 'Sandals',
  'Sneaker': 'Sneakers', 'Terlik': 'Slippers', 'Topuklu': 'Heels', 'Babet': 'Flats',
  'Loafer': 'Loafers', 'Stiletto': 'Stilettos', 'Platform': 'Platform',

  // Accessories
  'Çanta': 'Bag', 'Saat': 'Watch', 'Kemer': 'Belt', 'Gözlük': 'Sunglasses',
  'Kolye': 'Necklace', 'Küpe': 'Earrings', 'Yüzük': 'Ring', 'Bileklik': 'Bracelet',
  'Cüzdan': 'Wallet', 'Şapka': 'Hat',

  // Fabric & detail descriptors
  'Saten': 'Satin', 'Şifon': 'Chiffon', 'Dantel': 'Lace', 'Keten': 'Linen',
  'Denim': 'Denim', 'Kadife': 'Velvet', 'Organza': 'Organza', 'Örgü': 'Knit',
  'Deri': 'Leather', 'Suni': 'Faux', 'Baskı': 'Print',
  'Dokuma': 'Woven', 'İpek': 'Silk', 'Süet': 'Suede', 'Yün': 'Wool',

  // Style & detail words
  'Basic': 'Basic', 'Modern': 'Modern', 'Klasik': 'Classic',
  'Mini': 'Mini', 'Maxi': 'Maxi', 'Midi': 'Midi', 'Oversize': 'Oversize',
  'Slim': 'Slim', 'Fit': 'Fit', 'Zincirli': 'Chain',
  'Yüksek': 'High', 'Dar': 'Slim', 'Uzun': 'Long', 'Kısa': 'Short',
  'Balıkçı': 'Turtleneck',
  'Askılı': 'Strapped', 'Askili': 'Strapped',
  'Drapeli': 'Draped', 'Zarif': 'Elegant', 'Şık': 'Chic',
  'Minimal': 'Minimal', 'Tasarım': 'Design', 'Sade': 'Simple',
  'Günlük': 'Casual', 'Casual': 'Casual', 'Spor': 'Sporty',
  'Bohem': 'Bohemian', 'Jean': 'Denim', 'Kot': 'Denim',
  'Mom': 'Mom', 'Kargo': 'Cargo', 'Plazzo': 'Palazzo',
  'Jeans': 'Jeans', 'Desenli': 'Patterned',
  'Kapüşonlu': 'Hooded', 'Çiçekli': 'Floral', 'Kolsuz': 'Sleeveless',
  'Yazlık': 'Summer',

  // 2-word garment combos (checked before single-word lookup)
  'Dış Giyim': 'Outerwear',
  'Üst Giyim': 'Tops',
  'Alt Giyim': 'Bottoms',
  'Askılı Elbise': 'Slip Dress',
  'Midi Elbise':   'Midi Dress',
  'Mini Elbise':   'Mini Dress',
  'Crop Tişört':   'Crop T-Shirt',
  'Crop Kazak':    'Crop Sweater',
  'Jean Pantolon': 'Jeans',
  'Mom Jean':      'Mom Jeans',
  'Kargo Pantolon':'Cargo Pants',
  'Mini Etek':     'Mini Skirt',
  'Uzun Etek':     'Maxi Skirt',
  'Kot Etek':      'Denim Skirt',
  'Deri Ceket':    'Leather Jacket',
  'Blazer Ceket':  'Blazer Jacket',
  'Bomber Ceket':  'Bomber Jacket',
  'Spor Ayakkabı': 'Sneakers',

  // 2-word color combos
  'Açık Mavi':     'Light Blue',
  'Gök Mavisi':    'Sky Blue',
  'Gece Mavisi':   'Midnight Blue',
  'Buz Mavisi':    'Ice Blue',
  'Hardal Sarısı': 'Mustard Yellow',
  'Pudra Pembesi': 'Powder Pink',
  'Gül Kurusu':    'Dusty Rose',
  'Zümrüt Yeşili': 'Emerald Green',
  'Nane Yeşili':   'Mint Green',
  'Haki Yeşili':   'Olive Green',
  'Orman Yeşili':  'Forest Green',
  'Zeytin Yeşili': 'Olive',
  'Gece Siyahı':   'Jet Black',
  'Su Yeşili':     'Aqua',
};

/**
 * Translate a Turkish product name to English, token by token.
 * Checks 2-word combos first, then falls back to single-word lookup.
 * Unrecognized words are kept as-is.
 *
 * @param {string} name  - Turkish name from DB
 * @returns {string}     - English translation
 */
export const translateToEn = (name) => {
  if (!name) return name;

  const words = name.trim().split(/\s+/);
  const result = [];
  let i = 0;

  while (i < words.length) {
    // Try 2-word combo first
    if (i + 1 < words.length) {
      const twoWord = `${words[i]} ${words[i + 1]}`;
      if (TR_EN[twoWord]) {
        result.push(TR_EN[twoWord]);
        i += 2;
        continue;
      }
    }
    // Single word lookup
    result.push(TR_EN[words[i]] || words[i]);
    i++;
  }

  return result.join(' ');
};

/**
 * Pick the localised name from a product row.
 * Falls back gracefully: name_en → name_tr → name
 *
 * @param {object} product  - DB row with name, name_tr, name_en fields
 * @param {string} lang     - 'tr' | 'en'
 * @returns {string}
 */
export const localisedName = (product, lang = 'tr') => {
  if (lang === 'en') {
    return product.name_en || product.name_tr || product.name || '';
  }
  return product.name_tr || product.name || '';
};

/**
 * Translate arbitrary text via MyMemory API (Free, rate limited).
 * Gracefully falls back to original text on any error.
 */
export const translateDescriptionAPI = async (text) => {
  if (!text) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=tr|en`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    if (data && data.responseData && data.responseData.translatedText) {
      // MyMemory sometimes returns warning messages if limit reached
      if (data.responseStatus !== 200 && data.responseStatus !== 201) return text;
      return data.responseData.translatedText;
    }
    return text;
  } catch (err) {
    console.error('Translation API error:', err.message);
    return text;
  }
};

/**
 * Pick the localised description from a product row.
 */
export const localisedDescription = (product, lang = 'tr') => {
  if (lang === 'en') {
    return product.description_en || product.description_tr || product.description || '';
  }
  return product.description_tr || product.description || '';
};
