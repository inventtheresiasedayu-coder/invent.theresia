import { AssetItem, LoanRecord, MaintenanceRecord, AuditLog, AppUser } from '../types/inventory';
import { INITIAL_ASSETS, INITIAL_LOANS, INITIAL_MAINTENANCE, INITIAL_AUDIT_LOGS, INITIAL_USERS } from '../data/initialAssets';

const ASSETS_KEY = 'pgpm_sedayu_assets_v1';
const LOANS_KEY = 'pgpm_sedayu_loans_v1';
const MAINTENANCE_KEY = 'pgpm_sedayu_maintenance_v1';
const AUDIT_LOGS_KEY = 'pgpm_sedayu_audit_logs_v1';
const USER_KEY = 'pgpm_sedayu_current_user_v1';
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
        return JSON.parse(data);
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
    // keep max 500 logs
    if (logs.length > 500) logs.pop();
    this.saveAuditLogs(logs);
  },

  getCurrentUser(): AppUser {
    try {
      const data = localStorage.getItem(USER_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load user', e);
    }
    return INITIAL_USERS[1]; // Sekretariat PGPM Sedayu by default
  },

  setCurrentUser(user: AppUser): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('pgpm_user_changed', { detail: user }));
    } catch (e) {
      console.error('Failed to save user', e);
    }
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
      lastSyncTimestamp: '2026-10-28 18:30:00',
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
      id: `OFL-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('pgpm_offline_queue_updated', { detail: queue }));
  },

  clearOfflineQueue(): void {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    window.dispatchEvent(new CustomEvent('pgpm_offline_queue_updated', { detail: [] }));
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
