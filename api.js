/**
 * Nappilos API Integration Layer
 * Connects frontend to NestJS unified backend
 * Products are managed via admin panel (Nappilos-Login)
 */

const NappilosAPI = (() => {
  // Backend API base URL
  const BASE_URL = 'https://api.nappilos.com/api/v1';
  
  // Current platform context (set based on subdomain)
  let PLATFORM = 'main';
  
  // Detect platform from subdomain
  function detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('baby')) PLATFORM = 'baby';
    else if (hostname.includes('kids')) PLATFORM = 'kids';
    else if (hostname.includes('learn')) PLATFORM = 'learn';
    else if (hostname.includes('toys')) PLATFORM = 'toys';
    else if (hostname.includes('books')) PLATFORM = 'nextbooks';
    else PLATFORM = 'main';
    
    console.log('Platform detected:', PLATFORM);
  }

  // Initialize on load
  detectPlatform();

  /* ── Auth ── */
  function getToken() {
    return localStorage.getItem('nappilos_access_token');
  }

  function setToken(token) {
    localStorage.setItem('nappilos_access_token', token);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('nappilos_user'));
    } catch (e) {
      return null;
    }
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
        return { success: true, user: data.data.user };
      }
      return { success: false, message: data.message || 'Login failed' };
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
  
  /**
   * Fetch products for current platform
   * @param {Object} filters - Optional filters
   * @param {number} filters.page - Page number (default: 1)
   * @param {number} filters.limit - Items per page (default: 20)
   * @param {string} filters.search - Search term
   * @param {string} filters.categoryId - Filter by category
   * @param {string} filters.ageGroup - Filter by age group
   * @param {number} filters.minPrice - Minimum price
   * @param {number} filters.maxPrice - Maximum price
   * @param {string} filters.sortBy - Sort field (name, price, createdAt)
   * @param {string} filters.sortOrder - Sort order (asc, desc)
   */
  async function fetchProducts(filters = {}) {
    try {
      const params = new URLSearchParams({
        platforms: PLATFORM,
        isActive: 'true',
        page: filters.page || 1,
        limit: filters.limit || 20,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters.ageGroup ? { ageGroup: filters.ageGroup } : {}),
        ...(filters.minPrice ? { minPrice: filters.minPrice } : {}),
        ...(filters.maxPrice ? { maxPrice: filters.maxPrice } : {}),
        ...(filters.sortBy ? { sortBy: filters.sortBy, sortOrder: filters.sortOrder || 'asc' } : {})
      });
      
      const res = await fetch(`${BASE_URL}/products?${params}`);
      const data = await res.json();
      
      if (data.success) {
        return {
          success: true,
          data: data.data.data,
          total: data.data.total,
          page: data.data.page,
          limit: data.data.limit
        };
      }
      return { success: false, message: data.message };
    } catch (e) {
      console.error('Fetch products error:', e);
      return { success: false, message: 'Failed to fetch products' };
    }
  }

  /**
   * Fetch single product by ID
   */
  async function fetchProduct(id) {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`);
      const data = await res.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (e) {
      console.error('Fetch product error:', e);
      return { success: false, message: 'Failed to fetch product' };
    }
  }

  /**
   * Fetch featured products for current platform
   */
  async function fetchFeaturedProducts() {
    try {
      const params = new URLSearchParams({
        platforms: PLATFORM,
        isActive: 'true',
        isFeatured: 'true',
        limit: 10
      });
      
      const res = await fetch(`${BASE_URL}/products?${params}`);
      const data = await res.json();
      
      if (data.success) {
        return { success: true, data: data.data.data };
      }
      return { success: false, message: data.message };
    } catch (e) {
      console.error('Fetch featured products error:', e);
      return { success: false, message: 'Failed to fetch featured products' };
    }
  }

  /**
   * Fetch bestsellers for current platform
   */
  async function fetchBestsellers() {
    try {
      const params = new URLSearchParams({
        platforms: PLATFORM,
        isActive: 'true',
        isBestseller: 'true',
        limit: 10
      });
      
      const res = await fetch(`${BASE_URL}/products?${params}`);
      const data = await res.json();
      
      if (data.success) {
        return { success: true, data: data.data.data };
      }
      return { success: false, message: data.message };
    } catch (e) {
      console.error('Fetch bestsellers error:', e);
      return { success: false, message: 'Failed to fetch bestsellers' };
    }
  }

  /* ── Categories ── */
  
  async function fetchCategories() {
    try {
      const res = await fetch(`${BASE_URL}/products/categories`);
      const data = await res.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (e) {
      console.error('Fetch categories error:', e);
      return { success: false, message: 'Failed to fetch categories' };
    }
  }

  /* ── Orders ── */
  
  /**
   * Create order from cart
   */
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
      const data = await res.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (e) {
      console.error('Create order error:', e);
      return { success: false, message: 'Failed to create order' };
    }
  }

  /**
   * Get order by ID (requires auth)
   */
  async function fetchOrder(orderId) {
    try {
      const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
        headers: authHeaders()
      });
      const data = await res.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (e) {
      console.error('Fetch order error:', e);
      return { success: false, message: 'Failed to fetch order' };
    }
  }

  /* ── Helper Functions ── */
  
  /**
   * Format price in INR
   */
  function formatPrice(price) {
    return '₹' + Number(price).toLocaleString('en-IN');
  }

  /**
   * Calculate discount percentage
   */
  function getDiscount(product) {
    if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  }

  /**
   * Get stock status
   */
  function getStockStatus(product) {
    if (product.stockQuantity === 0) return { label: 'Out of Stock', class: 'out-of-stock' };
    if (product.stockQuantity <= product.lowStockThreshold) return { label: 'Low Stock', class: 'low-stock' };
    return { label: 'In Stock', class: 'in-stock' };
  }

  /**
   * Get platform name
   */
  function getPlatformName() {
    const names = {
      main: 'Nappilos',
      baby: 'Nappilos Baby',
      kids: 'Nappilos Kids',
      learn: 'Nappilos Learn',
      toys: 'Nappilos Toys',
      nextbooks: 'Nappilos Books'
    };
    return names[PLATFORM] || 'Nappilos';
  }

  /**
   * Get platform age range
   */
  function getPlatformAgeRange() {
    const ranges = {
      main: 'All Ages',
      baby: '0-3 Years',
      kids: '4-12 Years',
      learn: 'Learning',
      toys: 'Toys',
      nextbooks: 'Books'
    };
    return ranges[PLATFORM] || 'All Ages';
  }

  return {
    // Auth
    login,
    logout,
    getToken,
    getUser,
    
    // Products
    fetchProducts,
    fetchProduct,
    fetchFeaturedProducts,
    fetchBestsellers,
    
    // Categories
    fetchCategories,
    
    // Orders
    createOrder,
    fetchOrder,
    
    // Helpers
    formatPrice,
    getDiscount,
    getStockStatus,
    getPlatformName,
    getPlatformAgeRange,
    
    // Constants
    PLATFORM,
    BASE_URL
  };
})();

// Auto-detect platform on load
window.addEventListener('DOMContentLoaded', () => {
  console.log('Nappilos Platform:', NappilosAPI.PLATFORM);
  console.log('Platform Name:', NappilosAPI.getPlatformName());
  console.log('Age Range:', NappilosAPI.getPlatformAgeRange());
});
