import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { translateName } from '../utils/translators';
import { formatUrl, fallbackImage } from '../utils/imageUtils';
import { getPrimaryLanguage } from '../utils/i18nUtils';
import { reportClientError } from '../utils/logger';
import './OutfitBuilder.css';

const GROUPS = [
  { key: 'tops',        icon: 'fa-shirt',         required: true },
  { key: 'bottoms',     icon: 'fa-person-dress',  required: false },
  { key: 'outerwear',   icon: 'fa-vest',          required: false },
  { key: 'shoes',       icon: 'fa-shoe-prints',   required: true  },
  { key: 'accessories', icon: 'fa-gem',           required: false },
];

export default function OutfitBuilder() {
  const { t, i18n } = useTranslation();
  const lang = getPrimaryLanguage(i18n);
  const [products, setProducts]     = useState([]);
  const [outfitName, setOutfitName] = useState('');
  const [selectedItems, setSelectedItems] = useState({
    'tops': null, 'bottoms': null, 'outerwear': null, 'shoes': null, 'accessories': null,
  });
  const [message, setMessage] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const p = await api.get('/products');
        setProducts(p.data);
      } catch (error) {
        reportClientError('Urunler yuklenemedi:', error);
      }
    })();
  }, []);

  const handleSave = async () => {
    setMessage(''); setError('');
    const ids = Object.values(selectedItems).map(i => i?.id).filter(Boolean);
    const ustItem      = selectedItems['tops'];
    const hasUst       = !!ustItem;
    const hasAlt       = !!selectedItems['bottoms'];
    const hasShoe      = !!selectedItems['shoes'];
    const isDressOrSuit = ustItem && (ustItem.category_name === 'dresses');

    if (!hasShoe)                         { setError('Kombin için bir Ayakkabı seçmelisiniz.'); return; }
    if (!hasUst)                          { setError('En az bir Üst Giyim veya Elbise seçmelisiniz.'); return; }
    if (!isDressOrSuit && !hasAlt)        { setError('Tek parça bir ürün (Elbise/Takım) seçmediyseniz Alt Giyim seçmeniz zorunludur.'); return; }

    setLoading(true);
    try {
      await api.post('/outfits', { name: outfitName || t('saved_outfits.my_outfit', 'Benim Kombinim'), productIds: ids, source_type: 'manual' });
      setMessage(t('outfit_builder.save_success'));
      setTimeout(() => navigate('/saved-outfits'), 1500);
    } catch (e) {
      setError(e.response?.data?.message || 'Bir hata oluştu.');
      setLoading(false);
    }
  };

  const ustItem       = selectedItems['tops'];
  const hasShoe       = !!selectedItems['shoes'];
  const hasUst        = !!ustItem;
  const hasAlt        = !!selectedItems['bottoms'];
  const isDressOrSuit = ustItem && ustItem.category_name === 'dresses';

  const REQUIREMENTS = [
    { label: t('outfit_builder.req_top'),    met: hasUst },
    { label: t('outfit_builder.req_bottom'), met: isDressOrSuit || hasAlt },
    { label: t('outfit_builder.req_shoes'),  met: hasShoe },
  ];
  const canSave = hasShoe && hasUst && (isDressOrSuit || hasAlt);

  const toggle = (group, product) =>
    setSelectedItems(prev => ({ ...prev, [group]: prev[group]?.id === product.id ? null : product }));

  const getGroup = (groupName) => {
    return products
      .filter(p => {
        if (groupName === 'tops') return ['tops', 'dresses'].includes(p.category_name);
        return p.category_name === groupName;
      })
      .map(p => ({ ...p, displayName: translateName(p.name, lang) }));
  };

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  const getSlotLabel = (key) =>
    key === 'tops' ? t('outfit_builder.req_top', 'Üst / Tek Parça') :
    key === 'shoes'  ? t('outfit_builder.req_shoes', 'Ayakkabı') :
    t(`categories.${key}`, key);

  return (
    <div className="ob-page">

      {/* ── HERO ── */}
      <div className="ob-hero">
        <div className="ob-hero-inner">
          <span className="ob-hero-eyebrow">
            <i className="fas fa-layer-group"></i>
            {t('outfit_builder.eyebrow', 'Dijital Gardırop')}
          </span>
          <h1 className="ob-hero-title">{t('outfit_builder.title')}</h1>
          <p className="ob-hero-sub">{t('outfit_builder.subtitle')}</p>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="ob-layout">

        {/* ── LEFT: GALLERY ── */}
        <div className="ob-gallery">
          {GROUPS.map(({ key, icon, required }) => {
            const items    = getGroup(key);
            const selected = selectedItems[key];
            return (
              <section key={key} className="ob-category-block">

                {/* Category header */}
                <div className="ob-cat-header">
                  <span className="ob-cat-icon">
                    <i className={`fas ${icon}`}></i>
                  </span>
                  <span className="ob-cat-title">{getSlotLabel(key)}</span>
                  {required && <span className="ob-cat-badge ob-cat-badge--req">{t('common.required', 'Zorunlu')}</span>}
                  {selected && (
                    <span className="ob-cat-badge ob-cat-badge--sel">
                      <i className="fas fa-check"></i> {t('common.selected', 'Seçildi')}
                    </span>
                  )}
                </div>

                {/* Product grid */}
                {items.length === 0 ? (
                  <div className="ob-empty">
                    <i className="fas fa-box-open"></i>
                    <p>{t('outfit_builder.no_items')}</p>
                  </div>
                ) : (
                  <div className="ob-product-grid">
                    {items.map(p => {
                      const isSelected = selected?.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggle(key, p)}
                          className={`ob-product-card${isSelected ? ' is-selected' : ''}`}
                        >
                          <div className="ob-product-img-wrap">
                            {p.image_url ? (
                              <img
                                src={formatUrl(p.image_url)}
                                alt={p.displayName}
                                className="ob-product-img"
                                onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                              />
                            ) : (
                              <div className="ob-product-img-placeholder">
                                <i className="fas fa-image"></i>
                              </div>
                            )}
                            {isSelected && (
                              <div className="ob-product-selected-badge">
                                <i className="fas fa-check"></i>
                              </div>
                            )}
                          </div>
                          <div className="ob-product-info">
                            <p className="ob-product-name" title={p.displayName}>{p.displayName}</p>
                            <span className="ob-product-cat">{t(`categories.${p.category_name}`, p.category_name)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* ── RIGHT: PREVIEW PANEL ── */}
        <div className="ob-panel-wrap">
          <div className="ob-panel">

            {/* Panel header */}
            <div className="ob-panel-header">
              <span className="ob-panel-eyebrow">
                <i className="fas fa-wand-magic-sparkles"></i>
                {t('outfit_builder.preview_title')}
              </span>
              <h2 className="ob-panel-title">{t('outfit_builder.selection')}</h2>
              <p className="ob-panel-count">
                {t('outfit_builder.pieces_selected', { count: selectedCount })}
              </p>
            </div>

            {/* Slots */}
            <div className="ob-slots">
              {GROUPS.map(({ key, icon }) => {
                const sel = selectedItems[key];
                return (
                  <div key={key} className={`ob-slot${sel ? ' ob-slot--filled' : ''}`}>
                    {sel ? (
                      <>
                        {sel.image_url ? (
                          <img
                            src={formatUrl(sel.image_url)}
                            alt={sel.displayName}
                            className="ob-slot-img"
                            onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                          />
                        ) : (
                          <span className="ob-slot-name-fallback">{sel.displayName}</span>
                        )}
                        <div className="ob-slot-overlay">
                          <span className="ob-slot-overlay-name">{sel.displayName}</span>
                        </div>
                        <button
                          onClick={() => toggle(key, sel)}
                          className="ob-slot-remove"
                          title={t('common.remove', 'Kaldır')}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    ) : (
                      <div className="ob-slot-empty">
                        <i className={`fas ${icon} ob-slot-empty-icon`}></i>
                        <span className="ob-slot-empty-label">{getSlotLabel(key)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Requirements */}
            <div className="ob-requirements">
              {REQUIREMENTS.map(r => (
                <div key={r.label} className={`ob-req-row${r.met ? ' ob-req-row--met' : ''}`}>
                  <i className={`fas ${r.met ? 'fa-check-circle' : 'fa-circle-dot'}`}></i>
                  <span>{r.label}</span>
                </div>
              ))}
            </div>

            <div className="ob-divider"></div>

            {/* Outfit name */}
            <div className="ob-name-group">
              <label className="ob-name-label">{t('outfit_builder.outfit_name')}</label>
              <input
                type="text"
                placeholder={t('outfit_builder.placeholder')}
                value={outfitName}
                onChange={e => setOutfitName(e.target.value)}
                className="ob-name-input"
              />
            </div>

            {/* Messages */}
            {error && (
              <div className="ob-msg ob-msg--error">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}
            {message && (
              <div className="ob-msg ob-msg--success">
                <i className="fas fa-check-circle"></i>
                {message}
              </div>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={!canSave || loading}
              className={`ob-save-btn${canSave ? ' ob-save-btn--active' : ''}`}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> {t('outfit_builder.saving')}</>
              ) : (
                <><i className={`fas ${canSave ? 'fa-heart' : 'fa-lock'}`}></i> {canSave ? t('outfit_builder.save_btn') : t('outfit_builder.save_req')}</>
              )}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
