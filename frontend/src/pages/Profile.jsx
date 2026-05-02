import { useTranslation } from 'react-i18next';
import { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/auth-context';
import { safeT } from '../utils/i18nUtils';
import { reportClientError } from '../utils/logger';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', email: '', avatar_url: '', current_password: '', new_password: '' });
  const [outfitCount, setOutfitCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, outfitRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/outfits'),
        ]);
        const u = meRes.data;
        setForm({ name: u.name || '', email: u.email || '', avatar_url: u.avatar_url || '', current_password: '', new_password: '' });
        setOutfitCount(outfitRes.data.length);
      } catch (err) {
        reportClientError('Profil verileri yuklenemedi:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage(''); setError('');
    try {
      const payload = {
        name: form.name,
        avatar_url: form.avatar_url || null,
      };
      if (form.new_password) {
        payload.current_password = form.current_password;
        payload.new_password = form.new_password;
      }
      const { data: updatedUser } = await api.put('/auth/me', payload);
      setForm(prev => ({
        ...prev,
        name: updatedUser?.name || updatedUser?.username || prev.name,
        avatar_url: updatedUser?.avatar_url ?? '',
        current_password: '',
        new_password: '',
      }));
      if (setUser && updatedUser) {
        const nextUser = {
          ...user,
          ...updatedUser,
          username: updatedUser.username || user?.username,
          name: updatedUser.name || updatedUser.username || user?.name,
          avatar_url: updatedUser.avatar_url ?? null,
        };
        setUser(nextUser);
        localStorage.setItem('user', JSON.stringify(nextUser));
      }
      setMessage(safeT(t, 'profile.success', 'Profile updated successfully!'));
    } catch (err) {
      setError(err.response?.data?.message || safeT(t, 'profile.error_pass', 'An error occurred during update.'));
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.name || user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long' }) : '—';

  const roleLabel = { Admin: safeT(t, 'profile.role_admin', 'Admin'), Seller: safeT(t, 'profile.role_seller', 'Seller'), Customer: safeT(t, 'profile.role_customer', 'Customer') }[user?.role] || user?.role;
  const roleColor = { Admin: '#6ba3d9', Seller: 'var(--color-primary)', Customer: 'var(--color-success)' }[user?.role] || 'var(--color-primary)';

  if (loading) return (
    <div className="container page-content" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--color-primary)' }}></i>
    </div>
  );

  return (
    <div className="container page-content" style={{ maxWidth: '900px' }}>

      {/* ── Profile Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-surface) 100%)',
        borderRadius: '24px',
        padding: '2.5rem',
        marginBottom: '2rem',
        border: '1px solid var(--color-border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {form.avatar_url ? (
            <img
              src={form.avatar_url}
              alt={form.name}
              onError={e => e.target.style.display = 'none'}
              style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: 'var(--shadow-md)' }}
            />
          ) : null}
          <div style={{
            width: '96px', height: '96px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-rose))',
            display: form.avatar_url ? 'none' : 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '2rem', fontWeight: 700,
            border: '3px solid #fff', boxShadow: 'var(--shadow-md)',
          }}>
            {initials}
          </div>
        </div>

        {/* User info */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--color-text)', margin: 0 }}>
              {form.name || safeT(t, 'profile.anon', 'Anonymous User')}
            </h1>
            <span style={{
              padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem',
              fontWeight: 700, background: roleColor, color: '#fff',
            }}>
              {roleLabel}
            </span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: '0 0 12px' }}>{form.email}</p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { icon: 'fa-heart', label: safeT(t, 'profile.outfits', 'Outfits'), value: outfitCount },
              { icon: 'fa-calendar-alt', label: safeT(t, 'profile.joined', 'Joined'), value: joinDate },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)' }}>{value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <i className={`fas ${icon}`} style={{ marginRight: '4px' }}></i>{label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Left: Personal info */}
        <form onSubmit={handleSave} style={{ display: 'contents' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: '20px', padding: '1.75rem', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.25rem', fontSize: '1.1rem', color: 'var(--color-text)' }}>
              <i className="fas fa-user-edit" style={{ color: 'var(--color-primary)', marginRight: '8px' }}></i>
              {safeT(t, 'profile.title', 'Personal Information')}
            </h3>

            <div className="form-group">
              <label className="form-label">{safeT(t, 'profile.fullName', 'Full Name')}</label>
              <input
                type="text"
                className="form-input"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder={safeT(t, 'profile.fullName', 'Full Name')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{safeT(t, 'profile.email', 'Email')}</label>
              <input type="email" className="form-input" value={form.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} placeholder={safeT(t, 'profile.email', 'Email')} />
            </div>

            <div className="form-group">
              <label className="form-label">{safeT(t, 'profile.profileImage', 'Profile Image URL')}</label>
              <input
                type="url"
                className="form-input"
                value={form.avatar_url}
                onChange={e => setForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                placeholder="https://example.com/photo.jpg"
              />
              {form.avatar_url && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={form.avatar_url}
                    alt="preview"
                    onError={e => e.target.style.display = 'none'}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{safeT(t, 'profile.preview', 'Preview')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Password */}
          <div style={{ background: 'var(--color-surface)', borderRadius: '20px', padding: '1.75rem', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.25rem', fontSize: '1.1rem', color: 'var(--color-text)' }}>
              <i className="fas fa-lock" style={{ color: 'var(--color-primary)', marginRight: '8px' }}></i>
              {safeT(t, 'profile.changePassword', 'Change Password')}
            </h3>
            <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              {safeT(t, 'profile.password_desc', 'Leave these fields blank if you do not wish to change your password.')}
            </p>

            <div className="form-group">
              <label className="form-label">{safeT(t, 'profile.currentPassword', 'Current Password')}</label>
              <input
                type="password"
                className="form-input"
                value={form.current_password}
                onChange={e => setForm(prev => ({ ...prev, current_password: e.target.value }))}
                placeholder={safeT(t, 'profile.currentPassword', 'Current Password')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{safeT(t, 'profile.newPassword', 'New Password')}</label>
              <input
                type="password"
                className="form-input"
                value={form.new_password}
                onChange={e => setForm(prev => ({ ...prev, new_password: e.target.value }))}
                placeholder={safeT(t, 'profile.minPassword', 'Minimum 6 characters')}
              />
            </div>

            {/* Account info */}
            <div style={{ background: 'var(--color-bg-warm)', borderRadius: '12px', padding: '12px 14px', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                <i className="fas fa-shield-alt" style={{ marginRight: '6px', color: 'var(--color-primary)' }}></i>
                {safeT(t, 'profile.passwordHint', 'Use a strong password for your account security.')}
              </p>
            </div>
          </div>

          {/* Messages & Save */}
          <div style={{ gridColumn: '1 / -1' }}>
            {error && (
              <div style={{ background: '#fce4ec', border: '1px solid #f5c2cc', borderRadius: '10px', padding: '12px 16px', marginBottom: '12px', color: '#c62828', fontSize: '0.88rem' }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }}></i>{error}
              </div>
            )}
            {message && (
              <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '10px', padding: '12px 16px', marginBottom: '12px', color: '#2e7d32', fontSize: '0.88rem' }}>
                <i className="fas fa-check-circle" style={{ marginRight: '6px' }}></i>{message}
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {saving
                ? <><i className="fas fa-spinner fa-spin"></i> {safeT(t, 'profile.saving', 'Saving...')}</>
                : <><i className="fas fa-save"></i> {safeT(t, 'profile.save', 'Save Changes')}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
