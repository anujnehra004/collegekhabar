/**
 * ==========================================================================
 * CAMPUS CONNECT - UI CONTROLLER & INTERACTION HELPERS
 * js/ui.js
 * Toast notifications, Modals, Counters, Scroll Animations & Navbars
 * ==========================================================================
 */

// Toast Notifications System
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || 'ℹ'}</span>
    <span class="toast-msg">${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, duration);
}

// Counter Animation for Numbers
function animateCounter(element, target, duration = 1600) {
  if (!element) return;
  const start = 0;
  const startTime = performance.now();
  const targetStr = String(target);
  const isPlus = targetStr.includes('+');
  const numericTarget = parseInt(targetStr.replace(/\D/g, ''), 10) || 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease-out cubic calculation
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.floor(easeOut * numericTarget);

    element.textContent = `${currentVal}${isPlus ? '+' : ''}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = targetStr;
    }
  }

  requestAnimationFrame(update);
}

// Setup Scroll Reveal with IntersectionObserver
function setupScrollReveal() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    elements.forEach(el => el.classList.add('is-revealed'));
  }
}

// Setup Dialogs with Light-Dismiss Fallback (Compliant with Modern Web Guidance)
function setupModals() {
  document.querySelectorAll('dialog').forEach(dialog => {
    // Light-dismiss fallback for browsers without native closedby support
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isDialogContent) {
          dialog.close();
        }
      });
    }

    // Connect close buttons with data-dismiss="dialog"
    dialog.querySelectorAll('[data-dismiss="dialog"]').forEach(btn => {
      btn.addEventListener('click', () => dialog.close());
    });
  });
}

// Mobile Navigation Drawer Toggle
function setupMobileNav() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', navLinks.classList.contains('is-open'));
    });

    // Close when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
      });
    });
  }
}

// Update Top Navigation Bar Based on Auth Session
async function updateNavAuthUI() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  const sessionData = await authManager.getCurrentUser();
  const user = sessionData?.user;

  if (user) {
    const profile = await authManager.getUserProfile();
    const displayName = profile?.name || user.user_metadata?.name || user.email.split('@')[0];
    const role = profile?.role || user.user_metadata?.role || 'student';
    const firstInitial = displayName.charAt(0).toUpperCase();

    const dashboardLink = role === 'admin' ? 'admin-dashboard.html' : 'my-events.html';
    const dashboardLabel = role === 'admin' ? 'Admin Portal' : 'My Events';

    navActions.innerHTML = `
      <a href="${dashboardLink}" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
        <span>${dashboardLabel}</span>
      </a>
      <div class="user-menu-btn" onclick="location.href='profile.html'" title="View Profile">
        <div class="user-avatar">${firstInitial}</div>
        <span class="user-name">${displayName}</span>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="authManager.logout()" title="Logout" style="color: #fda4af;">
        Logout
      </button>
    `;
  } else {
    navActions.innerHTML = `
      <a href="login.html" class="btn btn-ghost btn-sm">Login</a>
      <a href="signup.html" class="btn btn-primary btn-sm">Get Started</a>
    `;
  }
}

// Render Configuration Notice Banner if in Demo Mode
function renderDemoNotice() {
  if (!isSupabaseConfigured() && !document.querySelector('.demo-banner')) {
    const banner = document.createElement('div');
    banner.className = 'demo-banner';
    banner.innerHTML = `
      <span>⚡ <strong>Evaluation Demo Mode Active:</strong> Add your live credentials in <code>js/supabase.js</code> to connect real Supabase instance.</span>
      <a href="README.md" target="_blank" style="text-decoration: underline; font-weight: 600;">View Setup Guide</a>
    `;
    document.body.prepend(banner);
  }
}

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  setupScrollReveal();
  setupModals();
  setupMobileNav();
  renderDemoNotice();
  if (window.authManager) {
    updateNavAuthUI();
  }
});
