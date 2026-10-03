import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, UserRole } from '../../types';
import { TanjungbalaiLogo } from '../common/OfficialKop';
import { AdminDashboard } from './AdminDashboard';
import { ComplaintList } from './ComplaintList';
import { ReviewClassificationForm } from './ReviewClassificationForm';
import { DistributionForm } from './DistributionForm';
import { ResolutionForm } from './ResolutionForm';
import { DigitalArchive } from './DigitalArchive';
import { ReportsSection } from './ReportsSection';
import { UserManagement } from './UserManagement';
import { SettingsSection } from './SettingsSection';
import { CreateComplaintForm } from '../public/CreateComplaintForm';
import { ComplaintDetailModal } from './ComplaintDetailModal';
import { 
  LayoutDashboard, 
  FileText, 
  Inbox, 
  FileSearch, 
  Tags, 
  Send, 
  Activity, 
  CheckCircle2, 
  MessageSquare, 
  BarChart3, 
  Archive, 
  Users, 
  Settings,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  UserCheck,
  RefreshCw,
  Cloud,
  Shield,
  Layers,
  Bell
} from 'lucide-react';
import { GoogleWorkspaceSyncModal } from '../common/GoogleWorkspaceSyncModal';

export const ROLE_CONFIG: Record<UserRole, {
  label: string;
  badgeBg: string;
  avatarBg: string;
  avatarText: string;
  tagline: string;
  allowedMenus: string[];
}> = {
  ADMIN: {
    label: 'Administrator Sistem',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    avatarBg: 'bg-red-700',
    avatarText: 'AD',
    tagline: 'Hak Akses Penuh: Konfigurasi, Database & Manajemen Pengguna',
    allowedMenus: ['dashboard', 'pengaduan', 'penerimaan', 'penelaahan', 'klasifikasi', 'penyaluran', 'tindak-lanjut', 'penyelesaian', 'konfirmasi', 'laporan', 'arsip', 'pengguna', 'pengaturan'],
  },
  PETUGAS_PENERIMA: {
    label: 'Petugas Pelayanan / Loket',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    avatarBg: 'bg-sky-600',
    avatarText: 'FO',
    tagline: 'Fokus: Loket Penerimaan, Pencatatan & Bukti Penerimaan (TBP)',
    allowedMenus: ['dashboard', 'penerimaan', 'pengaduan', 'klasifikasi', 'arsip', 'laporan'],
  },
  PETUGAS_PENELAAH: {
    label: 'Petugas Telaah & Analis',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    avatarBg: 'bg-purple-600',
    avatarText: 'TL',
    tagline: 'Fokus: Lembar Telaah (LPP), Pemilahan Kewenangan & SLA 3 Hari',
    allowedMenus: ['dashboard', 'penelaahan', 'klasifikasi', 'penyaluran', 'pengaduan', 'arsip', 'laporan'],
  },
  PETUGAS_PENYELESAIAN: {
    label: 'Tim Tindak Lanjut & Lapangan',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    avatarBg: 'bg-emerald-600',
    avatarText: 'TL',
    tagline: 'Fokus: Berita Acara, Dokumentasi Bukti & Konfirmasi Pengadu',
    allowedMenus: ['dashboard', 'tindak-lanjut', 'penyelesaian', 'konfirmasi', 'pengaduan', 'arsip'],
  },
  PIMPINAN: {
    label: 'Kepala Dinas / Pimpinan',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    avatarBg: 'bg-amber-600',
    avatarText: 'KD',
    tagline: 'Fokus: Ringkasan Eksekutif, Capaian SLA, Disposisi & Laporan',
    allowedMenus: ['dashboard', 'pengaduan', 'penyaluran', 'laporan', 'arsip', 'pengaturan'],
  },
  MASYARAKAT: {
    label: 'Masyarakat',
    badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    avatarBg: 'bg-slate-700',
    avatarText: 'WR',
    tagline: 'Portal Pengaduan Warga',
    allowedMenus: ['dashboard', 'pengaduan'],
  },
};

