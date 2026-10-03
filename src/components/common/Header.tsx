import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TanjungbalaiLogo } from './OfficialKop';
import { UserRole } from '../../types';
import { 
  Bell, 
  Shield, 
  UserCircle, 
  ChevronDown, 
  Check, 
  ExternalLink, 
  FileText, 
  LayoutDashboard,
  Menu,
  X,
  LogIn
} from 'lucide-react';

interface HeaderProps {
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const { 
    currentUser, 
    setUserRole, 
    viewMode, 
    setViewMode,
    publicActiveTab,
    setPublicActiveTab,
    notifications,
    openLoginModal
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const publicMenuItems = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'buat-pengaduan', label: 'Buat Pengaduan', highlight: true },
    { id: 'lacak-pengaduan', label: 'Lacak Pengaduan' },
    { id: 'informasi', label: 'Informasi Layanan' },
    { id: 'faq', label: 'FAQ' },
    { id: 'kontak', label: 'Kontak Dinsos' },
  ];

  const roleOptions: { role: UserRole; label: string; desc: string }[] = [
    { role: 'ADMIN', label: 'Administrator Sistem', desc: 'Akses penuh seluruh modul & setting' },
    { role: 'PETUGAS_PENERIMA', label: 'Petugas Penerima', desc: 'Loket penerimaan & verifikasi berkas' },
    { role: 'PETUGAS_PENELAAH', label: 'Petugas Penelaah', desc: 'Penelaahan, klasifikasi & kewenangan' },
    { role: 'PETUGAS_PENYELESAIAN', label: 'Petugas Penyelesaian', desc: 'Tindak lanjut lapangan & bukti' },
    { role: 'PIMPINAN', label: 'Kepala Dinas (Pimpinan)', desc: 'Monitoring pimpinan & aduan mendesak' },
    { role: 'MASYARAKAT', label: 'Masyarakat Umum', desc: 'Tampilan pemohon pengaduan' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-amber-700 text-white text-[11px] sm:text-xs py-1 px-4 sm:px-8 flex justify-between items-center tracking-wide">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Portal Pelayanan Resmi Dinas Sosial Kota Tanjungbalai, Sumatera Utara</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-amber-100">
          <span>Telepon Layanan: (0623) 92086</span>
          <span>•</span>
          <span>WhatsApp Aduan: 0812-6345-8921</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Branding */}
          <button 
            onClick={() => {
              if (viewMode === 'admin') {
                setViewMode('admin');
              } else {
                setPublicActiveTab('beranda');
              }
            }}
            className="flex items-center gap-2 sm:gap-3 text-left focus:outline-hidden group min-w-0 mr-2"
          >
            <TanjungbalaiLogo className="w-8 h-10 sm:w-10 sm:h-13 shrink-0 group-hover:scale-105 transition-transform" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">SIPMAS</span>
                <span className="text-[9px] sm:text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-wider shrink-0">
                  DINSOS
                </span>
              </div>
              <p className="hidden sm:block text-xs font-semibold text-slate-700 leading-tight truncate">
                Sistem Informasi Pengaduan Masyarakat
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight truncate">
                Dinas Sosial Kota Tanjungbalai
              </p>
            </div>
          </button>

          {/* Public Desktop Navigation */}
          {viewMode === 'public' && (
            <nav className="hidden lg:flex items-center gap-1">
              {publicMenuItems.map(item => {
                const isActive = publicActiveTab === item.id;
                if (item.highlight) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPublicActiveTab(item.id)}
                      className="ml-2 px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  );
                }
                return (
                  <button
                    key={item.id}
                    onClick={() => setPublicActiveTab(item.id)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isActive 
                        ? 'text-red-700 bg-red-50' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* View Mode Toggle Button */}
            {viewMode === 'public' ? (
              <button
                onClick={openLoginModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs cursor-pointer"
                title="Buka Portal Dashboard Petugas / Pimpinan"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Masuk Petugas</span>
              </button>
            ) : (
              <button
                onClick={() => setViewMode('public')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                title="Lihat Tampilan Portal Publik"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Halaman Publik</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-hidden cursor-pointer shrink-0"
              title="Notifikasi Sistem"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors focus:outline-hidden cursor-pointer"
                title="Klik untuk mengganti akun / peran petugas"
              >
                <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs border border-red-200 shrink-0">
                  {currentUser.role === 'PIMPINAN' ? 'KD' : currentUser.role.substring(0, 2)}
                </div>
                <div className="hidden md:block">
                  <div className="text-[11px] font-bold text-slate-900 leading-none truncate max-w-[120px]">
                    {currentUser.nama.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {roleMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setRoleMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Ganti Akun / Peran Petugas
                      </p>
                      <p className="text-xs font-semibold text-slate-700">
                        Pilih peran untuk menguji alur kerja:
                      </p>
                    </div>

                    <div className="py-1 max-h-72 overflow-y-auto">
                      {roleOptions.map((opt) => {
                        const isCurrent = currentUser.role === opt.role;
                        return (
                          <button
                            key={opt.role}
                            onClick={() => {
                              setUserRole(opt.role);
                              setRoleMenuOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left flex items-start justify-between text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                              isCurrent ? 'bg-red-50/70 font-semibold text-red-700' : 'text-slate-700'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate">{opt.label}</span>
                                {isCurrent && (
                                  <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded-sm shrink-0">Aktif</span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5 line-clamp-2">
                                {opt.desc}
                              </p>
                            </div>
                            {isCurrent && <Check className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-2 border-t border-slate-100 bg-slate-50/60">
                      <button
                        onClick={() => {
                          setRoleMenuOpen(false);
                          openLoginModal();
                        }}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5 text-amber-400" />
                        <span>Buka Dialog Masuk Petugas...</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            {viewMode === 'public' && (
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {viewMode === 'public' && mobileNavOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 flex flex-col gap-1">
            {publicMenuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setPublicActiveTab(item.id);
                  setMobileNavOpen(false);
                }}
                className={`px-3 py-2 text-left text-xs font-semibold rounded-lg ${
                  publicActiveTab === item.id 
                    ? 'text-red-700 bg-red-50' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  openLoginModal();
                }}
                className="w-full py-2.5 text-xs font-bold text-center bg-slate-900 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Masuk Akun Petugas</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

