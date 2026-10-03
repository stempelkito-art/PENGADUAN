import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OfficialKop } from '../common/OfficialKop';
import { OFFICIAL_INFO } from '../../data/initialData';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  BarChart3, 
  CheckCircle, 
  Send, 
  ShieldAlert,
  Save,
  Database,
  FileSpreadsheet
} from 'lucide-react';
import { GoogleWorkspaceSyncModal } from '../common/GoogleWorkspaceSyncModal';

export const ReportsSection: React.FC = () => {
  const { complaints, exportComplaintsCSV, backupDatabase } = useApp();

  const [activeReportType, setActiveReportType] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  const reportTypes = [
    { id: 1, title: 'Rekap Seluruh Pengaduan', desc: 'Daftar kumulatif seluruh laporan masuk' },
    { id: 2, title: 'Pengaduan Per Klasifikasi', desc: 'Statistik 10 kategori permasalahan sosial' },
    { id: 3, title: 'Pengaduan Per Status', desc: 'Sebaran proses pengaduan saat ini' },
    { id: 4, title: 'Pengaduan Per Kewenangan', desc: 'Pemilahan tugas Dinsos vs Perangkat Daerah lain' },
    { id: 5, title: 'Pengaduan Berdasarkan Prioritas', desc: 'Biasa, Penting, dan Mendesak' },
    { id: 6, title: 'Pengaduan Selesai', desc: 'Daftar pengaduan yang telah tuntas & konfirmasi' },
    { id: 7, title: 'Pengaduan Belum Selesai', desc: 'Pengaduan yang masih dalam proses penanganan' },
    { id: 8, title: 'Pengaduan Diteruskan (Penyaluran)', desc: 'Pengaduan dengan surat dinas ke instansi lain' },
    { id: 9, title: 'Pengaduan Mendesak', desc: 'Aduan kategori darurat / PPKS rentan' },
    { id: 10, title: 'Rekap Waktu Penyelesaian (SLA)', desc: 'Analisis ketepatan waktu target penanganan' },
  ];

  // Filter complaints based on report type
  const getFilteredComplaints = () => {
    switch (activeReportType) {
      case 6: // Selesai
        return complaints.filter(c => c.status.startsWith('Selesai'));
      case 7: // Belum selesai
        return complaints.filter(c => !c.status.startsWith('Selesai') && c.status !== 'Tidak Dapat Ditindaklanjuti');
      case 8: // Diteruskan
        return complaints.filter(c => c.status === 'Diteruskan');
      case 9: // Mendesak
        return complaints.filter(c => c.prioritas === 'Mendesak');
      default:
        return complaints;
    }
  };

  const reportData = getFilteredComplaints();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Laporan Kinerja Pengaduan Masyarakat
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ekspor rekapitulasi berkala untuk evaluasi pimpinan dan pelaporan Ombudsman / Kemensos RI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setGoogleModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Sinkronkan data pengaduan ke Google Sheets & Drive"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
            <span>Sinkron Google Sheets</span>
          </button>

          <button
            onClick={backupDatabase}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            title="Download JSON Database"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backup Database</span>
          </button>

          <button
            onClick={exportComplaintsCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Excel / CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan PDF</span>
          </button>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 no-print">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Pilih 10 Format Laporan Resmi:
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {reportTypes.map((r) => {
            const isSelected = activeReportType === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActiveReportType(r.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-red-700 text-white border-red-800 shadow-md font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {r.id}
                  </span>
                  <span className="font-bold line-clamp-1">{r.title}</span>
                </div>
                <p className={`text-[10px] line-clamp-2 ${isSelected ? 'text-red-100' : 'text-slate-500'}`}>
                  {r.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Printable Sheet Report Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-xl print-page">
        <OfficialKop subTitle={`LAPORAN ${reportTypes.find(r => r.id === activeReportType)?.title.toUpperCase()}`} />

        <div className="my-6 text-xs text-slate-600 flex justify-between items-center border-b pb-2">
          <span>Periode Pelaporan: Tahun {selectedYear}</span>
          <span>Jumlah Data: <strong>{reportData.length} Pengaduan</strong></span>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold uppercase text-[10px]">
                <th className="p-2 border border-slate-300 text-center w-8">No</th>
                <th className="p-2 border border-slate-300">No. Pengaduan</th>
                <th className="p-2 border border-slate-300">Tgl Masuk</th>
                <th className="p-2 border border-slate-300">Nama Pengadu</th>
                <th className="p-2 border border-slate-300">Pokok Pengaduan</th>
                <th className="p-2 border border-slate-300">Kewenangan</th>
                <th className="p-2 border border-slate-300 text-center">Prioritas</th>
                <th className="p-2 border border-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportData.map((c, idx) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-2 border border-slate-300 text-center font-bold text-slate-500">{idx + 1}</td>
                  <td className="p-2 border border-slate-300 font-mono font-bold text-slate-900">{c.nomorPengaduan}</td>
                  <td className="p-2 border border-slate-300 text-slate-600">{c.tanggalPenerimaan.split(' ')[0]}</td>
                  <td className="p-2 border border-slate-300 font-semibold">{c.namaPengadu}</td>
                  <td className="p-2 border border-slate-300 max-w-xs">{c.pokokPengaduan}</td>
                  <td className="p-2 border border-slate-300">{c.kewenangan}</td>
                  <td className="p-2 border border-slate-300 text-center">{c.prioritas}</td>
                  <td className="p-2 border border-slate-300 font-bold">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Signature Footer on Print */}
        <div className="mt-12 flex justify-end text-xs font-serif leading-tight">
          <div className="text-center w-72">
            <p>Tanjungbalai, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold uppercase tracking-wider mt-1">
              KEPALA DINAS SOSIAL KOTA TANJUNGBALAI
            </p>
            <div className="h-20 flex items-center justify-center font-serif italic text-slate-900 font-bold">
              (.......................................................)
            </div>
            <p className="font-bold underline text-sm uppercase">
              {OFFICIAL_INFO.kadis.nama}
            </p>
            <p className="font-mono mt-0.5">
              NIP : {OFFICIAL_INFO.kadis.nip}
            </p>
          </div>
        </div>
      </div>

      {/* Google Workspace Modal */}
      <GoogleWorkspaceSyncModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        defaultTab="sheets"
      />
    </div>
  );
};
