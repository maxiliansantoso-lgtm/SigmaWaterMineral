// Format currency
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

// Language switcher functionality
const setLang = (lang) => {
  document.documentElement.setAttribute('lang', lang);
  localStorage.setItem('sigma_lang', lang);
  window.dispatchEvent(new Event('langChanged'));
};

// Global Cart State & Logic
let cart = JSON.parse(localStorage.getItem('sigma_cart')) || [];

const products = {
  cups: { id: 'cups', nameEn: '300ml Water Cups', nameId: 'Gelas Air 300ml', price: 35000, img: 'assets/bottle_300ml.png', unitEn: 'Box', unitId: 'Dus' },
  bottles_330: { id: 'bottles_330', nameEn: '330ml Mineral Water', nameId: 'Air Mineral 330ml', price: 40000, img: 'assets/bottle_330ml.png', unitEn: 'Box', unitId: 'Dus' },
  sparkling_500: { id: 'sparkling_500', nameEn: '500ml Sparkling Water', nameId: 'Air Soda 500ml', price: 100000, img: 'assets/sparkling_500ml.png', unitEn: 'Box', unitId: 'Dus' },
  bottles: { id: 'bottles', nameEn: '600ml Bottled Water', nameId: 'Air Botol 600ml', price: 55000, img: 'assets/bottle_600ml.png', unitEn: 'Box', unitId: 'Dus' },
  bottles_1500: { id: 'bottles_1500', nameEn: '1500ml Mineral Water', nameId: 'Air Mineral 1500ml', price: 130000, img: 'assets/bottle_1500ml.png', unitEn: 'Box', unitId: 'Dus' },
  gallon: { id: 'gallon', nameEn: '19L Sigma Gallon', nameId: 'Galon Sigma 19L', price: 65000, img: 'assets/gallon_19l.png', unitEn: 'Gallon', unitId: 'Galon' }
};

const saveCart = () => {
  localStorage.setItem('sigma_cart', JSON.stringify(cart));
  updateCartBadge();
};

const updateCartBadge = () => {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  badge.innerText = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
};

const addToCart = (productId, qty = 1) => {
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty: qty });
  }
  saveCart();
  renderCart();
  openCart();
};

const removeFromCart = (productId) => {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
};

const updateCartQty = (productId, change) => {
  const item = cart.find(item => item.id === productId);
  if (!item) return;
  item.qty += change;
  if (item.qty < 1) {
    removeFromCart(productId);
  } else {
    saveCart();
    renderCart();
  }
};

const openCart = () => {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.add('open');
    overlay.classList.add('show');
  }
};

const closeCart = () => {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
  }
};

const renderCart = () => {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!container || !totalEl) return;

  container.innerHTML = '';
  let total = 0;
  const isEn = document.documentElement.getAttribute('lang') === 'en';

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); margin-top: 3rem;">
        <p class="lang-en">Your cart is empty.</p>
        <p class="lang-id">Keranjang belanja Anda kosong.</p>
      </div>
    `;
    totalEl.innerText = formatRupiah(0);
    return;
  }

  cart.forEach(item => {
    const prod = products[item.id];
    if (!prod) return;
    const itemTotal = prod.price * item.qty;
    total += itemTotal;

    const name = isEn ? prod.nameEn : prod.nameId;
    const unit = isEn ? prod.unitEn : prod.unitId;
    const unitPlural = (isEn && item.qty > 1 && unit === 'Box') ? 'es' : '';

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${prod.img}" alt="${name}">
      <div class="cart-item-info">
        <div class="cart-item-title">${name}</div>
        <div class="cart-item-price">${formatRupiah(prod.price)}</div>
        <div class="cart-item-qty-actions">
          <button class="cart-item-qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
          <span style="font-weight: 600; font-size: 0.9rem; min-width: 40px; text-align: center;">${item.qty} ${unit}${unitPlural}</span>
          <button class="cart-item-qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      </button>
    `;
    container.appendChild(itemDiv);
  });

  totalEl.innerText = formatRupiah(total);
};

const checkoutCart = () => {
  if (cart.length === 0) return;
  const isEn = document.documentElement.getAttribute('lang') === 'en';
  let total = 0;
  let itemsList = '';

  cart.forEach(item => {
    const prod = products[item.id];
    if (!prod) return;
    const name = isEn ? prod.nameEn : prod.nameId;
    const unit = isEn ? prod.unitEn : prod.unitId;
    const unitPlural = (isEn && item.qty > 1 && unit === 'Box') ? 'es' : '';
    const itemTotal = prod.price * item.qty;
    total += itemTotal;

    itemsList += `- ${item.qty}x ${name} (${formatRupiah(itemTotal)})%0A`;
  });

  let message = '';
  if (isEn) {
    message = `Hello Sigma Water, I would like to place an order:%0A%0A*Order Details:*%0A${itemsList}%0A*Total Amount:* ${formatRupiah(total)}`;
  } else {
    message = `Halo Sigma Water, saya ingin melakukan pemesanan:%0A%0A*Detail Pesanan:*%0A${itemsList}%0A*Total Pembayaran:* ${formatRupiah(total)}`;
  }

  const waUrl = `https://wa.me/6281584700009?text=${message}`;
  window.open(waUrl, '_blank');
};

