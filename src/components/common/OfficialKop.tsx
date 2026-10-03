import React from 'react';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_INFO } from '../../data/initialData';

export const TanjungbalaiLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-20" }) => (
  <svg 
    viewBox="0 0 400 500" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Lambang Resmi Kota Tanjungbalai"
  >
    <defs>
      {/* Clip path for inner shield */}
      <clipPath id="innerShieldClip">
        <path d="M 68 144 C 68 144 190 144 200 144 C 210 144 332 144 332 144 C 332 195 330 235 322 280 C 310 340 230 380 200 396 C 170 380 90 340 78 280 C 70 235 68 195 68 144 Z" />
      </clipPath>
      {/* Clip path for center kerang shield */}
      <clipPath id="kerangClip">
        <path d="M 155 204 H 245 V 268 C 245 295 210 318 200 322 C 190 318 155 295 155 268 Z" />
      </clipPath>
    </defs>

    {/* ================= 1. OUTER RED SHIELD ================= */}
    <path 
      d="M 200 8 C 218 35 240 50 280 56 C 330 64 365 78 376 96 C 390 118 375 146 360 162 C 342 180 345 210 354 240 C 375 305 375 365 348 420 C 315 480 235 500 200 502 C 165 500 85 480 52 420 C 25 365 25 305 46 240 C 55 210 58 180 40 162 C 25 146 10 118 24 96 C 35 78 70 64 120 56 C 160 50 182 35 200 8 Z" 
      fill="#EE1C24" 
      stroke="#111111" 
      strokeWidth="7"
      strokeLinejoin="round"
    />

    {/* ================= 2. GOLDEN STAR AT TOP ================= */}
    <polygon 
      points="200,28 209,56 238,56 214,73 223,100 200,83 177,100 186,73 162,56 191,56" 
      fill="#FFE600" 
      stroke="#111111" 
      strokeWidth="3"
    />

    {/* ================= 3. CROSSED BAMBOO SPEARS (BAMBU RUNCING) ================= */}
    {/* Left-bottom to Right-top Spear */}
    <g>
      {/* Top right spear tip */}
      <polygon points="350,135 376,115 360,148 340,158" fill="#D2E800" stroke="#111" strokeWidth="3" />
      <polygon points="376,115 352,142 360,148" fill="#FFFFFF" opacity="0.6" />
      <line x1="330" y1="165" x2="350" y2="150" stroke="#EE1C24" strokeWidth="5" />
      
      {/* Bottom left spear base */}
      <line x1="125" y1="365" x2="52" y2="435" stroke="#D2E800" strokeWidth="12" strokeLinecap="round" />
      <line x1="125" y1="365" x2="52" y2="435" stroke="#111" strokeWidth="2" strokeDasharray="14 16" />
      <line x1="90" y1="400" x2="105" y2="385" stroke="#EE1C24" strokeWidth="5" />
    </g>

    {/* Right-bottom to Left-top Spear */}
    <g>
      {/* Top left spear tip */}
      <polygon points="50,135 24,115 40,148 60,158" fill="#D2E800" stroke="#111" strokeWidth="3" />
      <polygon points="24,115 48,142 40,148" fill="#FFFFFF" opacity="0.6" />
      <line x1="70" y1="165" x2="50" y2="150" stroke="#EE1C24" strokeWidth="5" />

      {/* Bottom right spear base */}
      <line x1="275" y1="365" x2="348" y2="435" stroke="#D2E800" strokeWidth="12" strokeLinecap="round" />
      <line x1="275" y1="365" x2="348" y2="435" stroke="#111" strokeWidth="2" strokeDasharray="14 16" />
      <line x1="310" y1="400" x2="295" y2="385" stroke="#EE1C24" strokeWidth="5" />
    </g>

    {/* ================= 4. BLACK FORTRESS WALL (BENTENG HITAM) ================= */}
    <g fill="#1A1A1A" stroke="#111111" strokeWidth="4" strokeLinejoin="miter">
      {/* Base wall */}
      <rect x="66" y="112" width="268" height="32" />
      {/* 5 Merlons / Battlements */}
      <rect x="66" y="86" width="38" height="28" />
      <rect x="122" y="86" width="38" height="28" />
      <rect x="181" y="86" width="38" height="28" />
      <rect x="240" y="86" width="38" height="28" />
      <rect x="296" y="86" width="38" height="28" />
    </g>

    {/* ================= 5. INNER SHIELD ================= */}
    {/* White boundary border */}
    <path 
      d="M 64 140 C 64 140 190 140 200 140 C 210 140 336 140 336 140 C 336 195 334 238 326 284 C 314 346 232 386 200 403 C 168 386 86 346 74 284 C 66 238 64 195 64 140 Z" 
      fill="#FFFFFF" 
      stroke="#111111" 
      strokeWidth="6" 
    />

    {/* Inner content clipped to shield */}
    <g clipPath="url(#innerShieldClip)">
      {/* Quadrant 1 (Top Left) - White: Port / Harbors */}
      <rect x="68" y="144" width="132" height="100" fill="#FFFFFF" />
      {/* Black Port Silhouette: Pier crane, cargo boom, ships */}
      <path 
        d="M 112 154 H 198 V 178 H 142 L 138 212 H 100 L 104 224 H 198 V 244 H 96 L 98 210 L 112 210 Z" 
        fill="#1A1A1A" 
      />
      <polygon points="120,154 135,178 126,178 114,154" fill="#FFFFFF" />
      <polygon points="144,185 190,185 186,198 140,198" fill="#FFFFFF" />
      <line x1="102" y1="178" x2="114" y2="154" stroke="#1A1A1A" strokeWidth="3" />
      <line x1="130" y1="178" x2="198" y2="178" stroke="#1A1A1A" strokeWidth="3" />

      {/* Quadrant 2 (Top Right) - Red: Factory / Industry */}
      <rect x="200" y="144" width="132" height="100" fill="#EE1C24" />
      {/* White Industrial Plant with smokestack */}
      {/* Smoke */}
      <path d="M 218 160 Q 235 152 245 158 Q 255 162 250 156" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Smokestack */}
      <rect x="250" y="166" width="12" height="60" fill="#FFFFFF" stroke="#111" strokeWidth="1.5" />
      {/* Factory buildings */}
      <polygon points="214,198 226,182 242,198" fill="#FFFFFF" stroke="#111" strokeWidth="1.5" />
      <rect x="214" y="198" width="28" height="34" fill="#FFFFFF" stroke="#111" strokeWidth="1.5" />
      <polygon points="242,198 258,182 274,198" fill="#FFFFFF" stroke="#111" strokeWidth="1.5" />
      <rect x="242" y="198" width="46" height="34" fill="#FFFFFF" stroke="#111" strokeWidth="1.5" />
      {/* Windows & Doors */}
      <rect x="220" y="206" width="6" height="8" fill="#111" />
      <rect x="252" y="206" width="8" height="8" fill="#111" />
      <rect x="268" y="206" width="8" height="8" fill="#111" />

      {/* Quadrant 3 (Bottom Left) - Green: Brown Fish */}
      <rect x="68" y="244" width="132" height="160" fill="#009E49" />
      {/* Brown Fish (Ikan Sembilang/Tawar) */}
      <g transform="translate(90, 245)">
        {/* White Fin */}
        <path d="M 18 62 C 16 35 10 18 4 6 C 24 16 28 36 24 64 Z" fill="#FFFFFF" stroke="#111" strokeWidth="2" />
        {/* Fish Body */}
        <path 
          d="M 16 64 C 20 60 48 56 68 80 C 76 90 74 110 60 120 C 40 128 20 125 14 105 C 8 85 12 68 16 64 Z" 
          fill="#82533C" 
          stroke="#111" 
          strokeWidth="3" 
        />
        {/* Eye */}
        <circle cx="62" cy="98" r="4" fill="#FFFFFF" stroke="#111" strokeWidth="1.5" />
        <circle cx="63" cy="98" r="1.5" fill="#111" />
        {/* Gill arc */}
        <path d="M 48 88 Q 54 98 48 108" stroke="#111" strokeWidth="2" fill="none" />
      </g>

      {/* Quadrant 4 (Bottom Right) - Dark Blue: White Marine Fish */}
      <rect x="200" y="244" width="132" height="160" fill="#241872" />
      {/* White Fish Swimming Upward (Ikan Asin / Laut) */}
      <g transform="translate(230, 255)">
        <path 
          d="M 64 6 C 60 25 58 40 45 55 C 32 70 12 85 0 92 C 10 75 18 55 28 40 C 40 22 55 12 64 6 Z" 
          fill="#FFFFFF" 
          stroke="#111" 
          strokeWidth="2.5" 
        />
        {/* Forked tail */}
        <polygon points="56,12 84,20 68,36" fill="#FFFFFF" stroke="#111" strokeWidth="2" />
        {/* Eye */}
        <circle cx="12" cy="78" r="2.5" fill="#111" />
      </g>

      {/* Quadrant Partition Lines */}
      <line x1="68" y1="244" x2="332" y2="244" stroke="#111111" strokeWidth="4" />
      <line x1="200" y1="144" x2="200" y2="396" stroke="#111111" strokeWidth="4" />
    </g>

    {/* Inner Shield Black Border Line */}
    <path 
      d="M 68 144 C 68 144 190 144 200 144 C 210 144 332 144 332 144 C 332 195 330 235 322 280 C 310 340 230 380 200 396 C 170 380 90 340 78 280 C 70 235 68 195 68 144 Z" 
      fill="none" 
      stroke="#111111" 
      strokeWidth="5" 
    />

    {/* ================= 6. CENTER INESCUTCHEON (PERISAI KERANG MUTIARA) ================= */}
    <path 
      d="M 153 202 H 247 V 268 C 247 296 211 320 200 324 C 189 320 153 296 153 268 Z" 
      fill="#DDF500" 
      stroke="#111111" 
      strokeWidth="4" 
    />

    {/* The Iconic Pearl Oyster Shell (Kerang Tanjungbalai) */}
    <g transform="translate(160, 222)">
      {/* Shell Outer Rim (White Fan) */}
      <path 
        d="M 4 28 C 4 10 16 0 40 0 C 64 0 76 10 76 28 C 76 42 62 55 40 55 C 18 55 4 42 4 28 Z" 
        fill="#FFFFFF" 
        stroke="#111" 
        strokeWidth="3" 
      />
      {/* Dark interior cavity */}
      <path 
        d="M 12 28 C 12 18 22 12 40 12 C 58 12 68 18 68 28 C 68 45 52 50 40 50 C 28 50 12 45 12 28 Z" 
        fill="#111111" 
      />
      {/* Shell ridges (Radial ribs) */}
      <line x1="40" y1="0" x2="40" y2="12" stroke="#111" strokeWidth="2.5" />
      <line x1="28" y1="2" x2="31" y2="13" stroke="#111" strokeWidth="2.5" />
      <line x1="52" y1="2" x2="49" y2="13" stroke="#111" strokeWidth="2.5" />
      <line x1="17" y1="8" x2="23" y2="17" stroke="#111" strokeWidth="2.5" />
      <line x1="63" y1="8" x2="57" y2="17" stroke="#111" strokeWidth="2.5" />
      <line x1="8" y1="18" x2="16" y2="23" stroke="#111" strokeWidth="2.5" />
      <line x1="72" y1="18" x2="64" y2="23" stroke="#111" strokeWidth="2.5" />
      <line x1="4" y1="28" x2="12" y2="28" stroke="#111" strokeWidth="2.5" />
      <line x1="76" y1="28" x2="68" y2="28" stroke="#111" strokeWidth="2.5" />
    </g>

    {/* ================= 7. BANNER / RIBBON (PITA KOTA TANJUNGBALAI) ================= */}
    <g>
      {/* Swallowtail Left */}
      <path d="M 68 418 L 28 412 L 48 428 L 28 444 L 72 436 Z" fill="#FFFFFF" stroke="#111" strokeWidth="3.5" />
      {/* Swallowtail Right */}
      <path d="M 332 418 L 372 412 L 352 428 L 372 444 L 328 436 Z" fill="#FFFFFF" stroke="#111" strokeWidth="3.5" />

      {/* Main Curved Banner */}
      <path 
        d="M 62 416 Q 200 478 338 416 L 332 454 Q 200 514 68 454 Z" 
        fill="#FFFFFF" 
        stroke="#111111" 
        strokeWidth="4" 
      />

      {/* Text on Curved Banner */}
      <path id="ribbonPath" d="M 68 468 Q 200 522 332 468" fill="none" stroke="none" />
      <text fontFamily="'Plus Jakarta Sans', Arial, sans-serif" fontWeight="900" fontSize="20" fill="#111111" letterSpacing="2">
        <textPath href="#ribbonPath" startOffset="50%" textAnchor="middle">
          KOTA TANJUNGBALAI
        </textPath>
      </text>
    </g>
  </svg>
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
