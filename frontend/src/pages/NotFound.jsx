import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="container page-content flex items-center justify-center text-center" style={{ minHeight: '60vh', flexDirection: 'column' }}>
      <h1 className="font-heading" style={{ fontSize: '8rem', color: 'var(--color-primary)', lineHeight: '1', marginBottom: '16px' }}>
        404
      </h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>{t('not_found.title', 'Sayfa Bulunamadı')}</h2>
      <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '32px', maxWidth: '400px' }}>
        {t('not_found.desc', 'Aradığınız sayfaya ulaşılamıyor, yayından kaldırılmış veya bağlantı hatalı olabilir.')}
      </p>
      
      <Link to="/" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>
        <i className="fas fa-home" style={{ marginRight: '8px' }}></i> {t('not_found.btn', 'Ana Sayfaya Dön')}
      </Link>
    </div>
  );
}
