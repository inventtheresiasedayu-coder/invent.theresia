import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { AssetItem } from '../types/inventory';
import { X, Camera, Search, CheckCircle, AlertTriangle, ArrowRight, Check } from 'lucide-react';

interface BarcodeScannerModalProps {
  assets: AssetItem[];
  onClose: () => void;
  onSelectAsset: (asset: AssetItem) => void;
  onQuickOpname: (asset: AssetItem) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  assets,
  onClose,
  onSelectAsset,
  onQuickOpname,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [foundAsset, setFoundAsset] = useState<AssetItem | null>(null);
  const [opnameSuccess, setOpnameSuccess] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    try {
      const scanner = new Html5QrcodeScanner(
        'reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        false
      );
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          handleDetectedCode(decodedText);
        },
        (error) => {
          // ignore scan frame errors
        }
      );
    } catch (err: any) {
      setCameraError('Kamera tidak dapat diakses atau diblokir peramban.');
      console.warn('Scanner init failed:', err);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((e) => console.error(e));
      }
    };
  }, []);

  const handleDetectedCode = (codeOrJson: string) => {
    let searchTarget = codeOrJson.trim();

    // Try parsing if payload is JSON
    try {
      const parsed = JSON.parse(codeOrJson);
      if (parsed.code) searchTarget = parsed.code;
    } catch (e) {
      // plain text code
    }

    setScanResult(searchTarget);

    // Search in assets by kodeAset or id
    const match = assets.find(
      (a) =>
        a.kodeAset.toLowerCase() === searchTarget.toLowerCase() ||
        a.id.toLowerCase() === searchTarget.toLowerCase() ||
        searchTarget.includes(a.kodeAset)
    );

    if (match) {
      setFoundAsset(match);
      setOpnameSuccess(false);
    } else {
      setFoundAsset(null);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDetectedCode(manualCode);
  };

  const handleOpnameClick = () => {
    if (foundAsset) {
      onQuickOpname(foundAsset);
      setOpnameSuccess(true);
      setTimeout(() => setOpnameSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Camera className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-semibold text-base">Pemindai Barcode & QR Code Aset</h3>
              <p className="text-xs text-slate-400">Pindai label fisik untuk cek kondisi & opname cepat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Camera Viewport */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <div id="reader" className="w-full"></div>
            {cameraError && (
              <div className="p-4 text-center text-xs text-amber-300 bg-amber-950/80">
                {cameraError} Silakan gunakan input manual di bawah atau gunakan scanner barcode USB.
              </div>
            )}
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Atau ketik/tembakkan kode (misal: 401-2024-1-01-02-001)..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shrink-0"
            >
              <Search className="w-4 h-4" />
              Cari
            </button>
          </form>

          {/* Search Result Section */}
          {scanResult && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 animate-in fade-in duration-200">
              <div className="text-[11px] text-slate-500 font-mono mb-1">
                Hasil Pemindaian: <span className="font-bold text-slate-900">{scanResult}</span>
              </div>

              {foundAsset ? (
                <div className="bg-white rounded-lg p-3.5 border border-emerald-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-bold">
                        {foundAsset.kodeAset}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{foundAsset.namaBarang}</h4>
                      <p className="text-xs text-slate-600">{foundAsset.lokasi} • {foundAsset.ruangNama}</p>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        foundAsset.kondisi === 'Baik'
                          ? 'bg-emerald-100 text-emerald-800'
                          : foundAsset.kondisi === 'Rusak Berat'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {foundAsset.kondisi}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Jenis Aset:</span>
                      <span className="font-medium text-slate-800">{foundAsset.jenisAsetName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Timpel:</span>
                      <span className="font-medium text-slate-800">{foundAsset.timpelName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Status:</span>
                      <span className="font-medium text-slate-800">{foundAsset.statusPeminjaman}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Terakhir Opname:</span>
                      <span className="font-medium text-slate-800">{foundAsset.terakhirOpname || '-'}</span>
                    </div>
                  </div>

                  {/* Actions for found asset */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <button
                      onClick={handleOpnameClick}
                      disabled={opnameSuccess}
                      className={`text-xs px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                        opnameSuccess
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      {opnameSuccess ? <Check className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      {opnameSuccess ? 'Opname Terverifikasi!' : 'Verifikasi Opname Sekarang'}
                    </button>

                    <button
                      onClick={() => {
                        onSelectAsset(foundAsset);
                        onClose();
                      }}
                      className="text-xs px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold flex items-center gap-1.5 transition"
                    >
                      Buka Detail Lengkap
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Aset dengan kode tersebut tidak ditemukan dalam sistem inventaris Paroki Sedayu.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
