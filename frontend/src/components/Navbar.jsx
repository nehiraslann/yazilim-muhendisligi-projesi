import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/auth-context';
import { getDefaultRouteForRole, getNavigationLinks } from '../utils/roleUtils';
import { getLanguageToggleLabel, getLanguageToggleTitle, isEnglishLanguage, toggleAppLanguage } from '../utils/i18nUtils';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('styleai-theme') === 'dark');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('styleai-theme', 'dark');
      return;
    }

    document.body.removeAttribute('data-theme');
    localStorage.setItem('styleai-theme', 'light');
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  if (!user) return null;

  const links = getNavigationLinks(t, user.role);
  const homePath = getDefaultRouteForRole(user.role);
  const isCustomer = user.role === 'Customer';
  const primaryLinks = isCustomer ? links : [];
  const roleLinks = isCustomer ? [] : links;

  return (
    <nav className={`navbar${isScrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <Link to={homePath} className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          <i className="fas fa-gem" style={{ color: 'var(--color-primary)', fontSize: '1.4rem' }}></i>
          StyleAI
        </Link>
        
        <div className={`nav-links ${isCustomer ? 'nav-links--customer' : 'nav-links--compact'}`}>
          {primaryLinks.map(l => (
            <Link 
              key={l.path} 
              to={l.path} 
              className={`nav-link ${location.pathname === l.path ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className={`nav-actions ${isCustomer ? 'nav-actions--customer' : 'nav-actions--role'}`}>
          {roleLinks.length > 0 && (
            <div className="nav-role-links">
              {roleLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link nav-role-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '30px', padding: '4px' }}>
            <button 
              onClick={() => toggleAppLanguage(i18n)} 
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontWeight: 700, fontSize: '0.85rem', padding: '6px 12px', cursor: 'pointer', borderRadius: '20px', transition: 'var(--transition-fast)' }}
              title={getLanguageToggleTitle(i18n)}
              className="hover-bg-warm"
            >
              {getLanguageToggleLabel(i18n)}
            </button>
            <div style={{ width: '1px', height: '16px', background: 'var(--color-border)', margin: '0 4px' }}></div>
            <button 
              onClick={toggleTheme} 
              style={{ background: 'transparent', border: 'none', color: isDark ? '#f59e0b' : 'var(--color-text-secondary)', padding: '6px 12px', cursor: 'pointer', borderRadius: '20px', fontSize: '0.9rem', transition: 'var(--transition-fast)' }}
              title={isEnglishLanguage(i18n) ? 'Toggle theme' : 'Tema Değiştir'}
              className="hover-bg-warm"
            >
              <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
          </div>

          <div className="user-menu-wrap">
            <button className="user-avatar-btn" style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '4px 12px 4px 4px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{user.username}</span>
              </div>
              <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}></i>
            </button>
            
            <div className="dropdown-menu">
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border-light)', marginBottom: '4px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.username}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                  {user.role}
                </div>
              </div>
              
              <Link to="/profile" className="dropdown-item">
                <i className="fas fa-user" style={{ width: '20px' }}></i> {t('navbar.profile', 'Profil')}
              </Link>
              <button 
                onClick={logout} 
                className="dropdown-item" 
                style={{ width: '100%', textAlign: 'left', color: 'var(--color-danger)' }}
              >
                <i className="fas fa-sign-out-alt" style={{ width: '20px' }}></i> {t('navbar.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
