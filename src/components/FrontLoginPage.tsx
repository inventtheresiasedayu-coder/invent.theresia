import React, { useState } from 'react';
import { AppUser } from '../types/inventory';
import { storageService } from '../services/storageService';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';

interface FrontLoginPageProps {
  onLoginSuccess: (user: AppUser) => void;
}

export const FrontLoginPage: React.FC<FrontLoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Silakan masukkan username dan password.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const user = storageService.authenticate(username, password);
      if (user) {
        setIsLoading(false);
        onLoginSuccess(user);
      } else {
        setIsLoading(false);
        setErrorMsg('Username atau password salah. Pastikan akun telah didaftarkan oleh Admin PGPM.');
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Subtle modern ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-700/15 via-blue-900/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top minimal header */}
      <header className="relative z-10 w-full border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-500/30 flex items-center justify-center font-bold text-amber-400 text-sm">
              ✝
            </span>
            <div>
              <span className="font-extrabold text-xs sm:text-sm tracking-wide text-white block">
                PGPM PAROKI ST. THERESIA SEDAYU
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                Keuskupan Agung Semarang (KAS) • Pastor Kepala: Romo Antonius Hadi Cahyono, Pr
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Aset Digital
            </span>
          </div>
        </div>
      </header>

      {/* Main Login View */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Parish Identity & Transparent Logo */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Transparent Church Logo */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative inline-block">
                <img
                  src="/assets/aistudio/logo_transparent.png"
                  alt="Logo Gereja St. Theresia Sedayu"
                  className="max-h-32 sm:max-h-40 w-auto object-contain drop-shadow-[0_8px_24px_rgba(30,58,138,0.35)]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('logo_6b0741bc.png')) {
                      target.src = '/assets/aistudio/logo_6b0741bc.png';
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="inline-block px-3 py-1 bg-blue-900/40 border border-blue-500/30 rounded-full text-blue-300 text-[11px] font-bold tracking-wide">
                PASAL 14 PDP3 TAHUN 2020 KAS
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Sistem Inventarisasi Aset Tetap <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-100">
                  Paroki St. Theresia Sedayu
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Manajemen digital terpadu untuk pencatatan aset fisik, penomoran kode KAS,
                pelacakan lokasi di 5 Kapel, peminjaman, serta pemeliharaan berkala.
              </p>
            </div>

            {/* Hak Akses Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-left max-w-lg mx-auto lg:mx-0 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Keterangan Hak Akses Sistem:
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white">ADMIN PGPM:</strong> Kontrol penuh aset, nilai rupiah, hapus barang, dan cetak laporan resmi.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white">TIMPEL / KAPEL:</strong> Pendataan fisik, permohonan pinjam, verifikasi opname di lapangan.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white">AUDITOR DEWAN:</strong> Mode audit independen, inspeksi berkala, rekapitulasi KAS.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Modern Login Box */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Masuk ke Portal Inventaris
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Gunakan username dan password yang telah diterbitkan oleh Admin PGPM
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Username:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      autoFocus
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username Anda..."
                      className="w-full text-xs bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password Anda..."
                      className="w-full text-xs bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-700/25 transition active:scale-[0.99]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memverifikasi...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Masuk ke Akun</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-800/80 text-center">
                <p className="text-[11px] text-slate-400">
                  Belum memiliki akun? Hubungi <strong className="text-slate-300">Admin PGPM</strong> untuk pembuatan akun pengurus baru.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/60 bg-slate-950/70 py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Gereja St. Theresia Sedayu</strong> • Gubug, Argosari, Sedayu, Bantul, D.I. Yogyakarta 55752
          </div>
          <div className="text-[11px] text-slate-500">
            Pastor Kepala Paroki: Romo Antonius Hadi Cahyono, Pr
          </div>
        </div>
      </footer>
    </div>
  );
};
