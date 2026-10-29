import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { AssetItem, JenisAsetKode, TimpelKode, KondisiAset } from '../types/inventory';
import { generateInventoryCode } from '../data/referenceData';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface ExcelImportModalProps {
  existingCodes: string[];
  onImportSuccess: (newAssets: AssetItem[]) => void;
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  existingCodes,
  onImportSuccess,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<AssetItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMsg(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawJson || rawJson.length === 0) {
          setErrorMsg('File kosong atau format tidak sesuai.');
          setIsProcessing(false);
          return;
        }

        // Detect header row
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(rawJson.length, 15); i++) {
          const row = rawJson[i];
          const text = row.map((c) => String(c || '').toLowerCase()).join(' ');
          if (text.includes('nama barang') || text.includes('nama_barang') || text.includes('barang')) {
            headerRowIdx = i;
            break;
          }
        }

        if (headerRowIdx === -1) headerRowIdx = 0;

        const headerRow = rawJson[headerRowIdx].map((c) => String(c || '').trim().toLowerCase());
        const nameIdx = headerRow.findIndex((c) => c.includes('nama') || c.includes('barang'));
        const codeIdx = headerRow.findIndex((c) => c.includes('kode'));
        const yearIdx = headerRow.findIndex((c) => c.includes('tahun'));
        const qtyIdx = headerRow.findIndex((c) => c.includes('jumlah') || c.includes('quantity') || c.includes('qty'));
        const condIdx = headerRow.findIndex((c) => c.includes('kondisi'));
        const locIdx = headerRow.findIndex((c) => c.includes('lokasi') || c.includes('tempat'));
        const priceIdx = headerRow.findIndex((c) => c.includes('harga') || c.includes('nilai'));

        const assetsList: AssetItem[] = [];
        const runningCodes = [...existingCodes];

        for (let r = headerRowIdx + 1; r < rawJson.length; r++) {
          const row = rawJson[r];
          if (!row || row.length === 0) continue;

          const rawName = String(row[nameIdx !== -1 ? nameIdx : 1] || '').trim();
          if (!rawName || rawName.toLowerCase().includes('nama barang') || rawName.startsWith('---')) {
            continue;
          }

          const rawCode = codeIdx !== -1 ? String(row[codeIdx] || '') : '';
          const rawYear = yearIdx !== -1 ? String(row[yearIdx] || '') : '2024';
          const rawQty = qtyIdx !== -1 ? String(row[qtyIdx] || '') : '1';
          const rawCond = condIdx !== -1 ? String(row[condIdx] || '') : 'Baik';
          const rawLoc = locIdx !== -1 ? String(row[locIdx] || '') : 'Gereja Paroki Sedayu';
          const rawPrice = priceIdx !== -1 ? String(row[priceIdx] || '') : '0';

          const year = parseInt(rawYear.replace(/[^0-9]/g, ''), 10) || 2024;
          const qty = parseInt(rawQty.replace(/[^0-9]/g, ''), 10) || 1;
          const price = parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) || 0;

          // Detect Jenis Aset
          let jenisCode: JenisAsetKode = '407';
          const codeNum = parseInt(rawCode, 10);
          if (['100','200','300','401','402','403','404','405','406','407','501','502','503'].includes(String(codeNum))) {
            jenisCode = String(codeNum) as JenisAsetKode;
          } else {
            const nl = rawName.toLowerCase();
            if (nl.includes('meja') || nl.includes('kursi') || nl.includes('almari') || nl.includes('kayu')) jenisCode = '401';
            else if (nl.includes('komputer') || nl.includes('printer')) jenisCode = '402';
            else if (nl.includes('sound') || nl.includes('mic') || nl.includes('speaker') || nl.includes('proyektor') || nl.includes('mixer')) jenisCode = '403';
            else if (nl.includes('ac') || nl.includes('kipas')) jenisCode = '502';
            else if (nl.includes('genset') || nl.includes('besi') || nl.includes('tangga')) jenisCode = '501';
          }

          const isKapel = rawLoc.toLowerCase().includes('kapel') || rawLoc.toLowerCase().includes('metes') || rawLoc.toLowerCase().includes('demangan');
          const teritoriCode = isKapel ? '2' : '1';
          const peruntukanCode = isKapel ? '03' : '01';

          let ruangCode = '99';
          let ruangNama = 'Umum / Serbaguna';
          const locLower = rawLoc.toLowerCase();
          if (locLower.includes('sakristi')) { ruangCode = '01'; ruangNama = 'Sakristi'; }
          else if (locLower.includes('altar')) { ruangCode = '02'; ruangNama = 'Altar / Panti Imam'; }
          else if (locLower.includes('aula')) { ruangCode = '04'; ruangNama = 'Aula'; }
          else if (locLower.includes('sekretariat')) { ruangCode = '05'; ruangNama = 'Sekretariat'; }
          else if (locLower.includes('pastoran')) { ruangCode = '07'; ruangNama = 'Pastoran'; }
          else if (locLower.includes('audio') || locLower.includes('komsos')) { ruangCode = '08'; ruangNama = 'R. Audio Visual'; }

          // Generate proper KAS code
          const generatedCode = generateInventoryCode(
            jenisCode,
            year,
            teritoriCode,
            peruntukanCode,
            ruangCode,
            runningCodes
          );
          runningCodes.push(generatedCode);

          let kondisi: KondisiAset = 'Baik';
          if (rawCond.toLowerCase().includes('rusak berat')) kondisi = 'Rusak Berat';
          else if (rawCond.toLowerCase().includes('rusak') || rawCond.toLowerCase().includes('kb')) kondisi = 'Rusak Sedang';
          else if (rawCond.toLowerCase().includes('sedang')) kondisi = 'Rusak Ringan';
          else if (rawCond.toLowerCase().includes('belum')) kondisi = 'Belum Opname';

          assetsList.push({
            id: `AST-IMP-${Date.now()}-${r}`,
            kodeAset: generatedCode,
            namaBarang: rawName,
            jenisAsetKode: jenisCode,
            jenisAsetName: 'Aset Tetap Terklasifikasi',
            timpelKode: 'D',
            timpelName: 'Rumah Tangga',
            tahunPerolehan: year,
            bulanPerolehan: '-',
            hargaNilai: price,
            quantity: qty,
            satuan: 'unit',
            kondisi,
            lokasi: rawLoc,
            teritori: isKapel ? 'Stasi/Kapel' : 'Paroki',
            peruntukan: peruntukanCode,
            ruangKode: ruangCode,
            ruangNama,
            pengguna: 'Umat & Pengurus',
            statusPeminjaman: 'Tersedia',
            keterangan: 'Diimpor dari File Excel Baru',
            terakhirOpname: new Date().toISOString().slice(0, 10),
          });
        }

        setParsedItems(assetsList);
        setIsProcessing(false);
      } catch (err: any) {
        console.error('Import error:', err);
        setErrorMsg('Gagal memproses file. Pastikan format tabel memiliki kolom Nama Barang.');
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleConfirmImport = () => {
    if (parsedItems.length > 0) {
      onImportSuccess(parsedItems);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-semibold text-base">Impor Dokumen Excel / CSV Inventaris</h3>
              <p className="text-xs text-slate-400">
                Generate otomatis pengurutan kode KAS dan klasifikasi aset dari file Excel baru
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 grow">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition bg-slate-50">
            <input
              type="file"
              id="excel-file-input"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="excel-file-input" className="cursor-pointer block">
              <Upload className="w-10 h-10 text-emerald-600 mx-auto mb-2 animate-bounce" />
              <span className="font-bold text-slate-800 text-sm block">
                Pilih atau Tarik File Excel (.xlsx / .csv)
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                Format tabel: NO, NAMA BARANG, KODE ASET, PEROLEHAN, QUANTITY, KONDISI, LOKASI
              </span>
            </label>
            {file && (
              <div className="mt-3 inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-mono text-xs rounded-lg font-bold">
                {file.name}
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-6 text-xs text-slate-500">
              Sedang membaca dan men-generate urutan kode KAS...
            </div>
          )}

          {parsedItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Berhasil membaca {parsedItems.length} aset dengan kode inventaris baru:
                </span>
                <span className="text-[11px] text-slate-500">Pratinjau 5 teratas</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50 text-xs">
                {parsedItems.slice(0, 8).map((it) => (
                  <div key={it.id} className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-blue-900 block text-[11px]">
                        {it.kodeAset}
                      </span>
                      <span className="font-medium text-slate-800">{it.namaBarang}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px]">{it.lokasi}</span>
                      <span className="text-emerald-700 font-bold text-[10px]">{it.kondisi}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-medium transition"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedItems.length === 0}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Tambahkan {parsedItems.length} Aset ke Database
          </button>
        </div>
      </div>
    </div>
  );
};
