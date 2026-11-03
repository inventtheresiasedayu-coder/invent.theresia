import React, { useState } from 'react';
import { AssetItem, AppUser } from '../types/inventory';
import { Trash2, AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface DeleteConfirmModalProps {
  asset: AssetItem;
  currentUser: AppUser | null;
  onConfirm: (asset: AssetItem, reason: string) => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  asset,
  currentUser,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = () => {
    setIsDeleting(true);
    onConfirm(asset, reason.trim() || 'Penghapusan oleh pengurus yang berwenang');
  };

  const isTimpel = currentUser?.role === 'TIMPEL_PENGURUS';
  const isAdmin = currentUser?.role === 'ADMIN_PGPM';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-red-200">
        {/* Header */}
        <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Hapus Aset Inventaris</h3>
              <p className="text-xs text-red-100">
                Otorisasi Penghapusan: {isAdmin ? 'ADMIN PGPM' : 'TIMPEL / KAPEL'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-900 leading-relaxed">
              <strong className="font-bold block mb-1">Perhatian Penting:</strong>
              Aset akan dihapus dari <strong>Cloud Firebase Firestore</strong> dan database lokal.
              Penghapusan ini akan dicatat ke dalam <strong>Jejak Audit (Audit Trail)</strong> atas nama Anda.
            </div>
          </div>

          {/* Asset Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {asset.kodeAset}
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                TIMPEL {asset.timpelKode} ({asset.timpelName})
              </span>
            </div>

            <h4 className="font-bold text-slate-900 text-sm">{asset.namaBarang}</h4>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Lokasi & Ruang:</span>
                <span className="font-medium text-slate-800">{asset.lokasi} - {asset.ruangNama}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Jumlah & Satuan:</span>
                <span className="font-medium text-slate-800">{asset.quantity} {asset.satuan}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tahun Perolehan:</span>
                <span className="font-medium text-slate-800">{asset.tahunPerolehan}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Perkiraan Nilai:</span>
                <span className="font-medium text-emerald-700">
                  {asset.hargaNilai > 0 ? `Rp ${asset.hargaNilai.toLocaleString('id-ID')}` : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alasan Penghapusan (Wajib untuk Akuntabilitas Audit):
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Rusak total, Dihibahkan ke Kapel lain, Data ganda..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
            />
          </div>

          {/* User Sign */}
          <div className="flex items-center gap-2 p-2.5 bg-slate-100 rounded-xl text-xs text-slate-600">
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            <span>
              Petugas Penanggung Jawab: <strong>{currentUser?.name || 'Pengurus Paroki'}</strong> ({currentUser?.role})
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Menghapus dari Cloud...' : 'Ya, Hapus Permanen Aset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
