import React from 'react';
import { OfficialKop } from '../common/OfficialKop';
import { 
  FileCheck, 
  Shield, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  Users, 
  AlertCircle,
  Building2
} from 'lucide-react';

export const InfoSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
          Standar Operasional Prosedur
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Informasi & Pedoman Pengaduan Masyarakat
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Dinas Sosial Kota Tanjungbalai menjamin keterbukaan informasi, kepastian penanganan, dan perlindungan kerahasiaan identitas masyarakat pengadu.
        </p>
      </div>

      {/* Grid SOP Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hak Pengadu */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 text-red-700 font-bold text-sm mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <span>Hak Pengadu</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Mendapatkan nomor registrasi pengaduan unik yang sah untuk pelacakan.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Memperoleh kepastian informasi perkembangan tindak lanjut pengaduan.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Memperoleh perlindungan kerahasiaan identitas pribadi (NIK dan kontak).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Menerima penjelasan resmi baik jika kewenangan Dinsos maupun jika disalurkan ke OPD lain.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Memberikan konfirmasi atau tanggapan akhir terhadap penyelesaian yang dilakukan.</span>
            </li>
          </ul>
        </div>

        {/* Kewajiban Pengadu */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-800 font-bold text-sm mb-4">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Users className="w-5 h-5 text-slate-700" />
            </div>
            <span>Kewajiban Pengadu</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Menyampaikan materi pengaduan yang benar, objektif, dan bukan fitnah.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Melampirkan identitas sah (e-KTP Tanjungbalai dan Kartu Keluarga).</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Menyediakan bukti pendukung yang relevan (foto, surat keterangan lurah, dll).</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Bersikap sopan dan kooperatif saat petugas melakukan verifikasi lapangan.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Target Waktu / SLA Table */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-red-700" />
          Standar Waktu Penyelesaian (Service Level Agreement)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b">
                <th className="p-3">Tingkat Prioritas</th>
                <th className="p-3">Kriteria Masalah</th>
                <th className="p-3 text-center">Maksimal Waktu</th>
                <th className="p-3">Tindakan Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-bold text-rose-700">Mendesak</td>
                <td className="p-3 text-slate-600">Kebutuhan darurat armada jenazah warga terlantar, korban bencana kebakaran, lansia/anak darurat</td>
                <td className="p-3 font-black text-center text-rose-700 bg-rose-50">1 - 3 Hari Kerja</td>
                <td className="p-3 text-slate-700">Disposisi langsung Unit Reaksi Cepat / Tagana Dinsos</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-700">Penting</td>
                <td className="p-3 text-slate-600">Bansos PKH tidak cair, permohonan alat bantu kursi roda disabilitas, PBI JKN pasien sakit</td>
                <td className="p-3 font-black text-center text-amber-700 bg-amber-50">7 Hari Kerja</td>
                <td className="p-3 text-slate-700">Asesmen pekerja sosial & sinkronisasi SIKS-NG</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-700">Biasa</td>
                <td className="p-3 text-slate-600">Permohonan informasi DTSEN umum, aduan pemerataan bansos, pendaftaran lembaga LKS</td>
                <td className="p-3 font-black text-center text-slate-700 bg-slate-50">14 Hari Kerja</td>
                <td className="p-3 text-slate-700">Verifikasi berkas & klarifikasi resmi</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
