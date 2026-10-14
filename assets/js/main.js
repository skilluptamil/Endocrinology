/**
 * EndoCare - Main JavaScript File
 * Manages Theme (Dark/Light), RTL layout, Active Navigation, Toasts, and Appointment Booking
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRTL();
  initActiveNav();
  initToastSystem();
  initAppointmentBookingModal();
  initScrollTop();
  initScrollReveal();
  initCounterAnimation();
});

/* -------------------------------------------------------------
   Theme Management (Light / Dark Mode with LocalStorage)
   ------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const savedTheme = localStorage.getItem('endocare_theme') || 'light';
  
  applyTheme(savedTheme);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      showToast('Theme Updated', `Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('endocare_theme', theme);

  const themeIcons = document.querySelectorAll('.theme-toggle-btn i');
  themeIcons.forEach(icon => {
    if (theme === 'dark') {
      icon.className = 'bi bi-sun-fill text-warning';
    } else {
      icon.className = 'bi bi-moon-stars-fill';
    }
  });
}

/* -------------------------------------------------------------
   RTL Layout Management (LTR / RTL with LocalStorage)
   ------------------------------------------------------------- */
function initRTL() {
  const rtlToggleBtns = document.querySelectorAll('.rtl-toggle-btn');
  const savedDir = localStorage.getItem('endocare_dir') || 'ltr';

  applyDirection(savedDir);

  rtlToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      applyDirection(newDir);
      showToast('Direction Changed', `Layout set to ${newDir.toUpperCase()}`, 'info');
    });
  });
}

function applyDirection(dir) {
  document.documentElement.setAttribute('dir', dir);
  localStorage.setItem('endocare_dir', dir);

  const rtlBadges = document.querySelectorAll('.rtl-toggle-btn .rtl-text');
  rtlBadges.forEach(badge => {
    badge.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
  });
}

/* -------------------------------------------------------------
   Active Navigation Highlighter
   ------------------------------------------------------------- */
function initActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .dropdown-item');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Normalize path comparison
    const linkPath = href.split('/').pop();
    if (linkPath === currentPath) {
      link.classList.add('active');
      
      // If it's inside dropdown, highlight parent dropdown toggle
      const parentDropdown = link.closest('.dropdown');
      if (parentDropdown) {
        const toggle = parentDropdown.querySelector('.dropdown-toggle');
        if (toggle) toggle.classList.add('active');
      }
    }
  });
}

/* -------------------------------------------------------------
   Toast Notification System
   ------------------------------------------------------------- */
let toastContainer;

function initToastSystem() {
  toastContainer = document.querySelector('.toast-container-custom');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container-custom';
    document.body.appendChild(toastContainer);
  }
}

function showToast(title, message, type = 'primary') {
  if (!toastContainer) initToastSystem();

  const toastId = 'toast-' + Date.now();
  const iconMap = {
    primary: 'bi-info-circle-fill text-primary',
    success: 'bi-check-circle-fill text-success',
    warning: 'bi-exclamation-triangle-fill text-warning',
    danger: 'bi-x-circle-fill text-danger',
    info: 'bi-bell-fill text-info'
  };

  const iconClass = iconMap[type] || iconMap.primary;

  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center text-bg-surface border shadow-lg show mb-2" role="alert" aria-live="assertive" aria-atomic="true" style="min-width: 300px; border-radius: 12px; background: var(--bg-surface); color: var(--text-main);">
      <div class="toast-header border-bottom" style="background: var(--bg-surface-elevated); color: var(--text-heading); border-radius: 12px 12px 0 0;">
        <i class="bi ${iconClass} me-2 fs-5"></i>
        <strong class="me-auto">${title}</strong>
        <small class="text-muted">Just now</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML('beforeend', toastHtml);

  const toastEl = document.getElementById(toastId);
  setTimeout(() => {
    if (toastEl) {
      toastEl.classList.remove('show');
      setTimeout(() => toastEl.remove(), 400);
    }
  }, 4500);

  const closeBtn = toastEl.querySelector('.btn-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toastEl.remove();
    });
  }
}

