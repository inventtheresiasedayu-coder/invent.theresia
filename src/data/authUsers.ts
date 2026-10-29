import { AppUser } from '../types/inventory';

export interface AuthAccount extends AppUser {
  password: string;
}

export const AUTH_USERS: AuthAccount[] = [
  {
    id: 'usr-admin-01',
    username: 'admin.pgpm',
    password: 'adminsedayu2026',
    name: 'Romo Antonius Hadi Cahyono, Pr & Sekretariat PGPM',
    email: 'invent.theresia.sedayu@gmail.com',
    role: 'ADMIN_PGPM',
    roleTitle: 'Pastor Kepala Paroki & Pengurus Inti PGPM',
    description: 'Kontrol penuh aset, nilai rupiah, hapus barang, dan cetak laporan resmi.',
  },
  {
    id: 'usr-timpel-01',
    username: 'timpel.sedayu',
    password: 'timpelsedayu2026',
    name: 'Tim Pelayanan & Pengurus Kapel',
    email: 'timpel.sedayu@kas.id',
    role: 'TIMPEL_PENGURUS',
    roleTitle: 'Pengurus Tim Pelayanan & Wilayah Kapel',
    description: 'Pendataan fisik, permohonan pinjam, verifikasi opname di lapangan.',
    timpel: 'Rumah Tangga & Liturgi',
  },
  {
    id: 'usr-audit-01',
    username: 'auditor.dewan',
    password: 'auditorsedayu2026',
    name: 'Tim Audit Dewan Pastoral Paroki',
    email: 'audit.dpp@sedayu.id',
    role: 'AUDITOR_DEWAN',
    roleTitle: 'Tim Auditor Internal PGPM Keuskupan',
    description: 'Mode audit independen, inspeksi berkala, rekapitulasi KAS.',
  },
];

export const ROLE_PERMISSIONS_INFO = [
  {
    role: 'ADMIN_PGPM',
    title: 'ADMIN PGPM',
    account: 'admin.pgpm',
    color: 'blue',
    badge: 'bg-blue-100 text-blue-900 border-blue-300',
    description: 'Kontrol penuh aset, nilai rupiah, hapus barang, dan cetak laporan resmi.',
    features: [
      'Pendaftaran & registrasi user pengurus baru',
      'Input aset baru & edit detail',
      'Hapus aset dari database paroki',
      'Lihat & kelola taksiran nilai rupiah aset',
      'Cetak laporan resmi bertanda tangan Romo Antonius Hadi Cahyono, Pr',
      'Generate & cetak label stiker barcode massal',
      'Sinkronisasi API pusat & backup JSON',
    ],
  },
  {
    role: 'TIMPEL_PENGURUS',
    title: 'TIMPEL / KAPEL',
    account: 'timpel.sedayu',
    color: 'emerald',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'Pendataan fisik, permohonan pinjam, verifikasi opname di lapangan.',
    features: [
      'Pendataan fisik inventaris di kapel & ruangan',
      'Permohonan pinjam barang & cetak Surat Jalan',
      'Verifikasi opname fisik berkala di lapangan via barcode',
      'Input jadwal pemeliharaan alat/AC/genset',
      'Unggah foto dokumentasi kondisi fisik terkini',
    ],
  },
  {
    role: 'AUDITOR_DEWAN',
    title: 'AUDITOR DEWAN',
    account: 'auditor.dewan',
    color: 'amber',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Mode audit independen, inspeksi berkala, rekapitulasi KAS.',
    features: [
      'Mode audit independen seluruh kapel & paroki',
      'Inspeksi berkala kondisi fisik barang & status kepemilikan',
      'Rekapitulasi KAS (Pasal 14 PDP3 Tahun 2020)',
      'Ekspor laporan audit ke PDF & Excel (.xlsx)',
      'Akses jejak audit (Audit Trail) real-time',
    ],
  },
];
