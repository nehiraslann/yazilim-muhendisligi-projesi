import { useState, useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDefaultRouteForRole } from '../utils/roleUtils';
import { getLanguageToggleLabel, getLanguageToggleTitle, toggleAppLanguage } from '../utils/i18nUtils';
import './Auth.css';

export default function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await login({ email, password });
      navigate(getDefaultRouteForRole(loggedInUser?.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || t('login.error_auth'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-brand-card">
        
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
          <p className="auth-subtitle">{t('login.subtitle')}</p>
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
                placeholder="••••••••"
                value={password} 
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> {t('login.logging_in')}</>
            ) : (
              <><i className="fas fa-sign-in-alt"></i> {t('login.submit_btn')}</>
            )}
          </button>
        </form>

        {/* ── FOOTER ── */}
        <div className="auth-footer">
          {t('login.no_account')} 
          <Link to="/register" className="auth-link">{t('login.join_now')}</Link>
        </div>

      </div>
    </div>
  );
}
