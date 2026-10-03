import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Complaint, AspekTelaahItem, KlasifikasiItem, KewenanganType, PrioritasType } from '../../types';
import { OfficialKop } from '../common/OfficialKop';
import { OFFICIAL_INFO } from '../../data/initialData';
import { 
  Printer, 
  X, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  ShieldCheck, 
  Share2 
} from 'lucide-react';

interface LembarTelaahPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
  currentData?: {
    tanggalTelaah?: string;
    petugasPenelaah?: string;
    nipPenelaah?: string;
    aspekList?: AspekTelaahItem[];
    klasifikasiList?: KlasifikasiItem[];
    klasifikasiLainnya?: string;
    kewenangan?: KewenanganType;
    prioritas?: PrioritasType;
    rekomendasi?: string;
    hasilAnalisis?: string;
  };
}

export const LembarTelaahPrintModal: React.FC<LembarTelaahPrintModalProps> = ({
  isOpen,
  onClose,
  complaint,
  currentData
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Merge saved complaint data with any active real-time edits from the form
  const tanggalTelaah = currentData?.tanggalTelaah || complaint.telaah?.tanggalTelaah || new Date().toISOString().split('T')[0];
  const petugasPenelaah = currentData?.petugasPenelaah || complaint.telaah?.petugasPenelaah || 'Drs. Chairul Anwar, M.Si';
  const nipPenelaah = currentData?.nipPenelaah || complaint.telaah?.nipPenelaah || '19760315 200501 1 008';
  const aspekList = currentData?.aspekList || complaint.telaah?.aspekTelaah || [];
  const klasifikasiList = currentData?.klasifikasiList || complaint.telaah?.klasifikasiList || [];
  const klasifikasiLainnya = currentData?.klasifikasiLainnya || complaint.telaah?.klasifikasiLainnya;
  const kewenangan = currentData?.kewenangan || complaint.telaah?.kewenangan || complaint.kewenangan;
  const prioritas = currentData?.prioritas || complaint.telaah?.prioritas || complaint.prioritas;
  const rekomendasi = currentData?.rekomendasi ?? (complaint.telaah?.rekomendasiTindakLanjut || '-');
  const hasilAnalisis = currentData?.hasilAnalisis ?? (complaint.telaah?.hasilTelaahAnalisis || '-');

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error('Print error:', e);
      alert('Gunakan menu cetak peramban (Ctrl + P) untuk menyimpan sebagai PDF atau mencetak berkas.');
    }
  };

  const handleCopyText = () => {
    const textContent = `
PEMERINTAH KOTA TANJUNGBALAI
DINAS SOSIAL
Jln. Jenderal Sudirman KM. 1,5 Telp. (0623) 92086 - Tanjungbalai 21368
================================================================================
LEMBAR HASIL PENELAAHAN DAN PENGKLASIFIKASIAN PENGADUAN MASYARAKAT
Nomor Pengaduan  : ${complaint.nomorPengaduan}
Tanggal Terima   : ${complaint.tanggalPenerimaan}
Tanggal Telaah   : ${tanggalTelaah}
Media Pengaduan  : ${complaint.mediaPengaduan}
--------------------------------------------------------------------------------
I. IDENTITAS PENGADU & MATERI PENGADUAN
Nama Pengadu     : ${complaint.namaPengadu}
NIK              : ${complaint.nik}
Alamat           : ${complaint.alamat}
No. HP/WA        : ${complaint.nomorTelepon}
Pokok Pengaduan  : ${complaint.pokokPengaduan}
Uraian Aduan     : ${complaint.uraianKronologi}
Permintaan/Harap : ${complaint.permintaanHarapan}

II. PENELAAHAN 6 ASPEK MATERI PENGADUAN
${aspekList.map((a, i) => `${i + 1}. ${a.aspek}: ${a.ya ? 'Ya / Sesuai' : 'Tidak / Tidak Sesuai'} (Catatan: ${a.catatan || '-'})`).join('\n')}

III. KLASIFIKASI PENGADUAN TERPILIH
${klasifikasiList.filter(k => k.ya).map(k => `- ${k.klasifikasi}`).join('\n') || '- Belum dipilih'}

IV. PENENTUAN KEWENANGAN & TINGKAT PRIORITAS
Kewenangan       : ${kewenangan}
Tingkat Prioritas: ${prioritas}

V. HASIL TELAAH / ANALISIS & REKOMENDASI
Hasil Telaah     : ${hasilAnalisis}
Rekomendasi      : ${rekomendasi}

Tanjungbalai, ${tanggalTelaah}
Petugas / Tim Penelaah:
${petugasPenelaah} (NIP. ${nipPenelaah})
`.trim();

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    const textContent = `
LEMBAR HASIL PENELAAHAN DAN PENGKLASIFIKASIAN PENGADUAN
DINAS SOSIAL PEMERINTAH KOTA TANJUNGBALAI
Nomor Pengaduan: ${complaint.nomorPengaduan}
Tanggal Telaah: ${tanggalTelaah}

I. DATA PENGADU
Nama: ${complaint.namaPengadu}
NIK: ${complaint.nik}
Alamat: ${complaint.alamat}
Telepon: ${complaint.nomorTelepon}
Pokok Aduan: ${complaint.pokokPengaduan}

II. HASIL PENELAAHAN 6 ASPEK
${aspekList.map((a, i) => `${i + 1}. ${a.aspek}: ${a.ya ? 'Ya / Sesuai' : 'Tidak / Tidak Sesuai'} | Catatan: ${a.catatan || '-'}`).join('\n')}

III. KLASIFIKASI
${klasifikasiList.filter(k => k.ya).map(k => `* ${k.klasifikasi}`).join('\n')}

IV. KEWENANGAN & PRIORITAS
Kewenangan: ${kewenangan}
Prioritas: ${prioritas}

V. HASIL ANALISIS & REKOMENDASI
Hasil Analisis: ${hasilAnalisis}
Rekomendasi Tindak Lanjut: ${rekomendasi}

Petugas Penelaah: ${petugasPenelaah} (NIP: ${nipPenelaah})
`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lembar_Telaah_${complaint.nomorPengaduan.replace(/\//g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const modalJSX = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto no-print">
      {/* Dark backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4 text-center">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden my-4 text-left flex flex-col max-h-[92vh]">
          {/* Action Header Bar (No Print) */}
          <div className="bg-slate-900 text-white p-3 sm:p-4 sm:px-6 flex flex-wrap items-center justify-between gap-2.5 shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-red-700 text-white rounded-xl shrink-0">
                <FileText className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs sm:text-base text-white truncate">
                  Pratinjau Lembar Hasil Penelaahan & Pengklasifikasian
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                  Nomor Pengaduan: <span className="font-mono text-amber-300 font-bold">{complaint.nomorPengaduan}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 ml-auto">
              <button
                type="button"
                onClick={handleCopyText}
                className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Salin isi lembar telaah"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin Teks'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadDoc}
                className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Unduh Berkas Lembar Telaah"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Unduh .txt</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 sm:px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                title="Cetak Dokumen atau Simpan PDF"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>Cetak / PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Tutup Pratinjau"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Document Body */}
          <div className="p-2 sm:p-6 overflow-y-auto bg-slate-100 flex-1">
            <div className="max-w-3xl mx-auto bg-white p-4 sm:p-10 shadow-lg border border-slate-300 rounded-xl text-slate-900 print-page text-xs leading-relaxed space-y-4 sm:space-y-6">
              
              {/* Official Kop Surat */}
              <OfficialKop subTitle="LEMBAR HASIL PENELAAHAN DAN PENGKLASIFIKASIAN PENGADUAN MASYARAKAT" />

              {/* Document Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px]">
                <div>
                  <span className="text-slate-400 font-semibold block">Nomor Pengaduan:</span>
                  <span className="font-mono font-bold text-slate-900">{complaint.nomorPengaduan}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Tanggal Penerimaan:</span>
                  <span className="font-bold text-slate-800">{complaint.tanggalPenerimaan}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Tanggal Telaah:</span>
                  <span className="font-bold text-red-700">{tanggalTelaah}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Media Pengaduan:</span>
                  <span className="font-bold text-slate-800">{complaint.mediaPengaduan}</span>
                </div>
              </div>

              {/* I. DATA IDENTITAS PENGADU & MATERI PENGADUAN */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-red-700 mb-2">
                  I. Identitas Pengadu & Materi Pokok Pengaduan
                </h4>
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/4 p-2 font-semibold text-slate-600 bg-slate-50">Nama Pengadu</td>
                      <td className="p-2 font-bold text-slate-900">{complaint.namaPengadu}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-semibold text-slate-600 bg-slate-50">NIK Kependudukan</td>
                      <td className="p-2 font-mono font-bold text-slate-900">{complaint.nik}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-semibold text-slate-600 bg-slate-50">Alamat Domisili</td>
                      <td className="p-2 text-slate-800">{complaint.alamat}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-semibold text-slate-600 bg-slate-50">Telepon / WhatsApp</td>
                      <td className="p-2 text-slate-800">{complaint.nomorTelepon}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-semibold text-slate-600 bg-slate-50">Pokok Pengaduan</td>
                      <td className="p-2 font-bold text-slate-900">{complaint.pokokPengaduan}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-semibold text-slate-600 bg-slate-50">Uraian / Kronologi</td>
                      <td className="p-2 text-slate-800 whitespace-pre-line">{complaint.uraianKronologi}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-slate-600 bg-slate-50">Harapan Pengadu</td>
                      <td className="p-2 text-slate-800 italic">{complaint.permintaanHarapan}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* II. PENELAAHAN 6 ASPEK MATERI PENGADUAN */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-red-700 mb-2">
                  II. Hasil Penelaahan 6 (Enam) Aspek Materi Pengaduan
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead className="bg-slate-100 text-slate-800 border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                        <th className="p-2 border-r border-slate-300 w-1/3">Aspek Penelaahan</th>
                        <th className="p-2 border-r border-slate-300 w-36 text-center">Hasil Telaah</th>
                        <th className="p-2">Keterangan / Catatan Penelaahan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aspekList.map((a, i) => (
                        <tr key={a.no} className="border-b border-slate-200">
                          <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-600">
                            {i + 1}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">
                            {a.aspek}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-bold">
                            <span className={`inline-block px-2.5 py-0.5 rounded-sm text-[10px] font-bold ${
                              a.ya ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {a.ya ? '[✓] Ya / Sesuai' : '[✓] Tidak Sesuai'}
                            </span>
                          </td>
                          <td className="p-2 text-slate-700">
                            {a.catatan || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* III. PENGKLASIFIKASIAN 10 KATEGORI */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-red-700 mb-2">
                  III. Pengklasifikasian Pengaduan (10 Kategori Resmi)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {klasifikasiList.map((k) => (
                    <div 
                      key={k.no} 
                      className={`p-2 rounded-lg border flex items-center gap-2 ${
                        k.ya ? 'bg-amber-50 border-amber-300 font-bold text-amber-950' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-xs border flex items-center justify-center shrink-0 ${
                        k.ya ? 'bg-amber-600 border-amber-700 text-white font-bold text-[10px]' : 'border-slate-300'
                      }`}>
                        {k.ya ? '✓' : ''}
                      </div>
                      <span className="text-xs">
                        {k.no}. {k.klasifikasi}
                        {k.no === 10 && k.ya && klasifikasiLainnya && (
                          <span className="block text-[11px] font-normal text-slate-700 mt-0.5 italic">
                            ({klasifikasiLainnya})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* IV. PENENTUAN KEWENANGAN & TINGKAT PRIORITAS */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-red-700 mb-2">
                  IV. Penentuan Kewenangan & Tingkat Prioritas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                    <span className="font-semibold text-slate-500 block text-[11px]">Kewenangan Penanganan:</span>
                    <p className="font-bold text-xs text-slate-900 mt-1">
                      {kewenangan}
                    </p>
                    {kewenangan !== 'Dinas Sosial Kota Tanjungbalai' && (
                      <p className="text-[10px] text-amber-800 mt-1 font-medium">
                        *Direkomendasikan untuk diteruskan ke instansi terkait melalui Surat Penyaluran Resmi.
                      </p>
                    )}
                  </div>

                  <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                    <span className="font-semibold text-slate-500 block text-[11px]">Tingkat Prioritas Tindak Lanjut:</span>
                    <div className="mt-1">
                      <span className={`inline-block px-3 py-1 rounded-full font-bold text-[11px] ${
                        prioritas === 'Mendesak'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : prioritas === 'Penting'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        Prioritas {prioritas}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* V. ANALISIS & REKOMENDASI TINDAK LANJUT */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-red-700 mb-2">
                  V. Hasil Analisis / Telaah & Rekomendasi Tindak Lanjut
                </h4>

                <div className="border border-slate-200 rounded-xl p-3 bg-white">
                  <span className="font-bold text-slate-700 block mb-1">Hasil Telaah / Catatan Analisis Fakta:</span>
                  <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                    {hasilAnalisis}
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-white">
                  <span className="font-bold text-slate-700 block mb-1">Rekomendasi Tindak Lanjut Petugas:</span>
                  <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                    {rekomendasi}
                  </p>
                </div>
              </div>

              {/* VI. KOLOM TANDA TANGAN RESMI */}
              <div className="pt-6 border-t-2 border-slate-300 flex justify-between items-start text-xs">
                <div className="text-center w-64">
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-bold text-slate-900">Kepala Dinas Sosial</p>
                  <p className="font-bold text-slate-900">Kota Tanjungbalai</p>
                  <div className="h-16 flex items-center justify-center font-serif italic text-slate-800 font-bold text-sm">
                    ({OFFICIAL_INFO.kadis.nama})
                  </div>
                  <p className="font-mono text-slate-700 font-semibold">
                    NIP. {OFFICIAL_INFO.kadis.nip}
                  </p>
                </div>

                <div className="text-center w-64">
                  <p className="text-slate-600">Tanjungbalai, {tanggalTelaah}</p>
                  <p className="font-bold text-slate-900">Petugas / Tim Penelaah,</p>
                  <p className="text-[11px] text-slate-500">Dinas Sosial Kota Tanjungbalai</p>
                  <div className="h-16 flex items-center justify-center font-serif italic text-slate-800 font-bold text-sm">
                    ({petugasPenelaah})
                  </div>
                  <p className="font-mono text-slate-700 font-semibold">
                    NIP. {nipPenelaah}
                  </p>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-3 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
                <span>SIPMAS - Dinas Sosial Pemerintah Kota Tanjungbalai</span>
                <span>Dokumen Resmi Administrasi Penanganan Pengaduan Masyarakat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
};
