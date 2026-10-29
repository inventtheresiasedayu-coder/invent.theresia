import { JenisAsetKode, TimpelKode } from '../types/inventory';

export interface CodeOption {
  code: string;
  name: string;
  description?: string;
}

export const JENIS_ASET_LIST: { code: JenisAsetKode; name: string; categoryGroup: string }[] = [
  { code: '100', name: 'Tanah (tidak disusutkan)', categoryGroup: 'Aset Tetap Tanah' },
  { code: '200', name: 'Bangunan Permanen', categoryGroup: 'Gedung & Bangunan' },
  { code: '300', name: 'Bangunan Tidak Permanen (Pendopo/Kanopi/Gazebo)', categoryGroup: 'Gedung & Bangunan' },
  { code: '401', name: 'Kelompok 1: Mebel & Peralatan dari Kayu / Rotan', categoryGroup: 'Mebel & Interior' },
  { code: '402', name: 'Kelompok 1: Peralatan Kantor & Komputer', categoryGroup: 'Peralatan Kantor' },
  { code: '403', name: 'Kelompok 1: Elektronik, Audio Visual & Sound', categoryGroup: 'Elektronik & Multimedia' },
  { code: '404', name: 'Kelompok 1: Motor, Sepeda & Becak', categoryGroup: 'Kendaraan Roda 2' },
  { code: '405', name: 'Kelompok 1: Alat Komunikasi (HT/Interkom)', categoryGroup: 'Komunikasi' },
  { code: '406', name: 'Kelompok 1: Peralatan Dapur & Konsumsi', categoryGroup: 'Peralatan Rumah Tangga' },
  { code: '407', name: 'Kelompok 1: Peralatan / Perlengkapan Liturgis & Lainnya', categoryGroup: 'Perlengkapan Liturgis & Lainnya' },
  { code: '501', name: 'Kelompok 2: Mebel & Peralatan dari Logam / Genset', categoryGroup: 'Peralatan Logam & Utilitas' },
  { code: '502', name: 'Kelompok 2: Alat Pengatur Udara (AC / Kipas / Exhaust)', categoryGroup: 'Tata Udara' },
  { code: '503', name: 'Kelompok 2: Mobil, Bus, Truk dan sejenisnya', categoryGroup: 'Kendaraan Roda 4' },
];

export const TIMPEL_LIST: { code: TimpelKode; name: string; description: string }[] = [
  { code: 'A', name: 'Paramenta', description: 'Kasula, Alba, Stola, Samir, Velum, Superpli, Single' },
  { code: 'B', name: 'Tata Altar', description: 'Altar, Meja Kreden, Sibori, Piala, Patena, Tabernakel, Salib, Lilin, Palla, Korporal' },
  { code: 'C', name: 'Audio Visual', description: 'Sound System, Mixer, Microphone, Kamera PTZ, Proyektor, CCTV, Layar, TV' },
  { code: 'D', name: 'Rumah Tangga', description: 'Mebel, Meja, Kursi, Piring, Dapur, Kebersihan, Genset, Tangga, AC' },
  { code: 'E', name: 'Musik Liturgi', description: 'Organ, Keyboard, Gong, Lonceng Altar, Bel Misdinar, Gamelan, Buku Nyanyian' },
  { code: 'F', name: 'Seni Budaya', description: 'Wayang, Properti Pentas Budaya, Dekorasi Khusus Hari Raya' },
];

export const TERITORI_LIST: CodeOption[] = [
  { code: '1', name: 'Paroki (Pusat Sedayu)' },
  { code: '2', name: 'Stasi / Kapel' },
];

