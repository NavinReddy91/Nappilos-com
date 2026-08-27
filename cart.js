/**
 * Nappilos Cart System — Shopify-like cart with GST calculation
 * Persists to localStorage, syncs with backend API when available
 */

const NappilosCart = (() => {
  const STORAGE_KEY = 'nappilos_cart';
  const WISHLIST_KEY = 'nappilos_wishlist';
  let cart = [];
  let listeners = [];

  /* ── Init ── */
  function init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) cart = JSON.parse(saved);
    } catch (e) { cart = []; }
    notify();
  }

  /* ── Persistence ── */
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    notify();
  }

  function notify() {
    listeners.forEach(fn => fn(cart));
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  /* ── Cart Operations ── */
  function addItem(productId, variantId, quantity = 1) {
    const product = products[productId];
    if (!product) return;

    const existingIndex = cart.findIndex(
      item => item.productId === productId && item.variantId === variantId
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      const variant = product.variants ? product.variants.find(v => v.id === variantId) : null;
      const unitPrice = product.price + (variant ? variant.priceModifier : 0);

      cart.push({
        cartId: `${productId}_${variantId || 'default'}`,
        productId,
        variantId: variantId || null,
        variantName: variant ? variant.value : null,
        name: product.name,
        sku: product.sku,
        img: product.img,
        price: unitPrice,
        compareAtPrice: product.compareAtPrice,
        gstRate: product.gstRate || 18,
        quantity,
        maxQuantity: product.stockQuantity
      });
    }
    save();
  }

  function removeItem(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    save();
  }

  function updateQuantity(cartId, quantity) {
    const item = cart.find(i => i.cartId === cartId);
    if (!item) return;
    if (quantity <= 0) {
      removeItem(cartId);
      return;
    }
    item.quantity = Math.min(quantity, item.maxQuantity);
    save();
  }

  function clearCart() {
    cart = [];
    save();
  }

  /* ── Calculations ── */
  function getSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  function getCompareAtTotal() {
    return cart.reduce((sum, item) => sum + ((item.compareAtPrice || item.price) * item.quantity), 0);
  }

  function getSavings() {
    return getCompareAtTotal() - getSubtotal();
  }

  function getTaxBreakdown() {
    const breakdown = {};
    cart.forEach(item => {
      const rate = item.gstRate;
      const taxable = item.price * item.quantity;
      const tax = taxable * (rate / 100);
      if (!breakdown[rate]) breakdown[rate] = { taxable: 0, tax: 0 };
      breakdown[rate].taxable += taxable;
      breakdown[rate].tax += tax;
    });
    return breakdown;
  }

  function getTotalGST() {
    const breakdown = getTaxBreakdown();
    return Object.values(breakdown).reduce((sum, b) => sum + b.tax, 0);
  }

  function getShipping() {
    const subtotal = getSubtotal();
    return subtotal >= 999 ? 0 : 69;
  }

  function getTotal() {
    return getSubtotal() + getTotalGST() + getShipping();
  }

  function getItemCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  /* ── Wishlist ── */
  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    } catch (e) { return []; }
  }

  function toggleWishlist(productId) {
    let wishlist = getWishlist();
    const idx = wishlist.indexOf(productId);
    if (idx > -1) wishlist.splice(idx, 1);
    else wishlist.push(productId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    return idx === -1;
  }

  function isInWishlist(productId) {
    return getWishlist().includes(productId);
  }

  /* ── Checkout ── */
  function getCheckoutData() {
    return {
      items: cart.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.price,
        gstRate: item.gstRate
      })),
      subtotal: getSubtotal(),
      taxAmount: getTotalGST(),
      shippingAmount: getShipping(),
      totalAmount: getTotal(),
      savings: getSavings(),
      taxBreakdown: getTaxBreakdown()
    };
  }

  /* ── Public API ── */
  return {
    init,
    onChange,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCart: () => [...cart],
    getSubtotal,
    getCompareAtTotal,
    getSavings,
    getTotalGST,
    getShipping,
    getTotal,
    getItemCount,
    getTaxBreakdown,
    getCheckoutData,
    toggleWishlist,
    isInWishlist,
    getWishlist
  };
})();

