import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { AssetItem } from '../types/inventory';
import { X, Printer, Download, QrCode, Tag, Church } from 'lucide-react';

interface BarcodeModalProps {
  asset: AssetItem | null;
  onClose: () => void;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({ asset, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (asset) {
      // Encode structured payload: asset code, name, location, parish
      const payload = JSON.stringify({
        code: asset.kodeAset,
        name: asset.namaBarang,
        loc: asset.lokasi,
        ruang: asset.ruangNama,
        org: 'PGPM PAROKI ST THERESIA SEDAYU KAS',
      });

      QRCode.toDataURL(payload, {
        width: 240,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [asset]);

  if (!asset) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR_${asset.kodeAset}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Tag className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-semibold text-base">Label Barcode & QR Code Aset</h3>
              <p className="text-xs text-slate-400">PGPM Paroki St. Theresia Sedayu</p>
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
        <div className="p-6">
          {/* Printable Label Card */}
          <div
            id="printable-label"
            className="border-2 border-slate-800 rounded-xl p-4 bg-white shadow-sm flex flex-col items-center text-center relative"
          >
            {/* Header label */}
            <div className="w-full flex items-center justify-between border-b-2 border-slate-800 pb-2 mb-3">
              <div className="flex items-center space-x-2 text-left">
                <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                  ✝
                </div>
                <div>
                  <div className="text-[11px] font-black tracking-wide text-slate-900 uppercase">
                    PGPM PAROKI ST. THERESIA SEDAYU
                  </div>
                  <div className="text-[9px] font-semibold text-slate-600 uppercase">
                    KEUSKUPAN AGUNG SEMARANG (KAS)
                  </div>
                </div>
              </div>
              <div className="text-[9px] px-2 py-0.5 bg-slate-100 rounded border border-slate-300 font-mono font-bold">
                {asset.timpelName}
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg mb-3">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={asset.kodeAset} className="w-36 h-36 mx-auto object-contain" />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-slate-400">
                  <QrCode className="w-12 h-12 animate-pulse" />
                </div>
              )}
            </div>

            {/* Asset Code */}
            <div className="font-mono font-black text-lg text-blue-950 tracking-wider bg-amber-50 px-3 py-1 rounded border border-amber-200 w-full mb-2">
              {asset.kodeAset}
            </div>

            {/* Asset Details */}
            <div className="text-left w-full space-y-1 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Nama Barang:</span>
                <span className="font-bold text-slate-900 max-w-[240px] truncate text-right">
                  {asset.namaBarang}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Lokasi / Ruang:</span>
                <span className="font-medium text-slate-800 max-w-[240px] truncate text-right">
                  {asset.lokasi} • {asset.ruangNama}
                </span>
              </div>
              <div className="flex justify-between pt-0.5 text-[11px]">
                <span className="text-slate-500">Perolehan / Kondisi:</span>
                <span className="font-semibold text-slate-700">
                  Th. {asset.tahunPerolehan} • <span className="text-emerald-700">{asset.kondisi}</span>
                </span>
              </div>
            </div>

            {/* Bottom notice */}
            <div className="mt-3 pt-1 border-t border-slate-200 w-full text-[8.5px] text-slate-400 italic">
              *Dilarang merusak atau memindahkan label inventaris tanpa izin tertulis PGPM
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
            <button
              onClick={handleDownloadQR}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              Unduh QR Image
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              Cetak Label Stiker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
