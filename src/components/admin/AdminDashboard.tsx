import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint } from '../../types';
import { StatusBadge, PriorityBadge, KewenanganBadge } from '../common/StatusBadge';
import { SlaIndicator } from '../common/SlaIndicator';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Send, 
  AlertTriangle, 
  Users, 
  FileQuestion, 
  XCircle, 
  Flame, 
  ShieldAlert,
  ArrowRight,
  BarChart3,
  PieChart,
  Calendar,
  Inbox,
  FileSearch,
  Activity,
  ShieldCheck,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectComplaint: (c: Complaint) => void;
  onNavigateMenu: (menu: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onSelectComplaint,
  onNavigateMenu
}) => {
  const { complaints, currentUser } = useApp();

  // Statistics
  const total = complaints.length;
  const baru = complaints.filter(c => c.status === 'Baru').length;
  const dalamPenelaahan = complaints.filter(c => c.status === 'Dalam Penelaahan').length;
  const sedangDiproses = complaints.filter(c => c.status === 'Sedang Diproses').length;
  const menungguData = complaints.filter(c => c.status === 'Menunggu Data').length;
  const menungguKoordinasi = complaints.filter(c => c.status === 'Menunggu Koordinasi').length;
  const diteruskan = complaints.filter(c => c.status === 'Diteruskan').length;
  const selesai = complaints.filter(c => c.status.startsWith('Selesai')).length;
  const tidakDapat = complaints.filter(c => c.status === 'Tidak Dapat Ditindaklanjuti').length;

  // Urgent & Overdue Alert for Pimpinan & Admin
  const mendesakList = complaints.filter(c => c.prioritas === 'Mendesak' && !c.status.startsWith('Selesai'));
  
  // Overdue calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueList = complaints.filter(c => {
    if (c.status.startsWith('Selesai') || c.status === 'Tidak Dapat Ditindaklanjuti') return false;
    const deadline = new Date(c.slaDeadline);
    deadline.setHours(0, 0, 0, 0);
    return deadline < today;
  });

  // Classification breakdown
  const classificationCounts: Record<string, number> = {};
  complaints.forEach(c => {
    if (c.telaah?.klasifikasiList) {
      c.telaah.klasifikasiList.forEach(k => {
        if (k.ya) {
          classificationCounts[k.klasifikasi] = (classificationCounts[k.klasifikasi] || 0) + 1;
        }
      });
    } else {
      classificationCounts['Belum Ditelaah'] = (classificationCounts['Belum Ditelaah'] || 0) + 1;
    }
  });

  // Authority breakdown
  const authorityCounts: Record<string, number> = {};
  complaints.forEach(c => {
    authorityCounts[c.kewenangan] = (authorityCounts[c.kewenangan] || 0) + 1;
  });

  // Role Theme Configuration
  const roleThemeConfigs: Record<string, {
    bgGradient: string;
    badgeStyle: string;
    badgeLabel: string;
    roleTitle: string;
    roleDescription: string;
    quickButtons: Array<{ label: string; action: () => void; isPrimary?: boolean }>;
  }> = {
    PETUGAS_PENERIMA: {
      bgGradient: 'from-sky-950 via-sky-900 to-slate-900',
      badgeStyle: 'bg-sky-500/20 text-sky-200 border border-sky-400/30',
      badgeLabel: 'Meja Pelayanan & Loket Penerimaan',
      roleTitle: 'Petugas Front Office / Loket',
      roleDescription: 'Pencatatan data pengadu, verifikasi kelengkapan berkas KTP/KK, dan penerbitan Tanda Bukti Penerimaan (TBP).',
      quickButtons: [
        { label: '+ Catat Pengaduan Baru', action: () => onNavigateMenu('penerimaan'), isPrimary: true },
        { label: 'Lihat Semua Aduan Masuk', action: () => onNavigateMenu('pengaduan') },
        { label: 'Buka Arsip Tanda Terima', action: () => onNavigateMenu('arsip') },
      ],
    },
    PETUGAS_PENELAAH: {
      bgGradient: 'from-purple-950 via-purple-900 to-slate-900',
      badgeStyle: 'bg-purple-500/20 text-purple-200 border border-purple-400/30',
      badgeLabel: 'Meja Penelaahan & Analisis Masalah',
      roleTitle: 'Petugas Tim Telaah & Analis Kebijakan',
      roleDescription: 'Penetapan kewenangan Dinsos, 10 klasifikasi permasalahan sosial, prioritas penanganan, dan penyusunan Lembar Telaah (LPP).',
      quickButtons: [
        { label: 'Mulai Lembar Telaah (LPP)', action: () => onNavigateMenu('penelaahan'), isPrimary: true },
        { label: 'Penyaluran ke OPD Lain', action: () => onNavigateMenu('penyaluran') },
        { label: 'Tabel 10 Klasifikasi', action: () => onNavigateMenu('klasifikasi') },
      ],
    },
    PETUGAS_PENYELESAIAN: {
      bgGradient: 'from-emerald-950 via-emerald-900 to-slate-900',
      badgeStyle: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
      badgeLabel: 'Seksi Penanganan Lapangan & Rehabilitasi Sosial',
      roleTitle: 'Tim Tindak Lanjut & Penanganan Kasus',
      roleDescription: 'Penjangkauan kasus di lapangan, penyusunan Berita Acara Penyelesaian, unggah bukti foto/dokumen, dan konfirmasi pengadu.',
      quickButtons: [
        { label: 'Tangani Kasus Aktif', action: () => onNavigateMenu('tindak-lanjut'), isPrimary: true },
        { label: 'Input Berita Acara Selesai', action: () => onNavigateMenu('penyelesaian') },
        { label: 'Konfirmasi Tanggapan Warga', action: () => onNavigateMenu('konfirmasi') },
      ],
    },
    PIMPINAN: {
      bgGradient: 'from-amber-950 via-stone-900 to-slate-900',
      badgeStyle: 'bg-amber-500/20 text-amber-200 border border-amber-400/30',
      badgeLabel: 'Executive Command Center - Kepala Dinas Sosial',
      roleTitle: 'Kepala Dinas Sosial Kota Tanjungbalai',
      roleDescription: 'Pemantauan capaian SLA, evaluasi tingkat ketuntasan pengaduan, persetujuan surat penyaluran, dan pelaporan Ombudsman/Kemensos.',
      quickButtons: [
        { label: '10 Format Laporan Resmi', action: () => onNavigateMenu('laporan'), isPrimary: true },
        { label: 'Pantau Surat Penyaluran', action: () => onNavigateMenu('penyaluran') },
        { label: 'Arsip Berkas Digital', action: () => onNavigateMenu('arsip') },
      ],
    },
    ADMIN: {
      bgGradient: 'from-red-950 via-red-900 to-slate-900',
      badgeStyle: 'bg-red-500/20 text-red-200 border border-red-400/30',
      badgeLabel: 'Panel Pengendalian Terpadu (SIPMAS)',
      roleTitle: 'Administrator Sistem & Pengendali Data',
      roleDescription: 'Hak akses master atas seluruh tahapan pengaduan, otorisasi staf, konfigurasi SLA, serta pencadangan database & cloud.',
      quickButtons: [
        { label: '+ Penerimaan Pengaduan', action: () => onNavigateMenu('penerimaan'), isPrimary: true },
        { label: 'Manajemen Pengguna', action: () => onNavigateMenu('pengguna') },
        { label: 'Pengaturan Sistem', action: () => onNavigateMenu('pengaturan') },
      ],
    },
  };

  const currentTheme = roleThemeConfigs[currentUser.role] || roleThemeConfigs.ADMIN;

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner Greeting - Role Tailored */}
      <div className={`bg-gradient-to-r ${currentTheme.bgGradient} text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10`}>
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${currentTheme.badgeStyle}`}>
              {currentTheme.badgeLabel}
            </span>
            <span className="text-[10px] text-slate-300 font-mono">
              SIPMAS Dinsos Tanjungbalai
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold text-white">
            Selamat Bertugas, {currentUser.nama}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {currentTheme.roleDescription}
          </p>

          <p className="text-[11px] text-amber-300/90 font-medium pt-1">
            NIP: {currentUser.nip || '-'} • Jabatan: {currentUser.jabatan}
          </p>
        </div>

        {/* Role-Specific Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full sm:w-auto">
          {currentTheme.quickButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.action}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 ${
                btn.isPrimary
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
            >
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Warning Box for Urgent & Overdue (Pimpinan Priority) */}
      {(mendesakList.length > 0 || overdueList.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Urgent Cases Alert */}
          {mendesakList.length > 0 && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <Flame className="w-5 h-5 text-rose-600 animate-pulse" />
                  <span>Pengaduan Mendesak Butuh Tindakan Segera ({mendesakList.length})</span>
                </div>
                <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                  Prioritas Tinggi
                </span>
              </div>
              <div className="space-y-2">
                {mendesakList.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onSelectComplaint(c)}
                    className="p-3 bg-white rounded-xl border border-rose-200 hover:border-rose-400 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-xs text-rose-700">{c.nomorPengaduan}</span>
                      <p className="font-semibold text-xs text-slate-900 line-clamp-1">{c.pokokPengaduan}</p>
                      <p className="text-[10px] text-slate-500">{c.namaPengadu} • Telp: {c.nomorTelepon}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-rose-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overdue Alert */}
          {overdueList.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <span>Pengaduan Melewati Target Waktu / SLA ({overdueList.length})</span>
                </div>
                <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">
                  Perhatian Pimpinan
                </span>
              </div>
              <div className="space-y-2">
                {overdueList.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onSelectComplaint(c)}
                    className="p-3 bg-white rounded-xl border border-amber-200 hover:border-amber-400 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-xs text-amber-800">{c.nomorPengaduan}</span>
                      <p className="font-semibold text-xs text-slate-900 line-clamp-1">{c.pokokPengaduan}</p>
                      <p className="text-[10px] text-rose-600 font-bold">Target Deadline: {c.slaDeadline}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROLE-SPECIFIC WORKSPACE FOCUS PANEL */}
      {currentUser.role === 'PETUGAS_PENERIMA' && (
        <div className="bg-sky-50/70 border-2 border-sky-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-200 pb-3">
            <div className="flex items-center gap-2 text-sky-950 font-bold text-sm">
              <Inbox className="w-5 h-5 text-sky-700" />
              <span>Fokus Meja Penerimaan: Pengaduan Baru Belum Diverifikasi ({baru})</span>
            </div>
            <button
              onClick={() => onNavigateMenu('penerimaan')}
              className="text-xs text-sky-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>+ Buka Formulir Loket Penerimaan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {complaints.filter(c => c.status === 'Baru').length === 0 ? (
            <p className="text-xs text-slate-500 py-2">Semua aduan di loket telah diverifikasi. Tidak ada antrean baru.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {complaints.filter(c => c.status === 'Baru').map(c => (
                <div key={c.id} className="p-3.5 bg-white rounded-2xl border border-sky-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-sky-800">{c.nomorPengaduan}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {c.mediaPengaduan}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{c.pokokPengaduan}</p>
                  <p className="text-[11px] text-slate-500">Pengadu: {c.namaPengadu} • NIK: {c.nik ? `${c.nik.substring(0, 6)}...` : '-'}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{c.tanggalPenerimaan}</span>
                    <button
                      onClick={() => onSelectComplaint(c)}
                      className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                    >
                      Verifikasi & Cetak TBP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentUser.role === 'PETUGAS_PENELAAH' && (
        <div className="bg-purple-50/70 border-2 border-purple-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200 pb-3">
            <div className="flex items-center gap-2 text-purple-950 font-bold text-sm">
              <FileSearch className="w-5 h-5 text-purple-700" />
              <span>Fokus Tim Telaah: Pengaduan Menunggu Penelaahan (Target 3 Hari Kerja)</span>
            </div>
            <button
              onClick={() => onNavigateMenu('penelaahan')}
              className="text-xs text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Formulir Lembar Telaah (LPP)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {complaints.filter(c => !c.telaah || c.status === 'Dalam Penelaahan').slice(0, 3).map(c => (
              <div key={c.id} className="p-3.5 bg-white rounded-2xl border border-purple-100 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-purple-800">{c.nomorPengaduan}</span>
                  <PriorityBadge prioritas={c.prioritas} />
                </div>
                <p className="text-xs font-bold text-slate-900 line-clamp-1">{c.pokokPengaduan}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2">{c.uraianKronologi}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-700">SLA: {c.slaDeadline}</span>
                  <button
                    onClick={() => {
                      onSelectComplaint(c);
                      onNavigateMenu('penelaahan');
                    }}
                    className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                  >
                    Mulai Telaah (LPP)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentUser.role === 'PETUGAS_PENYELESAIAN' && (
        <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <Activity className="w-5 h-5 text-emerald-700" />
              <span>Fokus Tim Lapangan: Kasus Sedang Ditangani ({sedangDiproses})</span>
            </div>
            <button
              onClick={() => onNavigateMenu('tindak-lanjut')}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua Kasus Aktif</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {complaints.filter(c => c.status === 'Sedang Diproses').slice(0, 3).map(c => (
              <div key={c.id} className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-emerald-800">{c.nomorPengaduan}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs font-bold text-slate-900 line-clamp-1">{c.pokokPengaduan}</p>
                <p className="text-[11px] text-slate-600">Alamat: {c.alamat || '-'}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500">SLA: {c.slaDeadline}</span>
                  <button
                    onClick={() => {
                      onSelectComplaint(c);
                      onNavigateMenu('penyelesaian');
                    }}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                  >
                    Input Berita Acara
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentUser.role === 'PIMPINAN' && (
        <div className="bg-amber-50/70 border-2 border-amber-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <Award className="w-5 h-5 text-amber-700" />
              <span>Ringkasan Eksekutif & Kepatuhan Pelayanan Kepala Dinas</span>
            </div>
            <button
              onClick={() => onNavigateMenu('laporan')}
              className="text-xs text-amber-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Pelaporan Resmi Ombudsman & Kemensos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white p-3.5 rounded-2xl border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tingkat Ketuntasan</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {total > 0 ? Math.round((selesai / total) * 100) : 0}%
              </span>
              <span className="text-[10px] text-slate-500">{selesai} dari {total} aduan tuntas</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Kepatuhan Waktu SLA</span>
              <span className="text-2xl font-black text-blue-700 mt-1 block">
                {total > 0 ? Math.round(((total - overdueList.length) / total) * 100) : 100}%
              </span>
              <span className="text-[10px] text-slate-500">{overdueList.length} kasus lewat batas</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Kasus Mendesak</span>
              <span className="text-2xl font-black text-rose-700 mt-1 block">{mendesakList.length}</span>
              <span className="text-[10px] text-rose-600 font-bold">Butuh atensi segera</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Penyaluran Antar-OPD</span>
              <span className="text-2xl font-black text-amber-800 mt-1 block">{diteruskan}</span>
              <span className="text-[10px] text-slate-500">Surat keluar lintas instansi</span>
            </div>
          </div>
        </div>
      )}

      {/* 9 Statistical Cards (Section 10 of prompt) */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-red-700" />
          Statistik Pengaduan Masyarakat Dinas Sosial
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* 1. Total */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Pengaduan</span>
              <FileText className="w-4 h-4 text-slate-700" />
            </div>
            <h4 className="text-2xl font-black text-slate-900 mt-2">{total}</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Seluruh aduan masuk</p>
          </div>

          {/* 2. Baru */}
          <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-blue-700">Pengaduan Baru</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="text-2xl font-black text-blue-800 mt-2">{baru}</h4>
            <p className="text-[10px] text-blue-600 mt-0.5">Menunggu verifikasi</p>
          </div>

          {/* 3. Dalam Penelaahan */}
          <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-amber-700">Dalam Penelaahan</span>
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="text-2xl font-black text-amber-800 mt-2">{dalamPenelaahan}</h4>
            <p className="text-[10px] text-amber-600 mt-0.5">Proses tim telaah</p>
          </div>

          {/* 4. Sedang Diproses */}
          <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-purple-700">Sedang Diproses</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="text-2xl font-black text-purple-800 mt-2">{sedangDiproses}</h4>
            <p className="text-[10px] text-purple-600 mt-0.5">Tindak lanjut petugas</p>
          </div>

          {/* 5. Menunggu Data */}
          <div className="bg-white p-4 rounded-2xl border border-orange-200 bg-orange-50/20 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-orange-700">Menunggu Data</span>
              <FileQuestion className="w-4 h-4 text-orange-600" />
            </div>
            <h4 className="text-2xl font-black text-orange-800 mt-2">{menungguData}</h4>
            <p className="text-[10px] text-orange-600 mt-0.5">Kelengkapan berkas</p>
          </div>

          {/* 6. Menunggu Koordinasi */}
          <div className="bg-white p-4 rounded-2xl border border-yellow-200 bg-yellow-50/20 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-yellow-700">Menunggu Koordinasi</span>
              <Users className="w-4 h-4 text-yellow-600" />
            </div>
            <h4 className="text-2xl font-black text-yellow-800 mt-2">{menungguKoordinasi}</h4>
            <p className="text-[10px] text-yellow-600 mt-0.5">Rapat / keputusan OPD</p>
          </div>

          {/* 7. Diteruskan */}
          <div className="bg-white p-4 rounded-2xl border border-sky-200 bg-sky-50/20 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-sky-700">Diteruskan</span>
              <Send className="w-4 h-4 text-sky-600" />
            </div>
            <h4 className="text-2xl font-black text-sky-800 mt-2">{diteruskan}</h4>
            <p className="text-[10px] text-sky-600 mt-0.5">Surat penyaluran terbit</p>
          </div>

          {/* 8. Selesai */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-emerald-700">Selesai</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="text-2xl font-black text-emerald-800 mt-2">{selesai}</h4>
            <p className="text-[10px] text-emerald-600 mt-0.5">Tuntas & konfirmasi</p>
          </div>

          {/* 9. Tidak Dapat Ditindaklanjuti */}
          <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs sm:col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-rose-700">Tidak Dapat Ditindaklanjuti</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <h4 className="text-2xl font-black text-rose-800 mt-2">{tidakDapat}</h4>
            <p className="text-[10px] text-rose-600 mt-0.5">Ketidaksesuaian syarat / bukan kewenangan</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classification Visual Bars */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
            <span>Pengaduan Berdasarkan Klasifikasi</span>
            <span className="text-[10px] text-slate-400">10 Kategori Dinsos</span>
          </h4>

          <div className="space-y-2.5">
            {Object.entries(classificationCounts).map(([kategori, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={kategori} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-700 font-semibold">
                    <span className="truncate pr-2">{kategori}</span>
                    <span className="shrink-0">{count} aduan ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-700 rounded-full transition-all" 
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Authority & Priority Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              Distribusi Penentuan Kewenangan
            </h4>
            <div className="space-y-2 text-xs">
              {Object.entries(authorityCounts).map(([kewenangan, count]) => (
                <div key={kewenangan} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-800">{kewenangan}</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              Tingkat Prioritas Pengaduan
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-900 block">Biasa</span>
                <span className="text-lg font-black text-blue-700">
                  {complaints.filter(c => c.prioritas === 'Biasa').length}
                </span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-900 block">Penting</span>
                <span className="text-lg font-black text-amber-700">
                  {complaints.filter(c => c.prioritas === 'Penting').length}
                </span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span className="font-bold text-rose-900 block">Mendesak</span>
                <span className="text-lg font-black text-rose-700">
                  {complaints.filter(c => c.prioritas === 'Mendesak').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Pengaduan Terbaru Masuk
          </h4>
          <button
            onClick={() => onNavigateMenu('pengaduan')}
            className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1"
          >
            <span>Lihat Semua Pengaduan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {complaints.slice(0, 5).map(c => (
            <div 
              key={c.id} 
              onClick={() => onSelectComplaint(c)}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600 font-mono text-xs font-bold shrink-0">
                  {c.nomorPengaduan}
                </div>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{c.pokokPengaduan}</h5>
                  <p className="text-[11px] text-slate-500">{c.namaPengadu} • Masuk {c.tanggalPenerimaan}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pl-11 sm:pl-0">
                <StatusBadge status={c.status} size="sm" />
                <PriorityBadge prioritas={c.prioritas} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