export const PERUNTUKAN_LIST: CodeOption[] = [
  { code: '01', name: '01 - Gereja Paroki' },
  { code: '02', name: '02 - Gereja Stasi' },
  { code: '03', name: '03 - Kapel Wilayah' },
  { code: '04', name: '04 - Kapel Lingkungan' },
  { code: '05', name: '05 - Pastoran' },
  { code: '06', name: '06 - Gedung Pastoral' },
  { code: '07', name: '07 - Kapel Adorasi' },
  { code: '08', name: '08 - Unit Karya (Devosionalia / Klinik / CU)' },
  { code: '09', name: '09 - Tempat Ziarah / Taman Doa / Makam' },
  { code: '10', name: '10 - Dipinjamkan Lembaga Lain' },
  { code: '11', name: '11 - Kebun / Pekarangan / Sawah' },
];

export const RUANG_LIST: CodeOption[] = [
  { code: '01', name: '01 - Sakristi' },
  { code: '02', name: '02 - Altar / Panti Imam' },
  { code: '03', name: '03 - Panti Umat (Nave)' },
  { code: '04', name: '04 - Aula / Ruang Pertemuan' },
  { code: '05', name: '05 - Sekretariat Paroki' },
  { code: '06', name: '06 - Kantor Romo Paroki' },
  { code: '07', name: '07 - Pastoran / Kamar Tamu' },
  { code: '08', name: '08 - Ruang Audio Visual / Kontrol Room' },
  { code: '09', name: '09 - Ruang Genset / Panel Listrik' },
  { code: '10', name: '10 - Ruang P3K / Kesehatan' },
  { code: '11', name: '11 - Dapur & Gudang' },
  { code: '12', name: '12 - Pendopo' },
  { code: '13', name: '13 - Dewan Paroki / Ruang Rapat' },
  { code: '14', name: '14 - Panti Koor / Balkon' },
  { code: '15', name: '15 - Halaman / Luar / Taman' },
  { code: '16', name: '16 - Pos Jaga Keamanan' },
  { code: '99', name: '99 - Fasilitas Umum / Serbaguna' },
];

export const LOKASI_UTAMA: string[] = [
  'Gereja Paroki Sedayu',
  'Kapel Metes',
  'Kapel Sumbersari',
  'Kapel Demangan',
  'Kapel Kaliduren',
  'Kapel Jurug',
  'Pastoran Paroki',
  'Aula Paroki',
  'Taman Doa Semampir',
  'TK Indriyasana',
];

/**
 * Format pengkodean inventaris aset tetap Keuskupan Agung Semarang (PGPM PDP3 Tahun 2020)
 * Format: Xxx-xxxx-x-xx-xx-xxx
 * Contoh: 401-2024-1-01-02-001 (Mebel Kayu - Th 2024 - Paroki - Gereja Paroki - Altar - No 001)
 */
export function generateInventoryCode(
  jenisCode: string,
  tahun: number | string,
  teritoriCode: string,
  peruntukanCode: string,
  ruangCode: string,
  existingCodes: string[] = []
): string {
  const cleanJenis = jenisCode || '407';
  const cleanYear = String(tahun || new Date().getFullYear()).padStart(4, '0');
  const cleanTeritori = teritoriCode || '1';
  const cleanPeruntukan = String(peruntukanCode || '01').padStart(2, '0');
  const cleanRuang = String(ruangCode || '01').padStart(2, '0');

  const prefix = `${cleanJenis}-${cleanYear}-${cleanTeritori}-${cleanPeruntukan}-${cleanRuang}`;

  // Find highest sequence number for this exact prefix
  let maxSeq = 0;
  for (const c of existingCodes) {
    if (c.startsWith(prefix)) {
      const parts = c.split('-');
      const last = parts[parts.length - 1];
      const seq = parseInt(last, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  const nextSeq = String(maxSeq + 1).padStart(3, '0');
  return `${prefix}-${nextSeq}`;
}

export function parseInventoryCode(code: string) {
  const parts = code.split('-');
  if (parts.length < 6) return null;
  return {
    jenis: parts[0],
    tahun: parts[1],
    teritori: parts[2],
    peruntukan: parts[3],
    ruang: parts[4],
    urut: parts[5],
  };
}
