import { useTranslation } from 'react-i18next';
import { getSeasonColor } from '../utils/productUtils';
import { translateName, translateColor } from '../utils/translators';
import { formatUrl, fallbackImage } from '../utils/imageUtils';
import { formatPrice } from '../utils/formatters';
import { getPrimaryLanguage } from '../utils/i18nUtils';

export default function ProductCard({ product, onClick }) {
  const { t, i18n } = useTranslation();
  const lang = getPrimaryLanguage(i18n);

  const finalImageUrl = formatUrl(product?.image_url);
  const displayName = translateName(product.name, lang);
  const displayColor = product.color_name ? translateColor(product.color_name, lang) : null;

  return (
    <div 
      className="product-card" 
      onClick={() => onClick && onClick(product)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="product-image-wrap">
        <img
          src={`${finalImageUrl}?v=clean3`}
          alt={displayName}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />
        
        <div className="product-badges">
          {product.season_group && (
            <span className="badge" style={{fontSize: '0.65rem', background: getSeasonColor(product.season_group), color: 'var(--color-text)'}}>
              {t(`seasons.${product.season_group}`, product.season_group)}
            </span>
          )}
          {product.style_tag && (
            <span className="badge badge-dark" style={{fontSize: '0.65rem'}}>
              {t(`styles.${product.style_tag}`, product.style_tag)}
            </span>
          )}
        </div>

        {onClick && (
          <div className="product-actions">
            <div className="product-action-btn" title={t('product_card.view_details')}>
              <i className="fas fa-eye"></i>
            </div>
          </div>
        )}
      </div>

      <div className="product-info">
        <div className="product-brand">{product.brand || 'StyleAI Exclusive'}</div>
        <h3 className="product-title" title={displayName}>{displayName}</h3>
        
        <div className="product-meta">
          {product.category_name && (
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
              {t(`categories.${product.category_name}`, product.category_name)}
            </span>
          )}
          {displayColor && (
            <div className="flex items-center gap-xs" style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              <span className="color-dot" style={{ backgroundColor: product.color_name }}></span>
              {displayColor}
            </div>
          )}
        </div>

        <div className="product-footer">
          <div className="product-price">{formatPrice(product.price)}</div>
        </div>
      </div>
    </div>
  );
}
