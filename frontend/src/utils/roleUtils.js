const DEFAULT_ROUTE_BY_ROLE = {
  Admin: '/admin',
  Seller: '/seller',
  Customer: '/',
};

export const getDefaultRouteForRole = (role) => DEFAULT_ROUTE_BY_ROLE[role] || '/';

export const canAccessRoute = (user, allowedRoles) => {
  if (!user) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(user.role);
};

export const getNavigationLinks = (t, role) => {
  const shopperLinks = [
    { path: '/', label: t('navbar.discover') },
    { path: '/ai-stylist', label: t('navbar.ai_stylist') },
    { path: '/outfit-builder', label: t('navbar.outfit_builder') },
    { path: '/saved-outfits', label: t('navbar.my_styles') },
  ];

  if (role === 'Admin') {
    return [{ path: '/admin', label: t('navbar.admin_dashboard') }];
  }

  if (role === 'Seller') {
    return [{ path: '/seller', label: t('navbar.seller_dashboard') }];
  }

  return shopperLinks;
};
