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
  if (pwdForm) {
    pwdForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const current = document.getElementById('currPassword').value;
      const newPwd = document.getElementById('newPassword').value;
      const confirmPwd = document.getElementById('confirmPassword').value;

      if (!current || !newPwd || !confirmPwd) {
        if (window.showToast) window.showToast('Missing Fields', 'Please complete all password fields.', 'warning');
        return;
      }

      if (newPwd !== confirmPwd) {
        if (window.showToast) window.showToast('Mismatch', 'New passwords do not match.', 'danger');
        return;
      }

      // Strong password validation
      const issues = [];
      if (newPwd.length < 8) issues.push('At least 8 characters');
      if (!/[A-Z]/.test(newPwd)) issues.push('At least 1 uppercase letter');
      if (!/[a-z]/.test(newPwd)) issues.push('At least 1 lowercase letter');
      if (!/\d/.test(newPwd)) issues.push('At least 1 number');
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPwd)) issues.push('At least 1 special character');

      if (issues.length > 0) {
        if (window.showToast) window.showToast('Weak Password Rejected', 'Password must satisfy: ' + issues.join(', '), 'warning');
        return;
      }

      pwdForm.reset();
      if (window.showToast) {
        window.showToast('Password Updated', 'Your account credentials have been updated securely.', 'success');
      }
    });
  }

  // Password Visibility Toggle Buttons
  const toggleBtns = document.querySelectorAll('.password-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = this.querySelector('i');
      if (input && icon) {
        if (input.type === 'password') {
          input.type = 'text';
          icon.className = 'bi bi-eye-slash';
        } else {
          input.type = 'password';
          icon.className = 'bi bi-eye';
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

