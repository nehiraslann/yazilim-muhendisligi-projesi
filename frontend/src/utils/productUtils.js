export const SEASON_GROUPS = [
  { id: 'summerCool', name: 'Summer Cool', desc: 'Acik, pastel ve soguk alt tonlu ferah renkler.', color: '#e0f7fa' },
  { id: 'autumnWarm', name: 'Autumn Warm', desc: 'Derin, sicak, zengin ve dogal toprak tonlari.', color: '#fff3e0' },
  { id: 'winterCool', name: 'Winter Cool', desc: 'Keskin, soguk, net ve yuksek kontrastli renkler.', color: '#e3f2fd' },
  { id: 'springWarm', name: 'Spring Warm', desc: 'Canli, enerjik, sicak ve taze pastel tonlar.', color: '#fce4ec' },
];

export const STYLE_TAGS = ['casual', 'chic', 'sporty', 'classic', 'bohemian', 'minimal', 'streetwear'];

export const getSeasonColor = (seasonId) => {
  const season = SEASON_GROUPS.find((item) => item.id === seasonId);
  return season ? season.color : '#e0e0e0';
};

export const CATEGORY_MAPPING = {
  tops: ['Bluz', 'Gomlek', 'Gömlek', 'T-Shirt', 'Tisort', 'Tişört', 'Kazak', 'Ust', 'Üst', 'Body', 'Top', 'Svitşört', 'Sweatshirt', 'Ceket', 'Atlet', 'Tunik', 'Triko', 'Crop', 'Bustiyer'],
  bottoms: ['Pantolon', 'Etek', 'Sort', 'Şort', 'Tayt', 'Alt', 'Plazzo', 'Mini Etek', 'Uzun Etek', 'Kot Etek', 'Jean', 'Kargo', 'Mom Jean', 'Wideleg'],
  dresses: ['Elbise', 'Jile', 'Tulum'],
  outerwear: ['Mont', 'Hirka', 'Hırka', 'Kaban', 'Trenckot', 'Trençkot', 'Ceket', 'Palto', 'Yelek', 'Dis', 'Dış', 'Deri Ceket', 'Blazer', 'Bomber', 'Yagmurluk', 'Yağmurluk'],
  shoes: ['Ayakkabi', 'Ayakkabı', 'Bot', 'Cizme', 'Çizme', 'Sandalet', 'Spor Ayakkabi', 'Spor Ayakkabı', 'Sneaker', 'Terlik', 'Topuklu', 'Babet'],
  accessories: ['Canta', 'Çanta', 'Saat', 'Kemer', 'Gozluk', 'Gözlük', 'Taki', 'Takı', 'Sapka', 'Şapka', 'Aksesuar', 'Kolye', 'Kupe', 'Küpe', 'Yuzuk', 'Yüzük', 'Bileklik', 'Cuzdan', 'Cüzdan'],
};

export const COLOR_GROUPS = {
  Siyah: ['Siyah', 'Klasik Siyah', 'Gece Siyahi', 'Gece Siyahı', 'Antrasit'],
  Beyaz: ['Beyaz', 'Saf Beyaz', 'Soft Beyaz', 'Safbeyaz', 'Kar Beyazi', 'Kar Beyazı'],
  Bej: ['Bej', 'Krem', 'Ekru', 'Kemik', 'Fildisi', 'Fildişi'],
  Gri: ['Gri', 'Gumus', 'Gümüş', 'Metalik', 'Fume', 'Füme'],
  Kahverengi: ['Kahverengi', 'Cikolata Kahve', 'Çikolata Kahve', 'Aci Kahve', 'Acı Kahve', 'Kahve', 'Taba', 'Tarcin', 'Tarçın'],
  Mavi: ['Mavi', 'Acik Mavi', 'Açık Mavi', 'Gok Mavisi', 'Gök Mavisi', 'Gece Mavisi', 'Buz Mavisi', 'Buzmavisi', 'Gökmavisi', 'Lacivert', 'Kot', 'Turkuaz'],
  Yesil: ['Yesil', 'Yeşil', 'Zumrut Yesili', 'Zümrüt Yeşili', 'Haki', 'Zeytin Yesili', 'Zeytin Yeşili', 'Nane Yesili', 'Nane Yeşili', 'Haki Yesili', 'Haki Yeşili', 'Orman Yesili', 'Orman Yeşili', 'Su Yesili', 'Su Yeşili'],
  Kirmizi: ['Kirmizi', 'Kırmızı', 'Bordo', 'Sarap Kirmizisi', 'Şarap Kırmızısı', 'Kiremit', 'Visne', 'Vişne'],
  Sari: ['Sari', 'Sarı', 'Hardal', 'Hardal Sarisi', 'Hardal Sarısı', 'Altin Sarisi', 'Altın Sarısı'],
  Pembe: ['Pembe', 'Pudra', 'Pudra Pembesi', 'Gul Kurusu', 'Gül Kurusu', 'Somon'],
  Mor: ['Mor', 'Lila', 'Lavanta', 'Murdum', 'Mürdüm'],
};

export const generateDisplayName = (product) => {
  return product?.display_name || product?.name || 'Stil Urunu';
};

export const getColorHex = (colorName) => {
  if (!colorName) {
    return '#ccc';
  }

  const colorMap = {
    Siyah: '#1a1a1a',
    Beyaz: '#fdfdfd',
    Kahverengi: '#6E4B3A',
    Mavi: '#3A7CA5',
    Yesil: '#4A7C59',
    Yeşil: '#4A7C59',
    Kirmizi: '#B0413E',
    Kırmızı: '#B0413E',
    Sari: '#F9C22E',
    Sarı: '#F9C22E',
    Pembe: '#DDA7A5',
    Mor: '#7B6B9B',
    Gri: '#B8B8B8',
    Bej: '#E8DCC4',
    Altin: '#D4AF37',
    Altın: '#D4AF37',
    Mercan: '#FF7F50',
    Bordo: '#641C34',
    Haki: '#556B2F',
    Somon: '#FA8072',
    Gumus: '#C0C0C0',
    Gümüş: '#C0C0C0',
    Lacivert: '#1B263B',
    Turkuaz: '#40E0D0',
    Hardal: '#E1AD01',
    Lila: '#C8A2C8',
    Antrasit: '#36454F',
    Ekru: '#F3EFE0',
    'Buz Mavisi': '#AEECEF',
    'Gece Mavisi': '#191970',
    'Gul Kurusu': '#D68A9A',
    'Gül Kurusu': '#D68A9A',
    Taba: '#9C5B28',
  };

  return colorMap[colorName] || '#ccc';
};
