import React from 'react';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_INFO } from '../../data/initialData';

export const TANJUNGBALAI_LOGO_URL = "/logo_tanjungbalai.png";
export const TANJUNGBALAI_LOGO_FALLBACK = "https://upload.wikimedia.org/wikipedia/commons/9/90/LOGO_KOTA_TANJUNG_BALAI.png";

export const TanjungbalaiLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-20" }) => (
  <img 
    src={TANJUNGBALAI_LOGO_URL} 
    onError={(e) => {
      // Fallback to official Wikimedia link if local path is unavailable
      (e.target as HTMLImageElement).src = TANJUNGBALAI_LOGO_FALLBACK;
    }}
    alt="Lambang Resmi Kota Tanjungbalai" 
    className={`object-contain select-none ${className}`}
    loading="eager"
  />
);

interface OfficialKopProps {
  className?: string;
  subTitle?: string;
}

export const OfficialKop: React.FC<OfficialKopProps> = ({ className = '', subTitle }) => {
  const { officialInfo } = useApp();
  const info = officialInfo || OFFICIAL_INFO;

  return (
    <div className={`text-center relative select-none pb-2 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
        <div className="shrink-0">
          <TanjungbalaiLogo className="w-14 h-18 sm:w-20 sm:h-24 drop-shadow-sm" />
        </div>
        <div className="text-center font-serif flex-1 min-w-0">
          <h2 className="text-xs sm:text-lg font-bold tracking-wider text-slate-900 leading-tight uppercase font-sans">
            {info.instansi}
          </h2>
          <h1 className="text-sm sm:text-2xl font-black tracking-wide text-slate-950 uppercase font-sans my-0.5 sm:my-1">
            {info.dinas}
          </h1>
          <p className="text-[11px] sm:text-sm text-slate-700 font-sans leading-tight">
            {info.alamat}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-600 font-sans tracking-tight break-all">
            Website: <span className="text-blue-700 underline">{info.website}</span>, e-mail: <span className="text-blue-700">{info.email}</span>
          </p>
          <p className="text-[10px] sm:text-xs font-bold text-slate-900 font-sans tracking-widest mt-0.5">
            {info.kotaKodePos}
          </p>
        </div>
      </div>

      {/* Double line Kop Surat khas surat dinas */}
      <div className="mt-3">
        <div className="w-full border-b-[3px] border-slate-950"></div>
        <div className="w-full border-b-[1px] border-slate-950 mt-[2px]"></div>
      </div>

      {subTitle && (
        <div className="mt-3 sm:mt-4 text-center">
          <h3 className="text-sm sm:text-lg font-bold uppercase tracking-wider text-slate-950 underline underline-offset-4">
            {subTitle}
          </h3>
        </div>
      )}
    </div>
  );
};
