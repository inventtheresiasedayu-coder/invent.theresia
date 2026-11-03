import React, { useState, useEffect } from 'react';
import { SyncSettings, OfflineAction, storageService } from '../services/storageService';
import { AssetItem, LoanRecord, MaintenanceRecord, AuditLog } from '../types/inventory';
import {
  testFirebaseConnection,
  FirebaseConnectionStatus,
  fetchCloudAssets,
} from '../services/firebaseService';
import {
  X,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Database,
  Cloud,
  Layers,
  ArrowDownCircle,
  ArrowUpCircle,
  Flame,
} from 'lucide-react';

interface SyncModalProps {
  isOnline: boolean;
  syncSettings: SyncSettings;
  offlineQueue: OfflineAction[];
  assets: AssetItem[];
  loans: LoanRecord[];
  maintenance: MaintenanceRecord[];
  auditLogs: AuditLog[];
  onSaveSettings: (settings: SyncSettings) => void;
  onSyncComplete: () => void;
  onRestoreData: (data: {
    assets: AssetItem[];
    loans: LoanRecord[];
    maintenance: MaintenanceRecord[];
    auditLogs: AuditLog[];
  }) => void;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOnline,
  syncSettings,
  offlineQueue,
  assets,
  loans,
  maintenance,
  auditLogs,
  onSaveSettings,
  onSyncComplete,
  onRestoreData,
  onClose,
}) => {
  const [apiUrl, setApiUrl] = useState(syncSettings.centralApiUrl);
  const [parokiCode, setParokiCode] = useState(syncSettings.parokiCode);
  const [autoSync, setAutoSync] = useState(syncSettings.autoSync);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseConnectionStatus | null>(null);
  const [checkingFirebase, setCheckingFirebase] = useState(false);

  useEffect(() => {
    checkFirebase();
  }, []);

  const checkFirebase = async () => {
    setCheckingFirebase(true);
    try {
      const status = await testFirebaseConnection();
      setFirebaseStatus(status);
    } catch (e: any) {
      setFirebaseStatus({
        connected: false,
        projectId: 'gen-lang-client-0609369523',
        databaseId: 'ai-studio-inventarisasiger-4511a6a8-1854-4250-a520-96c9731ee6a2',
        lastChecked: new Date().toLocaleTimeString('id-ID'),
        error: e.message,
      });
    } finally {
      setCheckingFirebase(false);
    }
  };

  // Upload all local items to Firebase Firestore
  const handlePushToFirebase = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    setUploadProgress(0);

    try {
      const result = await storageService.syncAllToFirebase((percent, current, total) => {
        setUploadProgress(percent);
      });

      storageService.addAuditLog({
        namaBarang: 'Database Cloud Firebase',
        tipeAksi: 'SYNC_PUSAT',
        detailPerubahan: `Upload penuh database ke Firebase Firestore (${result.assetsCount} aset)`,
        pelaku: 'Pengurus Inventaris',
        role: 'ADMIN_PGPM',
      });

      setSyncStatusMsg({
        type: 'success',
        text: `Berhasil mengunggah ${result.assetsCount} aset ke Cloud Server Firebase Firestore!`,
      });
      onSyncComplete();
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        text: `Gagal mengunggah ke Firebase Cloud: ${err?.message || 'Periksa koneksi internet.'}`,
      });
    } finally {
      setIsSyncing(false);
      setUploadProgress(null);
    }
  };

  // Pull latest data from Firebase Firestore
  const handlePullFromFirebase = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);

    try {
      const result = await storageService.syncFromFirebase();
      setSyncStatusMsg({
        type: 'success',
        text: `Berhasil sinkron data dari Firebase Firestore (${result.assets.length} aset termutakhir)!`,
      });
      onSyncComplete();
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        text: `Gagal menarik data dari Firebase Cloud: ${err?.message || 'Periksa koneksi internet.'}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Process offline queue
  const handleProcessOfflineQueue = async () => {
    setIsSyncing(true);
    try {
      const count = await storageService.processOfflineQueue();
      setSyncStatusMsg({
        type: 'success',
        text: `Berhasil memproses ${count} transaksi pending dari antrean offline ke Cloud.`,
      });
      onSyncComplete();
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        text: `Gagal memproses antrean offline: ${err?.message}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      appName: 'Inventarisasi Gereja St. Theresia Sedayu',
      exportedAt: new Date().toISOString(),
      paroki: 'Paroki St. Theresia Sedayu KAS',
      totalAssets: assets.length,
      data: {
        assets,
        loans,
        maintenance,
        auditLogs,
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_Inventaris_Sedayu_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.data && Array.isArray(json.data.assets)) {
          onRestoreData(json.data);
          setSyncStatusMsg({
            type: 'success',
            text: `Berhasil memulihkan ${json.data.assets.length} aset dari file backup!`,
          });
        } else {
          setSyncStatusMsg({
            type: 'error',
            text: 'Format file JSON tidak cocok dengan struktur inventaris Sedayu.',
          });
        }
      } catch (err) {
        setSyncStatusMsg({
          type: 'error',
          text: 'Gagal membaca file JSON backup.',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Sinkronisasi Cloud Server Firebase</h3>
              <p className="text-xs text-slate-400">
                Penyimpanan Database Cloud Firestore & Sinkronisasi Sistem Inventaris Paroki
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto grow">
          {/* Firebase Cloud Live Status Banner */}
          <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Firebase Firestore Database
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      firebaseStatus?.connected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {checkingFirebase
                      ? 'Memeriksa...'
                      : firebaseStatus?.connected
                      ? '🟢 Cloud Terhubung'
                      : '🟡 Siap Koneksi'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                  ID: {firebaseStatus?.databaseId || 'ai-studio-inventarisasiger-4511a6a8'}
                </div>
              </div>
            </div>

            <button
              onClick={checkFirebase}
              disabled={checkingFirebase}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold px-2.5 py-1 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 transition"
            >
              Tes Ping Server
            </button>
          </div>

          {/* Network & Offline Status Banner */}
          <div className="p-4 rounded-xl border flex items-center justify-between bg-slate-50 border-slate-200">
            <div className="flex items-center space-x-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {isOnline ? 'Koneksi Internet Online' : 'Mode Offline Aktif'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {assets.length} aset terdata lokal • Terakhir update: {syncSettings.lastSyncTimestamp || 'Hari ini'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full font-bold bg-blue-100 text-blue-900">
                {offlineQueue.length} transaksi pending
              </span>
              {offlineQueue.length > 0 && isOnline && (
                <button
                  onClick={handleProcessOfflineQueue}
                  disabled={isSyncing}
                  className="px-2 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition"
                >
                  Kirim Antrean
                </button>
              )}
            </div>
          </div>

          {/* Feedback message */}
          {syncStatusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                syncStatusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : syncStatusMsg.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncStatusMsg.text}</span>
            </div>
          )}

          {/* Progress bar if uploading */}
          {uploadProgress !== null && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span>Mengunggah Aset ke Firebase Cloud...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Firebase Cloud Actions Grid */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Aksi Sinkronisasi Firebase Firestore
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handlePushToFirebase}
                disabled={isSyncing || !isOnline}
                className="p-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
              >
                <ArrowUpCircle className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Unggah Semua Data ({assets.length} Aset) ke Cloud</span>
              </button>

              <button
                onClick={handlePullFromFirebase}
                disabled={isSyncing || !isOnline}
                className="p-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
              >
                <ArrowDownCircle className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Tarik Data Terbaru dari Cloud</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              * Setap perubahan data (tambah, edit, dan hapus barang oleh Admin & Timpel) secara otomatis tersinkronisasi ke Firebase Cloud Firestore secara real-time.
            </p>
          </div>

          {/* API Configuration */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Konfigurasi Integrasi Sistem Inventaris Pusat KAS:
            </h4>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Central Inventory Endpoint URL:
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Kode Registrasi Paroki:
                </label>
                <input
                  type="text"
                  value={parokiCode}
                  onChange={(e) => setParokiCode(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Keuskupan:
                </label>
                <input
                  type="text"
                  readOnly
                  value="Keuskupan Agung Semarang (KAS)"
                  className="w-full text-xs bg-slate-100 border border-slate-300 rounded-lg p-2 text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Backup & Restore JSON */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-700" />
              Cadangan File Lokal (JSON)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadBackup}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                Unduh Cadangan JSON
              </button>

              <label className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer text-center">
                <Upload className="w-4 h-4" />
                <span>Pulihkan dari File JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
