import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocFromServer,
  query,
  orderBy,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { AssetItem, LoanRecord, MaintenanceRecord, AuditLog } from '../types/inventory';
import { AuthAccount } from '../data/authUsers';

// Initialize Firebase App
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if configured
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
    : getFirestore(firebaseApp);

export const auth = getAuth(firebaseApp);

export interface FirebaseConnectionStatus {
  connected: boolean;
  projectId: string;
  databaseId: string;
  lastChecked: string;
  error?: string;
}

// 1. Connection check per guidelines
export async function testFirebaseConnection(): Promise<FirebaseConnectionStatus> {
  const status: FirebaseConnectionStatus = {
    connected: false,
    projectId: firebaseConfig.projectId,
    databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
    lastChecked: new Date().toLocaleTimeString('id-ID'),
  };

  try {
    // Validate connection by reading from server
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    status.connected = true;
  } catch (error: any) {
    if (error?.message && error.message.includes('the client is offline')) {
      status.connected = false;
      status.error = 'Klien offline / tidak dapat menghubungi Firebase Cloud.';
    } else {
      // If doc not found, it still proves server connection
      status.connected = true;
    }
  }

  return status;
}

// Collections references
const ASSETS_COLLECTION = 'assets';
const LOANS_COLLECTION = 'loans';
const MAINTENANCE_COLLECTION = 'maintenance';
const AUDIT_LOGS_COLLECTION = 'auditLogs';
const USERS_COLLECTION = 'users';

// --- ASSETS CLOUD OPERATIONS ---

export async function fetchCloudAssets(): Promise<AssetItem[]> {
  const colRef = collection(db, ASSETS_COLLECTION);
  const snap = await getDocs(colRef);
  const items: AssetItem[] = [];
  snap.forEach((d) => {
    if (d.id !== 'AST-0925') {
      items.push(d.data() as AssetItem);
    }
  });
  return items;
}

export async function saveCloudAsset(asset: AssetItem): Promise<void> {
  const docRef = doc(db, ASSETS_COLLECTION, asset.id);
  await setDoc(docRef, asset, { merge: true });
}

export async function deleteCloudAsset(assetId: string): Promise<void> {
  const docRef = doc(db, ASSETS_COLLECTION, assetId);
  await deleteDoc(docRef);
}

/**
 * Bulk upload church assets to Firestore in chunks of 450 (below Firestore 500 batch limit)
 */
export async function uploadAllAssetsToCloud(
  assets: AssetItem[],
  onProgress?: (progressPercent: number, current: number, total: number) => void
): Promise<number> {
  const chunkSize = 400;
  let processed = 0;

  for (let i = 0; i < assets.length; i += chunkSize) {
    const chunk = assets.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    chunk.forEach((item) => {
      const docRef = doc(db, ASSETS_COLLECTION, item.id);
      batch.set(docRef, item, { merge: true });
    });

    await batch.commit();
    processed += chunk.length;
    if (onProgress) {
      const percent = Math.round((processed / assets.length) * 100);
      onProgress(percent, processed, assets.length);
    }
  }

  return processed;
}

// --- LOANS CLOUD OPERATIONS ---

export async function fetchCloudLoans(): Promise<LoanRecord[]> {
  const colRef = collection(db, LOANS_COLLECTION);
  const snap = await getDocs(colRef);
  const list: LoanRecord[] = [];
  snap.forEach((d) => list.push(d.data() as LoanRecord));
  return list;
}

export async function saveCloudLoan(loan: LoanRecord): Promise<void> {
  const docRef = doc(db, LOANS_COLLECTION, loan.id);
  await setDoc(docRef, loan, { merge: true });
}

export async function deleteCloudLoan(loanId: string): Promise<void> {
  const docRef = doc(db, LOANS_COLLECTION, loanId);
  await deleteDoc(docRef);
}

export async function uploadAllLoansToCloud(loans: LoanRecord[]): Promise<void> {
  if (loans.length === 0) return;
  const batch = writeBatch(db);
  loans.forEach((loan) => {
    const docRef = doc(db, LOANS_COLLECTION, loan.id);
    batch.set(docRef, loan, { merge: true });
  });
  await batch.commit();
}

// --- MAINTENANCE CLOUD OPERATIONS ---

