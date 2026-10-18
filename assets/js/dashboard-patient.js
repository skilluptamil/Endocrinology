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
