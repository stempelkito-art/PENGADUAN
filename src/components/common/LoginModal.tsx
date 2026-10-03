import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { TanjungbalaiLogo } from './OfficialKop';
import { User } from '../../types';
import { 
  X, 
  LogIn, 
  Lock, 
  User as UserIcon, 
  Check, 
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound
} from 'lucide-react';

interface LoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { 
    users, 
    currentUser, 
    setCurrentUser, 
    setViewMode, 
    setAdminActiveMenu,
    isLoginModalOpen,
    closeLoginModal
  } = useApp();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isLoginModalOpen;
  const handleClose = propOnClose || closeLoginModal;

  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id || (users[0]?.id ?? ''));
  const [usernameInput, setUsernameInput] = useState(currentUser.username || currentUser.email.split('@')[0] || 'admin');
  const [passwordInput, setPasswordInput] = useState(currentUser.password || 'dinsos123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync inputs when currentUser changes or modal opens
  useEffect(() => {
    if (currentUser?.id) {
      setSelectedUserId(currentUser.id);
      setUsernameInput(currentUser.username || currentUser.email.split('@')[0] || 'admin');
      setPasswordInput(currentUser.password || 'dinsos123');
      setErrorMessage('');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSelectQuickAccount = (user: User) => {
    setSelectedUserId(user.id);
    setUsernameInput(user.username || user.email.split('@')[0] || '');
    setPasswordInput(user.password || 'dinsos123');
    setErrorMessage('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const inputClean = usernameInput.trim().toLowerCase();
    const passClean = passwordInput.trim();

    // Find user by username, email, NIP, or selected card
    const targetUser = users.find(u => 
      (u.username && u.username.toLowerCase() === inputClean) ||
      u.email.toLowerCase() === inputClean ||
      (u.nip && u.nip.replace(/\s+/g, '') === inputClean.replace(/\s+/g, '')) ||
      (u.id === selectedUserId && (inputClean === (u.username || '').toLowerCase() || inputClean === u.email.toLowerCase()))
    ) || (selectedUserId ? users.find(u => u.id === selectedUserId) : null);

    if (!targetUser) {
      setIsSubmitting(false);
      setErrorMessage(`Username atau Email "${usernameInput}" tidak ditemukan dalam daftar petugas.`);
      return;
    }

    // Verify password (allowing user password, or fallback defaults)
    const validPassword = targetUser.password || 'dinsos123';
    if (passClean !== validPassword && passClean !== 'admin123' && passClean !== 'dinsos123') {
      setIsSubmitting(false);
      setErrorMessage('Kata sandi yang Anda masukkan salah. Silakan periksa kembali atau pilih profil petugas di atas.');
      return;
    }

    setTimeout(() => {
      setCurrentUser(targetUser);
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
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 text-left animate-in fade-in zoom-in-95 duration-150">
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

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            {/* Quick 1-Click Officer Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pilih Profil Petugas (1-Klik):
                </label>
                <span className="text-[10px] text-slate-400">Klik untuk autofill username</span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {users.filter(u => u.role !== 'MASYARAKAT').map((u) => {
                  const isSelected = selectedUserId === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectQuickAccount(u)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'bg-red-50 border-red-400 ring-2 ring-red-200 shadow-xs' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {u.role === 'PIMPINAN' ? 'KD' : u.role.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">{u.nama}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-red-700">{u.role.replace('_', ' ')}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-600 bg-white px-1.5 py-0.2 rounded-xs border border-slate-200">
                              user: {u.username || u.email.split('@')[0]}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Input Kredensial (Username & Password) */}
            <div className="pt-3 border-t border-slate-100 text-xs space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Username / Email Kedinasan:
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Masukkan username atau email"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Kata Sandi (Password):
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
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
                className="w-full py-3 bg-red-700 hover:bg-red-800 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Memproses Masuk...' : 'Masuk ke Dashboard Petugas'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