/* ── Cart Drawer UI ── */
function renderCartDrawer() {
  const cart = NappilosCart.getCart();
  const count = NappilosCart.getItemCount();
  const subtotal = NappilosCart.getSubtotal();
  const savings = NappilosCart.getSavings();
  const gst = NappilosCart.getTotalGST();
  const shipping = NappilosCart.getShipping();
  const total = NappilosCart.getTotal();

  // Update cart count badge
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });

  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;

  if (cart.length === 0) {
    drawer.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">&#x1F6D2;</div>
        <h3>Your cart is empty</h3>
        <p>Add some adorable items for your little one!</p>
        <button class="btn-continue" onclick="closeCartDrawer()">Continue Shopping</button>
      </div>`;
    return;
  }

  const itemsHtml = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        <img src="${item.img}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        ${item.variantName ? `<span class="cart-item-variant">${item.variantName}</span>` : ''}
        <div class="cart-item-price">
          <span class="price-current">${formatPrice(item.price)}</span>
          ${item.compareAtPrice > item.price ? `<span class="price-mrp">${formatPrice(item.compareAtPrice)}</span>` : ''}
        </div>
        <div class="cart-item-qty">
          <button onclick="NappilosCart.updateQuantity('${item.cartId}', ${item.quantity - 1}); renderCartDrawer()">-</button>
          <span>${item.quantity}</span>
          <button onclick="NappilosCart.updateQuantity('${item.cartId}', ${item.quantity + 1}); renderCartDrawer()">+</button>
          <button class="cart-item-remove" onclick="NappilosCart.removeItem('${item.cartId}'); renderCartDrawer()">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  drawer.innerHTML = `
    <div class="cart-header">
      <h3>Shopping Cart (${count})</h3>
      <button class="cart-close" onclick="closeCartDrawer()">&times;</button>
    </div>
    <div class="cart-items">${itemsHtml}</div>
    <div class="cart-summary">
      ${savings > 0 ? `<div class="cart-savings">You're saving <strong>${formatPrice(savings)}</strong>!</div>` : ''}
      <div class="cart-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
      <div class="cart-row"><span>GST</span><span>${formatPrice(gst)}</span></div>
      <div class="cart-row"><span>Shipping</span><span>${shipping === 0 ? '<span class="free-shipping">FREE</span>' : formatPrice(shipping)}</span></div>
      ${shipping > 0 ? `<div class="cart-shipping-note">Add ${formatPrice(999 - subtotal)} more for free shipping!</div>` : ''}
      <div class="cart-row cart-total"><span>Total</span><span>${formatPrice(total)}</span></div>
      <button class="btn-checkout" onclick="checkout()">Proceed to Checkout</button>
      <button class="btn-continue" onclick="closeCartDrawer()">Continue Shopping</button>
    </div>`;
}

function openCartDrawer() {
  renderCartDrawer();
  document.getElementById('cartOverlay').classList.add('active');
  document.getElementById('cartPanel').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  document.getElementById('cartOverlay').classList.remove('active');
  document.getElementById('cartPanel').classList.remove('active');
  document.body.style.overflow = '';
}

function checkout() {
  const data = NappilosCart.getCheckoutData();
  // In production, this would POST to /api/v1/orders
  // For now, redirect to WhatsApp with order summary
  const items = data.items.map(i =>
    `${i.name}${i.variantName ? ' (' + i.variantName + ')' : ''} x${i.quantity} - ${formatPrice(i.unitPrice * i.quantity)}`
  ).join('%0A');
  const msg = `Hi Nappilos! I'd like to order:%0A${items}%0A%0ASubtotal: ${formatPrice(data.subtotal)}%0AGST: ${formatPrice(data.taxAmount)}%0AShipping: ${formatPrice(data.shippingAmount)}%0ATotal: ${formatPrice(data.totalAmount)}`;
  window.open(`https://wa.me/917382583039?text=${msg}`, '_blank');
}

