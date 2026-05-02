import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PLATFORM_LINKS = [
  { path: '/', key: 'navbar.discover' },
  { path: '/ai-stylist', key: 'navbar.ai_stylist' },
  { path: '/outfit-builder', key: 'navbar.outfit_builder' },
  { path: '/saved-outfits', key: 'navbar.my_styles' },
];

const HELP_KEYS = ['footer.faq', 'footer.size_guide', 'footer.color_palettes', 'footer.contact'];
const SOCIAL_LABELS = ['Instagram', 'Pinterest', 'Twitter'];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-heading)' }}>
              <i className="fas fa-gem" style={{ color: 'var(--color-primary)' }}></i>
              StyleAI
            </h3>
            <p>{t('footer.subtitle')}</p>
          </div>

          <div className="footer-col">
            <h4>{t('footer.platform')}</h4>
            <ul>
              {PLATFORM_LINKS.map(({ path, key }) => (
                <li key={path}>
                  <Link to={path}>{t(key)}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('footer.help')}</h4>
            <ul>
              {HELP_KEYS.map((key) => (
                <li key={key} style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('footer.social')}</h4>
            <div className="footer-social" aria-label={t('footer.social')}>
              {SOCIAL_LABELS.map((label) => (
                <span
                  key={label}
                  title={label}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-bg-warm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <i className={`fab fa-${label.toLowerCase()}`}></i>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
