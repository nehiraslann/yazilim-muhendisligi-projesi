import { useState, useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLanguageToggleLabel, getLanguageToggleTitle, toggleAppLanguage } from '../utils/i18nUtils';
import './Auth.css';

export default function Register() {
  const { t, i18n } = useTranslation();
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleName, setRoleName] = useState('Customer');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Şifre gücü göstergesi
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', t('register.strength_weak'), t('register.strength_medium'), t('register.strength_strong')][strength];
  const strengthColor = ['', '#e53935', '#fb8c00', '#43a047'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ username, email, password, roleName });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || t('register.error_auth'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-brand-card" style={{ maxWidth: '500px' }}>
        
        {/* ── LANGUAGE SWITCHER ── */}
        <button 
          className="auth-lang-btn" 
          onClick={() => toggleAppLanguage(i18n)}
          title={getLanguageToggleTitle(i18n)}
        >
          {getLanguageToggleLabel(i18n)}
        </button>     
        
        {/* ── HEADER ── */}
        <div className="auth-header">
          <h1 className="auth-logo">
            <i className="fas fa-gem"></i>
            StyleAI
          </h1>
          <p className="auth-subtitle">{t('register.subtitle')}</p>
        </div>

        {/* ── ERROR ALERT ── */}
        {error && (
          <div className="auth-alert">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {/* ── FORM ── */}
        <form onSubmit={handleSubmit} className="auth-form">
          
          <div className="auth-group">
            <label className="auth-label">{t('register.username_label')}</label>
            <div className="auth-input-wrapper">
              <i className="fas fa-user auth-icon"></i>
              <input
                type="text" 
                required 
                className="auth-input"
                placeholder={t('register.username_placeholder')}
                value={username} 
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="auth-group">
            <label className="auth-label">{t('common.email')}</label>
            <div className="auth-input-wrapper">
              <i className="fas fa-envelope auth-icon"></i>
              <input
                type="email" 
                required 
                className="auth-input"
                placeholder={t('login.email_placeholder')}
                value={email} 
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-group">
            <label className="auth-label">{t('common.password')}</label>
            <div className="auth-input-wrapper">
              <i className="fas fa-lock auth-icon"></i>
              <input
                type={showPassword ? 'text' : 'password'} 
                required 
                className="auth-input"
                placeholder={t('register.password_placeholder')}
                value={password} 
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
              />
              <button
                type="button"
                className="auth-pwd-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? t('common.hide') : t('common.show')}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="auth-pwd-strength">
                <div className="auth-pwd-bars">
                  {[1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className="auth-pwd-bar"
                      style={{ 
                        background: i <= strength ? strengthColor : 'var(--color-border)', 
                      }}
                    ></div>
                  ))}
                </div>
                <span className="auth-pwd-label" style={{ color: strengthColor }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          <div className="auth-group" style={{ marginBottom: '0.25rem' }}>
            <label className="auth-label">{t('register.account_type')}</label>
            <div className="auth-segmented">
              {[{ v: 'Customer', label: t('register.role_customer'), icon: 'fa-user' }, { v: 'Seller', label: t('register.role_seller'), icon: 'fa-store' }].map(opt => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setRoleName(opt.v)}
                  className={`auth-segment-btn ${roleName === opt.v ? 'is-active' : ''}`}
                >
                  <i className={`fas ${opt.icon}`}></i>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> {t('register.submitting')}</>
            ) : (
              <><i className="fas fa-user-plus"></i> {t('register.submit_btn')}</>
            )}
          </button>
        </form>

        {/* ── FOOTER ── */}
        <div className="auth-footer">
          {t('register.has_account')} 
          <Link to="/login" className="auth-link">{t('register.login_link')}</Link>
        </div>

      </div>
    </div>
  );
}
