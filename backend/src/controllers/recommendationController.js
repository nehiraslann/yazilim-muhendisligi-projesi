import dbPool from '../config/db.js';
import { normalizeColor, generateItemDisplayName } from '../utils/productHelpers.js';
import { localisedName, localisedDescription } from '../utils/nameTranslator.js';

const VALID_SEASONS = ['summerCool', 'autumnWarm', 'winterCool', 'springWarm', 'allSeasons'];
const VALID_STYLES = ['casual', 'chic', 'sporty', 'classic', 'bohemian', 'minimal', 'streetwear'];

const CORE_GROUPS = new Set(['ust', 'alt', 'elbise', 'ayakkabi']);
const FLEX_GROUPS = new Set(['canta', 'aksesuar']);
const COOL_SEASONS = new Set(['autumnWarm', 'winterCool']);

const SEASON_ALIASES = {
  summer: 'summerCool',
  summercool: 'summerCool',
  summer_cool: 'summerCool',
  autumn: 'autumnWarm',
  autumnwarm: 'autumnWarm',
  autumn_warm: 'autumnWarm',
  fall: 'autumnWarm',
  winter: 'winterCool',
  wintercool: 'winterCool',
  winter_cool: 'winterCool',
  spring: 'springWarm',
  springwarm: 'springWarm',
  spring_warm: 'springWarm',
  allseasons: 'allSeasons',
  all_seasons: 'allSeasons',
};

const STYLE_ALIASES = {
  casual: 'casual',
  chic: 'chic',
  sporty: 'sporty',
  sport: 'sporty',
  spor: 'sporty',
  classic: 'classic',
  bohemian: 'bohemian',
  bohem: 'bohemian',
  minimal: 'minimal',
  minimalist: 'minimal',
  streetwear: 'streetwear',
};

const STYLE_COMPATIBILITY = {
  casual: ['minimal', 'streetwear', 'classic'],
  chic: ['classic', 'minimal', 'casual'],
  sporty: ['streetwear', 'casual', 'minimal'],
  classic: ['chic', 'minimal', 'casual'],
  bohemian: ['casual', 'chic'],
  minimal: ['classic', 'casual', 'chic'],
  streetwear: ['casual', 'sporty', 'minimal'],
};

const STYLE_LABELS = {
  tr: {
    casual: 'Gundelik',
    chic: 'Sik',
    sporty: 'Spor',
    classic: 'Klasik',
    bohemian: 'Bohem',
    minimal: 'Minimal',
    streetwear: 'Sokak',
  },
  en: {
    casual: 'Casual',
    chic: 'Chic',
    sporty: 'Sporty',
    classic: 'Classic',
    bohemian: 'Bohemian',
    minimal: 'Minimal',
    streetwear: 'Streetwear',
  },
};

const SEASON_LABELS = {
  tr: {
    summerCool: 'Summer Cool',
    autumnWarm: 'Autumn Warm',
    winterCool: 'Winter Cool',
    springWarm: 'Spring Warm',
    allSeasons: 'Tum Sezonlar',
  },
  en: {
    summerCool: 'Summer Cool',
    autumnWarm: 'Autumn Warm',
    winterCool: 'Winter Cool',
    springWarm: 'Spring Warm',
    allSeasons: 'All Seasons',
  },
};

const COLOR_LABELS = {
  [normalizeColor('Mavi')]: { tr: 'Mavi', en: 'Blue' },
  [normalizeColor('Beyaz')]: { tr: 'Beyaz', en: 'White' },
  [normalizeColor('Siyah')]: { tr: 'Siyah', en: 'Black' },
  [normalizeColor('Bej')]: { tr: 'Bej', en: 'Beige' },
  [normalizeColor('Bordo')]: { tr: 'Bordo', en: 'Burgundy' },
  [normalizeColor('Pembe')]: { tr: 'Pembe', en: 'Pink' },
  [normalizeColor('Yesil')]: { tr: 'Yesil', en: 'Green' },
  [normalizeColor('Sari')]: { tr: 'Sari', en: 'Yellow' },
  [normalizeColor('Kahverengi')]: { tr: 'Kahverengi', en: 'Brown' },
  [normalizeColor('Lacivert')]: { tr: 'Lacivert', en: 'Navy' },
  [normalizeColor('Gri')]: { tr: 'Gri', en: 'Grey' },
};

