import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, StatusPengaduan, PrioritasType, KewenanganType } from '../../types';
import { StatusBadge, PriorityBadge, KewenanganBadge } from '../common/StatusBadge';
import { SlaIndicator } from '../common/SlaIndicator';
import { STATUS_OPTIONS } from '../../data/initialData';
import { 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  Send, 
  CheckCircle2, 
  Trash2, 
  Download, 
  Plus, 
  Printer, 
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface ComplaintListProps {
  onSelectComplaint: (c: Complaint) => void;
  onOpenReview: (c: Complaint) => void;
  onOpenDistribution: (c: Complaint) => void;
  onOpenResolution: (c: Complaint) => void;
  onAddNew: () => void;
}

export const ComplaintList: React.FC<ComplaintListProps> = ({
  onSelectComplaint,
  onOpenReview,
  onOpenDistribution,
  onOpenResolution,
  onAddNew,
}) => {
  const { complaints, currentUser, deleteComplaint, exportComplaintsCSV } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPrioritas, setFilterPrioritas] = useState<string>('ALL');
  const [filterKewenangan, setFilterKewenangan] = useState<string>('ALL');

  const filteredComplaints = complaints.filter(c => {
    // Text search: Nomor, NIK, Nama, HP, Pokok
    const q = searchTerm.toLowerCase();
    const matchQuery = !q || (
      c.nomorPengaduan.toLowerCase().includes(q) ||
      c.nik.toLowerCase().includes(q) ||
      c.namaPengadu.toLowerCase().includes(q) ||
      c.nomorTelepon.toLowerCase().includes(q) ||
      c.pokokPengaduan.toLowerCase().includes(q)
    );

    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchPrioritas = filterPrioritas === 'ALL' || c.prioritas === filterPrioritas;
    const matchKewenangan = filterKewenangan === 'ALL' || c.kewenangan === filterKewenangan;

    return matchQuery && matchStatus && matchPrioritas && matchKewenangan;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Daftar Seluruh Pengaduan Masyarakat
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {complaints.length} pengaduan terdaftar • Menampilkan {filteredComplaints.length} pengaduan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportComplaintsCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Penerimaan Pengaduan Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nomor Pengaduan, NIK, Nama, No HP, atau Pokok Permasalahan..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">Semua Status</option>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Prioritas */}
            <select
              value={filterPrioritas}
              onChange={(e) => setFilterPrioritas(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="Biasa">Biasa</option>
              <option value="Penting">Penting</option>
              <option value="Mendesak">Mendesak</option>
            </select>

            {/* Kewenangan */}
            <select
              value={filterKewenangan}
              onChange={(e) => setFilterKewenangan(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">Semua Kewenangan</option>
              <option value="Dinas Sosial Kota Tanjungbalai">Dinas Sosial Kota Tanjungbalai</option>
              <option value="Perangkat Daerah lain di Kota Tanjungbalai">Perangkat Daerah lain (OPD)</option>
              <option value="Pemerintah Provinsi">Pemerintah Provinsi</option>
              <option value="Pemerintah Pusat">Pemerintah Pusat</option>
              <option value="Instansi/Lembaga lain">Instansi Lain</option>
            </select>

            {(searchTerm || filterStatus !== 'ALL' || filterPrioritas !== 'ALL' || filterKewenangan !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('ALL');
                  setFilterPrioritas('ALL');
                  setFilterKewenangan('ALL');
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                title="Reset Filter"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table for Desktop & Cards for Mobile */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Nomor & Tanggal</th>
                <th className="py-3.5 px-4">Pengadu</th>
                <th className="py-3.5 px-4">Pokok Pengaduan</th>
                <th className="py-3.5 px-4">Kewenangan</th>
                <th className="py-3.5 px-4 text-center">Prioritas</th>
                <th className="py-3.5 px-4 text-center">Target SLA</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada pengaduan yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectComplaint(c)}
                  >
                    {/* Nomor & Tanggal */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-red-700 group-hover:underline">
                        {c.nomorPengaduan}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {c.tanggalPenerimaan} ({c.mediaPengaduan})
                      </div>
                    </td>

                    {/* Pengadu */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{c.namaPengadu}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        NIK: {c.nik.substring(0, 6)}******{c.nik.substring(12)}
                      </div>
                      <div className="text-[10px] text-slate-500">Telp: {c.nomorTelepon}</div>
                    </td>

                    {/* Pokok Pengaduan */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-1">
                        {c.pokokPengaduan}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {c.uraianKronologi}
                      </div>
                    </td>

                    {/* Kewenangan */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <KewenanganBadge kewenangan={c.kewenangan} />
                    </td>

                    {/* Prioritas */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <PriorityBadge prioritas={c.prioritas} size="sm" />
                    </td>

                    {/* Target SLA */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <SlaIndicator deadline={c.slaDeadline} status={c.status} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    {/* Aksi Cepat */}
                    <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectComplaint(c)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Detail Lengkap"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onOpenReview(c)}
                          className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                          title="Penelaahan & Klasifikasi"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {c.kewenangan !== 'Dinas Sosial Kota Tanjungbalai' && (
                          <button
                            onClick={() => onOpenDistribution(c)}
                            className="p-1.5 text-sky-700 hover:text-sky-900 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                            title="Surat Penyaluran Bukan Kewenangan"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onOpenResolution(c)}
                          className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          title="Penyelesaian & Bukti"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        {currentUser.role === 'ADMIN' && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus pengaduan nomor ${c.nomorPengaduan}?`)) {
                                deleteComplaint(c.id);
                              }
                            }}
                            className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Data (Admin)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Phone Card View (Never overlaps, touch-friendly) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredComplaints.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ada pengaduan yang sesuai kriteria pencarian.
            </div>
          ) : (
            filteredComplaints.map((c) => (
              <div 
                key={c.id} 
                className="p-4 space-y-3 hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100"
                onClick={() => onSelectComplaint(c)}
              >
                {/* Header row: Nomor & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-xs text-red-700 block">
                      {c.nomorPengaduan}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {c.tanggalPenerimaan} • {c.mediaPengaduan}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={c.status} size="sm" />
                    <PriorityBadge prioritas={c.prioritas} size="sm" />
                  </div>
                </div>

                {/* Pokok Pengaduan */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {c.pokokPengaduan}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {c.uraianKronologi}
                  </p>
                </div>

                {/* Pengadu & Kewenangan */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Pengadu:</span>
                    <span className="font-bold text-slate-800">{c.namaPengadu}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">No. WhatsApp/HP:</span>
                    <span className="font-medium text-slate-700">{c.nomorTelepon}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Kewenangan:</span>
                    <KewenanganBadge kewenangan={c.kewenangan} />
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">SLA:</span>
                    <SlaIndicator deadline={c.slaDeadline} status={c.status} size="sm" />
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelectComplaint(c)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Detail</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenReview(c)}
                      className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs transition-colors cursor-pointer"
                      title="Telaah"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    {c.kewenangan !== 'Dinas Sosial Kota Tanjungbalai' && (
                      <button
                        onClick={() => onOpenDistribution(c)}
                        className="p-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg text-xs transition-colors cursor-pointer"
                        title="Penyaluran"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onOpenResolution(c)}
                      className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs transition-colors cursor-pointer"
                      title="Penyelesaian"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    {currentUser.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus pengaduan nomor ${c.nomorPengaduan}?`)) {
                            deleteComplaint(c.id);
                          }
                        }}
                        className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
