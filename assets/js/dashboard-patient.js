/**
 * EndoCare - Patient / Customer Dashboard Interactive Logic
 * Features:
 * 1. Chart.js Glucose Tracking (Fasting vs 2-Hr Post-Meal)
 * 2. Blood Sugar Logger Modal with live graph & table update
 * 3. Daily Medication Tracker with dynamic progress bar
 * 4. Appointment management (Reschedule, Cancel, Book)
 * 5. Lab Reports Download Simulation
 * 6. Mobile Sidebar Drawer with Backdrop
 * 7. Sidebar Scrollspy Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  initGlucoseChart();
  initGlucoseLogger();
  initMedicationTracker();
  initPatientActions();
  initCustomerMobileSidebar();
  initSidebarScrollspy();
  initPatientPasswordSecurity();
});

let glucoseChart = null;
const glucoseData = {
  labels: ['Mon 08', 'Tue 09', 'Wed 10', 'Thu 11', 'Fri 12', 'Sat 13', 'Sun 14'],
  fasting: [108, 112, 105, 115, 110, 107, 104],
  postMeal: [142, 155, 138, 160, 148, 145, 139]
};

// 1. Glucose Trends Chart
function initGlucoseChart() {
  const ctx = document.getElementById('glucoseChart');
  if (!ctx) return;

  glucoseChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: glucoseData.labels,
      datasets: [
        {
          label: 'Fasting Blood Sugar (mg/dL)',
          data: glucoseData.fasting,
          borderColor: '#0284c7',
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#0284c7',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: '2-Hr Post-Meal Glucose (mg/dL)',
          data: glucoseData.postMeal,
          borderColor: '#0f766e',
          backgroundColor: 'rgba(15, 118, 110, 0.05)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#0f766e',
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y} mg/dL`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 70,
          max: 200,
          grid: {
            color: 'rgba(148, 163, 184, 0.15)'
          },
          title: {
            display: true,
            text: 'Glucose (mg/dL)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// 2. Glucose Reading Logger Form
function initGlucoseLogger() {
  const logForm = document.getElementById('glucoseLogForm');
  if (!logForm) return;

  logForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const dateVal = document.getElementById('glucoseDate').value.trim() || 'Today';
    const timeVal = document.getElementById('glucoseTime').value.trim() || '12:30 PM';
    const typeVal = document.getElementById('glucoseType').value;
    const readingVal = parseInt(document.getElementById('glucoseValue').value, 10);
    const notesVal = document.getElementById('glucoseNotes').value.trim() || 'Routine check';

    if (isNaN(readingVal) || readingVal < 40 || readingVal > 500) {
      if (window.showToast) {
        window.showToast('Invalid Reading', 'Please enter a valid glucose reading between 40 and 500 mg/dL.', 'warning');
      }
      return;
    }

    // Determine status badge
    let statusBadge = '<span class="badge bg-success-subtle text-success border border-success">Normal</span>';
    if (readingVal > 140) {
      statusBadge = '<span class="badge bg-warning-subtle text-warning border border-warning">Elevated</span>';
    }
    if (readingVal > 180) {
      statusBadge = '<span class="badge bg-danger-subtle text-danger border border-danger">High</span>';
    }

    // Prepend to Glucose Log Table
    const tableBody = document.getElementById('glucoseLogTableBody');
    if (tableBody) {
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td class="fw-semibold">${dateVal} <small class="text-muted d-block">${timeVal}</small></td>
        <td><span class="badge bg-primary-subtle text-primary">${typeVal}</span></td>
        <td class="fw-bold">${readingVal} <small class="text-muted">mg/dL</small></td>
        <td>${statusBadge}</td>
        <td class="text-muted small">${notesVal}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger py-0 px-2 delete-reading-btn" title="Delete entry">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tableBody.insertBefore(newRow, tableBody.firstChild);

      newRow.querySelector('.delete-reading-btn').addEventListener('click', () => {
        newRow.remove();
        if (window.showToast) window.showToast('Entry Removed', 'Glucose reading entry deleted.', 'info');
      });
    }

    // Update Live Chart
    if (glucoseChart) {
      glucoseData.labels.push('Now');
      if (typeVal.toLowerCase().includes('fasting')) {
        glucoseData.fasting.push(readingVal);
        glucoseData.postMeal.push(null);
      } else {
        glucoseData.fasting.push(null);
        glucoseData.postMeal.push(readingVal);
      }
      if (glucoseData.labels.length > 9) {
        glucoseData.labels.shift();
        glucoseData.fasting.shift();
        glucoseData.postMeal.shift();
      }
      glucoseChart.update();
    }

    // Close modal cleanly
    const modalEl = document.getElementById('logReadingModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      if (modal) modal.hide();
    }

    logForm.reset();
    if (window.showToast) {
      window.showToast('Reading Logged', `Logged ${readingVal} mg/dL (${typeVal}) successfully! Chart updated.`, 'success');
    }
  });
}

// 3. Daily Medication Tracker
function initMedicationTracker() {
  const medBtns = document.querySelectorAll('.toggle-med-btn');

  medBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const item = this.closest('.med-item');
      if (!item) return;
      const badge = item.querySelector('.med-status-badge');

      if (item.classList.contains('taken')) {
        item.classList.remove('taken');
        if (badge) {
          badge.className = 'badge bg-warning-subtle text-warning med-status-badge';
          badge.textContent = 'Pending';
        }
        this.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Mark Taken';
        this.classList.remove('btn-outline-secondary');
        this.classList.add('btn-outline-primary');
        if (window.showToast) window.showToast('Medication Status', 'Marked as Pending', 'info');
      } else {
        item.classList.add('taken');
        if (badge) {
          badge.className = 'badge bg-success-subtle text-success med-status-badge';
          badge.textContent = 'Taken at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        this.innerHTML = '<i class="bi bi-arrow-counterclockwise me-1"></i> Undo';
        this.classList.remove('btn-outline-primary');
        this.classList.add('btn-outline-secondary');
        if (window.showToast) window.showToast('Medication Taken', 'Logged dose intake successfully!', 'success');
      }

      updateMedProgress();
    });
  });
}

function updateMedProgress() {
  const total = document.querySelectorAll('.med-item').length;
  const taken = document.querySelectorAll('.med-item.taken').length;
  const percent = total > 0 ? Math.round((taken / total) * 100) : 0;
  
  const progressBar = document.getElementById('medProgressBar');
  const progressText = document.getElementById('medProgressText');

  if (progressBar) {
    progressBar.style.width = `${percent}%`;
    progressBar.setAttribute('aria-valuenow', percent);
  }
  if (progressText) {
    progressText.textContent = `${taken} of ${total} doses taken (${percent}%)`;
  }
}

// 4. Patient Action Feedback (Reschedule, Cancel, Downloads)
function initPatientActions() {
  const rescheduleBtns = document.querySelectorAll('.action-reschedule');
  rescheduleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.showToast) {
        window.showToast('Reschedule Request', 'Rescheduling request forwarded to clinical coordinator.', 'info');
      }
    });
  });

  const cancelBtns = document.querySelectorAll('.action-cancel-appointment');
  cancelBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.col-12, .col-md-6, .med-item');
      if (confirm('Are you sure you want to cancel this scheduled clinical consultation?')) {
        if (card) {
          card.style.opacity = '0.4';
          btn.textContent = 'Cancelled';
          btn.setAttribute('disabled', 'true');
        }
        if (window.showToast) {
          window.showToast('Appointment Cancelled', 'Your consultation has been cancelled.', 'warning');
        }
      }
    });
  });

  const downloadBtns = document.querySelectorAll('.action-download-report');
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const parentRow = btn.closest('.p-3');
      const titleEl = parentRow ? parentRow.querySelector('h6') : null;
      const reportTitle = titleEl ? titleEl.textContent.trim() : 'Comprehensive-Clinical-Report';
      const patientName = 'Eleanor Vance (Patient ID: #P-84920)';
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      const success = generateAndDownloadClinicalPdf(reportTitle, patientName, dateStr);
      if (success && window.showToast) {
        window.showToast('PDF Downloaded', `Successfully downloaded encrypted lab report: ${reportTitle}.pdf`, 'success');
      } else if (!success && window.showToast) {
        window.showToast('Download Error', 'Could not generate report file in browser. Please check browser permissions.', 'danger');
      }
    });
  });
}

function generateAndDownloadClinicalPdf(reportTitle, patientName, dateStr) {
  try {
    const safeTitle = reportTitle.replace(/[^\w\s-]/g, '').trim();
    const pdfSource = `%PDF-1.4
1 0 obj
<< /Title (${safeTitle}) /Author (EndoCare Center of Excellence) /Subject (Clinical Diagnostic Report) /CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}Z) >>
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
<< /Length 750 >>
stream
BT
/F1 18 Tf
50 740 Td
(ENDOCARE CENTER OF EXCELLENCE IN ENDOCRINOLOGY) Tj
/F2 10 Tf
0 -18 Td
(742 Evergreen Medical Blvd, Suite 400, Metro Health City | Tel: +1 800-555-ENDO) Tj
/F1 14 Tf
0 -36 Td
(${safeTitle}) Tj
/F2 11 Tf
0 -22 Td
(Patient Name: ${patientName}) Tj
0 -18 Td
(Date of Report: ${dateStr}) Tj
0 -18 Td
(Attending Physician: Dr. Sarah Jenkins, MD, FACE) Tj
0 -18 Td
(Accreditation: College of American Pathologists & CLIA Certified) Tj
0 -30 Td
(CLINICAL BIOMARKERS SUMMARY:) Tj
0 -18 Td
(- Glycated Hemoglobin [HbA1c]: 6.4% [Optimal Range: < 7.0%]) Tj
0 -16 Td
(- Fasting Blood Sugar: 104 mg/dL [Target: 70-130 mg/dL]) Tj
0 -16 Td
(- Continuous Glucose Monitor Time-in-Range: 82% [ADA Goal > 70%]) Tj
0 -16 Td
(- Fasting Serum Insulin: 8.2 uIU/mL [Normal: 2.6-24.9 uIU/mL]) Tj
0 -16 Td
(- Estimated Average Glucose [eAG]: 137 mg/dL) Tj
0 -16 Td
(- Thyroid Panel: TSH 1.85 mIU/L | Free T3: 3.2 pg/mL | Free T4: 1.25 ng/dL) Tj
0 -16 Td
(- Urinary Albumin-to-Creatinine Ratio: 14 mcg/mg [Normal < 30 mcg/mg]) Tj
0 -30 Td
(PHYSICIAN CLINICAL ASSESSMENT & PLAN:) Tj
0 -16 Td
(Patient demonstrates excellent glycemic stability with minimal hypoglycemia excursions.) Tj
0 -16 Td
(Maintain current Dexcom G7 continuous sensor monitoring and current pharmacotherapy.) Tj
0 -16 Td
(Next scheduled clinical consultation: 90 days.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000185 00000 n 
0000000242 00000 n 
0000000301 00000 n 
0000000524 00000 n 
trailer
<< /Size 6 /Root 2 0 R /Info 1 0 R >>
startxref
1330
%%EOF`;

    const blob = new Blob([pdfSource], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    const filename = `${safeTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-6)}.pdf`;
    downloadAnchor.href = blobUrl;
    downloadAnchor.download = filename;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    return true;
  } catch (err) {
    console.error('PDF creation error:', err);
    return false;
  }
}

// 5. Mobile Sidebar Drawer with Backdrop
function initCustomerMobileSidebar() {
  const sidebar = document.getElementById('dashboardSidebar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const closeBtn = document.getElementById('sidebarCloseBtn');
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

// 6. Sidebar Scrollspy & Smooth Navigation
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

// 7. Patient Dashboard - Change Password Security & Live Criteria Check
function initPatientPasswordSecurity() {
  const pwdForm = document.getElementById('patientChangePasswordForm');
  if (!pwdForm) return;

  const currInput = document.getElementById('patientCurrPassword');
  const newInput = document.getElementById('patientNewPassword');
  const confirmInput = document.getElementById('patientConfirmPassword');
  const alertBox = document.getElementById('patientPasswordAlert');
  const strengthBar = document.getElementById('patientStrengthBar');
  const strengthLabel = document.getElementById('patientStrengthLabel');
  const confirmFeedback = document.getElementById('patientConfirmFeedback');

  const critNumber = document.getElementById('patientCritNumber');
  const critSpecial = document.getElementById('patientCritSpecial');
  const critLength = document.getElementById('patientCritLength');
  const critCases = document.getElementById('patientCritCases');

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
      if (window.showToast) window.showToast('Current Password Required', 'Please enter your current password.', 'warning');
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
      showAlert('New password cannot be the same as your current password.', 'warning');
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
      showAlert('New passwords do not match. Please verify and re-enter.', 'danger');
      if (window.showToast) {
        window.showToast('Password Mismatch', 'Confirm password does not match new password.', 'danger');
      }
      return;
    }

    // Success
    showAlert('Password updated successfully! Your account credentials have been updated securely.', 'success');
    if (window.showToast) {
      window.showToast('Password Updated', 'Your portal credentials have been updated securely.', 'success');
    }

    setTimeout(() => {
      const modalEl = document.getElementById('patientChangePasswordModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
      pwdForm.reset();
      if (newInput) newInput.classList.remove('is-valid', 'is-invalid');
      if (confirmInput) confirmInput.classList.remove('is-valid', 'is-invalid');
      if (currInput) currInput.classList.remove('is-valid', 'is-invalid');
      if (confirmFeedback) confirmFeedback.innerHTML = '';
      updateCriteriaUI(evaluatePassword(''), '');
      hideAlert();
    }, 1800);
  });

  // Password Visibility Toggle Buttons in Modal
  const toggleBtns = pwdForm.querySelectorAll('.password-toggle-btn');
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
}