const rawSeasonColors = {
  summerCool: ['Pembe', 'Buz Mavisi', 'Gece Mavisi', 'Gok Mavisi', 'Lila', 'Beyaz'],
  autumnWarm: ['Kahverengi', 'Bej', 'Sari', 'Hardal', 'Kiremit', 'Haki', 'Bordo'],
  springWarm: ['Pembe', 'Beyaz', 'Sari', 'Yesil', 'Lila', 'Gok Mavisi'],
  winterCool: ['Siyah', 'Beyaz', 'Bordo', 'Gece Mavisi', 'Buz Mavisi'],
  allSeasons: [],
};

const rawColorPairs = {
  Mavi: ['Beyaz', 'Bej', 'Siyah', 'Gri'],
  Yesil: ['Bej', 'Beyaz', 'Kahverengi'],
  Siyah: ['Beyaz', 'Bej', 'Bordo', 'Gri'],
  Beyaz: ['Siyah', 'Mavi', 'Bej', 'Gri', 'Pembe'],
  Bej: ['Kahverengi', 'Beyaz', 'Bordo', 'Mavi'],
  Bordo: ['Siyah', 'Bej', 'Beyaz'],
  Gri: ['Beyaz', 'Siyah', 'Mavi'],
  Lacivert: ['Beyaz', 'Bej', 'Gri'],
  Kahverengi: ['Bej', 'Beyaz', 'Haki'],
  Pembe: ['Beyaz', 'Gri', 'Bej'],
};

const SEASON_COLOR_KEYWORDS = Object.fromEntries(
  Object.entries(rawSeasonColors).map(([season, colors]) => [
    season,
    new Set(colors.map(color => normalizeColor(color))),
  ]),
);

const COLOR_PAIRS = Object.fromEntries(
  Object.entries(rawColorPairs).map(([color, matches]) => [
    normalizeColor(color),
    matches.map(match => normalizeColor(match)),
  ]),
);

const NEUTRAL_COLORS = new Set(
  ['Beyaz', 'Siyah', 'Bej', 'Gri', 'Lacivert', 'Kahverengi'].map(color => normalizeColor(color)),
);

function cleanText(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/\s+/g, ' ');
}

function normalizeSeasonName(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const compact = cleanText(value).replace(/\s+/g, '');
  if (VALID_SEASONS.includes(value)) {
    return value;
  }

  return SEASON_ALIASES[compact] || null;
}

function normalizeStyleName(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const compact = cleanText(value).replace(/\s+/g, '');
  return STYLE_ALIASES[compact] || compact || null;
}

