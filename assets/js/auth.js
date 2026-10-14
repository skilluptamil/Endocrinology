/**
 * EndoCare - Authentication Scripts
 * Handles Password visibility toggle, demo login, demo registration, forgot password, and reset password flows.
 */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initLoginForm();
  initRegisterForm();
  initForgotForm();
  initResetForm();
  initSocialAuthDemo();
});

function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const targetInputId = this.getAttribute('data-target');
      const input = document.getElementById(targetInputId) || this.previousElementSibling;

      if (!input) return;

      const icon = this.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.className = 'bi bi-eye-slash';
      } else {
        input.type = 'password';
        if (icon) icon.className = 'bi bi-eye';
      }
    });
  });
}

function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  const roleCustomerRadio = document.getElementById('roleCustomer');
  const roleUserRadio = document.getElementById('roleUser');
  const emailInput = document.getElementById('loginEmail');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const targetPortalInput = document.getElementById('loginTargetPortal');

  if (roleCustomerRadio && roleUserRadio) {
    roleCustomerRadio.addEventListener('change', () => {
      if (roleCustomerRadio.checked) {
        if (targetPortalInput) targetPortalInput.value = 'customer';
        if (emailInput && (emailInput.value === 'johnathan.miller@example.com' || emailInput.value === '')) {
          emailInput.value = 'eleanor.vance@example.com';
        }
        if (submitBtn) {
          submitBtn.innerHTML = 'Sign In to Customer Dashboard <i class="bi bi-arrow-right"></i>';
        }
      }
    });

    roleUserRadio.addEventListener('change', () => {
      if (roleUserRadio.checked) {
        if (targetPortalInput) targetPortalInput.value = 'user';
        if (emailInput && (emailInput.value === 'eleanor.vance@example.com' || emailInput.value === '')) {
          emailInput.value = 'johnathan.miller@example.com';
        }
        if (submitBtn) {
          submitBtn.innerHTML = 'Sign In to User Dashboard <i class="bi bi-arrow-right"></i>';
        }
      }
    });
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    const selectedPortal = targetPortalInput ? targetPortalInput.value : 'customer';

    if (!email || !pass) {
      if (window.showToast) window.showToast('Validation Error', 'Please fill in both email and password.', 'warning');
      return;
    }

    // Determine target dashboard based on selected role or email
    const isUserPortal = selectedPortal === 'user' || email.toLowerCase().includes('johnathan') || email.toLowerCase().includes('user');
    const destination = isUserPortal ? 'dashboard-user.html' : 'dashboard-customer.html';
    const portalName = isUserPortal ? 'User Account Dashboard' : 'Customer Patient Dashboard';

    if (window.showToast) {
      window.showToast('Login Successful', `Welcome back, ${email}! Redirecting to ${portalName}...`, 'success');
    }

    // Save demo user session
    localStorage.setItem('endocare_user', JSON.stringify({ 
      email: email, 
      name: email.split('@')[0],
      role: isUserPortal ? 'user' : 'patient'
    }));

    setTimeout(() => {
      window.location.href = destination;
    }, 1000);
  });
}

function initRegisterForm() {
  const regForm = document.getElementById('registerForm');
  if (!regForm) return;

  regForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;
    const terms = document.getElementById('regTerms').checked;

    if (!terms) {
      if (window.showToast) window.showToast('Terms Required', 'Please accept the Terms & Conditions and Privacy Policy to create an account.', 'warning');
      return;
    }

    if (pass !== confirm) {
      if (window.showToast) window.showToast('Password Mismatch', 'Password and Confirm Password do not match.', 'danger');
      return;
    }

    if (pass.length < 6) {
      if (window.showToast) window.showToast('Weak Password', 'Password should have at least 6 characters.', 'warning');
      return;
    }

    if (window.showToast) {
      window.showToast('Account Created', `Account for ${name} registered successfully (Demo). Redirecting to login...`, 'success');
    }

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  });
}

function initForgotForm() {
  const forgotForm = document.getElementById('forgotForm');
  if (!forgotForm) return;

  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value.trim();

    if (!email) {
      if (window.showToast) window.showToast('Email Required', 'Please enter your registered email address.', 'warning');
      return;
    }

    if (window.showToast) {
      window.showToast('Reset Link Sent', `Password reset instructions sent to ${email} (Demo). Check your inbox.`, 'success');
    }

    forgotForm.reset();
  });
}

function initResetForm() {
  const resetForm = document.getElementById('resetForm');
  if (!resetForm) return;

  resetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmNewPassword').value;

    if (newPass !== confirmPass) {
      if (window.showToast) window.showToast('Mismatch', 'New passwords do not match.', 'danger');
      return;
    }

    if (newPass.length < 6) {
      if (window.showToast) window.showToast('Security Alert', 'Password must be at least 6 characters.', 'warning');
      return;
    }

    if (window.showToast) {
      window.showToast('Password Updated', 'Your password has been reset successfully. Please log in.', 'success');
    }

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  });
}

function initSocialAuthDemo() {
  const googleBtns = document.querySelectorAll('.btn-google-auth');
  const fbBtns = document.querySelectorAll('.btn-facebook-auth');

  googleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.showToast) {
        window.showToast('OAuth Demo', 'Google Authentication is a frontend demo mock. Configure your OAuth Client ID for production use.', 'info');
      }
    });
  });

  fbBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.showToast) {
        window.showToast('OAuth Demo', 'Facebook Login is a frontend demo mock. Configure your Facebook App ID for production use.', 'info');
      }
    });
  });
}
