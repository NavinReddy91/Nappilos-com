/**
 * Nappilos API Integration Layer
 * Connects frontend to NestJS backend at api.nappilos.com
 * Falls back to local products.js when API is unavailable
 */

const NappilosAPI = (() => {
  const BASE_URL = 'https://api.nappilos.com/api/v1';
  const PLATFORM = 'main'; // current platform context
  let useLocal = true; // default to local data, switch to API when backend is live

  /* ── Auth ── */
  function getToken() {
    return localStorage.getItem('nappilos_access_token');
  }

  function setToken(token) {
    localStorage.setItem('nappilos_access_token', token);
  }

  async function login(email, password) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.data.accessToken);
        localStorage.setItem('nappilos_user', JSON.stringify(data.data.user));
      }
      return data;
    } catch (e) {
      return { success: false, message: 'Network error' };
    }
  }

  async function logout() {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: authHeaders()
      });
    } catch (e) {}
    localStorage.removeItem('nappilos_access_token');
    localStorage.removeItem('nappilos_user');
  }

  function authHeaders() {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /* ── Products ── */
  async function fetchProducts(filters = {}) {
    if (useLocal) {
      return { success: true, data: { data: getAllProducts(), total: Object.keys(products).length } };
    }
    try {
      const params = new URLSearchParams({
        platforms: PLATFORM,
        isActive: 'true',
        page: filters.page || 1,
        limit: filters.limit || 20,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters.minPrice ? { minPrice: filters.minPrice } : {}),
        ...(filters.maxPrice ? { maxPrice: filters.maxPrice } : {}),
        ...(filters.sortBy ? { sortBy: filters.sortBy, sortOrder: filters.sortOrder || 'asc' } : {})
      });
      const res = await fetch(`${BASE_URL}/products?${params}`);
      return await res.json();
    } catch (e) {
      return { success: true, data: { data: getAllProducts(), total: Object.keys(products).length } };
    }
  }

  async function fetchProduct(id) {
    if (useLocal) {
      const p = getProduct(id);
      return p ? { success: true, data: p } : { success: false, message: 'Not found' };
    }
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`);
      return await res.json();
    } catch (e) {
      const p = getProduct(id);
      return p ? { success: true, data: p } : { success: false, message: 'Not found' };
    }
  }

  async function fetchProductsByPlatform(platform) {
    if (useLocal) {
      const filtered = getAllProducts().filter(p => p.platform && p.platform.includes(platform) && p.isActive);
      return { success: true, data: filtered };
    }
    try {
      const res = await fetch(`${BASE_URL}/products/platform/${platform}`);
      return await res.json();
    } catch (e) {
      return { success: true, data: getAllProducts() };
    }
  }

  /* ── Orders ── */
  async function createOrder(orderData) {
    try {
      const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          ...orderData,
          platform: PLATFORM
        })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: 'Order failed. Please contact us on WhatsApp.' };
    }
  }

  /* ── Mode Toggle ── */
  function setMode(mode) {
    useLocal = mode === 'local';
  }

  function setPlatform(platform) {
    // PLATFORM = platform; // would need to be let
  }

  return {
    login,
    logout,
    fetchProducts,
    fetchProduct,
    fetchProductsByPlatform,
    createOrder,
    setMode,
    setPlatform,
    getToken,
    BASE_URL
  };
})();
