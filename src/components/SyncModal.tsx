import React, { useState } from 'react';
import { SyncSettings, OfflineAction, storageService } from '../services/storageService';
import { AssetItem, LoanRecord, MaintenanceRecord, AuditLog } from '../types/inventory';
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
  CloudCheck,
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
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);

    // Simulate real network sync with central KAS / backend
    setTimeout(() => {
      storageService.clearOfflineQueue();
      const updatedSettings: SyncSettings = {
        ...syncSettings,
        centralApiUrl: apiUrl,
        parokiCode,
        autoSync,
        lastSyncTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        serverStatus: isOnline ? 'connected' : 'disconnected',
      };
      onSaveSettings(updatedSettings);
      storageService.addAuditLog({
        namaBarang: 'Semua Aset Paroki',
        tipeAksi: 'SYNC_PUSAT',
        detailPerubahan: `Sinkronisasi berhasil dengan Sistem Inventaris Pusat KAS (${assets.length} item tersinkron)`,
        pelaku: 'Sistem Sinkronisasi',
        role: 'SYSTEM',
      });
      setIsSyncing(false);
      setSyncStatusMsg('Sinkronisasi data ke server pusat Keuskupan Agung Semarang berhasil!');
      onSyncComplete();
    }, 1200);
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
          setSyncStatusMsg(`Berhasil memulihkan ${json.data.assets.length} aset dari file backup!`);
        } else {
          setSyncStatusMsg('Format file JSON tidak cocok dengan struktur inventaris Sedayu.');
        }
      } catch (err) {
        setSyncStatusMsg('Gagal membaca file JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Server className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-semibold text-base">Sinkronisasi & Integrasi API Pusat</h3>
              <p className="text-xs text-slate-400">
                Koneksi data dengan Sistem Inventaris Pusat Keuskupan & Mode Offline Lapangan
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
        <div className="p-6 space-y-5">
          {/* Status banner */}
          <div className="p-4 rounded-xl border flex items-center justify-between bg-slate-50 border-slate-200">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {isOnline ? 'Terhubung ke Internet (Siap Sinkron)' : 'Mode Offline Aktif (Tersimpan Lokal)'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Terakhir sinkron: {syncSettings.lastSyncTimestamp || 'Belum pernah'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full font-bold bg-blue-100 text-blue-900">
                {offlineQueue.length} antrean pending
              </span>
            </div>
          </div>

          {syncStatusMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncStatusMsg}</span>
            </div>
          )}

          {/* Sync Trigger Button */}
          <div>
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="w-full py-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sedang Melakukan Sinkronisasi Data...' : 'Sinkronkan Sekarang dengan Sistem Pusat'}
            </button>
          </div>

          {/* API Configuration */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Konfigurasi Endpoint API Sistem Pusat:
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
              Cadangan & Pemulihan Basis Data Lokal (JSON)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadBackup}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                Unduh File Backup JSON
              </button>

              <label className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer text-center">
                <Upload className="w-4 h-4" />
                <span>Pulihkan dari JSON</span>
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