function detectCategoryGroup(category, productName = '') {
  const searchable = `${cleanText(category)} ${cleanText(productName)}`;

  if (searchable.includes('shoes')) return 'ayakkabi';
  if (searchable.includes('bags')) return 'canta';
  if (searchable.includes('tops')) return 'ust';
  if (searchable.includes('bottoms')) return 'alt';
  if (searchable.includes('dresses')) return 'elbise';
  if (searchable.includes('outerwear')) return 'dis';
  if (searchable.includes('accessories')) return 'aksesuar';

  if (
    searchable.includes('ayakkabi') ||
    searchable.includes('bot') ||
    searchable.includes('cizme') ||
    searchable.includes('sandalet') ||
    searchable.includes('sneaker') ||
    searchable.includes('stiletto') ||
    searchable.includes('loafer') ||
    searchable.includes('babet')
  ) {
    return 'ayakkabi';
  }

  if (
    searchable.includes('canta') ||
    searchable.includes('clutch') ||
    searchable.includes('pouch') ||
    searchable.includes('bag')
  ) {
    return 'canta';
  }

  if (
    searchable.includes('bluz') ||
    searchable.includes('kazak') ||
    searchable.includes('gomlek') ||
    searchable.includes('ust giyim') ||
    searchable.includes('crop') ||
    searchable.includes('hoodie') ||
    searchable.includes('tshirt') ||
    searchable.includes('tisort') ||
    searchable.includes('body') ||
    searchable.includes('sweatshirt')
  ) {
    return 'ust';
  }

  if (
    searchable.includes('pantolon') ||
    searchable.includes('etek') ||
    searchable.includes('alt giyim') ||
    searchable.includes('short') ||
    searchable.includes('sort') ||
    searchable.includes('jean')
  ) {
    return 'alt';
  }

  if (searchable.includes('elbise') || searchable.includes('dress')) {
    return 'elbise';
  }

  if (
    searchable.includes('ceket') ||
    searchable.includes('mont') ||
    searchable.includes('kaban') ||
    searchable.includes('trenckot') ||
    searchable.includes('bomber') ||
    searchable.includes('palto')
  ) {
    return 'dis';
  }

  if (
    searchable.includes('aksesuar') ||
    searchable.includes('kolye') ||
    searchable.includes('sapka') ||
    searchable.includes('gozluk') ||
    searchable.includes('kemer') ||
    searchable.includes('kupe')
  ) {
    return 'aksesuar';
  }

  return 'ust';
}

function buildPools(products) {
  return products.reduce(
    (pools, product) => {
      if (pools[product.category_group]) {
        pools[product.category_group].push(product);
      }

      return pools;
    },
    { ust: [], alt: [], elbise: [], ayakkabi: [], dis: [], canta: [], aksesuar: [] },
  );
}

function canBuildOutfit(pools) {
  const hasDressLook = pools.elbise.length > 0 && pools.ayakkabi.length > 0;
  const hasSplitLook = pools.ust.length > 0 && pools.alt.length > 0 && pools.ayakkabi.length > 0;
  return hasDressLook || hasSplitLook;
}

function areColorsCompatible(firstColor, secondColor) {
  if (!firstColor || !secondColor) {
    return false;
  }

  if (firstColor === secondColor) {
    return true;
  }

  return (
    COLOR_PAIRS[firstColor]?.includes(secondColor) ||
    COLOR_PAIRS[secondColor]?.includes(firstColor) ||
    false
  );
}

function getColorPairScore(firstColor, secondColor) {
  if (!firstColor || !secondColor) {
    return 0;
  }

  if (firstColor === secondColor) {
    return 6;
  }

  if (areColorsCompatible(firstColor, secondColor)) {
    return 5;
  }

  if (NEUTRAL_COLORS.has(firstColor) || NEUTRAL_COLORS.has(secondColor)) {
    return 2;
  }

  return -2;
}

function getStyleStrategy(products, requestedStyle) {
  if (!requestedStyle) {
    return {
      requestedStyle: null,
      compatibleStyles: [],
      fallbackStyle: null,
      hasExactCoreStyle: false,
    };
  }

  const coreProducts = products.filter(product => CORE_GROUPS.has(product.category_group));
  const compatibleStyles = STYLE_COMPATIBILITY[requestedStyle] || [];
  const exactCoreCount = coreProducts.filter(product => product.style_tag === requestedStyle).length;
  const fallbackStyle = compatibleStyles
    .map(style => ({
      style,
      count: coreProducts.filter(product => product.style_tag === style).length,
    }))
    .sort((left, right) => right.count - left.count)[0]?.style || null;

  return {
    requestedStyle,
    compatibleStyles,
    fallbackStyle,
    hasExactCoreStyle: exactCoreCount > 0,
  };
}

function getStyleFitScore(item, styleStrategy) {
  if (!styleStrategy.requestedStyle || !item.style_tag) {
    return 0;
  }

  if (item.style_tag === styleStrategy.requestedStyle) {
    return 14;
  }

  if (styleStrategy.compatibleStyles.includes(item.style_tag)) {
    return item.style_tag === styleStrategy.fallbackStyle ? 10 : 8;
  }

  return -4;
}