export async function fetchCloudMaintenance(): Promise<MaintenanceRecord[]> {
  const colRef = collection(db, MAINTENANCE_COLLECTION);
  const snap = await getDocs(colRef);
  const list: MaintenanceRecord[] = [];
  snap.forEach((d) => list.push(d.data() as MaintenanceRecord));
  return list;
}

export async function saveCloudMaintenance(rec: MaintenanceRecord): Promise<void> {
  const docRef = doc(db, MAINTENANCE_COLLECTION, rec.id);
  await setDoc(docRef, rec, { merge: true });
}

export async function deleteCloudMaintenance(recId: string): Promise<void> {
  const docRef = doc(db, MAINTENANCE_COLLECTION, recId);
  await deleteDoc(docRef);
}

export async function uploadAllMaintenanceToCloud(records: MaintenanceRecord[]): Promise<void> {
  if (records.length === 0) return;
  const batch = writeBatch(db);
  records.forEach((m) => {
    const docRef = doc(db, MAINTENANCE_COLLECTION, m.id);
    batch.set(docRef, m, { merge: true });
  });
  await batch.commit();
}

// --- AUDIT LOGS CLOUD OPERATIONS ---

export async function fetchCloudAuditLogs(): Promise<AuditLog[]> {
  const colRef = collection(db, AUDIT_LOGS_COLLECTION);
  const q = query(colRef, limit(200));
  const snap = await getDocs(q);
  const list: AuditLog[] = [];
  snap.forEach((d) => list.push(d.data() as AuditLog));
  return list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
}

export async function saveCloudAuditLog(log: AuditLog): Promise<void> {
  const docRef = doc(db, AUDIT_LOGS_COLLECTION, log.id);
  await setDoc(docRef, log);
}

export async function uploadAllAuditLogsToCloud(logs: AuditLog[]): Promise<void> {
  if (logs.length === 0) return;
  const batch = writeBatch(db);
  logs.slice(0, 450).forEach((l) => {
    const docRef = doc(db, AUDIT_LOGS_COLLECTION, l.id);
    batch.set(docRef, l);
  });
  await batch.commit();
}

// --- USERS CLOUD OPERATIONS ---

export async function fetchCloudUsers(): Promise<AuthAccount[]> {
  const colRef = collection(db, USERS_COLLECTION);
  const snap = await getDocs(colRef);
  const list: AuthAccount[] = [];
  snap.forEach((d) => list.push(d.data() as AuthAccount));
  return list;
}

export async function saveCloudUser(user: AuthAccount): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, user.id);
  await setDoc(docRef, user, { merge: true });
}

export async function deleteCloudUser(userId: string): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, userId);
  await deleteDoc(docRef);
}

export async function uploadAllUsersToCloud(users: AuthAccount[]): Promise<void> {
  if (users.length === 0) return;
  const batch = writeBatch(db);
  users.forEach((u) => {
    const docRef = doc(db, USERS_COLLECTION, u.id);
    batch.set(docRef, u, { merge: true });
  });
  await batch.commit();
}

// --- REALTIME SUBSCRIBERS ---

export function subscribeToCloudAssets(
  onUpdate: (assets: AssetItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, ASSETS_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      const items: AssetItem[] = [];
      snap.forEach((docSnap) => {
        if (docSnap.id !== 'AST-0925') {
          items.push(docSnap.data() as AssetItem);
        }
      });
      if (items.length > 0) {
        onUpdate(items);
      }
    },
    (error) => {
      console.warn('Realtime asset listener notice:', error);
      if (onError) onError(error);
    }
  );
}

export function subscribeToCloudLoans(
  onUpdate: (loans: LoanRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, LOANS_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      const items: LoanRecord[] = [];
      snap.forEach((docSnap) => items.push(docSnap.data() as LoanRecord));
      onUpdate(items);
    },
    (error) => {
      console.warn('Realtime loan listener notice:', error);
      if (onError) onError(error);
    }
  );
}

export function subscribeToCloudMaintenance(
  onUpdate: (records: MaintenanceRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, MAINTENANCE_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      const items: MaintenanceRecord[] = [];
      snap.forEach((docSnap) => items.push(docSnap.data() as MaintenanceRecord));
      onUpdate(items);
    },
    (error) => {
      console.warn('Realtime maintenance listener notice:', error);
      if (onError) onError(error);
    }
  );
}
