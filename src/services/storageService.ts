import { AssetItem, LoanRecord, MaintenanceRecord, AuditLog, AppUser } from '../types/inventory';
import { INITIAL_ASSETS, INITIAL_LOANS, INITIAL_MAINTENANCE, INITIAL_AUDIT_LOGS } from '../data/initialAssets';
import { AUTH_USERS, AuthAccount } from '../data/authUsers';
import {
  saveCloudAsset,
  deleteCloudAsset,
  uploadAllAssetsToCloud,
  fetchCloudAssets,
  saveCloudLoan,
  deleteCloudLoan,
  uploadAllLoansToCloud,
  fetchCloudLoans,
  saveCloudMaintenance,
  deleteCloudMaintenance,
  uploadAllMaintenanceToCloud,
  fetchCloudMaintenance,
  saveCloudAuditLog,
  uploadAllAuditLogsToCloud,
  fetchCloudAuditLogs,
  saveCloudUser,
  deleteCloudUser,
  uploadAllUsersToCloud,
  fetchCloudUsers,
  testFirebaseConnection,
  FirebaseConnectionStatus,
} from './firebaseService';

const ASSETS_KEY = 'pgpm_sedayu_assets_v1';
const LOANS_KEY = 'pgpm_sedayu_loans_v1';
const MAINTENANCE_KEY = 'pgpm_sedayu_maintenance_v1';
const AUDIT_LOGS_KEY = 'pgpm_sedayu_audit_logs_v1';
const USER_KEY = 'pgpm_sedayu_current_user_v1';
const REGISTERED_USERS_KEY = 'pgpm_sedayu_registered_users_v1';
const SYNC_SETTINGS_KEY = 'pgpm_sedayu_sync_settings_v1';
const OFFLINE_QUEUE_KEY = 'pgpm_sedayu_offline_queue_v1';

export interface SyncSettings {
  centralApiUrl: string;
  parokiCode: string;
  keuskupanCode: string;
  autoSync: boolean;
  lastSyncTimestamp: string | null;
  serverStatus: 'connected' | 'disconnected' | 'syncing';
}

export interface OfflineAction {
  id: string;
  timestamp: string;
  type: string;
  payload: any;
}

