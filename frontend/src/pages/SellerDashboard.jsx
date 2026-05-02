import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { AuthContext } from '../context/auth-context';
import useTimedToast from '../hooks/useTimedToast';
import { formatPrice } from '../utils/formatters';
import { formatUrl, fallbackImage, isValidImage } from '../utils/imageUtils';
import { getPrimaryLanguage } from '../utils/i18nUtils';
import { reportClientError } from '../utils/logger';
import { translateName } from '../utils/translators';
import './SellerDashboard.css';

const TAB_ADD = 'add';
const TAB_LIST = 'list';
const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category_id: '',
  color_id: '',
  brand: '',
  image_url: '',
  season_group: '',
  style_tag: '',
};

const stripHtml = (value = '') => value.replace(/<[^>]+>/g, '');

const fetchProductOptions = async () => {
  const { data } = await api.get('/products/options');
  return data;
};

const fetchSellerCatalog = async (sellerId) => {
  const { data } = await api.get(`/products?seller_id=${sellerId}`);
  return data;
};

const buildEditForm = (product) => ({
  name: product.name,
  description: product.description || '',
  price: product.price,
  category_id: product.category_id || '',
  color_id: product.color_id || '',
  brand: product.brand || '',
  image_url: product.image_url || '',
  season_group: product.season_group || '',
  style_tag: product.style_tag || '',
});

