import React, { useState } from 'react';
import { AssetItem, LoanRecord, KondisiAset } from '../types/inventory';
import { exportService } from '../services/exportService';
import { X, Calendar, User, Phone, FileText, CheckCircle2, FileDown, Layers } from 'lucide-react';

interface LoanModalProps {
  initialAsset?: AssetItem | null;
  assets: AssetItem[];
  loanToReturn?: LoanRecord | null;
  onSaveLoan: (loan: LoanRecord, updatedAssetQuantity?: number) => void;
  onReturnLoan: (loanId: string, returnCondition: KondisiAset, notes: string) => void;
  onClose: () => void;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  initialAsset,
  assets,
  loanToReturn,
  onSaveLoan,
  onReturnLoan,
  onClose,
}) => {
  const isReturnMode = !!loanToReturn;

  // New loan state
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    initialAsset?.id || assets[0]?.id || ''
  );
  const [jumlahPinjam, setJumlahPinjam] = useState<number>(1);
  const [namaPeminjam, setNamaPeminjam] = useState('');
  const [kontakPeminjam, setKontakPeminjam] = useState('');
  const [lingkunganWilayah, setLingkunganWilayah] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [tanggalPinjam, setTanggalPinjam] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [tanggalKembaliRencana, setTanggalKembaliRencana] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 10);
  });
  const [petugas, setPetugas] = useState('Sekretariat PGPM Sedayu');
  const [catatan, setCatatan] = useState('');

  // Return state
  const [kondisiSaatKembali, setKondisiSaatKembali] = useState<KondisiAset>('Baik');
  const [catatanKembali, setCatatanKembali] = useState('');

  const currentAsset = assets.find((a) => a.id === selectedAssetId) || initialAsset;

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPeminjam.trim() || !currentAsset) return;

    const newLoan: LoanRecord = {
      id: `PINJAM-${Date.now().toString().slice(-6)}`,
      assetId: currentAsset.id,
      assetKode: currentAsset.kodeAset,
      namaBarang: currentAsset.namaBarang,
      jumlahPinjam,
      namaPeminjam: namaPeminjam.trim(),
      kontakPeminjam: kontakPeminjam.trim(),
      lingkunganWilayah: lingkunganWilayah.trim(),
      keperluan: keperluan.trim(),
      tanggalPinjam,
      tanggalKembaliRencana,
      status: 'Sedang Dipinjam',
      petugas,
      catatan,
    };

    onSaveLoan(newLoan);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanToReturn) return;
    onReturnLoan(loanToReturn.id, kondisiSaatKembali, catatanKembali);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-semibold text-base">
              {isReturnMode ? 'Proses Pengembalian Aset' : 'Formulir Peminjaman Aset Gereja'}
            </h3>
            <p className="text-xs text-slate-400">
              Pencatatan sirkulasi barang untuk kegiatan umat, lingkungan, dan retret
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto grow">
          {isReturnMode ? (
            /* RETURN FLOW */
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Peminjaman:</span>
                  <span className="font-mono font-bold text-blue-950">{loanToReturn.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Barang:</span>
                  <span className="font-bold text-slate-900">{loanToReturn.namaBarang}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Peminjam:</span>
                  <span className="font-semibold text-slate-800">
                    {loanToReturn.namaPeminjam} ({loanToReturn.lingkunganWilayah})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jumlah:</span>
                  <span className="font-bold text-blue-900">{loanToReturn.jumlahPinjam} unit</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kondisi Fisik Saat Dikembalikan:
                </label>
                <select
                  value={kondisiSaatKembali}
                  onChange={(e) => setKondisiSaatKembali(e.target.value as KondisiAset)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-semibold"
                >
                  <option value="Baik">Baik (Lengkap & Berfungsi Normal)</option>
                  <option value="Rusak Ringan">Rusak Ringan (Perlu Perawatan Kecil)</option>
                  <option value="Rusak Sedang">Rusak Sedang</option>
                  <option value="Rusak Berat">Rusak Berat / Komponen Patah</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Pengembalian / Pemeriksaan:
                </label>
                <textarea
                  rows={3}
                  value={catatanKembali}
                  onChange={(e) => setCatatanKembali(e.target.value)}
                  placeholder="Catatan kebersihan barang, kelengkapan baut/kabel, dsb."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi Pengembalian
                </button>
              </div>
            </form>
          ) : (
            /* NEW LOAN FLOW */
            <form onSubmit={handleCreateLoan} className="space-y-4">
              {/* Asset Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Aset yang Akan Dipinjam:
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                >
                  {assets.slice(0, 150).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.kodeAset} - {a.namaBarang} ({a.quantity} {a.satuan} - {a.lokasi})
                    </option>
                  ))}
                </select>
              </div>

              {currentAsset && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                  <span>Stok Tersedia: <strong>{currentAsset.quantity} {currentAsset.satuan}</strong></span>
                  <span>Lokasi: <strong>{currentAsset.lokasi}</strong></span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Dipinjam:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={currentAsset?.quantity || 999}
                    value={jumlahPinjam}
                    onChange={(e) => setJumlahPinjam(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Petugas / PIC Paroki:
                  </label>
                  <input
                    type="text"
                    value={petugas}
                    onChange={(e) => setPetugas(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Peminjam <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={namaPeminjam}
                    onChange={(e) => setNamaPeminjam(e.target.value)}
                    placeholder="Contoh: Bpk. Yohanes Sugito"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. HP / WhatsApp:
                  </label>
                  <input
                    type="tel"
                    value={kontakPeminjam}
                    onChange={(e) => setKontakPeminjam(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Komunitas / Lingkungan / Wilayah:
                </label>
                <input
                  type="text"
                  value={lingkunganWilayah}
                  onChange={(e) => setLingkunganWilayah(e.target.value)}
                  placeholder="Contoh: Lingkungan St. Maria Gubug / OMK Paroki / Kapel Jurug"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keperluan Peminjaman:
                </label>
                <input
                  type="text"
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  placeholder="Contoh: Misa Lingkungan Bulan Maria / Rekoleksi / Kedukaan"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Pengambilan:
                  </label>
                  <input
                    type="date"
                    value={tanggalPinjam}
                    onChange={(e) => setTanggalPinjam(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rencana Pengembalian:
                  </label>
                  <input
                    type="date"
                    value={tanggalKembaliRencana}
                    onChange={(e) => setTanggalKembaliRencana(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Tambahan:
                </label>
                <input
                  type="text"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Dilengkapi 2 kabel mic dan remote"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  Simpan & Ajukan Peminjaman
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