export const storageService = {
  getAssets(): AssetItem[] {
    try {
      const data = localStorage.getItem(ASSETS_KEY);
      if (data) {
        let parsed = JSON.parse(data) as AssetItem[];
        if (Array.isArray(parsed)) {
          // Explicit cleanup for purged items (e.g., Karaoke Set JBL - Aula Lengkap)
          const cleaned = parsed.filter(
            (item) => item.id !== 'AST-0925' && !item.namaBarang?.includes('Karaoke Set JBL - Aula Lengkap')
          );
          let changed = cleaned.length !== parsed.length;
          parsed = cleaned;

          const existingIds = new Set(parsed.map((item) => item.id));
          const missingItems = INITIAL_ASSETS.filter((item) => !existingIds.has(item.id));
          if (missingItems.length > 0) {
            parsed = [...parsed, ...missingItems];
            changed = true;
          }
          if (changed) {
            localStorage.setItem(ASSETS_KEY, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load assets from localStorage', e);
    }
    // initialize with parsed church items
    this.saveAssets(INITIAL_ASSETS);
    return INITIAL_ASSETS;
  },

  saveAssets(assets: AssetItem[]): void {
    try {
      localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
      window.dispatchEvent(new CustomEvent('pgpm_assets_updated', { detail: assets }));
    } catch (e) {
      console.error('Failed to save assets', e);
    }
  },

  async saveSingleAsset(asset: AssetItem): Promise<void> {
    const current = this.getAssets();
    const index = current.findIndex((a) => a.id === asset.id);
    let updated: AssetItem[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = asset;
    } else {
      updated = [asset, ...current];
    }
    this.saveAssets(updated);

    // Sync to Firebase Cloud
    try {
      if (navigator.onLine) {
        await saveCloudAsset(asset);
      } else {
        this.addToOfflineQueue({ type: 'SAVE_ASSET', payload: asset });
      }
    } catch (err) {
      console.warn('Firebase cloud sync deferred:', err);
      this.addToOfflineQueue({ type: 'SAVE_ASSET', payload: asset });
    }
  },

  async deleteSingleAsset(assetId: string): Promise<void> {
    const current = this.getAssets();
    const updated = current.filter((a) => a.id !== assetId);
    this.saveAssets(updated);

    // Sync deletion to Firebase Cloud
    try {
      if (navigator.onLine) {
        await deleteCloudAsset(assetId);
      } else {
        this.addToOfflineQueue({ type: 'DELETE_ASSET', payload: { id: assetId } });
      }
    } catch (err) {
      console.warn('Firebase cloud delete deferred:', err);
      this.addToOfflineQueue({ type: 'DELETE_ASSET', payload: { id: assetId } });
    }
  },

  getLoans(): LoanRecord[] {
    try {
      const data = localStorage.getItem(LOANS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load loans', e);
    }
    this.saveLoans(INITIAL_LOANS);
    return INITIAL_LOANS;
  },

  saveLoans(loans: LoanRecord[]): void {
    try {
      localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
      window.dispatchEvent(new CustomEvent('pgpm_loans_updated', { detail: loans }));
    } catch (e) {
      console.error('Failed to save loans', e);
    }
  },

  async saveSingleLoan(loan: LoanRecord): Promise<void> {
    const current = this.getLoans();
    const exists = current.some((l) => l.id === loan.id);
    const updated = exists ? current.map((l) => (l.id === loan.id ? loan : l)) : [loan, ...current];
    this.saveLoans(updated);

    try {
      if (navigator.onLine) {
        await saveCloudLoan(loan);
      } else {
        this.addToOfflineQueue({ type: 'SAVE_LOAN', payload: loan });
      }
    } catch (err) {
      console.warn('Deferred loan cloud sync:', err);
      this.addToOfflineQueue({ type: 'SAVE_LOAN', payload: loan });
    }
  },

  getMaintenance(): MaintenanceRecord[] {
    try {
      const data = localStorage.getItem(MAINTENANCE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load maintenance', e);
    }
    this.saveMaintenance(INITIAL_MAINTENANCE);
    return INITIAL_MAINTENANCE;
  },

  saveMaintenance(maintenance: MaintenanceRecord[]): void {
    try {
      localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(maintenance));
      window.dispatchEvent(new CustomEvent('pgpm_maintenance_updated', { detail: maintenance }));
    } catch (e) {
      console.error('Failed to save maintenance', e);
    }
  },

  async saveSingleMaintenance(rec: MaintenanceRecord): Promise<void> {
    const current = this.getMaintenance();
    const exists = current.some((m) => m.id === rec.id);
    const updated = exists ? current.map((m) => (m.id === rec.id ? rec : m)) : [rec, ...current];
    this.saveMaintenance(updated);

    try {
      if (navigator.onLine) {
        await saveCloudMaintenance(rec);
      } else {
        this.addToOfflineQueue({ type: 'SAVE_MAINTENANCE', payload: rec });
      }
    } catch (err) {
      console.warn('Deferred maintenance cloud sync:', err);
      this.addToOfflineQueue({ type: 'SAVE_MAINTENANCE', payload: rec });
    }
  },

  getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(AUDIT_LOGS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load audit logs', e);
    }
    this.saveAuditLogs(INITIAL_AUDIT_LOGS);
    return INITIAL_AUDIT_LOGS;
  },

  saveAuditLogs(logs: AuditLog[]): void {
    try {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
      window.dispatchEvent(new CustomEvent('pgpm_audit_logs_updated', { detail: logs }));
    } catch (e) {
      console.error('Failed to save audit logs', e);
    }
  },

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    logs.unshift(newLog);
    // keep max 500 logs locally
    if (logs.length > 500) logs.pop();
    this.saveAuditLogs(logs);

    // Save to Firebase Cloud
    if (navigator.onLine) {
      saveCloudAuditLog(newLog).catch((err) => console.warn('Cloud audit log notice:', err));
    }
  },

  getAuthSession(): AppUser | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load auth session', e);
    }
    return null;
  },

  setAuthSession(user: AppUser): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('pgpm_user_changed', { detail: user }));
    } catch (e) {
      console.error('Failed to save auth session', e);
    }
  },

  logout(): void {
    try {
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new CustomEvent('pgpm_user_changed', { detail: null }));
    } catch (e) {
      console.error('Failed to logout', e);
    }
  },

  getCurrentUser(): AppUser {
    return this.getAuthSession() || this.getRegisteredUsers()[0];
  },

  setCurrentUser(user: AppUser): void {
    this.setAuthSession(user);
  },

  getRegisteredUsers(): AuthAccount[] {
    try {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load registered users', e);
    }
    this.saveRegisteredUsers(AUTH_USERS);
    return AUTH_USERS;
  },

  saveRegisteredUsers(users: AuthAccount[]): void {
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
      window.dispatchEvent(new CustomEvent('pgpm_registered_users_updated', { detail: users }));
    } catch (e) {
      console.error('Failed to save registered users', e);
    }
  },

  async addRegisteredUser(newUser: AuthAccount): Promise<void> {
    const current = this.getRegisteredUsers();
    const exists = current.some(
      (u) => u.username.toLowerCase() === newUser.username.toLowerCase()
    );
    if (exists) {
      throw new Error(`Username "${newUser.username}" sudah digunakan.`);
    }
    const updated = [...current, newUser];
    this.saveRegisteredUsers(updated);

    try {
      if (navigator.onLine) {
        await saveCloudUser(newUser);
      }
    } catch (err) {
      console.warn('Deferred user cloud sync:', err);
    }
  },

  async updateRegisteredUser(user: AuthAccount): Promise<void> {
    const current = this.getRegisteredUsers();
    const updated = current.map((u) => (u.id === user.id ? user : u));
    this.saveRegisteredUsers(updated);

    try {
      if (navigator.onLine) {
        await saveCloudUser(user);
      }
    } catch (err) {
      console.warn('Deferred user cloud sync:', err);
    }
  },

  async deleteRegisteredUser(userId: string): Promise<void> {
    const current = this.getRegisteredUsers();
    if (userId === 'usr-admin-01') {
      throw new Error('Akun Administrator Utama PGPM tidak dapat dihapus.');
    }
    const updated = current.filter((u) => u.id !== userId);
    this.saveRegisteredUsers(updated);

    try {
      if (navigator.onLine) {
        await deleteCloudUser(userId);
      }
    } catch (err) {
      console.warn('Deferred user cloud delete:', err);
    }
  },

  authenticate(username: string, password: string): AuthAccount | null {
    const users = this.getRegisteredUsers();
    const cleanU = username.trim().toLowerCase();
    const cleanP = password.trim();

    const match = users.find(
      (u) =>
        (u.username.toLowerCase() === cleanU || u.email.toLowerCase() === cleanU) &&
        u.password === cleanP
    );

    return match || null;
  },

  getSyncSettings(): SyncSettings {
    try {
      const data = localStorage.getItem(SYNC_SETTINGS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load sync settings', e);
    }
    const defaultSettings: SyncSettings = {
      centralApiUrl: 'https://inventaris-kas.keuskupan.org/api/v1/paroki/sedayu',
      parokiCode: 'PRK-KAS-047-SEDAYU',
      keuskupanCode: 'KAS-SEMARANG',
      autoSync: true,
      lastSyncTimestamp: new Date().toISOString().slice(0, 10),
      serverStatus: 'connected',
    };
    return defaultSettings;
  },

  saveSyncSettings(settings: SyncSettings): void {
    try {
      localStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save sync settings', e);
    }
  },

  getOfflineQueue(): OfflineAction[] {
    try {
      const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load offline queue', e);
    }
    return [];
  },

  addToOfflineQueue(action: Omit<OfflineAction, 'id' | 'timestamp'>): void {
    const queue = this.getOfflineQueue();
    queue.push({
      ...action,
      id: `OFL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('pgpm_offline_queue_updated', { detail: queue }));
  },

  clearOfflineQueue(): void {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    window.dispatchEvent(new CustomEvent('pgpm_offline_queue_updated', { detail: [] }));
  },

  async processOfflineQueue(): Promise<number> {
    const queue = this.getOfflineQueue();
    if (queue.length === 0 || !navigator.onLine) return 0;

    let processedCount = 0;
    const remaining: OfflineAction[] = [];

    for (const item of queue) {
      try {
        if (item.type === 'SAVE_ASSET') {
          await saveCloudAsset(item.payload);
        } else if (item.type === 'DELETE_ASSET') {
          await deleteCloudAsset(item.payload.id);
        } else if (item.type === 'SAVE_LOAN') {
          await saveCloudLoan(item.payload);
        } else if (item.type === 'SAVE_MAINTENANCE') {
          await saveCloudMaintenance(item.payload);
        }
        processedCount++;
      } catch (err) {
        remaining.push(item);
      }
    }

    if (remaining.length === 0) {
      this.clearOfflineQueue();
    } else {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
      window.dispatchEvent(new CustomEvent('pgpm_offline_queue_updated', { detail: remaining }));
    }

    return processedCount;
  },

  /**
   * One-click upload all local assets, loans, maintenance, audit logs, and users into Firebase Cloud Firestore
   */
  async syncAllToFirebase(
    onProgress?: (percent: number, current: number, total: number) => void
  ): Promise<{ success: boolean; assetsCount: number; message: string }> {
    const assets = this.getAssets();
    const loans = this.getLoans();
    const maintenance = this.getMaintenance();
    const auditLogs = this.getAuditLogs();
    const users = this.getRegisteredUsers();

    try {
      const uploadedAssets = await uploadAllAssetsToCloud(assets, onProgress);
      await uploadAllLoansToCloud(loans);
      await uploadAllMaintenanceToCloud(maintenance);
      await uploadAllAuditLogsToCloud(auditLogs);
      await uploadAllUsersToCloud(users);

      const settings = this.getSyncSettings();
      settings.lastSyncTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
      settings.serverStatus = 'connected';
      this.saveSyncSettings(settings);

      return {
        success: true,
        assetsCount: uploadedAssets,
        message: `Berhasil mengunggah ${uploadedAssets} data aset dan seluruh riwayat ke Firebase Cloud Firestore!`,
      };
    } catch (error: any) {
      console.error('Firebase sync error:', error);
      throw error;
    }
  },

  /**
   * Pull latest data from Firebase Cloud Firestore into local storage
   */
  async syncFromFirebase(): Promise<{
    assets: AssetItem[];
    loans: LoanRecord[];
    maintenance: MaintenanceRecord[];
    auditLogs: AuditLog[];
  }> {
    const cloudAssets = await fetchCloudAssets();
    const cloudLoans = await fetchCloudLoans();
    const cloudMaintenance = await fetchCloudMaintenance();
    const cloudAuditLogs = await fetchCloudAuditLogs();
    const cloudUsers = await fetchCloudUsers();

    if (cloudAssets.length > 0) {
      this.saveAssets(cloudAssets);
    }
    if (cloudLoans.length > 0) {
      this.saveLoans(cloudLoans);
    }
    if (cloudMaintenance.length > 0) {
      this.saveMaintenance(cloudMaintenance);
    }
    if (cloudAuditLogs.length > 0) {
      this.saveAuditLogs(cloudAuditLogs);
    }
    if (cloudUsers.length > 0) {
      this.saveRegisteredUsers(cloudUsers);
    }

    return {
      assets: this.getAssets(),
      loans: this.getLoans(),
      maintenance: this.getMaintenance(),
      auditLogs: this.getAuditLogs(),
    };
  },

  resetAllToFactory(): void {
    localStorage.removeItem(ASSETS_KEY);
    localStorage.removeItem(LOANS_KEY);
    localStorage.removeItem(MAINTENANCE_KEY);
    localStorage.removeItem(AUDIT_LOGS_KEY);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    this.saveAssets(INITIAL_ASSETS);
    this.saveLoans(INITIAL_LOANS);
    this.saveMaintenance(INITIAL_MAINTENANCE);
    this.saveAuditLogs(INITIAL_AUDIT_LOGS);
  },
};
