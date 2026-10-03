import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, DigitalFile } from '../../types';
import { GoogleWorkspaceSyncModal } from '../common/GoogleWorkspaceSyncModal';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Download, 
  Upload, 
  Search, 
  ChevronRight, 
  ChevronDown,
  Eye,
  FileCheck,
  ShieldCheck,
  UserCheck,
  Cloud,
  FileSpreadsheet
} from 'lucide-react';

interface DigitalArchiveProps {
  onSelectComplaint: (c: Complaint) => void;
}

export const DigitalArchive: React.FC<DigitalArchiveProps> = ({ onSelectComplaint }) => {
  const { complaints, uploadArsipFile } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolderComplaintId, setSelectedFolderComplaintId] = useState<string>(
    complaints[0]?.id || ''
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Google Workspace Modal State
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [workspaceModalTab, setWorkspaceModalTab] = useState<'sheets' | 'drive'>('drive');

  const categories = [
    'ALL',
    'Identitas',
    'Bukti Pengaduan',
    'Penelaahan',
    'Surat Penyaluran',
    'Dokumen Tindak Lanjut',
    'Penyelesaian',
    'Konfirmasi'
  ];

  const currentComplaint = complaints.find(c => c.id === selectedFolderComplaintId) || complaints[0];

  const filteredComplaints = complaints.filter(c =>
    c.nomorPengaduan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.namaPengadu.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.pokokPengaduan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filesToDisplay = currentComplaint?.arsipDigital.filter(f => 
    selectedCategory === 'ALL' || f.kategori === selectedCategory
  ) || [];

  const handleDownloadSimulate = (file: DigitalFile) => {
    // Generate a simple text file representation for download
    const content = `PEMERINTAH KOTA TANJUNGBALAI - DINAS SOSIAL\nARSIP RESMI PENGADUAN MASYARAKAT\n\nNomor Pengaduan: ${currentComplaint.nomorPengaduan}\nPengadu: ${currentComplaint.namaPengadu}\nKategori Berkas: ${file.kategori}\nNama Berkas: ${file.namaFile}\nTanggal Diarsipkan: ${file.tanggal}\nPengunggah: ${file.diunggahOleh}\nUkuran: ${file.ukuran}\n\n[Dokumen Digital Terotentikasi oleh Sistem SIPMAS Dinsos Kota Tanjungbalai]`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.namaFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Arsip Digital Pengaduan Masyarakat
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Struktur berkas digital otomatis per nomor pengaduan sesuai format kearsipan resmi Dinsos Tanjungbalai.
          </p>
        </div>

        {/* Google Workspace Cloud Storage Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setWorkspaceModalTab('drive');
              setWorkspaceModalOpen(true);
            }}
            className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Cloud className="w-4 h-4 text-sky-200" />
            <span>Penyimpanan Google Drive</span>
          </button>

          <button
            onClick={() => {
              setWorkspaceModalTab('sheets');
              setWorkspaceModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Sinkron Google Sheets</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Folder Explorer */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col h-[360px] lg:h-[650px]">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari folder nomor / nama..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredComplaints.map(c => {
              const isSelected = c.id === currentComplaint?.id;
              const fileCount = c.arsipDigital?.length || 0;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedFolderComplaintId(c.id)}
                  className={`w-full p-3 text-left rounded-2xl border transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-red-50/80 border-red-300 shadow-xs'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <Folder className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? 'text-red-700 fill-red-100' : 'text-amber-500'}`} />
                  <div className="min-w-0 flex-1">
                    <span className="font-mono font-bold text-xs text-slate-900 block truncate">
                      {c.nomorPengaduan}
                    </span>
                    <p className="text-[11px] font-medium text-slate-600 truncate mt-0.5">
                      {c.namaPengadu}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{fileCount} dokumen</span>
                      <span>{c.status}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Files Inside Current Complaint Folder */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-6 flex flex-col min-h-[420px] lg:h-[650px]">
          {currentComplaint ? (
            <>
              {/* Folder Header */}
              <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-red-700" />
                    <h3 className="font-mono font-bold text-base text-slate-900">
                      {currentComplaint.nomorPengaduan}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Pengadu: <strong>{currentComplaint.namaPengadu}</strong> • {currentComplaint.pokokPengaduan}
                  </p>
                </div>

                <button
                  onClick={() => onSelectComplaint(currentComplaint)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Buka Berkas Lengkap</span>
                </button>
              </div>

              {/* Category Pills */}
              <div className="py-3 flex flex-wrap gap-1.5 border-b border-slate-100 text-xs">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                      selectedCategory === cat
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'Semua Berkas' : cat}
                  </button>
                ))}
              </div>

              {/* Files Grid / List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
                {filesToDisplay.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Tidak ada dokumen pada kategori ini</p>
                  </div>
                ) : (
                  filesToDisplay.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-red-700">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 truncate">
                            {file.namaFile}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded-sm">
                              {file.kategori}
                            </span>
                            <span>• {file.ukuran}</span>
                            <span>• {file.tanggal}</span>
                            <span>• Diunggah oleh: {file.diunggahOleh}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleDownloadSimulate(file)}
                          className="p-2 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Unduh Berkas"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Unduh</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Folder Footer Info */}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-400">
                <span>Struktur Kearsipan Digital UU No. 43/2009</span>
                <span>Total: {currentComplaint.arsipDigital?.length || 0} File Terotentikasi</span>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-400">
              Pilih folder pengaduan dari sisi kiri
            </div>
          )}
        </div>
      </div>

      {/* Google Workspace Cloud Sync Modal */}
      <GoogleWorkspaceSyncModal
        isOpen={workspaceModalOpen}
        onClose={() => setWorkspaceModalOpen(false)}
        defaultTab={workspaceModalTab}
      />
    </div>
  );
};
