import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TanjungbalaiLogo } from '../common/OfficialKop';
import { OFFICIAL_INFO } from '../../data/initialData';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  Clock, 
  Send, 
  Shield, 
  ArrowRight, 
  HeartHandshake, 
  HelpCircle, 
  Layers,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export const HomeSection: React.FC = () => {
  const { complaints, setPublicActiveTab, setSelectedComplaintId } = useApp();
  const [quickTrackingNumber, setQuickTrackingNumber] = useState('');
  const [trackingError, setTrackingError] = useState('');

  // Statistics Calculation
  const totalMasuk = complaints.length;
  const sedangDiproses = complaints.filter(c => 
    c.status === 'Sedang Diproses' || 
    c.status === 'Dalam Penelaahan' || 
    c.status === 'Diverifikasi' ||
    c.status === 'Menunggu Data' ||
    c.status === 'Menunggu Koordinasi'
  ).length;
  const selesai = complaints.filter(c => c.status.startsWith('Selesai')).length;
  const diteruskan = complaints.filter(c => c.status === 'Diteruskan').length;

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackingNumber.trim()) {
      setTrackingError('Masukkan nomor pengaduan terlebih dahulu');
      return;
    }

    const cleanInput = quickTrackingNumber.trim().toUpperCase();
    const found = complaints.find(c => 
      c.nomorPengaduan.toUpperCase() === cleanInput ||
      c.nomorPengaduan.toUpperCase().includes(cleanInput) ||
      c.nik === cleanInput ||
      c.nomorTelepon === cleanInput
    );

    if (found) {
      setSelectedComplaintId(found.id);
      setPublicActiveTab('lacak-pengaduan');
    } else {
      setTrackingError(`Pengaduan dengan nomor/NIK "${quickTrackingNumber}" tidak ditemukan.`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-red-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 shadow-xl">
        {/* Decorative background grid and blurs */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-800/60 border border-red-700/60 text-xs text-amber-200 mb-6 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Pelayanan Pengaduan Responsif, Akuntabel & Bebas Pungutan Biaya
          </div>

          <div className="flex justify-center mb-5">
            <TanjungbalaiLogo className="w-20 h-26 drop-shadow-2xl" />
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
            SISTEM INFORMASI PENGADUAN MASYARAKAT
          </h1>
          <p className="mt-2 text-lg sm:text-2xl font-bold text-amber-400 font-sans tracking-wide">
            DINAS SOSIAL KOTA TANJUNGBALAI
          </p>

          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Sarana resmi bagi masyarakat Kota Tanjungbalai untuk menyampaikan pengaduan, permohonan bantuan sosial, layanan kedukaan/mobil jenazah, dan perlindungan sosial. Diproses secara transparan dari penerimaan hingga selesai.
          </p>

          {/* Main Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setPublicActiveTab('buat-pengaduan')}
              className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2 group"
            >
              <FileText className="w-5 h-5 group-hover:rotate-6 transition-transform" />
              <span>BUAT PENGADUAN</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setPublicActiveTab('lacak-pengaduan')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 active:scale-98 text-white font-bold text-sm sm:text-base rounded-xl border border-white/20 backdrop-blur-xs transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5 text-amber-400" />
              <span>LACAK PENGADUAN</span>
            </button>
          </div>

          {/* Quick Tracking Search Box */}
          <div className="mt-10 max-w-xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl">
            <form onSubmit={handleQuickTrack} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={quickTrackingNumber}
                  onChange={(e) => {
                    setQuickTrackingNumber(e.target.value);
                    setTrackingError('');
                  }}
                  placeholder="Ketik Nomor Pengaduan (contoh: PDM/DSKT/2026/000001) atau NIK..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors whitespace-nowrap shadow-sm"
              >
                Cek Status
              </button>
            </form>
            {trackingError && (
              <p className="text-xs text-rose-300 font-medium mt-2 text-left px-2">
                {trackingError}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Floating Statistics Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:-mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {/* Masuk */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Pengaduan Masuk</p>
              <h3 className="text-xl sm:text-3xl font-black text-slate-900">{totalMasuk}</h3>
              <p className="text-[10px] sm:text-[11px] text-blue-600 font-medium truncate">Terdaftar di sistem</p>
            </div>
          </div>

          {/* Sedang Diproses */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Sedang Diproses</p>
              <h3 className="text-xl sm:text-3xl font-black text-slate-900">{sedangDiproses}</h3>
              <p className="text-[10px] sm:text-[11px] text-purple-600 font-medium truncate">Telaah & tindak lanjut</p>
            </div>
          </div>

          {/* Selesai */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Selesai</p>
              <h3 className="text-xl sm:text-3xl font-black text-slate-900">{selesai}</h3>
              <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium truncate">Tuntas & konfirmasi</p>
            </div>
          </div>

          {/* Diteruskan */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Diteruskan</p>
              <h3 className="text-xl sm:text-3xl font-black text-slate-900">{diteruskan}</h3>
              <p className="text-[10px] sm:text-[11px] text-sky-600 font-medium truncate">Instansi berwenang</p>
            </div>
          </div>
        </div>
      </section>

      {/* Alur Sistem Transparan */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Transparansi Alur Layanan
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Bagaimana Pengaduan Anda Diproses?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Setiap pengaduan melalui alur terstandarisasi sesuai Keputusan Kepala Dinas Sosial Kota Tanjungbalai untuk menjamin kepastian hukum dan tindak lanjut nyata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Alur Jika Kewenangan Dinsos */}
          <div className="bg-gradient-to-br from-blue-50/60 to-white p-6 rounded-2xl border border-blue-200 shadow-sm relative">
            <div className="flex items-center gap-2 mb-4 text-blue-900">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base sm:text-lg">
                Jika Kewenangan Dinas Sosial Kota Tanjungbalai
              </h3>
            </div>
            <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
              {[
                { title: 'Pengaduan Masuk & Penerimaan', desc: 'Sistem menerbitkan Nomor Pengaduan unik otomatis (PDM/DSKT/2026/XXXXXX).' },
                { title: 'Verifikasi Identitas & Kelengkapan', desc: 'Pengecekan NIK pengadu, alamat domisili, dan dokumen pendukung.' },
                { title: 'Penelaahan & Pengklasifikasian', desc: 'Tim Penelaah menelaah materi aduan, mencocokkan dengan 10 klasifikasi resmi.' },
                { title: 'Ditindaklanjuti oleh Unit/Petugas', desc: 'Verifikasi lapangan, asesmen pekerja sosial, sinkronisasi data SIKS-NG/bantuan.' },
                { title: 'Penyelesaian & Bukti Nyata', desc: 'Penyaluran bantuan, asistensi rehabilitasi, atau perbaikan adminduk sosial.' },
                { title: 'Konfirmasi kepada Pengadu & Selesai', desc: 'Penyampaian hasil resmi kepada warga dan penandatanganan berita acara.' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 relative pl-1">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 z-10">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{step.title}</h4>
                    <p className="text-xs text-slate-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Alur Jika Bukan Kewenangan Dinsos */}
          <div className="bg-gradient-to-br from-amber-50/60 to-white p-6 rounded-2xl border border-amber-200 shadow-sm relative">
            <div className="flex items-center gap-2 mb-4 text-amber-900">
              <div className="p-2 bg-amber-600 text-white rounded-lg">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base sm:text-lg">
                Jika Bukan Kewenangan Dinas Sosial (Penyaluran)
              </h3>
            </div>
            <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-200">
              {[
                { title: 'Penelaahan Menemukan Bukan Kewenangan', desc: 'Pengaduan seperti NIK ganda di Dukcapil, sengketa lahan, atau bantuan provinsi.' },
                { title: 'Penerbitan Surat Penyaluran Otomatis', desc: 'Kepala Dinas menandatangani Surat Penyaluran resmi Nomor 460/.../DS/2026.' },
                { title: 'Penyaluran ke Instansi / Unit Berwenang', desc: 'Disampaikan resmi ke Disdukcapil, Dinkes, atau instansi terkait di Tanjungbalai.' },
                { title: 'Monitoring Tindak Lanjut', desc: 'Petugas Dinsos memantau perkembangan penanganan di instansi tujuan.' },
                { title: 'Hasil Disampaikan kepada Pengadu', desc: 'Pengadu menerima nomor surat penyaluran dan perkembangan penanganannya.' },
                { title: 'Selesai & Diarsipkan Digital', desc: 'Dokumen tersimpan permanen dalam arsip digital pengaduan.' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 relative pl-1">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0 z-10">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{step.title}</h4>
                    <p className="text-xs text-slate-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10 Klasifikasi Layanan Sosial */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                Lingkup Pengaduan Resmi
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">
                10 Kategori Pengaduan Dinas Sosial Kota Tanjungbalai
              </h3>
            </div>
            <button
              onClick={() => setPublicActiveTab('buat-pengaduan')}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors shrink-0"
            >
              Laporkan Masalah Sekarang
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { no: 1, title: 'Data Bantuan Sosial / DTSEN', desc: 'Pemutakhiran data, verifikasi desil kemiskinan, anomali data.' },
              { no: 2, title: 'PKH / Program Sembako', desc: 'Kendala saldo KKS, belum menerima beras bansos, kepesertaan bansos.' },
              { no: 3, title: 'PBI JKN / Jaminan Sosial', desc: 'Kartu BPJS Kesehatan gratis APBD/APBN non-aktif atau belum terdaftar.' },
              { no: 4, title: 'Rehabilitasi Disabilitas & Lansia', desc: 'Permohonan kursi roda, tongkat adaptif, lansia terlantar sebatang kara.' },
              { no: 5, title: 'Perlindungan & Kebencanaan', desc: 'Bantuan darurat korban kebakaran rumah, banjir rob, dan santunan musibah.' },
              { no: 6, title: 'Lembaga Kesejahteraan Sosial (LKS)', desc: 'Izin operasional panti asuhan, aduan pengelolaan bantuan lembaga sosial.' },
              { no: 7, title: 'Pelayanan Mobil Jenazah Gratis', desc: 'Bantuan mobil pengantar jenazah bagi warga prasejahtera ke TPU.' },
              { no: 8, title: 'Pengaduan Pelayanan Publik', desc: 'Aduan terhadap keramahan, kecepatan, dan integritas loket pelayanan.' },
              { no: 9, title: 'Verifikasi Data Kependudukan', desc: 'Kendala NIK tidak sinkron yang memerlukan rekomendasi/penyaluran.' },
              { no: 10, title: 'Lainnya / Masalah Kesejahteraan Sosial', desc: 'Pemerlu Pelayanan Kesejahteraan Sosial (PPKS) lainnya di Tanjungbalai.' },
            ].map(item => (
              <div 
                key={item.no} 
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 p-4 rounded-xl transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                    {item.no}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-100">{item.title}</h4>
                </div>
                <p className="text-[11px] text-slate-400 pl-7">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profil Kepala Dinas & Komitmen Pelayanan */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-red-800 to-amber-700 text-white flex flex-col items-center justify-center shrink-0 shadow-lg text-center p-2">
            <TanjungbalaiLogo className="w-12 h-14" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block px-2.5 py-0.5 bg-red-100 text-red-800 text-[11px] font-bold rounded-md mb-1">
              Komitmen Integritas Pimpinan
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {OFFICIAL_INFO.kadis.nama}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              NIP: {OFFICIAL_INFO.kadis.nip} • {OFFICIAL_INFO.kadis.jabatan}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 italic mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              "Kami berkomitmen menelaah setiap keluhan dan permohonan warga Kota Tanjungbalai secara cermat, cepat, dan adil. Tidak ada pengaduan yang diabaikan. Jika merupakan kewenangan kami, segera kami selesaikan; jika kewenangan instansi lain, resmi kami salurkan dan monitor hingga selesai."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
