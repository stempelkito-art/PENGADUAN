import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { TanjungbalaiLogo } from './OfficialKop';
import { 
  X, 
  LogIn, 
  Lock, 
  User as UserIcon, 
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

interface LoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { 
    users, 
    setCurrentUser, 
    setIsOfficerLoggedIn,
    setViewMode, 
    setAdminActiveMenu,
    isLoginModalOpen,
    closeLoginModal
  } = useApp();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isLoginModalOpen;
  const handleClose = propOnClose || closeLoginModal;

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear fields whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setUsernameInput('');
      setPasswordInput('');
      setErrorMessage('');
      setShowPassword(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const inputClean = usernameInput.trim().toLowerCase();
    const passClean = passwordInput.trim();

    if (!inputClean || !passClean) {
      setIsSubmitting(false);
      setErrorMessage('Username/NIP dan Kata Sandi wajib diisi.');
      return;
    }

    // Match only official staff (exclude public MASYARAKAT)
    const targetUser = users.find(u => 
      u.role !== 'MASYARAKAT' && (
        (u.username && u.username.toLowerCase() === inputClean) ||
        (u.email && u.email.toLowerCase() === inputClean) ||
        (u.nip && u.nip.replace(/\s+/g, '') === inputClean.replace(/\s+/g, '')) ||
        (u.nama && u.nama.toLowerCase() === inputClean) ||
        (inputClean === 'admin' && u.role === 'ADMIN')
      )
    );

    // Accept both configured password and standard default passwords (admin123 / dinsos123)
    const validPassword = targetUser?.password || 'dinsos123';
    const isPasswordValid = targetUser && (
      passClean === validPassword || 
      passClean === 'admin123' || 
      passClean === 'dinsos123'
    );

    if (!targetUser || !isPasswordValid) {
      setIsSubmitting(false);
      setErrorMessage('Kredensial tidak valid. Kata sandi akun admin adalah admin123 (atau gunakan opsi bantuan login di bawah).');
      return;
    }

    setTimeout(() => {
      setCurrentUser(targetUser);
      setIsOfficerLoggedIn(true);
      setViewMode('admin');
      setAdminActiveMenu('dashboard');
      setIsSubmitting(false);
      handleClose();
    }, 200);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto no-print">
      {/* Full screen backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 text-left animate-in fade-in zoom-in-95 duration-150">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-red-900 via-red-800 to-amber-700 text-white p-6 text-center relative">
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-2">
              <TanjungbalaiLogo className="w-12 h-16 drop-shadow-md" />
            </div>

            <h3 className="font-bold text-lg font-sans">Masuk Portal Petugas SIPMAS</h3>
            <p className="text-xs text-amber-100 mt-1">
              Dinas Sosial Pemerintah Kota Tanjungbalai
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 sm:p-7 space-y-4">
            {/* Notice banner */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <p className="leading-snug">
                Portal ini hanya dapat diakses oleh petugas resmi yang memiliki akun terdaftar.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            {/* Form Fields: Username & Password ONLY (No profiles visible) */}
            <div className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Username / NIP / Email Kedinasan:
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Contoh: admin, penerima, penelaah, kadis..."
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Kata Sandi (Password):
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Masukkan kata sandi akun"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-red-700 hover:bg-red-800 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk ke Dashboard Petugas'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Access Account Selector */}
            <div className="pt-2.5 border-t border-slate-200">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                <span className="font-bold text-slate-700">Opsi Cepat Masuk (Bantuan Login):</span>
                <span className="text-[10px] text-slate-400">Klik untuk langsung isi</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setUsernameInput('admin');
                    setPasswordInput('admin123');
                    setErrorMessage('');
                  }}
                  className="p-2 text-left bg-slate-50 hover:bg-red-50 hover:border-red-300 border border-slate-200 rounded-xl transition-colors cursor-pointer group"
                >
                  <span className="font-bold block text-slate-800 group-hover:text-red-700">Administrator</span>
                  <span className="text-[10px] text-slate-500 font-mono">admin / admin123</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUsernameInput('penerima');
                    setPasswordInput('dinsos123');
                    setErrorMessage('');
                  }}
                  className="p-2 text-left bg-slate-50 hover:bg-red-50 hover:border-red-300 border border-slate-200 rounded-xl transition-colors cursor-pointer group"
                >
                  <span className="font-bold block text-slate-800 group-hover:text-red-700">Petugas Penerima</span>
                  <span className="text-[10px] text-slate-500 font-mono">penerima / dinsos123</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUsernameInput('penelaah');
                    setPasswordInput('dinsos123');
                    setErrorMessage('');
                  }}
                  className="p-2 text-left bg-slate-50 hover:bg-red-50 hover:border-red-300 border border-slate-200 rounded-xl transition-colors cursor-pointer group"
                >
                  <span className="font-bold block text-slate-800 group-hover:text-red-700">Petugas Penelaah</span>
                  <span className="text-[10px] text-slate-500 font-mono">penelaah / dinsos123</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUsernameInput('kadis');
                    setPasswordInput('dinsos123');
                    setErrorMessage('');
                  }}
                  className="p-2 text-left bg-slate-50 hover:bg-red-50 hover:border-red-300 border border-slate-200 rounded-xl transition-colors cursor-pointer group"
                >
                  <span className="font-bold block text-slate-800 group-hover:text-red-700">Kepala Dinas</span>
                  <span className="text-[10px] text-slate-500 font-mono">kadis / dinsos123</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
