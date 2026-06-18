// Format currency
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

// Cart State Management
const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem('sigma_cart')) || [];
  } catch (e) {
    return [];
  }
};

const saveCart = (cart) => {
  localStorage.setItem('sigma_cart', JSON.stringify(cart));
  updateCartUI();
};

const addToCartGlobal = (id, name, qty, price) => {
  let cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, name, qty, price });
  }
  saveCart(cart);
  showNotifGlobal(`Added ${qty} × ${name} to cart.`);
};

const removeFromCart = (id) => {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
  if (item) {
    showNotifGlobal(`Removed ${item.name} from cart.`);
  }
};

// UI Rendering for Cart
const updateCartUI = () => {
  const cart = getCart();
  const countSpan = document.getElementById('cart-count');
  const itemsContainer = document.getElementById('cart-items-list');
  const totalSpan = document.getElementById('cart-total-price');
  
  // Update badge count
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  if (countSpan) {
    countSpan.textContent = totalCount;
  }

  // Update drawer contents
  if (itemsContainer) {
    if (cart.length === 0) {
      itemsContainer.innerHTML = '<div class="cart-empty-msg">Your cart is empty</div>';
    } else {
      itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>${item.qty} × ${formatRupiah(item.price)}</p>
          </div>
          <div class="cart-item-actions">
            <span class="cart-item-price">${formatRupiah(item.qty * item.price)}</span>
            <button class="remove-btn" onclick="removeFromCart('${item.id}')">Cancel Order</button>
          </div>
        </div>
      `).join('');
    }
  }

  // Update total price
  if (totalSpan) {
    const totalPrice = cart.reduce((sum, item) => sum + (item.qty * item.price), 0);
    totalSpan.textContent = formatRupiah(totalPrice);
  }
};

const toggleCart = () => {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.toggle('open');
    overlay.classList.toggle('open');
  }
};

const showNotifGlobal = (msg) => {
  let notif = document.getElementById('cart-notif');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'cart-notif';
    notif.className = 'cart-notification';
    document.body.appendChild(notif);
  }
  notif.innerText = msg;
  notif.classList.add('show');
  setTimeout(() => {
    notif.classList.remove('show');
  }, 3000);
};

// Inject Cart Drawer elements dynamically
const injectCartDrawer = () => {
  if (document.getElementById('cart-drawer')) return;

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'cart-overlay';
  overlay.className = 'cart-overlay';
  overlay.onclick = toggleCart;
  document.body.appendChild(overlay);

  // Drawer
  const drawer = document.createElement('div');
  drawer.id = 'cart-drawer';
  drawer.className = 'cart-drawer';
  drawer.innerHTML = `
    <div class="cart-header">
      <h3>Your Cart</h3>
      <button class="cart-close-btn" onclick="toggleCart()">&times;</button>
    </div>
    <div class="cart-items" id="cart-items-list">
      <!-- Dynamic list -->
    </div>
    <div class="cart-footer">
      <div class="cart-total">
        <span>Total:</span>
        <span id="cart-total-price">Rp 0</span>
      </div>
      <button class="btn btn-primary" style="width: 100%;" onclick="alert('Checkout functional for prototype (Order Submitted)')">Submit Order</button>
    </div>
  `;
  document.body.appendChild(drawer);
};

// DOM Content Loaded Init
document.addEventListener('DOMContentLoaded', () => {
  injectCartDrawer();
  updateCartUI();

  // Add event listener to any elements requiring dynamic scroll fade-in
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