export default function SellerDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  const { toast, showToast } = useTimedToast();
  const lang = getPrimaryLanguage(i18n);

  const [activeTab, setActiveTab] = useState(TAB_ADD);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [styleTags, setStyleTags] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [addErr, setAddErr] = useState('');
  const [adding, setAdding] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editMsg, setEditMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
      try {
        const data = await fetchProductOptions();
        if (cancelled) return;

        setCategories(data.categories || []);
        setColors(data.colors || []);
        setSeasons(data.seasons || []);
        setStyleTags(data.styleTags || []);
      } catch (error) {
        reportClientError('Urun secenekleri yuklenemedi:', error);
      }
    };

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== TAB_LIST || !user?.id) return undefined;

    let cancelled = false;

    const loadProducts = async () => {
      setLoadingProducts(true);

      try {
        const data = await fetchSellerCatalog(user.id);
        if (!cancelled) {
          setProducts(data);
        }
      } catch (error) {
        reportClientError('Satici urunleri yuklenemedi:', error);
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [activeTab, user?.id]);

  const loadSellerProducts = async () => {
    if (!user?.id) return;

    setLoadingProducts(true);

    try {
      const data = await fetchSellerCatalog(user.id);
      setProducts(data);
    } catch (error) {
      reportClientError('Satici katalog yenilenemedi:', error);
      showToast(t('seller_dashboard.error_generic'), 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  const setField = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  const updateEditField = (key, value) => setEditForm(previous => ({ ...previous, [key]: value }));
  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setAddErr('');
  };

  const closeEditModal = () => {
    setEditProduct(null);
    setEditForm({});
    setEditMsg('');
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    setAdding(true);
    setAddErr('');

    if (!isValidImage(form.image_url)) {
      setAdding(false);
      setAddErr(t('seller.messages.invalidImageUrl', 'Geçerli bir görsel URL veya dosya adı giriniz.'));
      return;
    }

    try {
      await api.post('/products', { ...form, price: form.price });
      showToast(t('seller.messages.productAdded', 'Ürün başarıyla eklendi.'));
      resetForm();
    } catch (error) {
      setAddErr(error.response?.data?.message || t('seller_dashboard.error_generic'));
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setEditForm(buildEditForm(product));
    setEditMsg('');
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setEditMsg('');

    if (editForm.image_url && !isValidImage(editForm.image_url)) {
      setSaving(false);
      setEditMsg(t('seller.messages.invalidImageUrl', 'Geçerli bir görsel URL veya dosya adı giriniz.'));
      return;
    }

    try {
      await api.put(`/products/${editProduct.id}`, editForm);
      const successMessage = t('seller_dashboard.update_success');
      setEditMsg(successMessage);
      showToast(successMessage);
      await loadSellerProducts();
      setTimeout(closeEditModal, 1200);
    } catch (error) {
      setEditMsg(error.response?.data?.message || t('seller_dashboard.error_generic'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);

    try {
      await api.delete(`/products/${id}`);
      setProducts(previous => previous.filter(item => item.id !== id));
      setConfirmDelete(null);
      showToast(t('seller_dashboard.delete_success', 'Ürün silindi.'));
    } catch (error) {
      reportClientError('Urun silinemedi:', error);
      showToast(error.response?.data?.message || t('seller_dashboard.error_generic'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const statCards = [
    { icon: 'fa-box', label: t('seller_dashboard.total_products'), value: products.length, accent: 'var(--color-primary)' },
    { icon: 'fa-tag', label: t('seller_dashboard.stat_categories'), value: [...new Set(products.map(item => item.category_name).filter(Boolean))].length, accent: 'var(--color-success)' },
    { icon: 'fa-palette', label: t('seller_dashboard.stat_colors'), value: [...new Set(products.map(item => item.color_name).filter(Boolean))].length, accent: 'var(--color-info)' },
  ];

  const isEditSuccess = editMsg === t('seller_dashboard.update_success');
  const previewImageUrl = form.image_url && isValidImage(form.image_url) ? formatUrl(form.image_url) : null;
  const welcomeText = stripHtml(t('seller_dashboard.welcome', { username: user?.username || '' })).replace('{{username}}', user?.username || '');

  return (
    <div className="sd-page">
      {toast && (
        <div
          className={`adm-toast adm-toast--${toast.type}`}
          style={{
            position: 'fixed',
            top: '80px',
            right: '50%',
            transform: 'translateX(50%)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            padding: '16px 24px',
            borderRadius: '12px',
            background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
            color: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
            border: toast.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            fontWeight: 600,
            fontSize: '1rem',
            animation: 'fadeInDown 0.3s ease-out forwards',
          }}
        >
          <i className={`fas ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-check-circle'} fa-lg`}></i>
          {toast.msg}
        </div>
      )}

      <div className="sd-hero">
        <div className="sd-hero-left">
          <span className="sd-hero-eyebrow">
            <i className="fas fa-store"></i>
            {t('seller_dashboard.eyebrow')}
          </span>
          <h1 className="sd-hero-title">{t('seller_dashboard.title')}</h1>
          <p className="sd-hero-sub">{welcomeText}</p>
        </div>
        <div className="sd-hero-badge">
          <i className="fas fa-shield-check"></i>
          {t('seller_dashboard.verified_seller')}
        </div>
      </div>

      <div className="sd-stats">
        {statCards.map(card => (
          <div key={card.label} className="sd-stat-card">
            <div className="sd-stat-icon" style={{ background: `${card.accent}18`, color: card.accent }}>
              <i className={`fas ${card.icon}`}></i>
            </div>
            <div className="sd-stat-body">
              <div className="sd-stat-value">{card.value}</div>
              <div className="sd-stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sd-tabs">
        <button
          onClick={() => setActiveTab(TAB_ADD)}
          className={`sd-tab${activeTab === TAB_ADD ? ' sd-tab--active' : ''}`}
        >
          <i className="fas fa-plus"></i>
          {t('seller_dashboard.tab_add')}
        </button>
        <button
          onClick={() => setActiveTab(TAB_LIST)}
          className={`sd-tab${activeTab === TAB_LIST ? ' sd-tab--active' : ''}`}
        >
          <i className="fas fa-list"></i>
          {t('seller_dashboard.tab_list')}
        </button>
      </div>

      {activeTab === TAB_ADD && (
        <div className="sd-form-card">
          <div className="sd-form-header">
            <div className="sd-form-header-icon">
              <i className="fas fa-plus-circle"></i>
            </div>
            <div>
              <h2 className="sd-form-title">{t('seller_dashboard.add_title')}</h2>
              <p className="sd-form-subtitle">{t('seller_dashboard.add_subtitle')}</p>
            </div>
          </div>

          {addErr && (
            <div className="sd-msg sd-msg--error" style={{ marginBottom: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '12px', color: 'var(--color-danger)', fontSize: '0.9rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <i className="fas fa-exclamation-circle"></i> {addErr}
            </div>
          )}

          <form onSubmit={handleAdd} className="sd-form">
            <div className="sd-form-group-label">
              <i className="fas fa-info-circle"></i>
              {t('seller_dashboard.group_basic')}
            </div>
            <div className="sd-form-grid">
              <div className="sd-field">
                <label className="sd-label">
                  {t('seller_dashboard.form_name_label')}
                  <span className="sd-required">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={event => setField('name', event.target.value)}
                  className="sd-input"
                  placeholder={t('seller_dashboard.form_name_ph')}
                />
              </div>
              <div className="sd-field">
                <label className="sd-label">
                  {t('seller_dashboard.form_price_label')}
                  <span className="sd-required">*</span>
                </label>
                <div className="sd-input-wrap">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.price}
                    onChange={event => setField('price', event.target.value)}
                    className="sd-input sd-input--price"
                    placeholder="0.00"
                  />
                  <span className="sd-input-suffix">₺</span>
                </div>
              </div>
            </div>

            <div className="sd-form-group-label">
              <i className="fas fa-tags"></i>
              {t('seller_dashboard.group_class')}
            </div>
            <div className="sd-form-grid sd-form-grid--4">
              <div className="sd-field">
                <label className="sd-label">
                  {t('seller_dashboard.form_cat_label')}
                  <span className="sd-required">*</span>
                </label>
                <select required value={form.category_id} onChange={event => setField('category_id', event.target.value)} className="sd-input sd-select">
                  <option value="">{t('seller_dashboard.select_placeholder')}</option>
                  {categories.map(item => (
                    <option key={item.id} value={item.id}>{t(`categories.${item.name}`, item.name)}</option>
                  ))}
                </select>
              </div>
              <div className="sd-field">
                <label className="sd-label">
                  {t('seller_dashboard.form_color_label')}
                  <span className="sd-required">*</span>
                </label>
                <select required value={form.color_id} onChange={event => setField('color_id', event.target.value)} className="sd-input sd-select">
                  <option value="">{t('seller_dashboard.select_placeholder')}</option>
                  {colors.map(item => (
                    <option key={item.id} value={item.id}>{t(`colors.${item.name}`, item.name)}</option>
                  ))}
                </select>
              </div>
              <div className="sd-field">
                <label className="sd-label">
                  {t('seller_dashboard.form_season_label')}
                  <span className="sd-required">*</span>
                </label>
                <select required value={form.season_group} onChange={event => setField('season_group', event.target.value)} className="sd-input sd-select">
                  <option value="">{t('seller_dashboard.select_placeholder')}</option>
                  {seasons.map(item => (
                    <option key={item.id} value={item.id}>{t(`seasons.${item.id}`, item.name)}</option>
                  ))}
                </select>
              </div>
              <div className="sd-field">
                <label className="sd-label">
                  {t('seller_dashboard.form_style_label')}
                  <span className="sd-required">*</span>
                </label>
                <select required value={form.style_tag} onChange={event => setField('style_tag', event.target.value)} className="sd-input sd-select">
                  <option value="">{t('seller_dashboard.select_placeholder')}</option>
                  {styleTags.map(item => (
                    <option key={item} value={item}>{t(`styles.${item}`, item)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sd-form-group-label">
              <i className="fas fa-image"></i>
              {t('seller_dashboard.group_visual')}
            </div>
            <div className="sd-form-grid">
              <div className="sd-field">
                <label className="sd-label">
                  {t('seller_dashboard.form_brand_label')}
                  <span className="sd-required">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.brand}
                  onChange={event => setField('brand', event.target.value)}
                  className="sd-input"
                  placeholder={t('seller_dashboard.form_brand_ph')}
                />
              </div>
              <div className="sd-field">
                <label className="sd-label">
                  {t('seller_dashboard.form_img_label')}
                  <span className="sd-required">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.image_url}
                  onChange={event => setField('image_url', event.target.value)}
                  className="sd-input"
                  placeholder="https://..."
                />
              </div>
            </div>

            {previewImageUrl && (
              <div className="sd-img-preview" style={{ marginTop: '14px', borderRadius: '12px', overflow: 'hidden', width: 'fit-content', border: '1px solid var(--color-border)' }}>
                <img
                  src={previewImageUrl}
                  alt={t('seller_dashboard.preview')}
                  style={{ display: 'block', maxWidth: '120px', maxHeight: '120px', objectFit: 'cover' }}
                  onError={event => {
                    event.target.onerror = null;
                    event.target.src = fallbackImage;
                  }}
                />
              </div>
            )}

            <div className="sd-form-group-label">
              <i className="fas fa-align-left"></i>
              {t('seller_dashboard.group_desc')}
            </div>
            <div className="sd-field sd-field--full">
              <label className="sd-label">
                {t('seller_dashboard.form_desc_label')}
                <span className="sd-optional">{t('common.optional')}</span>
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={event => setField('description', event.target.value)}
                className="sd-input sd-textarea"
                placeholder={t('seller_dashboard.form_desc_ph')}
              />
            </div>

            <div className="sd-form-actions">
              <button type="button" className="sd-btn sd-btn--secondary" onClick={resetForm}>
                <i className="fas fa-rotate-left"></i>
                {t('seller_dashboard.btn_clear')}
              </button>
              <button type="submit" className="sd-btn sd-btn--primary" disabled={adding}>
                {adding
                  ? <><i className="fas fa-spinner fa-spin"></i> {t('seller_dashboard.adding')}</>
                  : <><i className="fas fa-plus"></i> {t('seller_dashboard.btn_add')}</>
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === TAB_LIST && (
        <div className="sd-catalog">
          <div className="sd-catalog-header">
            <h2 className="sd-catalog-title">
              <i className="fas fa-layer-group" style={{ color: 'var(--color-primary)', fontSize: '1rem' }}></i>
              {t('seller_dashboard.my_catalog')}
              <span className="sd-catalog-count">{t('seller_dashboard.product_count', { count: products.length })}</span>
            </h2>
            <button className="sd-btn sd-btn--secondary sd-btn--sm" onClick={loadSellerProducts}>
              <i className="fas fa-rotate-right"></i>
              {t('seller_dashboard.refresh')}
            </button>
          </div>

          {loadingProducts ? (
            <div className="sd-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <span>{t('common.loading')}</span>
            </div>
          ) : products.length === 0 ? (
            <div className="sd-empty">
              <div className="sd-empty-icon">
                <i className="fas fa-box-open"></i>
              </div>
              <h3 className="sd-empty-title">{t('seller_dashboard.empty_title')}</h3>
              <p className="sd-empty-desc">{t('seller_dashboard.empty_desc')}</p>
              <button onClick={() => setActiveTab(TAB_ADD)} className="sd-btn sd-btn--primary">
                <i className="fas fa-plus"></i>
                {t('seller_dashboard.tab_add')}
              </button>
            </div>
          ) : (
            <div className="sd-table-wrap">
              <table className="sd-table">
                <thead>
                  <tr>
                    <th style={{ width: 64 }}>{t('seller_dashboard.col_img')}</th>
                    <th>{t('seller_dashboard.col_product')}</th>
                    <th>{t('seller_dashboard.col_cat')}</th>
                    <th>{t('seller_dashboard.col_price')}</th>
                    <th className="sd-th-right">{t('seller_dashboard.col_action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="sd-tr">
                      <td>
                        <div className="sd-product-thumb" style={{ width: '48px', height: '64px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {product.image_url ? (
                            <img
                              src={formatUrl(product.image_url)}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={event => {
                                event.target.onerror = null;
                                event.target.src = fallbackImage;
                              }}
                            />
                          ) : (
                            <i className="fas fa-image" style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}></i>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="sd-product-name">{translateName(product.name, lang)}</div>
                        <div className="sd-product-brand">{product.brand || '—'}</div>
                      </td>
                      <td>
                        <div className="sd-badge-group">
                          {product.category_name && <span className="sd-badge sd-badge--cat">{t(`categories.${product.category_name}`, product.category_name)}</span>}
                          {product.color_name && <span className="sd-badge sd-badge--color">{t(`colors.${product.color_name}`, product.color_name)}</span>}
                          {product.season_group && <span className="sd-badge sd-badge--season">{t(`seasons.${product.season_group}`, product.season_group)}</span>}
                          {product.style_tag && <span className="sd-badge sd-badge--style">{t(`styles.${product.style_tag}`, product.style_tag)}</span>}
                        </div>
                      </td>
                      <td className="sd-price">{formatPrice(product.price)}</td>
                      <td>
                        <div className="sd-actions">
                          <button onClick={() => openEdit(product)} className="sd-action-btn sd-action-btn--edit" title={t('seller_dashboard.btn_edit')}>
                            <i className="fas fa-pen"></i>
                          </button>
                          <button onClick={() => setConfirmDelete(product.id)} className="sd-action-btn sd-action-btn--delete" title={t('seller_dashboard.btn_delete_product')}>
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {editProduct && (
        <div className="sd-modal-overlay" onClick={closeEditModal}>
          <div className="sd-modal sd-modal--lg" onClick={event => event.stopPropagation()}>
            <div className="sd-modal-header">
              <h3 className="sd-modal-title">
                <i className="fas fa-pen"></i>
                {t('seller_dashboard.edit_title')}
              </h3>
              <button onClick={closeEditModal} className="sd-modal-close" aria-label={t('common.cancel')}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {editMsg && (
              <div className={`sd-msg ${isEditSuccess ? 'sd-msg--success' : 'sd-msg--error'}`}>
                <i className={`fas ${isEditSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                {editMsg}
              </div>
            )}

            <form onSubmit={handleEdit} className="sd-form">
              <div className="sd-form-grid">
                <div className="sd-field">
                  <label className="sd-label">{t('seller_dashboard.form_name_label')} <span className="sd-required">*</span></label>
                  <input type="text" required value={editForm.name || ''} onChange={event => updateEditField('name', event.target.value)} className="sd-input" />
                </div>
                <div className="sd-field">
                  <label className="sd-label">{t('seller_dashboard.form_price_label')} <span className="sd-required">*</span></label>
                  <div className="sd-input-wrap">
                    <input type="number" step="0.01" required value={editForm.price || ''} onChange={event => updateEditField('price', event.target.value)} className="sd-input sd-input--price" />
                    <span className="sd-input-suffix">₺</span>
                  </div>
                </div>
                <div className="sd-field">
                  <label className="sd-label">{t('seller_dashboard.form_cat_label')}</label>
                  <select value={editForm.category_id || ''} onChange={event => updateEditField('category_id', event.target.value)} className="sd-input sd-select">
                    <option value="">{t('seller_dashboard.select_placeholder')}</option>
                    {categories.map(item => <option key={item.id} value={item.id}>{t(`categories.${item.name}`, item.name)}</option>)}
                  </select>
                </div>
                <div className="sd-field">
                  <label className="sd-label">{t('seller_dashboard.form_color_label')}</label>
                  <select value={editForm.color_id || ''} onChange={event => updateEditField('color_id', event.target.value)} className="sd-input sd-select">
                    <option value="">{t('seller_dashboard.select_placeholder')}</option>
                    {colors.map(item => <option key={item.id} value={item.id}>{t(`colors.${item.name}`, item.name)}</option>)}
                  </select>
                </div>
                <div className="sd-field">
                  <label className="sd-label">{t('seller_dashboard.form_season_label')}</label>
                  <select value={editForm.season_group || ''} onChange={event => updateEditField('season_group', event.target.value)} className="sd-input sd-select">
                    <option value="">{t('seller_dashboard.select_placeholder')}</option>
                    {seasons.map(item => <option key={item.id} value={item.id}>{t(`seasons.${item.id}`, item.name)}</option>)}
                  </select>
                </div>
                <div className="sd-field">
                  <label className="sd-label">{t('seller_dashboard.form_style_label')}</label>
                  <select value={editForm.style_tag || ''} onChange={event => updateEditField('style_tag', event.target.value)} className="sd-input sd-select">
                    <option value="">{t('seller_dashboard.select_placeholder')}</option>
                    {styleTags.map(item => <option key={item} value={item}>{t(`styles.${item}`, item)}</option>)}
                  </select>
                </div>
                <div className="sd-field sd-field--full">
                  <label className="sd-label">{t('seller_dashboard.form_img_label')}</label>
                  <input type="text" value={editForm.image_url || ''} onChange={event => updateEditField('image_url', event.target.value)} className="sd-input" />
                </div>
                <div className="sd-field sd-field--full">
                  <label className="sd-label">{t('seller_dashboard.form_desc_label')}</label>
                  <textarea rows={3} value={editForm.description || ''} onChange={event => updateEditField('description', event.target.value)} className="sd-input sd-textarea" />
                </div>
              </div>
              <div className="sd-form-actions">
                <button type="button" onClick={closeEditModal} className="sd-btn sd-btn--secondary">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="sd-btn sd-btn--primary" disabled={saving}>
                  {saving
                    ? <><i className="fas fa-spinner fa-spin"></i> {t('seller_dashboard.saving')}</>
                    : <><i className="fas fa-floppy-disk"></i> {t('seller_dashboard.btn_save')}</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="sd-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="sd-modal sd-modal--sm" onClick={event => event.stopPropagation()}>
            <div className="sd-modal-icon sd-modal-icon--danger">
              <i className="fas fa-trash-alt"></i>
            </div>
            <h3 className="sd-modal-title sd-modal-title--center">{t('seller_dashboard.delete_title')}</h3>
            <p className="sd-modal-desc">{t('seller_dashboard.delete_desc')}</p>
            <div className="sd-form-actions sd-form-actions--center">
              <button onClick={() => setConfirmDelete(null)} className="sd-btn sd-btn--secondary">
                {t('common.cancel')}
              </button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={deleting} className="sd-btn sd-btn--danger">
                {deleting
                  ? <><i className="fas fa-spinner fa-spin"></i> {t('seller_dashboard.deleting')}</>
                  : <><i className="fas fa-trash"></i> {t('seller_dashboard.btn_confirm_delete')}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
