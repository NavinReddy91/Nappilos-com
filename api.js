/**
 * Nappilos API Integration Layer
 * Connects storefront to unified backend API
 * Single storefront approach - all products in one place
 */

const NappilosAPI = (() => {
  // Backend API base URL
  const BASE_URL = 'https://api.nappilos.com/api/v1';
  
  // Single storefront - no platform detection needed
  const PLATFORM = 'main';

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
   * Fetch all active products
   * @param {Object} filters - Optional filters
   */
  async function fetchProducts(filters = {}) {
    try {
      const params = new URLSearchParams({
        isActive: 'true',
        page: filters.page || 1,
        limit: filters.limit || 20,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters.ageGroup ? { ageGroup: filters.ageGroup } : {}),
        ...(filters.minPrice ? { minPrice: filters.minPrice } : {}),
        ...(filters.maxPrice ? { maxPrice: filters.maxPrice } : {}),
        ...(filters.sortBy ? { sortBy: filters.sortBy, sortOrder: filters.sortOrder || 'asc' } : {}),
        ...(filters.tag ? { tag: filters.tag } : {})
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
   * Fetch single product by ID or slug
   */
  async function fetchProduct(idOrSlug) {
    try {
      const res = await fetch(`${BASE_URL}/products/${idOrSlug}`);
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
   * Fetch featured products
   */
  async function fetchFeaturedProducts() {
    try {
      const params = new URLSearchParams({
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
   * Fetch bestsellers
   */
  async function fetchBestsellers() {
    try {
      const params = new URLSearchParams({
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

  /**
   * Fetch products by category
   */
  async function fetchProductsByCategory(categoryId) {
    try {
      const params = new URLSearchParams({
        isActive: 'true',
        categoryId: categoryId,
        limit: 50
      });
      
      const res = await fetch(`${BASE_URL}/products?${params}`);
      const data = await res.json();
      
      if (data.success) {
        return { success: true, data: data.data.data };
      }
      return { success: false, message: data.message };
    } catch (e) {
      console.error('Fetch products by category error:', e);
      return { success: false, message: 'Failed to fetch products' };
    }
  }

  /**
   * Fetch products by age group
   */
  async function fetchProductsByAge(ageGroup) {
    try {
      const params = new URLSearchParams({
        isActive: 'true',
        ageGroup: ageGroup,
        limit: 50
      });
      
      const res = await fetch(`${BASE_URL}/products?${params}`);
      const data = await res.json();
      
      if (data.success) {
        return { success: true, data: data.data.data };
      }
      return { success: false, message: data.message };
    } catch (e) {
      console.error('Fetch products by age error:', e);
      return { success: false, message: 'Failed to fetch products' };
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
  
  function formatPrice(price) {
    return '₹' + Number(price).toLocaleString('en-IN');
  }

  function getDiscount(product) {
    if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  }

  function getStockStatus(product) {
    if (product.stockQuantity === 0) return { label: 'Out of Stock', class: 'out-of-stock' };
    if (product.stockQuantity <= product.lowStockThreshold) return { label: 'Low Stock', class: 'low-stock' };
    return { label: 'In Stock', class: 'in-stock' };
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
    fetchProductsByCategory,
    fetchProductsByAge,
    
    // Categories
    fetchCategories,
    
    // Orders
    createOrder,
    fetchOrder,
    
    // Helpers
    formatPrice,
    getDiscount,
    getStockStatus,
    
    // Constants
    PLATFORM,
    BASE_URL
  };
})();

console.log('Nappilos API initialized - Single Storefront Mode');
