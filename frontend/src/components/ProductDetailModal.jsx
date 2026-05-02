import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSeasonColor } from '../utils/productUtils';
import { translateName, translateColor } from '../utils/translators';
import { formatUrl, fallbackImage } from '../utils/imageUtils';
import { formatPrice } from '../utils/formatters';
import { getPrimaryLanguage } from '../utils/i18nUtils';
import './ProductDetailModal.css';

const getStylingTip = (category, t) => {
  const normalized = (category || '').toLowerCase();
  if (normalized.includes('ayakkabi') || normalized.includes('shoes') || normalized.includes('bot') || normalized.includes('sneaker')) return t('styling_tip_shoes');
  if (normalized.includes('ust') || normalized.includes('tops') || normalized.includes('bluz') || normalized.includes('kazak') || normalized.includes('gomlek')) return t('styling_tip_top');
  if (normalized.includes('alt') || normalized.includes('bottoms') || normalized.includes('pantolon') || normalized.includes('etek')) return t('styling_tip_bottom');
  if (normalized.includes('dis') || normalized.includes('outerwear') || normalized.includes('ceket') || normalized.includes('kaban')) return t('styling_tip_outerwear');
  if (normalized.includes('elbise') || normalized.includes('dress')) return t('styling_tip_dress');
  return t('styling_tip_default');
};

export default function ProductDetailModal({ product, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const { t, i18n } = useTranslation();
  const lang = getPrimaryLanguage(i18n);

  const closeModal = () => {
    setIsVisible(false);
    setTimeout(onClose, 350);
  };

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== 'Escape') return;

      if (lightbox) {
        setLightbox(false);
        return;
      }

      setIsVisible(false);
      setTimeout(onClose, 350);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, onClose]);

  const imageUrl = formatUrl(product.image_url);
  const displayName = translateName(product.name, lang);
  const displayColor = product.color_name ? translateColor(product.color_name, lang) : null;
  const displayDescription = (lang === 'en' ? product.description_en : product.description_tr)
    || product.description
    || getStylingTip(product.category_name, t);

  return (
    <>
      <div className={`pdm-overlay ${isVisible ? 'is-visible' : ''}`} onClick={closeModal}>
        <div className="pdm-panel" onClick={event => event.stopPropagation()}>
          <button className="pdm-close" onClick={closeModal} aria-label="Close">
            <i className="fas fa-times"></i>
          </button>

          <div className="pdm-gallery">
            <div className="pdm-badges">
              {product.season_group && (
                <span
                  className="pdm-badge pdm-badge--season"
                  style={{ borderLeft: `3px solid ${getSeasonColor(product.season_group)}` }}
                >
                  {t(`seasons.${product.season_group}`, product.season_group)}
                </span>
              )}
              {product.style_tag && (
                <span className="pdm-badge pdm-badge--style">
                  {t(`styles.${product.style_tag}`, product.style_tag)}
                </span>
              )}
            </div>

            <div className="pdm-main-img-wrap" onClick={() => setLightbox(true)}>
              <img
                src={imageUrl}
                alt={displayName}
                className="pdm-main-img"
                onError={event => {
                  event.target.onerror = null;
                  event.target.src = fallbackImage;
                }}
              />
            </div>

            <div className="pdm-thumbs">
              <div className="pdm-thumb is-active">
                <img
                  src={imageUrl}
                  alt=""
                  onError={event => {
                    event.target.onerror = null;
                    event.target.src = fallbackImage;
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pdm-info">
            <div className="pdm-brand">
              {product.brand || t('styleai_exclusive', 'StyleAI Exclusive')}
            </div>

            <h2 className="pdm-name">{displayName}</h2>

            <div className="pdm-price">{formatPrice(product.price || 0)}</div>

            <div className="pdm-divider" />

            <div className="pdm-tags">
              {product.category_name && (
                <span className="pdm-tag pdm-tag--category">
                  {t(`categories.${product.category_name}`, product.category_name)}
                </span>
              )}
              {displayColor && (
                <span className="pdm-tag pdm-tag--color">
                  <span className="pdm-color-dot" style={{ backgroundColor: product.color_name }} />
                  {displayColor}
                </span>
              )}
              {product.season_group && (
                <span className="pdm-tag pdm-tag--season">
                  <i className="fas fa-palette" style={{ fontSize: '0.7rem' }}></i>
                  {t(`seasons.${product.season_group}`, product.season_group)}
                </span>
              )}
              {product.style_tag && (
                <span className="pdm-tag pdm-tag--style">
                  <i className="fas fa-tag" style={{ fontSize: '0.7rem' }}></i>
                  {t(`styles.${product.style_tag}`, product.style_tag)}
                </span>
              )}
            </div>

            <div className="pdm-section">
              <div className="pdm-section-label">
                <i className="fas fa-wand-magic-sparkles"></i>
                {t('styling_tip', 'Styling Tip')}
              </div>
              <p className="pdm-desc-text">{displayDescription}</p>
            </div>

            <div className="pdm-details">
              {product.brand && (
                <div className="pdm-detail-row">
                  <span className="pdm-detail-label">{t('brand', 'Marka')}</span>
                  <span className="pdm-detail-value">{product.brand}</span>
                </div>
              )}
              {product.seller_name && (
                <div className="pdm-detail-row">
                  <span className="pdm-detail-label">{t('seller', 'Satici')}</span>
                  <span className="pdm-detail-value">{product.seller_name}</span>
                </div>
              )}
              {product.category_name && (
                <div className="pdm-detail-row">
                  <span className="pdm-detail-label">{t('category_type', 'Kategori')}</span>
                  <span className="pdm-detail-value">{t(`categories.${product.category_name}`, product.category_name)}</span>
                </div>
              )}
              {product.style_tag && (
                <div className="pdm-detail-row">
                  <span className="pdm-detail-label">{t('style', 'Stil')}</span>
                  <span className="pdm-detail-value">{t(`styles.${product.style_tag}`, product.style_tag)}</span>
                </div>
              )}
            </div>

            <div className="pdm-cta">
              <a href="/outfit-builder" className="pdm-btn pdm-btn--primary">
                <i className="fas fa-wand-magic-sparkles"></i>
                {t('add_to_outfit', 'Kombin Olustur')}
              </a>
              <button className="pdm-btn pdm-btn--secondary" onClick={closeModal}>
                <i className="fas fa-arrow-left"></i>
                {t('finish_review', 'Kapat')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {lightbox && (
        <div className="pdm-lightbox" onClick={() => setLightbox(false)}>
          <button className="pdm-lightbox-close" onClick={() => setLightbox(false)}>
            <i className="fas fa-times"></i>
          </button>
          <img
            src={imageUrl}
            alt={displayName}
            onError={event => {
              event.target.onerror = null;
              event.target.src = fallbackImage;
            }}
          />
        </div>
      )}
    </>
  );
}
