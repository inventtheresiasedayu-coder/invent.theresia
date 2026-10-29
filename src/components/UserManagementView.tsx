import React, { useState } from 'react';
import { AppUser, UserRole } from '../types/inventory';
import { AuthAccount, ROLE_PERMISSIONS_INFO } from '../data/authUsers';
import { storageService } from '../services/storageService';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
  Save,
  Lock,
  User,
  Mail,
  Building,
} from 'lucide-react';

interface UserManagementViewProps {
  currentUser: AppUser;
  onUserListChanged: () => void;
  triggerToast: (msg: string, type?: 'success' | 'info' | 'warn') => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  onUserListChanged,
  triggerToast,
}) => {
  const [users, setUsers] = useState<AuthAccount[]>(() => storageService.getRegisteredUsers());
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthAccount | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('TIMPEL_PENGURUS');
  const [roleTitle, setRoleTitle] = useState('');
  const [email, setEmail] = useState('');
  const [timpel, setTimpel] = useState('');
  const [kapel, setKapel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Visible passwords in table
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Access check
  if (currentUser.role !== 'ADMIN_PGPM') {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-lg mx-auto shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h3 className="font-extrabold text-base text-slate-900">Akses Dibatasi</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Halaman Registrasi & Manajemen Pengguna hanya dapat diakses oleh{' '}
          <strong className="text-slate-700">Admin PGPM</strong>. Silakan hubungi Sekretariat PGPM
          Paroki Sedayu untuk pengelolaan akun.
        </p>
      </div>
    );
  }

  const openRegisterModal = (userToEdit?: AuthAccount) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setName(userToEdit.name);
      setUsername(userToEdit.username);
      setPassword(userToEdit.password);
      setRole(userToEdit.role);
      setRoleTitle(userToEdit.roleTitle);
      setEmail(userToEdit.email);
      setTimpel(userToEdit.timpel || '');
      setKapel(userToEdit.kapel || '');
    } else {
      setEditingUser(null);
      setName('');
      setUsername('');
      setPassword('');
      setRole('TIMPEL_PENGURUS');
      setRoleTitle('');
      setEmail('');
      setTimpel('');
      setKapel('');
    }
    setFormError(null);
    setShowRegisterModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      setFormError('Mohon lengkapi Nama, Username, dan Password.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check duplicate if new
    if (!editingUser) {
      const exists = users.some((u) => u.username.toLowerCase() === cleanUsername);
      if (exists) {
        setFormError(`Username "${cleanUsername}" sudah digunakan oleh akun lain.`);
        return;
      }
    }

    const userAccount: AuthAccount = {
      id: editingUser ? editingUser.id : `usr-reg-${Date.now().toString().slice(-5)}`,
      name: name.trim(),
      username: cleanUsername,
      password: password.trim(),
      role,
      roleTitle: roleTitle.trim() || (role === 'ADMIN_PGPM' ? 'Admin PGPM' : role === 'AUDITOR_DEWAN' ? 'Auditor Dewan' : 'Pengurus Timpel/Kapel'),
      email: email.trim() || `${cleanUsername}@sedayu.id`,
      description:
        role === 'ADMIN_PGPM'
          ? 'Kontrol penuh aset, nilai rupiah, hapus barang, dan cetak laporan resmi.'
          : role === 'AUDITOR_DEWAN'
          ? 'Mode audit independen, inspeksi berkala, rekapitulasi KAS.'
          : 'Pendataan fisik, permohonan pinjam, verifikasi opname di lapangan.',
      timpel: timpel.trim() || undefined,
      kapel: kapel.trim() || undefined,
    };

    try {
      if (editingUser) {
        storageService.updateRegisteredUser(userAccount);
        storageService.addAuditLog({
          namaBarang: `Akun: ${userAccount.username}`,
          tipeAksi: 'EDIT_ASET',
          detailPerubahan: `Pembaruan akun pengguna: ${userAccount.name} (${userAccount.role})`,
          pelaku: currentUser.name,
          role: currentUser.role,
        });
        triggerToast(`Akun "${userAccount.name}" berhasil diperbarui.`, 'success');
      } else {
        storageService.addRegisteredUser(userAccount);
        storageService.addAuditLog({
          namaBarang: `Akun: ${userAccount.username}`,
          tipeAksi: 'TAMBAH_ASET',
          detailPerubahan: `Registrasi akun baru: ${userAccount.name} (@${userAccount.username}) sebagai ${userAccount.role}`,
          pelaku: currentUser.name,
          role: currentUser.role,
        });
        triggerToast(`Akun baru "${userAccount.name}" berhasil didaftarkan!`, 'success');
      }

      const updated = storageService.getRegisteredUsers();
      setUsers(updated);
      onUserListChanged();
      setShowRegisterModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan akun.');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Hapus akun pengurus "${userName}" dari sistem? Akun ini tidak akan dapat login lagi.`)) {
      try {
        storageService.deleteRegisteredUser(userId);
        storageService.addAuditLog({
          namaBarang: `Akun: ${userName}`,
          tipeAksi: 'HAPUS_ASET',
          detailPerubahan: `Penghapusan akun pengurus: ${userName}`,
          pelaku: currentUser.name,
          role: currentUser.role,
        });
        const updated = storageService.getRegisteredUsers();
        setUsers(updated);
        onUserListChanged();
        triggerToast(`Akun "${userName}" berhasil dihapus.`, 'info');
      } catch (err: any) {
        triggerToast(err.message || 'Gagal menghapus akun.', 'warn');
      }
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 mb-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>KHUSUS ADMINISTRATOR UTAMA PGPM</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Registrasi & Manajemen Pengguna Inventaris
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
            Daftarkan akun pengurus baru untuk Tim Pelayanan, Pengurus Kapel (Metes, Kaliduren,
            Demangan, Jurug, Sumbersari), serta Tim Audit Dewan Pastoral Paroki.
          </p>
        </div>

        <button
          onClick={() => openRegisterModal()}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-[0.99] shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrasi User Baru</span>
        </button>
      </div>

      {/* Permissions Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {ROLE_PERMISSIONS_INFO.map((item) => (
          <div
            key={item.role}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    item.role === 'ADMIN_PGPM'
                      ? 'bg-blue-50 text-blue-900 border-blue-200'
                      : item.role === 'AUDITOR_DEWAN'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  }`}
                >
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {users.filter((u) => u.role === item.role).length} User Terdaftar
                </span>
              </div>
              <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                {item.description}
              </p>
            </div>
            <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
              Contoh akun: @{item.account}
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-700" />
            Daftar Akun Pengguna Terdaftar ({users.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Pastor Kepala Paroki: <strong>Romo Antonius Hadi Cahyono, Pr</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Nama Pengurus</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3">Peran / Hak Akses</th>
                <th className="py-3 px-3">Jabatan & Wilayah</th>
                <th className="py-3 px-3">Password (Kredensial)</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  {/* Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                          u.role === 'ADMIN_PGPM'
                            ? 'bg-blue-100 text-blue-900'
                            : u.role === 'AUDITOR_DEWAN'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {u.role === 'ADMIN_PGPM' ? '✝' : u.role === 'AUDITOR_DEWAN' ? '⚖' : '✓'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Username */}
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                    @{u.username}
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        u.role === 'ADMIN_PGPM'
                          ? 'bg-blue-50 text-blue-900 border-blue-200'
                          : u.role === 'AUDITOR_DEWAN'
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      }`}
                    >
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Role Title / Location */}
                  <td className="py-3.5 px-3 text-slate-700">
                    <span className="font-medium block">{u.roleTitle}</span>
                    {(u.timpel || u.kapel) && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {u.timpel ? `Timpel: ${u.timpel}` : ''} {u.kapel ? `• ${u.kapel}` : ''}
                      </span>
                    )}
                  </td>

                  {/* Password preview for Admin */}
                  <td className="py-3.5 px-3 font-mono">
                    <div className="inline-flex items-center space-x-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-xs">
                      <span>{visiblePasswords[u.id] ? u.password : '••••••••'}</span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(u.id)}
                        className="text-slate-400 hover:text-slate-600 ml-1"
                        title="Tampilkan / Sembunyikan Password"
                      >
                        {visiblePasswords[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => openRegisterModal(u)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition"
                      title="Edit Akun"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {u.id !== 'usr-admin-01' && (
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration / Edit Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-800 text-amber-400 flex items-center justify-center font-bold text-xs">
                  ✝
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {editingUser ? 'Ubah Data Akun Pengurus' : 'Registrasi Pengguna Baru (Admin PGPM)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Akun yang didaftarkan dapat langsung digunakan untuk masuk sistem
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Pengurus <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Bpk. Yohanes Sugito, Sr. Theresia, dsb."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden font-medium"
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="misal: timpel.liturgi"
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hak Akses & Peran (Role):
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden font-semibold"
                >
                  <option value="ADMIN_PGPM">ADMIN PGPM (Kontrol Penuh, Hapus Aset & Laporan Resmi)</option>
                  <option value="TIMPEL_PENGURUS">TIMPEL / KAPEL (Pendataan Fisik, Peminjaman & Opname)</option>
                  <option value="AUDITOR_DEWAN">AUDITOR DEWAN (Mode Audit Independen & Rekapitulasi KAS)</option>
                </select>
              </div>

              {/* Role Title & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan / Tanggung Jawab:
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="Contoh: Pengurus Kapel Kaliduren"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@sedayu.id"
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Timpel / Kapel Note */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bidang Timpel (Opsional):
                  </label>
                  <input
                    type="text"
                    value={timpel}
                    onChange={(e) => setTimpel(e.target.value)}
                    placeholder="Contoh: Paramenta / Audio"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Wilayah Kapel (Opsional):
                  </label>
                  <input
                    type="text"
                    value={kapel}
                    onChange={(e) => setKapel(e.target.value)}
                    placeholder="Contoh: Kapel Metes"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingUser ? 'Simpan Perubahan' : 'Daftarkan Akun'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
