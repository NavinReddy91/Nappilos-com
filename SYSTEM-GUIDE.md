# Nappilos Multi-Platform E-Commerce System - Complete Guide

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL (React)                       │
│              https://admin.nappilos.com                      │
│         (Nappilos-Login repo - where you manage everything) │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Manage Products, Orders, Users
                     │
┌────────────────────▼────────────────────────────────────────┐
│              NESTJS UNIFIED BACKEND                          │
│           https://api.nappilos.com/api/v1                    │
│              (Nappilos-Backened repo)                        │
│                                                              │
│  • Products API    • Orders API    • Users API              │
│  • Inventory API   • Invoices API  • Accounting API         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Fetch Products by Platform
                     │
        ┌────────────┼────────────┬────────────┬────────────┐
        │            │            │            │            │
┌───────▼─────┐ ┌───▼─────┐ ┌───▼─────┐ ┌───▼─────┐ ┌───▼─────┐
│ nappilos.com│ │baby.      │ │kids.    │ │learn.   │ │toys.    │
│  (main)     │ │nappilos.  │ │nappilos.│ │nappilos.│ │nappilos.│
│ All Products│ │com        │ │com      │ │com      │ │com      │
│             │ │(0-3 yrs)  │ │(4-12 yrs)│ │(Learning)│ │(Toys)   │
└─────────────┘ └──────────┘ └─────────┘ └─────────┘ └─────────┘
```

## How It Works

### 1. Admin Panel (Nappilos-Login)

**URL:** https://admin.nappilos.com (or your deployed URL)

**What you do here:**
- Login with your admin credentials
- Create/edit/delete products
- Set product details (name, price, stock, images, variants)
- Assign products to platforms (main, baby, kids, learn, toys)
- Set age groups (0-3, 3-12, etc.)
- Manage orders
- View inventory
- Generate invoices

**Login credentials:**
- Email: `admin@nappilos.com` (or your admin email)
- Password: (set during backend setup)

### 2. Backend API (NestJS)

**URL:** https://api.nappilos.com/api/v1

**What it does:**
- Stores all product data
- Serves products to each frontend based on platform
- Handles orders, inventory, users
- Calculates GST
- Manages authentication

**Key API endpoints:**
```
GET  /products?platforms=baby&isActive=true
     → Returns products for baby.nappilos.com

GET  /products?platforms=kids&ageGroup=4-7
     → Returns products for kids aged 4-7

POST /orders
     → Creates new order

GET  /products/:id
     → Returns single product details
```

### 3. Frontend Sites

Each subdomain is a separate frontend that:
- Detects which platform it is (from URL)
- Fetches products from backend API filtered by platform
- Shows only relevant products

**Platform Detection:**
```javascript
// api.js automatically detects platform from URL
const hostname = window.location.hostname;

if (hostname.includes('baby')) PLATFORM = 'baby';
else if (hostname.includes('kids')) PLATFORM = 'kids';
else if (hostname.includes('learn')) PLATFORM = 'learn';
else if (hostname.includes('toys')) PLATFORM = 'toys';
else PLATFORM = 'main';
```

## Product Distribution Logic

When you create a product in the admin panel, you assign it to platforms:

```javascript
// Example: Baby Muslin Swaddle
{
  name: "Baby Muslin Swaddle",
  price: 599,
  platforms: ["main", "baby"],  // ← Shows on both sites
  ageGroups: ["0-3", "3-12"],
  category: "Swaddles & Wraps"
}
```

**Result:**
- ✅ Appears on nappilos.com (main platform)
- ✅ Appears on baby.nappilos.com (baby platform)
- ❌ Does NOT appear on kids.nappilos.com (not assigned to kids)

### Platform Assignment Guide

| Product Type | Platforms to Assign | Age Groups |
|--------------|---------------------|------------|
| Baby clothing (0-3 yrs) | main, baby | 0-3, 3-12 |
| Kids clothing (4-12 yrs) | main, kids | 4-7, 8-12 |
| Toys | main, toys | All ages |
| Books | main, nextbooks | All ages |
| Learning products | main, learn | All ages |
| Gift sets | main, baby | 0-3, 3-12 |

## Step-by-Step: Adding a New Product

### Step 1: Login to Admin Panel

1. Go to https://admin.nappilos.com
2. Login with your credentials
3. Click "Products" in sidebar

### Step 2: Create Product

1. Click "Add Product" button
2. Fill in the form:

**Basic Info:**
```
Name: Baby Romper Set
SKU: NPL-CLT-022
Slug: baby-romper-set (auto-generated)
Brand: Nappilos
Short Description: Adorable comfort for your little one
Description: Our Baby Romper Set combines comfort and style...
```

**Pricing & Inventory:**
```
Price: 649
Compare at Price: 949 (MRP - shows strikethrough)
Cost Price: 240 (your cost - not shown to customers)
Stock Quantity: 50
Low Stock Threshold: 10
HSN Code: 6111
GST Rate: 12%
```

**Platforms & Flags:**
```
Platforms: ☑ main, ☑ baby
Age Groups: 0-3, 3-12
Featured: ☑ (shows "NEW" badge)
Bestseller: ☐
Active: ☑ (must be checked to show on site)
```

**Variants (optional):**
```
Variant Name: Size
Options:
  - 0-3 months (price modifier: 0)
  - 3-6 months (price modifier: 50)
  - 6-12 months (price modifier: 100)