function getItemRequestScore(item, request, styleStrategy) {
  let score = 0;
  const isCore = CORE_GROUPS.has(item.category_group);
  const exactSeasonMatch = item.season_group === request.season;
  const allSeasonItem = item.season_group === 'allSeasons';

  if (exactSeasonMatch) {
    score += isCore ? 24 : 16;
  } else if (allSeasonItem) {
    score += isCore ? 16 : 10;
  } else if (FLEX_GROUPS.has(item.category_group)) {
    score += 6;
  } else {
    score -= isCore ? 14 : 8;
  }

  score += getStyleFitScore(item, styleStrategy);

  if (SEASON_COLOR_KEYWORDS[request.season]?.has(item.normalized_color)) {
    score += 8;
  } else if (NEUTRAL_COLORS.has(item.normalized_color)) {
    score += 4;
  }

  if (item.category_group === 'dis') {
    score += COOL_SEASONS.has(request.season) ? 6 : -3;
  }

  if (item.category_group === 'ayakkabi' && exactSeasonMatch) {
    score += 4;
  }

  return score;
}

function sortByRequestFit(items, request, styleStrategy) {
  return [...items].sort((left, right) => {
    const scoreDiff = getItemRequestScore(right, request, styleStrategy) - getItemRequestScore(left, request, styleStrategy);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    const seasonDiff = Number(right.season_group === request.season) - Number(left.season_group === request.season);
    if (seasonDiff !== 0) {
      return seasonDiff;
    }

    return left.id - right.id;
  });
}

function isPreferredSeasonItem(item, season) {
  if (FLEX_GROUPS.has(item.category_group)) {
    return true;
  }

  return item.season_group === season || item.season_group === 'allSeasons';
}

function scoreExtraCandidate(extraItem, coreItems, request, styleStrategy) {
  let score = getItemRequestScore(extraItem, request, styleStrategy);
  coreItems.forEach(coreItem => {
    score += getColorPairScore(extraItem.normalized_color, coreItem.normalized_color);
  });
  return score;
}

function pickBestExtra(pools, coreItems, request, styleStrategy) {
  const usedIds = new Set(coreItems.map(item => item.id));
  const candidates = [];

  const addCandidate = (groupName, minimumScore) => {
    pools[groupName].forEach(item => {
      if (usedIds.has(item.id)) {
        return;
      }

      const score = scoreExtraCandidate(item, coreItems, request, styleStrategy);
      if (score >= minimumScore) {
        candidates.push({ item, score });
      }
    });
  };

  addCandidate('canta', 18);
  addCandidate('aksesuar', 18);
  addCandidate('dis', COOL_SEASONS.has(request.season) ? 18 : 24);

  candidates.sort((left, right) => right.score - left.score || left.item.id - right.item.id);
  return candidates[0]?.item || null;
}

function getDominantStyle(items, requestedStyle) {
  const counts = new Map();

  items.forEach(item => {
    if (!item.style_tag) {
      return;
    }

    counts.set(item.style_tag, (counts.get(item.style_tag) || 0) + 1);
  });

  if (requestedStyle && counts.get(requestedStyle)) {
    const requestedCount = counts.get(requestedStyle);
    const bestCount = Math.max(...counts.values());
    if (requestedCount === bestCount) {
      return requestedStyle;
    }
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] || requestedStyle || 'casual';
}

function getStyleAlignment(items, requestedStyle) {
  if (!requestedStyle) {
    return {
      mode: 'none',
      matchedStyle: getDominantStyle(items, null),
    };
  }

  const coreItems = items.filter(item => CORE_GROUPS.has(item.category_group));
  const exactCount = coreItems.filter(item => item.style_tag === requestedStyle).length;

  if (exactCount >= 2) {
    return {
      mode: 'exact',
      matchedStyle: requestedStyle,
    };
  }

  const compatibleStyles = STYLE_COMPATIBILITY[requestedStyle] || [];
  const compatibleCounts = compatibleStyles
    .map(style => ({
      style,
      count: coreItems.filter(item => item.style_tag === style).length,
    }))
    .filter(entry => entry.count > 0)
    .sort((left, right) => right.count - left.count);

  if (compatibleCounts.length > 0) {
    return {
      mode: 'compatible',
      matchedStyle: compatibleCounts[0].style,
    };
  }

  return {
    mode: exactCount === 1 ? 'partial' : 'generic',
    matchedStyle: getDominantStyle(items, requestedStyle),
  };
}

