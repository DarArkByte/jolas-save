import { 
  UserProfile, 
  SavingsGoal, 
  DepositRequest, 
  WithdrawalRequest, 
  Transaction, 
  SystemNotification, 
  InforgeAuditLog,
  UserRole,
  DepositRequestStatus
} from '../types';

const STORAGE_PREFIX = 'inforge_baas_';

// Real-time event registry
type RealtimeCallback = (data: any) => void;
const listeners: { [channel: string]: RealtimeCallback[] } = {};

// In-Memory cache — starts empty, populated from DB via initialize()
let cachedUsers: UserProfile[] = [];
let cachedGoals: SavingsGoal[] = [];
let cachedTransactions: Transaction[] = [];
let cachedWithdrawals: WithdrawalRequest[] = [];
let cachedDeposits: DepositRequest[] = [];
let cachedNotifications: SystemNotification[] = [];
let cachedLogs: InforgeAuditLog[] = [];
let cachedCategories: any[] = [];

// Auth token storage for authenticated API calls
let authToken: string | null = localStorage.getItem(`${STORAGE_PREFIX}auth_token`);

// Simple helper to construct API headers (with auth when available)
const headers = { 'Content-Type': 'application/json' };
function getAuthHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) h['Authorization'] = `Bearer ${authToken}`;
  return h;
}

