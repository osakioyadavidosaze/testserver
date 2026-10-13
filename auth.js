// ============================================
// Daniels Car Accessories - Auth System
// Client-side only (localStorage) - Demo purpose
// ============================================

const USERS_KEY = 'dca_users';
const SESSION_KEY = 'dca_session';

function getReturnTo() {
  const returnTo = new URLSearchParams(window.location.search).get('returnTo');
  if (!returnTo) return 'index.html';

  try {
    const url = new URL(returnTo, window.location.href);
    if (url.origin !== window.location.origin) return 'index.html';
    return url.pathname.replace(/^\/+/, '') + url.search + url.hash;
  } catch {
    return 'index.html';
  }
}

function getAuthUrl(page, returnTo = getReturnTo()) {
  return `${page}.html?returnTo=${encodeURIComponent(returnTo)}`;
}

// Get all registered users
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

// Save users list
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get current logged-in user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
}

// Save session
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Clear session (logout)
function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'index.html';
}

// Simple email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Sign up
function signup(name, email, password) {
  email = email.trim().toLowerCase();
  name = name.trim();

  if (!name || name.length < 2) {
    return { success: false, message: 'Please enter your full name' };
  }
  if (!isValidEmail(email)) {
    return { success: false, message: 'Please enter a valid email address' };
  }
  if (!password || password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' };
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'This email is already registered' };
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password, // Note: In real apps never store plain passwords
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  // Auto login after signup
  setSession({ id: newUser.id, name: newUser.name, email: newUser.email });

  return { success: true, message: 'Account created successfully!' };
}

// Login
function login(email, password) {
  email = email.trim().toLowerCase();

  if (!isValidEmail(email)) {
    return { success: false, message: 'Please enter a valid email address' };
  }
  if (!password) {
    return { success: false, message: 'Please enter your password' };
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }

  setSession({ id: user.id, name: user.name, email: user.email });
  return { success: true, message: 'Welcome back!' };
}

// Update header UI based on login state
function updateAuthUI() {
  const user = getCurrentUser();
  const authArea = document.querySelector('.auth-area');
  if (!authArea) return;

  if (user) {
    authArea.innerHTML = `
      <div class="user-menu">
        <span class="user-name">Hi, ${user.name.split(' ')[0]}</span>
        <button class="logout-btn" onclick="logout()">Logout</button>
      </div>
    `;
  } else {
    authArea.innerHTML = `
      <a href="login.html" class="auth-link">Login</a>
      <a href="signup.html" class="btn-signup">Sign Up</a>
    `;
  }
}

// Run on every page
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
});
