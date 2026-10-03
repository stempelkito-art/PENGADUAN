import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OfficialKop } from '../common/OfficialKop';
import { MediaPengaduan, StatusHubungan, DokumenPendukungItem } from '../../types';
import { DEFAULT_DOKUMEN_CHECKLIST } from '../../data/initialData';
import { 
  CheckCircle, 
  Upload, 
  FileText, 
  Send, 
  Printer, 
  AlertCircle, 
  ShieldCheck, 
  Copy,
  PenTool,
  RotateCcw
} from 'lucide-react';

interface CreateComplaintFormProps {
  onSuccessTrack?: (complaintId: string) => void;
}

export const CreateComplaintForm: React.FC<CreateComplaintFormProps> = ({ onSuccessTrack }) => {
  const { createComplaint, currentUser } = useApp();

  const isOfficer = currentUser.role !== 'MASYARAKAT';

  // Form State
  const [mediaPengaduan, setMediaPengaduan] = useState<MediaPengaduan>(isOfficer ? 'Tatap Muka' : 'Website');
  const [mediaLainnya, setMediaLainnya] = useState('');
  const [petugasPenerima, setPetugasPenerima] = useState(isOfficer ? currentUser.nama : 'Aisyah Putri, S.Sos (Front Office)');

  // A. Identitas
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nik, setNik] = useState('');
  const [alamat, setAlamat] = useState('');
  const [nomorTelepon, setNomorTelepon] = useState('');
  const [email, setEmail] = useState('');
  const [statusHubungan, setStatusHubungan] = useState<StatusHubungan>('Diri sendiri');
  const [statusHubunganLainnya, setStatusHubunganLainnya] = useState('');

  // B. Uraian
  const [pokokPengaduan, setPokokPengaduan] = useState('');
  const [uraianKronologi, setUraianKronologi] = useState('');
  const [permintaanHarapan, setPermintaanHarapan] = useState('');

  // C. Dokumen Pendukung
  const [dokumenList, setDokumenList] = useState<DokumenPendukungItem[]>(DEFAULT_DOKUMEN_CHECKLIST);
  const [catatanPetugas, setCatatanPetugas] = useState('');

  // Tanda Tangan
  const [ttdPengaduNama, setTtdPengaduNama] = useState('');
  const [ttdAgreement, setTtdAgreement] = useState(false);

  // Success State
  const [submittedComplaint, setSubmittedComplaint] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDocToggle = (index: number, ada: boolean) => {
    setDokumenList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ada };
      return copy;
    });
  };

  const handleDocKeterangan = (index: number, keterangan: string) => {
    setDokumenList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], keterangan };
      return copy;
    });
  };

  const handleDocFileSimulate = (index: number, fileName: string) => {
    setDokumenList(prev => {
      const copy = [...prev];
      copy[index] = { 
        ...copy[index], 
        ada: true, 
        fileName, 
        fileSize: '1.2 MB', 
        uploadDate: new Date().toISOString().split('T')[0] 
      };
      return copy;
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!namaLengkap.trim()) errs.namaLengkap = 'Nama lengkap pengadu wajib diisi';
    if (!nik.trim() || nik.length < 16) errs.nik = 'NIK wajib 16 digit angka';
    if (!alamat.trim()) errs.alamat = 'Alamat pengadu di Kota Tanjungbalai wajib diisi';
    if (!nomorTelepon.trim()) errs.nomorTelepon = 'Nomor telepon/WhatsApp wajib diisi';
    if (!pokokPengaduan.trim()) errs.pokokPengaduan = 'Pokok pengaduan wajib diisi';
    if (!uraianKronologi.trim()) errs.uraianKronologi = 'Uraian/kronologi pengaduan wajib diisi';
    if (!permintaanHarapan.trim()) errs.permintaanHarapan = 'Permintaan/harapan pengadu wajib diisi';
    if (!ttdAgreement) errs.ttdAgreement = 'Harap centang pernyataan persetujuan dan kebenaran data';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    const newComp = createComplaint({
      mediaPengaduan,
      mediaLainnya: mediaPengaduan === 'Lainnya' ? mediaLainnya : undefined,
      petugasPenerima,
      namaPengadu: namaLengkap,
      nik,
      alamat,
      nomorTelepon,
      email,
      statusHubungan,
      statusHubunganLainnya: statusHubungan === 'Lainnya' ? statusHubunganLainnya : undefined,
      pokokPengaduan,
      uraianKronologi,
      permintaanHarapan,
      dokumenPendukung: dokumenList,
      catatanPetugasPenerima: catatanPetugas,
      ttdPengadu: ttdPengaduNama || namaLengkap,
      ttdPetugasPenerima: petugasPenerima,
      prioritas: 'Biasa',
    });

    setSubmittedComplaint(newComp);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const copyNomor = () => {
    if (submittedComplaint) {
      navigator.clipboard.writeText(submittedComplaint.nomorPengaduan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (submittedComplaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-emerald-200 text-center relative overflow-hidden">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Pengaduan Berhasil Terdaftar
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            Tanda Terima Pengaduan Masyarakat
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Pengaduan Anda telah tercatat secara resmi di database Dinas Sosial Kota Tanjungbalai.
          </p>

          {/* Unique Number Card */}
          <div className="my-6 p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-inner">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              Nomor Pengaduan Unik Anda
            </p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-xl sm:text-3xl font-mono font-black text-white tracking-wider">
                {submittedComplaint.nomorPengaduan}
              </span>
              <button
                onClick={copyNomor}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1 transition-colors"
                title="Salin Nomor Pengaduan"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Simpan nomor ini untuk melacak perkembangan status penanganan pengaduan Anda sewaktu-waktu.
            </p>
          </div>

          <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 mb-6">
            <div className="flex justify-between border-b pb-1">
              <span className="text-slate-500 font-medium">Nama Pengadu:</span>
              <span className="font-bold text-slate-900">{submittedComplaint.namaPengadu}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-slate-500 font-medium">Pokok Pengaduan:</span>
              <span className="font-bold text-slate-900 truncate max-w-xs">{submittedComplaint.pokokPengaduan}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-slate-500 font-medium">Waktu Penerimaan:</span>
              <span className="font-bold text-slate-900">{submittedComplaint.tanggalPenerimaan} WIB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Petugas Penerima:</span>
              <span className="font-bold text-slate-900">{submittedComplaint.petugasPenerima}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Bukti Resi Tanda Terima</span>
            </button>

            {onSuccessTrack && (
              <button
                onClick={() => onSuccessTrack(submittedComplaint.id)}
                className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Buka Pelacakan Pengaduan</span>
              </button>
            )}

            <button
              onClick={() => {
                setSubmittedComplaint(null);
                setPokokPengaduan('');
                setUraianKronologi('');
                setPermintaanHarapan('');
                setNamaLengkap('');
                setNik('');
                setAlamat('');
                setNomorTelepon('');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Buat Pengaduan Lain</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Official Form Sheet Paper */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200">
        <OfficialKop subTitle="FORMULIR PENERIMAAN PENGADUAN" />

        <p className="text-xs text-slate-500 text-center mt-2 max-w-xl mx-auto">
          Berdasarkan format administrasi resmi Dinas Sosial Kota Tanjungbalai. Isilah data identitas, materi pengaduan, dan berkas pendukung secara lengkap dan benar.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Header Metadata Block */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-red-700" />
              Informasi Penerimaan Pengaduan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Pengaduan
                </label>
                <div className="px-3.5 py-2.5 bg-slate-200/80 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-600">
                  [Dibuat Otomatis oleh Sistem: PDM/DSKT/2026/XXXXXX]
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal & Waktu Penerimaan
                </label>
                <div className="px-3.5 py-2.5 bg-slate-200/80 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (Otomatis)
                </div>
              </div>

              {/* Media Pengaduan */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Media Pengaduan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {(['Tatap Muka', 'Surat', 'Telepon', 'WhatsApp', 'Email', 'Website', 'Lainnya'] as MediaPengaduan[]).map(m => (
                    <label key={m} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      mediaPengaduan === m ? 'bg-red-50 border-red-300 font-bold text-red-800' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      <input 
                        type="radio" 
                        name="mediaPengaduan" 
                        value={m}
                        checked={mediaPengaduan === m}
                        onChange={() => setMediaPengaduan(m)}
                        className="text-red-700 focus:ring-red-600"
                      />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
                {mediaPengaduan === 'Lainnya' && (
                  <input
                    type="text"
                    value={mediaLainnya}
                    onChange={(e) => setMediaLainnya(e.target.value)}
                    placeholder="Sebutkan media pengaduan lainnya..."
                    className="mt-2 w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                )}
              </div>

              {/* Petugas Penerima */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Petugas Penerima
                </label>
                <input
                  type="text"
                  value={petugasPenerima}
                  onChange={(e) => setPetugasPenerima(e.target.value)}
                  readOnly={!isOfficer}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>
          </div>

          {/* Bagian A. IDENTITAS PENGADU */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
            <div className="border-b border-slate-200 pb-2 mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-red-700 text-white flex items-center justify-center text-xs">A</span>
                IDENTITAS PENGADU
              </h3>
              <span className="text-[11px] text-slate-500">*Wajib diisi sesuai KTP</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Contoh: Hj. Rohana Siagian"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600 ${
                    errors.namaLengkap ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {errors.namaLengkap && <p className="text-[11px] text-rose-600 mt-1">{errors.namaLengkap}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Induk Kependudukan (NIK) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="16 digit NIK Kota Tanjungbalai"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600 ${
                    errors.nik ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                <span className="text-[10px] text-slate-400">Data NIK dijaga kerahasiaannya sesuai regulasi privasi.</span>
                {errors.nik && <p className="text-[11px] text-rose-600 mt-0.5">{errors.nik}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Domisili Lengkap <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={2}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Contoh: Jl. D.I. Panjaitan LK. III, Kel. Pasar Baru, Kec. Tanjungbalai Selatan"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600 ${
                    errors.alamat ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {errors.alamat && <p className="text-[11px] text-rose-600 mt-1">{errors.alamat}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor HP / WhatsApp Aktif <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  value={nomorTelepon}
                  onChange={(e) => setNomorTelepon(e.target.value)}
                  placeholder="Contoh: 081263458921"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600 ${
                    errors.nomorTelepon ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {errors.nomorTelepon && <p className="text-[11px] text-rose-600 mt-1">{errors.nomorTelepon}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email <span className="text-slate-400 font-normal text-[11px]">(Tidak Wajib Diisi / Boleh Dikosongkan)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Boleh dikosongkan (opsional)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600"
                />
                <span className="text-[10px] text-slate-400">Tidak wajib. Konfirmasi dan nomor pengaduan tetap tersimpan dan dapat dilacak kapan saja.</span>
              </div>

              {/* Status/Hubungan dengan Permasalahan */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status / Hubungan dengan Permasalahan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {(['Diri sendiri', 'Keluarga', 'Masyarakat', 'Lembaga', 'Lainnya'] as StatusHubungan[]).map(sh => (
                    <label key={sh} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      statusHubungan === sh ? 'bg-red-50 border-red-300 font-bold text-red-800' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      <input 
                        type="radio" 
                        name="statusHubungan" 
                        value={sh}
                        checked={statusHubungan === sh}
                        onChange={() => setStatusHubungan(sh)}
                        className="text-red-700 focus:ring-red-600"
                      />
                      <span>{sh}</span>
                    </label>
                  ))}
                </div>
                {statusHubungan === 'Lainnya' && (
                  <input
                    type="text"
                    value={statusHubunganLainnya}
                    onChange={(e) => setStatusHubunganLainnya(e.target.value)}
                    placeholder="Sebutkan hubungan dengan pengaduan..."
                    className="mt-2 w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Bagian B. URAIAN PENGADUAN */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
            <div className="border-b border-slate-200 pb-2 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-red-700 text-white flex items-center justify-center text-xs">B</span>
                URAIAN PENGADUAN
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pokok Pengaduan (Inti Masalah) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={pokokPengaduan}
                  onChange={(e) => setPokokPengaduan(e.target.value)}
                  placeholder="Contoh: Bantuan PKH Komponen Lansia Belum Cair Pada Rekening KKS Bank BRI"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600 ${
                    errors.pokokPengaduan ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {errors.pokokPengaduan && <p className="text-[11px] text-rose-600 mt-1">{errors.pokokPengaduan}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uraian / Kronologi Permasalahan <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={uraianKronologi}
                  onChange={(e) => setUraianKronologi(e.target.value)}
                  placeholder="Ceritakan urutan kejadian secara jelas: kapan terjadi, di mana, siapa yang terlibat, dan kendala apa yang dialami..."
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600 ${
                    errors.uraianKronologi ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {errors.uraianKronologi && <p className="text-[11px] text-rose-600 mt-1">{errors.uraianKronologi}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Permintaan / Harapan Pengadu <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={2}
                  value={permintaanHarapan}
                  onChange={(e) => setPermintaanHarapan(e.target.value)}
                  placeholder="Contoh: Memohon pengecekan data di aplikasi SIKS-NG dan bantuan pencairan dana bansos lansia kembali..."
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600 ${
                    errors.permintaanHarapan ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {errors.permintaanHarapan && <p className="text-[11px] text-rose-600 mt-1">{errors.permintaanHarapan}</p>}
              </div>
            </div>
          </div>

          {/* Bagian C. DOKUMEN / BUKTI PENDUKUNG */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
            <div className="border-b border-slate-200 pb-2 mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-red-700 text-white flex items-center justify-center text-xs">C</span>
                DOKUMEN / BUKTI PENDUKUNG
              </h3>
              <span className="text-[11px] text-slate-500">Sesuai Checklist Administrasi Dinsos</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase">
                    <th className="py-2.5 px-3 w-10 text-center">No.</th>
                    <th className="py-2.5 px-3">Uraian Dokumen</th>
                    <th className="py-2.5 px-3 text-center w-24">Ada / Tidak</th>
                    <th className="py-2.5 px-3">Keterangan Dokumen</th>
                    <th className="py-2.5 px-3 w-40 text-center">Unggah Berkas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dokumenList.map((doc, idx) => (
                    <tr key={doc.no} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500">{doc.no}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{doc.uraian}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                          <button
                            type="button"
                            onClick={() => handleDocToggle(idx, true)}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              doc.ada ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Ada
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDocToggle(idx, false)}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              !doc.ada ? 'bg-slate-300 text-slate-800' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Tidak
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={doc.keterangan}
                          onChange={(e) => handleDocKeterangan(idx, e.target.value)}
                          placeholder="Keterangan berkas / nomor surat..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {doc.fileName ? (
                          <div className="text-[11px] text-emerald-700 font-medium truncate max-w-[140px] mx-auto bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            ✓ {doc.fileName}
                          </div>
                        ) : (
                          <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition-colors">
                            <Upload className="w-3 h-3" />
                            <span>Pilih File</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleDocFileSimulate(idx, file.name);
                                }
                              }}
                            />
                          </label>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Catatan Petugas */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Petugas Penerima:
              </label>
              <textarea
                rows={2}
                value={catatanPetugas}
                onChange={(e) => setCatatanPetugas(e.target.value)}
                placeholder="Catatan verifikasi fisik atau catatan tambahan petugas loket..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Tanda Tangan & Persetujuan */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
              <PenTool className="w-4 h-4 text-red-700" />
              Pernyataan dan Tanda Tangan Digital Pengadu
            </h4>

            <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={ttdAgreement}
                onChange={(e) => setTtdAgreement(e.target.checked)}
                className="mt-0.5 text-red-700 focus:ring-red-600 rounded-sm"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                Saya menyatakan dengan sebenarnya bahwa data identitas dan materi pengaduan yang saya sampaikan di atas adalah benar, tanpa rekayasa, dan saya bersedia mempertanggungjawabkannya sesuai ketentuan hukum yang berlaku di Negara Kesatuan Republik Indonesia.
              </span>
            </label>
            {errors.ttdAgreement && (
              <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.ttdAgreement}</p>
            )}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Penanda Tangan Pengadu
                </label>
                <input
                  type="text"
                  value={ttdPengaduNama || namaLengkap}
                  onChange={(e) => setTtdPengaduNama(e.target.value)}
                  placeholder="Ketik nama lengkap Anda sebagai tanda tangan"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-serif font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400">Tanda tangan elektronik sah terverifikasi dengan nama di atas.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Petugas Penerima Loket Dinsos
                </label>
                <div className="px-3.5 py-2 bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 font-serif">
                  {petugasPenerima}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-red-700 hover:bg-red-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-all group"
            >
              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span>KIRIM PENGADUAN RESMI</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
