import React, { useState, useEffect, useMemo } from 'react';
import {
  AssetItem,
  LoanRecord,
  MaintenanceRecord,
  AuditLog,
  AppUser,
  KondisiAset,
  TimpelKode,
  JenisAsetKode,
} from './types/inventory';
import { storageService, SyncSettings, OfflineAction } from './services/storageService';
import { exportService } from './services/exportService';
import {
  JENIS_ASET_LIST,
  TIMPEL_LIST,
  RUANG_LIST,
  LOKASI_UTAMA,
} from './data/referenceData';

// Modals
import { AssetFormModal } from './components/AssetFormModal';
import { AssetDetailModal } from './components/AssetDetailModal';
import { BarcodeModal } from './components/BarcodeModal';
import { BatchPrintModal } from './components/BatchPrintModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { LoanModal } from './components/LoanModal';
import { MaintenanceModal } from './components/MaintenanceModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { RoleAuthModal } from './components/RoleAuthModal';
import { SyncModal } from './components/SyncModal';
import { FrontLoginPage } from './components/FrontLoginPage';
import { UserManagementView } from './components/UserManagementView';

// Icons
import {
  Church,
  LayoutDashboard,
  Boxes,
  MapPin,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  QrCode,
  Camera,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Bell,
  Wifi,
  WifiOff,
  Shield,
  Layers,
  Wrench,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Download,
  Upload,
  ArrowUpDown,
  SlidersHorizontal,
  Info,
  Check,
  LogOut,
  Users,
} from 'lucide-react';

