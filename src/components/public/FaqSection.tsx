import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Bagaimana cara mengecek apakah saya terdaftar dalam DTKS / DTSEN?',
      a: 'Pengecekan dapat dilakukan secara mandiri melalui menu "Buat Pengaduan" dengan memilih klasifikasi "Data Bantuan Sosial / DTSEN", atau datang langsung ke loket Pelayanan Sosial Dinsos Kota Tanjungbalai dengan membawa e-KTP dan Kartu Keluarga asli. Petugas akan mengecek pada sistem SIKS-NG online Kemensos.'
    },
    {
      q: 'Mengapa bantuan PKH / Sembako saya tiba-tiba tidak cair?',
      a: 'Penyebab umum meliputi anomali NIK dengan data Dukcapil (misal NIK ganda atau tidak padan), perubahan tingkat desil ekonomi keluarga pada pemutakhiran berkala, atau rekening bansos pasif. Segera buat pengaduan dengan melampirkan foto buku tabungan KKS dan struk saldo nol untuk kami koordinasikan dengan Bank Penyalur.'
    },
    {
      q: 'Bagaimana prosedur permohonan bantuan kursi roda atau alat bantu disabilitas?',
      a: 'Pengadu atau keluarga dapat mengisi formulir pengaduan permohonan dengan melampirkan: (1) KTP Tanjungbalai, (2) KK, (3) Surat Keterangan Tidak Mampu (SKTM) dari Kelurahan, (4) Surat rekomendasi medis/diagnosa dokter, dan (5) Foto kondisi penyandang disabilitas. Petugas Pekerja Sosial akan melakukan asesmen sebelum serah terima bantuan.'
    },
    {
      q: 'Apakah layanan mobil jenazah Dinas Sosial dipungut biaya?',
      a: 'Layanan Mobil Jenazah Dinas Sosial Kota Tanjungbalai 100% GRATIS (bebas biaya bensin, sopir, dan armada) bagi warga Kota Tanjungbalai yang tidak mampu / terlantar. Jika ada oknum yang meminta imbalan, segera laporkan ke nomor piket darurat Dinsos.'
    },
    {
      q: 'Apa yang terjadi jika masalah yang saya adukan ternyata bukan wewenang Dinas Sosial?',
      a: 'Pengaduan Anda tidak akan diabaikan! Tim penelaah akan menerbitkan "Surat Penyaluran Pengaduan Bukan Kewenangan" resmi yang ditandatangani Kepala Dinas Sosial untuk diteruskan ke instansi yang berwenang (misalnya Disdukcapil untuk masalah NIK ganda, Dinkes untuk RS, dll), dan Anda dapat memantau nomor surat tersebut pada menu Lacak Pengaduan.'
    },
    {
      q: 'Berapa lama waktu yang dibutuhkan sampai pengaduan saya selesai ditangani?',
      a: 'Sesuai SLA resmi: Pengaduan berkategori "Mendesak" ditangani dalam 1-3 hari kerja; berkategori "Penting" maksimal 7 hari kerja; dan berkategori "Biasa" maksimal 14 hari kerja.'
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
          Frequently Asked Questions
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Pertanyaan yang Sering Diajukan
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Temukan jawaban cepat seputar tata cara pengaduan bantuan sosial dan layanan kesejahteraan masyarakat Kota Tanjungbalai.
        </p>

        <div className="mt-6 relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari pertanyaan bantuan, PKH, kursi roda..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div 
              key={idx}
              className="border border-slate-200 rounded-xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm text-slate-900">
                  <HelpCircle className="w-4 h-4 text-red-700 shrink-0" />
                  <span>{faq.q}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-red-700' : ''}`} />
              </button>

              {isOpen && (
                <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 border-t border-slate-200 leading-relaxed animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
