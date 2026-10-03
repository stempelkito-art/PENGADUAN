import React from 'react';
import { OFFICIAL_INFO } from '../../data/initialData';
import { TanjungbalaiLogo } from './OfficialKop';
import { Phone, Mail, MapPin, Globe, Shield, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800 no-print">
      {/* Top Banner Anti Gratifikasi */}
      <div className="bg-red-950/80 border-b border-red-900/60 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-red-200">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-xs sm:text-sm">
              Maklumat Bebas Pungli & Gratifikasi: Seluruh Pelayanan Pengaduan di Dinas Sosial Kota Tanjungbalai 100% GRATIS!
            </span>
          </div>
          <span className="text-[11px] bg-red-800 text-white px-2 py-0.5 rounded-full font-bold">
            Zona Integritas WBK / WBBM
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Instansi */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <TanjungbalaiLogo className="w-10 h-13" />
              <div>
                <h4 className="font-bold text-white text-sm">DINAS SOSIAL</h4>
                <p className="text-[11px] text-slate-400">PEMERINTAH KOTA TANJUNGBALAI</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Mewujudkan perlindungan dan kesejahteraan sosial masyarakat Kota Tanjungbalai yang berkeadilan, transparan, dan akuntabel.
            </p>
          </div>

          {/* Col 2: Kontak & Alamat */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Kantor Pelayanan</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{OFFICIAL_INFO.alamat}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Telp: (0623) 92086</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{OFFICIAL_INFO.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{OFFICIAL_INFO.website}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Jam Layanan */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Jam Layanan Pengaduan</h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Senin - Kamis:</p>
                  <p className="text-[11px]">08.00 - 15.30 WIB</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Jumat:</p>
                  <p className="text-[11px]">08.00 - 16.00 WIB (Istirahat Shalat Jumat)</p>
                </div>
              </div>
              <p className="text-[11px] text-amber-300/80 pt-1">
                *Layanan Darurat Mobil Jenazah & Bencana Sosial Siaga 24 Jam via Hotlines Tagana.
              </p>
            </div>
          </div>

          {/* Col 4: Standar Pelayanan */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Standar Waktu / SLA</h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span>Pengaduan Mendesak:</span>
                <span className="font-bold text-rose-400">Maks. 1 - 3 Hari</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span>Pengaduan Penting:</span>
                <span className="font-bold text-amber-400">Maks. 7 Hari</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span>Pengaduan Biasa:</span>
                <span className="font-bold text-blue-400">Maks. 14 Hari</span>
              </li>
              <li className="flex items-center justify-between pt-1">
                <span>Penyaluran Non-Dinsos:</span>
                <span className="font-bold text-slate-200">Maks. 3 Hari Kerja</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} Dinas Sosial Kota Tanjungbalai. Hak Cipta Dilindungi Undang-Undang.</p>
          <p>Sistem Informasi Pengaduan Masyarakat (SIPMAS) Terintegrasi</p>
        </div>
      </div>
    </footer>
  );
};
