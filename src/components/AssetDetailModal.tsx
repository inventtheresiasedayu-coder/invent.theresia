import React from 'react';
import { AssetItem, LoanRecord, MaintenanceRecord } from '../types/inventory';
import {
  X,
  Tag,
  MapPin,
  Calendar,
  Layers,
  Wrench,
  QrCode,
  Edit,
  Trash2,
  Share2,
  CheckCircle,
  Clock,
  ShieldCheck,
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
  const assetLoans = loans.filter((l) => l.assetId === asset.id || l.assetKode === asset.kodeAset);
  const assetMaintenance = maintenance.filter(
    (m) => m.assetId === asset.id || m.assetKode === asset.kodeAset
  );

  const codeParts = asset.kodeAset.split('-');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="w-9 h-9 rounded-xl bg-blue-800 text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs">
              ✝
            </span>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                {asset.jenisAsetName} • TIMPEL {asset.timpelName}
              </span>
              <h3 className="font-bold text-base text-white truncate max-w-md">{asset.namaBarang}</h3>
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
        <div className="p-6 overflow-y-auto space-y-6 grow">
          {/* Main Info Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-500 block mb-0.5">Kode Inventaris Resmi (KAS):</span>
              <span className="font-mono text-base font-black text-blue-950 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs inline-block">
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
                {asset.statusPeminjaman}
              </span>
            </div>
          </div>

          {/* Breakdown Code Badges (Level 1-6) */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Dekonstruksi Kodifikasi KAS (Pasal 14 PDP3 2020):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[10px]">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-mono">L1 (Jenis)</span>
                <span className="font-bold font-mono text-slate-800 text-xs">{codeParts[0] || '-'}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-mono">L2 (Tahun)</span>
                <span className="font-bold font-mono text-slate-800 text-xs">{codeParts[1] || '-'}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-mono">L3 (Teritori)</span>
                <span className="font-bold font-mono text-slate-800 text-xs">{codeParts[2] || '-'}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-mono">L4 (Peruntukan)</span>
                <span className="font-bold font-mono text-slate-800 text-xs">{codeParts[3] || '-'}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-mono">L5 (Ruang)</span>
                <span className="font-bold font-mono text-slate-800 text-xs">{codeParts[4] || '-'}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-mono">L6 (No Urut)</span>
                <span className="font-bold font-mono text-slate-800 text-xs">{codeParts[5] || '-'}</span>
              </div>
            </div>
          </div>

          {/* Photo Section if exists */}
          {asset.fotoUrl && (
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">Dokumentasi Foto Fisik:</span>
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-64">
                <img src={asset.fotoUrl} alt={asset.namaBarang} className="max-h-64 object-contain" />
              </div>
            </div>
          )}

          {/* Key Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
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

            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
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
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
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
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Jadwal Pemeliharaan:
                </span>
                <span className="font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  {asset.jadwalPerawatan} ({asset.deskripsiPerawatan || 'Cek berkala'})
                </span>
              </div>
            )}
          </div>

          {/* Active Loans Section if any */}
          {assetLoans.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Catatan Peminjaman Terkait ({assetLoans.length}):
              </h4>
              <div className="space-y-2">
                {assetLoans.slice(0, 3).map((l) => (
                  <div key={l.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900">{l.namaPeminjam}</span> ({l.lingkunganWilayah})
                      <div className="text-[11px] text-slate-500">{l.keperluan} • {l.jumlahPinjam} unit</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      l.status === 'Sedang Dipinjam' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
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
