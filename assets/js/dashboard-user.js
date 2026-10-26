/**
 * EndoCare - User Dashboard Interactive Logic
 * Features:
 * 1. Profile information editing & local persistence
 * 2. Weekly steps & activity Chart.js integration
 * 3. Interactive hydration (water intake) tracker
 * 4. Account security settings (Password, 2FA, session revocation, eye toggle)
 * 5. Notification center & activity logging
 * 6. Bookmarked health articles management
 * 7. Mobile sidebar drawer with backdrop
 * 8. Sidebar smooth scrollspy navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  initUserProfileForm();
  initActivityChart();
  initWaterTracker();
  initSecuritySettings();
  initNotificationCenter();
  initBookmarks();
  initUserMobileSidebar();
  initSidebarScrollspy();
  initEditProfileTopbarAction();
  initUserProfilePdfDownload();
});

// 1. User Profile Editing & Persistence
function initUserProfileForm() {
  const profileForm = document.getElementById('userProfileForm');
  if (!profileForm) return;

  // Load saved profile if available
  const savedProfile = localStorage.getItem('endocare_user_profile');
  if (savedProfile) {
    try {
      const data = JSON.parse(savedProfile);
      if (data.firstName) document.getElementById('profFirstName').value = data.firstName;
      if (data.lastName) document.getElementById('profLastName').value = data.lastName;
      if (data.email) document.getElementById('profEmail').value = data.email;
      if (data.phone) document.getElementById('profPhone').value = data.phone;
      if (data.dob) document.getElementById('profDob').value = data.dob;
      if (data.gender) document.getElementById('profGender').value = data.gender;
      if (data.address) document.getElementById('profAddress').value = data.address;
      if (data.city) document.getElementById('profCity').value = data.city;
      if (data.language) document.getElementById('profLanguage').value = data.language;
      if (data.timezone) document.getElementById('profTimezone').value = data.timezone;
      if (data.emergencyName) document.getElementById('profEmergencyName').value = data.emergencyName;
      if (data.emergencyPhone) document.getElementById('profEmergencyPhone').value = data.emergencyPhone;

      // Update UI displays
      updateUserHeaderDisplays(data.firstName, data.lastName);
    } catch (e) {
      console.error('Error loading saved profile', e);
    }
  }

  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstName = document.getElementById('profFirstName').value.trim();
    const lastName = document.getElementById('profLastName').value.trim();
    const email = document.getElementById('profEmail').value.trim();
    const phone = document.getElementById('profPhone').value.trim();
    const dob = document.getElementById('profDob').value;
    const gender = document.getElementById('profGender').value;
    const address = document.getElementById('profAddress').value.trim();
    const city = document.getElementById('profCity').value.trim();
    const language = document.getElementById('profLanguage').value;
    const timezone = document.getElementById('profTimezone').value;
    const emergencyName = document.getElementById('profEmergencyName').value.trim();
    const emergencyPhone = document.getElementById('profEmergencyPhone').value.trim();

    const profileData = {
      firstName, lastName, email, phone, dob, gender,
      address, city, language, timezone, emergencyName, emergencyPhone
    };

    localStorage.setItem('endocare_user_profile', JSON.stringify(profileData));
    updateUserHeaderDisplays(firstName, lastName);

    if (window.showToast) {
      window.showToast('Profile Updated', 'Your personal details and contact settings have been saved successfully.', 'success');
    }
  });
}

function updateUserHeaderDisplays(first, last) {
  if (!first) return;
  const fullName = `${first} ${last || ''}`.trim();
  const nameDisplay = document.getElementById('userDisplayName');
  const topbarName = document.getElementById('topbarUserName');
  if (nameDisplay) nameDisplay.textContent = fullName;
  if (topbarName) topbarName.textContent = `Welcome back, ${fullName}`;
}

// Topbar "Edit Profile" button action
function initEditProfileTopbarAction() {
  const editBtn = document.getElementById('topbarEditProfileBtn');
  if (!editBtn) return;

  editBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const section = document.getElementById('personalDetailsSection');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      section.classList.add('highlight-pulse');
      setTimeout(() => section.classList.remove('highlight-pulse'), 2500);
    }
    const input = document.getElementById('profFirstName');
    if (input) {
      setTimeout(() => input.focus(), 350);
    }
    if (window.showToast) {
      window.showToast('Profile Editor', 'Personal profile form is focused and ready for editing.', 'info');
    }
  });
}

// 2. Weekly Activity Chart
function initActivityChart() {
  const ctx = document.getElementById('userActivityChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Daily Steps',
          data: [7800, 9200, 8420, 10400, 8900, 11200, 6900],
          backgroundColor: function(context) {
            const val = context.raw;
            return val >= 10000 ? '#10b981' : '#0284c7';
          },
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw;
              const status = val >= 10000 ? 'Goal Achieved!' : `${10000 - val} steps to goal`;
              return `${val.toLocaleString()} steps (${status})`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 12500,
          grid: { color: 'rgba(148, 163, 184, 0.15)' },
          title: { display: true, text: 'Steps' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

// 3. Hydration (Water) Tracker
function initWaterTracker() {
  const glasses = document.querySelectorAll('.water-glass-btn');
  const countDisplay = document.getElementById('waterCurrentMl');
  const percentDisplay = document.getElementById('waterPercentText');
  const progressBar = document.getElementById('waterProgressBar');

  if (!glasses.length) return;

  glasses.forEach((glass, index) => {
    glass.addEventListener('click', () => {
      const isFilled = glass.classList.contains('filled');
      
      glasses.forEach((g, i) => {
        if (isFilled && i >= index) {
          g.classList.remove('filled');
        } else if (!isFilled && i <= index) {
          g.classList.add('filled');
        }
      });

      const filledCount = document.querySelectorAll('.water-glass-btn.filled').length;
      const totalMl = filledCount * 250;
      const percent = Math.min(Math.round((totalMl / 3000) * 100), 100);

      if (countDisplay) countDisplay.textContent = `${totalMl.toLocaleString()} mL`;
      if (percentDisplay) percentDisplay.textContent = `${percent}% of 3,000 mL goal`;
      if (progressBar) progressBar.style.width = `${percent}%`;

      if (window.showToast) {
        window.showToast('Hydration Logged', `Logged ${totalMl} mL of daily water intake (${percent}% of goal).`, 'info');
      }
    });
  });
}

// 4. Account Security & Password
function initSecuritySettings() {
  const pwdForm = document.getElementById('changePasswordForm');
  const currInput = document.getElementById('currPassword');
  const newInput = document.getElementById('newPassword');
  const confirmInput = document.getElementById('confirmPassword');
  const alertBox = document.getElementById('passwordAlert');
  const strengthBar = document.getElementById('strengthBar');
  const strengthLabel = document.getElementById('strengthLabel');
  const confirmFeedback = document.getElementById('confirmFeedback');
  const btnReset = document.getElementById('btnResetPasswordForm');

  const critNumber = document.getElementById('critNumber');
  const critSpecial = document.getElementById('critSpecial');
  const critLength = document.getElementById('critLength');
  const critCases = document.getElementById('critCases');

  function evaluatePassword(pwd) {
    const hasLength = pwd.length >= 8;
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasCases = hasUpper && hasLower;

    return {
      hasLength,
      hasNumber,
      hasSpecial,
      hasCases,
      isValid: hasLength && hasNumber && hasSpecial && hasCases
    };
  }

  function updateCriteriaUI(res, pwd) {
    if (!critNumber || !critSpecial || !critLength || !critCases) return;

    function setItemState(el, isPassed) {
      const icon = el.querySelector('.criteria-icon');
      if (isPassed) {
        el.classList.add('valid');
        el.classList.remove('invalid', 'text-muted');
        if (icon) {
          icon.className = 'bi bi-check-circle-fill criteria-icon text-success';
        }
      } else {
        el.classList.remove('valid');
        el.classList.add('text-muted');
        if (icon) {
          icon.className = 'bi bi-circle criteria-icon text-muted';
        }
      }
    }

    setItemState(critNumber, res.hasNumber);
    setItemState(critSpecial, res.hasSpecial);
    setItemState(critLength, res.hasLength);
    setItemState(critCases, res.hasCases);

    // Update Strength Meter
    if (!strengthBar || !strengthLabel) return;

    if (!pwd || pwd.length === 0) {
      strengthBar.style.width = '0%';
      strengthBar.className = 'progress-bar';
      strengthLabel.textContent = 'Not Entered';
      strengthLabel.className = 'badge bg-secondary-subtle text-secondary fw-semibold';
      return;
    }

    let score = 0;
    if (res.hasLength) score += 25;
    if (res.hasNumber) score += 25;
    if (res.hasSpecial) score += 25;
    if (res.hasCases) score += 25;

    strengthBar.className = 'progress-bar';
    if (score <= 25) {
      strengthBar.style.width = '25%';
      strengthBar.classList.add('str-weak');
      strengthLabel.textContent = 'Weak';
      strengthLabel.className = 'badge bg-danger-subtle text-danger fw-semibold';
    } else if (score === 50) {
      strengthBar.style.width = '50%';
      strengthBar.classList.add('str-fair');
      strengthLabel.textContent = 'Fair';
      strengthLabel.className = 'badge bg-warning-subtle text-warning-emphasis fw-semibold';
    } else if (score === 75) {
      strengthBar.style.width = '75%';
      strengthBar.classList.add('str-good');
      strengthLabel.textContent = 'Good';
      strengthLabel.className = 'badge bg-info-subtle text-info fw-semibold';
    } else {
      strengthBar.style.width = '100%';
      strengthBar.classList.add('str-strong');
      strengthLabel.textContent = 'Strong & Secure';
      strengthLabel.className = 'badge bg-success-subtle text-success fw-semibold';
    }
  }

  function updateConfirmFeedback() {
    if (!confirmInput || !confirmFeedback) return;
    const newPwd = newInput ? newInput.value : '';
    const confirmPwd = confirmInput.value;

    if (!confirmPwd) {
      confirmFeedback.innerHTML = '<span class="text-muted"><i class="bi bi-info-circle me-1"></i>Re-type your new password to verify.</span>';
      confirmInput.classList.remove('is-valid', 'is-invalid');
      return;
    }

    if (confirmPwd === newPwd && newPwd.length > 0) {
      confirmFeedback.innerHTML = '<span class="text-success fw-semibold"><i class="bi bi-check-circle-fill me-1"></i> Passwords match perfectly.</span>';
      confirmInput.classList.add('is-valid');
      confirmInput.classList.remove('is-invalid');
    } else {
      confirmFeedback.innerHTML = '<span class="text-danger fw-semibold"><i class="bi bi-x-circle-fill me-1"></i> Passwords do not match.</span>';
      confirmInput.classList.add('is-invalid');
      confirmInput.classList.remove('is-valid');
    }
  }

  function showAlert(msg, type = 'danger') {
    if (!alertBox) return;
    alertBox.className = `alert alert-${type} py-2 px-3 mb-3 small d-block`;
    alertBox.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2"></i>${msg}`;
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.className = 'alert d-none py-2 px-3 mb-3 small';
    alertBox.innerHTML = '';
  }

  if (newInput) {
    newInput.addEventListener('input', () => {
      const pwd = newInput.value;
      const res = evaluatePassword(pwd);
      updateCriteriaUI(res, pwd);
      if (newInput.classList.contains('is-invalid') && res.isValid) {
        newInput.classList.remove('is-invalid');
        newInput.classList.add('is-valid');
      }
      if (confirmInput && confirmInput.value.length > 0) {
        updateConfirmFeedback();
      }
      hideAlert();
    });
  }

  if (confirmInput) {
    confirmInput.addEventListener('input', updateConfirmFeedback);
  }

  if (btnReset && pwdForm) {
    btnReset.addEventListener('click', () => {
      pwdForm.reset();
      hideAlert();
      if (newInput) newInput.classList.remove('is-valid', 'is-invalid');
      if (confirmInput) confirmInput.classList.remove('is-valid', 'is-invalid');
      if (currInput) currInput.classList.remove('is-valid', 'is-invalid');
      if (confirmFeedback) confirmFeedback.innerHTML = '';
      updateCriteriaUI(evaluatePassword(''), '');
    });
  }

  if (pwdForm) {
    pwdForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAlert();

      const current = currInput ? currInput.value.trim() : '';
      const newPwd = newInput ? newInput.value : '';
      const confirmPwd = confirmInput ? confirmInput.value : '';

      if (!current) {
        if (currInput) {
          currInput.classList.add('is-invalid');
          currInput.focus();
        }
        showAlert('Please enter your current password.', 'warning');
        if (window.showToast) window.showToast('Current Password Required', 'Please provide your current password to authorize changes.', 'warning');
        return;
      } else {
        if (currInput) currInput.classList.remove('is-invalid');
      }

      if (!newPwd) {
        if (newInput) {
          newInput.classList.add('is-invalid');
          newInput.focus();
        }
        showAlert('Please enter a new strong password.', 'warning');
        if (window.showToast) window.showToast('New Password Required', 'Please enter a new password.', 'warning');
        return;
      }

      const evalRes = evaluatePassword(newPwd);
      const missing = [];
      if (!evalRes.hasNumber) missing.push('at least 1 numerical digit (0-9)');
      if (!evalRes.hasSpecial) missing.push('at least 1 special character (!@#$%^&*)');
      if (!evalRes.hasLength) missing.push('minimum 8 characters');
      if (!evalRes.hasCases) missing.push('uppercase (A-Z) and lowercase (a-z) letters');

      if (missing.length > 0) {
        if (newInput) {
          newInput.classList.add('is-invalid');
          newInput.focus();
        }
        const errorMsg = `Password must contain: ${missing.join(', ')}.`;
        showAlert(errorMsg, 'danger');
        if (window.showToast) {
          window.showToast('Weak Password Rejected', `Password requirements not met: ${missing.join(', ')}.`, 'danger');
        }
        return;
      }

      if (newPwd === current) {
        if (newInput) {
          newInput.classList.add('is-invalid');
          newInput.focus();
        }
        showAlert('New password cannot be the same as your current password. Please choose a new password.', 'warning');
        if (window.showToast) {
          window.showToast('Reused Password', 'New password must be different from previous password.', 'warning');
        }
        return;
      }

      if (newPwd !== confirmPwd) {
        if (confirmInput) {
          confirmInput.classList.add('is-invalid');
          confirmInput.focus();
        }
        showAlert('New passwords do not match. Please verify and repeat accurately.', 'danger');
        if (window.showToast) {
          window.showToast('Password Mismatch', 'Confirm password does not match new password.', 'danger');
        }
        return;
      }

      // Successful password change
      if (newInput) {
        newInput.classList.remove('is-invalid');
        newInput.classList.add('is-valid');
      }
      if (confirmInput) {
        confirmInput.classList.remove('is-invalid');
        confirmInput.classList.add('is-valid');
      }

      showAlert('Password updated successfully! Your account credentials have been updated securely.', 'success');
      if (window.showToast) {
        window.showToast('Password Updated', 'Your account credentials have been updated securely with a strong password.', 'success');
      }

      // Persist demonstration change
      localStorage.setItem('endocare_password_updated', new Date().toISOString());

      setTimeout(() => {
        pwdForm.reset();
        if (newInput) newInput.classList.remove('is-valid', 'is-invalid');
        if (confirmInput) confirmInput.classList.remove('is-valid', 'is-invalid');
        if (currInput) currInput.classList.remove('is-valid', 'is-invalid');
        if (confirmFeedback) confirmFeedback.innerHTML = '';
        updateCriteriaUI(evaluatePassword(''), '');
        hideAlert();
      }, 2500);
    });
  }

  // Password Visibility Toggle Buttons
  const toggleBtns = document.querySelectorAll('.password-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = this.querySelector('i');
      if (input && icon) {
        if (input.type === 'password') {
          input.type = 'text';
          icon.className = 'bi bi-eye-slash';
          this.setAttribute('title', 'Hide Password');
        } else {
          input.type = 'password';
          icon.className = 'bi bi-eye';
          this.setAttribute('title', 'Show Password');
        }
      }
    });
  });

  // 2FA Switch
  const twoFactorSwitch = document.getElementById('twoFactorSwitch');
  if (twoFactorSwitch) {
    twoFactorSwitch.addEventListener('change', function() {
      if (this.checked) {
        if (window.showToast) {
          window.showToast('2FA Enabled', 'Two-Factor Authentication is now active. You will receive an SMS code on unrecognized sign-ins.', 'success');
        }
      } else {
        if (window.showToast) {
          window.showToast('2FA Disabled', 'Two-Factor Authentication has been disabled for this account.', 'warning');
        }
      }
    });
  }

  // Revoke Session Buttons
  const revokeBtns = document.querySelectorAll('.action-revoke-session');
  revokeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      if (row) {
        row.remove();
        if (window.showToast) {
          window.showToast('Session Revoked', 'The device session has been terminated successfully.', 'info');
        }
      }
    });
  });
}

// 5. Notification Center
function initNotificationCenter() {
  const markReadBtn = document.getElementById('markAllReadBtn');
  const badge = document.getElementById('unreadNotifyBadge');
  const items = document.querySelectorAll('.notify-item');

  if (markReadBtn) {
    markReadBtn.addEventListener('click', () => {
      items.forEach(item => {
        item.classList.remove('unread');
        const unreadDot = item.querySelector('.unread-dot');
        if (unreadDot) unreadDot.remove();
      });
      if (badge) badge.textContent = '0 Unread';
      if (window.showToast) {
        window.showToast('Notifications Cleared', 'All notifications marked as read.', 'info');
      }
    });
  }

  // Dismiss individual notifications
  const dismissBtns = document.querySelectorAll('.action-dismiss-notify');
  dismissBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const item = this.closest('.notify-item');
      if (item) {
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
        setTimeout(() => item.remove(), 300);
      }
    });
  });
}

// 6. Bookmarked Articles
function initBookmarks() {
  const removeBtns = document.querySelectorAll('.action-remove-bookmark');
  removeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.bookmark-card-col');
      if (card) {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => card.remove(), 300);
        if (window.showToast) {
          window.showToast('Bookmark Removed', 'Article removed from your saved reading list.', 'info');
        }
      }
    });
  });
}

// 7. Mobile Sidebar Drawer with Backdrop
function initUserMobileSidebar() {
  const sidebar = document.getElementById('userDashboardSidebar');
  const toggleBtn = document.getElementById('userSidebarToggleBtn');
  const closeBtn = document.getElementById('userSidebarCloseBtn');
  const backdrop = document.getElementById('dashboardBackdrop');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('show');
    if (backdrop) backdrop.classList.add('show');
    document.body.style.overflow = window.innerWidth < 992 ? 'hidden' : '';
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar && sidebar.classList.contains('show')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  // Close when clicking nav links on mobile
  const navLinks = sidebar ? sidebar.querySelectorAll('.sidebar-nav-link') : [];
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 992) {
        closeSidebar();
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) {
      closeSidebar();
    }
  });
}

// 8. Sidebar Scrollspy & Smooth Navigation
function initSidebarScrollspy() {
  const navLinks = document.querySelectorAll('.sidebar-nav-link[href^="#"]');
  if (!navLinks.length) return;

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  const sections = Array.from(navLinks).map(link => {
    const id = link.getAttribute('href');
    return id && id !== '#' ? document.querySelector(id) : null;
  }).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = `#${entry.target.id}`;
          navLinks.forEach(link => {
            if (link.getAttribute('href') === id) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -65% 0px',
      threshold: 0
    });

    sections.forEach(sec => observer.observe(sec));
  }
}

// 9. User Profile & Health Summary Real PDF Download
function initUserProfilePdfDownload() {
  const downloadBtn = document.getElementById('btnDownloadProfilePdf');
  if (!downloadBtn) return;

  downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const firstName = document.getElementById('profFirstName') ? document.getElementById('profFirstName').value : 'Johnathan';
    const lastName = document.getElementById('profLastName') ? document.getElementById('profLastName').value : 'Miller';
    const fullName = `${firstName} ${lastName}`.trim();
    const email = document.getElementById('profEmail') ? document.getElementById('profEmail').value : 'johnathan.miller@example.com';
    const phone = document.getElementById('profPhone') ? document.getElementById('profPhone').value : '+1 (555) 782-9912';
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    try {
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Title (User Profile & Wellness Summary) /Author (EndoCare Clinic) /CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}Z) >>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 5 0 R >>
endobj
5 0 obj
<< /Length 720 >>
stream
BT
/F1 18 Tf
50 740 Td
(ENDOCARE HEALTH CLINIC - USER PROFILE SUMMARY) Tj
/F2 10 Tf
0 -18 Td
(Account ID: #U-24810 | Verified Member | TLS 1.3 Certified) Tj
/F1 13 Tf
0 -36 Td
(ACCOUNT & PROFILE INFORMATION) Tj
/F2 11 Tf
0 -22 Td
(Full Legal Name: ${fullName}) Tj
0 -18 Td
(Primary Email: ${email}) Tj
0 -18 Td
(Primary Phone: ${phone}) Tj
0 -18 Td
(Date of Generation: ${dateStr}) Tj
0 -30 Td
(LIFESTYLE & GENERAL WELLNESS METRICS:) Tj
0 -18 Td
(- Daily Steps Target: 10,000 | Current Average: 8,420 steps) Tj
0 -16 Td
(- Daily Hydration: 2,250 mL logged of 3,000 mL goal [75%]) Tj
0 -16 Td
(- Sleep Quality: 7h 45m average [88% Sleep Efficiency rating]) Tj
0 -16 Td
(- Lifestyle Category: Low-to-Moderate Cardiovascular Strain) Tj
0 -30 Td
(SAVED CLINICAL LIBRARY ARTICLES:) Tj
0 -18 Td
(- Food Sequencing: Attenuating Postprandial Glucose Spikes) Tj
0 -16 Td
(- Beyond TSH: Full Free T3 and TPO Antibody Testing) Tj
0 -16 Td
(- Restoring Cortisol Awakening Rhythms Through Light Exposure) Tj
0 -30 Td
(NOTE: For official physician lab tests and continuous CGM data,) Tj
0 -16 Td
(please log in to the Customer Patient Portal.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000160 00000 n 
0000000217 00000 n 
0000000276 00000 n 
0000000499 00000 n 
trailer
<< /Size 6 /Root 2 0 R /Info 1 0 R >>
startxref
1290
%%EOF`;

      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = `endocare-profile-${fullName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

      if (window.showToast) {
        window.showToast('PDF Downloaded', `Successfully downloaded official profile summary for ${fullName}.`, 'success');
      }
    } catch (err) {
      console.error('PDF error:', err);
      if (window.showToast) {
        window.showToast('Download Error', 'Could not generate profile summary PDF.', 'danger');
      }
    }
  });
}

