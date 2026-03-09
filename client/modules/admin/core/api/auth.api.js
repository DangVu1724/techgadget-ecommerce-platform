// Mock users data - Tài khoản cố định
const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'A',
    permissions: ['all']
  },
  {
    id: 2,
    username: 'manager',
    password: 'manager123',
    name: 'Manager User',
    email: 'manager@example.com',
    role: 'manager',
    avatar: 'M',
    permissions: ['view_dashboard', 'manage_products', 'manage_categories']
  }
];

class AuthAPI {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  async login(username, password) {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(
          u => u.username === username && u.password === password
        );

        if (user) {
          // Remove password from user object
          const { password, ...userWithoutPassword } = user;
          
          // Create session
          const token = btoa(`${user.id}:${Date.now()}`);
          const session = {
            user: userWithoutPassword,
            token,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
          };

          // Save to localStorage
          localStorage.setItem('admin_session', JSON.stringify(session));
          
          this.currentUser = userWithoutPassword;
          this.isAuthenticated = true;
          
          resolve({
            success: true,
            user: userWithoutPassword,
            token
          });
        } else {
          reject({
            success: false,
            message: 'Invalid username or password'
          });
        }
      }, 500); // Simulate network delay
    });
  }

  async logout() {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('admin_session');
        this.currentUser = null;
        this.isAuthenticated = false;
        resolve({ success: true });
      }, 300);
    });
  }

  async checkAuth() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const session = localStorage.getItem('admin_session');
        
        if (session) {
          try {
            const { user, token, expiresAt } = JSON.parse(session);
            
            // Check if session is expired
            if (expiresAt && expiresAt > Date.now()) {
              this.currentUser = user;
              this.isAuthenticated = true;
              resolve({ authenticated: true, user });
            } else {
              // Session expired
              localStorage.removeItem('admin_session');
              resolve({ authenticated: false });
            }
          } catch (error) {
            resolve({ authenticated: false });
          }
        } else {
          resolve({ authenticated: false });
        }
      }, 300);
    });
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.isAuthenticated;
  }
}

export const authAPI = new AuthAPI();