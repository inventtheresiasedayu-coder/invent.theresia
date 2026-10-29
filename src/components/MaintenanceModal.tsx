import React, { useState } from 'react';
import { AssetItem, MaintenanceRecord } from '../types/inventory';
import { X, Wrench, CheckCircle, Clock, Calendar, AlertCircle } from 'lucide-react';

interface MaintenanceModalProps {
  initialAsset?: AssetItem | null;
  assets: AssetItem[];
  maintenanceRecord?: MaintenanceRecord | null;
  onSave: (record: MaintenanceRecord) => void;
  onClose: () => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  initialAsset,
  assets,
  maintenanceRecord,
  onSave,
  onClose,
}) => {
  const isEdit = !!maintenanceRecord;

  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    maintenanceRecord?.assetId || initialAsset?.id || assets[0]?.id || ''
  );
  const [jenisPemeliharaan, setJenisPemeliharaan] = useState(
    maintenanceRecord?.jenisPemeliharaan || 'Servis & Pengecekan Berkala'
  );
  const [frekuensi, setFrekuensi] = useState<
    'Bulanan' | 'Triwulan' | 'Semesteran' | 'Tahunan' | 'Insidental'
  >(maintenanceRecord?.frekuensi || 'Triwulan');
  const [tanggalJadwal, setTanggalJadwal] = useState(
    maintenanceRecord?.tanggalJadwal ||
      (() => {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        return d.toISOString().slice(0, 10);
      })()
  );
  const [status, setStatus] = useState<
    'Mendatang' | 'Jatuh Tempo' | 'Selesai' | 'Dalam Pengerjaan'
  >(maintenanceRecord?.status || 'Mendatang');
  const [biayaEstimasi, setBiayaEstimasi] = useState<number>(
    maintenanceRecord?.biayaEstimasi || 250000
  );
  const [teknisi, setTeknisi] = useState(maintenanceRecord?.teknisi || '');
  const [catatan, setCatatan] = useState(maintenanceRecord?.catatan || '');

  const currentAsset = assets.find((a) => a.id === selectedAssetId) || initialAsset;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAsset) return;

    const record: MaintenanceRecord = {
      id: maintenanceRecord?.id || `RAWAT-${Date.now().toString().slice(-5)}`,
      assetId: currentAsset.id,
      assetKode: currentAsset.kodeAset,
      namaBarang: currentAsset.namaBarang,
      lokasi: currentAsset.lokasi,
      jenisPemeliharaan: jenisPemeliharaan.trim(),
      frekuensi,
      tanggalJadwal,
      status,
      biayaEstimasi,
      teknisi: teknisi.trim(),
      catatan: catatan.trim(),
      terakhirSelesai: status === 'Selesai' ? new Date().toISOString().slice(0, 10) : maintenanceRecord?.terakhirSelesai,
    };

    onSave(record);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Wrench className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-semibold text-base">
                {isEdit ? 'Ubah Jadwal Pemeliharaan' : 'Jadwalkan Pemeliharaan Aset'}
              </h3>
              <p className="text-xs text-slate-400">
                Pencegahan kerusakan alat gereja, genset, sound, dan tata udara
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Aset yang Dipelihara:
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
            >
              {assets
                .filter((a) => ['403', '501', '502', '503', '404', '200', '300'].includes(a.jenisAsetKode))
                .slice(0, 100)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.kodeAset} - {a.namaBarang} ({a.lokasi})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Jenis Pekerjaan Pemeliharaan:
            </label>
            <input
              type="text"
              required
              value={jenisPemeliharaan}
              onChange={(e) => setJenisPemeliharaan(e.target.value)}
              placeholder="Contoh: Cuci Evaporator AC, Cek Oli & Aki Genset, Cek Kalibrasi Mixer"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Frekuensi:
              </label>
              <select
                value={frekuensi}
                onChange={(e) => setFrekuensi(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="Bulanan">Bulanan</option>
                <option value="Triwulan">Triwulan (3 Bulan)</option>
                <option value="Semesteran">Semesteran (6 Bulan)</option>
                <option value="Tahunan">Tahunan</option>
                <option value="Insidental">Insidental / Kerusakan Khusus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Jadwal:
              </label>
              <input
                type="date"
                required
                value={tanggalJadwal}
                onChange={(e) => setTanggalJadwal(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Pemeliharaan:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-semibold"
              >
                <option value="Mendatang">Mendatang</option>
                <option value="Dalam Pengerjaan">Dalam Pengerjaan</option>
                <option value="Jatuh Tempo">Jatuh Tempo (Urgent)</option>
                <option value="Selesai">Selesai Dikerjakan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimasi Biaya (Rp):
              </label>
              <input
                type="number"
                min="0"
                value={biayaEstimasi}
                onChange={(e) => setBiayaEstimasi(parseInt(e.target.value, 10) || 0)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Teknisi / Vendor Rekanan:
            </label>
            <input
              type="text"
              value={teknisi}
              onChange={(e) => setTeknisi(e.target.value)}
              placeholder="Contoh: CV Surya Diesel, Wahyu Sejuk AC, Tim Komsos"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Khusus:
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Keluhan getaran / suku cadang yang diganti / perhatian khusus"
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
              <Wrench className="w-4 h-4 text-amber-300" />
              Simpan Jadwal Pemeliharaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
