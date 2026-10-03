import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, KewenanganType, PrioritasType, AspekTelaahItem, KlasifikasiItem } from '../../types';
import { OfficialKop } from '../common/OfficialKop';
import { DEFAULT_ASPEK_TELAAH, DEFAULT_KLASIFIKASI_LIST } from '../../data/initialData';
import { AiAssistantModal } from './AiAssistantModal';
import { LembarTelaahPrintModal } from './LembarTelaahPrintModal';
import { 
  Sparkles, 
  CheckCircle, 
  FileText, 
  Save, 
  Printer, 
  Send, 
  AlertCircle,
  HelpCircle,
  Building2,
  Calendar,
  Eye
} from 'lucide-react';

interface ReviewClassificationFormProps {
  complaint: Complaint;
  onSuccess?: () => void;
}

export const ReviewClassificationForm: React.FC<ReviewClassificationFormProps> = ({ 
  complaint, 
  onSuccess 
}) => {
  const { reviewComplaint, currentUser } = useApp();
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // State
  const [tanggalTelaah, setTanggalTelaah] = useState(
    complaint.telaah?.tanggalTelaah || new Date().toISOString().replace('T', ' ').substring(0, 16)
  );
  const [petugasPenelaah, setPetugasPenelaah] = useState(
    complaint.telaah?.petugasPenelaah || currentUser.nama || 'Drs. Chairul Anwar, M.Si'
  );
  const [nipPenelaah, setNipPenelaah] = useState(
    complaint.telaah?.nipPenelaah || currentUser.nip || '19760315 200501 1 008'
  );

  // A. Aspek Penelaahan (6 items)
  const [aspekList, setAspekList] = useState<AspekTelaahItem[]>(
    complaint.telaah?.aspekTelaah || DEFAULT_ASPEK_TELAAH
  );

  // B. Klasifikasi (10 items)
  const [klasifikasiList, setKlasifikasiList] = useState<KlasifikasiItem[]>(
    complaint.telaah?.klasifikasiList || DEFAULT_KLASIFIKASI_LIST
  );
  const [klasifikasiLainnya, setKlasifikasiLainnya] = useState(
    complaint.telaah?.klasifikasiLainnya || ''
  );

  // C. Penentuan Kewenangan
  const [kewenangan, setKewenangan] = useState<KewenanganType>(
    complaint.telaah?.kewenangan || complaint.kewenangan || 'Dinas Sosial Kota Tanjungbalai'
  );

  // Prioritas
  const [prioritas, setPrioritas] = useState<PrioritasType>(
    complaint.telaah?.prioritas || complaint.prioritas || 'Biasa'
  );

  // Rekomendasi & Hasil Analisis
  const [rekomendasi, setRekomendasi] = useState(
    complaint.telaah?.rekomendasiTindakLanjut || ''
  );
  const [hasilAnalisis, setHasilAnalisis] = useState(
    complaint.telaah?.hasilTelaahAnalisis || ''
  );

  // AI Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Handlers for Aspek
  const handleAspekToggle = (index: number, ya: boolean) => {
    setAspekList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ya };
      return copy;
    });
  };

  const handleAspekCatatan = (index: number, catatan: string) => {
    setAspekList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], catatan };
      return copy;
    });
  };

  // Handlers for Klasifikasi
  const handleKlasifikasiToggle = (index: number, ya: boolean) => {
    setKlasifikasiList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ya };
      return copy;
    });
  };

  const handleKlasifikasiKeterangan = (index: number, keterangan: string) => {
    setKlasifikasiList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], keterangan };
      return copy;
    });
  };

  // Apply AI suggestions
  const handleApplyAi = (aiData: any) => {
    if (aiData.saranKewenangan) {
      setKewenangan(aiData.saranKewenangan as KewenanganType);
    }
    if (aiData.tingkatPrioritas) {
      setPrioritas(aiData.tingkatPrioritas as PrioritasType);
    }
    if (aiData.draftRekomendasi) {
      setRekomendasi(aiData.draftRekomendasi);
    }
    if (aiData.draftHasilTelaah) {
      setHasilAnalisis(aiData.draftHasilTelaah);
    }

    // Auto check classification if matches
    if (aiData.saranKlasifikasi && Array.isArray(aiData.saranKlasifikasi)) {
      setKlasifikasiList(prev => prev.map(k => {
        const match = aiData.saranKlasifikasi.some((sk: string) => 
          k.klasifikasi.toLowerCase().includes(sk.toLowerCase()) || sk.toLowerCase().includes(k.klasifikasi.toLowerCase())
        );
        return match ? { ...k, ya: true, keterangan: 'Direkomendasikan otomatis oleh AI' } : k;
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    reviewComplaint(complaint.id, {
      tanggalTelaah,
      petugasPenelaah,
      nipPenelaah,
      aspekTelaah: aspekList,
      klasifikasiList,
      klasifikasiLainnya: klasifikasiList[9]?.ya ? klasifikasiLainnya : undefined,
      kewenangan,
      prioritas,
      rekomendasiTindakLanjut: rekomendasi,
      hasilTelaahAnalisis: hasilAnalisis,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl max-w-4xl mx-auto">
      {/* Official Header */}
      <OfficialKop subTitle="FORMULIR PENELAAHAN DAN PENGKLASIFIKASIAN PENGADUAN" />

      {/* Action Bar for AI Assistant & Print Preview */}
      <div className="my-6 p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-700 text-white rounded-xl">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Asisten Cerdas & Lembar Cetak Telaah
            </h4>
            <p className="text-[11px] text-slate-600">
              Analisis otomatis uraian aduan atau cetak dokumen resmi hasil telaah ke format PDF / A4.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setPrintModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            title="Pratinjau Lembar Telaah Resmi"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak Lembar Telaah</span>
          </button>

          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Asisten AI</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Metadata Block */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Pengaduan
              </label>
              <div className="p-2 bg-slate-200 font-mono font-bold text-slate-900 rounded-lg">
                {complaint.nomorPengaduan}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal & Waktu Telaah
              </label>
              <input
                type="text"
                value={tanggalTelaah}
                onChange={(e) => setTanggalTelaah(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Petugas / Tim Penelaah
              </label>
              <input
                type="text"
                value={petugasPenelaah}
                onChange={(e) => setPetugasPenelaah(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-xs">
            <span className="font-semibold text-slate-500">Materi Pokok Pengaduan:</span>
            <p className="font-bold text-slate-900 mt-0.5">{complaint.pokokPengaduan}</p>
            <p className="text-slate-600 italic mt-1 line-clamp-2">"{complaint.uraianKronologi}"</p>
          </div>
        </div>

        {/* A. HASIL PENELAAHAN (6 Aspek Sesuai PDF Halaman 3) */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
          <div className="border-b border-slate-200 pb-2 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-red-700 text-white flex items-center justify-center text-xs">A</span>
              HASIL PENELAAHAN
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase">
                  <th className="py-2.5 px-3 w-10 text-center">No.</th>
                  <th className="py-2.5 px-3">Aspek Penelaahan</th>
                  <th className="py-2.5 px-3 text-center w-28">Pilihan</th>
                  <th className="py-2.5 px-3">Catatan Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {aspekList.map((item, idx) => (
                  <tr key={item.no} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500">{item.no}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{item.aspek}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                        <button
                          type="button"
                          onClick={() => handleAspekToggle(idx, true)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            item.ya ? 'bg-red-700 text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Ya
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAspekToggle(idx, false)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            !item.ya ? 'bg-slate-400 text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Tidak
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.catatan}
                        onChange={(e) => handleAspekCatatan(idx, e.target.value)}
                        placeholder="Catatan telaah..."
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* B. KLASIFIKASI PENGADUAN (10 Kategori Sesuai PDF Halaman 3 & 4) */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
          <div className="border-b border-slate-200 pb-2 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-red-700 text-white flex items-center justify-center text-xs">B</span>
              KLASIFIKASI PENGADUAN
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase">
                  <th className="py-2.5 px-3 w-10 text-center">No.</th>
                  <th className="py-2.5 px-3">Klasifikasi</th>
                  <th className="py-2.5 px-3 text-center w-28">Pilihan</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {klasifikasiList.map((item, idx) => (
                  <tr key={item.no} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500">{item.no}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {item.klasifikasi}
                      {item.no === 10 && item.ya && (
                        <input
                          type="text"
                          value={klasifikasiLainnya}
                          onChange={(e) => setKlasifikasiLainnya(e.target.value)}
                          placeholder="Sebutkan klasifikasi lainnya..."
                          className="mt-1 w-full px-2 py-1 bg-white border border-slate-300 rounded-md text-xs font-normal"
                        />
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                        <button
                          type="button"
                          onClick={() => handleKlasifikasiToggle(idx, true)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            item.ya ? 'bg-red-700 text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Ya
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKlasifikasiToggle(idx, false)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            !item.ya ? 'bg-slate-400 text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Tidak
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.keterangan}
                        onChange={(e) => handleKlasifikasiKeterangan(idx, e.target.value)}
                        placeholder="Keterangan klasifikasi..."
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* C. PENENTUAN KEWENANGAN & PRIORITAS (Sesuai PDF Halaman 4) */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-red-700 text-white flex items-center justify-center text-xs">C</span>
              PENENTUAN KEWENANGAN & TINGKAT PRIORITAS
            </h3>
          </div>

          {/* Kewenangan */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Penentuan Kewenangan Instansi:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                'Dinas Sosial Kota Tanjungbalai',
                'Perangkat Daerah lain di Kota Tanjungbalai',
                'Pemerintah Provinsi',
                'Pemerintah Pusat',
                'Instansi/Lembaga lain',
                'Bukan kewenangan pemerintah',
              ].map((k) => (
                <label 
                  key={k} 
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    kewenangan === k ? 'bg-red-50 border-red-300 font-bold text-red-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="kewenangan"
                    value={k}
                    checked={kewenangan === k}
                    onChange={() => setKewenangan(k as KewenanganType)}
                    className="text-red-700"
                  />
                  <span>{k}</span>
                </label>
              ))}
            </div>
            {kewenangan !== 'Dinas Sosial Kota Tanjungbalai' && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-2">
                *Catatan: Pengaduan ini memerlukan penyaluran ke instansi berwenang. Setelah formulir disimpan, Anda dapat membuat Surat Penyaluran Otomatis pada menu Penyaluran.
              </p>
            )}
          </div>

          {/* Prioritas */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Tingkat Prioritas Tindak Lanjut:
            </label>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {(['Biasa', 'Penting', 'Mendesak'] as PrioritasType[]).map((p) => (
                <label
                  key={p}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer text-center font-bold transition-all ${
                    prioritas === p
                      ? p === 'Mendesak'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : p === 'Penting'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-blue-600 text-white border-blue-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="prioritas"
                    value={p}
                    checked={prioritas === p}
                    onChange={() => setPrioritas(p)}
                    className="sr-only"
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rekomendasi Tindak Lanjut */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Rekomendasi Tindak Lanjut:
            </label>
            <textarea
              rows={3}
              value={rekomendasi}
              onChange={(e) => setRekomendasi(e.target.value)}
              placeholder="Tuliskan rekomendasi langkah teknis bagi unit pelaksana atau surat pengantar penyaluran..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600"
            />
          </div>

          {/* Hasil Telaah / Analisis */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Hasil Telaah / Analisis:
            </label>
            <textarea
              rows={3}
              value={hasilAnalisis}
              onChange={(e) => setHasilAnalisis(e.target.value)}
              placeholder="Catatan analisis mendalam terkait fakta, dasar hukum, dan pertimbangan sosial..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600"
            />
          </div>

          {/* Tanda Tangan Tim Penelaah */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-4">
            <div className="text-xs text-slate-500">
              Formulir diarsipkan ke sistem digital Dinsos Tanjungbalai.
            </div>

            <div className="text-center min-w-[200px]">
              <p className="text-xs font-semibold text-slate-700">Petugas/Tim Penelaah,</p>
              <div className="h-16 flex items-center justify-center font-serif italic text-slate-800 font-bold text-sm">
                ({petugasPenelaah})
              </div>
              <p className="text-xs font-mono font-medium text-slate-600">
                NIP. {nipPenelaah}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 no-print">
          <button
            type="button"
            onClick={() => setPrintModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Buka Pratinjau & Cetak Lembar Telaah"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak Lembar Telaah</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Tersimpan!' : 'SIMPAN HASIL TELAAH & KLASIFIKASI'}</span>
          </button>
        </div>
      </form>

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        complaint={complaint}
        onApplyAnalysis={handleApplyAi}
      />

      {/* Official Lembar Telaah Print Modal */}
      <LembarTelaahPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        complaint={complaint}
        currentData={{
          tanggalTelaah,
          petugasPenelaah,
          nipPenelaah,
          aspekList,
          klasifikasiList,
          klasifikasiLainnya,
          kewenangan,
          prioritas,
          rekomendasi,
          hasilAnalisis
        }}
      />
    </div>
  );
};
