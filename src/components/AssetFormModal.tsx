import React, { useState, useEffect } from 'react';
import { AssetItem, JenisAsetKode, TimpelKode, KondisiAset, StatusPeminjaman } from '../types/inventory';
import {
  JENIS_ASET_LIST,
  TIMPEL_LIST,
  TERITORI_LIST,
  PERUNTUKAN_LIST,
  RUANG_LIST,
  LOKASI_UTAMA,
  generateInventoryCode,
} from '../data/referenceData';
import { X, Sparkles, Upload, Camera, Save, Tag } from 'lucide-react';

interface AssetFormModalProps {
  assetToEdit: AssetItem | null;
  existingCodes: string[];
  onSave: (asset: AssetItem) => void;
  onClose: () => void;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  assetToEdit,
  existingCodes,
  onSave,
  onClose,
}) => {
  const isEdit = !!assetToEdit;

  const [jenisAsetKode, setJenisAsetKode] = useState<JenisAsetKode>(
    assetToEdit?.jenisAsetKode || '401'
  );
  const [tahunPerolehan, setTahunPerolehan] = useState<number>(
    assetToEdit?.tahunPerolehan || new Date().getFullYear()
  );
  const [teritori, setTeritori] = useState<'Paroki' | 'Stasi/Kapel'>(
    assetToEdit?.teritori || 'Paroki'
  );
  const [peruntukan, setPeruntukan] = useState<string>(assetToEdit?.peruntukan || '01');
  const [ruangKode, setRuangKode] = useState<string>(assetToEdit?.ruangKode || '02');
  const [kodeAset, setKodeAset] = useState<string>(assetToEdit?.kodeAset || '');
  const [autoGenerateCode, setAutoGenerateCode] = useState<boolean>(!isEdit);

  const [namaBarang, setNamaBarang] = useState<string>(assetToEdit?.namaBarang || '');
  const [timpelKode, setTimpelKode] = useState<TimpelKode>(assetToEdit?.timpelKode || 'B');
  const [bulanPerolehan, setBulanPerolehan] = useState<string>(assetToEdit?.bulanPerolehan || '-');
  const [hargaNilai, setHargaNilai] = useState<number>(assetToEdit?.hargaNilai || 0);
  const [quantity, setQuantity] = useState<number>(assetToEdit?.quantity || 1);
  const [satuan, setSatuan] = useState<string>(assetToEdit?.satuan || 'unit');
  const [kondisi, setKondisi] = useState<KondisiAset>(assetToEdit?.kondisi || 'Baik');
  const [lokasi, setLokasi] = useState<string>(assetToEdit?.lokasi || 'Gereja Paroki Sedayu');
  const [pengguna, setPengguna] = useState<string>(assetToEdit?.pengguna || 'Umat & Pengurus');
  const [statusPeminjaman, setStatusPeminjaman] = useState<StatusPeminjaman>(
    assetToEdit?.statusPeminjaman || 'Tersedia'
  );
  const [keterangan, setKeterangan] = useState<string>(
    assetToEdit?.keterangan || 'Inventaris Paroki Sedayu'
  );
  const [fotoUrl, setFotoUrl] = useState<string>(assetToEdit?.fotoUrl || '');
  const [jadwalPerawatan, setJadwalPerawatan] = useState<string>(
    assetToEdit?.jadwalPerawatan || ''
  );
  const [deskripsiPerawatan, setDeskripsiPerawatan] = useState<string>(
    assetToEdit?.deskripsiPerawatan || ''
  );

  // Auto-generate code whenever hierarchy elements change
  useEffect(() => {
    if (autoGenerateCode) {
      const teritoriCode = teritori === 'Paroki' ? '1' : '2';
      const newCode = generateInventoryCode(
        jenisAsetKode,
        tahunPerolehan,
        teritoriCode,
        peruntukan,
        ruangKode,
        existingCodes.filter((c) => c !== assetToEdit?.kodeAset)
      );
      setKodeAset(newCode);
    }
  }, [
    autoGenerateCode,
    jenisAsetKode,
    tahunPerolehan,
    teritori,
    peruntukan,
    ruangKode,
    existingCodes,
    assetToEdit,
  ]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBarang.trim()) return;

    const jenisObj = JENIS_ASET_LIST.find((j) => j.code === jenisAsetKode);
    const timpelObj = TIMPEL_LIST.find((t) => t.code === timpelKode);
    const ruangObj = RUANG_LIST.find((r) => r.code === ruangKode);

    const assetItem: AssetItem = {
      id: assetToEdit?.id || `AST-${Date.now().toString().slice(-4)}`,
      kodeAset: kodeAset.trim(),
      namaBarang: namaBarang.trim(),
      jenisAsetKode,
      jenisAsetName: jenisObj?.name || 'Aset Tetap',
      timpelKode,
      timpelName: timpelObj?.name || 'Rumah Tangga',
      tahunPerolehan,
      bulanPerolehan,
      hargaNilai,
      quantity,
      satuan,
      kondisi,
      lokasi: lokasi.trim(),
      teritori,
      peruntukan,
      ruangKode,
      ruangNama: ruangObj?.name.replace(/^\d+\s*-\s*/, '') || 'Umum',
      pengguna: pengguna.trim(),
      statusPeminjaman,
      keterangan: keterangan.trim(),
      fotoUrl,
      terakhirOpname: assetToEdit?.terakhirOpname || new Date().toISOString().slice(0, 10),
      jadwalPerawatan: jadwalPerawatan || undefined,
      deskripsiPerawatan: deskripsiPerawatan || undefined,
    };

    onSave(assetItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <Tag className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-semibold text-base">
                {isEdit ? 'Ubah Data Inventaris Aset' : 'Input Inventaris Barang Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                Pencatatan inventaris berdasar standar KAS & PGPM Paroki St. Theresia Sedayu
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 grow">
          {/* Section 1: Generated Asset Code (Format KAS) */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-950">
                  Kode Inventaris Aset (Standar KAS PDP3)
                </span>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-blue-900">
                <input
                  type="checkbox"
                  checked={autoGenerateCode}
                  onChange={(e) => setAutoGenerateCode(e.target.checked)}
                  className="rounded text-blue-800 focus:ring-blue-600"
                />
                <span>Generate Otomatis dari Struktur</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={kodeAset}
                onChange={(e) => setKodeAset(e.target.value)}
                readOnly={autoGenerateCode}
                placeholder="Xxx-xxxx-x-xx-xx-xxx"
                className={`font-mono text-sm font-black px-4 py-2.5 rounded-xl border w-full ${
                  autoGenerateCode
                    ? 'bg-amber-100/70 border-amber-300 text-blue-950 cursor-not-allowed'
                    : 'bg-white border-blue-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Format: <span className="font-mono font-bold">[Jenis]-[Tahun]-[Teritori]-[Peruntukan]-[Ruang]-[NoUrut]</span>
            </p>
          </div>

          {/* Section 2: Hierarchy Elements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. Jenis Aset Tetap:
              </label>
              <select
                value={jenisAsetKode}
                onChange={(e) => setJenisAsetKode(e.target.value as JenisAsetKode)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                {JENIS_ASET_LIST.map((j) => (
                  <option key={j.code} value={j.code}>
                    {j.code} - {j.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Tahun Perolehan:
              </label>
              <input
                type="number"
                min="1950"
                max="2035"
                value={tahunPerolehan}
                onChange={(e) => setTahunPerolehan(parseInt(e.target.value, 10) || 2024)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. Teritori:
              </label>
              <select
                value={teritori}
                onChange={(e) => setTeritori(e.target.value as 'Paroki' | 'Stasi/Kapel')}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                {TERITORI_LIST.map((t) => (
                  <option key={t.code} value={t.code === '1' ? 'Paroki' : 'Stasi/Kapel'}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                4. Peruntukan Barang:
              </label>
              <select
                value={peruntukan}
                onChange={(e) => setPeruntukan(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                {PERUNTUKAN_LIST.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                5. Ruang / Penempatan:
              </label>
              <select
                value={ruangKode}
                onChange={(e) => setRuangKode(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                {RUANG_LIST.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tim Pelayanan (Timpel):
              </label>
              <select
                value={timpelKode}
                onChange={(e) => setTimpelKode(e.target.value as TimpelKode)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                {TIMPEL_LIST.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.code} - {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Item Specifications */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Identitas & Spesifikasi Fisik Barang
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Barang / Aset <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  placeholder="Contoh: Digital Mixer Allen & Heath QU-32, Kasula Merah, dsb."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bulan Perolehan:
                </label>
                <input
                  type="text"
                  value={bulanPerolehan}
                  onChange={(e) => setBulanPerolehan(e.target.value)}
                  placeholder="Januari / Juni / -"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jumlah (Qty):
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Satuan:
                </label>
                <select
                  value={satuan}
                  onChange={(e) => setSatuan(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="unit">unit</option>
                  <option value="buah">buah</option>
                  <option value="set">set</option>
                  <option value="ikat">ikat</option>
                  <option value="meter">meter</option>
                  <option value="m²">m² (luas tanah/bangunan)</option>
                  <option value="lusin">lusin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kondisi Fisik:
                </label>
                <select
                  value={kondisi}
                  onChange={(e) => setKondisi(e.target.value as KondisiAset)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-semibold"
                >
                  <option value="Baik">Baik</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Sedang">Rusak Sedang</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                  <option value="Belum Opname">Belum Opname</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Peminjaman:
                </label>
                <select
                  value={statusPeminjaman}
                  onChange={(e) => setStatusPeminjaman(e.target.value as StatusPeminjaman)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-semibold"
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Dipinjam">Sedang Dipinjam</option>
                  <option value="Perbaikan">Sedang Perbaikan / Servis</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lokasi Fisik / Tempat:
                </label>
                <input
                  type="text"
                  list="lokasi-options"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="Gereja Paroki Sedayu / Kapel Kaliduren / dsb."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
                <datalist id="lokasi-options">
                  {LOKASI_UTAMA.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pengguna Utama:
                </label>
                <input
                  type="text"
                  value={pengguna}
                  onChange={(e) => setPengguna(e.target.value)}
                  placeholder="Umat / Romo / Misdinar / Lektor / Komsos"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nilai / Harga Perolehan (Rp):
                </label>
                <input
                  type="number"
                  min="0"
                  value={hargaNilai}
                  onChange={(e) => setHargaNilai(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Asal Usul / Keterangan:
                </label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Pembelian PGPM / Hibah / Sumbangan Umat"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Maintenance & Photo */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pemeliharaan Berkala & Dokumentasi Foto
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jadwal Pemeliharaan Berikutnya:
                </label>
                <input
                  type="date"
                  value={jadwalPerawatan}
                  onChange={(e) => setJadwalPerawatan(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Perawatan:
                </label>
                <input
                  type="text"
                  value={deskripsiPerawatan}
                  onChange={(e) => setDeskripsiPerawatan(e.target.value)}
                  placeholder="Contoh: Cuci AC berkala / Cek oli genset / Uji baterai mic"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>

            {/* Photo Attachment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Foto Dokumentasi Kondisi Fisik Barang:
              </label>
              <div className="flex items-center gap-4">
                {fotoUrl ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-300 group shrink-0">
                    <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFotoUrl('')}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-medium"
                    >
                      Hapus Foto
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50 shrink-0">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px]">Belum Ada</span>
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer transition border border-slate-300">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Unggah Foto dari Perangkat</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Mendukung kamera HP langsung atau file gambar (JPEG, PNG). Foto disimpan aman secara digital.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              {isEdit ? 'Simpan Perubahan' : 'Simpan Data Inventaris'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
