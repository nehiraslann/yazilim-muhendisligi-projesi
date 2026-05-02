import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { translateName } from '../utils/translators';
import { formatUrl, fallbackImage } from '../utils/imageUtils';
import { formatPrice, formatShortDate } from '../utils/formatters';
import { getPrimaryLanguage } from '../utils/i18nUtils';
import { reportClientError } from '../utils/logger';
import './SavedOutfits.css';

export default function SavedOutfits() {
  const { t, i18n } = useTranslation();
  const lang = getPrimaryLanguage(i18n);

  // If stored reason_text contains Turkish-specific chars and UI is in English, skip it
  const getReasonText = (reason_text) => {
    if (lang === 'en' && reason_text) {
      const turkishPattern = /[şŞıİüÜöÖçÇğĞ]/;
      if (turkishPattern.test(reason_text)) {
        return t('ai_stylist.default_reason');
      }
    }
    return reason_text;
  };
  const [outfits, setOutfits]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedId, setExpandedId]     = useState(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => { fetchOutfits(); }, []);

  const fetchOutfits = async () => {
    try {
      const { data } = await api.get('/outfits');
      setOutfits(data);
    } catch (err) {
      reportClientError('Kombinler yuklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/outfits/${id}`);
      setOutfits(prev => prev.filter(o => o.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      reportClientError('Kombin silme hatasi:', err);
    } finally {
      setDeleting(false);
    }
  };

  /* ── LOADING SKELETON ── */
  if (loading) return (
    <div className="so-page">
      <div className="so-skeleton-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="so-skeleton-card">
            <div className="so-skeleton-img"></div>
            <div className="so-skeleton-body">
              <div className="so-skeleton-line"></div>
              <div className="so-skeleton-line so-skeleton-line--short"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="so-page">

      {/* ── HEADER ── */}
      <div className="so-header">
        <div className="so-header-left">
          <span className="so-header-eyebrow">
            <i className="fas fa-heart"></i>
            {t('saved_outfits.eyebrow', 'Stil Koleksiyonum')}
          </span>
          <h1 className="so-header-title">{t('saved_outfits.title')}</h1>
          <p className="so-header-count">
            {t('saved_outfits.saved_count', { count: outfits.length })}
          </p>
        </div>
        <Link to="/outfit-builder" className="so-cta-btn">
          <i className="fas fa-plus"></i>
          {t('saved_outfits.new_outfit')}
        </Link>
      </div>

      {/* ── EMPTY STATE ── */}
      {outfits.length === 0 ? (
        <div className="so-empty">
          <div className="so-empty-icon">
            <i className="fas fa-heart-crack"></i>
          </div>
          <h2 className="so-empty-title">{t('saved_outfits.empty_title')}</h2>
          <p className="so-empty-desc">{t('saved_outfits.empty_desc')}</p>
          <div className="so-empty-actions">
            <Link to="/outfit-builder" className="so-cta-btn">
              <i className="fas fa-puzzle-piece"></i>
              {t('saved_outfits.create_outfit')}
            </Link>
            <Link to="/ai-stylist" className="so-cta-btn so-cta-btn--secondary">
              <i className="fas fa-robot"></i>
              {t('saved_outfits.get_ai_suggestion')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="so-grid">
          {outfits.map(outfit => {
            const validProducts = outfit.products?.filter(p => p !== null) ?? [];
            const previewItems  = validProducts.slice(0, 4);
            const emptyCount    = Math.max(0, 4 - previewItems.length);
            const isExpanded    = expandedId === outfit.id;
            const isAI          = outfit.source_type === 'ai';
            const totalPrice    = validProducts.reduce((s, i) => s + (Number(i.price) || 0), 0);

            return (
              <article key={outfit.id} className="so-card">

                {/* Delete button */}
                <button
                  onClick={() => setConfirmDelete(outfit.id)}
                  className="so-delete-btn"
                  title={t('saved_outfits.delete_title')}
                >
                  <i className="fas fa-trash-alt"></i>
                </button>

                {/* Source badge */}
                <span className={`so-badge ${isAI ? 'so-badge--ai' : 'so-badge--manual'}`}>
                  <i className={`fas ${isAI ? 'fa-robot' : 'fa-hand-sparkles'}`}></i>
                  {isAI ? t('saved_outfits.ai_outfit', 'AI Önerisi') : t('saved_outfits.manual_outfit', 'Elle Oluşturuldu')}
                </span>

                {/* Image preview grid */}
                <div className="so-images">
                  {previewItems.map(product => (
                    <div key={product.id} className="so-img-cell">
                      {product.image_url ? (
                        <img
                          src={formatUrl(product.image_url)}
                          alt={product.name}
                          className="so-img"
                          onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                        />
                      ) : (
                        <div className="so-img-fallback">
                          <i className="fas fa-image"></i>
                        </div>
                      )}
                    </div>
                  ))}
                  {[...Array(emptyCount)].map((_, i) => (
                    <div key={`empty-${i}`} className="so-img-cell so-img-cell--empty">
                      <i className="fas fa-shirt"></i>
                    </div>
                  ))}
                </div>

                {/* Card body */}
                <div className="so-card-body">
                  <h3 className="so-card-name" title={outfit.name}>{outfit.name}</h3>

                  <p className="so-card-date">
                    <i className="fas fa-calendar-alt"></i>
                    {formatShortDate(outfit.created_at)}
                  </p>

                  {/* Toggle details */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : outfit.id)}
                    className="so-toggle-btn"
                  >
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                    {isExpanded ? t('saved_outfits.hide_details') : t('saved_outfits.view_details')}
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="so-detail">

                      {/* AI reason */}
                      {outfit.reason_text && isAI && (
                        <div className="so-reason">
                          <span className="so-reason-icon"><i className="fas fa-robot"></i></span>
                          <p className="so-reason-text">{getReasonText(outfit.reason_text)}</p>
                        </div>
                      )}

                      {/* Item list */}
                      <div className="so-item-list">
                        {validProducts.map(item => (
                          <div key={item.id} className="so-item-row">
                            {item.image_url ? (
                              <img
                                src={formatUrl(item.image_url)}
                                alt={item.name}
                                className="so-item-thumb"
                                onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                              />
                            ) : (
                              <div className="so-item-thumb-placeholder">
                                <i className="fas fa-image"></i>
                              </div>
                            )}
                            <div className="so-item-info">
                              <span className="so-item-name">{translateName(item.name, lang)}</span>
                              <span className="so-item-meta">{item.brand || t(`categories.${item.category_name}`, item.category_name)}</span>
                            </div>
                            <span className="so-item-price">{formatPrice(item.price || 0)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="so-total-row">
                        <span className="so-total-label">{t('saved_outfits.total_price')}</span>
                        <span className="so-total-price">{formatPrice(totalPrice)}</span>
                      </div>

                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {confirmDelete && (
        <div className="so-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="so-modal" onClick={e => e.stopPropagation()}>
            <div className="so-modal-icon">
              <i className="fas fa-trash-alt"></i>
            </div>
            <h3 className="so-modal-title">{t('saved_outfits.delete_title')}</h3>
            <p className="so-modal-desc">{t('saved_outfits.delete_desc')}</p>
            <div className="so-modal-actions">
              <button
                onClick={() => setConfirmDelete(null)}
                className="so-modal-btn so-modal-btn--cancel"
              >
                {t('saved_outfits.btn_cancel')}
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting}
                className="so-modal-btn so-modal-btn--delete"
              >
                {deleting ? (
                  <><i className="fas fa-spinner fa-spin"></i> {t('saved_outfits.deleting')}</>
                ) : (
                  t('saved_outfits.btn_delete')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
