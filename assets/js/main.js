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
  initClinicalSlider();
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
  const todayStr = new Date().toISOString().split('T')[0];

  // Restrict all appointment date fields from selecting past dates
  document.querySelectorAll('input[type="date"]:not(#profDob)').forEach(input => {
    input.setAttribute('min', todayStr);
    input.addEventListener('change', function() {
      if (this.value && this.value < todayStr) {
        showToast('Invalid Date', 'Appointment date cannot be in the past. Please select today or a future date.', 'danger');
        this.value = todayStr;
        this.classList.add('is-invalid');
      } else {
        this.classList.remove('is-invalid');
      }
    });
  });

  const appointmentForms = document.querySelectorAll('.appointment-booking-form, #appointmentModal form, form.appointment-form');

  appointmentForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const doctorSelect = form.querySelector('[name="doctor"]') || form.querySelector('select');
      const dateInput = form.querySelector('[name="date"]') || form.querySelector('input[type="date"]');
      const doctorName = doctorSelect && doctorSelect.selectedIndex >= 0 ? doctorSelect.options[doctorSelect.selectedIndex].text : 'Specialist';
      const appointmentDate = dateInput ? dateInput.value : '';

      if (!appointmentDate) {
        showToast('Date Required', 'Please select a date for your consultation.', 'warning');
        if (dateInput) {
          dateInput.focus();
          dateInput.classList.add('is-invalid');
        }
        return;
      }

      if (appointmentDate < todayStr) {
        showToast('Invalid Date', 'Appointment date cannot be in the past. Please select today or a future date.', 'danger');
        if (dateInput) {
          dateInput.focus();
          dateInput.classList.add('is-invalid');
        }
        return;
      }

      if (dateInput) dateInput.classList.remove('is-invalid');

      // Close modal if open
      const modalEl = form.closest('.modal');
      if (modalEl && window.bootstrap) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        if (modalInstance) modalInstance.hide();
      }

      showToast(
        'Appointment Request Confirmed', 
        `Your consultation request with ${doctorName} on ${appointmentDate} has been confirmed. Our clinic intake coordinator will contact you shortly!`,
        'success'
      );

      form.reset();
      if (dateInput) dateInput.setAttribute('min', todayStr);
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

/* -------------------------------------------------------------
   Interactive Clinical Glycemic Slider (A1c -> eAG Converter)
   ------------------------------------------------------------- */
function initClinicalSlider() {
  const slider = document.getElementById('a1cRangeSlider');
  if (!slider) return;

  const a1cDisplay = document.getElementById('sliderA1cDisplay');
  const eagDisplay = document.getElementById('sliderEagDisplay');
  const tirDisplay = document.getElementById('sliderTirDisplay');
  const riskBadge = document.getElementById('sliderRiskBadge');
  const adviceTitle = document.getElementById('sliderAdviceTitle');
  const adviceDesc = document.getElementById('sliderAdviceDesc');

  function updateSlider() {
    const val = parseFloat(slider.value);
    if (isNaN(val)) return;

    // Display formatted A1c
    if (a1cDisplay) a1cDisplay.textContent = `${val.toFixed(1)}%`;

    // ADA formula: eAG (mg/dL) = 28.7 * A1c - 46.7
    const eag = Math.round(28.7 * val - 46.7);
    if (eagDisplay) eagDisplay.textContent = eag;

    // Estimated Time-in-Range (TIR)
    const tir = Math.max(15, Math.min(96, Math.round(100 - (val - 5.0) * 10.2)));
    if (tirDisplay) tirDisplay.textContent = `${tir}%`;

    // Update classification, badges, and recommendations
    if (val < 5.7) {
      if (riskBadge) {
        riskBadge.textContent = 'Normal Glycemia';
        riskBadge.className = 'badge bg-success text-white';
      }
      if (adviceTitle) adviceTitle.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i> Optimal Metabolic Health';
      if (adviceDesc) adviceDesc.textContent = `At ${val.toFixed(1)}% HbA1c, your average daily glucose is approximately ${eag} mg/dL. Your metabolic biomarkers are within healthy non-diabetic ranges.`;
    } else if (val < 6.5) {
      if (riskBadge) {
        riskBadge.textContent = 'Prediabetes Range';
        riskBadge.className = 'badge bg-info text-white';
      }
      if (adviceTitle) adviceTitle.innerHTML = '<i class="bi bi-info-circle-fill text-info"></i> Prediabetes Warning Zone';
      if (adviceDesc) adviceDesc.textContent = `At ${val.toFixed(1)}% HbA1c (eAG: ${eag} mg/dL), cellular insulin resistance is active. Nutrition coaching and lifestyle adjustments can halt progression to full diabetes.`;
    } else if (val <= 7.0) {
      if (riskBadge) {
        riskBadge.textContent = 'ADA Target Goal Met';
        riskBadge.className = 'badge bg-success text-white';
      }
      if (adviceTitle) adviceTitle.innerHTML = '<i class="bi bi-shield-check text-success"></i> Target Glycemic Control Achieved';
      if (adviceDesc) adviceDesc.textContent = `At ${val.toFixed(1)}% HbA1c (eAG: ${eag} mg/dL), you are within the American Diabetes Association standard target to halt microvascular damage.`;
    } else if (val <= 8.5) {
      if (riskBadge) {
        riskBadge.textContent = 'Suboptimal Control';
        riskBadge.className = 'badge bg-warning text-dark';
      }
      if (adviceTitle) adviceTitle.innerHTML = '<i class="bi bi-exclamation-triangle-fill text-warning"></i> Elevated Glycemic Variability';
      if (adviceDesc) adviceDesc.textContent = `At ${val.toFixed(1)}% HbA1c, your average daily glucose runs near ${eag} mg/dL. Sensor telemetry and therapy recalibration can safely guide you back to target.`;
    } else {
      if (riskBadge) {
        riskBadge.textContent = 'High Microvascular Risk';
        riskBadge.className = 'badge bg-danger text-white';
      }
      if (adviceTitle) adviceTitle.innerHTML = '<i class="bi bi-shield-exclamation text-danger"></i> Urgent Clinical Attention Advised';
      if (adviceDesc) adviceDesc.textContent = `At ${val.toFixed(1)}% HbA1c (eAG: ${eag} mg/dL), arterial endothelium and renal podocytes face sustained oxidative stress. Prompt specialist care is essential.`;
    }
  }

  slider.addEventListener('input', updateSlider);
  slider.addEventListener('change', updateSlider);
  updateSlider();
}

