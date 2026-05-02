import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { SEASON_GROUPS } from '../utils/productUtils';
import { translateName, translateColor } from '../utils/translators';
import { formatUrl, fallbackImage } from '../utils/imageUtils';
import { formatPrice } from '../utils/formatters';
import { getPrimaryLanguage } from '../utils/i18nUtils';
import './AIStylist.css';

const STYLE_OPTIONS = ['casual', 'chic', 'sporty', 'classic'];
const SEASON_ICONS = {
  summerCool: 'fa-sun',
  autumnWarm: 'fa-leaf',
  winterCool: 'fa-snowflake',
  springWarm: 'fa-seedling',
};

export default function AIStylist() {
  const { t, i18n } = useTranslation();
  const [season, setSeason] = useState('summerCool');
  const [stylePreference, setStylePreference] = useState('casual');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [saveToast, setSaveToast] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [savingOutfitKey, setSavingOutfitKey] = useState(null);
  const [savedOutfitKeys, setSavedOutfitKeys] = useState(new Set());
  const toastTimerRef = useRef(null);
  const currentLang = getPrimaryLanguage(i18n);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const getOutfitKey = outfit => outfit.items.map(item => item.id).sort((left, right) => left - right).join('-');

  const showSaveToast = message => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setSaveToast(message);
    toastTimerRef.current = setTimeout(() => setSaveToast(''), 4000);
  };

  const getSaveButtonLabel = (isSaving, isSaved) => {
    if (isSaving) return t('outfit_builder.saving');
    if (isSaved) return currentLang === 'en' ? 'Added' : 'Eklendi';
    return t('ai_stylist.add_to_wardrobe');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setInfoMessage('');
    setRecommendations([]);
    setExpandedIndex(null);
    setSavedOutfitKeys(new Set());
    setSavingOutfitKey(null);
    setSaveToast('');

    try {
      const { data } = await api.post('/recommendations/generate', {
        seasonName: season,
        stylePreference,
        lang: currentLang,
      });

      if (data.recommendations?.length > 0) {
        setRecommendations(data.recommendations);
        if (data.message) {
          setInfoMessage(data.message);
        } else if (data.is_fallback) {
          setInfoMessage(t('ai_stylist.fallback_info'));
        }
      } else {
        if (data.message) {
          setInfoMessage(data.message);
        } else {
          setError(t('ai_stylist.no_outfit_error'));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || t('ai_stylist.generate_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOutfit = async outfit => {
    const outfitKey = getOutfitKey(outfit);
    if (savingOutfitKey === outfitKey) return;

    const displayName = currentLang === 'en'
      ? (outfit.name_en || outfit.name)
      : (outfit.name_tr || outfit.name);

    if (savedOutfitKeys.has(outfitKey)) {
      showSaveToast(t('ai_stylist.saved_success', { name: displayName }));
      return;
    }

    setError('');
    setSavingOutfitKey(outfitKey);

    try {
      await api.post('/outfits', {
        name: outfit.name_tr || outfit.name,
        name_tr: outfit.name_tr || outfit.name,
        name_en: outfit.name_en || outfit.name,
        productIds: outfit.items.map(item => item.id),
        source_type: 'ai',
        reason_text: outfit.reason_tr || outfit.reason,
      });

      setSavedOutfitKeys(previous => {
        const next = new Set(previous);
        next.add(outfitKey);
        return next;
      });
      showSaveToast(t('ai_stylist.saved_success', { name: displayName }));
    } catch (err) {
      setError(err.response?.data?.message || t('ai_stylist.save_error'));
    } finally {
      setSavingOutfitKey(null);
    }
  };

  const getHarmonyScore = outfit => Math.min(100, Math.round(outfit.score || 75));

  return (
    <div className="ais-page">
      {saveToast && (
        <div className="ais-toast-stack" role="status" aria-live="polite">
          <div className="ais-toast ais-toast--success">
            <i className="fas fa-check-circle"></i>
            {saveToast}
          </div>
        </div>
      )}

      <section className="ais-hero">
        <div className="ais-hero-inner">
          <span className="ais-hero-eyebrow">
            <i className="fas fa-wand-magic-sparkles"></i>
            {t('navbar.ai_stylist')}
          </span>
          <h1 className="ais-hero-title">{t('ai_stylist.title')}</h1>
          <p className="ais-hero-sub">{t('ai_stylist.subtitle')}</p>
        </div>
      </section>

      <div className="ais-body">
        <section className="ais-section">
          <div className="ais-section-label">
            <i className="fas fa-palette"></i>
            {t('ai_stylist.select_season')}
          </div>
          <div className="ais-season-grid">
            {SEASON_GROUPS.map(seasonOption => {
              const isSelected = season === seasonOption.id;
              return (
                <button
                  key={seasonOption.id}
                  onClick={() => setSeason(seasonOption.id)}
                  className={`ais-season-card${isSelected ? ' is-selected' : ''}`}
                  style={{ '--season-color': seasonOption.color }}
                >
                  <i className={`fas ${SEASON_ICONS[seasonOption.id] || 'fa-circle'} ais-season-icon`}></i>
                  <span className="ais-season-name">{t(`seasons.${seasonOption.id}`, seasonOption.name)}</span>
                  <span className="ais-season-desc">{t(`season_guide.seasons.${seasonOption.id}.desc`, seasonOption.desc)}</span>
                  {isSelected && <span className="ais-season-check"><i className="fas fa-check"></i></span>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="ais-section">
          <div className="ais-section-label">
            <i className="fas fa-tag"></i>
            {t('ai_stylist.select_style')}
          </div>
          <div className="ais-style-group">
            {STYLE_OPTIONS.map(styleOption => (
              <button
                key={styleOption}
                onClick={() => setStylePreference(styleOption)}
                className={`ais-style-btn${stylePreference === styleOption ? ' is-selected' : ''}`}
              >
                {t(`styles.${styleOption}`, styleOption)}
              </button>
            ))}
          </div>
        </section>

        <section className="ais-cta-section">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="ais-cta-btn"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>{t('ai_stylist.analyzing')}</span>
              </>
            ) : (
              <>
                <i className="fas fa-wand-magic-sparkles"></i>
                <span>{t('ai_stylist.generate_btn')}</span>
              </>
            )}
          </button>
          <p className="ais-cta-hint">
            {t(`seasons.${season}`, season)} · {t(`styles.${stylePreference}`, stylePreference)}
          </p>
        </section>

        {error && (
          <div className="ais-msg ais-msg--error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        {infoMessage && (
          <div className="ais-msg ais-msg--info">
            <i className="fas fa-info-circle"></i>
            {infoMessage}
          </div>
        )}

        {recommendations.length > 0 && (
          <section className="ais-results">
            <div className="ais-results-header">
              <h2 className="ais-results-title">
                <i className="fas fa-stars"></i>
                {t('ai_stylist.recommendations_title')}
              </h2>
              <span className="ais-results-count">{t('ai_stylist.outfits_count', { count: recommendations.length })}</span>
            </div>

            <div className="ais-cards-grid">
              {recommendations.map((outfit, index) => {
                const displayName = currentLang === 'en'
                  ? (outfit.name_en || outfit.name)
                  : (outfit.name_tr || outfit.name);
                const displayReason = currentLang === 'en'
                  ? (outfit.reason_en || outfit.reason)
                  : (outfit.reason_tr || outfit.reason);
                const score = getHarmonyScore(outfit);
                const totalPrice = outfit.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
                const isExpanded = expandedIndex === index;
                const outfitKey = getOutfitKey(outfit);
                const isSaving = savingOutfitKey === outfitKey;
                const isSaved = savedOutfitKeys.has(outfitKey);

                return (
                  <article key={outfitKey} className="ais-card">
                    <div className="ais-card-images">
                      {outfit.items.map(item => (
                        <div key={item.id} className="ais-card-img-wrap">
                          <img
                            src={formatUrl(item.image_url)}
                            alt={item.name}
                            className="ais-card-img"
                            onError={event => {
                              event.target.onerror = null;
                              event.target.src = fallbackImage;
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="ais-card-body">
                      <div className="ais-card-top">
                        <h3 className="ais-card-name">{displayName}</h3>
                        <span className="ais-card-price">{formatPrice(totalPrice)}</span>
                      </div>

                      <div className="ais-score-row">
                        <span className="ais-score-label">{t('ai_stylist.color_harmony')}</span>
                        <div className="ais-score-track">
                          <div
                            className="ais-score-fill"
                            style={{
                              width: `${score}%`,
                              background: score > 80 ? 'var(--color-success)' : 'var(--color-primary)',
                            }}
                          />
                        </div>
                        <span className="ais-score-pct">{score}%</span>
                      </div>

                      {outfit.items.some(item => item.color_name) && (
                        <div className="ais-color-tags">
                          {outfit.items.map(item => item.color_name).filter(Boolean).map((colorName, colorIndex) => (
                            <span key={`${outfitKey}-${colorIndex}`} className="ais-color-tag">
                              {translateColor(colorName, currentLang)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="ais-reason">
                        <span className="ais-reason-icon"><i className="fas fa-robot"></i></span>
                        <p className="ais-reason-text">
                          {displayReason || t('ai_stylist.default_reason')}
                        </p>
                      </div>

                      <button
                        onClick={() => setExpandedIndex(isExpanded ? null : index)}
                        className="ais-toggle-btn"
                      >
                        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                        {isExpanded ? t('ai_stylist.hide_details') : t('ai_stylist.view_items')}
                      </button>

                      {isExpanded && (
                        <div className="ais-item-list">
                          {outfit.items.map(item => (
                            <div key={item.id} className="ais-item-row">
                              <img
                                src={formatUrl(item.image_url)}
                                alt={item.name}
                                className="ais-item-thumb"
                                onError={event => {
                                  event.target.onerror = null;
                                  event.target.src = fallbackImage;
                                }}
                              />
                              <div className="ais-item-info">
                                <span className="ais-item-name">{translateName(item.name, currentLang)}</span>
                                <span className="ais-item-cat">{t(`categories.${item.category_name}`, item.category_name)}</span>
                              </div>
                              <span className="ais-item-price">{formatPrice(item.price)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="ais-card-footer">
                        <button
                          onClick={() => handleSaveOutfit(outfit)}
                          disabled={isSaving || isSaved}
                          className={`ais-save-btn${isSaved ? ' is-saved' : ''}`}
                        >
                          {isSaving ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className={`fas ${isSaved ? 'fa-check' : 'fa-heart'}`}></i>
                          )}
                          {getSaveButtonLabel(isSaving, isSaved)}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
