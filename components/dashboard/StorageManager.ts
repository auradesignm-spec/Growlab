import { CompanyAccount, Product, Order, Campaign, UserAccount } from "./types";
import { sampleDemoCompanies, initialProducts, initialOrders, initialCampaigns } from "./mockData";

export const initialUsers: UserAccount[] = [
  {
    id: "usr_admin",
    email: "admin@growlab.om",
    username: "admin",
    password: "admin123",
    fullName: "المدير العام (Super Admin)",
    phone: "+968 9000 0001",
    role: "admin",
    companyId: "all",
    companyName: "إدارة منصة Growlab",
    createdAt: "2026-01-01T00:00:00.000Z",
    isActive: true,
  },
  {
    id: "usr_rawabi",
    email: "rawabi@growlab.om",
    username: "rawabi",
    password: "rawabi123",
    fullName: "سعيد الشنفري",
    phone: "+968 9123 4567",
    role: "merchant",
    companyId: "c1",
    companyName: "روابي اللبان العماني",
    createdAt: "2026-01-05T00:00:00.000Z",
    isActive: true,
  },
  {
    id: "usr_taj",
    email: "taj@growlab.om",
    username: "taj",
    password: "taj123",
    fullName: "فاطمة البلوشية",
    phone: "+968 9876 5432",
    role: "merchant",
    companyId: "c2",
    companyName: "دار تاج العود الملكي",
    createdAt: "2026-01-10T00:00:00.000Z",
    isActive: true,
  },
  {
    id: "usr_majan",
    email: "majan@growlab.om",
    username: "majan",
    password: "majan123",
    fullName: "سالم الحارثي",
    phone: "+968 9345 6789",
    role: "merchant",
    companyId: "c3",
    companyName: "مجان للإلكترونيات الذكية",
    createdAt: "2026-01-15T00:00:00.000Z",
    isActive: true,
  },
];

const STORAGE_KEYS = {
  USER_SESSION: "growlab_user_session",
  USERS_LIST: "growlab_registered_users",
  ACCOUNTS: "growlab_company_accounts",
  PRODUCTS: "growlab_products",
  ORDERS: "growlab_orders",
  CAMPAIGNS: "growlab_campaigns",
};

export const StorageManager = {
  // Registered Users (Admin & Merchants)
  getUsers(): UserAccount[] {
    if (typeof window === "undefined") return initialUsers;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      return data ? JSON.parse(data) : initialUsers;
    } catch {
      return initialUsers;
    }
  },

  saveUsers(users: UserAccount[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
  },

  addUser(newUser: UserAccount): UserAccount[] {
    const users = this.getUsers();
    const updated = [newUser, ...users.filter((u) => u.id !== newUser.id)];
    this.saveUsers(updated);
    return updated;
  },

  deleteUser(userId: string): UserAccount[] {
    const users = this.getUsers();
    const updated = users.filter((u) => u.id !== userId);
    this.saveUsers(updated);
    return updated;
  },

  updateUser(updatedUser: UserAccount): UserAccount[] {
    const users = this.getUsers();
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    this.saveUsers(updated);
    return updated;
  },

  // Authenticate user by email or username + password
  authenticate(identifier: string, pass: string): { user: UserAccount | null; error?: string } {
    const users = this.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    const matched = users.find(
      (u) =>
        (u.email.toLowerCase() === cleanId || (u.username && u.username.toLowerCase() === cleanId))
    );

    if (!matched) {
      return { user: null, error: "اسم المستخدم أو البريد الإلكتروني غير موجود" };
    }

    if (matched.isActive === false) {
      return { user: null, error: "هذا الحساب معطل حالياً من قِبل إدارة المنصة" };
    }

    if (matched.password && matched.password !== cleanPass) {
      return { user: null, error: "كلمة المرور غير صحيحة، يرجى المحاولة مجدداً" };
    }

    return { user: matched };
  },

  // User Session
  getUserSession(): UserAccount | null {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUserSession(user: UserAccount | null) {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    }
  },

  // Accounts
  getAccounts(): CompanyAccount[] {
    if (typeof window === "undefined") return sampleDemoCompanies;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return data ? JSON.parse(data) : sampleDemoCompanies;
    } catch {
      return sampleDemoCompanies;
    }
  },

  saveAccounts(accounts: CompanyAccount[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  // Products
  getProducts(): Product[] {
    if (typeof window === "undefined") return initialProducts;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : initialProducts;
    } catch {
      return initialProducts;
    }
  },

  saveProducts(products: Product[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Orders
  getOrders(): Order[] {
    if (typeof window === "undefined") return initialOrders;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : initialOrders;
    } catch {
      return initialOrders;
    }
  },

  saveOrders(orders: Order[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  // Campaigns
  getCampaigns(): Campaign[] {
    if (typeof window === "undefined") return initialCampaigns;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      return data ? JSON.parse(data) : initialCampaigns;
    } catch {
      return initialCampaigns;
    }
  },

  saveCampaigns(campaigns: Campaign[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
  },

  // Export Data for Backup
  exportAllData(): string {
    const data = {
      users: this.getUsers(),
      accounts: this.getAccounts(),
      products: this.getProducts(),
      orders: this.getOrders(),
      campaigns: this.getCampaigns(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  // Reset to Factory Default Data
  resetToDefault() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.USERS_LIST);
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS);
  },
};
