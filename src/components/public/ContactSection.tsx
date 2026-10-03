import React from 'react';
import { OFFICIAL_INFO } from '../../data/initialData';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  MessageSquare, 
  Shield, 
  Navigation,
  ExternalLink
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
          Hubungi Kami
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Kontak & Lokasi Kantor Pelayanan
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Dinas Sosial Kota Tanjungbalai siap melayani Anda melalui loket tatap muka maupun kanal komunikasi digital.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kontak Utama Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b pb-3">
            Informasi Kontak Resmi
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 text-red-700 rounded-lg shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Alamat Kantor:</p>
                <p className="text-slate-600 mt-0.5">{OFFICIAL_INFO.alamat}</p>
                <p className="font-bold text-slate-800">{OFFICIAL_INFO.kotaKodePos}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Telepon Pelayanan:</p>
                <p className="text-slate-600 mt-0.5">(0623) 92086 (Jam Kerja)</p>
                <p className="text-emerald-700 font-semibold">Hotline WhatsApp: 0812-6345-8921</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Email Resmi:</p>
                <p className="text-blue-700 underline mt-0.5">{OFFICIAL_INFO.email}</p>
                <p className="text-slate-500">Website: {OFFICIAL_INFO.website}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Jam Operasional Pelayanan:</p>
                <p className="text-slate-600 mt-0.5">Senin - Kamis: 08.00 - 15.30 WIB</p>
                <p className="text-slate-600">Jumat: 08.00 - 16.00 WIB</p>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">
                  *Mobil Jenazah & Bencana Siaga 24 Jam
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map / Panduan Menuju Kantor */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b pb-3 mb-4">
              Petunjuk Lokasi Kantor
            </h3>

            {/* Simulated Map Visual */}
            <div className="w-full h-44 bg-slate-100 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center p-4 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Kantor Dinas Sosial Kota Tanjungbalai</p>
                  <p className="text-[11px] text-slate-500">Jln. Jenderal Sudirman KM. 1,5 Tanjungbalai</p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Akses Transportasi:</p>
              <p>• Berjarak sekitar 5 menit dari Jembatan Sei Silau / Pusat Pasar Tanjungbalai.</p>
              <p>• Dapat diakses dengan angkutan kota, becak bermotor, maupun kendaraan roda empat.</p>
              <p>• Loket Pelayanan Terpadu Satu Pintu (PTSP) berada di lantai 1 gedung depan.</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Koordinat GPS Kota Tanjungbalai</span>
            <span className="text-xs font-mono font-bold text-red-700">2.9585° N, 99.8005° E</span>
          </div>
        </div>
      </div>
    </div>
  );
};
