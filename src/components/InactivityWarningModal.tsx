import React from 'react';
import { Clock, ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react';

interface InactivityWarningModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
}

export const InactivityWarningModal: React.FC<InactivityWarningModalProps> = ({
  isOpen,
  remainingSeconds,
  onStayLoggedIn,
  onLogoutNow,
}) => {
  if (!isOpen) return null;

  const totalWarningSeconds = 60;
  const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / totalWarningSeconds) * 100));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inactivity-warning-title"
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-7 relative overflow-hidden text-center space-y-5 animate-scaleUp">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/15 blur-2xl pointer-events-none" />

        {/* Warning Badge & Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
          <Clock className="w-8 h-8 animate-pulse text-amber-400" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
          </span>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold tracking-wide uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            Peringatan Keamanan Sesi
          </div>
          <h3
            id="inactivity-warning-title"
            className="text-xl font-extrabold text-white tracking-tight"
          >
            Sesi Akan Berakhir Otomatis
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            Tidak ada aktivitas terdeteksi selama <span className="font-semibold text-white">9 menit</span>.
            Demi keamanan data aset Paroki St. Theresia Sedayu, sistem akan keluar otomatis dalam:
          </p>
        </div>

        {/* Countdown Box */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 font-mono">
              {remainingSeconds}
            </span>
            <span className="text-sm font-semibold text-slate-400 self-end mb-1.5">detik</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                remainingSeconds <= 15 ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Gerakkan kursor, ketik tombol apa pun, atau klik <span className="text-amber-300 font-medium">Tetap Masuk</span> untuk melanjutkan sesi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onStayLoggedIn}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-900/40 hover:shadow-blue-800/60 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-blue-200" />
            Tetap Masuk
          </button>

          <button
            type="button"
            onClick={onLogoutNow}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-red-950/70 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-300 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Keluar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
