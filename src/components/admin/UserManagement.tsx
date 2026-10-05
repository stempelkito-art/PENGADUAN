import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Check, 
  Lock, 
  KeyRound,
  ShieldCheck,
  Edit,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
  Info,
  Download,
  Upload,
  Copy,
  Share2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    currentUser, 
    setUserRole,
    triggerManualSync,
    syncStatus,
    isServerConnected,
    lastSyncTime 
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form States
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('dinsos123');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('PETUGAS_PENERIMA');
  const [jabatan, setJabatan] = useState('Petugas Front Office / Penerima Pengaduan');
  const [successToast, setSuccessToast] = useState('');

  // Export / Import Synchronization Modals
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');

  const handleCopyExportCode = () => {
    const payload = JSON.stringify(users, null, 2);
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadExportFile = () => {
    const payload = JSON.stringify(users, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sipmas-users-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyImport = async () => {
    try {
      setImportError('');
      if (!importCode.trim()) {
        setImportError('Mohon tempelkan kode teks akun atau pilih berkas JSON terlebih dahulu.');
        return;
      }
      const parsed = JSON.parse(importCode.trim());
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setImportError('Format data tidak valid. Data harus berupa daftar akun petugas.');
        return;
      }
      const validUsers: User[] = parsed.filter(u => u && u.id && u.nama && u.role);
      if (validUsers.length === 0) {
        setImportError('Tidak ditemukan akun yang valid dalam data yang ditempel.');
        return;
      }

      for (const u of validUsers) {
        const existing = users.find(x => x.id === u.id);
        if (existing) {
          await updateUser(u.id, u);
        } else {
          await addUser(u);
        }
      }

      setImportModalOpen(false);
      setImportCode('');
      setSuccessToast(`Berhasil menyelaraskan ${validUsers.length} akun petugas dari PC lain!`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      setImportError('Gagal membaca kode akun: ' + (err.message || 'Format JSON salah'));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportCode(content);
      }
    };
    reader.readAsText(file);
  };

  // Default suggested positions per role
  const defaultJabatans: Record<UserRole, string> = {
    PETUGAS_PENERIMA: 'Petugas Front Office / Penerima Pengaduan',
    PETUGAS_PENELAAH: 'Petugas / Tim Penelaah & Klasifikasi',
    PETUGAS_PENYELESAIAN: 'Petugas Lapangan & Tindak Lanjut Masalah',
    PIMPINAN: 'Kepala Dinas Sosial Kota Tanjungbalai',
    ADMIN: 'Administrator Sistem SIPMAS',
    MASYARAKAT: 'Masyarakat / Pemohon'
  };

  const roleDescriptions: Record<UserRole, { title: string; desc: string; badgeColor: string }> = {
    ADMIN: {
      title: 'Administrator Sistem',
      desc: 'Mengelola seluruh data pengaduan, pengguna, konfigurasi sistem, dan laporan lengkap.',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300'
    },
    PETUGAS_PENERIMA: {
      title: 'Petugas Penerima Pengaduan',
      desc: 'Menerima pengaduan tatap muka/telepon, input identitas, dan verifikasi kelengkapan berkas.',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300'
    },
    PETUGAS_PENELAAH: {
      title: 'Petugas / Tim Penelaah',
      desc: 'Menelaah 6 aspek, mengklasifikasi 10 kategori, penentuan kewenangan & prioritas.',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
    },
    PETUGAS_PENYELESAIAN: {
      title: 'Petugas Penyelesaian & Lapangan',
      desc: 'Verifikasi faktual, tindakan penyelesaian, unggah bukti, dan konfirmasi pengadu.',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    },
    PIMPINAN: {
      title: 'Pimpinan (Kepala Dinas)',
      desc: 'Dashboard eksekutif, pengaduan mendesak, monitoring target waktu SLA, pengesahan laporan.',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300'
    },
    MASYARAKAT: {
      title: 'Masyarakat / Pemohon',
      desc: 'Membuat aduan, melacak status, dan memberikan konfirmasi/tanggapan hasil.',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setNama('');
    setNip('');
    setUsername('');
    setPassword('dinsos123');
    setEmail('');
    setRole('PETUGAS_PENERIMA');
    setJabatan(defaultJabatans['PETUGAS_PENERIMA']);
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setNama(u.nama);
    setNip(u.nip || '');
    setUsername(u.username || u.email.split('@')[0] || 'petugas');
    setPassword(u.password || 'dinsos123');
    setEmail(u.email);
    setRole(u.role);
    setJabatan(u.jabatan);
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const finalUsername = username.trim() || nama.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15) || 'petugas';
    const finalPassword = password.trim() || 'dinsos123';
    const finalEmail = email.trim() || `${finalUsername}@tanjungbalaikota.go.id`;

    if (editingUser) {
      // Update existing user
      updateUser(editingUser.id, {
        nama: nama.trim(),
        nip: nip.trim() || undefined,
        username: finalUsername,
        password: finalPassword,
        email: finalEmail,
        role,
        jabatan: jabatan.trim() || defaultJabatans[role]
      });

      setSuccessToast(`Akun petugas "${nama}" berhasil diperbarui!`);
    } else {
      // Create new user
      addUser({
        nama: nama.trim(),
        nip: nip.trim() || undefined,
        username: finalUsername,
        password: finalPassword,
        email: finalEmail,
        role,
        jabatan: jabatan.trim() || defaultJabatans[role]
      });

      setSuccessToast(`Akun petugas baru "${nama}" berhasil dibuat!`);
    }

    setModalOpen(false);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Manajemen Pengguna & Akun Masuk (RBAC)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola nama petugas, hak akses peran, NIP, serta username dan kata sandi untuk login.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Salin atau unduh data akun untuk diselaraskan ke PC lain"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Bagikan Akun ke PC Lain</span>
          </button>

          <button
            onClick={() => {
              setImportModalOpen(true);
              setImportCode('');
              setImportError('');
            }}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Terapkan data akun yang disalin dari PC lain"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Terapkan di PC Ini</span>
          </button>

          <button
            onClick={() => triggerManualSync()}
            disabled={syncStatus === 'syncing'}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title={`Status server: ${isServerConnected ? 'Online (Terhubung)' : 'Offline'}. Terakhir sinkron: ${lastSyncTime || 'Baru saja'}`}
          >
            <span className={`w-2 h-2 rounded-full ${isServerConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span>{syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Sinkron Otomatis'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Petugas</span>
          </button>
        </div>
      </div>

      {/* Success Toast Banner */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button 
            onClick={() => setSuccessToast('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Role Guide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(Object.keys(roleDescriptions) as UserRole[]).map((r) => {
          const isUserCurrent = currentUser.role === r;
          const userCount = users.filter(u => u.role === r).length;
          return (
            <div
              key={r}
              className={`p-4 rounded-2xl border transition-all ${
                isUserCurrent ? 'bg-red-50/70 border-red-300 shadow-xs ring-1 ring-red-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{roleDescriptions[r].title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleDescriptions[r].badgeColor}`}>
                  {userCount} Akun
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                {roleDescriptions[r].desc}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setUserRole(r)}
                  className={`text-[11px] font-bold cursor-pointer transition-colors ${
                    isUserCurrent ? 'text-red-700' : 'text-slate-600 hover:text-red-700'
                  }`}
                >
                  {isUserCurrent ? '✓ Sedang Digunakan' : 'Uji Coba Peran Ini →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table with Username & Password */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Daftar Petugas, Username & Sandi Masuk
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Klik tombol pensil <span className="font-semibold text-slate-700">Edit</span> untuk mengubah nama, username, atau kata sandi petugas.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total: <span className="font-bold text-slate-800">{users.length}</span> Petugas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Nama Lengkap & NIP</th>
                <th className="py-3 px-4">Kredensial Masuk (Username & Sandi)</th>
                <th className="py-3 px-4">Role / Hak Akses</th>
                <th className="py-3 px-4">Jabatan Kedinasan</th>
                <th className="py-3 px-4">Email Kedinasan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrentActive = currentUser.id === u.id;
                return (
                  <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${isCurrentActive ? 'bg-red-50/30' : ''}`}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-slate-900 text-xs">{u.nama}</div>
                        {isCurrentActive && (
                          <span className="text-[9px] bg-red-700 text-white font-bold px-1.5 py-0.5 rounded-sm">
                            Anda
                          </span>
                        )}
                      </div>
                      {u.nip ? (
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">NIP: {u.nip}</div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic mt-0.5">Non-PNS / TKS</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="p-2 bg-slate-100/90 rounded-xl border border-slate-200 inline-block min-w-[170px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-500">Username:</span>
                          <span className="font-mono font-bold text-slate-900 text-[11px] bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                            {u.username || u.email.split('@')[0]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1 pt-1 border-t border-slate-200/60">
                          <span className="text-[10px] text-slate-500">Sandi:</span>
                          <span className="font-mono text-slate-700 text-[11px] bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                            {u.password || 'dinsos123'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 font-bold rounded-lg text-[10px] border ${
                        roleDescriptions[u.role]?.badgeColor || 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {u.jabatan}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {u.email}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-blue-700 hover:text-white hover:bg-blue-600 rounded-lg transition-colors cursor-pointer"
                          title={`Edit data & akun ${u.nama}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button (disabled for primary admin) */}
                        {u.id !== 'user-admin' && (
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus akun petugas "${u.nama}"?`)) {
                                deleteUser(u.id);
                                setSuccessToast(`Akun "${u.nama}" telah dihapus.`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah & Edit Pengguna */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 max-h-[92vh] overflow-y-auto text-left border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingUser ? 'Edit Data & Akun Petugas' : 'Tambah Akun Petugas Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingUser 
                    ? `Perbarui nama, jabatan, username login, atau kata sandi untuk ${editingUser.nama}`
                    : 'Buat akun petugas baru dengan username dan sandi khusus'}
                </p>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Nama Lengkap */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Lengkap & Gelar: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => {
                    setNama(e.target.value);
                    if (!editingUser && !username) {
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    }
                  }}
                  placeholder="Contoh: Drs. Chairul Anwar, M.Si"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600 text-xs font-semibold text-slate-900"
                />
              </div>

              {/* NIP */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  NIP (Nomor Induk Pegawai):
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Contoh: 19760315 200501 1 008 (Kosongkan jika non-PNS/TKS)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600 text-xs"
                />
              </div>

              {/* Box Kredensial: Username & Kata Sandi */}
              <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Kredensial Masuk Petugas (Login SIPMAS):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Username: <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="Contoh: chairul.penelaah"
                      className="w-full p-2 bg-white border border-amber-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Huruf kecil tanpa spasi</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Kata Sandi (Password): <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contoh: dinsos123"
                        className="w-full p-2 pr-9 bg-white border border-amber-300 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Digunakan saat login</span>
                  </div>
                </div>
              </div>

              {/* Peran / Hak Akses */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Peran / Hak Akses (RBAC):</label>
                <select
                  value={role}
                  onChange={(e) => {
                    const newRole = e.target.value as UserRole;
                    setRole(newRole);
                    if (!jabatan || Object.values(defaultJabatans).includes(jabatan)) {
                      setJabatan(defaultJabatans[newRole]);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600 text-xs"
                >
                  <option value="PETUGAS_PENERIMA">1. Petugas Penerima (Front Office & Kelengkapan Berkas)</option>
                  <option value="PETUGAS_PENELAAH">2. Petugas Penelaah (6 Aspek & 10 Klasifikasi Aduan)</option>
                  <option value="PETUGAS_PENYELESAIAN">3. Petugas Penyelesaian (Verifikasi Lapangan & Tindak Lanjut)</option>
                  <option value="PIMPINAN">4. Pimpinan (Kepala Dinas Sosial Kota Tanjungbalai)</option>
                  <option value="ADMIN">5. Administrator (Akses Penuh Seluruh Modul & Data)</option>
                </select>
                <p className="text-[11px] text-slate-600 mt-1.5 p-2 bg-slate-100 rounded-xl leading-relaxed">
                  💡 <span className="font-semibold text-slate-800">Tupoksi:</span> {roleDescriptions[role].desc}
                </p>
              </div>

              {/* Jabatan Kedinasan */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Jabatan Kedinasan:</label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: Petugas Front Office / Penerima Pengaduan"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600 text-xs text-slate-900"
                />
              </div>

              {/* Email Kedinasan */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Email Kedinasan <span className="text-slate-400 font-normal">(Opsional):</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`Contoh: ${username || 'petugas'}@tanjungbalaikota.go.id`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUser ? 'Simpan Perubahan' : 'Buat Akun Petugas'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 1: Bagikan Akun ke PC Lain */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">Bagikan / Salin Data Akun ke PC Lain</h3>
              </div>
              <button 
                onClick={() => setExportModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-blue-800">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Total {users.length} Akun Petugas Siap Diselaraskan
                </p>
                Gunakan fitur ini agar komputer lain langsung memiliki seluruh akun petugas persis seperti di komputer ini tanpa perlu mengetik ulang satu per satu.
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Langkah-Langkah Singkat:
                </label>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                  <li>Klik tombol <b>"Salin Kode Akun"</b> di bawah ini atau <b>"Unduh Berkas JSON"</b>.</li>
                  <li>Buka aplikasi di <b>PC Komputer 2</b>.</li>
                  <li>Di PC 2, klik tombol <b>"Terapkan di PC Ini"</b> lalu tempel kodenya. Selesai!</li>
                </ol>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyExportCode}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    copied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? '✓ Berhasil Disalin!' : 'Salin Kode Teks Akun'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadExportFile}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Unduh Berkas (.json)</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Terapkan Akun di PC Ini */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Download className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Terapkan Akun dari PC Lain</h3>
              </div>
              <button 
                onClick={() => setImportModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 leading-relaxed">
                Tempelkan kode akun yang disalin dari PC pertama, atau pilih berkas <code>.json</code> yang diunduh. Akun di komputer ini akan diselaraskan seketika.
              </div>

              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Tempel Kode Teks Akun di Sini:
                </label>
                <textarea
                  rows={4}
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="Tempelkan (Paste / Ctrl+V) data akun di sini..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[11px] text-slate-400 uppercase font-bold">atau unggah file</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleApplyImport}
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Terapkan Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