// Make showToast globally available
window.showToast = showToast;

/* -------------------------------------------------------------
   Appointment Booking Modal Handler
   ------------------------------------------------------------- */
function initAppointmentBookingModal() {
  const bookingForms = document.querySelectorAll('.appointment-booking-form');

  bookingForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const doctorSelect = form.querySelector('[name="doctor"]');
      const dateInput = form.querySelector('[name="date"]');
      const doctorName = doctorSelect ? doctorSelect.options[doctorSelect.selectedIndex].text : 'Specialist';
      const appointmentDate = dateInput ? dateInput.value : 'Selected Date';

      // Close modal if open
      const modalEl = form.closest('.modal');
      if (modalEl && window.bootstrap) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
      }

      showToast(
        'Appointment Request Received', 
        `Your consultation request with ${doctorName} on ${appointmentDate} has been scheduled (Demo). Our clinic coordinator will contact you shortly!`,
        'success'
      );

      form.reset();
    });
  });
}

/* -------------------------------------------------------------
   Scroll to Top
   ------------------------------------------------------------- */
function initScrollTop() {
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'btn btn-primary-custom shadow-lg position-fixed';
  scrollBtn.style.cssText = 'bottom: 25px; left: 25px; z-index: 999; width: 44px; height: 44px; padding: 0; border-radius: 50%; display: none;';
  scrollBtn.innerHTML = '<i class="bi bi-chevron-up"></i>';
  scrollBtn.setAttribute('title', 'Scroll to Top');
  document.body.appendChild(scrollBtn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      scrollBtn.style.display = 'inline-flex';
    } else {
      scrollBtn.style.display = 'none';
    }
  });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* -------------------------------------------------------------
   Scroll Reveal Animations
   ------------------------------------------------------------- */
function initScrollReveal() {
  const animatedSelectors = [
    '.card-custom',
    '.doctor-card',
    '.pricing-card',
    '.blog-card',
    '.service-card',
    '.section-header',
    '.stat-card-custom'
  ];

  const elements = document.querySelectorAll(animatedSelectors.join(', '));
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach((el) => {
    el.classList.add('reveal-on-scroll');
    const parentRow = el.closest('.row');
    if (parentRow) {
      const colEl = el.closest('[class*="col"]') || el;
      const colIndex = Array.from(parentRow.children).indexOf(colEl);
      if (colIndex > 0) {
        el.style.transitionDelay = `${(colIndex % 4) * 0.12}s`;
      }
    }
    observer.observe(el);
  });
}

/* -------------------------------------------------------------
   Animated Counter Numbers for Clinic Statistics
   ------------------------------------------------------------- */
function initCounterAnimation() {
  const statContainers = document.querySelectorAll('.stats-section, .hero-section, .stat-card-custom, [class*="metrics"]');
  const counters = [];
  
  statContainers.forEach(container => {
    const found = container.querySelectorAll('.counter-anim, .stat-number, h3.fw-bold, h2.fw-bold');
    found.forEach(c => counters.push(c));
  });

  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  counters.forEach(counter => {
    const text = counter.innerText.trim();
    if (/\d+/.test(text) && !counter.dataset.counterProcessed) {
      counter.dataset.counterProcessed = "true";
      counter.dataset.originalText = text;
      observer.observe(counter);
    }
  });
}

function animateCounter(el) {
  const original = el.dataset.originalText;
  const match = original.match(/([^\d]*)([\d,.]+)([^\d]*)/);
  if (!match) return;

  const prefix = match[1] || '';
  const numStr = match[2].replace(/,/g, '');
  const suffix = match[3] || '';
  const target = parseFloat(numStr);
  const isFloat = numStr.includes('.');
  const duration = 1500;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = target * easeProgress;
    
    let formatted = isFloat ? current.toFixed(1) : Math.round(current).toLocaleString();
    el.innerText = `${prefix}${formatted}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.innerText = original;
    }
  }

  requestAnimationFrame(update);
}