/* ── Cart CSS (injected) ── */
function injectCartStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .cart-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:999;opacity:0;pointer-events:none;transition:opacity 0.3s}
    .cart-overlay.active{opacity:1;pointer-events:auto}
    .cart-panel{position:fixed;top:0;right:-420px;width:400px;max-width:90vw;height:100vh;background:var(--cream,#fefcfb);z-index:1000;transition:right 0.35s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column;box-shadow:-4px 0 30px rgba(0,0,0,0.15)}
    .cart-panel.active{right:0}
    .cart-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid rgba(107,91,149,0.1)}
    .cart-header h3{font-family:var(--font-heading,'Baloo 2',sans-serif);font-size:1.2rem;color:var(--green-deep,#6b5b95);margin:0}
    .cart-close{background:none;border:none;font-size:1.8rem;cursor:pointer;color:var(--gray,#7a7589);padding:4px 8px;line-height:1}
    .cart-close:hover{color:var(--dark,#2d2a3e)}
    .cart-items{flex:1;overflow-y:auto;padding:16px 24px}
    .cart-item{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid rgba(107,91,149,0.06)}
    .cart-item-img{width:70px;height:70px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#f5f0fa}
    .cart-item-img img{width:100%;height:100%;object-fit:cover}
    .cart-item-details{flex:1;min-width:0}
    .cart-item-details h4{font-family:var(--font-heading,'Baloo 2',sans-serif);font-size:0.9rem;font-weight:700;margin:0 0 2px;color:var(--dark,#2d2a3e)}
    .cart-item-variant{font-size:0.78rem;color:var(--gray,#7a7589);display:block;margin-bottom:4px}
    .cart-item-price{display:flex;align-items:center;gap:8px;margin-bottom:8px}
    .cart-item-price .price-current{font-weight:700;color:var(--green-deep,#6b5b95);font-size:0.95rem}
    .cart-item-price .price-mrp{font-size:0.8rem;color:var(--gray);text-decoration:line-through}
    .cart-item-qty{display:flex;align-items:center;gap:6px}
    .cart-item-qty button{width:28px;height:28px;border-radius:8px;border:1px solid rgba(107,91,149,0.2);background:white;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;color:var(--dark)}
    .cart-item-qty button:hover{background:var(--green-pale,#f5f0fa)}
    .cart-item-qty span{font-weight:700;min-width:24px;text-align:center;font-size:0.9rem}
    .cart-item-remove{background:none!important;border:none!important;color:var(--pink-soft,#ff8fab)!important;font-size:0.78rem!important;width:auto!important;padding:0 4px!important;margin-left:auto}
    .cart-item-remove:hover{color:#e74c3c!important}
    .cart-summary{padding:20px 24px;border-top:2px solid rgba(107,91,149,0.1);background:white}
    .cart-savings{background:linear-gradient(135deg,#e8f5e9,#f1f8e9);padding:8px 14px;border-radius:10px;text-align:center;margin-bottom:14px;font-size:0.85rem;color:#2e7d32}
    .cart-row{display:flex;justify-content:space-between;padding:6px 0;font-size:0.9rem;color:var(--dark)}
    .cart-total{font-weight:800;font-size:1.1rem;border-top:1px solid rgba(107,91,149,0.1);padding-top:12px;margin-top:8px;color:var(--green-deep,#6b5b95)}
    .cart-total span:last-child{font-size:1.2rem}
    .free-shipping{color:#2e7d32;font-weight:700}
    .cart-shipping-note{font-size:0.78rem;color:var(--orange-soft,#ff9a76);text-align:center;padding:6px 0}
    .btn-checkout{width:100%;padding:14px;border:none;border-radius:16px;background:linear-gradient(135deg,var(--green-deep,#6b5b95),#8b7ab5);color:white;font-family:var(--font-heading,'Baloo 2',sans-serif);font-size:1rem;font-weight:700;cursor:pointer;margin-top:14px;transition:transform 0.2s,box-shadow 0.2s}
    .btn-checkout:hover{transform:translateY(-1px);box-shadow:0 4px 15px rgba(107,91,149,0.3)}
    .btn-continue{width:100%;padding:12px;border:2px solid rgba(107,91,149,0.2);border-radius:16px;background:transparent;color:var(--green-deep,#6b5b95);font-family:var(--font-heading,'Baloo 2',sans-serif);font-size:0.9rem;font-weight:700;cursor:pointer;margin-top:8px;transition:all 0.2s}
    .btn-continue:hover{background:var(--green-pale,#f5f0fa)}
    .cart-empty{text-align:center;padding:60px 24px}
    .cart-empty-icon{font-size:3rem;margin-bottom:16px}
    .cart-empty h3{font-family:var(--font-display,'Fredoka',sans-serif);color:var(--green-deep);margin-bottom:8px}
    .cart-empty p{color:var(--gray);font-size:0.9rem;margin-bottom:24px}

    /* Cart badge in nav */
    .cart-icon-wrap{position:relative;cursor:pointer;display:flex;align-items:center;gap:4px;padding:8px 14px;border-radius:12px;background:var(--green-pale,#f5f0fa);transition:all 0.2s;border:none;font-family:var(--font-heading,'Baloo 2',sans-serif);font-weight:700;font-size:0.85rem;color:var(--green-deep,#6b5b95)}
    .cart-icon-wrap:hover{background:var(--green-light,#c8b8d9);color:white}
    .cart-count{background:var(--pink-soft,#ff8fab);color:white;font-size:0.7rem;font-weight:800;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;position:absolute;top:-4px;right:-4px}
  `;
  document.head.appendChild(style);
}

/* ── Cart HTML (injected into page) ── */
function injectCartHTML() {
  const html = `
    <div id="cartOverlay" class="cart-overlay" onclick="closeCartDrawer()"></div>
    <div id="cartPanel" class="cart-panel">
      <div id="cartDrawer"></div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

/* ── Auto-init ── */
document.addEventListener('DOMContentLoaded', () => {
  injectCartStyles();
  injectCartHTML();
  NappilosCart.init();
  NappilosCart.onChange(() => renderCartDrawer());
  renderCartDrawer();
});