export default function App() {
  // State
  const [assets, setAssets] = useState<AssetItem[]>(() => storageService.getAssets());
  const [loans, setLoans] = useState<LoanRecord[]>(() => storageService.getLoans());
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(() =>
    storageService.getMaintenance()
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storageService.getAuditLogs());
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => storageService.getAuthSession());
  const [syncSettings, setSyncSettings] = useState<SyncSettings>(() =>
    storageService.getSyncSettings()
  );
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>(() =>
    storageService.getOfflineQueue()
  );

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'assets' | 'locations' | 'loans' | 'maintenance' | 'audit' | 'users' | 'sync'
  >('dashboard');

  // Network offline state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Search & Filters for Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLokasi, setSelectedLokasi] = useState<string>('all');
  const [selectedJenis, setSelectedJenis] = useState<string>('all');
  const [selectedTimpel, setSelectedTimpel] = useState<string>('all');
  const [selectedKondisi, setSelectedKondisi] = useState<string>('all');
  const [selectedStatusPinjam, setSelectedStatusPinjam] = useState<string>('all');
  const [selectedRuang, setSelectedRuang] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Modals visibility
  const [showFormModal, setShowFormModal] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<AssetItem | null>(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<AssetItem | null>(null);

  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedAssetForBarcode, setSelectedAssetForBarcode] = useState<AssetItem | null>(null);

  const [showBatchPrintModal, setShowBatchPrintModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);

  const [showLoanModal, setShowLoanModal] = useState(false);
  const [initialAssetForLoan, setInitialAssetForLoan] = useState<AssetItem | null>(null);
  const [loanToReturn, setLoanToReturn] = useState<LoanRecord | null>(null);

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [initialAssetForMaintenance, setInitialAssetForMaintenance] = useState<AssetItem | null>(null);

  const [showExcelImportModal, setShowExcelImportModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'warn';
  } | null>(null);

  // Notifications Drawer
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerToast('Koneksi internet terhubung kembali. Sinkronisasi otomatis aktif.', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      triggerToast('Mode offline aktif. Seluruh pencatatan tersimpan aman secara lokal.', 'warn');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Keep existing codes in memory for sequence calculator
  const allExistingCodes = useMemo(() => assets.map((a) => a.kodeAset), [assets]);

  // Save changes handler
  const handleSaveAsset = (newAsset: AssetItem) => {
    const exists = assets.some((a) => a.id === newAsset.id);
    let updated: AssetItem[];
    if (exists) {
      updated = assets.map((a) => (a.id === newAsset.id ? newAsset : a));
      storageService.addAuditLog({
        assetId: newAsset.id,
        assetKode: newAsset.kodeAset,
        namaBarang: newAsset.namaBarang,
        tipeAksi: 'EDIT_ASET',
        detailPerubahan: `Perubahan data aset: ${newAsset.namaBarang} (${newAsset.kondisi}, ${newAsset.lokasi})`,
        pelaku: currentUser?.name || 'Sekretariat PGPM',
        role: currentUser?.role || 'ADMIN_PGPM',
      });
      triggerToast(`Aset ${newAsset.namaBarang} berhasil diperbarui!`, 'success');
    } else {
      updated = [newAsset, ...assets];
      storageService.addAuditLog({
        assetId: newAsset.id,
        assetKode: newAsset.kodeAset,
        namaBarang: newAsset.namaBarang,
        tipeAksi: 'TAMBAH_ASET',
        detailPerubahan: `Penambahan inventaris baru: ${newAsset.namaBarang} (Kode: ${newAsset.kodeAset})`,
        pelaku: currentUser?.name || 'Sekretariat PGPM',
        role: currentUser?.role || 'ADMIN_PGPM',
      });
      triggerToast(`Aset baru ${newAsset.namaBarang} berhasil ditambahkan!`, 'success');
    }

    setAssets(updated);
    storageService.saveAssets(updated);
    setAuditLogs(storageService.getAuditLogs());
    setShowFormModal(false);
    setAssetToEdit(null);
  };

  const handleDeleteAsset = (assetToDelete: AssetItem) => {
    if (currentUser?.role !== 'ADMIN_PGPM') {
      triggerToast('Akses ditolak: Hanya ADMIN PGPM yang berwenang menghapus aset tetap gereja.', 'warn');
      return;
    }
    if (
      confirm(
        `Konfirmasi: Yakin ingin menghapus aset "${assetToDelete.namaBarang}" (${assetToDelete.kodeAset}) dari database PGPM?`
      )
    ) {
      const updated = assets.filter((a) => a.id !== assetToDelete.id);
      setAssets(updated);
      storageService.saveAssets(updated);
      storageService.addAuditLog({
        assetId: assetToDelete.id,
        assetKode: assetToDelete.kodeAset,
        namaBarang: assetToDelete.namaBarang,
        tipeAksi: 'HAPUS_ASET',
        detailPerubahan: `Penghapusan aset: ${assetToDelete.namaBarang} (${assetToDelete.kodeAset})`,
        pelaku: currentUser?.name || 'Sekretariat PGPM',
        role: currentUser?.role || 'ADMIN_PGPM',
      });
      setAuditLogs(storageService.getAuditLogs());
      setShowDetailModal(false);
      setSelectedAssetForDetail(null);
      triggerToast(`Aset ${assetToDelete.namaBarang} berhasil dihapus.`, 'info');
    }
  };

  // Quick physical check (Opname)
  const handleQuickOpname = (asset: AssetItem) => {
    const today = new Date().toISOString().slice(0, 10);
    const updated = assets.map((a) =>
      a.id === asset.id
        ? {
            ...a,
            terakhirOpname: today,
            auditorOpname: currentUser?.name || 'Sekretariat PGPM',
            kondisi: a.kondisi === 'Belum Opname' ? 'Baik' : a.kondisi,
          }
        : a
    );
    setAssets(updated);
    storageService.saveAssets(updated);
    storageService.addAuditLog({
      assetId: asset.id,
      assetKode: asset.kodeAset,
      namaBarang: asset.namaBarang,
      tipeAksi: 'OPNAME',
      detailPerubahan: `Verifikasi opname fisik selesai di ${asset.lokasi} (${asset.ruangNama})`,
      pelaku: currentUser?.name || 'Sekretariat PGPM',
      role: currentUser?.role || 'ADMIN_PGPM',
    });
    setAuditLogs(storageService.getAuditLogs());
    triggerToast(`Opname fisik "${asset.namaBarang}" berhasil diverifikasi!`, 'success');
  };

  // Loan Save & Return
  const handleSaveLoan = (loan: LoanRecord) => {
    const updatedLoans = [loan, ...loans];
    setLoans(updatedLoans);
    storageService.saveLoans(updatedLoans);

    // Update asset status
    const updatedAssets = assets.map((a) =>
      a.id === loan.assetId ? { ...a, statusPeminjaman: 'Dipinjam' as const } : a
    );
    setAssets(updatedAssets);
    storageService.saveAssets(updatedAssets);

    storageService.addAuditLog({
      assetId: loan.assetId,
      assetKode: loan.assetKode,
      namaBarang: loan.namaBarang,
      tipeAksi: 'PINJAM',
      detailPerubahan: `Peminjaman ${loan.jumlahPinjam} unit oleh ${loan.namaPeminjam} (${loan.lingkunganWilayah})`,
      pelaku: currentUser?.name || 'Sekretariat PGPM',
      role: currentUser?.role || 'ADMIN_PGPM',
    });
    setAuditLogs(storageService.getAuditLogs());

    setShowLoanModal(false);
    triggerToast(`Peminjaman untuk ${loan.namaPeminjam} berhasil dicatat!`, 'success');
  };

  const handleReturnLoan = (loanId: string, returnCondition: KondisiAset, notes: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const targetLoan = loans.find((l) => l.id === loanId);

    const updatedLoans = loans.map((l) =>
      l.id === loanId
        ? {
            ...l,
            status: 'Dikembalikan' as const,
            tanggalKembaliAktual: today,
            kondisiSaatKembali: returnCondition,
            catatan: notes ? `${l.catatan || ''} | Catatan Kembali: ${notes}` : l.catatan,
          }
        : l
    );
    setLoans(updatedLoans);
    storageService.saveLoans(updatedLoans);

    if (targetLoan) {
      // Revert asset status back to Tersedia
      const updatedAssets = assets.map((a) =>
        a.id === targetLoan.assetId
          ? {
              ...a,
              statusPeminjaman: 'Tersedia' as const,
              kondisi: returnCondition,
            }
          : a
      );
      setAssets(updatedAssets);
      storageService.saveAssets(updatedAssets);

      storageService.addAuditLog({
        assetId: targetLoan.assetId,
        assetKode: targetLoan.assetKode,
        namaBarang: targetLoan.namaBarang,
        tipeAksi: 'KEMBALI',
        detailPerubahan: `Pengembalian ${targetLoan.namaBarang} dari ${targetLoan.namaPeminjam} (Kondisi: ${returnCondition})`,
        pelaku: currentUser?.name || 'Sekretariat PGPM',
        role: currentUser?.role || 'ADMIN_PGPM',
      });
      setAuditLogs(storageService.getAuditLogs());
    }

    setShowLoanModal(false);
    setLoanToReturn(null);
    triggerToast('Barang pinjaman telah berhasil dikembalikan ke inventaris.', 'success');
  };

  // Maintenance Save
  const handleSaveMaintenance = (record: MaintenanceRecord) => {
    const exists = maintenance.some((m) => m.id === record.id);
    let updated: MaintenanceRecord[];
    if (exists) {
      updated = maintenance.map((m) => (m.id === record.id ? record : m));
    } else {
      updated = [record, ...maintenance];
    }
    setMaintenance(updated);
    storageService.saveMaintenance(updated);

    // Sync with asset item
    const updatedAssets = assets.map((a) =>
      a.id === record.assetId
        ? {
            ...a,
            jadwalPerawatan: record.tanggalJadwal,
            deskripsiPerawatan: record.jenisPemeliharaan,
          }
        : a
    );
    setAssets(updatedAssets);
    storageService.saveAssets(updatedAssets);

    storageService.addAuditLog({
      assetId: record.assetId,
      assetKode: record.assetKode,
      namaBarang: record.namaBarang,
      tipeAksi: 'PERAWATAN',
      detailPerubahan: `Jadwal pemeliharaan: ${record.jenisPemeliharaan} (${record.status})`,
      pelaku: currentUser?.name || 'Sekretariat PGPM',
      role: currentUser?.role || 'ADMIN_PGPM',
    });
    setAuditLogs(storageService.getAuditLogs());

    setShowMaintenanceModal(false);
    triggerToast('Jadwal pemeliharaan aset berhasil disimpan.', 'success');
  };

  // Import batch success
  const handleImportSuccess = (newItems: AssetItem[]) => {
    const updated = [...newItems, ...assets];
    setAssets(updated);
    storageService.saveAssets(updated);
    storageService.addAuditLog({
      namaBarang: `${newItems.length} Barang Impor`,
      tipeAksi: 'IMPORT_EXCEL',
      detailPerubahan: `Impor massal ${newItems.length} data inventaris dari spreadsheet`,
      pelaku: currentUser?.name || 'Sekretariat PGPM',
      role: currentUser?.role || 'ADMIN_PGPM',
    });
    setAuditLogs(storageService.getAuditLogs());
    triggerToast(`Berhasil mengimpor ${newItems.length} aset baru ke database!`, 'success');
  };

  // Restore backup
  const handleRestoreData = (data: {
    assets: AssetItem[];
    loans: LoanRecord[];
    maintenance: MaintenanceRecord[];
    auditLogs: AuditLog[];
  }) => {
    setAssets(data.assets);
    setLoans(data.loans || []);
    setMaintenance(data.maintenance || []);
    setAuditLogs(data.auditLogs || []);
    storageService.saveAssets(data.assets);
    storageService.saveLoans(data.loans || []);
    storageService.saveMaintenance(data.maintenance || []);
    storageService.saveAuditLogs(data.auditLogs || []);
    triggerToast(`Database berhasil dipulihkan (${data.assets.length} aset).`, 'success');
  };

  // Filtered Assets Computation
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.namaBarang.toLowerCase().includes(q) ||
          item.kodeAset.toLowerCase().includes(q) ||
          item.lokasi.toLowerCase().includes(q) ||
          item.ruangNama.toLowerCase().includes(q) ||
          item.pengguna.toLowerCase().includes(q) ||
          item.jenisAsetName.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Lokasi
      if (selectedLokasi !== 'all') {
        if (!item.lokasi.toLowerCase().includes(selectedLokasi.toLowerCase())) {
          return false;
        }
      }

      // Jenis
      if (selectedJenis !== 'all' && item.jenisAsetKode !== selectedJenis) {
        return false;
      }

      // Timpel
      if (selectedTimpel !== 'all' && item.timpelKode !== selectedTimpel) {
        return false;
      }

      // Kondisi
      if (selectedKondisi !== 'all' && item.kondisi !== selectedKondisi) {
        return false;
      }

      // Status Pinjam
      if (selectedStatusPinjam !== 'all' && item.statusPeminjaman !== selectedStatusPinjam) {
        return false;
      }

      // Ruang
      if (selectedRuang !== 'all' && item.ruangKode !== selectedRuang) {
        return false;
      }

      return true;
    });
  }, [
    assets,
    searchQuery,
    selectedLokasi,
    selectedJenis,
    selectedTimpel,
    selectedKondisi,
    selectedStatusPinjam,
    selectedRuang,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage) || 1;
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAssets.slice(start, start + itemsPerPage);
  }, [filteredAssets, currentPage, itemsPerPage]);

  // Analytics KPI
  const stats = useMemo(() => {
    const totalCount = assets.length;
    let totalPhysicalUnits = 0;
    let totalValuation = 0;
    let baikCount = 0;
    let rusakCount = 0;
    let belumOpnameCount = 0;
    let dipinjamCount = 0;

    assets.forEach((a) => {
      totalPhysicalUnits += a.quantity || 1;
      totalValuation += a.hargaNilai || 0;
      if (a.kondisi === 'Baik') baikCount++;
      else if (a.kondisi === 'Belum Opname') belumOpnameCount++;
      else rusakCount++;

      if (a.statusPeminjaman === 'Dipinjam') dipinjamCount++;
    });

    const activeMaintenanceOverdue = maintenance.filter((m) => m.status === 'Jatuh Tempo').length;
    const activeMaintenanceUpcoming = maintenance.filter((m) => m.status === 'Mendatang').length;

    return {
      totalCount,
      totalPhysicalUnits,
      totalValuation,
      baikCount,
      rusakCount,
      belumOpnameCount,
      dipinjamCount,
      activeMaintenanceOverdue,
      activeMaintenanceUpcoming,
    };
  }, [assets, maintenance]);

  // Locations breakdown for KIR
  const groupedLocations = useMemo(() => {
    const groups: Record<string, AssetItem[]> = {};
    assets.forEach((item) => {
      const locKey = item.lokasi || 'Gereja Paroki Sedayu';
      if (!groups[locKey]) groups[locKey] = [];
      groups[locKey].push(item);
    });
    return groups;
  }, [assets]);

  if (!currentUser) {
    return (
      <FrontLoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          storageService.setAuthSession(user);
          triggerToast(`Selamat datang, ${user.name}! Anda berhasil masuk sebagai ${user.role}.`, 'success');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Church Identity Brand */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <img
                src="/assets/aistudio/logo_transparent.png"
                alt="Logo Gereja St. Theresia Sedayu"
                className="h-10 sm:h-11 w-auto object-contain shrink-0 drop-shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('logo_6b0741bc.png')) {
                    target.src = '/assets/aistudio/logo_6b0741bc.png';
                  }
                }}
              />
              <div className="hidden sm:flex w-8 h-8 rounded-xl bg-gradient-to-br from-blue-700 to-blue-950 border border-blue-500/30 items-center justify-center font-bold text-amber-400 text-sm shadow-sm shrink-0">
                ✝
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-sm sm:text-base tracking-wide text-white">
                    INVENTARISASI GEREJA ST. THERESIA SEDAYU
                  </h1>
                  <span className="hidden md:inline-block px-2 py-0.5 bg-blue-950 text-blue-200 border border-blue-700/50 rounded text-[10px] font-mono font-bold">
                    PGPM SEDAYU
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span>Sistem Digital Aset Paroki</span>
                  <span>•</span>
                  <span>Pastor Kepala: Romo Antonius Hadi Cahyono, Pr</span>
                </p>
              </div>
            </div>

            {/* Quick Actions & Status Tools */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Online / Offline Indicator */}
              <button
                onClick={() => setShowSyncModal(true)}
                title={isOnline ? 'Online (Terhubung)' : 'Mode Offline Aktif'}
                className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                  isOnline
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                    : 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
                }`}
              >
                {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{isOnline ? 'Online' : 'Offline'}</span>
              </button>

              {/* Barcode Scanner Button */}
              <button
                onClick={() => setShowScannerModal(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition shadow-xs"
                title="Buka Kamera Scan Barcode"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Scan Barcode</span>
              </button>

              {/* New Asset Button */}
              <button
                onClick={() => {
                  setAssetToEdit(null);
                  setShowFormModal(true);
                }}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Input Aset Baru</span>
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition relative"
                  title="Notifikasi Perubahan Stok"
                >
                  <Bell className="w-4 h-4" />
                  {auditLogs.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  )}
                </button>

                {/* Notifications Dropdown Drawer */}
                {showNotificationDrawer && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 text-slate-900 p-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <div className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-blue-700" />
                        Log Perubahan Stok & Mutasi
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {auditLogs.slice(0, 10).map((log) => (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-900 text-[11px]">
                              {log.tipeAksi.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                          </div>
                          <div className="text-slate-700">{log.detailPerubahan}</div>
                          <div className="text-[10px] text-slate-400">
                            Oleh: <strong className="text-slate-600">{log.pelaku}</strong>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                      <button
                        onClick={() => {
                          setShowNotificationDrawer(false);
                          setActiveTab('audit');
                        }}
                        className="text-xs text-blue-800 font-semibold hover:underline"
                      >
                        Lihat Seluruh Log Mutasi & Audit
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile / Role Switcher */}
              <button
                onClick={() => setShowRoleModal(true)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition text-left"
                title="Lihat Hak Akses & Ganti Peran"
              >
                <div
                  className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center ${
                    currentUser.role === 'ADMIN_PGPM'
                      ? 'bg-blue-900 text-amber-300'
                      : currentUser.role === 'AUDITOR_DEWAN'
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-700 text-white'
                  }`}
                >
                  {currentUser.role === 'ADMIN_PGPM' ? '✝' : currentUser.role === 'AUDITOR_DEWAN' ? '⚖' : '✓'}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-bold text-white truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">{currentUser.role}</div>
                </div>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  storageService.logout();
                  setCurrentUser(null);
                  triggerToast('Anda telah keluar dari sistem inventaris.', 'info');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/80 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-200 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Keluar ke Halaman Muka (Logout)"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="bg-slate-950/80 px-4 sm:px-6 lg:px-8 border-t border-slate-800 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-2 py-2">
            {[
              { id: 'dashboard', label: 'Dashboard Analitik', icon: LayoutDashboard },
              { id: 'assets', label: `Daftar Aset (${assets.length})`, icon: Boxes },
              { id: 'locations', label: 'Pelacakan Lokasi & KIR', icon: MapPin },
              { id: 'loans', label: `Peminjaman (${loans.filter((l) => l.status === 'Sedang Dipinjam').length})`, icon: CalendarDays },
              { id: 'maintenance', label: `Jadwal Pemeliharaan (${maintenance.filter((m) => m.status === 'Jatuh Tempo').length > 0 ? '⚠️' : maintenance.length})`, icon: Wrench },
              { id: 'audit', label: 'Log Mutasi & Audit', icon: FileText },
              ...(currentUser?.role === 'ADMIN_PGPM'
                ? [{ id: 'users', label: 'Registrasi User', icon: Users }]
                : []),
              { id: 'sync', label: 'Integrasi API & Backup', icon: RefreshCw },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grow">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center space-x-2.5 border animate-in slide-in-from-bottom-5 duration-200 ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-emerald-500'
                : toastMessage.type === 'warn'
                ? 'bg-amber-900 text-white border-amber-400'
                : 'bg-blue-900 text-white border-blue-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* -------------------- TAB 1: DASHBOARD ANALITIK -------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Hero Banner */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/50 relative overflow-hidden">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-400/20 border border-amber-400/30 rounded-full text-amber-300 text-xs font-bold mb-3">
                  <span>✝ PGPM PAROKI SANTA THERESIA SEDAYU</span>
                  <span>•</span>
                  <span>SISTEM ASET DIGITAL</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
                  Sistem Informasi Manajemen Inventarisasi Aset Tetap Gereja
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  Pendataan digital komprehensif mencakup 922+ aset fisik Paroki Sedayu dan 5 Kapel
                  (Metes, Sumbersari, Demangan, Kaliduren, Jurug), dilengkapi kodifikasi KAS, label barcode,
                  pelacakan peminjaman, serta audit opname fisik berkala.
                </p>

                {/* Quick Action Badges */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => {
                      setAssetToEdit(null);
                      setShowFormModal(true);
                    }}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition"
                  >
                    <Plus className="w-4 h-4" />
                    Input Aset Baru
                  </button>
                  <button
                    onClick={() => setShowScannerModal(true)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition"
                  >
                    <Camera className="w-4 h-4 text-amber-300" />
                    Scan Barcode Lapangan
                  </button>
                  <button
                    onClick={() => setShowBatchPrintModal(true)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition"
                  >
                    <Printer className="w-4 h-4 text-amber-300" />
                    Cetak Stiker Massal
                  </button>
                  <button
                    onClick={() => setShowExcelImportModal(true)}
                    className="px-4 py-2 bg-emerald-800/60 hover:bg-emerald-800 text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-emerald-600/40 transition"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Impor Excel
                  </button>
                </div>
              </div>

              {/* Background emblem */}
              <div className="absolute right-4 -bottom-10 opacity-10 text-[200px] font-black select-none pointer-events-none text-white">
                ✝
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-slate-400 text-xs font-semibold">Total Item Inventaris</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900 font-mono">{stats.totalCount}</span>
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full">
                    {stats.totalPhysicalUnits} Unit Fisik
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Terdaftar di Paroki Sedayu & 5 Kapel
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-slate-400 text-xs font-semibold">Estimasi Nilai Aset</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-slate-900 font-mono truncate">
                    {stats.totalValuation > 0
                      ? `Rp ${(stats.totalValuation / 1_000_000).toFixed(1)} Jt`
                      : 'Rp 650+ Juta'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Aset Tetap
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Termasuk Tanah SHM, Sound & Gedung
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-slate-400 text-xs font-semibold">Kondisi Fisik Barang</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-emerald-700 font-mono">
                    {Math.round((stats.baikCount / stats.totalCount) * 100)}%
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                    {stats.baikCount} Baik
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  {stats.rusakCount} Rusak/Perlu Servis • {stats.belumOpnameCount} Belum Cek
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-slate-400 text-xs font-semibold">Sirkulasi & Pemeliharaan</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-purple-900 font-mono">{stats.dipinjamCount}</span>
                  <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full">
                    Dipinjam Umat
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  {stats.activeMaintenanceOverdue > 0 ? (
                    <span className="text-red-600 font-bold">⚠️ {stats.activeMaintenanceOverdue} Servis Jatuh Tempo</span>
                  ) : (
                    <span>{stats.activeMaintenanceUpcoming} Terjadwal Perawatan</span>
                  )}
                </div>
              </div>
            </div>

            {/* Distribution Charts & Location Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-800" />
                    Distribusi Aset Berdasarkan Kelompok & Tim Pelayanan (KAS)
                  </h3>
                  <button
                    onClick={() => setActiveTab('assets')}
                    className="text-xs font-semibold text-blue-800 hover:underline"
                  >
                    Buka Semua Katalog
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {JENIS_ASET_LIST.slice(0, 9).map((cat) => {
                    const count = assets.filter((a) => a.jenisAsetKode === cat.code).length;
                    const percent = Math.round((count / assets.length) * 100) || 0;
                    return (
                      <div
                        key={cat.code}
                        onClick={() => {
                          setSelectedJenis(cat.code);
                          setActiveTab('assets');
                        }}
                        className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl cursor-pointer transition"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs font-bold px-1.5 py-0.2 bg-white rounded border border-slate-200 text-blue-900">
                            {cat.code}
                          </span>
                          <span className="text-xs font-black text-slate-800">{count} item</span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-700 truncate">
                          {cat.name.replace(/^Kelompok \d:\s*/, '')}
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-blue-700 h-full rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Timpel Badges */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500 text-[11px]">Tim Pelayanan:</span>
                  {TIMPEL_LIST.map((t) => {
                    const c = assets.filter((a) => a.timpelKode === t.code).length;
                    return (
                      <button
                        key={t.code}
                        onClick={() => {
                          setSelectedTimpel(t.code);
                          setActiveTab('assets');
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition"
                      >
                        <strong>{t.code}</strong>. {t.name} ({c})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-800" />
                    Sebaran Wilayah & Kapel
                  </h3>
                  <button
                    onClick={() => setActiveTab('locations')}
                    className="text-xs font-semibold text-blue-800 hover:underline"
                  >
                    Detail KIR
                  </button>
                </div>

                <div className="space-y-2.5">
                  {[
                    { name: 'Gereja Paroki Sedayu', key: 'Gereja Paroki' },
                    { name: 'Kapel Santa Maria Regina Kaliduren', key: 'Kaliduren' },
                    { name: 'Kapel Santo Yusuf Metes', key: 'Metes' },
                    { name: 'Kapel Santo Petrus Demangan', key: 'Demangan' },
                    { name: 'Kapel Santo Matius Jurug', key: 'Jurug' },
                    { name: 'Kapel Santa Theresia Sumbersari', key: 'Sumbersari' },
                    { name: 'Pastoran & Kantor Romo', key: 'PASTORAN' },
                    { name: 'Aula Paroki', key: 'AULA' },
                  ].map((loc) => {
                    const count = assets.filter((a) =>
                      a.lokasi.toLowerCase().includes(loc.key.toLowerCase())
                    ).length;
                    return (
                      <div
                        key={loc.name}
                        onClick={() => {
                          setSelectedLokasi(loc.key);
                          setActiveTab('assets');
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition text-xs"
                      >
                        <span className="font-semibold text-slate-800 truncate max-w-[190px]">
                          {loc.name}
                        </span>
                        <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                          {count} item
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Export Reports Banner */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Ekspor Laporan Inventaris Resmi Paroki Sedayu (KAS)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unduh rekapan aset lengkap dengan kop resmi PGPM untuk kebutuhan audit keuskupan,
                  laporan pertanggungjawaban tahunan, atau arsip stasi.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => exportService.exportAssetsToExcel(assets, 'Master_Inventaris_Sedayu')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Ekspor Excel (.xlsx)
                </button>
                <button
                  onClick={() => exportService.exportAssetsToPDF(assets)}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <FileText className="w-4 h-4" />
                  Ekspor PDF Resmi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB 2: DAFTAR INVENTARIS ASET (KATALOG) -------------------- */}
        {activeTab === 'assets' && (
          <div className="space-y-4">
            {/* Search & Filters Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              {/* Row 1: Search bar + View Mode + Quick Export */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Cari nama barang, kode inventaris (401-2024...), lokasi, pengguna, atau ruangan..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportService.exportAssetsToExcel(filteredAssets, selectedLokasi)}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    title="Export Filtered ke Excel"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Excel
                  </button>

                  <button
                    onClick={() =>
                      exportService.exportAssetsToPDF(
                        filteredAssets,
                        'LAPORAN INVENTARISASI ASET TETAP',
                        `Lokasi: ${selectedLokasi} | Timpel: ${selectedTimpel}`
                      )
                    }
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    title="Export Filtered ke PDF"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    PDF
                  </button>

                  <button
                    onClick={() => setShowBatchPrintModal(true)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                    Cetak Stiker
                  </button>
                </div>
              </div>

              {/* Row 2: Filter Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                {/* Lokasi */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Lokasi:
                  </label>
                  <select
                    value={selectedLokasi}
                    onChange={(e) => {
                      setSelectedLokasi(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-xs"
                  >
                    <option value="all">Semua Lokasi</option>
                    <option value="Gereja Paroki">Gereja Paroki Sedayu</option>
                    <option value="Kaliduren">Kapel Kaliduren</option>
                    <option value="Metes">Kapel Metes</option>
                    <option value="Demangan">Kapel Demangan</option>
                    <option value="Jurug">Kapel Jurug</option>
                    <option value="Sumbersari">Kapel Sumbersari</option>
                    <option value="PASTORAN">Pastoran</option>
                    <option value="AULA">Aula</option>
                    <option value="SAKRISTI">Sakristi</option>
                  </select>
                </div>

                {/* Jenis Aset */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Jenis Aset (KAS):
                  </label>
                  <select
                    value={selectedJenis}
                    onChange={(e) => {
                      setSelectedJenis(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-xs"
                  >
                    <option value="all">Semua Jenis Aset</option>
                    {JENIS_ASET_LIST.map((j) => (
                      <option key={j.code} value={j.code}>
                        {j.code} - {j.name.replace(/^Kelompok \d:\s*/, '')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Timpel */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Timpel:
                  </label>
                  <select
                    value={selectedTimpel}
                    onChange={(e) => {
                      setSelectedTimpel(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-xs"
                  >
                    <option value="all">Semua Timpel</option>
                    {TIMPEL_LIST.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.code} - {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kondisi */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Kondisi Fisik:
                  </label>
                  <select
                    value={selectedKondisi}
                    onChange={(e) => {
                      setSelectedKondisi(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-xs"
                  >
                    <option value="all">Semua Kondisi</option>
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Sedang">Rusak Sedang</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                    <option value="Belum Opname">Belum Opname</option>
                  </select>
                </div>

                {/* Status Pinjam */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Status Pinjam:
                  </label>
                  <select
                    value={selectedStatusPinjam}
                    onChange={(e) => {
                      setSelectedStatusPinjam(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-xs"
                  >
                    <option value="all">Semua Status</option>
                    <option value="Tersedia">Tersedia</option>
                    <option value="Dipinjam">Sedang Dipinjam</option>
                    <option value="Perbaikan">Sedang Servis</option>
                  </select>
                </div>

                {/* Reset Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedLokasi('all');
                      setSelectedJenis('all');
                      setSelectedTimpel('all');
                      setSelectedKondisi('all');
                      setSelectedStatusPinjam('all');
                      setCurrentPage(1);
                    }}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count & Quick Status */}
            <div className="flex items-center justify-between text-xs px-2 text-slate-500">
              <div>
                Menampilkan <strong>{filteredAssets.length}</strong> aset (Halaman {currentPage} dari {totalPages})
              </div>
              <div className="flex items-center gap-2">
                <span>Per Halaman:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value, 10));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Main Asset Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white border-b border-slate-800">
                      <th className="py-3 px-3 w-10 text-center font-mono">No</th>
                      <th className="py-3 px-3 font-mono">Kode Aset (KAS)</th>
                      <th className="py-3 px-4">Nama Barang</th>
                      <th className="py-3 px-3">Timpel</th>
                      <th className="py-3 px-3 text-center">Tahun</th>
                      <th className="py-3 px-3 text-center">Jumlah</th>
                      <th className="py-3 px-3">Kondisi</th>
                      <th className="py-3 px-3">Lokasi & Ruang</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedAssets.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-400">
                          Tidak ada aset yang sesuai dengan kriteria filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      paginatedAssets.map((item, idx) => {
                        const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-blue-50/50 transition cursor-pointer group"
                            onClick={() => {
                              setSelectedAssetForDetail(item);
                              setShowDetailModal(true);
                            }}
                          >
                            <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                              {globalIndex}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-blue-950 whitespace-nowrap">
                              <span className="bg-slate-100 group-hover:bg-white px-2 py-0.5 rounded border border-slate-200">
                                {item.kodeAset}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                              {item.namaBarang}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                {item.timpelKode} - {item.timpelName}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                              {item.tahunPerolehan}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-800 whitespace-nowrap">
                              {item.quantity} {item.satuan}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.kondisi === 'Baik'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.kondisi === 'Rusak Berat'
                                    ? 'bg-red-100 text-red-800'
                                    : item.kondisi === 'Belum Opname'
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {item.kondisi}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 max-w-[200px] truncate text-slate-700">
                              <span className="font-medium text-slate-800 block truncate">
                                {item.lokasi}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {item.ruangNama}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.statusPeminjaman === 'Tersedia'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-purple-100 text-purple-800 border border-purple-200'
                                }`}
                              >
                                {item.statusPeminjaman}
                              </span>
                            </td>
                            <td
                              className="py-2.5 px-3 text-right whitespace-nowrap space-x-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setSelectedAssetForBarcode(item);
                                  setShowBarcodeModal(true);
                                }}
                                className="p-1 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-slate-100 transition"
                                title="Cetak Barcode / QR Label"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleQuickOpname(item)}
                                className="p-1 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition"
                                title="Verifikasi Cek Fisik (Opname)"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setAssetToEdit(item);
                                  setShowFormModal(true);
                                }}
                                className="p-1 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-slate-100 transition"
                                title="Edit Aset"
                              >
                                <SlidersHorizontal className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-500">
                  Total {filteredAssets.length} aset terdata di bawah pengelolaan PGPM Sedayu
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-white transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-3 font-mono font-bold text-slate-700">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-white transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB 3: PELACAKAN LOKASI & KARTU INVENTARIS RUANGAN (KIR) -------------------- */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Pelacakan Lokasi Fisik & Kartu Inventaris Ruangan (KIR)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kartu inventaris ditempelkan di ruang masing-masing secara periodik untuk pemantauan fisik aset.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportService.exportAssetsToPDF(assets, 'REKAPITULASI ASET SELURUH WILAYAH')}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Semua KIR
                </button>
              </div>
            </div>

            {/* List of Locations Accordion/Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.entries(groupedLocations).map(([locName, items]) => {
                const baikCount = items.filter((i) => i.kondisi === 'Baik').length;
                const rusakCount = items.filter((i) => i.kondisi.includes('Rusak')).length;
                return (
                  <div
                    key={locName}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-blue-300 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-xs">
                          <MapPin className="w-4 h-4 text-blue-800" />
                        </span>
                        <span className="text-xs font-bold font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                          {items.length} Aset
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 mb-1">{locName}</h4>
                      <p className="text-[11px] text-slate-500">
                        {baikCount} Baik • {rusakCount} Rusak/Perbaikan
                      </p>

                      {/* Sample items preview */}
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
                        {items.slice(0, 4).map((i) => (
                          <div key={i.id} className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-700 truncate max-w-[180px]">• {i.namaBarang}</span>
                            <span className="font-mono text-slate-400 text-[10px]">{i.quantity} {i.satuan}</span>
                          </div>
                        ))}
                        {items.length > 4 && (
                          <div className="text-[10px] text-blue-800 font-semibold pt-1">
                            + {items.length - 4} barang lainnya
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedLokasi(locName);
                          setActiveTab('assets');
                        }}
                        className="text-xs font-bold text-blue-800 hover:underline"
                      >
                        Buka Daftar Item
                      </button>

                      <button
                        onClick={() =>
                          exportService.exportAssetsToPDF(
                            items,
                            `KARTU INVENTARIS RUANGAN (KIR) - ${locName.toUpperCase()}`,
                            locName
                          )
                        }
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Cetak KIR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------- TAB 4: PEMINJAMAN ASET (SIRKULASI) -------------------- */}
        {activeTab === 'loans' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Manajemen Peminjaman & Sirkulasi Aset Paroki
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pencatatan tertib peminjaman barang (kursi, sound portable, proyektor, tenda, kabel) untuk misa lingkungan, OMK, dan retret.
                </p>
              </div>

              <button
                onClick={() => {
                  setInitialAssetForLoan(null);
                  setLoanToReturn(null);
                  setShowLoanModal(true);
                }}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Tambah Peminjaman Baru
              </button>
            </div>

            {/* Active & Past Loans List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="py-3 px-3 font-mono">No. Pinjam</th>
                      <th className="py-3 px-4">Barang Dipinjam</th>
                      <th className="py-3 px-3">Nama Peminjam</th>
                      <th className="py-3 px-3">Lingkungan / Acara</th>
                      <th className="py-3 px-3 text-center">Tgl Pinjam</th>
                      <th className="py-3 px-3 text-center">Rencana Kembali</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loans.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          Belum ada riwayat peminjaman barang inventaris.
                        </td>
                      </tr>
                    ) : (
                      loans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 font-mono font-bold text-blue-950">
                            {loan.id}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{loan.namaBarang}</span>
                            <span className="font-mono text-[10px] text-slate-500">{loan.assetKode} • {loan.jumlahPinjam} unit</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-800 block">{loan.namaPeminjam}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{loan.kontakPeminjam || '-'}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            <span className="font-medium text-slate-800 block">{loan.lingkunganWilayah}</span>
                            <span className="text-[11px] text-slate-500 block truncate max-w-xs">{loan.keperluan}</span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600">
                            {loan.tanggalPinjam}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                            {loan.tanggalKembaliRencana}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                loan.status === 'Sedang Dipinjam'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}
                            >
                              {loan.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => exportService.exportLoanReceiptPDF(loan)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                              title="Cetak Surat Jalan Pinjam PDF"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-700" />
                              Surat Jalan
                            </button>

                            {loan.status === 'Sedang Dipinjam' && (
                              <button
                                onClick={() => {
                                  setLoanToReturn(loan);
                                  setShowLoanModal(true);
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Kembalikan
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB 5: JADWAL PEMELIHARAAN ASET -------------------- */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Jadwal Pemeliharaan & Perawatan Berkala Aset
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pemeliharaan preventif untuk pendingin udara (AC), Genset 20kVA, Audio Mixer digital, pompa air submersible, dan CCTV.
                </p>
              </div>

              <button
                onClick={() => {
                  setInitialAssetForMaintenance(null);
                  setShowMaintenanceModal(true);
                }}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Tambah Jadwal Servis
              </button>
            </div>

            {/* Maintenance cards list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {maintenance.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-bold">
                        {m.assetKode}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{m.namaBarang}</h4>
                      <p className="text-xs text-slate-600">{m.lokasi}</p>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        m.status === 'Jatuh Tempo'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : m.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pekerjaan:</span>
                      <span className="font-semibold text-slate-800">{m.jenisPemeliharaan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Frekuensi & Tanggal:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {m.frekuensi} • {m.tanggalJadwal}
                      </span>
                    </div>
                    {m.teknisi && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Teknisi / Rekanan:</span>
                        <span className="font-medium text-slate-800">{m.teknisi}</span>
                      </div>
                    )}
                    {m.biayaEstimasi && m.biayaEstimasi > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Estimasi Biaya:</span>
                        <span className="font-mono font-bold text-slate-900">
                          Rp {m.biayaEstimasi.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>

                  {m.catatan && (
                    <div className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                      Catatan: {m.catatan}
                    </div>
                  )}

                  {m.status !== 'Selesai' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() =>
                          handleSaveMaintenance({
                            ...m,
                            status: 'Selesai',
                            terakhirSelesai: new Date().toISOString().slice(0, 10),
                          })
                        }
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Tandai Servis Selesai
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------- TAB 6: LOG MUTASI & AUDIT TRAIL -------------------- */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Log Riwayat Mutasi, Opname & Perubahan Stok Real-Time
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jejak audit digital lengkap setiap transaksi barang masuk, keluar, opname berkala, dan perawatan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg">
                  {auditLogs.length} Aktivitas Tercatat
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50 transition flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          log.tipeAksi === 'TAMBAH_ASET'
                            ? 'bg-blue-100 text-blue-800'
                            : log.tipeAksi === 'PINJAM'
                            ? 'bg-amber-100 text-amber-800'
                            : log.tipeAksi === 'KEMBALI'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.tipeAksi === 'OPNAME'
                            ? 'bg-purple-100 text-purple-800'
                            : log.tipeAksi === 'PERAWATAN'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.tipeAksi === 'TAMBAH_ASET'
                          ? '+'
                          : log.tipeAksi === 'PINJAM'
                          ? '↗'
                          : log.tipeAksi === 'KEMBALI'
                          ? '↙'
                          : log.tipeAksi === 'OPNAME'
                          ? '✓'
                          : '⛯'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            {log.tipeAksi.replace('_', ' ')}
                          </span>
                          {log.assetKode && (
                            <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-100 rounded border border-slate-200 text-slate-600">
                              {log.assetKode}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 mt-0.5">{log.detailPerubahan}</p>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Diproses oleh: <strong>{log.pelaku}</strong> ({log.role})
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-[10px] text-slate-400 block">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB 7: INTEGRASI API & SINKRONISASI -------------------- */}
        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Sinkronisasi Data Pusat & Arsitektur Offline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Integrasi REST API dengan database server terstruktur, antrean offline otomatis, dan cadangan JSON.
                </p>
              </div>

              <button
                onClick={() => setShowSyncModal(true)}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <RefreshCw className="w-4 h-4" />
                Buka Panel Sinkronisasi
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-slate-400 text-xs font-bold uppercase">Status Jaringan</span>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span className="font-bold text-slate-900 text-sm">
                    {isOnline ? 'Online (Terhubung)' : 'Mode Offline Aktif'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Dalam mode offline, data tetap tersimpan di IndexedDB & LocalStorage perangkat.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-slate-400 text-xs font-bold uppercase">Sistem Inventaris Pusat</span>
                <div className="font-bold text-slate-900 text-sm font-mono truncate">
                  {syncSettings.parokiCode}
                </div>
                <p className="text-[11px] text-slate-500">
                  Koneksi terdaftar di Keuskupan Agung Semarang (KAS).
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-slate-400 text-xs font-bold uppercase">Antrean Offline</span>
                <div className="font-bold text-slate-900 text-sm font-mono">
                  {offlineQueue.length} Perubahan Tertunda
                </div>
                <p className="text-[11px] text-slate-500">
                  Akan disinkronisasikan otomatis ketika perangkat terhubung sinyal internet.
                </p>
              </div>
            </div>

            {/* Database Reset Option */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Kembalikan ke Data Dokumen Asli (Reset Factory)</span>
                <span className="text-slate-500">
                  Memulihkan 922 aset awal dari dokumen Excel & CSV Paroki St. Theresia Sedayu jika diperlukan.
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Yakin ingin mereset seluruh database inventaris ke kondisi awal data paroki?')) {
                    storageService.resetAllToFactory();
                    setAssets(storageService.getAssets());
                    setLoans(storageService.getLoans());
                    setMaintenance(storageService.getMaintenance());
                    setAuditLogs(storageService.getAuditLogs());
                    triggerToast('Database berhasil direset ke data dokumen awal.', 'info');
                  }
                }}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition shrink-0"
              >
                Reset Data Awal
              </button>
            </div>
          </div>
        )}

        {/* -------------------- TAB: REGISTRASI & MANAJEMEN USER (KHUSUS ADMIN PGPM) -------------------- */}
        {activeTab === 'users' && currentUser?.role === 'ADMIN_PGPM' && (
          <UserManagementView
            currentUser={currentUser}
            onUserListChanged={() => {}}
            triggerToast={triggerToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>INVENTARISASI GEREJA ST. THERESIA SEDAYU</strong> • PGPM Paroki St. Theresia Sedayu
          </div>
          <div className="text-[11px] text-slate-500">
            Pastor Kepala Paroki: <strong>Romo Antonius Hadi Cahyono, Pr</strong>
          </div>
        </div>
      </footer>

      {/* ALL MODALS */}
      {showFormModal && (
        <AssetFormModal
          assetToEdit={assetToEdit}
          existingCodes={allExistingCodes}
          onSave={handleSaveAsset}
          onClose={() => {
            setShowFormModal(false);
            setAssetToEdit(null);
          }}
        />
      )}

      {showDetailModal && selectedAssetForDetail && (
        <AssetDetailModal
          asset={selectedAssetForDetail}
          loans={loans}
          maintenance={maintenance}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAssetForDetail(null);
          }}
          onEdit={(asset) => {
            setShowDetailModal(false);
            setAssetToEdit(asset);
            setShowFormModal(true);
          }}
          onDelete={handleDeleteAsset}
          onOpenBarcode={(asset) => {
            setSelectedAssetForBarcode(asset);
            setShowBarcodeModal(true);
          }}
          onOpenLoan={(asset) => {
            setInitialAssetForLoan(asset);
            setShowLoanModal(true);
          }}
          onOpenMaintenance={(asset) => {
            setInitialAssetForMaintenance(asset);
            setShowMaintenanceModal(true);
          }}
          onQuickOpname={handleQuickOpname}
        />
      )}

      {showBarcodeModal && selectedAssetForBarcode && (
        <BarcodeModal
          asset={selectedAssetForBarcode}
          onClose={() => {
            setShowBarcodeModal(false);
            setSelectedAssetForBarcode(null);
          }}
        />
      )}

      {showBatchPrintModal && (
        <BatchPrintModal
          assets={filteredAssets}
          onClose={() => setShowBatchPrintModal(false)}
        />
      )}

      {showScannerModal && (
        <BarcodeScannerModal
          assets={assets}
          onClose={() => setShowScannerModal(false)}
          onSelectAsset={(asset) => {
            setSelectedAssetForDetail(asset);
            setShowDetailModal(true);
          }}
          onQuickOpname={handleQuickOpname}
        />
      )}

      {showLoanModal && (
        <LoanModal
          initialAsset={initialAssetForLoan}
          assets={assets}
          loanToReturn={loanToReturn}
          onSaveLoan={handleSaveLoan}
          onReturnLoan={handleReturnLoan}
          onClose={() => {
            setShowLoanModal(false);
            setInitialAssetForLoan(null);
            setLoanToReturn(null);
          }}
        />
      )}

      {showMaintenanceModal && (
        <MaintenanceModal
          initialAsset={initialAssetForMaintenance}
          assets={assets}
          onSave={handleSaveMaintenance}
          onClose={() => {
            setShowMaintenanceModal(false);
            setInitialAssetForMaintenance(null);
          }}
        />
      )}

      {showExcelImportModal && (
        <ExcelImportModal
          existingCodes={allExistingCodes}
          onImportSuccess={handleImportSuccess}
          onClose={() => setShowExcelImportModal(false)}
        />
      )}

      {showRoleModal && currentUser && (
        <RoleAuthModal
          currentUser={currentUser}
          onSelectUser={(u) => {
            setCurrentUser(u);
            storageService.setAuthSession(u);
            triggerToast(`Beralih ke profil: ${u.name} (${u.role})`, 'info');
          }}
          onLogout={() => {
            storageService.logout();
            setCurrentUser(null);
            setShowRoleModal(false);
            triggerToast('Anda telah berhasil keluar dari sistem inventaris.', 'info');
          }}
          onClose={() => setShowRoleModal(false)}
        />
      )}

      {showSyncModal && (
        <SyncModal
          isOnline={isOnline}
          syncSettings={syncSettings}
          offlineQueue={offlineQueue}
          assets={assets}
          loans={loans}
          maintenance={maintenance}
          auditLogs={auditLogs}
          onSaveSettings={(s) => {
            setSyncSettings(s);
            storageService.saveSyncSettings(s);
          }}
          onSyncComplete={() => {
            setOfflineQueue([]);
            triggerToast('Sinkronisasi data dengan sistem pusat selesai.', 'success');
          }}
          onRestoreData={handleRestoreData}
          onClose={() => setShowSyncModal(false)}
        />
      )}
    </div>
  );
}
