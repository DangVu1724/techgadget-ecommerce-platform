// Mock users
const MOCK_USERS = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "A",
    permissions: ["all"],
  },
  {
    id: 3,
    username: "user",
    password: "user123",
    name: "Customer User",
    email: "user@example.com",
    role: "user",
    avatar: "U",
    permissions: [],
  },
];

const STORAGE_KEY = "techgadget_session";

class AuthAPI {
  constructor() {
    this.currentUser = null;
  }

  async login(username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(
          (u) => u.username === username && u.password === password,
        );

        if (!user) {
          reject({
            success: false,
            message: "Invalid username or password",
          });
          return;
        }

        const { password: _, ...userData } = user;

        const session = {
          user: userData,
          token: btoa(`${user.id}:${Date.now()}`),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

        this.currentUser = userData;

        resolve({
          success: true,
          user: userData,
          token: session.token,
        });
      }, 300);
    });
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser = null;
    return { success: true };
  }

  checkAuth() {
    const session = localStorage.getItem(STORAGE_KEY);

    if (!session) return null;

    try {
      const data = JSON.parse(session);

      if (data.expiresAt > Date.now()) {
        this.currentUser = data.user;
        return data.user;
      }

      localStorage.removeItem(STORAGE_KEY);
      return null;
    } catch {
      return null;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  hasRole(role) {
    const user = this.checkAuth();
    return user && user.role === role;
  }

  hasPermission(permission) {
    const user = this.checkAuth();
    if (!user) return false;

    if (user.permissions.includes("all")) return true;

    return user.permissions.includes(permission);
  }
}

export const authAPI = new AuthAPI();