function scoreOutfit(items, request, styleStrategy) {
  const groups = items.map(item => item.category_group);
  const hasDressLook = groups.includes('elbise') && groups.includes('ayakkabi');
  const hasSplitLook = groups.includes('ust') && groups.includes('alt') && groups.includes('ayakkabi');

  if (!hasDressLook && !hasSplitLook) {
    return 0;
  }

  let score = hasDressLook ? 42 : 46;
  const coreItems = items.filter(item => CORE_GROUPS.has(item.category_group));
  const coreColors = [...new Set(coreItems.map(item => item.normalized_color).filter(Boolean))];

  coreItems.forEach(item => {
    if (item.season_group === request.season) {
      score += 12;
    } else if (item.season_group === 'allSeasons') {
      score += 8;
    } else {
      score -= 12;
    }

    if (request.style) {
      if (item.style_tag === request.style) {
        score += 10;
      } else if ((STYLE_COMPATIBILITY[request.style] || []).includes(item.style_tag)) {
        score += 6;
      } else {
        score -= 3;
      }
    }

    if (SEASON_COLOR_KEYWORDS[request.season]?.has(item.normalized_color)) {
      score += 4;
    }
  });

  for (let index = 0; index < coreColors.length; index += 1) {
    for (let pairIndex = index + 1; pairIndex < coreColors.length; pairIndex += 1) {
      score += getColorPairScore(coreColors[index], coreColors[pairIndex]);
    }
  }

  if (coreColors.length === 1) {
    score += 10;
  } else if (coreColors.length === 2) {
    score += 8;
  } else if (coreColors.length === 3) {
    score += 4;
  } else {
    score -= 2;
  }

  if (COOL_SEASONS.has(request.season) && groups.includes('dis')) {
    score += 5;
  }

  if (groups.includes('canta')) {
    score += 3;
  }

  if (groups.includes('aksesuar')) {
    score += 2;
  }

  if (!styleStrategy.hasExactCoreStyle && request.style) {
    const alignment = getStyleAlignment(items, request.style);
    if (alignment.mode === 'compatible') {
      score += 6;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function createCandidate(items, request, styleStrategy) {
  const uniqueIds = new Set(items.map(item => item.id));
  if (uniqueIds.size !== items.length) {
    return null;
  }

  const orderedItems = [...items];
  const score = scoreOutfit(orderedItems, request, styleStrategy);
  if (score <= 0) {
    return null;
  }

  return {
    items: orderedItems,
    score,
    key: orderedItems.map(item => item.id).join('-'),
    coreIds: orderedItems.filter(item => CORE_GROUPS.has(item.category_group)).map(item => item.id),
  };
}

function addCandidate(candidateMap, items, request, styleStrategy) {
  const candidate = createCandidate(items, request, styleStrategy);
  if (!candidate) {
    return;
  }

  const existing = candidateMap.get(candidate.key);
  if (!existing || candidate.score > existing.score) {
    candidateMap.set(candidate.key, candidate);
  }
}

function generateCandidateOutfits(pools, request, styleStrategy) {
  const candidateMap = new Map();
  const tops = pools.ust.slice(0, 6);
  const bottoms = pools.alt.slice(0, 6);
  const dresses = pools.elbise.slice(0, 5);
  const shoes = pools.ayakkabi.slice(0, 5);

  tops.forEach(top => {
    bottoms.forEach(bottom => {
      shoes.forEach(shoe => {
        const coreItems = [top, bottom, shoe];
        addCandidate(candidateMap, coreItems, request, styleStrategy);

        const extra = pickBestExtra(pools, coreItems, request, styleStrategy);
        if (extra) {
          addCandidate(candidateMap, [...coreItems, extra], request, styleStrategy);
        }
      });
    });
  });

  dresses.forEach(dress => {
    shoes.forEach(shoe => {
      const coreItems = [dress, shoe];
      addCandidate(candidateMap, coreItems, request, styleStrategy);

      const extra = pickBestExtra(pools, coreItems, request, styleStrategy);
      if (extra) {
        addCandidate(candidateMap, [...coreItems, extra], request, styleStrategy);
      }
    });
  });

  return [...candidateMap.values()].sort((left, right) => right.score - left.score || left.key.localeCompare(right.key));
}

function selectFinalRecommendations(candidates, limit = 3) {
  const selected = [];
  const selectedKeys = new Set();
  const usedCoreIds = new Set();

  [true, false].forEach(strictPass => {
    candidates.forEach(candidate => {
      if (selected.length >= limit || selectedKeys.has(candidate.key)) {
        return;
      }

      const hasCoreConflict = candidate.coreIds.some(id => usedCoreIds.has(id));
      if (strictPass && hasCoreConflict) {
        return;
      }

      selected.push(candidate);
      selectedKeys.add(candidate.key);
      candidate.coreIds.forEach(id => usedCoreIds.add(id));
    });
  });

  return selected.slice(0, limit);
}

function getStyleLabel(style, lang) {
  return STYLE_LABELS[lang]?.[style] || STYLE_LABELS.en[style] || style || '';
}

function getSeasonLabel(season, lang) {
  return SEASON_LABELS[lang]?.[season] || SEASON_LABELS.en[season] || season;
}

function getColorLabel(color, lang) {
  const labels = COLOR_LABELS[color];
  if (!labels) {
    return color ? color.charAt(0).toUpperCase() + color.slice(1) : '';
  }

  return labels[lang] || labels.en || labels.tr;
}

function generateOutfitName(items, request, lang = 'tr') {
  const colors = [...new Set(items.map(item => item.normalized_color).filter(Boolean))].slice(0, 2);
  const dominantStyle = getDominantStyle(items, request.style);
  const styleLabel = getStyleLabel(dominantStyle, lang);
  const colorLabel = colors.map(color => getColorLabel(color, lang)).join(' & ');
  const fallbackLabel = getSeasonLabel(request.season, lang);
  const label = colorLabel || fallbackLabel;

  return lang === 'en'
    ? `${styleLabel} ${label} Outfit`
    : `${label} ${styleLabel} Kombini`;
}

function generateDynamicReason(items, request, lang = 'tr') {
  const styleAlignment = getStyleAlignment(items, request.style);
  const coreItems = items.filter(item => CORE_GROUPS.has(item.category_group));
  const exactSeasonCount = coreItems.filter(item => item.season_group === request.season).length;
  const colors = [...new Set(items.map(item => item.normalized_color).filter(Boolean))].slice(0, 2);
  const groups = items.map(item => item.category_group);
  const isDressLook = groups.includes('elbise');

  const sentences = [];

  if (lang === 'en') {
    if (exactSeasonCount === coreItems.length) {
      sentences.push(`Core pieces were kept inside the ${getSeasonLabel(request.season, 'en')} palette.`);
    } else {
      sentences.push(`Most of the outfit stays close to the ${getSeasonLabel(request.season, 'en')} palette while keeping the look complete.`);
    }

    if (request.style) {
      if (styleAlignment.mode === 'exact') {
        sentences.push(`The ${getStyleLabel(request.style, 'en').toLowerCase()} direction is clearly visible in the main pieces.`);
      } else if (styleAlignment.mode === 'partial') {
        sentences.push(`A single ${getStyleLabel(request.style, 'en').toLowerCase()} accent was supported with balanced companion pieces.`);
      }
    }

    if (colors.length === 1) {
      sentences.push(`A monochrome ${getColorLabel(colors[0], 'en').toLowerCase()} base keeps the outfit clean.`);
    } else if (colors.length === 2) {
      sentences.push(`${getColorLabel(colors[0], 'en')} and ${getColorLabel(colors[1], 'en').toLowerCase()} tones create a controlled contrast.`);
    } else {
      sentences.push('The color mix stays balanced without feeling busy.');
    }

    sentences.push(
      isDressLook
        ? 'The dress-led silhouette keeps the look streamlined.'
        : 'The top, bottom, and shoe balance makes it practical and cohesive.',
    );
  } else {
    if (exactSeasonCount === coreItems.length) {
      sentences.push(`Ana parcalar ${getSeasonLabel(request.season, 'tr')} paletine sadik kalinarak secildi.`);
    } else {
      sentences.push(`Kombinin butunu korunurken ana parcalarin cogu ${getSeasonLabel(request.season, 'tr')} cizgisine yakin tutuldu.`);
    }

    if (request.style) {
      if (styleAlignment.mode === 'exact') {
        sentences.push(`${getStyleLabel(request.style, 'tr')} cizgisi ana parcalarda net sekilde gorunuyor.`);
      } else if (styleAlignment.mode === 'partial') {
        sentences.push(`Tek bir ${getStyleLabel(request.style, 'tr').toLowerCase()} vurgu, dengeli tamamlayici parcalarla desteklendi.`);
      }
    }

    if (colors.length === 1) {
      sentences.push(`Tek tonlu ${getColorLabel(colors[0], 'tr').toLowerCase()} taban daha temiz bir gorunum sagliyor.`);
    } else if (colors.length === 2) {
      sentences.push(`${getColorLabel(colors[0], 'tr')} ve ${getColorLabel(colors[1], 'tr').toLowerCase()} tonlari kontrollu bir kontrast kuruyor.`);
    } else {
      sentences.push('Renk dengesi hareketli ama daginik olmayan bir etki veriyor.');
    }

    sentences.push(
      isDressLook
        ? 'Elbise odakli kurgu silueti daha derli toplu tutuyor.'
        : 'Ust, alt ve ayakkabi dengesi kombini giyilebilir ve tutarli hale getiriyor.',
    );
  }

  return sentences.join(' ');
}

function buildInfoMessage({ seasonFallback, styleFallback, lang }) {
  if (!seasonFallback && !styleFallback) {
    return '';
  }

  return lang === 'en'
    ? 'There were not enough products matching your selected criteria exactly, so I prepared the closest compatible suggestions instead.'
    : 'Sectigin kriterlere birebir uyan yeterli urun olmadigi icin, sana en yakin uyumlu onerileri hazirladim.';
}

function hasSelectedStyleFallback(candidates, requestedStyle) {
  if (!requestedStyle || !Array.isArray(candidates) || candidates.length === 0) {
    return false;
  }

  return candidates.some(candidate => getStyleAlignment(candidate.items, requestedStyle).mode !== 'exact');
}

function finaliseCandidate(candidate, request, safeLang) {
  const items = candidate.items.map(item => ({
    ...item,
    display_name: generateItemDisplayName(item),
  }));

  return {
    items,
    score: candidate.score,
    name_tr: generateOutfitName(items, request, 'tr'),
    name_en: generateOutfitName(items, request, 'en'),
    reason_tr: generateDynamicReason(items, request, 'tr'),
    reason_en: generateDynamicReason(items, request, 'en'),
    name: safeLang === 'en' ? generateOutfitName(items, request, 'en') : generateOutfitName(items, request, 'tr'),
    reason: safeLang === 'en' ? generateDynamicReason(items, request, 'en') : generateDynamicReason(items, request, 'tr'),
  };
}

export const getAIRecommendations = async (req, res) => {
  const { seasonName, stylePreference, lang = 'tr' } = req.body;
  const normalizedSeasonName = normalizeSeasonName(seasonName);

  if (!normalizedSeasonName) {
    return res.status(400).json({
      message:
        lang === 'en'
          ? `Invalid season "${seasonName}". Valid options: ${VALID_SEASONS.join(', ')}`
          : `Gecersiz sezon "${seasonName}". Gecerli secenekler: ${VALID_SEASONS.join(', ')}`,
    });
  }

  const safeStyle = stylePreference && VALID_STYLES.includes(stylePreference) ? stylePreference : null;
  const safeLang = lang === 'en' ? 'en' : 'tr';
  const request = {
    season: normalizedSeasonName,
    style: safeStyle,
  };

  try {
    const { rows } = await dbPool.query(`
      SELECT
        p.id,
        p.name,
        p.name_tr,
        p.name_en,
        p.price,
        p.image_url,
        p.description,
        p.description_tr,
        p.description_en,
        p.style_tag,
        p.season_group,
        c.name AS category_name,
        col.name AS color_name
      FROM products p
      JOIN categories c ON c.id = p.category_id
      JOIN colors col ON col.id = p.color_id
      WHERE COALESCE(p.is_active, true) = TRUE
    `);

    if (rows.length === 0) {
      return res.status(200).json({
        recommendations: [],
        message:
          safeLang === 'en'
            ? 'There are not enough products in the catalogue yet to prepare an outfit suggestion.'
            : 'Katalogda henuz kombin onerecek kadar urun bulunmuyor.',
      });
    }

    const allProducts = rows.map(product => {
      const localizedName = localisedName(product, safeLang);
      return {
        ...product,
        name: localizedName,
        description: localisedDescription(product, safeLang),
        season_group: normalizeSeasonName(product.season_group) || 'allSeasons',
        style_tag: normalizeStyleName(product.style_tag),
        category_group: detectCategoryGroup(product.category_name, localizedName),
        normalized_color: normalizeColor(product.color_name),
      };
    });

    const preferredProducts = allProducts.filter(product => isPreferredSeasonItem(product, request.season));
    const preferredPools = buildPools(preferredProducts);
    const seasonFallback = !canBuildOutfit(preferredPools);
    const workingProducts = seasonFallback ? allProducts : preferredProducts;
    const workingPools = buildPools(workingProducts);

    if (!canBuildOutfit(workingPools)) {
      return res.status(200).json({
        recommendations: [],
        message:
          safeLang === 'en'
            ? 'I could not find enough matching pieces for a complete outfit right now. Try another season or style for more options.'
            : 'Su anda tam bir kombin olusturacak kadar uyumlu urun bulamadim. Daha fazla secenek icin baska bir sezon veya stil deneyebilirsin.',
      });
    }

    const styleStrategy = getStyleStrategy(workingProducts, safeStyle);
    const rankedPools = Object.fromEntries(
      Object.entries(workingPools).map(([groupName, products]) => [
        groupName,
        sortByRequestFit(products, request, styleStrategy),
      ]),
    );

    const candidates = generateCandidateOutfits(rankedPools, request, styleStrategy);
    if (candidates.length === 0) {
      return res.status(200).json({
        recommendations: [],
        message:
          safeLang === 'en'
            ? 'I could not build a well-matched outfit from the current catalogue. Trying a different season or style should help.'
            : 'Mevcut urunlerle iyi eslesen bir kombin olusturamadim. Farkli bir sezon ya da stil secersen daha iyi sonuc verebilirim.',
      });
    }

    const selectedCandidates = selectFinalRecommendations(candidates, 3);
    const finalRecommendations = selectedCandidates.map(candidate =>
      finaliseCandidate(candidate, request, safeLang),
    );

    const styleFallback = hasSelectedStyleFallback(selectedCandidates, safeStyle);
    const message = buildInfoMessage({
      seasonFallback,
      styleFallback,
      requestedStyle: safeStyle,
      fallbackStyle: styleStrategy.fallbackStyle,
      lang: safeLang,
    });

    return res.status(200).json({
      recommendations: finalRecommendations,
      is_fallback: Boolean(seasonFallback || styleFallback),
      message: message || null,
    });
  } catch (error) {
    console.error('AI stylist error:', error);
    return res.status(500).json({
      message: safeLang === 'en' ? 'An error occurred in the stylist engine.' : 'Stilist motorunda bir hata olustu.',
    });
  }
};
