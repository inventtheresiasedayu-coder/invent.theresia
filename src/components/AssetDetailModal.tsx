import React, { useState } from 'react';
import { AssetItem, LoanRecord, MaintenanceRecord } from '../types/inventory';
import {
  X,
  MapPin,
  Calendar,
  Layers,
  Wrench,
  QrCode,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  ShieldCheck,
  ArrowLeftRight,
  User,
  Phone,
  AlertTriangle,
  FileText,
  Plus,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface AssetDetailModalProps {
  asset: AssetItem;
  loans: LoanRecord[];
  maintenance: MaintenanceRecord[];
  onClose: () => void;
  onEdit: (asset: AssetItem) => void;
  onDelete: (asset: AssetItem) => void;
  onOpenBarcode: (asset: AssetItem) => void;
  onOpenLoan: (asset: AssetItem) => void;
  onOpenMaintenance: (asset: AssetItem) => void;
  onQuickOpname: (asset: AssetItem) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  loans,
  maintenance,
  onClose,
  onEdit,
  onDelete,
  onOpenBarcode,
  onOpenLoan,
  onOpenMaintenance,
  onQuickOpname,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'loans' | 'maintenance'>('info');

  const assetLoans = loans.filter(
    (l) =>
      l.assetId === asset.id ||
      l.assetKode === asset.kodeAset ||
      (asset.namaBarang && l.namaBarang && l.namaBarang.toLowerCase().trim() === asset.namaBarang.toLowerCase().trim())
  );

  const assetMaintenance = maintenance.filter(
    (m) =>
      m.assetId === asset.id ||
      m.assetKode === asset.kodeAset ||
      (asset.namaBarang && m.namaBarang && m.namaBarang.toLowerCase().trim() === asset.namaBarang.toLowerCase().trim())
  );

  const activeLoan = assetLoans.find((l) => l.status === 'Sedang Dipinjam');
  const overdueMaintenance = assetMaintenance.some((m) => m.status === 'Jatuh Tempo');

  const totalMaintenanceCost = assetMaintenance.reduce(
    (acc, m) => acc + (m.biayaEstimasi || 0),
    0
  );

  const codeParts = asset.kodeAset.split('-');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="w-9 h-9 rounded-xl bg-blue-800 text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              ✝
            </span>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block truncate">
                {asset.jenisAsetName} • TIMPEL {asset.timpelName}
              </span>
              <h3 className="font-bold text-base text-white truncate max-w-md">{asset.namaBarang}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 pt-3 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Info className="w-4 h-4" />
            Informasi & Spesifikasi
          </button>

          <button
            onClick={() => setActiveTab('loans')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'loans'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            Riwayat Peminjaman
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeLoan
                  ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {assetLoans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Riwayat Servis & Servicing
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                overdueMaintenance
                  ? 'bg-red-100 text-red-800 font-bold border border-red-300 animate-pulse'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {assetMaintenance.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 grow bg-slate-50/30">
          {/* TAB 1: INFORMASI UMUM */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Main Info Banner */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5 font-medium">Kode Inventaris Resmi:</span>
                  <span className="font-mono text-base font-black text-blue-950 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 shadow-xs inline-block">
                    {asset.kodeAset}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      asset.kondisi === 'Baik'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : asset.kondisi === 'Rusak Berat'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    Kondisi: {asset.kondisi}
                  </span>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      asset.statusPeminjaman === 'Tersedia'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}
                  >
                    Status: {asset.statusPeminjaman}
                  </span>
                </div>
              </div>

              {/* Breakdown Code Badges (Level 1-6) */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white shadow-xs">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Dekonstruksi Kodifikasi KAS:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[10px]">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block font-mono">L1 (Jenis)</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">{codeParts[0] || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block font-mono">L2 (Tahun)</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">{codeParts[1] || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block font-mono">L3 (Teritori)</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">{codeParts[2] || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block font-mono">L4 (Peruntukan)</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">{codeParts[3] || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block font-mono">L5 (Ruang)</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">{codeParts[4] || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block font-mono">L6 (No Urut)</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">{codeParts[5] || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Photo Section if exists */}
              {asset.fotoUrl && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-2">Dokumentasi Foto Fisik:</span>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-64 shadow-xs">
                    <img src={asset.fotoUrl} alt={asset.namaBarang} className="max-h-64 object-contain" />
                  </div>
                </div>
              )}

              {/* Key Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-700" />
                    Penempatan & Lokasi Fisik
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lokasi:</span>
                      <span className="font-semibold text-slate-800">{asset.lokasi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ruangan:</span>
                      <span className="font-semibold text-slate-800">{asset.ruangNama}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Teritori:</span>
                      <span className="font-semibold text-slate-800">{asset.teritori}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pengguna:</span>
                      <span className="font-semibold text-slate-800">{asset.pengguna}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-700" />
                    Data Jumlah & Kepemilikan
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kuantitas:</span>
                      <span className="font-bold text-blue-900 text-sm">
                        {asset.quantity} {asset.satuan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tahun Perolehan:</span>
                      <span className="font-semibold text-slate-800">
                        {asset.bulanPerolehan !== '-' ? `${asset.bulanPerolehan} ` : ''}
                        {asset.tahunPerolehan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nilai Perolehan:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {asset.hargaNilai > 0 ? `Rp ${asset.hargaNilai.toLocaleString('id-ID')}` : 'Tidak tercatat / Hibah'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Asal Usul:</span>
                      <span className="font-semibold text-slate-800">{asset.keterangan || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance & Opname Status */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Status Opname Fisik:
                  </span>
                  <span className="font-semibold text-slate-800">
                    Terakhir dicek {asset.terakhirOpname || 'Belum Opname'}
                  </span>
                </div>

                {asset.jadwalPerawatan && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Jadwal Pemeliharaan:
                    </span>
                    <span className="font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      {asset.jadwalPerawatan} ({asset.deskripsiPerawatan || 'Cek berkala'})
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Jump Previews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => setActiveTab('loans')}
                  className="p-3 bg-white hover:bg-blue-50/50 rounded-xl border border-slate-200 text-left transition flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-blue-900">
                        Riwayat Peminjaman
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {assetLoans.length > 0
                          ? `${assetLoans.length} catatan peminjaman`
                          : 'Belum ada riwayat'}
                      </div>
                    </div>
                  </div>
                  <span className="text-blue-600 font-bold text-xs">Lihat &rarr;</span>
                </button>

                <button
                  onClick={() => setActiveTab('maintenance')}
                  className="p-3 bg-white hover:bg-amber-50/50 rounded-xl border border-slate-200 text-left transition flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-amber-900">
                        Riwayat Servis & Servicing
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {assetMaintenance.length > 0
                          ? `${assetMaintenance.length} catatan servis`
                          : 'Belum ada riwayat'}
                      </div>
                    </div>
                  </div>
                  <span className="text-amber-700 font-bold text-xs">Lihat &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: RIWAYAT LENGKAP PEMINJAMAN */}
          {activeTab === 'loans' && (
            <div className="space-y-4">
              {/* Summary Stats Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] text-slate-500 block mb-0.5">Total Riwayat Pinjam:</span>
                  <div className="text-xl font-black text-slate-900">{assetLoans.length} kali</div>
                  <span className="text-[10px] text-slate-400">Tercatat di sistem</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] text-slate-500 block mb-0.5">Status Unit Saat Ini:</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeLoan ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                      }`}
                    />
                    <span className="font-bold text-sm text-slate-900">
                      {activeLoan ? 'Sedang Dipinjam' : 'Tersedia di Ruangan'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate block">
                    {activeLoan ? `Oleh ${activeLoan.namaPeminjam}` : 'Siap dipinjamkan'}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-center">
                  <button
                    onClick={() => onOpenLoan(asset)}
                    className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Buat Peminjaman Baru
                  </button>
                </div>
              </div>

              {/* List of Loans */}
              {assetLoans.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Belum Ada Riwayat Peminjaman</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                      Aset "{asset.namaBarang}" belum pernah dipinjamkan keluar. Data peminjaman lingkungan atau pihak luar akan tampil lengkap di sini.
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenLoan(asset)}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Pinjamkan Aset Ini
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Daftar Transaksi Peminjaman ({assetLoans.length}):</span>
                    <span className="text-[11px] font-normal text-slate-500">Kronologis terbaru</span>
                  </div>

                  {assetLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className={`bg-white rounded-xl border p-4 shadow-xs transition space-y-3 ${
                        loan.status === 'Sedang Dipinjam'
                          ? 'border-amber-300 ring-1 ring-amber-100'
                          : loan.status === 'Terlambat'
                          ? 'border-red-300 ring-1 ring-red-100'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Top loan row */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                            {loan.id}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              loan.status === 'Sedang Dipinjam'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : loan.status === 'Terlambat'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {loan.status === 'Sedang Dipinjam' && <Clock className="w-3 h-3" />}
                            {loan.status === 'Dikembalikan' && <CheckCircle2 className="w-3 h-3" />}
                            {loan.status === 'Terlambat' && <AlertTriangle className="w-3 h-3" />}
                            {loan.status}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                          Jumlah: {loan.jumlahPinjam} {asset.satuan}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                        <div className="space-y-1">
                          <div className="text-slate-500 font-medium">Peminjam:</div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {loan.namaPeminjam}
                          </div>
                          <div className="text-[11px] text-slate-600 pl-5">
                            {loan.lingkunganWilayah}
                          </div>
                          {loan.kontakPeminjam && (
                            <div className="text-[11px] text-blue-700 pl-5 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${loan.kontakPeminjam}`} className="hover:underline">
                                {loan.kontakPeminjam}
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="text-slate-500 font-medium">Jadwal & Waktu:</div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Tgl Pinjam:</span>
                            <span className="font-semibold text-slate-800">{loan.tanggalPinjam}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Batas Kembali:</span>
                            <span className="font-semibold text-slate-800">{loan.tanggalKembaliRencana}</span>
                          </div>
                          {loan.tanggalKembaliAktual && (
                            <div className="flex justify-between text-[11px] text-emerald-800">
                              <span>Realisasi Kembali:</span>
                              <span className="font-bold">{loan.tanggalKembaliAktual}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Keperluan & Notes */}
                      <div className="text-xs space-y-1 pt-1 border-t border-slate-100">
                        <div className="flex items-start gap-1.5">
                          <span className="text-slate-500 font-medium shrink-0">Keperluan:</span>
                          <span className="text-slate-800 font-medium">{loan.keperluan}</span>
                        </div>

                        {loan.kondisiSaatKembali && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">Kondisi Saat Kembali:</span>
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200 text-[11px]">
                              {loan.kondisiSaatKembali}
                            </span>
                          </div>
                        )}

                        {loan.catatan && (
                          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 mt-1 italic">
                            Catatan: {loan.catatan}
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 text-right pt-1">
                          Dicatat oleh: {loan.petugas}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RIWAYAT LENGKAP SERVIS & SERVICING */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              {/* Summary Stats Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] text-slate-500 block mb-0.5">Total Jadwal & Servis:</span>
                  <div className="text-xl font-black text-slate-900">{assetMaintenance.length} catatan</div>
                  <span className="text-[10px] text-slate-400">Riwayat teknis</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] text-slate-500 block mb-0.5">Total Biaya Pemeliharaan:</span>
                  <div className="text-lg font-black text-blue-950 font-mono">
                    Rp {totalMaintenanceCost.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] text-slate-400">Akumulasi pengeluaran</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-center">
                  <button
                    onClick={() => onOpenMaintenance(asset)}
                    className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Catat Servis Baru
                  </button>
                </div>
              </div>

              {/* Maintenance Schedule Info if specified in asset */}
              {asset.jadwalPerawatan && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-950">Jadwal Perawatan Berkala Aset:</span>
                      <p className="text-[11px] text-amber-800">
                        {asset.jadwalPerawatan} • {asset.deskripsiPerawatan || 'Pengecekan dan servis berkala'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenMaintenance(asset)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition"
                  >
                    Atur Servis
                  </button>
                </div>
              )}

              {/* List of Maintenance */}
              {assetMaintenance.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Belum Ada Riwayat Servis / Pemeliharaan</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                      Belum tercatat riwayat perbaikan fisik, penggantian suku cadang, atau jadwal servis berkala untuk aset "{asset.namaBarang}".
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenMaintenance(asset)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Catat Pemeliharaan / Servis
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Log Pemeliharaan & Jadwal Servis ({assetMaintenance.length}):</span>
                    <span className="text-[11px] font-normal text-slate-500">Kronologis kegiatan</span>
                  </div>

                  {assetMaintenance.map((m) => (
                    <div
                      key={m.id}
                      className={`bg-white rounded-xl border p-4 shadow-xs transition space-y-3 ${
                        m.status === 'Jatuh Tempo'
                          ? 'border-red-300 ring-1 ring-red-100'
                          : m.status === 'Selesai'
                          ? 'border-emerald-200'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                            {m.id}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              m.status === 'Jatuh Tempo'
                                ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                                : m.status === 'Selesai'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : m.status === 'Dalam Pengerjaan'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {m.status === 'Jatuh Tempo' && <AlertTriangle className="w-3 h-3" />}
                            {m.status === 'Selesai' && <CheckCircle2 className="w-3 h-3" />}
                            {m.status === 'Mendatang' && <Clock className="w-3 h-3" />}
                            {m.status}
                          </span>
                        </div>

                        <div className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                          {m.biayaEstimasi ? `Rp ${m.biayaEstimasi.toLocaleString('id-ID')}` : 'Rp 0'}
                        </div>
                      </div>

                      {/* Main Service Title */}
                      <div>
                        <h5 className="font-bold text-sm text-slate-900">{m.jenisPemeliharaan}</h5>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Frekuensi: {m.frekuensi}</span>
                          <span>•</span>
                          <span>Lokasi: {m.lokasi}</span>
                        </div>
                      </div>

                      {/* Execution Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Tanggal Jadwal Servis:</span>
                          <span className="font-semibold text-slate-800">{m.tanggalJadwal}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Teknisi / Vendor Pelaksana:</span>
                          <span className="font-semibold text-slate-800">{m.teknisi || 'Teknisi Paroki'}</span>
                        </div>
                        {m.terakhirSelesai && (
                          <div className="sm:col-span-2 text-emerald-800 flex items-center gap-1.5 pt-1 border-t border-slate-200 text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Terakhir diselesaikan: <strong>{m.terakhirSelesai}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {m.catatan && (
                        <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 italic">
                          Catatan Servis: {m.catatan}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Toolbar */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onQuickOpname(asset)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Opname Cek Fisik
              </button>

              <button
                onClick={() => onOpenBarcode(asset)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-300" />
                Cetak Barcode
              </button>

              <button
                onClick={() => onOpenLoan(asset)}
                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                Pinjamkan
              </button>

              <button
                onClick={() => onOpenMaintenance(asset)}
                className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Wrench className="w-3.5 h-3.5" />
                Jadwal Servis
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(asset)}
                className="p-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition"
                title="Edit Aset"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(asset)}
                className="p-2 border border-red-200 rounded-xl text-red-600 hover:bg-red-50 transition"
                title="Hapus Aset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
