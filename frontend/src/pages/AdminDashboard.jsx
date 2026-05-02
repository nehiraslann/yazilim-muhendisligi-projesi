import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { AuthContext } from '../context/auth-context';
import useTimedToast from '../hooks/useTimedToast';
import { formatPrice, formatShortDate } from '../utils/formatters';
import { getPrimaryLanguage, safeT } from '../utils/i18nUtils';
import { reportClientError } from '../utils/logger';
import { translateName } from '../utils/translators';
import './AdminDashboard.css';

const SHOE_KEYWORDS = ['ayakkabi', 'ayakkabı', 'platform', 'topuklu', 'bot', 'cizme', 'çizme', 'sandalet', 'sneaker', 'loafer', 'stiletto', 'terlik'];
const TABS = [
  { key: 'overview', tKey: 'admin.overview', fallback: 'Overview', icon: 'fa-chart-pie' },
  { key: 'users', tKey: 'admin.users', fallback: 'Users', icon: 'fa-users' },
  { key: 'products', tKey: 'admin.catalog', fallback: 'Catalog', icon: 'fa-box' },
];
const ROLE_META = {
  Admin: { cls: 'adm-badge--admin', label: 'Yonetici', tKey: 'profile.role_admin' },
  Seller: { cls: 'adm-badge--seller', label: 'Satici', tKey: 'profile.role_seller' },
  Customer: { cls: 'adm-badge--customer', label: 'Musteri', tKey: 'profile.role_customer' },
};

const stripHtml = (value = '') => value.replace(/<[^>]+>/g, '');
const getInitials = (name = '') => name.substring(0, 2).toUpperCase() || '??';
const getRoleMeta = (roleName) => ROLE_META[roleName] ?? {
  cls: 'adm-badge--customer',
  label: roleName,
  tKey: `profile.role_${roleName?.toLowerCase()}`,
};

const fetchAdminUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data;
};

const fetchAdminProducts = async () => {
  const { data } = await api.get('/admin/products');
  return data;
};

