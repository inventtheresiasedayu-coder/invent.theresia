import React from 'react';
import { AppUser } from '../types/inventory';
import { storageService } from '../services/storageService';
import { ROLE_PERMISSIONS_INFO } from '../data/authUsers';
import { X, Shield, LogOut, KeyRound, Check } from 'lucide-react';

interface RoleAuthModalProps {
  currentUser: AppUser;
  onSelectUser: (user: AppUser) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const RoleAuthModal: React.FC<RoleAuthModalProps> = ({
  currentUser,
  onSelectUser,
  onLogout,
  onClose,
}) => {
  const registeredUsers = storageService.getRegisteredUsers();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-semibold text-base">Otentikasi & Hak Akses Berbasis Peran</h3>
              <p className="text-xs text-slate-400">
                Pilih profil pengguna untuk menyesuaikan kewenangan akses data inventaris
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
        <div className="p-6 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[10px]">Pengguna Aktif:</span>
              <strong className="text-sm font-bold">{currentUser.name}</strong>
              <div className="text-[11px] text-blue-700 font-mono">@{currentUser.username}</div>
            </div>
            <span className="font-bold px-2.5 py-1 rounded bg-blue-900 text-amber-300 font-mono text-[10px]">
              {currentUser.role}
            </span>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Beralih Akun Pengurus Resmi Paroki Sedayu:
            </h4>

            {registeredUsers.map((user) => {
              const isSelected = user.id === currentUser.id || user.username === currentUser.username;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-700 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        user.role === 'ADMIN_PGPM'
                          ? 'bg-blue-900 text-amber-300'
                          : user.role === 'AUDITOR_DEWAN'
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-700 text-white'
                      }`}
                    >
                      {user.role === 'ADMIN_PGPM' ? '✝' : user.role === 'AUDITOR_DEWAN' ? '⚖' : '✓'}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        {user.name}
                        {isSelected && (
                          <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-normal">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600">{user.roleTitle}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        User: <strong className="text-slate-600">{user.username}</strong> | Pass: <span className="text-slate-500">{user.password}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        user.role === 'ADMIN_PGPM'
                          ? 'bg-amber-100 text-amber-900'
                          : user.role === 'AUDITOR_DEWAN'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">Keterangan Hak Akses:</div>
            <div>• <strong>ADMIN PGPM:</strong> Kontrol penuh aset, nilai rupiah, hapus barang, dan cetak laporan resmi.</div>
            <div>• <strong>TIMPEL / KAPEL:</strong> Pendataan fisik, permohonan pinjam, verifikasi opname di lapangan.</div>
            <div>• <strong>AUDITOR DEWAN:</strong> Mode audit independen, inspeksi berkala, rekapitulasi KAS.</div>
          </div>

          {/* Logout Action */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-400">Keluar ke Halaman Muka:</span>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar (Logout)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
