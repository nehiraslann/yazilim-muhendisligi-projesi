import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { reportClientError } from '../utils/logger';
import { CATEGORY_MAPPING, COLOR_GROUPS, getColorHex, SEASON_GROUPS, STYLE_TAGS } from '../utils/productUtils';

const RADIO_OPTION_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

const CLEAR_ICON_STYLE = {
  cursor: 'pointer',
  marginLeft: '4px',
};

function FilterRadioOption({ active, label, onSelect, dotColor }) {
  return (
    <label
      style={{
        ...RADIO_OPTION_STYLE,
        color: active ? 'var(--color-primary)' : 'var(--color-text)',
      }}
    >
      <input type="radio" checked={active} onChange={onSelect} style={{ display: 'none' }} />
      <i className={`fas ${active ? 'fa-circle-dot text-primary' : 'fa-circle'}`} style={{ color: active ? undefined : 'var(--color-border)' }}></i>
      {dotColor ? <span className="color-dot" style={{ background: dotColor, width: '12px', height: '12px' }}></span> : null}
      {label}
    </label>
  );
}

function ActiveFilterBadge({ className = 'badge badge-secondary', label, onClear }) {
  return (
    <span className={className}>
      {label}
      <i className="fas fa-times" style={CLEAR_ICON_STYLE} onClick={onClear}></i>
    </span>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const [allProducts, setAllProducts] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [sort, setSort] = useState('');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const priceRanges = useMemo(() => ([
    { id: '0-500', label: '0 - 500 ₺', min: 0, max: 500 },
    { id: '500-1000', label: '500 - 1000 ₺', min: 500, max: 1000 },
    { id: '1000-2000', label: '1000 - 2000 ₺', min: 1000, max: 2000 },
    { id: '2000+', label: t('home.filters.price_2000_plus', '2000 ₺ ve üzeri'), min: 2000, max: Number.POSITIVE_INFINITY },
  ]), [t]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      try {
        const [productResponse, optionsResponse] = await Promise.all([
          api.get('/products'),
          api.get('/products/options'),
        ]);

        if (cancelled) return;

        setAllProducts(productResponse.data);
        setColors(optionsResponse.data.colors || []);
      } catch (error) {
        reportClientError('Veriler yüklenemedi:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const colorNameById = useMemo(() => (
    Object.fromEntries(
      colors
        .filter(item => item?.id != null && item?.name)
        .map(item => [String(item.id), item.name.toLowerCase()]),
    )
  ), [colors]);

  const activeGroups = useMemo(() => {
    const rawGroups = new Set(allProducts.map(product => product.category_name).filter(Boolean));
    return Object.keys(CATEGORY_MAPPING).filter(key => rawGroups.has(key));
  }, [allProducts]);

  const activeBrands = useMemo(() => (
    [...new Set(allProducts.map(product => product.brand).filter(Boolean))].sort()
  ), [allProducts]);

  const activeColors = useMemo(() => {
    const availableRawNames = allProducts
      .map(product => colorNameById[String(product.color_id)])
      .filter(Boolean);

    const mappedShades = Object.values(COLOR_GROUPS).flat().map(shade => shade.toLowerCase());
    const knownGroups = Object.keys(COLOR_GROUPS).filter(mainColor => {
      const shades = COLOR_GROUPS[mainColor].map(shade => shade.toLowerCase());
      return availableRawNames.some(name => shades.includes(name));
    });
    const extraGroups = [...new Set(availableRawNames.filter(name => !mappedShades.includes(name)))]
      .map(name => name.charAt(0).toUpperCase() + name.slice(1));

    return [...knownGroups, ...extraGroups].sort();
  }, [allProducts, colorNameById]);

  const selectedPriceRange = useMemo(
    () => priceRanges.find(range => range.id === selectedPrice) || null,
    [priceRanges, selectedPrice],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = allProducts.filter(product => {
      if (normalizedSearch) {
        const matchesSearch = [product.name, product.category_name, product.brand]
          .filter(Boolean)
          .some(value => value.toLowerCase().includes(normalizedSearch));

        if (!matchesSearch) return false;
      }

      if (selectedGroup && product.category_name !== selectedGroup) return false;
      if (selectedSeason && product.season_group !== selectedSeason) return false;
      if (selectedStyle && product.style_tag !== selectedStyle) return false;
      if (selectedBrand && product.brand !== selectedBrand) return false;

      if (selectedColor) {
        const targetShades = (COLOR_GROUPS[selectedColor] || [selectedColor]).map(shade => shade.toLowerCase());
        const productColor = colorNameById[String(product.color_id)] || '';
        if (!targetShades.includes(productColor)) return false;
      }

      if (selectedPriceRange) {
        const price = Number(product.price);
        if (price < selectedPriceRange.min || price > selectedPriceRange.max) return false;
      }

      return true;
    });

    const sorted = [...filtered];
    if (sort === 'price_asc') sorted.sort((left, right) => left.price - right.price);
    else if (sort === 'price_desc') sorted.sort((left, right) => right.price - left.price);
    else sorted.sort((left, right) => right.id - left.id);

    return sorted;
  }, [
    allProducts,
    colorNameById,
    search,
    selectedBrand,
    selectedColor,
    selectedGroup,
    selectedPriceRange,
    selectedSeason,
    selectedStyle,
    sort,
  ]);

  const resetFilters = () => {
    setSelectedGroup('');
    setSelectedColor('');
    setSelectedSeason('');
    setSelectedStyle('');
    setSelectedBrand('');
    setSelectedPrice('');
    setSort('');
    setSearch('');
  };

  const hasActiveFilters = Boolean(
    selectedGroup
    || selectedColor
    || selectedSeason
    || selectedStyle
    || selectedBrand
    || selectedPrice
    || search,
  );

  const activeFilterBadges = [
    selectedSeason && {
      key: 'season',
      className: 'badge badge-info',
      label: t(`seasons.${selectedSeason}`),
      onClear: () => setSelectedSeason(''),
    },
    selectedGroup && {
      key: 'group',
      label: t(`categories.${selectedGroup}`),
      onClear: () => setSelectedGroup(''),
    },
    selectedStyle && {
      key: 'style',
      label: t(`styles.${selectedStyle}`),
      onClear: () => setSelectedStyle(''),
    },
    selectedBrand && {
      key: 'brand',
      label: `${t('home.filters.brands')}: ${selectedBrand}`,
      onClear: () => setSelectedBrand(''),
    },
    selectedPriceRange && {
      key: 'price',
      label: selectedPriceRange.label,
      onClear: () => setSelectedPrice(''),
    },
    selectedColor && {
      key: 'color',
      label: `${t('home.filters.colors')}: ${selectedColor}`,
      onClear: () => setSelectedColor(''),
    },
  ].filter(Boolean);

  return (
    <div className="container page-content">
      <div className="flex justify-between items-center flex-wrap gap-md" style={{ marginBottom: '3.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border-light)' }}>
        <div>
          <h2 className="font-heading" style={{ fontSize: '2rem', color: 'var(--color-text)' }}>{t('home.explore_season')}</h2>
          <p className="text-muted" style={{ color: 'var(--color-text-secondary)' }}>{t('home.explore_subtitle')}</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}></i>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '44px', borderRadius: 'var(--radius-full)' }}
            placeholder={t('home.search_placeholder')}
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }} className="responsive-layout">
        <aside className="sidebar-filter-fixed" style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '90px', alignSelf: 'start' }}>
          <div className="card" style={{ padding: '20px' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ fontSize: '1.1rem' }}>{t('home.filters.title')}</h3>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-primary" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  {t('home.filters.clear')}
                </button>
              )}
            </div>

            <div className="mb-6">
              <div className="form-label mb-2">{t('home.filters.season')}</div>
              <div className="flex flex-col gap-sm">
                <FilterRadioOption active={!selectedSeason} label={t('home.filters.all')} onSelect={() => setSelectedSeason('')} />
                {SEASON_GROUPS.map(season => (
                  <FilterRadioOption
                    key={season.id}
                    active={selectedSeason === season.id}
                    label={t(`seasons.${season.id}`, season.name)}
                    onSelect={() => setSelectedSeason(season.id)}
                    dotColor={season.color}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="form-label mb-2">{t('home.filters.categories')}</div>
              <div className="flex flex-col gap-sm">
                <FilterRadioOption active={!selectedGroup} label={t('home.filters.all')} onSelect={() => setSelectedGroup('')} />
                {activeGroups.map(group => (
                  <FilterRadioOption
                    key={group}
                    active={selectedGroup === group}
                    label={t(`categories.${group}`, group)}
                    onSelect={() => setSelectedGroup(group)}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="form-label mb-2">{t('home.filters.style')}</div>
              <div className="flex flex-wrap gap-xs">
                <span onClick={() => setSelectedStyle('')} className={`badge ${!selectedStyle ? 'badge-primary' : 'badge-secondary'}`} style={{ cursor: 'pointer' }}>
                  {t('home.filters.all')}
                </span>
                {STYLE_TAGS.map(style => (
                  <span key={style} onClick={() => setSelectedStyle(style)} className={`badge ${selectedStyle === style ? 'badge-primary' : 'badge-secondary'}`} style={{ cursor: 'pointer' }}>
                    {t(`styles.${style}`, style)}
                  </span>
                ))}
              </div>
            </div>

            {activeBrands.length > 0 && (
              <div className="mb-6">
                <div className="form-label mb-2">{t('home.filters.brands')}</div>
                <div className="flex flex-col gap-sm">
                  <FilterRadioOption active={!selectedBrand} label={t('home.filters.all')} onSelect={() => setSelectedBrand('')} />
                  {activeBrands.map(brand => (
                    <FilterRadioOption
                      key={brand}
                      active={selectedBrand === brand}
                      label={brand}
                      onSelect={() => setSelectedBrand(brand)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="form-label mb-2">{t('home.filters.price_range')}</div>
              <div className="flex flex-col gap-sm">
                <FilterRadioOption active={!selectedPrice} label={t('home.filters.all')} onSelect={() => setSelectedPrice('')} />
                {priceRanges.map(range => (
                  <FilterRadioOption
                    key={range.id}
                    active={selectedPrice === range.id}
                    label={range.label}
                    onSelect={() => setSelectedPrice(range.id)}
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="form-label mb-2">{t('home.filters.colors')}</div>
              <div className="flex flex-wrap gap-xs items-center">
                <button
                  onClick={() => setSelectedColor('')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: !selectedColor ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: !selectedColor ? '#fff' : 'var(--color-text)',
                    border: !selectedColor ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  }}
                >
                  {t('home.filters.all', 'Tümü')}
                </button>
                {activeColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: getColorHex(color),
                      border: selectedColor === color ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      boxShadow: selectedColor === color ? '0 0 0 2px var(--color-primary-light)' : 'none',
                      transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s',
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-sm flex-wrap">
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>{t('home.products_found', { count: filteredProducts.length })}</span>
              {activeFilterBadges.map(filter => (
                <ActiveFilterBadge key={filter.key} className={filter.className} label={filter.label} onClear={filter.onClear} />
              ))}
            </div>

            <div className="flex items-center gap-sm">
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{t('home.sort.title')}</span>
              <div className="select-wrapper">
                <select className="form-input" style={{ padding: '8px 32px 8px 16px', borderRadius: 'var(--radius-full)', background: 'transparent' }} value={sort} onChange={event => setSort(event.target.value)}>
                  <option value="">{t('home.sort.newest')}</option>
                  <option value="price_asc">{t('home.sort.price_asc')}</option>
                  <option value="price_desc">{t('home.sort.price_desc')}</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner mb-4"></div>
              <h3>{t('home.loading')}</h3>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open" style={{ color: 'var(--color-border)', fontSize: '4rem', marginBottom: '24px' }}></i>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{t('home.not_found_title')}</h3>
              <p className="text-muted mb-6">{t('home.not_found_desc')}</p>
              <button onClick={resetFilters} className="btn btn-primary">{t('home.btn_show_all')}</button>
            </div>
          ) : (
            <div className="grid grid-3">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onClick={setSelectedProduct} />
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}
