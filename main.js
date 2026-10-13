// ============================================
// Daniels Car Accessories - Main JavaScript
// ============================================

// ---- Cart Management (localStorage) ----
function getCart() {
  return JSON.parse(localStorage.getItem('dca_cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('dca_cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  let cart = getCart();
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1
    });
  }

  saveCart(cart);
  showToast(`${product.name} added to cart`);
}

function removeFromCart(productId) {
  let cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  if (typeof renderCartPage === 'function') renderCartPage();
}

function updateQty(productId, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  saveCart(cart);
  if (typeof renderCartPage === 'function') renderCartPage();
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ---- Toast Notification ----
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span style="color:var(--success)">✓</span> ${message}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ---- Hero Slider ----
function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    timer = setInterval(next, 5500);
  }

  function resetAuto() {
    clearInterval(timer);
    startAuto();
  }

  document.querySelector('.arrow-next')?.addEventListener('click', () => { next(); resetAuto(); });
  document.querySelector('.arrow-prev')?.addEventListener('click', () => { prev(); resetAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
  });

  startAuto();
}

// ---- Render Product Cards ----
function createProductCard(product) {
  const badgeHTML = product.badge
    ? `<span class="product-badge ${product.badge === 'Sale' ? 'sale' : ''}">${product.badge}</span>`
    : '';

  const oldPriceHTML = product.oldPrice
    ? `<span class="old">£${product.oldPrice.toFixed(2)}</span>`
    : '';

  return `
    <div class="product-card" data-id="${product.id}" data-category="${product.category}">
      <div class="product-img">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://placehold.co/600x400/1e293b/94a3b8?text=Product'">
        ${badgeHTML}
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-rating">
          ★ ${product.rating} <span>(${product.reviews})</span>
        </div>
        <p class="product-description">${product.description}</p>
        <button class="see-more-btn" type="button" data-expanded="false">See more</button>
        <div class="product-price-row">
          <div class="product-price">£${product.price.toFixed(2)} ${oldPriceHTML}</div>
          <button class="add-cart-btn" onclick="addToCart(${product.id})" title="Add to cart">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function bindSeeMoreButtons() {
  document.querySelectorAll('.see-more-btn').forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.product-card');
      const description = card?.querySelector('.product-description');
      if (!description) return;

      const isExpanded = button.dataset.expanded === 'true';
      description.classList.toggle('expanded', !isExpanded);
      button.dataset.expanded = String(!isExpanded);
      button.textContent = isExpanded ? 'See more' : 'Show less';
    });
  });
}

function renderProducts(containerSelector, productList = products, limit = null) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const list = limit ? productList.slice(0, limit) : productList;
  container.innerHTML = list.map(createProductCard).join('');
  bindSeeMoreButtons();
}

// ---- Shop Page Filters ----
function initShopFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const sortSelect = document.querySelector('.sort-select');
  if (!filterBtns.length) return;

  let currentCategory = 'All';
  let currentSort = 'featured';

  function applyFilters() {
    let filtered = currentCategory === 'All'
      ? [...products]
      : products.filter(p => p.category === currentCategory);

    if (currentSort === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (currentSort === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (currentSort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (currentSort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

    renderProducts('#shop-products', filtered);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      applyFilters();
    });
  });

  sortSelect?.addEventListener('change', (e) => {
    currentSort = e.target.value;
    applyFilters();
  });
}

// ---- Search ----
function initSearch() {
  const inputs = document.querySelectorAll('.search-box input');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const q = input.value.trim().toLowerCase();
        if (!q) return;
        // Simple redirect to shop with query (or filter if on shop page)
        if (window.location.pathname.includes('shop')) {
          const filtered = products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
          );
          renderProducts('#shop-products', filtered);
        } else {
          window.location.href = `shop.html?q=${encodeURIComponent(q)}`;
        }
      }
    });
  });
}

function initNewsletterSignup() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input || !input.value.trim()) {
      showToast('Please enter a valid email address');
      return;
    }

    showToast('Thanks for joining! Check your inbox for deals.');
    form.reset();
  });
}

// ---- Cart Page Renderer ----
function renderCartPage() {
  const container = document.querySelector('.cart-items');
  const summary = document.querySelector('.cart-summary');
  const emptyState = document.querySelector('.empty-cart');
  const cartLayout = document.querySelector('.cart-layout');

  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    if (cartLayout) cartLayout.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (cartLayout) cartLayout.style.display = 'grid';
  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/100x80/1e293b/94a3b8?text=Item'">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <div class="price">£${item.price.toFixed(2)}</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
      <div style="font-weight:700;font-size:1.1rem;">£${(item.price * item.qty).toFixed(2)}</div>
    </div>
  `).join('');

  if (summary) {
    if (!getCurrentUser()) {
      summary.innerHTML = `
        <h3>Account Required</h3>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Log in or create an account to complete checkout.</p>
        <a href="${getAuthUrl('login', 'cart.html')}" class="checkout-btn">Log In</a>
        <a href="${getAuthUrl('signup', 'cart.html')}" class="checkout-btn checkout-signup-btn">Sign Up</a>
      `;
      return;
    }

    const subtotal = getCartTotal();
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + shipping;

    summary.innerHTML = `
      <h3>Order Summary</h3>
      <div class="summary-row"><span>Subtotal</span><span>£${subtotal.toFixed(2)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : '£' + shipping.toFixed(2)}</span></div>
      <div class="summary-row total"><span>Total</span><span>£${total.toFixed(2)}</span></div>
      <button class="checkout-btn" onclick="checkout()">Proceed to Checkout</button>
      <p style="text-align:center;margin-top:12px;font-size:0.8rem;color:var(--text-muted);">
        Free shipping on orders over £100
      </p>
    `;
  }
}

function checkout() {
  const cart = getCart();
  if (cart.length === 0) return;

  if (!getCurrentUser()) {
    window.location.href = getAuthUrl('login', 'cart.html');
    return;
  }

  alert('Thank you for your order!\n\nThis is a demo store. In a real site this would go to a payment gateway.\n\nYour total: £' + (getCartTotal() + (getCartTotal() > 100 ? 0 : 9.99)).toFixed(2));
  localStorage.removeItem('dca_cart');
  updateCartCount();
  renderCartPage();
}

// ---- Mobile Menu ----
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.mobile-nav');
  const closeBtn = document.querySelector('.close-mobile');

  btn?.addEventListener('click', () => nav?.classList.add('open'));
  closeBtn?.addEventListener('click', () => nav?.classList.remove('open'));
  nav?.addEventListener('click', (e) => {
    if (e.target === nav) nav.classList.remove('open');
  });
}

// ---- Init on every page ----
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  initSlider();
  initSearch();
  initNewsletterSignup();
  initMobileMenu();
  initShopFilters();

  // Homepage featured products
  if (document.querySelector('#featured-products')) {
    renderProducts('#featured-products', products, 8);
  }

  // Shop page
  if (document.querySelector('#shop-products')) {
    // Check for search query
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.category.toLowerCase().includes(q.toLowerCase())
      );
      renderProducts('#shop-products', filtered);
      const searchInput = document.querySelector('.search-box input');
      if (searchInput) searchInput.value = q;
    } else {
      renderProducts('#shop-products', products);
    }
  }

  // Cart page
  if (document.querySelector('.cart-items')) {
    renderCartPage();
  }
});
