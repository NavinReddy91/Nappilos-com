# Nappilos Shopify-Style Template - Complete Admin Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [File Structure](#file-structure)
3. [Product Management](#product-management)
4. [Cart System](#cart-system)
5. [Backend Integration](#backend-integration)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## System Overview

Your Nappilos.com site is now a full e-commerce template with:

- **21 Products** with complete Shopify-like data (prices, stock, variants, GST)
- **Shopping Cart** with real-time updates and GST calculation
- **Product Pages** with variant selection, stock status, and add-to-cart
- **Backend Integration** ready to connect to your NestJS API
- **WhatsApp Checkout** for order placement

### How It Works

```
┌─────────────────┐
│   products.js   │ ← Your product data (prices, stock, variants)
└────────┬────────┘
         │
         ├──────────────┐
         │              │
    ┌────▼────┐    ┌────▼────┐
    │index.html│    │p1.html  │ ← Product pages
    │(homepage)│    │p2.html  │
    └────┬────┘    └────┬────┘
         │              │
         └──────┬───────┘
                │
           ┌────▼────┐
           │ cart.js │ ← Shopping cart logic
           └────┬────┘
                │
           ┌────▼────┐
           │ api.js  │ ← Backend connection (optional)
           └─────────┘
```

---

## File Structure

```
nappilos-com/
│
├── index.html              ← Homepage with product grid
├── product.html            ← Product page template
├── p1.html to p21.html     ← Individual product pages (copies of product.html)
│
├── products.js             ← ALL PRODUCT DATA (edit this!)
├── cart.js                 ← Shopping cart system
├── api.js                  ← Backend API integration
│
├── images/                 ← Product images
│   ├── logo.jpeg
│   ├── muslin-swaddle.png
│   ├── knotted-jabla.png
│   └── ... (21 product images)
│
└── other pages
    ├── about.html
    ├── faq.html
    ├── privacy-policy.html
    └── ...
```

---

## Product Management

### Understanding the Product Schema

Every product in `products.js` has these fields:

```javascript
p1: {
  // BASIC INFO
  name: "Baby Muslin Swaddle",           // Product name
  slug: "baby-muslin-swaddle",           // URL-friendly name
  sku: "NPL-SWD-001",                    // Stock Keeping Unit (unique ID)
  
  // IMAGES
  img: "images/muslin-swaddle.png",      // Main product image
  images: ["images/muslin-swaddle.png"], // All images (for gallery)
  
  // DESCRIPTION
  tagline: "Comfort in every hug",       // Short tagline
  desc: "Wrap your little one...",       // Full description
  
  // CATEGORIZATION
  category: "Swaddles & Wraps",          // Product category
  categoryId: "cat-swaddles",            // Category ID for filtering
  age: "0-12 months",                    // Age range
  ageGroups: ["0-3", "3-12"],            // Age group codes
  
  // PRODUCT DETAILS
  material: "100% Cotton Muslin",        // Material
  color: "White with blue clouds...",    // Color/print description
  brand: "Nappilos",                     // Brand name
  weight: "180g",                        // Weight
  dimensions: "76 x 76 cm",              // Dimensions
  
  // PRICING
  price: 599,                            // Selling price (₹)
  compareAtPrice: 899,                   // MRP/original price (₹)
  costPrice: 220,                        // Your cost (₹) - not shown to customers
  
  // INVENTORY
  stockQuantity: 45,                     // Current stock
  lowStockThreshold: 10,                 // Alert when stock <= this
  
  // TAX & COMPLIANCE
  hsnCode: "6111",                       // GST HSN code
  gstRate: 12,                           // GST percentage (5, 12, 18, 28)
  
  // PLATFORMS
  platform: ["main", "baby"],            // Which sites show this product
  
  // TAGS
  tags: ["organic", "muslin", "newborn"], // Search/filter tags
  
  // FLAGS
  isFeatured: true,                      // Show "NEW" badge
  isBestseller: true,                    // Show "BESTSELLER" badge
  isActive: true,                        // false = hide from site
  
  // VARIANTS (sizes, packs, etc.)
  variants: [
    { id: "p1-s1", name: "Size", value: "60 x 60 cm", priceModifier: 0 },
    { id: "p1-s2", name: "Size", value: "76 x 76 cm", priceModifier: 100 },
    { id: "p1-s3", name: "Size", value: "90 x 90 cm", priceModifier: 200 }
  ],
  
  // FEATURES
  features: [
    "100% pure muslin cotton — ultra-soft",
    "Eco-friendly & sustainable material",
    "Safe & chemical-free"
  ]
}
```

### How to Add a New Product

**Step 1:** Add product data to `products.js`

```javascript
// Find the last product (p21) and add after it:
p22: {
  name: "Baby Romper Set",
  slug: "baby-romper-set",
  sku: "NPL-CLT-022",
  img: "images/baby-romper-set.png",
  images: ["images/baby-romper-set.png"],
  tagline: "Adorable comfort for your little one",
  category: "Baby Clothing",
  categoryId: "cat-clothing",
  age: "3-12 months",
  ageGroups: ["3-12"],
  material: "100% Cotton",
  color: "Pastel blue with elephant print",
  brand: "Nappilos",
  price: 649,
  compareAtPrice: 949,
  costPrice: 240,
  stockQuantity: 50,
  lowStockThreshold: 10,
  weight: "120g",
  dimensions: "Standard",
  hsnCode: "6111",
  gstRate: 12,
  platform: ["main", "baby"],
  tags: ["cotton", "romper", "baby-clothing"],
  isFeatured: true,
  isBestseller: false,
  isActive: true,
  variants: [
    { id: "p22-s1", name: "Size", value: "3-6 months", priceModifier: 0 },
    { id: "p22-s2", name: "Size", value: "6-12 months", priceModifier: 50 }
  ],
  features: [
    "100% soft cotton — gentle on skin",
    "Easy snap buttons for diaper changes",
    "Adorable elephant print",
    "Machine washable & durable"
  ],
  desc: "Our Baby Romper Set combines comfort and style. Made from 100% soft cotton with easy snap buttons for hassle-free diaper changes. The adorable elephant print adds playful charm to your baby's wardrobe."
}
```

**Step 2:** Add product image to `images/` folder
- Name it `baby-romper-set.png` (match the `img` field)
- Recommended size: 800x800px or larger
- Format: PNG or JPG

**Step 3:** Create product page
```bash
# Copy the template
cp product.html p22.html
```

**Step 4:** Update `index.html` (optional)
- The homepage grid automatically shows all products from `products.js`
- No manual update needed unless you want custom ordering

### How to Edit an Existing Product

**Example: Change price and stock for p1 (Baby Muslin Swaddle)**

Open `products.js` and find `p1`:

```javascript
p1: {
  name: "Baby Muslin Swaddle",
  // ... other fields ...
  
  price: 599,              // ← Change this
  compareAtPrice: 899,     // ← Change this
  stockQuantity: 45,       // ← Change this
  
  // ... rest of fields ...
}
```

**Common edits:**

```javascript
// Change price
price: 699,                    // New selling price

// Change MRP
compareAtPrice: 999,           // New original price

// Update stock
stockQuantity: 30,             // New stock count

// Mark as out of stock
stockQuantity: 0,              // Shows "Out of Stock"

// Mark as low stock
stockQuantity: 5,              // Shows "Low Stock" warning

// Hide product from site
isActive: false,               // Product won't appear anywhere

// Add bestseller badge
isBestseller: true,            // Shows "BESTSELLER" badge

// Add featured/new badge
isFeatured: true,              // Shows "NEW" badge
```

### How to Delete a Product

**Option 1: Hide it (recommended)**
```javascript
p1: {
  // ... all fields ...
  isActive: false,             // ← Just set this to false
}
```
Product stays in code but won't show on the site.

**Option 2: Remove completely**
1. Delete the entire product block from `products.js`
2. Delete the product page file (`p1.html`)
3. Delete the product image from `images/` (optional)

### How to Add Variants (Sizes, Packs, Colors)

**Example: Add size variants to a product**

```javascript
p22: {
  // ... other fields ...
  
  variants: [
    { id: "p22-s1", name: "Size", value: "0-3 months", priceModifier: 0 },
    { id: "p22-s2", name: "Size", value: "3-6 months", priceModifier: 50 },
    { id: "p22-s3", name: "Size", value: "6-12 months", priceModifier: 100 }
  ],
  
  // ... rest of fields ...
}
```

**How variants work:**
- `name`: Label shown to customer ("Size", "Pack", "Color")
- `value`: Option name ("Small", "Pack of 3", "Blue")
- `priceModifier`: Additional price for this variant (0 = base price)

**Example: Pack variants**
```javascript
variants: [
  { id: "p3-s1", name: "Pack", value: "Single", priceModifier: 0 },
  { id: "p3-s2", name: "Pack", value: "Pack of 3", priceModifier: 500 },
  { id: "p3-s3", name: "Pack", value: "Pack of 5", priceModifier: 800 }
]
```
- Single: ₹299 (base price)
- Pack of 3: ₹799 (299 + 500)
- Pack of 5: ₹1099 (299 + 800)

### Product Images

**Image requirements:**
- Format: PNG (recommended) or JPG
- Size: 800x800px or larger (square works best)
- File size: Keep under 500KB for fast loading
- Naming: Use product slug (e.g., `baby-muslin-swaddle.png`)

**Adding multiple images:**
```javascript
p1: {
  // ... other fields ...
  
  img: "images/muslin-swaddle.png",              // Main image
  images: [                                       // All images (for gallery)
    "images/muslin-swaddle.png",
    "images/muslin-swaddle-2.png",
    "images/muslin-swaddle-3.png"
  ],
  
  // ... rest of fields ...
}
```

---

## Cart System

### How the Cart Works

The cart is managed by `cart.js` and stores data in the browser's localStorage.

**Cart operations:**

```javascript
// Add item to cart
NappilosCart.addItem(productId, variantId, quantity);

// Example: Add p1 with first variant, quantity 2
NappilosCart.addItem('p1', 'p1-s1', 2);

// Remove item from cart
NappilosCart.removeItem(cartId);

// Update quantity
NappilosCart.updateQuantity(cartId, newQuantity);

// Clear entire cart
NappilosCart.clearCart();

// Get cart data
const cart = NappilosCart.getCart();
const subtotal = NappilosCart.getSubtotal();
const total = NappilosCart.getTotal();
```

### Cart Calculations

The cart automatically calculates:

```javascript
Subtotal:     Sum of (price × quantity) for all items
GST:          Calculated based on each product's gstRate
Shipping:     FREE if subtotal ≥ ₹999, else ₹69
Total:        Subtotal + GST + Shipping
Savings:      Sum of (compareAtPrice - price) × quantity
```

### Checkout Flow

When customer clicks "Proceed to Checkout":

1. Cart data is collected
2. Order summary is formatted
3. WhatsApp opens with pre-filled message:
   ```
   Hi Nappilos! I'd like to order:
   • Baby Muslin Swaddle (76 x 76 cm) x2 - ₹1,198
   • Knotted Jabla (0-3 months) x1 - ₹399
   
   Subtotal: ₹1,597
   GST: ₹191.64
   Shipping: FREE
   Total: ₹1,788.64
   ```
4. Customer sends message to your WhatsApp
5. You receive order and can confirm via WhatsApp

### Wishlist

Customers can save products to wishlist:

```javascript
// Toggle wishlist
NappilosCart.toggleWishlist(productId);

// Check if in wishlist
const isInWishlist = NappilosCart.isInWishlist('p1');

// Get all wishlist items
const wishlist = NappilosCart.getWishlist();
```

Wishlist is stored in localStorage and persists across sessions.

---

## Backend Integration

### Current Setup (Local Mode)

By default, the site uses `products.js` for all data. This works immediately without any backend.

```javascript
// api.js line 10
let useLocal = true; // ← Currently using local data
```

### Connecting to Your NestJS Backend

When your backend is live at `api.nappilos.com`:

**Step 1:** Update `api.js`

```javascript
// Line 8: Update if your API URL is different
const BASE_URL = 'https://api.nappilos.com/api/v1';

// Line 10: Switch to API mode
let useLocal = false; // ← Change this to false
```

**Step 2:** Test the connection

Open browser console and run:
```javascript
NappilosAPI.fetchProducts().then(result => console.log(result));
```

If successful, you'll see your products from the database.

### API Endpoints Available

Your NestJS backend provides these endpoints:

```
POST   /api/v1/auth/login          ← Login (get JWT token)
POST   /api/v1/auth/logout         ← Logout
GET    /api/v1/auth/me              ← Get current user

GET    /api/v1/products             ← List all products
GET    /api/v1/products/:id         ← Get single product
GET    /api/v1/products/platform/:p ← Get products for platform
POST   /api/v1/products             ← Create product (admin)
PATCH  /api/v1/products/:id         ← Update product (admin)
DELETE /api/v1/products/:id         ← Delete product (admin)

POST   /api/v1/orders               ← Create order
GET    /api/v1/orders               ← List orders (admin)
GET    /api/v1/orders/:id           ← Get order details (admin)
PATCH  /api/v1/orders/:id/status    ← Update order status (admin)
```

### Syncing Products from Backend

When `useLocal = false`, the site will:

1. Fetch products from `/api/v1/products?platforms=main&isActive=true`
2. Display them on homepage
3. Fetch individual product from `/api/v1/products/:id` when viewing product page

**Note:** You still need `products.js` as a fallback if the API is down.

### Creating Orders via API

To send orders to your backend instead of WhatsApp:

**Step 1:** Update `cart.js` checkout function

```javascript
function checkout() {
  const data = NappilosCart.getCheckoutData();
  
  // Send to backend
  NappilosAPI.createOrder({
    items: data.items,
    subtotal: data.subtotal,
    taxAmount: data.taxAmount,
    shippingAmount: data.shippingAmount,
    totalAmount: data.totalAmount,
    // Add customer details
    shippingName: "Customer Name",
    shippingAddress: "123 Main St",
    shippingCity: "Mumbai",
    shippingState: "Maharashtra",
    shippingPincode: "400001",
    shippingPhone: "+919876543210"
  }).then(result => {
    if (result.success) {
      alert('Order placed! Order number: ' + result.data.orderNumber);
      NappilosCart.clearCart();
      window.location.href = '/order-success.html';
    } else {
      alert('Order failed: ' + result.message);
    }
  });
}
```

**Step 2:** Create order success page

Create `order-success.html` with a thank you message.

---

## Deployment

### Option 1: GitHub Pages (Free)

Your repo is already on GitHub. Enable GitHub Pages:

1. Go to https://github.com/NavinReddy91/Nappilos-com
2. Click **Settings** → **Pages**
3. Under "Source", select **Deploy from a branch**
4. Select branch: **main**, folder: **/ (root)**
5. Click **Save**
6. Your site will be live at: `https://navinreddy91.github.io/Nappilos-com/`

**Note:** GitHub Pages uses a subdomain. For custom domain (nappilos.com), see Option 2.

### Option 2: Custom Domain (nappilos.com)

If you own `nappilos.com`:

**Step 1:** Update DNS

Point your domain to your hosting provider:

```
Type: A
Name: @
Value: [your hosting IP]

Type: CNAME
Name: www
Value: [your hosting domain]
```

**Step 2:** Upload files to hosting

Use FTP or your hosting control panel to upload all files to the `public_html` or `www` folder.

**Step 3:** Test

Visit https://nappilos.com - your site should be live!

### Option 3: Netlify (Free + Custom Domain)

1. Go to https://netlify.com
2. Click **Add new site** → **Deploy manually**
3. Drag and drop the `nappilos-com` folder
4. Site is live at a Netlify subdomain
5. Go to **Domain settings** → **Add custom domain**
6. Follow instructions to connect `nappilos.com`

### Option 4: Vercel (Free + Custom Domain)

1. Go to https://vercel.com
2. Click **New Project** → **Import Git Repository**
3. Select `NavinReddy91/Nappilos-com`
4. Click **Deploy**
5. Site is live at a Vercel subdomain
6. Go to **Settings** → **Domains** → **Add custom domain**
7. Follow instructions to connect `nappilos.com`

---

## Troubleshooting

### Products not showing on homepage

**Problem:** Homepage shows empty grid

**Solution:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Make sure `products.js` is loaded before the grid renders
4. Verify at least one product has `isActive: true`

### Cart not working

**Problem:** Add to cart button doesn't work

**Solution:**
1. Make sure `cart.js` is included in the page:
   ```html
   <script src="cart.js"></script>
   ```
2. Check browser console for errors
3. Verify `products.js` is loaded before `cart.js`

### Product page not loading

**Problem:** Clicking product shows "Product not found"

**Solution:**
1. Make sure the product ID in the URL matches `products.js`
   - URL: `p1.html` → looks for `products.p1`
2. Verify the product exists in `products.js`
3. Check that `p1.html` is a copy of `product.html`

### Images not showing

**Problem:** Product images are broken

**Solution:**
1. Check image path in `products.js`:
   ```javascript
   img: "images/muslin-swaddle.png"  // ← Must match actual file
   ```
2. Verify image exists in `images/` folder
3. Check file name spelling (case-sensitive!)

### Cart total wrong

**Problem:** GST or total calculation is incorrect

**Solution:**
1. Verify `gstRate` in `products.js` is correct (5, 12, 18, or 28)
2. Check that `price` and `compareAtPrice` are numbers, not strings
3. Clear browser localStorage and try again:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

### Backend API not connecting

**Problem:** API calls fail or timeout

**Solution:**
1. Check `api.js` BASE_URL is correct
2. Verify backend is running and accessible
3. Check CORS settings on backend (must allow your domain)
4. Test API directly in browser:
   ```
   https://api.nappilos.com/api/v1/products
   ```
5. If API is down, switch back to local mode:
   ```javascript
   let useLocal = true; // ← Change back to true
   ```

### Product variants not working

**Problem:** Variant selector doesn't update price

**Solution:**
1. Verify variant structure in `products.js`:
   ```javascript
   variants: [
     { id: "p1-s1", name: "Size", value: "Small", priceModifier: 0 }
   ]
   ```
2. Make sure each variant has a unique `id`
3. Check that `priceModifier` is a number (0, 50, 100, etc.)

---

## Quick Reference

### Common Tasks

**Change product price:**
```javascript
price: 699,              // Selling price
compareAtPrice: 999,     // MRP (shows strikethrough)
```

**Update stock:**
```javascript
stockQuantity: 30,       // Current stock
lowStockThreshold: 10,   // Alert when <= this
```

**Hide product:**
```javascript
isActive: false,         // Won't show on site
```

**Add bestseller badge:**
```javascript
isBestseller: true,      // Shows "BESTSELLER" badge
```

**Add featured/new badge:**
```javascript
isFeatured: true,        // Shows "NEW" badge
```

**Change GST rate:**
```javascript
gstRate: 12,             // 5, 12, 18, or 28
```

**Add to specific platform:**
```javascript
platform: ["main", "baby"],  // Show on main site and baby.nappilos.com
```

### File Locations

| File | Purpose | Edit When |
|------|---------|-----------|
| `products.js` | All product data | Adding/editing/deleting products |
| `cart.js` | Shopping cart logic | Changing cart behavior |
| `api.js` | Backend connection | Connecting to NestJS backend |
| `product.html` | Product page template | Changing product page design |
| `index.html` | Homepage | Changing homepage layout |

### Product Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Product name |
| `slug` | string | ✅ | URL-friendly name |
| `sku` | string | ✅ | Stock Keeping Unit (unique) |
| `img` | string | ✅ | Main image path |
| `price` | number | ✅ | Selling price (₹) |
| `compareAtPrice` | number | | MRP/original price (₹) |
| `costPrice` | number | | Your cost (₹) - not shown |
| `stockQuantity` | number | ✅ | Current stock |
| `lowStockThreshold` | number | | Alert threshold |
| `category` | string | ✅ | Category name |
| `categoryId` | string | | Category ID for filtering |
| `age` | string | | Age range (e.g., "0-12 months") |
| `material` | string | | Material description |
| `color` | string | | Color/print description |
| `brand` | string | | Brand name |
| `weight` | string | | Weight (e.g., "180g") |
| `dimensions` | string | | Dimensions (e.g., "76 x 76 cm") |
| `hsnCode` | string | | GST HSN code |
| `gstRate` | number | ✅ | GST percentage (5, 12, 18, 28) |
| `platform` | array | ✅ | Which sites show this (main, baby, kids) |
| `tags` | array | | Search/filter tags |
| `isFeatured` | boolean | | Show "NEW" badge |
| `isBestseller` | boolean | | Show "BESTSELLER" badge |
| `isActive` | boolean | ✅ | false = hide from site |
| `variants` | array | | Size/pack/color options |
| `features` | array | | Bullet point features |
| `desc` | string | ✅ | Full description |
| `tagline` | string | | Short tagline |

---

## Support

For questions or issues:

1. Check the troubleshooting section above
2. Open browser console (F12) to see JavaScript errors
3. Review the code comments in `products.js`, `cart.js`, and `api.js`
4. Contact: navin@nappilos.com

---

**Last Updated:** 2026-01-XX  
**Template Version:** 1.0  
**Backend:** NestJS (nappilos-unified-backend)  
**Admin Panel:** React (nappilos-login)
