import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, PenyaluranTujuanItem } from '../../types';
import { OfficialKop } from '../common/OfficialKop';
import { OFFICIAL_INFO } from '../../data/initialData';
import { 
  Send, 
  FileText, 
  Printer, 
  Save, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Eye, 
  Sparkles,
  Download
} from 'lucide-react';
import { triggerPrint } from '../../utils/printHelper';

interface DistributionFormProps {
  complaint: Complaint;
  onSuccess?: () => void;
}

export const DistributionForm: React.FC<DistributionFormProps> = ({ 
  complaint, 
  onSuccess 
}) => {
  const { distributeComplaint, currentUser } = useApp();

  // Mode: Form edit or Surat Preview
  const [activeView, setActiveView] = useState<'form' | 'surat'>('form');

  const handlePrintLetter = () => {
    if (activeView !== 'surat') {
      setActiveView('surat');
      setTimeout(() => {
        triggerPrint('');
      }, 150);
    } else {
      triggerPrint('');
    }
  };

  // Initial Form Data
  const defaultNomorSurat = complaint.penyaluran?.nomorSuratPenyaluran || `460/${String(Math.floor(Math.random() * 800) + 100).padStart(3, '0')}/DS/2026`;
  const [nomorSurat, setNomorSurat] = useState(defaultNomorSurat);
  const [tanggalPenyaluran, setTanggalPenyaluran] = useState(
    complaint.penyaluran?.tanggalPenyaluran || new Date().toISOString().split('T')[0]
  );
  const [kepada, setKepada] = useState(
    complaint.penyaluran?.kepada || 'Kepala Dinas Kependudukan dan Pencatatan Sipil Kota Tanjungbalai'
  );
  const [ringkasan, setRingkasan] = useState(
    complaint.penyaluran?.ringkasanPengaduan || 
    complaint.telaah?.hasilTelaahAnalisis || 
    `Pengaduan dari sdr/i ${complaint.namaPengadu} terkait ${complaint.pokokPengaduan}. Kronologi: ${complaint.uraianKronologi.substring(0, 200)}...`
  );
  const [alasanPenyaluran, setAlasanPenyaluran] = useState(
    complaint.penyaluran?.alasanPenyaluran || 
    `Materi pengaduan tidak termasuk dalam tugas pokok dan fungsi Dinas Sosial Kota Tanjungbalai, melainkan memerlukan verifikasi teknis dan tindak lanjut oleh instansi tujuan.`
  );

  // Tabel Tujuan Penyaluran (PDF page 5)
  const [tujuanList, setTujuanList] = useState<PenyaluranTujuanItem[]>(
    complaint.penyaluran?.tujuanList || [
      { no: 1, tujuanUnit: kepada, jenisPenyaluran: 'Surat', keterangan: 'Surat dinas resmi pengantar fisik & digital' },
      { no: 2, tujuanUnit: 'Bagian Organisasi Setdakot Tanjungbalai (Layanan SP4N)', jenisPenyaluran: 'Sistem', keterangan: 'Integrasi sistem SP4N-LAPOR' }
    ]
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddTujuan = () => {
    setTujuanList(prev => [
      ...prev,
      {
        no: prev.length + 1,
        tujuanUnit: '',
        jenisPenyaluran: 'Surat',
        keterangan: ''
      }
    ]);
  };

  const handleRemoveTujuan = (idx: number) => {
    setTujuanList(prev => prev.filter((_, i) => i !== idx).map((item, i) => ({ ...item, no: i + 1 })));
  };

  const handleUpdateTujuan = (idx: number, field: keyof PenyaluranTujuanItem, val: any) => {
    setTujuanList(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    distributeComplaint(complaint.id, {
      nomorSuratPenyaluran: nomorSurat,
      tanggalPenyaluran,
      dari: 'Dinas Sosial Kota Tanjungbalai',
      kepada,
      namaPengadu: complaint.namaPengadu,
      pokokPengaduan: complaint.pokokPengaduan,
      hasilPenelaahan: complaint.telaah?.hasilTelaahAnalisis || 'Telah ditelaah oleh Tim Penelaah Dinsos',
      alasanPenyaluran,
      tujuanList,
      statusMonitoring: 'Surat resmi diterbitkan dan siap dikirimkan kepada instansi tujuan.',
      pejabatNama: OFFICIAL_INFO.kadis.nama,
      pejabatNip: OFFICIAL_INFO.kadis.nip
    });

    setSavedSuccess(true);
    setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Toggle Switch between Form & Surat Preview */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between no-print">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveView('form')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'form' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-red-700" />
            <span>Formulir Penyaluran (PDF Hal 5)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('surat')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'surat' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-700" />
            <span>Pratinjau Surat Resmi (PDF Hal 6)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handlePrintLetter}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Surat Resmi</span>
        </button>
      </div>

      {activeView === 'form' ? (
        /* FORMULIR PENYALURAN (PDF Halaman 5) */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl">
          <OfficialKop subTitle="FORMULIR PENYALURAN PENGADUAN" />

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Pengaduan</label>
                <div className="p-2.5 bg-slate-200 font-mono font-bold text-slate-900 rounded-lg">
                  {complaint.nomorPengaduan}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Penyaluran</label>
                <input
                  type="date"
                  value={tanggalPenyaluran}
                  onChange={(e) => setTanggalPenyaluran(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Surat Penyaluran</label>
                <input
                  type="text"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-red-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dari Instansi Pengirim</label>
                <div className="p-2.5 bg-slate-200 font-semibold text-slate-800 rounded-lg">
                  Dinas Sosial Kota Tanjungbalai
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Kepada Yth. (Instansi / Unit Tujuan Berwenang)
                </label>
                <input
                  type="text"
                  value={kepada}
                  onChange={(e) => setKepada(e.target.value)}
                  placeholder="Contoh: Kepala Dinas Kependudukan dan Pencatatan Sipil Kota Tanjungbalai"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>
            </div>

            {/* A. Ringkasan Pengaduan */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b pb-2">
                <span className="w-6 h-6 rounded-md bg-red-700 text-white flex items-center justify-center text-xs">A</span>
                RINGKASAN PENGADUAN
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold">Nama Pengadu:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{complaint.namaPengadu}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Pokok Pengaduan:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{complaint.pokokPengaduan}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ringkasan / Uraian Masalah:
                </label>
                <textarea
                  rows={3}
                  value={ringkasan}
                  onChange={(e) => setRingkasan(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Penyaluran Bukan Kewenangan:
                </label>
                <textarea
                  rows={2}
                  value={alasanPenyaluran}
                  onChange={(e) => setAlasanPenyaluran(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            {/* B. Penyaluran (Tabel) */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b pb-2 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-red-700 text-white flex items-center justify-center text-xs">B</span>
                  TUJUAN PENYALURAN
                </h3>
                <button
                  type="button"
                  onClick={handleAddTujuan}
                  className="px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Tujuan</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b font-bold uppercase">
                      <th className="p-2 w-10 text-center">No.</th>
                      <th className="p-2">Tujuan / Unit Penerima</th>
                      <th className="p-2 w-32">Jenis Penyaluran</th>
                      <th className="p-2">Keterangan</th>
                      <th className="p-2 w-10 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tujuanList.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 text-center font-bold text-slate-400">{item.no}</td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.tujuanUnit}
                            onChange={(e) => handleUpdateTujuan(idx, 'tujuanUnit', e.target.value)}
                            placeholder="Nama instansi/unit..."
                            className="w-full p-1.5 bg-white border border-slate-200 rounded-md text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={item.jenisPenyaluran}
                            onChange={(e) => handleUpdateTujuan(idx, 'jenisPenyaluran', e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold"
                          >
                            <option value="Surat">Surat</option>
                            <option value="Sistem">Sistem</option>
                            <option value="Email">Email</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.keterangan}
                            onChange={(e) => handleUpdateTujuan(idx, 'keterangan', e.target.value)}
                            placeholder="Keterangan..."
                            className="w-full p-1.5 bg-white border border-slate-200 rounded-md text-xs"
                          />
                        </td>
                        <td className="p-2 text-center">
                          {tujuanList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTujuan(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setActiveView('surat')}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Lihat Format Surat Resmi</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{savedSuccess ? 'Tersimpan & Diteruskan!' : 'SIMPAN FORMULIR PENYALURAN'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* C. SURAT PENYALURAN PENGADUAN BUKAN KEWENANGAN (PDF Halaman 6) */
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-slate-200 shadow-2xl print-page">
          <div className="text-center font-bold text-xs text-slate-400 uppercase tracking-widest mb-4 no-print">
            Pratinjau Surat Resmi Pemerintah Kota Tanjungbalai
          </div>

          <OfficialKop />

          {/* Letter Metadata */}
          <div className="mt-8 flex justify-between items-start text-xs font-serif leading-relaxed">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-20 font-semibold">Nomor</span>
                <span>: {nomorSurat}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-semibold">Sifat</span>
                <span>: -</span>
              </div>
              <div className="flex">
                <span className="w-20 font-semibold">Lampiran</span>
                <span>: 1 (satu) berkas</span>
              </div>
              <div className="flex">
                <span className="w-20 font-semibold">Hal</span>
                <span className="font-bold">: Penyaluran Pengaduan Bukan Kewenangan</span>
              </div>
            </div>

            <div className="text-right">
              <p>Tanjungbalai, {new Date(tanggalPenyaluran).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Address / Tujuan */}
          <div className="mt-8 text-xs font-serif leading-relaxed">
            <p>Yth.</p>
            <p className="font-bold text-slate-900">{kepada}</p>
            <p>di Tempat</p>
          </div>

          {/* Body Text Matching PDF Page 6 */}
          <div className="mt-6 text-xs sm:text-sm font-serif leading-relaxed text-justify space-y-4">
            <p className="indent-8">
              Dengan hormat, Sehubungan dengan pengaduan masyarakat yang diterima oleh Dinas Sosial Kota Tanjungbalai dengan Nomor Pengaduan <strong>{complaint.nomorPengaduan}</strong> tanggal {complaint.tanggalPenerimaan.split(' ')[0]} setelah dilakukan penelaahan, materi pengaduan tersebut tidak termasuk kewenangan Dinas Sosial Kota Tanjungbalai dan/atau memerlukan penanganan oleh instansi/unit yang berwenang.
            </p>

            <p className="indent-8">
              Adapun ringkasan pengaduan:
            </p>

            {/* Boxed Ringkasan Sesuai PDF Hal 6 */}
            <div className="border border-slate-950 p-4 sm:p-5 rounded-xs bg-slate-50/30 text-xs sm:text-sm font-serif leading-relaxed">
              <p className="font-bold mb-1">Pokok Pengaduan: {complaint.pokokPengaduan}</p>
              <p className="text-slate-800">{ringkasan}</p>
              <p className="mt-2 text-xs italic text-slate-600">Alasan Penyaluran: {alasanPenyaluran}</p>
            </div>

            <p className="indent-8">
              Bersama ini kami meneruskan/menyalurkan pengaduan dimaksud untuk dapat ditindaklanjuti sesuai tugas dan kewenangan. Mohon agar hasil tindak lanjut dapat diinformasikan kepada pengadu dan/atau Dinas Sosial Kota Tanjungbalai sesuai ketentuan.
            </p>

            <p className="indent-8">
              Demikian disampaikan, atas perhatian dan tindak lanjutnya diucapkan terima kasih.
            </p>
          </div>

          {/* Signature of Kepala Dinas */}
          <div className="mt-12 flex justify-end text-xs font-serif leading-tight">
            <div className="text-center w-72">
              <p className="font-bold uppercase tracking-wider">
                KEPALA DINAS SOSIAL
              </p>
              <p className="font-bold uppercase tracking-wider">
                KOTA TANJUNGBALAI
              </p>

              {/* Digital Stamp & Space for signature */}
              <div className="h-24 flex items-center justify-center relative my-1">
                <div className="w-20 h-20 rounded-full border-2 border-red-600/40 flex items-center justify-center rotate-[-12deg] text-[9px] font-bold text-red-600/60 uppercase text-center p-1">
                  PEMERINTAH KOTA TANJUNGBALAI DINAS SOSIAL
                </div>
              </div>

              <p className="font-bold underline text-sm uppercase">
                {OFFICIAL_INFO.kadis.nama}
              </p>
              <p className="font-mono mt-0.5">
                NIP : {OFFICIAL_INFO.kadis.nip}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-10 pt-6 border-t border-slate-200 flex justify-end gap-3 no-print">
            <button
              type="button"
              onClick={() => setActiveView('form')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Kembali ke Edit Form
            </button>
            <button
              type="button"
              onClick={handlePrintLetter}
              className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF Surat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
