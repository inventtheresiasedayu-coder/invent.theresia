export type JenisAsetKode =
  | '100' // Tanah (tidak disusutkan)
  | '200' // Bangunan Permanen
  | '300' // Bangunan Tidak Permanen
  | '401' // Kelompok 1: Mebel & Peralatan Kayu / Rotan
  | '402' // Kelompok 1: Peralatan Kantor
  | '403' // Kelompok 1: Elektronik & sejenisnya
  | '404' // Kelompok 1: Motor, Sepeda & Becak
  | '405' // Kelompok 1: Alat Komunikasi
  | '406' // Kelompok 1: Peralatan Dapur
  | '407' // Kelompok 1: Peralatan / Perlengkapan Lain-lain
  | '501' // Kelompok 2: Mebel & Peralatan dari Logam
  | '502' // Kelompok 2: Alat Pengatur Udara
  | '503'; // Kelompok 2: Mobil, Bus, Truk dan sejenisnya

export type TimpelKode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type KondisiAset = 'Baik' | 'Rusak Ringan' | 'Rusak Sedang' | 'Rusak Berat' | 'Belum Opname';

export type StatusPeminjaman = 'Tersedia' | 'Dipinjam' | 'Perbaikan';

export interface AssetItem {
  id: string;
  kodeAset: string; // Xxx-xxxx-x-xx-xx-xxx
  namaBarang: string;
  jenisAsetKode: JenisAsetKode;
  jenisAsetName: string;
  timpelKode: TimpelKode;
  timpelName: string;
  tahunPerolehan: number;
  bulanPerolehan: string;
  hargaNilai: number;
  quantity: number;
  satuan: string;
  kondisi: KondisiAset;
  lokasi: string;
  teritori: 'Paroki' | 'Stasi/Kapel';
  peruntukan: string;
  ruangKode: string;
  ruangNama: string;
  pengguna: string;
  statusPeminjaman: StatusPeminjaman;
  keterangan: string;
  fotoUrl?: string;
  terakhirOpname?: string;
  auditorOpname?: string;
  jadwalPerawatan?: string;
  deskripsiPerawatan?: string;
  catatan?: string;
}

export interface LoanRecord {
  id: string;
  assetId: string;
  assetKode: string;
  namaBarang: string;
  jumlahPinjam: number;
  namaPeminjam: string;
  kontakPeminjam: string;
  lingkunganWilayah: string;
  keperluan: string;
  tanggalPinjam: string;
  tanggalKembaliRencana: string;
  tanggalKembaliAktual?: string;
  status: 'Sedang Dipinjam' | 'Dikembalikan' | 'Terlambat';
  kondisiSaatKembali?: KondisiAset;
  petugas: string;
  catatan?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetKode: string;
  namaBarang: string;
  lokasi: string;
  jenisPemeliharaan: string;
  frekuensi: 'Bulanan' | 'Triwulan' | 'Semesteran' | 'Tahunan' | 'Insidental';
  tanggalJadwal: string;
  status: 'Mendatang' | 'Jatuh Tempo' | 'Selesai' | 'Dalam Pengerjaan';
  biayaEstimasi?: number;
  teknisi?: string;
  catatan?: string;
  terakhirSelesai?: string;
}

export type ActionLogType =
  | 'TAMBAH_ASET'
  | 'EDIT_ASET'
  | 'HAPUS_ASET'
  | 'PINJAM'
  | 'KEMBALI'
  | 'OPNAME'
  | 'PERAWATAN'
  | 'IMPORT_EXCEL'
  | 'SYNC_PUSAT';

export interface AuditLog {
  id: string;
  timestamp: string;
  assetId?: string;
  assetKode?: string;
  namaBarang: string;
  tipeAksi: ActionLogType;
  detailPerubahan: string;
  pelaku: string;
  role: string;
}

export type UserRole = 'ADMIN_PGPM' | 'TIMPEL_PENGURUS' | 'AUDITOR_DEWAN' | 'VIEWER';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  timpel?: string;
  kapel?: string;
}
