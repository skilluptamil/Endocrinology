/**
 * EndoCare - Admin Dashboard Interactive Logic
 * Features: Multi-Chart Analytics (Consultations & Specialty Mix), Table Live Search, Appointment Approvals, Message Inbox
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminCharts();
  initTableSearch();
  initAppointmentApprovals();
  initMessageActions();
});

function initAdminCharts() {
  // Monthly Consultations Line Chart
  const consultCtx = document.getElementById('adminConsultChart');
  if (consultCtx) {
    new Chart(consultCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [
          {
            label: 'Diabetes In-Clinic',
            data: [320, 380, 410, 460, 490, 520, 560, 590, 630, 680],
            backgroundColor: '#0284c7',
            borderRadius: 6
          },
          {
            label: 'Thyroid & Hormones',
            data: [180, 210, 230, 250, 270, 290, 310, 330, 360, 390],
            backgroundColor: '#0f766e',
            borderRadius: 6
          },
          {
            label: 'Telehealth Consults',
            data: [90, 120, 140, 160, 180, 210, 230, 260, 280, 310],
            backgroundColor: '#06b6d4',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, font: { family: "'Plus Jakarta Sans', sans-serif" } }
          }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, grid: { color: 'rgba(148, 163, 184, 0.15)' } }
        }
      }
    });
  }

  // Specialty Breakdown Doughnut Chart
  const specialtyCtx = document.getElementById('adminSpecialtyChart');
  if (specialtyCtx) {
    new Chart(specialtyCtx, {
      type: 'doughnut',
      data: {
        labels: ['Type 2 Diabetes', 'Type 1 & Pump Care', 'Thyroid Disorders', 'Metabolic & Obesity', 'PCOS & Hormones', 'Osteoporosis'],
        datasets: [{
          data: [42, 18, 16, 12, 8, 4],
          backgroundColor: ['#0284c7', '#0f766e', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899'],
          borderWidth: 2,
          borderColor: 'var(--bg-surface)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 12, font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } }
          }
        },
        cutout: '68%'
      }
    });
  }
}

function initTableSearch() {
  const searchInput = document.getElementById('patientTableSearch');
  if (!searchInput) return;

  searchInput.addEventListener('keyup', function() {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll('#patientTableBody tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(filter) ? '' : 'none';
    });
  });
}

function initAppointmentApprovals() {
  const approveBtns = document.querySelectorAll('.btn-approve-appointment');
  const rejectBtns = document.querySelectorAll('.btn-reject-appointment');

  approveBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const patientName = row.querySelector('.patient-name') ? row.querySelector('.patient-name').textContent.trim() : 'Patient';
      const statusBadge = row.querySelector('.appointment-status');

      if (statusBadge) {
        statusBadge.className = 'badge bg-success-subtle text-success border border-success appointment-status';
        statusBadge.textContent = 'Confirmed';
      }

      this.disabled = true;
      const rejectBtn = row.querySelector('.btn-reject-appointment');
      if (rejectBtn) rejectBtn.disabled = true;

      if (window.showToast) {
        window.showToast('Appointment Confirmed', `Appointment for ${patientName} marked as Confirmed.`, 'success');
      }
    });
  });

  rejectBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      const patientName = row.querySelector('.patient-name') ? row.querySelector('.patient-name').textContent.trim() : 'Patient';
      const statusBadge = row.querySelector('.appointment-status');

      if (statusBadge) {
        statusBadge.className = 'badge bg-danger-subtle text-danger border border-danger appointment-status';
        statusBadge.textContent = 'Cancelled';
      }

      this.disabled = true;
      const approveBtn = row.querySelector('.btn-approve-appointment');
      if (approveBtn) approveBtn.disabled = true;

      if (window.showToast) {
        window.showToast('Appointment Cancelled', `Appointment for ${patientName} marked as Cancelled.`, 'warning');
      }
    });
  });
}

function initMessageActions() {
  const markReadBtns = document.querySelectorAll('.btn-mark-read');

  markReadBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.enquiry-card');
      if (card) {
        card.classList.toggle('opacity-75');
        const badge = card.querySelector('.enquiry-badge');
        if (badge) {
          if (badge.textContent.includes('New')) {
            badge.className = 'badge bg-secondary-subtle text-secondary enquiry-badge';
            badge.textContent = 'Read';
            this.textContent = 'Mark Unread';
          } else {
            badge.className = 'badge bg-primary-subtle text-primary enquiry-badge';
            badge.textContent = 'New';
            this.textContent = 'Mark Read';
          }
        }
      }
    });
  });
}
