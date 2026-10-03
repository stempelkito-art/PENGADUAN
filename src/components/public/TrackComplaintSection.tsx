import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { SlaIndicator } from '../common/SlaIndicator';
import { OfficialKop } from '../common/OfficialKop';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  Send, 
  ShieldCheck, 
  FileText, 
  Printer, 
  AlertCircle,
  Building,
  UserCheck,
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const TrackComplaintSection: React.FC = () => {
  const { complaints, selectedComplaintId, setSelectedComplaintId, confirmComplaint } = useApp();

  const [inputNumber, setInputNumber] = useState('');
  const [inputNik, setInputNik] = useState('');
  const [searchedComplaint, setSearchedComplaint] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Warga feedback form inside track
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackChoice, setFeedbackChoice] = useState<'Pengadu menerima hasil penyelesaian' | 'Pengadu masih memerlukan tindak lanjut'>('Pengadu menerima hasil penyelesaian');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // If selectedComplaintId was passed from home
  useEffect(() => {
    if (selectedComplaintId) {
      const match = complaints.find(c => c.id === selectedComplaintId);
      if (match) {
        setSearchedComplaint(match);
        setInputNumber(match.nomorPengaduan);
      }
    }
  }, [selectedComplaintId, complaints]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setFeedbackSuccess(false);

    const cleanNum = inputNumber.trim().toUpperCase();
    const cleanNik = inputNik.trim();

    if (!cleanNum && !cleanNik) {
      setErrorMessage('Masukkan Nomor Pengaduan atau NIK/Nomor HP.');
      return;
    }

    const match = complaints.find(c => {
      const numMatch = cleanNum ? (c.nomorPengaduan.toUpperCase() === cleanNum || c.nomorPengaduan.toUpperCase().includes(cleanNum)) : true;
      const nikMatch = cleanNik ? (c.nik === cleanNik || c.nomorTelepon === cleanNik) : true;
      return numMatch && nikMatch;
    });

    if (match) {
      setSearchedComplaint(match);
      setSelectedComplaintId(match.id);
    } else {
      setSearchedComplaint(null);
      setErrorMessage(`Data pengaduan tidak ditemukan. Mohon periksa kembali Nomor Pengaduan atau NIK yang Anda masukkan.`);
    }
  };

  const handleCitizenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedComplaint) return;

    confirmComplaint(searchedComplaint.id, {
      tanggalPenyampaianHasil: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().substring(0, 5),
      mediaPenyampaian: 'Website',
      tanggapanPengadu: feedbackText || 'Tanggapan telah disampaikan langsung oleh warga melalui portal pelacakan online SIPMAS.',
      konfirmasi: feedbackChoice,
      ttdPengadu: searchedComplaint.namaPengadu,
      ttdPetugas: searchedComplaint.penyelesaian?.petugasPelaksana || 'Petugas Verifikasi SIPMAS',
      nipPetugas: searchedComplaint.penyelesaian?.nipPelaksana || '19850920 200912 1 002'
    });

    setFeedbackSuccess(true);
  };

  const maskNik = (nikStr: string) => {
    if (!nikStr || nikStr.length < 8) return '******';
    return `${nikStr.substring(0, 6)}******${nikStr.substring(nikStr.length - 4)}`;
  };

  // Timeline Step Builder
  const getTimelineSteps = (complaint: any) => {
    const isDiteruskan = complaint.status === 'Diteruskan';
    const isSelesai = complaint.status.startsWith('Selesai');

    return [
      {
        id: 1,
        title: 'Pengaduan Diterima',
        date: complaint.tanggalPenerimaan,
        desc: `Pengaduan tercatat melalui media ${complaint.mediaPengaduan} oleh ${complaint.petugasPenerima}`,
        completed: true,
        active: complaint.status === 'Baru'
      },
      {
        id: 2,
        title: 'Verifikasi Identitas & Kelengkapan',
        date: complaint.auditLogs?.find((l: any) => l.action.includes('Verifikasi'))?.timestamp || complaint.tanggalPenerimaan,
        desc: 'Verifikasi keabsahan NIK dan dokumen bukti pendukung',
        completed: complaint.status !== 'Baru',
        active: complaint.status === 'Diverifikasi'
      },
      {
        id: 3,
        title: 'Penelaahan & Pengklasifikasian',
        date: complaint.telaah?.tanggalTelaah || '-',
        desc: complaint.telaah ? `Klasifikasi: ${complaint.telaah.klasifikasiList.find((k: any) => k.ya)?.klasifikasi || 'Bantuan Sosial'}` : 'Tim penelaah sedang mengkaji materi aduan',
        completed: !!complaint.telaah,
        active: complaint.status === 'Dalam Penelaahan'
      },
      {
        id: 4,
        title: 'Penentuan Kewenangan',
        date: complaint.telaah?.tanggalTelaah || '-',
        desc: `Kewenangan: ${complaint.kewenangan}`,
        completed: !!complaint.telaah,
        active: false
      },
      {
        id: 5,
        title: isDiteruskan ? 'Penyaluran ke Instansi Berwenang' : 'Tindak Lanjut & Penanganan Lapangan',
        date: isDiteruskan ? complaint.penyaluran?.tanggalPenyaluran : (complaint.penyelesaian?.tanggalPenyelesaian || '-'),
        desc: isDiteruskan 
          ? `Disalurkan kepada: ${complaint.penyaluran?.kepada || 'Instansi Terkait'} (Surat No: ${complaint.penyaluran?.nomorSuratPenyaluran || 'Diterbitkan'})`
          : 'Petugas lapangan/pekerja sosial melakukan penanganan teknis',
        completed: isDiteruskan ? !!complaint.penyaluran : (isSelesai || complaint.status === 'Sedang Diproses'),
        active: complaint.status === 'Sedang Diproses' || complaint.status === 'Diteruskan'
      },
      {
        id: 6,
        title: 'Penyelesaian & Hasil Pengaduan',
        date: complaint.penyelesaian?.tanggalPenyelesaian || '-',
        desc: complaint.penyelesaian ? complaint.penyelesaian.hasilPenyelesaian : 'Menunggu hasil penanganan tuntas',
        completed: isSelesai,
        active: isSelesai && !complaint.konfirmasi
      },
      {
        id: 7,
        title: 'Konfirmasi Pengadu & Penutupan Aduan',
        date: complaint.konfirmasi?.tanggalPenyampaianHasil || '-',
        desc: complaint.konfirmasi ? `Konfirmasi: ${complaint.konfirmasi.konfirmasi}` : 'Penyampaian hasil dan konfirmasi warga',
        completed: !!complaint.konfirmasi,
        active: isSelesai && !!complaint.konfirmasi
      }
    ];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
          Portal Pelacakan Pengaduan Publik
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Lacak Perkembangan Pengaduan Anda
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Pantau status penanganan, disposisi tim, dan surat resmi tindak lanjut secara langsung dan transparan.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Pengaduan <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inputNumber}
                  onChange={(e) => setInputNumber(e.target.value)}
                  placeholder="Contoh: PDM/DSKT/2026/000001"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIK atau Nomor HP Pengadu (Opsional)
              </label>
              <input
                type="text"
                value={inputNik}
                onChange={(e) => setInputNik(e.target.value)}
                placeholder="16 digit NIK atau Nomor HP terdaftar"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Cari Status Pengaduan</span>
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Search Result Detail */}
      {searchedComplaint && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 space-y-8 animate-in fade-in duration-300">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Nomor Pengaduan:
                </span>
                <span className="text-base sm:text-lg font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                  {searchedComplaint.nomorPengaduan}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2 leading-snug">
                {searchedComplaint.pokokPengaduan}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Diajukan pada {searchedComplaint.tanggalPenerimaan} WIB via {searchedComplaint.mediaPengaduan}
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <StatusBadge status={searchedComplaint.status} size="lg" />
              <PriorityBadge prioritas={searchedComplaint.prioritas} />
            </div>
          </div>

          {/* Masked Citizen Data Summary (Privacy Compliant) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Nama Pengadu:</span>
              <p className="font-bold text-slate-900">{searchedComplaint.namaPengadu}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">NIK (Dilindungi Privasi):</span>
              <p className="font-mono font-bold text-slate-900">{maskNik(searchedComplaint.nik)}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Penanggung Jawab:</span>
              <p className="font-bold text-slate-900">{searchedComplaint.kewenangan}</p>
            </div>
          </div>

          {/* Interactive Timeline Alur */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-700" />
              Riwayat dan Tahapan Penanganan
            </h4>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {getTimelineSteps(searchedComplaint).map((step) => (
                <div key={step.id} className="relative group">
                  <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    step.completed 
                      ? 'bg-emerald-600 border-white text-white shadow-xs' 
                      : step.active 
                      ? 'bg-amber-500 border-white text-white shadow-sm ring-4 ring-amber-100 animate-pulse'
                      : 'bg-slate-100 border-slate-300 text-slate-400'
                  }`}>
                    {step.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <span className="text-[10px] sm:text-xs font-bold">{step.id}</span>
                    )}
                  </div>

                  <div className={`p-4 rounded-xl border transition-all ${
                    step.active 
                      ? 'bg-amber-50/60 border-amber-200 shadow-xs' 
                      : step.completed 
                      ? 'bg-white border-slate-200 hover:border-slate-300' 
                      : 'bg-slate-50/40 border-dashed border-slate-200 opacity-60'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900">{step.title}</h5>
                      <span className="text-[10px] font-mono text-slate-400">{step.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hasil Penyaluran Jika Non-Dinsos */}
          {searchedComplaint.penyaluran && (
            <div className="bg-sky-50 border border-sky-200 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-sm mb-2">
                <Send className="w-4 h-4 text-sky-700" />
                <span>Pengaduan Diteruskan ke Instansi Berwenang</span>
              </div>
              <p className="text-xs text-sky-800 leading-relaxed mb-3">
                Dinas Sosial Kota Tanjungbalai telah menerbitkan Surat Penyaluran resmi <strong>Nomor {searchedComplaint.penyaluran.nomorSuratPenyaluran}</strong> tertanggal {searchedComplaint.penyaluran.tanggalPenyaluran} kepada <strong>{searchedComplaint.penyaluran.kepada}</strong>.
              </p>
              <div className="bg-white p-3 rounded-xl border border-sky-100 text-xs space-y-1">
                <p><strong>Alasan Penyaluran:</strong> {searchedComplaint.penyaluran.alasanPenyaluran}</p>
                <p><strong>Status Koordinasi:</strong> {searchedComplaint.penyaluran.statusMonitoring || 'Surat telah diterima dan sedang diproses instansi tujuan.'}</p>
              </div>
            </div>
          )}

          {/* Hasil Penyelesaian Nyata */}
          {searchedComplaint.penyelesaian && (
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Hasil Penyelesaian Resmi</span>
              </div>
              <p className="text-xs text-emerald-800 font-semibold mb-1">
                Tindakan Pelaksana: {searchedComplaint.penyelesaian.petugasPelaksana} (Tgl: {searchedComplaint.penyelesaian.tanggalPenyelesaian})
              </p>
              <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-emerald-100 leading-relaxed">
                {searchedComplaint.penyelesaian.hasilPenyelesaian}
              </p>
            </div>
          )}

          {/* Form Konfirmasi Pengadu Jika Sudah Selesai */}
          {searchedComplaint.status.startsWith('Selesai') && !searchedComplaint.konfirmasi && !feedbackSuccess && (
            <div className="bg-amber-50/70 border border-amber-300 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <MessageSquare className="w-4 h-4 text-amber-700" />
                <span>Konfirmasi Penyelesaian dari Anda (Pengadu)</span>
              </div>
              <p className="text-xs text-slate-700">
                Pemerintah Kota Tanjungbalai mengharapkan umpan balik Anda untuk memastikan masalah ini telah diselesaikan dengan memuaskan.
              </p>

              <form onSubmit={handleCitizenConfirm} className="space-y-3">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="feedbackChoice"
                      value="Pengadu menerima hasil penyelesaian"
                      checked={feedbackChoice === 'Pengadu menerima hasil penyelesaian'}
                      onChange={() => setFeedbackChoice('Pengadu menerima hasil penyelesaian')}
                      className="text-emerald-700"
                    />
                    <span>Saya menerima hasil penyelesaian ini dan masalah telah selesai.</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="feedbackChoice"
                      value="Pengadu masih memerlukan tindak lanjut"
                      checked={feedbackChoice === 'Pengadu masih memerlukan tindak lanjut'}
                      onChange={() => setFeedbackChoice('Pengadu masih memerlukan tindak lanjut')}
                      className="text-amber-700"
                    />
                    <span>Saya masih memerlukan tindak lanjut atau penjelasan tambahan.</span>
                  </label>
                </div>

                <textarea
                  rows={2}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tuliskan ulasan atau tanggapan Anda..."
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs"
                />

                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Kirim Tanggapan Konfirmasi
                </button>
              </form>
            </div>
          )}

          {feedbackSuccess && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Terima kasih! Konfirmasi dan tanggapan Anda telah tercatat pada arsip digital pengaduan.</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <span className="text-[11px] text-slate-400">
              ID Pelacakan Digital: {searchedComplaint.id}
            </span>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Lembar Status Pengaduan</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
