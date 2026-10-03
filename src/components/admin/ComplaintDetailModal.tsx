import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, StatusPengaduan } from '../../types';
import { OfficialKop } from '../common/OfficialKop';
import { LembarTelaahPrintModal } from './LembarTelaahPrintModal';
import { StatusBadge, PriorityBadge, KewenanganBadge } from '../common/StatusBadge';
import { SlaIndicator } from '../common/SlaIndicator';
import { STATUS_OPTIONS } from '../../data/initialData';
import { 
  X, 
  Printer, 
  Edit, 
  Send, 
  CheckCircle2, 
  Clock, 
  FileText, 
  History, 
  Upload, 
  Building2, 
  ShieldAlert,
  ArrowRight,
  UserCheck,
  FolderOpen
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaintId: string | null;
  onClose: () => void;
  onOpenReview?: (c: Complaint) => void;
  onOpenDistribution?: (c: Complaint) => void;
  onOpenResolution?: (c: Complaint) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaintId,
  onClose,
  onOpenReview,
  onOpenDistribution,
  onOpenResolution,
}) => {
  const { complaints, updateComplaintStatus, updateComplaint, uploadArsipFile } = useApp();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editNamaPengadu, setEditNamaPengadu] = useState('');
  const [editNik, setEditNik] = useState('');
  const [editNomorTelepon, setEditNomorTelepon] = useState('');
  const [editAlamat, setEditAlamat] = useState('');
  const [editStatusHubungan, setEditStatusHubungan] = useState<any>('Diri sendiri');
  const [editMediaPengaduan, setEditMediaPengaduan] = useState<any>('Website');
  const [editPokokPengaduan, setEditPokokPengaduan] = useState('');
  const [editUraianKronologi, setEditUraianKronologi] = useState('');
  const [editPermintaanHarapan, setEditPermintaanHarapan] = useState('');
  const [editPrioritas, setEditPrioritas] = useState<any>('Biasa');

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<StatusPengaduan>('Sedang Diproses');
  const [statusReason, setStatusReason] = useState('');

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadKategori, setUploadKategori] = useState<any>('Dokumen Tindak Lanjut');
  const [uploadFileName, setUploadFileName] = useState('');
  const [telaahPrintOpen, setTelaahPrintOpen] = useState(false);

  if (!complaintId) return null;
  const complaint = complaints.find(c => c.id === complaintId);
  if (!complaint) return null;

  const handleOpenEditModal = () => {
    setEditNamaPengadu(complaint.namaPengadu);
    setEditNik(complaint.nik);
    setEditNomorTelepon(complaint.nomorTelepon);
    setEditAlamat(complaint.alamat);
    setEditStatusHubungan(complaint.statusHubungan);
    setEditMediaPengaduan(complaint.mediaPengaduan);
    setEditPokokPengaduan(complaint.pokokPengaduan);
    setEditUraianKronologi(complaint.uraianKronologi);
    setEditPermintaanHarapan(complaint.permintaanHarapan);
    setEditPrioritas(complaint.prioritas);
    setEditModalOpen(true);
  };

  const handleSaveEditComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    updateComplaint(complaint.id, {
      namaPengadu: editNamaPengadu.trim(),
      nik: editNik.trim(),
      nomorTelepon: editNomorTelepon.trim(),
      alamat: editAlamat.trim(),
      statusHubungan: editStatusHubungan,
      mediaPengaduan: editMediaPengaduan,
      pokokPengaduan: editPokokPengaduan.trim(),
      uraianKronologi: editUraianKronologi.trim(),
      permintaanHarapan: editPermintaanHarapan.trim(),
      prioritas: editPrioritas,
    }, 'Pembaruan data identitas & materi pokok aduan');
    setEditModalOpen(false);
  };

  const handleStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusReason.trim()) return;
    updateComplaintStatus(complaint.id, newStatus, statusReason);
    setStatusModalOpen(false);
    setStatusReason('');
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;
    uploadArsipFile(complaint.id, {
      kategori: uploadKategori,
      namaFile: uploadFileName,
      ukuran: '1.4 MB'
    });
    setUploadModalOpen(false);
    setUploadFileName('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
          {/* Modal Sticky Header Bar */}
          <div className="sticky top-0 z-30 bg-slate-900 text-white p-3 sm:px-6 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="font-mono text-xs sm:text-base font-bold text-amber-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                {complaint.nomorPengaduan}
              </span>
              <StatusBadge status={complaint.status} size="sm" />
              <PriorityBadge prioritas={complaint.prioritas} size="sm" />
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button
                onClick={() => window.print()}
                className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cetak Berkas Ini"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Cetak</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Batas Waktu SLA:</span>
              <SlaIndicator deadline={complaint.slaDeadline} status={complaint.status} />
              <span className="text-slate-400">({complaint.slaDeadline})</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleOpenEditModal}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Edit data identitas pengadu & pokok aduan"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Data Aduan</span>
              </button>

              <button
                onClick={() => setStatusModalOpen(true)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 font-bold rounded-lg text-slate-700 transition-colors"
              >
                Ubah Status
              </button>

              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 font-bold rounded-lg text-slate-700 transition-colors flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Dokumen</span>
              </button>

              {onOpenReview && (
                <button
                  onClick={() => onOpenReview(complaint)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Edit Telaah</span>
                </button>
              )}

              {complaint.telaah && (
                <button
                  onClick={() => setTelaahPrintOpen(true)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Cetak Dokumen Resmi Lembar Telaah"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Cetak Lembar Telaah</span>
                </button>
              )}

              {complaint.kewenangan !== 'Dinas Sosial Kota Tanjungbalai' && onOpenDistribution && (
                <button
                  onClick={() => onOpenDistribution(complaint)}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Surat Penyaluran</span>
                </button>
              )}

              {onOpenResolution && (
                <button
                  onClick={() => onOpenResolution(complaint)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Penyelesaian</span>
                </button>
              )}
            </div>
          </div>

          {/* Modal Body: Complete End-to-End Detail (Section 24) */}
          <div className="p-6 sm:p-10 space-y-8 max-h-[80vh] overflow-y-auto print-page">
            <OfficialKop subTitle="BERKAS ADMINISTRASI LENGKAP PENGADUAN MASYARAKAT" />

            {/* 1. IDENTITAS PENGADU */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 border-b pb-2 mb-3 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-red-100 text-red-800 flex items-center justify-center text-[10px]">1</span>
                IDENTITAS PENGADU
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold">Nama Lengkap:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{complaint.namaPengadu}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">NIK:</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{complaint.nik}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Nomor Telepon/HP:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{complaint.nomorTelepon}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 font-semibold">Alamat Domisili:</span>
                  <p className="font-medium text-slate-800 mt-0.5">{complaint.alamat}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Status / Hubungan:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{complaint.statusHubungan}</p>
                </div>
              </div>
            </div>

            {/* 2. URAIAN PENGADUAN */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 border-b pb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-red-100 text-red-800 flex items-center justify-center text-[10px]">2</span>
                URAIAN PENGADUAN
              </h4>
              <div className="text-xs">
                <span className="text-slate-400 font-semibold">Pokok Masalah:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{complaint.pokokPengaduan}</p>
              </div>
              <div className="text-xs">
                <span className="text-slate-400 font-semibold">Kronologi / Kejadian:</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-1 leading-relaxed whitespace-pre-wrap">
                  {complaint.uraianKronologi}
                </p>
              </div>
              <div className="text-xs">
                <span className="text-slate-400 font-semibold">Permintaan / Harapan Pengadu:</span>
                <p className="text-slate-800 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200 mt-1 font-medium">
                  {complaint.permintaanHarapan}
                </p>
              </div>
            </div>

            {/* 3. DOKUMEN / BUKTI PENDUKUNG */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 border-b pb-2 mb-3 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-red-100 text-red-800 flex items-center justify-center text-[10px]">3</span>
                DOKUMEN / BUKTI PENDUKUNG
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {complaint.dokumenPendukung.map((doc) => (
                  <div key={doc.no} className={`p-2.5 rounded-xl border ${doc.ada ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{doc.uraian}</span>
                      <span className={`text-[10px] font-bold px-1.5 rounded-sm ${doc.ada ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}`}>
                        {doc.ada ? 'Ada' : 'Tidak Ada'}
                      </span>
                    </div>
                    {doc.keterangan && <p className="text-[11px] text-slate-600 mt-1">{doc.keterangan}</p>}
                    {doc.fileName && <p className="text-[10px] text-blue-600 font-mono mt-0.5 truncate">📎 {doc.fileName}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. HASIL PENELAAHAN, KLASIFIKASI, KEWENANGAN, PRIORITAS */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-red-100 text-red-800 flex items-center justify-center text-[10px]">4</span>
                  PENELAAHAN, KLASIFIKASI & KEWENANGAN
                </h4>
                {complaint.telaah && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Ditelaah: {complaint.telaah.tanggalTelaah}
                    </span>
                    <button
                      onClick={() => setTelaahPrintOpen(true)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                      title="Cetak Berkas Lembar Telaah"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-300" />
                      <span>Cetak Lembar Telaah</span>
                    </button>
                  </div>
                )}
              </div>

              {complaint.telaah ? (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <span className="text-blue-900 font-bold block mb-1">Klasifikasi Terpilih:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-blue-800 font-semibold">
                        {complaint.telaah.klasifikasiList.filter(k => k.ya).map(k => (
                          <li key={k.no}>{k.klasifikasi}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <span className="text-amber-900 font-bold block mb-1">Penentuan Kewenangan:</span>
                      <p className="font-bold text-amber-950">{complaint.telaah.kewenangan}</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-slate-700 font-bold block mb-1">Tingkat Prioritas:</span>
                      <PriorityBadge prioritas={complaint.telaah.prioritas} />
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700">Rekomendasi Tindak Lanjut:</span>
                    <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 mt-1">
                      {complaint.telaah.rekomendasiTindakLanjut || '-'}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700">Hasil Telaah / Analisis:</span>
                    <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 mt-1">
                      {complaint.telaah.hasilTelaahAnalisis || '-'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-xl text-amber-800 text-xs flex items-center justify-between">
                  <span>Pengaduan ini belum ditelaah oleh Tim Penelaah.</span>
                  {onOpenReview && (
                    <button
                      onClick={() => onOpenReview(complaint)}
                      className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg text-xs"
                    >
                      Buka Form Telaah
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 5. PENYALURAN (JIKA DITERUSKAN) */}
            {complaint.penyaluran && (
              <div className="border border-sky-200 rounded-2xl p-5 bg-sky-50/50 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-800 border-b border-sky-200 pb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-sky-600 text-white flex items-center justify-center text-[10px]">5</span>
                  SURAT PENYALURAN KE INSTANSI LAIN
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold">Nomor Surat Penyaluran:</span>
                    <p className="font-mono font-bold text-sky-900 mt-0.5">{complaint.penyaluran.nomorSuratPenyaluran}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Tanggal Surat:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{complaint.penyaluran.tanggalPenyaluran}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 font-semibold">Instansi Tujuan:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{complaint.penyaluran.kepada}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. TINDAKAN PENYELESAIAN */}
            {complaint.penyelesaian && (
              <div className="border border-emerald-200 rounded-2xl p-5 bg-emerald-50/50 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px]">6</span>
                  TINDAKAN PENYELESAIAN & HASIL
                </h4>
                <div className="text-xs space-y-2">
                  <p><strong>Petugas Pelaksana:</strong> {complaint.penyelesaian.petugasPelaksana} (Tgl: {complaint.penyelesaian.tanggalPenyelesaian})</p>
                  <p><strong>Aksi Nyata:</strong> {complaint.penyelesaian.tindakanDilakukan}</p>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-emerald-950 font-medium">
                    <strong>Hasil:</strong> {complaint.penyelesaian.hasilPenyelesaian}
                  </div>
                </div>
              </div>
            )}

            {/* 7. KONFIRMASI PENGADU */}
            {complaint.konfirmasi && (
              <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-2 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b pb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-white flex items-center justify-center text-[10px]">7</span>
                  KONFIRMASI PENGADU
                </h4>
                <p><strong>Media:</strong> {complaint.konfirmasi.mediaPenyampaian} • <strong>Waktu:</strong> {complaint.konfirmasi.tanggalPenyampaianHasil}</p>
                <p className="font-semibold text-emerald-700">✓ {complaint.konfirmasi.konfirmasi}</p>
                <p className="text-slate-600 italic">"{complaint.konfirmasi.tanggapanPengadu}"</p>
              </div>
            )}

            {/* 8. RIWAYAT AUDIT TRAIL */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b pb-2 mb-3 flex items-center gap-1.5">
                <History className="w-4 h-4 text-red-700" />
                AUDIT TRAIL & RIWAYAT AKTIVITAS
              </h4>
              <div className="space-y-2 text-xs">
                {complaint.auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <p className="text-slate-600">{log.detail}</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-400 font-mono shrink-0">
                      <div>{log.user} ({log.role})</div>
                      <div>{log.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ubah Status */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70" onClick={() => setStatusModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Ubah Status Pengaduan</h3>
            <form onSubmit={handleStatusChange} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Baru:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as StatusPengaduan)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Perubahan Status (Wajib):</label>
                <textarea
                  rows={3}
                  required
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Jelaskan alasan atau dasar perkembangan perubahan status ini..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload File */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70" onClick={() => setUploadModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Upload Dokumen Tambahan ke Arsip</h3>
            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Dokumen:</label>
                <select
                  value={uploadKategori}
                  onChange={(e) => setUploadKategori(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="Identitas">Identitas Pengadu</option>
                  <option value="Bukti Pengaduan">Bukti Pengaduan</option>
                  <option value="Penelaahan">Hasil Penelaahan</option>
                  <option value="Surat Penyaluran">Surat Penyaluran</option>
                  <option value="Dokumen Tindak Lanjut">Dokumen Tindak Lanjut</option>
                  <option value="Penyelesaian">Bukti Penyelesaian</option>
                  <option value="Konfirmasi">Konfirmasi Pengadu</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama File:</label>
                <input
                  type="text"
                  required
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="Contoh: Berita_Acara_Kunjungan.pdf"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg"
                >
                  Simpan ke Arsip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Data Aduan */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setEditModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Edit Data Pengaduan ({complaint.nomorPengaduan})
                </h3>
                <p className="text-xs text-slate-500">
                  Perbaiki kesalahan pengetikan identitas pengadu atau materi pokok aduan.
                </p>
              </div>
              <button 
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditComplaint} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Pengadu:</label>
                  <input
                    type="text"
                    required
                    value={editNamaPengadu}
                    onChange={(e) => setEditNamaPengadu(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIK (16 Digit):</label>
                  <input
                    type="text"
                    required
                    value={editNik}
                    onChange={(e) => setEditNik(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp:</label>
                  <input
                    type="text"
                    required
                    value={editNomorTelepon}
                    onChange={(e) => setEditNomorTelepon(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Hubungan:</label>
                  <select
                    value={editStatusHubungan}
                    onChange={(e) => setEditStatusHubungan(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Diri sendiri">Diri sendiri</option>
                    <option value="Keluarga">Keluarga</option>
                    <option value="Masyarakat">Masyarakat</option>
                    <option value="Lembaga">Lembaga</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap Domisili:</label>
                  <input
                    type="text"
                    required
                    value={editAlamat}
                    onChange={(e) => setEditAlamat(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Media Pengaduan:</label>
                  <select
                    value={editMediaPengaduan}
                    onChange={(e) => setEditMediaPengaduan(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Website">Website</option>
                    <option value="Tatap Muka">Tatap Muka (Loket)</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telepon">Telepon</option>
                    <option value="Surat">Surat Fisik</option>
                    <option value="Email">Email</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Prioritas:</label>
                  <select
                    value={editPrioritas}
                    onChange={(e) => setEditPrioritas(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Biasa">Biasa (Target 14 Hari)</option>
                    <option value="Penting">Penting (Target 7 Hari)</option>
                    <option value="Mendesak">Mendesak (Target 3 Hari)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pokok Pengaduan (Judul Ringkas):</label>
                <input
                  type="text"
                  required
                  value={editPokokPengaduan}
                  onChange={(e) => setEditPokokPengaduan(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Uraian Kronologi Pengaduan:</label>
                <textarea
                  rows={4}
                  required
                  value={editUraianKronologi}
                  onChange={(e) => setEditUraianKronologi(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Permintaan / Harapan Pengadu:</label>
                <textarea
                  rows={2}
                  value={editPermintaanHarapan}
                  onChange={(e) => setEditPermintaanHarapan(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Perubahan Aduan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lembar Telaah Print Modal */}
      <LembarTelaahPrintModal
        isOpen={telaahPrintOpen}
        onClose={() => setTelaahPrintOpen(false)}
        complaint={complaint}
      />
    </div>
  );
};