```

**Images:**
```
Upload product images (PNG/JPG, 800x800px recommended)
```

3. Click "Save Product"

### Step 3: Product Goes Live

The product is now:
- ✅ Stored in database
- ✅ Available via API
- ✅ Showing on assigned platforms (nappilos.com, baby.nappilos.com)
- ✅ NOT showing on other platforms (kids.nappilos.com, etc.)

### Step 4: Verify on Frontend

1. Visit https://nappilos.com
2. Search for "Baby Romper Set"
3. Verify it appears with correct price, images, variants

4. Visit https://baby.nappilos.com
5. Verify it appears here too

6. Visit https://kids.nappilos.com
7. Verify it does NOT appear (not assigned to kids platform)

## Updating Existing Products

### Change Price

1. Admin Panel → Products → Find product
2. Click "Edit"
3. Update Price field
4. Click "Save"
5. Frontend updates immediately

### Update Stock

1. Admin Panel → Products → Find product
2. Click "Edit"
3. Update Stock Quantity
4. Click "Save"
5. Frontend shows updated stock status

### Hide Product

1. Admin Panel → Products → Find product
2. Click "Edit"
3. Uncheck "Active"
4. Click "Save"
5. Product disappears from all frontends

### Change Platform Assignment

**Example: Move product from baby to kids**

1. Admin Panel → Products → Find product
2. Click "Edit"
3. Uncheck "baby" platform
4. Check "kids" platform
5. Update Age Groups if needed
6. Click "Save"
7. Product now shows on kids.nappilos.com instead of baby.nappilos.com

## Managing Orders

### View Orders

1. Admin Panel → Orders
2. See all orders from all platforms
3. Filter by platform, status, date

### Update Order Status

1. Click on order
2. Change status: Pending → Confirmed → Processing → Shipped → Delivered
3. Customer gets notified (if email/SMS configured)

### Generate Invoice

1. Open order details
2. Click "Generate Invoice"
3. Invoice is created with GST breakdown
4. Download PDF or send to customer

## Inventory Management

### View Stock Levels

1. Admin Panel → Inventory
2. See all products with current stock
3. Low stock items highlighted

### Record Stock Movement

**Example: Received new stock**

1. Admin Panel → Inventory → Record Movement
2. Select product
3. Movement type: "Inbound"
4. Quantity: 100
5. Reason: "Received from supplier"
6. Click "Save"
7. Stock quantity updates automatically

## Frontend Customization

### How Frontend Fetches Products

The frontend (index.html, product.html) uses `api.js`:

```javascript
// Fetch products for current platform
async function loadProducts() {
  const result = await NappilosAPI.fetchProducts({
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  if (result.success) {
    renderProductGrid(result.data);
  }
}
```

### Platform-Specific Filtering

Each frontend automatically filters by platform:

```javascript
// api.js detects platform from URL
const PLATFORM = 'baby'; // for baby.nappilos.com

// API call includes platform filter
fetch(`${BASE_URL}/products?platforms=baby&isActive=true`)
```

### Customizing Product Display

Edit `product.html` to change how products display:

```html
<!-- Product title -->
<h1 class="product-title">${product.name}</h1>

<!-- Price display -->
<span class="price-current">${formatPrice(product.price)}</span>

<!-- Stock status -->
<div class="stock-status">${stockStatus.label}</div>
```

## Deployment Setup

### Backend (NestJS)

```bash
# Clone backend repo
git clone https://github.com/NavinReddy91/Nappilos-Backened
cd Nappilos-Backened

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database, JWT secrets, etc.

# Run migrations
npm run typeorm:migration:run

# Start server
npm run start:prod
```

**Deploy to:** Render, Railway, or your VPS

### Admin Panel (React)

```bash
# Clone admin repo
git clone https://github.com/NavinReddy91/Nappilos-Login
cd Nappilos-Login

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Set VITE_API_BASE_URL=https://api.nappilos.com/api/v1

# Build
npm run build
```

**Deploy to:** Vercel, Netlify, or your VPS  
**Domain:** admin.nappilos.com

### Frontend Sites

Each subdomain is a copy of the same codebase with different platform detection:

```bash
# Clone frontend repo
git clone https://github.com/NavinReddy91/Nappilos-com
cd Nappilos-com

# Deploy same code to all subdomains:
# - nappilos.com (main)
# - baby.nappilos.com
# - kids.nappilos.com
# - learn.nappilos.com
# - toys.nappilos.com
```

**DNS Setup:**
```
nappilos.com        → A record → [your hosting IP]
baby.nappilos.com   → CNAME → nappilos.com
kids.nappilos.com   → CNAME → nappilos.com
learn.nappilos.com  → CNAME → nappilos.com
toys.nappilos.com   → CNAME → nappilos.com
```

The `api.js` automatically detects which subdomain it's on and fetches the right products.

## Testing the System

### Test Product Creation

1. Login to admin panel
2. Create test product
3. Assign to "main" platform only
4. Visit nappilos.com → verify product appears
5. Visit baby.nappilos.com → verify product does NOT appear

### Test Platform Filtering

1. Edit test product
2. Add "baby" platform
3. Visit baby.nappilos.com → verify product now appears
4. Visit kids.nappilos.com → verify product still does NOT appear

### Test Order Flow

1. Visit nappilos.com
2. Add product to cart
3. Checkout (WhatsApp or API)
4. Check admin panel → Orders → verify order appears

## Troubleshooting

### Products not showing on frontend

**Problem:** You created product in admin but it doesn't appear on site

**Solutions:**
1. Check product is "Active" (checkbox must be checked)
2. Check product is assigned to correct platform
3. Check browser console for API errors
4. Verify backend API is running
5. Test API directly: `https://api.nappilos.com/api/v1/products?platforms=main`

### Admin panel can't connect to backend

**Problem:** Admin panel shows "Network error"

**Solutions:**
1. Check backend URL in admin `.env`: `VITE_API_BASE_URL`
2. Verify backend is running
3. Check CORS settings on backend (must allow admin domain)
4. Check browser console for CORS errors

### Wrong products showing on subdomain

**Problem:** baby.nappilos.com showing kids products

**Solutions:**
1. Check `api.js` platform detection
2. Verify DNS is pointing to correct hosting
3. Check browser console: `console.log(NappilosAPI.PLATFORM)`
4. Clear browser cache

### Cart not working

**Problem:** Add to cart button doesn't work

**Solutions:**
1. Check `cart.js` is loaded in page
2. Check browser console for errors
3. Verify `products.js` or API is returning product data
4. Clear localStorage: `localStorage.clear()`

## Quick Reference

### Admin Panel URLs

| Action | URL |
|--------|-----|
| Login | https://admin.nappilos.com/login |
| Products | https://admin.nappilos.com/products |
| Orders | https://admin.nappilos.com/orders |
| Inventory | https://admin.nappilos.com/inventory |
| Users | https://admin.nappilos.com/users |

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /products?platforms=baby` | Get baby products |
| `GET /products/:id` | Get single product |
| `POST /orders` | Create order |
| `POST /auth/login` | Login |

### Platform Codes

| Code | Subdomain | Age Range |
|------|-----------|-----------|
| `main` | nappilos.com | All |
| `baby` | baby.nappilos.com | 0-3 years |
| `kids` | kids.nappilos.com | 4-12 years |
| `learn` | learn.nappilos.com | Learning |
| `toys` | toys.nappilos.com | Toys |
| `nextbooks` | books.nappilos.com | Books |

### Age Group Codes

| Code | Age Range |
|------|-----------|
| `0-3` | 0-3 months |
| `3-12` | 3-12 months |
| `12-18` | 12-18 months |
| `4-7` | 4-7 years |
| `8-12` | 8-12 years |

## Support

**Backend issues:** Check Nappilos-Backened repo  
**Admin panel issues:** Check Nappilos-Login repo  
**Frontend issues:** Check Nappilos-com repo  

**Contact:** navin@nappilos.com

---

**Last Updated:** 2026-01-XX  
**System Version:** 1.0  
**Architecture:** Multi-platform e-commerce with unified backend