interface AdminLayoutProps {
  onOpenNotifications?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onOpenNotifications }) => {
  const { 
    adminActiveMenu, 
    setAdminActiveMenu, 
    currentUser, 
    setCurrentUser,
    users,
    complaints, 
    setViewMode,
    selectedComplaintId,
    setSelectedComplaintId,
    openLoginModal,
    notifications
  } = useApp();

  const [activeComplaintForAction, setActiveComplaintForAction] = useState<Complaint | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // 13 Official Sidebar Menus from Section 20
  const allSidebarMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pengaduan', label: 'Semua Pengaduan', icon: FileText, count: complaints.length },
    { id: 'penerimaan', label: 'Penerimaan', icon: Inbox },
    { id: 'penelaahan', label: 'Penelaahan', icon: FileSearch, count: complaints.filter(c => !c.telaah).length },
    { id: 'klasifikasi', label: 'Klasifikasi', icon: Tags },
    { id: 'penyaluran', label: 'Penyaluran', icon: Send, count: complaints.filter(c => c.status === 'Diteruskan').length },
    { id: 'tindak-lanjut', label: 'Tindak Lanjut', icon: Activity, count: complaints.filter(c => c.status === 'Sedang Diproses').length },
    { id: 'penyelesaian', label: 'Penyelesaian', icon: CheckCircle2 },
    { id: 'konfirmasi', label: 'Konfirmasi', icon: MessageSquare },
    { id: 'laporan', label: 'Laporan', icon: BarChart3 },
    { id: 'arsip', label: 'Arsip Digital', icon: Archive },
    { id: 'pengguna', label: 'Pengguna', icon: Users },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  // Filter menus dynamically based on current user role
  const roleConfig = ROLE_CONFIG[currentUser.role] || ROLE_CONFIG.ADMIN;
  const filteredSidebarMenuItems = allSidebarMenuItems.filter(item => 
    roleConfig.allowedMenus.includes(item.id)
  );

  // Handle Role Switch
  const handleSwitchUserRole = (targetRole: UserRole) => {
    const matchedUser = users.find(u => u.role === targetRole);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      const targetConfig = ROLE_CONFIG[targetRole];
      if (!targetConfig.allowedMenus.includes(adminActiveMenu)) {
        setAdminActiveMenu('dashboard');
      }
    }
  };

  // Helper to open specific action on a complaint
  const handleSelectComplaint = (c: Complaint) => {
    setSelectedComplaintId(c.id);
  };

  const handleOpenReview = (c: Complaint) => {
    setActiveComplaintForAction(c);
    setAdminActiveMenu('penelaahan');
  };

  const handleOpenDistribution = (c: Complaint) => {
    setActiveComplaintForAction(c);
    setAdminActiveMenu('penyaluran');
  };

  const handleOpenResolution = (c: Complaint) => {
    setActiveComplaintForAction(c);
    setAdminActiveMenu('penyelesaian');
  };

  // Target complaint for standalone forms
  const targetComplaint = activeComplaintForAction || complaints[0] || null;

  // Shared Sidebar Content Renderer
  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <TanjungbalaiLogo className="w-8 h-11 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-black text-sm text-white tracking-wide truncate">SIPMAS TANJUNGBALAI</h1>
            <p className="text-[10px] text-amber-400 font-semibold truncate">Dinas Sosial Kota</p>
          </div>
        </div>

        {/* Close Button on Mobile Drawer */}
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Current User Card in Sidebar with Role Badge */}
      <div className="p-3.5 mx-3 my-2 bg-slate-800/80 rounded-2xl border border-slate-700/60 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-full ${roleConfig.avatarBg} text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs`}>
              {roleConfig.avatarText}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.nama}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleConfig.badgeBg} truncate`}>
                  {roleConfig.label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className={`p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
              roleSwitcherOpen ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-400 hover:text-amber-400 hover:bg-slate-700/60'
            }`}
            title="Ganti Peran Petugas"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Role Switcher Drawer */}
        {roleSwitcherOpen && (
          <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-1.5 animate-in fade-in duration-150">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>Pilih Peran Petugas:</span>
            </p>
            <div className="grid grid-cols-1 gap-1">
              {(['PETUGAS_PENERIMA', 'PETUGAS_PENELAAH', 'PETUGAS_PENYELESAIAN', 'PIMPINAN', 'ADMIN'] as UserRole[]).map((roleKey) => {
                const cfg = ROLE_CONFIG[roleKey];
                const isCurrent = currentUser.role === roleKey;
                return (
                  <button
                    key={roleKey}
                    onClick={() => {
                      handleSwitchUserRole(roleKey);
                      setRoleSwitcherOpen(false);
                      if (isMobile) setMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-amber-400' : 'bg-slate-500'}`} />
                      <span className="truncate">{cfg.label}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {cfg.avatarText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menus (Filtered per role) */}
      <div className="px-3 pt-2 pb-1 shrink-0">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
          <span>Menu {roleConfig.label.split('/')[0]}</span>
          <span>{filteredSidebarMenuItems.length} Menu</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        {filteredSidebarMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = adminActiveMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setAdminActiveMenu(item.id);
                if (isMobile) setMobileSidebarOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                isActive
                  ? 'bg-red-700 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white text-red-700' : 'bg-slate-800 text-slate-300'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Link to Public Portal & Switch User */}
      <div className="p-3 border-t border-slate-800 space-y-1 shrink-0">
        <button
          onClick={() => {
            setWorkspaceModalOpen(true);
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className="w-full py-2 px-3 text-xs font-semibold text-emerald-300 hover:text-white hover:bg-slate-800 rounded-xl flex items-center justify-between transition-colors cursor-pointer border border-emerald-500/20 bg-emerald-950/20 mb-1"
        >
          <div className="flex items-center gap-2">
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Drive & Sheets</span>
          </div>
          <span className="text-[9px] bg-emerald-600/80 text-white px-1.5 py-0.2 rounded-full font-bold">Cloud</span>
        </button>

        <button
          onClick={() => {
            openLoginModal();
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className="w-full py-2 px-3 text-xs font-semibold text-amber-300 hover:text-white hover:bg-slate-800 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Ganti Akun Petugas</span>
          </div>
          <RefreshCw className="w-3 h-3 text-amber-400/80" />
        </button>

        <button
          onClick={() => {
            setViewMode('public');
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className="w-full py-2 px-3 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Kembali ke Publik</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-row">
      {/* 1. DESKTOP SIDEBAR (Static in flex-row, NEVER fixed, NEVER overlaps!) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-slate-900 text-slate-300 min-h-screen border-r border-slate-800 no-print sticky top-0 h-screen">
        {renderSidebarContent(false)}
      </aside>

      {/* 2. MOBILE DRAWER (Only rendered when mobileSidebarOpen is true) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden no-print">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-50 animate-in slide-in-from-left duration-200 overflow-y-auto">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-slate-100">
        
        {/* Crisp Top Navigation Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs no-print">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Mobile Logo / Page Title */}
            <div className="flex items-center gap-2 min-w-0">
              <TanjungbalaiLogo className="w-6 h-8 shrink-0 md:hidden" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                  SIPMAS DINSOS TANJUNGBALAI
                </span>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 capitalize truncate">
                  {allSidebarMenuItems.find(m => m.id === adminActiveMenu)?.label || 'Dashboard'}
                </h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Role Badge in Header */}
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${roleConfig.badgeBg} hidden sm:inline-flex items-center gap-1.5`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{roleConfig.label}</span>
            </span>

            {/* Quick Switch Role */}
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="p-2 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer hidden sm:flex items-center gap-1 text-xs font-semibold"
              title="Ganti Peran Petugas"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Notifikasi Sistem"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Button Back to Public Portal */}
            <button
              onClick={() => setViewMode('public')}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Buka Tampilan Halaman Publik"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Halaman Publik</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Render Active View */}
          {adminActiveMenu === 'dashboard' && (
            <AdminDashboard
              onSelectComplaint={handleSelectComplaint}
              onNavigateMenu={(menu) => setAdminActiveMenu(menu)}
            />
          )}

          {(adminActiveMenu === 'pengaduan' || adminActiveMenu === 'klasifikasi' || adminActiveMenu === 'tindak-lanjut') && (
            <ComplaintList
              onSelectComplaint={handleSelectComplaint}
              onOpenReview={handleOpenReview}
              onOpenDistribution={handleOpenDistribution}
              onOpenResolution={handleOpenResolution}
              onAddNew={() => setAdminActiveMenu('penerimaan')}
            />
          )}

          {adminActiveMenu === 'penerimaan' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Penerimaan Pengaduan Baru (Loket Petugas)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Input pengaduan resmi masyarakat oleh petugas loket Dinas Sosial Kota Tanjungbalai.
                  </p>
                </div>
                <button
                  onClick={() => setAdminActiveMenu('pengaduan')}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Kembali ke Daftar
                </button>
              </div>

              <CreateComplaintForm
                onSuccessTrack={() => setAdminActiveMenu('pengaduan')}
              />
            </div>
          )}

          {adminActiveMenu === 'penelaahan' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Formulir Penelaahan Pengaduan
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Analisis aspek hukum, pemilahan kewenangan, klasifikasi 10 masalah, dan draft rekomendasi.
                  </p>
                </div>
                <button
                  onClick={() => setAdminActiveMenu('pengaduan')}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Kembali ke Daftar
                </button>
              </div>

              <ReviewClassificationForm
                complaint={targetComplaint}
                onSuccess={() => setAdminActiveMenu('pengaduan')}
              />
            </div>
          )}

          {adminActiveMenu === 'penyaluran' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Penyaluran Pengaduan (Luar Kewenangan Dinsos)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Surat penyaluran resmi ke OPD lain, Pemerintah Provinsi, atau Kementerian Sosial RI.
                  </p>
                </div>
                <button
                  onClick={() => setAdminActiveMenu('pengaduan')}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Kembali ke Daftar
                </button>
              </div>

              <DistributionForm
                complaint={targetComplaint}
                onSuccess={() => setAdminActiveMenu('pengaduan')}
              />
            </div>
          )}

          {(adminActiveMenu === 'penyelesaian' || adminActiveMenu === 'konfirmasi') && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Penyelesaian & Konfirmasi Hasil Pengaduan
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pencatatan tindakan tindak lanjut, berita acara penyelesaian, dan konfirmasi pengadu.
                  </p>
                </div>
                <button
                  onClick={() => setAdminActiveMenu('pengaduan')}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Kembali ke Daftar
                </button>
              </div>
              <ResolutionForm
                complaint={targetComplaint}
                onSuccess={() => setAdminActiveMenu('pengaduan')}
              />
            </div>
          )}

          {adminActiveMenu === 'arsip' && (
            <DigitalArchive onSelectComplaint={handleSelectComplaint} />
          )}

          {adminActiveMenu === 'laporan' && (
            <ReportsSection />
          )}

          {adminActiveMenu === 'pengguna' && (
            <UserManagement />
          )}

          {adminActiveMenu === 'pengaturan' && (
            <SettingsSection />
          )}
        </main>
      </div>

      {/* Comprehensive Complaint Detail Modal (Section 24) */}
      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
        onOpenReview={handleOpenReview}
        onOpenDistribution={handleOpenDistribution}
        onOpenResolution={handleOpenResolution}
      />

      {/* Google Workspace Cloud Sync Modal */}
      <GoogleWorkspaceSyncModal
        isOpen={workspaceModalOpen}
        onClose={() => setWorkspaceModalOpen(false)}
      />
    </div>
  );
};