export const InforgeBaaS = {
  // Sync initialization to populate caches from live MySQL via PHP API
  async initialize() {
    try {
      const ah = getAuthHeaders();
      // Fetch each collection individually so one failure doesn't break all
      const safeFetch = (url: string) => fetch(url, { headers: ah }).then(r => r.json()).catch(() => null);

      const [uRes, gRes, tRes, wRes, dRes, nRes, lRes, cRes] = await Promise.all([
        safeFetch('/api/users'),
        safeFetch('/api/goals'),
        safeFetch('/api/transactions'),
        safeFetch('/api/withdrawals'),
        safeFetch('/api/deposit-requests'),
        safeFetch('/api/notifications'),
        safeFetch('/api/audit-logs'),
        safeFetch('/api/categories')
      ]);

      if (Array.isArray(uRes)) cachedUsers = uRes;
      if (Array.isArray(gRes)) cachedGoals = gRes;
      if (Array.isArray(tRes)) cachedTransactions = tRes;
      if (Array.isArray(wRes)) cachedWithdrawals = wRes;
      if (Array.isArray(dRes)) cachedDeposits = dRes;
      if (Array.isArray(nRes)) cachedNotifications = nRes;
      if (Array.isArray(lRes)) cachedLogs = lRes;
      if (Array.isArray(cRes)) cachedCategories = cRes;

      // Also refresh the active session from MySQL so KYC status etc. are current
      if (authToken) {
        const meRes = await safeFetch('/api/users/me');
        if (meRes && meRes.username) {
          localStorage.setItem(`${STORAGE_PREFIX}active_session`, JSON.stringify(meRes));
        }
      }

      // Publish to trigger UI rendering
      this.realtime.publish('users', cachedUsers);
      this.realtime.publish('savings_goals', cachedGoals);
      this.realtime.publish('transactions', cachedTransactions);
      this.realtime.publish('withdrawals', cachedWithdrawals);
      this.realtime.publish('deposit_requests', cachedDeposits);
      this.realtime.publish('notifications', cachedNotifications);
      this.realtime.publish('audit_logs', cachedLogs);
      this.realtime.publish('savings_categories', cachedCategories);

    } catch (e) {
      console.error('Failed to initialize connection to JOLAS API server.', e);
    }
  },

  // 1. AUTHENTICATION CLIENT
  auth: {
    getCurrentSession() {
      const data = localStorage.getItem(`${STORAGE_PREFIX}active_session`);
      if (!data) return null;
      try {
        return JSON.parse(data) as UserProfile;
      } catch (e) {
        return null;
      }
    },

    async login(emailOrUsername: string, passwordHash: string): Promise<{ success: boolean; user?: any; error?: string; token?: string }> {
      try {
        // Call the real MySQL-backed login endpoint and await the response
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ emailOrUsername, passwordHash }).toString()
        });
        const data = await res.json();

        if (data.success && data.user) {
          // Store the fresh server-returned user (with live KYC status, role, etc.)
          localStorage.setItem(`${STORAGE_PREFIX}active_session`, JSON.stringify(data.user));
          // Store auth token for subsequent API calls
          if (data.token) {
            authToken = data.token;
            localStorage.setItem(`${STORAGE_PREFIX}auth_token`, data.token);
          }
          // Refresh all caches from live MySQL
          await InforgeBaaS.initialize();
          return { success: true, user: data.user, token: data.token };
        }
        return { success: false, error: data.error || 'Invalid credentials.' };
      } catch (err) {
        console.error('Login error', err);
        return { success: false, error: 'Unable to connect to server. Please try again.' };
      }
    },

    async register(profile: UserProfile, passwordHash: string, role: UserRole = UserRole.CUSTOMER): Promise<{ success: boolean; user?: any; error?: string }> {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            profile: JSON.stringify(profile),
            passwordHash,
            role
          }).toString()
        });
        const data = await res.json();

        if (data.success && data.user) {
          cachedUsers.push(data.user);
          localStorage.setItem(`${STORAGE_PREFIX}active_session`, JSON.stringify(data.user));
          // Auto-login to get token
          const loginRes = await this.login(profile.username || profile.email, passwordHash);
          if (loginRes.success) return { success: true, user: loginRes.user };
          return { success: true, user: data.user };
        }
        return { success: false, error: data.error || 'Registration failed.' };
      } catch (err) {
        console.error('Register error', err);
        return { success: false, error: 'Unable to connect to server. Please try again.' };
      }
    },

    logout() {
      const session = this.getCurrentSession();
      if (session) {
        fetch('/api/audit-logs', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ action: 'User Logout Executed', username: session.username, role: 'Customer' })
        }).catch(err => console.error('Logout sync error', err));
      }
      localStorage.removeItem(`${STORAGE_PREFIX}active_session`);
      localStorage.removeItem(`${STORAGE_PREFIX}auth_token`);
      authToken = null;
    },

    resetPassword(email: string, newPasswordHash: string): boolean {
      const user = cachedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        fetch(`/api/users/${user.username}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ passwordHash: newPasswordHash })
        }).then(() => InforgeBaaS.initialize()).catch(err => console.error('Reset password sync error', err));
        return true;
      }
      return false;
    }
  },

  // 2. DATABASE CLIENT OPERATIONS
  db: {
    users: {
      getAll(): UserProfile[] {
        return cachedUsers;
      },
      updateProfile(username: string, updatedData: Partial<UserProfile>): boolean {
        const idx = cachedUsers.findIndex(u => u.username === username);
        if (idx !== -1) {
          cachedUsers[idx] = { ...cachedUsers[idx], ...updatedData };
          InforgeBaaS.realtime.publish('users', cachedUsers);

          // Update active session locally if self-update
          const current = InforgeBaaS.auth.getCurrentSession();
          if (current && current.username === username) {
            localStorage.setItem(`${STORAGE_PREFIX}active_session`, JSON.stringify(cachedUsers[idx]));
          }

          fetch(`/api/users/${username}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updatedData)
          }).then(() => InforgeBaaS.initialize()).catch(err => console.error('Profile update sync error', err));

          return true;
        }
        return false;
      }
    },

    savingsGoals: {
      getAll(): SavingsGoal[] {
        return cachedGoals;
      },
      add(goal: SavingsGoal, username: string): void {
        cachedGoals.push(goal);
        InforgeBaaS.realtime.publish('savings_goals', cachedGoals);

        fetch('/api/goals', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ goal, username })
        }).then(() => InforgeBaaS.initialize()).catch(err => console.error('Goal create sync error', err));
      },
      update(goalId: string, updated: Partial<SavingsGoal>, username: string): void {
        const idx = cachedGoals.findIndex(g => g.id === goalId);
        if (idx !== -1) {
          cachedGoals[idx] = { ...cachedGoals[idx], ...updated };
          InforgeBaaS.realtime.publish('savings_goals', cachedGoals);

          fetch(`/api/goals/${goalId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ updated, username })
          }).then(() => InforgeBaaS.initialize()).catch(err => console.error('Goal update sync error', err));
        }
      }
    },

    depositRequests: {
      getAll(): DepositRequest[] {
        return cachedDeposits;
      },
      add(req: DepositRequest, username: string): void {
        cachedDeposits.unshift(req);
        InforgeBaaS.realtime.publish('deposit_requests', cachedDeposits);

        fetch('/api/deposit-requests', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ req, username })
        }).then(() => InforgeBaaS.initialize()).catch(err => console.error('Deposit request sync error', err));
      },
      updateStatus(reqId: string, status: DepositRequestStatus, actor: string, actorRole: string, proofUrl?: string, notes?: string): void {
        const idx = cachedDeposits.findIndex(r => r.id === reqId);
        if (idx !== -1) {
          cachedDeposits[idx].status = status;
          if (proofUrl) cachedDeposits[idx].proofOfPaymentUrl = proofUrl;
          if (notes) cachedDeposits[idx].notes = notes;
          InforgeBaaS.realtime.publish('deposit_requests', cachedDeposits);

          if (status === 'Credited') {
            fetch(`/api/deposit-requests/${reqId}/approve`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ notes })
            }).then(() => InforgeBaaS.initialize()).catch(err => console.error('Deposit approve error', err));
          } else if (status === 'Declined') {
            fetch(`/api/deposit-requests/${reqId}/decline`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ reason: notes || 'Declined by admin' })
            }).then(() => InforgeBaaS.initialize()).catch(err => console.error('Deposit decline error', err));
          } else {
            fetch(`/api/deposit-requests/${reqId}`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify({ status, actor, actorRole, proofUrl, notes })
            }).then(() => InforgeBaaS.initialize()).catch(err => console.error('Deposit status update error', err));
          }
        }
      }
    },

    withdrawals: {
      getAll(): WithdrawalRequest[] {
        return cachedWithdrawals;
      },
      add(req: WithdrawalRequest, username: string): void {
        cachedWithdrawals.unshift(req);
        InforgeBaaS.realtime.publish('withdrawals', cachedWithdrawals);

        fetch('/api/withdrawals', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ req, username })
        }).then(() => InforgeBaaS.initialize()).catch(err => console.error('Withdrawal create sync error', err));
      },
      approve(reqId: string, actor: string, actorRole: string): void {
        const idx = cachedWithdrawals.findIndex(r => r.id === reqId);
        if (idx !== -1) {
          cachedWithdrawals[idx].status = 'Approved';
          InforgeBaaS.realtime.publish('withdrawals', cachedWithdrawals);

          fetch(`/api/withdrawals/${reqId}/approve`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ actorName: actor, actorRole })
          }).then(() => InforgeBaaS.initialize()).catch(err => console.error('Withdrawal approve sync error', err));
        }
      },
      reject(reqId: string, actor: string, actorRole: string): void {
        const idx = cachedWithdrawals.findIndex(r => r.id === reqId);
        if (idx !== -1) {
          cachedWithdrawals[idx].status = 'Rejected';
          InforgeBaaS.realtime.publish('withdrawals', cachedWithdrawals);

          fetch(`/api/withdrawals/${reqId}/decline`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ reason: 'Rejected by admin', actorName: actor, actorRole })
          }).then(() => InforgeBaaS.initialize()).catch(err => console.error('Withdrawal reject sync error', err));
        }
      }
    },

    transactions: {
      getAll(): Transaction[] {
        return cachedTransactions;
      }
    },

    notifications: {
      getAll(): SystemNotification[] {
        return cachedNotifications;
      },
      markAllAsRead(): void {
        cachedNotifications.forEach(n => n.isRead = true);
        InforgeBaaS.realtime.publish('notifications', cachedNotifications);

        fetch('/api/notifications/read-all', {
          method: 'PUT',
          headers: getAuthHeaders()
        }).then(() => InforgeBaaS.initialize()).catch(err => console.error('Notifications read sync error', err));
      }
    },

    auditLogs: {
      getAll(): InforgeAuditLog[] {
        return cachedLogs;
      },
      log(action: string, actor: string, actorRole: string, targetUserId: string): void {
        // Log locally
        const newLog: InforgeAuditLog = {
          id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`,
          action,
          userId: targetUserId,
          username: actor,
          role: actorRole,
          ipAddress: '102.89.34.120',
          device: 'Server API Request',
          browser: 'Express Core',
          timestamp: new Date().toISOString()
        };
        cachedLogs.unshift(newLog);
        InforgeBaaS.realtime.publish('audit_logs', cachedLogs);

        fetch('/api/audit-logs', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ action, username: actor, role: actorRole })
        }).catch(err => console.error('Audit log sync error', err));
      }
    },

    categories: {
      getAll(): any[] {
        return cachedCategories;
      },
      add(category: any): void {
        cachedCategories.push(category);
        InforgeBaaS.realtime.publish('savings_categories', cachedCategories);

        fetch('/api/categories', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(category)
        }).then(() => InforgeBaaS.initialize()).catch(err => console.error('Category add sync error', err));
      }
    }
  },

  // 3. REAL-TIME EVENT STREAM
  realtime: {
    subscribe(channel: string, callback: RealtimeCallback): () => void {
      if (!listeners[channel]) {
        listeners[channel] = [];
      }
      listeners[channel].push(callback);

      return () => {
        listeners[channel] = listeners[channel].filter(cb => cb !== callback);
      };
    },

    publish(channel: string, data: any): void {
      if (listeners[channel]) {
        listeners[channel].forEach(callback => {
          try {
            callback(data);
          } catch (e) {
            console.error('Subscription error', e);
          }
        });
      }
    }
  },

  // 4. FILE STORAGE
  storage: {
    uploadFile(base64OrBlob: string, type: string): Promise<string> {
      return new Promise((resolve) => {
        setTimeout(() => {
          const randId = Math.floor(100000 + Math.random() * 900000);
          resolve(`https://inforge-storage.jolas-save.com/v1/bucket/${type}_${randId}.jpg`);
        }, 350);
      });
    }
  }
};
