import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint } from '../../types';
import { OfficialKop } from '../common/OfficialKop';
import { 
  CheckCircle2, 
  Save, 
  Printer, 
  Upload, 
  FileText, 
  Send, 
  UserCheck, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface ResolutionFormProps {
  complaint: Complaint;
  onSuccess?: () => void;
}

export const ResolutionForm: React.FC<ResolutionFormProps> = ({ 
  complaint, 
  onSuccess 
}) => {
  const { resolveComplaint, confirmComplaint, currentUser } = useApp();

  // B. Tindakan Penyelesaian
  const [tanggalPenyelesaian, setTanggalPenyelesaian] = useState(
    complaint.penyelesaian?.tanggalPenyelesaian || new Date().toISOString().replace('T', ' ').substring(0, 16)
  );
  const [petugasPelaksana, setPetugasPelaksana] = useState(
    complaint.penyelesaian?.petugasPelaksana || currentUser.nama || 'Bambang Setiawan, S.STP'
  );
  const [nipPelaksana, setNipPelaksana] = useState(
    complaint.penyelesaian?.nipPelaksana || currentUser.nip || '19850920 200912 1 002'
  );

  const [verifikasiKlarifikasi, setVerifikasiKlarifikasi] = useState(
    complaint.penyelesaian?.verifikasiKlarifikasi || ''
  );
  const [tindakanDilakukan, setTindakanDilakukan] = useState(
    complaint.penyelesaian?.tindakanDilakukan || ''
  );
  const [hasilPenyelesaian, setHasilPenyelesaian] = useState(
    complaint.penyelesaian?.hasilPenyelesaian || ''
  );

  // Bukti Files
  const [buktiList, setBuktiList] = useState<Array<{ id: string; nama: string; ukuran?: string; tanggal: string }>>(
    complaint.penyelesaian?.dokumenBukti || []
  );

  // C. 6 Status Pilihan Resmi
  const statusOptionsOfficial = [
    { no: 1, label: 'Selesai – pengaduan ditindaklanjuti dan hasil telah disampaikan' },
    { no: 2, label: 'Selesai – pengadu menerima penjelasan/klarifikasi' },
    { no: 3, label: 'Diteruskan – kewenangan instansi/unit lain' },
    { no: 4, label: 'Belum selesai – menunggu data/dokumen' },
    { no: 5, label: 'Belum selesai – menunggu koordinasi/keputusan' },
    { no: 6, label: 'Tidak dapat ditindaklanjuti – alasan:' },
  ];

  const [selectedStatusIndex, setSelectedStatusIndex] = useState<number>(
    complaint.penyelesaian?.statusPilihan ? 
      statusOptionsOfficial.findIndex(s => s.label === complaint.penyelesaian?.statusPilihan) : 0
  );
  const [statusKeterangan, setStatusKeterangan] = useState(
    complaint.penyelesaian?.statusKeterangan || ''
  );

  // D. Konfirmasi Pengadu
  const [enableKonfirmasi, setEnableKonfirmasi] = useState(!!complaint.konfirmasi);
  const [tanggalKonfirmasi, setTanggalKonfirmasi] = useState(
    complaint.konfirmasi?.tanggalPenyampaianHasil || new Date().toISOString().replace('T', ' ').substring(0, 16)
  );
  const [mediaPenyampaian, setMediaPenyampaian] = useState<'Tatap muka' | 'Surat' | 'Telepon' | 'WhatsApp' | 'Email' | 'Lainnya'>(
    complaint.konfirmasi?.mediaPenyampaian || 'Tatap muka'
  );
  const [tanggapanPengadu, setTanggapanPengadu] = useState(
    complaint.konfirmasi?.tanggapanPengadu || 'Pengadu menerima hasil penyelesaian dengan baik dan mengucapkan terima kasih.'
  );
  const [konfirmasiStatus, setKonfirmasiStatus] = useState<'Pengadu menerima hasil penyelesaian' | 'Pengadu masih memerlukan tindak lanjut'>(
    complaint.konfirmasi?.konfirmasi || 'Pengadu menerima hasil penyelesaian'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSimulateAddBukti = (fileName: string) => {
    setBuktiList(prev => [
      ...prev,
      {
        id: `dok-${Date.now()}`,
        nama: fileName,
        ukuran: '1.2 MB',
        tanggal: new Date().toISOString().split('T')[0]
      }
    ]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const chosenStatus = statusOptionsOfficial[selectedStatusIndex]?.label || statusOptionsOfficial[0].label;

    resolveComplaint(complaint.id, {
      tanggalPenyelesaian,
      petugasPelaksana,
      nipPelaksana,
      verifikasiKlarifikasi,
      tindakanDilakukan,
      hasilPenyelesaian,
      dokumenBukti: buktiList,
      statusPilihan: chosenStatus,
      statusKeterangan,
    });

    if (enableKonfirmasi) {
      confirmComplaint(complaint.id, {
        tanggalPenyampaianHasil: tanggalKonfirmasi,
        mediaPenyampaian,
        tanggapanPengadu,
        konfirmasi: konfirmasiStatus,
        ttdPengadu: complaint.namaPengadu,
        ttdPetugas: petugasPelaksana,
        nipPetugas: nipPelaksana,
      });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl max-w-4xl mx-auto">
      <OfficialKop subTitle="FORMULIR PENYELESAIAN PENGADUAN" />

      <form onSubmit={handleSave} className="mt-8 space-y-8">
        {/* Metadata Header */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nomor Pengaduan</label>
            <div className="p-2.5 bg-slate-200 font-mono font-bold text-slate-900 rounded-lg">
              {complaint.nomorPengaduan}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tanggal Penyelesaian</label>
            <input
              type="text"
              value={tanggalPenyelesaian}
              onChange={(e) => setTanggalPenyelesaian(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Petugas/Unit Pelaksana</label>
            <input
              type="text"
              value={petugasPelaksana}
              onChange={(e) => setPetugasPelaksana(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
            />
          </div>
        </div>

        {/* A. IDENTITAS DAN MATERI PENGADUAN */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b pb-2 mb-4">
            <span className="w-6 h-6 rounded-md bg-red-700 text-white flex items-center justify-center text-xs">A</span>
            IDENTITAS DAN MATERI PENGADUAN
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-semibold">Nama Pengadu:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{complaint.namaPengadu}</p>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Tanggal Penerimaan:</span>
              <p className="font-bold text-slate-900 mt-0.5">{complaint.tanggalPenerimaan} WIB</p>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Pokok Pengaduan:</span>
              <p className="font-bold text-slate-900 mt-0.5">{complaint.pokokPengaduan}</p>
            </div>
          </div>
        </div>

        {/* B. TINDAKAN PENYELESAIAN */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b pb-2">
            <span className="w-6 h-6 rounded-md bg-red-700 text-white flex items-center justify-center text-xs">B</span>
            TINDAKAN PENYELESAIAN
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Verifikasi / Klarifikasi yang Telah Dilakukan:
            </label>
            <textarea
              rows={2}
              value={verifikasiKlarifikasi}
              onChange={(e) => setVerifikasiKlarifikasi(e.target.value)}
              placeholder="Contoh: Dilakukan pengecekan nomor identitas NIK dan KKS pada aplikasi SIKS-NG Dinsos..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Tindakan yang Dilakukan (Aksi Nyata Petugas):
            </label>
            <textarea
              rows={3}
              value={tindakanDilakukan}
              onChange={(e) => setTindakanDilakukan(e.target.value)}
              placeholder="Contoh: Kunjungan lapangan pendamping sosial ke rumah pengadu, perbaikan data di sistem..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Hasil Penyelesaian:
            </label>
            <textarea
              rows={3}
              value={hasilPenyelesaian}
              onChange={(e) => setHasilPenyelesaian(e.target.value)}
              placeholder="Contoh: Bantuan telah berhasil dicairkan / Kursi roda telah diserahterimakan..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
            />
          </div>

          {/* Upload Dokumen/Bukti Penyelesaian */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Dokumen / Bukti Bukti Penyelesaian:
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {buktiList.map((dok, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{dok.nama}</span>
                </span>
              ))}
            </div>

            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300">
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah Bukti Penyelesaian (Foto / Berita Acara)</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleSimulateAddBukti(f.name);
                }}
              />
            </label>
          </div>
        </div>

        {/* C. STATUS PENYELESAIAN (Sesuai PDF Hal 7 & 8) */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b pb-2 mb-4">
            <span className="w-6 h-6 rounded-md bg-red-700 text-white flex items-center justify-center text-xs">C</span>
            STATUS PENYELESAIAN
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b font-bold uppercase">
                  <th className="p-2.5 w-10 text-center">No.</th>
                  <th className="p-2.5">Status Penyelesaian Resmi</th>
                  <th className="p-2.5 text-center w-24">Pilih</th>
                  <th className="p-2.5">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statusOptionsOfficial.map((item, idx) => (
                  <tr key={item.no} className={selectedStatusIndex === idx ? 'bg-red-50/50' : ''}>
                    <td className="p-2.5 text-center font-bold text-slate-400">{item.no}</td>
                    <td className="p-2.5 font-semibold text-slate-800">{item.label}</td>
                    <td className="p-2.5 text-center">
                      <input
                        type="radio"
                        name="officialStatusRadio"
                        checked={selectedStatusIndex === idx}
                        onChange={() => setSelectedStatusIndex(idx)}
                        className="w-4 h-4 text-red-700 cursor-pointer"
                      />
                    </td>
                    <td className="p-2.5">
                      {selectedStatusIndex === idx ? (
                        <input
                          type="text"
                          value={statusKeterangan}
                          onChange={(e) => setStatusKeterangan(e.target.value)}
                          placeholder="Keterangan tambahan status..."
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* D. KONFIRMASI PENGADU (Sesuai PDF Hal 8) */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-red-700 text-white flex items-center justify-center text-xs">D</span>
              KONFIRMASI PENGADU
            </h3>
            <label className="flex items-center gap-2 text-xs font-bold text-red-700 cursor-pointer">
              <input
                type="checkbox"
                checked={enableKonfirmasi}
                onChange={(e) => setEnableKonfirmasi(e.target.checked)}
                className="text-red-700 rounded-sm"
              />
              <span>Input Berita Acara Konfirmasi Pengadu</span>
            </label>
          </div>

          {enableKonfirmasi && (
            <div className="space-y-4 text-xs animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Penyampaian Hasil
                  </label>
                  <input
                    type="text"
                    value={tanggalKonfirmasi}
                    onChange={(e) => setTanggalKonfirmasi(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Media Penyampaian
                  </label>
                  <select
                    value={mediaPenyampaian}
                    onChange={(e: any) => setMediaPenyampaian(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Tatap muka">Tatap muka</option>
                    <option value="Surat">Surat</option>
                    <option value="Telepon">Telepon</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggapan Pengadu:
                </label>
                <textarea
                  rows={2}
                  value={tanggapanPengadu}
                  onChange={(e) => setTanggapanPengadu(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Konfirmasi Akhir:
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="konfirmasiStatusRadio"
                      value="Pengadu menerima hasil penyelesaian"
                      checked={konfirmasiStatus === 'Pengadu menerima hasil penyelesaian'}
                      onChange={() => setKonfirmasiStatus('Pengadu menerima hasil penyelesaian')}
                      className="text-emerald-700"
                    />
                    <span className="font-semibold text-emerald-900">
                      Pengadu menerima hasil penyelesaian
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="konfirmasiStatusRadio"
                      value="Pengadu masih memerlukan tindak lanjut"
                      checked={konfirmasiStatus === 'Pengadu masih memerlukan tindak lanjut'}
                      onChange={() => setKonfirmasiStatus('Pengadu masih memerlukan tindak lanjut')}
                      className="text-amber-700"
                    />
                    <span className="font-semibold text-amber-900">
                      Pengadu masih memerlukan tindak lanjut
                    </span>
                  </label>
                </div>
              </div>

              {/* Tanda Tangan Sesuai PDF Hal 8 */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
                <div className="text-center w-48">
                  <p className="font-semibold text-slate-700">Pengadu,</p>
                  <div className="h-16 flex items-center justify-center font-serif italic text-slate-900 font-bold">
                    ({complaint.namaPengadu})
                  </div>
                </div>

                <div className="text-center w-64">
                  <p className="font-semibold text-slate-700">Tanjungbalai, 2026</p>
                  <p className="font-semibold text-slate-700">Petugas/Pejabat Penyelesaian,</p>
                  <div className="h-16 flex items-center justify-center font-serif italic text-slate-900 font-bold">
                    ({petugasPelaksana})
                  </div>
                  <p className="font-mono text-slate-600">NIP. {nipPelaksana}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Formulir Penyelesaian</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Tersimpan!' : 'SIMPAN PENYELESAIAN PENGADUAN'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
