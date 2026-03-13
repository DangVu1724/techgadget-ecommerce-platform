import { authAPI } from '../../../core/api/auth.api.js';

class LoginPage {
  constructor() {
    this.form = document.getElementById('loginForm');
    this.usernameInput = document.getElementById('username');
    this.passwordInput = document.getElementById('password');
    this.loginBtn = document.getElementById('loginBtn');
    this.rememberMe = document.getElementById('rememberMe');
    this.alertContainer = document.getElementById('alertContainer');
    
    this.init();
  }

  init() {
    this.checkExistingSession();
    this.bindEvents();
    this.loadSavedCredentials();
  }

  async checkExistingSession() {
    try {
      const { authenticated } = await authAPI.checkAuth();
      if (authenticated) {
        this.redirectToDashboard();
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Demo account buttons
    document.querySelectorAll('.demo-account-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.dataset.username;
        const password = btn.dataset.password;
        this.fillDemoCredentials(username, password);
      });
    });

    // Real-time validation
    this.usernameInput.addEventListener('input', () => this.validateField(this.usernameInput));
    this.passwordInput.addEventListener('input', () => this.validateField(this.passwordInput));
  }

  loadSavedCredentials() {
    const savedUsername = localStorage.getItem('saved_username');
    if (savedUsername) {
      this.usernameInput.value = savedUsername;
      this.rememberMe.checked = true;
    }
  }

  fillDemoCredentials(username, password) {
    this.usernameInput.value = username;
    this.passwordInput.value = password;
    this.usernameInput.classList.remove('error');
    this.passwordInput.classList.remove('error');
    
    // Trigger validation
    this.validateField(this.usernameInput);
    this.validateField(this.passwordInput);
    
    // Auto submit? Optional
    // this.form.dispatchEvent(new Event('submit'));
  }

  validateField(field) {
    if (field.value.trim() === '') {
      field.classList.add('error');
      return false;
    } else {
      field.classList.remove('error');
      return true;
    }
  }

  validateForm() {
    const isUsernameValid = this.validateField(this.usernameInput);
    const isPasswordValid = this.validateField(this.passwordInput);
    
    return isUsernameValid && isPasswordValid;
  }

  showAlert(message, type = 'error') {
    this.alertContainer.innerHTML = `
      <div class="alert alert-${type}">
        ${message}
      </div>
    `;

    // Auto hide alert after 5 seconds
    setTimeout(() => {
      this.alertContainer.innerHTML = '';
    }, 5000);
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.loginBtn.disabled = true;
      this.loginBtn.innerHTML = `
        <span class="spinner"></span>
        Signing in...
      `;
    } else {
      this.loginBtn.disabled = false;
      this.loginBtn.innerHTML = 'Sign In';
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      this.showAlert('Please fill in all fields', 'error');
      return;
    }

    this.setLoading(true);

    try {
      const username = this.usernameInput.value.trim();
      const password = this.passwordInput.value;

      // Call login API
      const response = await authAPI.login(username, password);

      // Save credentials if remember me is checked
      if (this.rememberMe.checked) {
        localStorage.setItem('saved_username', username);
      } else {
        localStorage.removeItem('saved_username');
      }

      this.showAlert('Login successful! Redirecting...', 'success');

      // Redirect to dashboard after short delay
      setTimeout(() => {
        this.redirectToDashboard();
      }, 1000);

    } catch (error) {
      this.showAlert(error.message || 'Login failed. Please try again.', 'error');
      this.passwordInput.value = ''; // Clear password for security
      this.passwordInput.focus();
    } finally {
      this.setLoading(false);
    }
  }

  redirectToDashboard() {
    window.location.href = '../../dashboard/dashboard.html';
  }
}

// Initialize login page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LoginPage();
});