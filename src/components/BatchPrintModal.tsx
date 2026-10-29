import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { AssetItem } from '../types/inventory';
import { X, Printer, CheckSquare, Square, Filter } from 'lucide-react';

interface BatchPrintModalProps {
  assets: AssetItem[];
  onClose: () => void;
}

export const BatchPrintModal: React.FC<BatchPrintModalProps> = ({ assets, onClose }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    assets.slice(0, 12).map((a) => a.id)
  );
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [filterLocation, setFilterLocation] = useState<string>('all');

  const filteredAssets = filterLocation === 'all'
    ? assets
    : assets.filter((a) => a.lokasi.includes(filterLocation));

  useEffect(() => {
    // Generate QR for all selected
    const activeAssets = assets.filter((a) => selectedIds.includes(a.id));
    const promises = activeAssets.map(async (asset) => {
      const payload = JSON.stringify({
        code: asset.kodeAset,
        name: asset.namaBarang,
        loc: asset.lokasi,
        org: 'PGPM PAROKI SEDAYU',
      });
      const url = await QRCode.toDataURL(payload, { width: 120, margin: 1 });
      return { id: asset.id, url };
    });

    Promise.all(promises).then((results) => {
      const map: Record<string, string> = {};
      results.forEach((r) => {
        map[r.id] = r.url;
      });
      setQrMap(map);
    });
  }, [selectedIds, assets]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const ids = filteredAssets.map((a) => a.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const deselectAllFiltered = () => {
    const ids = new Set(filteredAssets.map((a) => a.id));
    setSelectedIds((prev) => prev.filter((id) => !ids.has(id)));
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedAssetList = assets.filter((a) => selectedIds.includes(a.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-semibold text-base">Cetak Lembar Stiker Barcode Massal</h3>
            <p className="text-xs text-slate-400">
              Pilih aset untuk dicetak ke lembar stiker (format A4 / Label Kartu Inventaris PGPM Sedayu)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Filter Lokasi:</span>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="all">Semua Lokasi</option>
              <option value="Gereja Paroki Sedayu">Gereja Paroki Sedayu</option>
              <option value="Kaliduren">Kapel Kaliduren</option>
              <option value="Metes">Kapel Metes</option>
              <option value="Demangan">Kapel Demangan</option>
              <option value="Jurug">Kapel Jurug</option>
              <option value="Sumbersari">Kapel Sumbersari</option>
              <option value="PASTORAN">Pastoran</option>
              <option value="AULA">Aula</option>
              <option value="SAKRISTI">Sakristi</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAllFiltered}
              className="text-xs px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-medium text-slate-700 transition"
            >
              Pilih Semua ({filteredAssets.length})
            </button>
            <button
              onClick={deselectAllFiltered}
              className="text-xs px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-medium text-slate-700 transition"
            >
              Kosongkan Pilihan
            </button>
            <span className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
              {selectedIds.length} Terpilih
            </span>
            <button
              onClick={handlePrint}
              disabled={selectedIds.length === 0}
              className="text-xs px-4 py-1.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              Cetak Stiker ({selectedIds.length})
            </button>
          </div>
        </div>

        {/* Content Area: Grid of labels */}
        <div className="p-6 overflow-y-auto grow">
          {selectedAssetList.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Belum ada aset yang dipilih. Pilih item di bawah untuk dicetak.
            </div>
          ) : (
            <div
              id="batch-printable-sheet"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
              {selectedAssetList.map((asset) => (
                <div
                  key={asset.id}
                  className="border-2 border-slate-900 rounded-lg p-3 bg-white text-slate-900 flex flex-col justify-between text-left relative"
                >
                  {/* Label Header */}
                  <div className="border-b border-slate-900 pb-1 mb-1.5 flex items-center justify-between">
                    <div className="text-[9px] font-black uppercase text-blue-950">
                      PGPM ST. THERESIA SEDAYU
                    </div>
                    <div className="text-[8px] bg-slate-100 px-1 py-0.2 rounded font-mono font-bold">
                      {asset.timpelKode}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    {/* QR Code */}
                    <div className="shrink-0 border border-slate-200 rounded p-1 bg-slate-50">
                      {qrMap[asset.id] ? (
                        <img
                          src={qrMap[asset.id]}
                          alt={asset.kodeAset}
                          className="w-18 h-18 object-contain"
                        />
                      ) : (
                        <div className="w-18 h-18 bg-slate-100 animate-pulse" />
                      )}
                    </div>

                    {/* Meta */}
                    <div className="min-w-0 flex-1">
                      <div className="font-mono font-black text-xs text-blue-950 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 truncate">
                        {asset.kodeAset}
                      </div>
                      <div className="font-bold text-[11px] text-slate-900 truncate mt-1">
                        {asset.namaBarang}
                      </div>
                      <div className="text-[9px] text-slate-600 truncate">
                        {asset.lokasi}
                      </div>
                      <div className="text-[8px] text-slate-500 mt-0.5">
                        Th. {asset.tahunPerolehan} • {asset.ruangNama}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Selector List for checking/unchecking */}
          <div className="mt-8 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Daftar Seleksi Cepat Aset ({filteredAssets.length} item ditemukan):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              {filteredAssets.slice(0, 100).map((a) => {
                const isSelected = selectedIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleSelect(a.id)}
                    className={`flex items-center space-x-2 p-1.5 rounded-lg border text-left transition ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-700 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div className="truncate flex-1">
                      <span className="font-mono text-[10px] font-bold block">{a.kodeAset}</span>
                      <span className="truncate block font-medium">{a.namaBarang}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