// DOM Content Loaded Init
document.addEventListener('DOMContentLoaded', () => {
  // Initialize language
  const savedLang = localStorage.getItem('sigma_lang') || 'id'; // default to id (Indonesian)
  setLang(savedLang);

  // Inject CSS Styles for Cart Drawer
  const style = document.createElement('style');
  style.textContent = `
    #cart-drawer {
      position: fixed;
      top: 0;
      right: -420px;
      width: 100%;
      max-width: 400px;
      height: 100vh;
      background: var(--bg-surface);
      border-left: 1px solid var(--border-color);
      z-index: 10000;
      transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: -10px 0 30px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      padding: 2rem;
    }
    #cart-drawer.open {
      right: 0 !important;
    }
    #cart-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    #cart-overlay.show {
      display: block !important;
      opacity: 1 !important;
    }
    .cart-item {
      display: flex;
      gap: 1rem;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 1rem;
    }
    .cart-item img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 6px;
      background: #000;
    }
    .cart-item-info {
      flex: 1;
    }
    .cart-item-title {
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
    }
    .cart-item-price {
      color: var(--accent-blue);
      font-weight: 700;
      font-size: 0.9rem;
    }
    .cart-item-qty-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .cart-item-qty-btn {
      background: rgba(255,255,255,0.08);
      border: none;
      color: var(--text-main);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      transition: background 0.2s;
    }
    .cart-item-qty-btn:hover {
      background: rgba(255,255,255,0.15);
    }
    .cart-item-remove {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.2rem;
      transition: color 0.2s;
    }
    .cart-item-remove:hover {
      color: #ef4444;
    }
    @media (max-width: 768px) {
      .nav-links a { display: none; }
      .nav-links { display: flex !important; align-items: center; }
      .lang-selector { margin-left: 0.5rem !important; }
      #cart-drawer { max-width: 320px; }
    }
  `;
  document.head.appendChild(style);

  // Inject Cart Drawer HTML
  const drawer = document.createElement('div');
  drawer.id = 'cart-drawer';
  drawer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
      <h3 class="lang-en" style="font-size: 1.4rem;">Your Cart</h3>
      <h3 class="lang-id" style="font-size: 1.4rem;">Keranjang Anda</h3>
      <button id="close-cart" style="background: transparent; border: none; color: var(--text-main); font-size: 1.8rem; cursor: pointer; line-height: 1;">&times;</button>
    </div>
    
    <div id="cart-items" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1.2rem; margin-bottom: 2rem;">
      <!-- Items will render here -->
    </div>
    
    <div style="border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <span class="text-muted lang-en" style="font-weight: 600;">Total:</span>
        <span class="text-muted lang-id" style="font-weight: 600;">Total:</span>
        <span id="cart-total" style="font-size: 1.5rem; font-weight: 800; color: var(--accent-blue);">Rp 0</span>
      </div>
      <button id="checkout-btn" class="btn btn-primary" style="width: 100%; text-align: center; font-size: 1rem; padding: 1rem 0; border-radius: 30px;">
        <span class="lang-en">Checkout via WhatsApp</span>
        <span class="lang-id">Pesan via WhatsApp</span>
      </button>
    </div>
  `;
  document.body.appendChild(drawer);

  const overlay = document.createElement('div');
  overlay.id = 'cart-overlay';
  document.body.appendChild(overlay);

  // Dynamically append Cart Button to Nav Links
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    const cartBtn = document.createElement('button');
    cartBtn.id = 'cart-btn';
    cartBtn.className = 'btn btn-outline';
    cartBtn.style = 'position: relative; padding: 0.5rem; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 40px; height: 40px; margin-left: 2rem; border: 1px solid var(--border-color); background: transparent; color: var(--text-main); cursor: pointer;';
    cartBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <span id="cart-badge" style="position: absolute; top: -5px; right: -5px; background: var(--accent-blue); color: #fff; border-radius: 50%; width: 18px; height: 18px; font-size: 0.7rem; font-weight: bold; display: flex; align-items: center; justify-content: center; display: none;">0</span>
    `;
    navLinks.appendChild(cartBtn);

    // Event Listeners for Cart Interaction
    cartBtn.addEventListener('click', openCart);
  }

  document.getElementById('close-cart').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.getElementById('checkout-btn').addEventListener('click', checkoutCart);

  // Listen to language changes to re-render the cart names/units
  window.addEventListener('langChanged', renderCart);

  // Initial cart update
  updateCartBadge();
  renderCart();

  // Scroll animations Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
  });
});