function displayCategory(product) {
  const normalizedName = (product?.name || '').toLowerCase();
  return SHOE_KEYWORDS.some(keyword => normalizedName.includes(keyword)) ? 'Ayakkabı' : product?.category_name;
}

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  const { toast, showToast } = useTimedToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const currentLang = getPrimaryLanguage(i18n);
  const isEnglish = currentLang === 'en';

  useEffect(() => {
    let cancelled = false;

    const syncUsers = async () => {
      try {
        const data = await fetchAdminUsers();
        if (!cancelled) setUsers(data);
      } catch (error) {
        reportClientError('Admin users yuklenemedi:', error);
      }
    };

    const syncProducts = async () => {
      try {
        const data = await fetchAdminProducts();
        if (!cancelled) setProducts(data);
      } catch (error) {
        reportClientError('Admin urunleri yuklenemedi:', error);
      }
    };

    if (activeTab === 'overview') {
      void Promise.all([syncUsers(), syncProducts()]);
    } else if (activeTab === 'users' && users.length === 0) {
      void syncUsers();
    } else if (activeTab === 'products' && products.length === 0) {
      void syncProducts();
    }

    return () => {
      cancelled = true;
    };
  }, [activeTab, products.length, users.length]);

  const categoryLabel = (product) => {
    const category = displayCategory(product);
    return safeT(t, `categories.${category}`, category);
  };

  const toggleUser = async (id) => {
    try {
      const { data } = await api.patch(`/admin/users/${id}/toggle-status`);
      showToast(data.message);
      setUsers(previous => previous.map(item => (
        item.id === id ? { ...item, is_active: data.is_active } : item
      )));
    } catch (error) {
      showToast(error.response?.data?.message || 'Hata', 'error');
    }
  };

  const toggleProduct = async (id) => {
    try {
      const { data } = await api.patch(`/admin/products/${id}/toggle-status`);
      showToast(data.message);
      setProducts(previous => previous.map(item => (
        item.id === id ? { ...item, is_active: data.is_active } : item
      )));
    } catch (error) {
      showToast(error.response?.data?.message || 'Hata', 'error');
    }
  };

  const stats = [
    { icon: 'fa-users', label: safeT(t, 'admin.totalUsers', 'Total Users'), value: users.length, accent: 'var(--color-primary)' },
    { icon: 'fa-user-check', label: safeT(t, 'admin.activeUsers', 'Active Users'), value: users.filter(item => item.is_active).length, accent: 'var(--color-success)' },
    { icon: 'fa-box', label: safeT(t, 'admin.totalProducts', 'Total Products'), value: products.length, accent: '#6366f1' },
    { icon: 'fa-toggle-on', label: safeT(t, 'admin.liveProducts', 'Live Products'), value: products.filter(item => item.is_active).length, accent: 'var(--color-info)' },
  ];

  const welcomeText = stripHtml(safeT(t, 'admin.welcome', 'Welcome, {{username}}.')).replace('{{username}}', user?.username || '');

  return (
    <div className="adm-page">
      {toast && (
        <div className={`adm-toast adm-toast--${toast.type}`}>
          <i className={`fas ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-check-circle'}`}></i>
          {toast.msg}
        </div>
      )}

      <div className="adm-hero">
        <div className="adm-hero-left">
          <span className="adm-hero-eyebrow">
            <i className="fas fa-shield-halved"></i>
            {safeT(t, 'admin.eyebrow', 'Management System')}
          </span>
          <h1 className="adm-hero-title">{safeT(t, 'admin.title', 'Admin Dashboard')}</h1>
          <p className="adm-hero-sub">{welcomeText}</p>
        </div>
        <div className="adm-online-badge">
          <span className="adm-online-dot"></span>
          {safeT(t, 'admin.system_online', 'System Online')}
        </div>
      </div>

      <div className="adm-tabs">
        {TABS.map(({ key, tKey, fallback, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`adm-tab${activeTab === key ? ' adm-tab--active' : ''}`}
          >
            <i className={`fas ${icon}`}></i>
            {safeT(t, tKey, fallback)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="adm-overview">
          <div className="adm-stats">
            {stats.map(item => (
              <div key={item.label} className="adm-stat-card">
                <div className="adm-stat-icon" style={{ background: `${item.accent}18`, color: item.accent }}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <div className="adm-stat-body">
                  <div className="adm-stat-value">{item.value}</div>
                  <div className="adm-stat-label">{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="adm-summary-grid">
            <div className="adm-summary-card">
              <div className="adm-summary-header">
                <span className="adm-summary-icon"><i className="fas fa-user-clock"></i></span>
                <h3 className="adm-summary-title">{safeT(t, 'admin.recentUsers', 'Recently Registered')}</h3>
              </div>
              <div className="adm-summary-list">
                {users.slice(0, 5).map(item => {
                  const role = getRoleMeta(item.role_name);

                  return (
                    <div key={item.id} className="adm-summary-row">
                      <div className="adm-avatar">{getInitials(item.username)}</div>
                      <div className="adm-summary-info">
                        <span className="adm-summary-name">{item.username}</span>
                        <span className="adm-summary-meta">{item.email}</span>
                      </div>
                      <span className={`adm-badge ${role.cls}`}>{safeT(t, role.tKey, role.label)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="adm-summary-card">
              <div className="adm-summary-header">
                <span className="adm-summary-icon"><i className="fas fa-box-open"></i></span>
                <h3 className="adm-summary-title">{safeT(t, 'admin.recentProducts', 'Recently Added')}</h3>
              </div>
              <div className="adm-summary-list">
                {products.slice(0, 5).map(item => (
                  <div key={item.id} className="adm-summary-row">
                    <div className="adm-summary-info">
                      <span className="adm-summary-name">{translateName(item.name, i18n)}</span>
                      <span className="adm-summary-meta">{item.seller_name} · {categoryLabel(item)}</span>
                    </div>
                    <span className="adm-price">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="adm-table-card">
          <div className="adm-table-header">
            <h2 className="adm-table-title">
              {safeT(t, 'admin.users', 'Users')}
              <span className="adm-table-count">{users.length} {isEnglish ? 'users' : 'kayit'}</span>
            </h2>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>{safeT(t, 'admin.user', 'User')}</th>
                  <th>{safeT(t, 'admin.email', 'Email')}</th>
                  <th>{safeT(t, 'admin.role', 'Role')}</th>
                  <th>{safeT(t, 'admin.col_date', 'Register Date')}</th>
                  <th>{safeT(t, 'admin.status', 'Status')}</th>
                  <th className="adm-th-right">{safeT(t, 'admin.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(item => {
                  const role = getRoleMeta(item.role_name);

                  return (
                    <tr key={item.id} className="adm-tr">
                      <td>
                        <div className="adm-user-cell">
                          <div className="adm-avatar adm-avatar--sm">{getInitials(item.username)}</div>
                          <span className="adm-user-name">{item.username}</span>
                        </div>
                      </td>
                      <td className="adm-td-muted">{item.email}</td>
                      <td>
                        <span className={`adm-badge ${role.cls}`}>{safeT(t, role.tKey, role.label)}</span>
                      </td>
                      <td className="adm-td-muted">{formatShortDate(item.created_at)}</td>
                      <td>
                        <span className={`adm-status ${item.is_active ? 'adm-status--active' : 'adm-status--passive'}`}>
                          <span className="adm-status-dot"></span>
                          {item.is_active ? safeT(t, 'admin.status_active', 'Active') : safeT(t, 'admin.status_passive', 'Passive')}
                        </span>
                      </td>
                      <td>
                        <div className="adm-action-wrap">
                          <button
                            onClick={() => toggleUser(item.id)}
                            className={`adm-action-btn ${item.is_active ? 'adm-action-btn--suspend' : 'adm-action-btn--activate'}`}
                          >
                            <i className={`fas ${item.is_active ? 'fa-ban' : 'fa-check'}`}></i>
                            {item.is_active ? safeT(t, 'admin.suspend', 'Suspend') : safeT(t, 'admin.activate', 'Activate')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="adm-table-card">
          <div className="adm-table-header">
            <h2 className="adm-table-title">
              {safeT(t, 'admin.catalog', 'Catalog Management')}
              <span className="adm-table-count">{products.length} {isEnglish ? 'products' : 'urun'}</span>
            </h2>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>{safeT(t, 'admin.catalog', 'Catalog Management')}</th>
                  <th>{safeT(t, 'admin.col_seller', 'Seller')}</th>
                  <th>{safeT(t, 'admin.col_cat', 'Category')}</th>
                  <th>{safeT(t, 'admin.col_price', 'Price')}</th>
                  <th>{safeT(t, 'admin.status', 'Status')}</th>
                  <th className="adm-th-right">{safeT(t, 'admin.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map(item => (
                  <tr key={item.id} className="adm-tr">
                    <td className="adm-product-name">{translateName(item.name, i18n)}</td>
                    <td className="adm-td-muted">{item.seller_name}</td>
                    <td>
                      <span className="adm-badge adm-badge--cat">{categoryLabel(item)}</span>
                    </td>
                    <td className="adm-price-cell">{formatPrice(item.price)}</td>
                    <td>
                      <span className={`adm-status ${item.is_active ? 'adm-status--active' : 'adm-status--passive'}`}>
                        <span className="adm-status-dot"></span>
                        {item.is_active ? safeT(t, 'admin.status_live', 'Live') : safeT(t, 'admin.status_passive', 'Passive')}
                      </span>
                    </td>
                    <td>
                      <div className="adm-action-wrap">
                        <button
                          onClick={() => toggleProduct(item.id)}
                          className={`adm-action-btn ${item.is_active ? 'adm-action-btn--suspend' : 'adm-action-btn--activate'}`}
                        >
                          <i className={`fas ${item.is_active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          {item.is_active ? safeT(t, 'admin.hide', 'Unpublish') : safeT(t, 'admin.show', 'Publish')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
