import React from 'react';
import { StatusPengaduan } from '../../types';
import { Clock, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface SlaIndicatorProps {
  deadline: string; // YYYY-MM-DD
  status: StatusPengaduan;
  targetDays?: number;
  size?: 'sm' | 'md';
}

export const SlaIndicator: React.FC<SlaIndicatorProps> = ({ 
  deadline, 
  status, 
  targetDays = 7,
  size = 'md' 
}) => {
  const isDone = status.startsWith('Selesai') || status === 'Tidak Dapat Ditindaklanjuti';

  if (isDone) {
    return (
      <span className={`inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md ${
        size === 'sm' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}>
        <CheckCircle className="w-3 h-3 text-emerald-600" />
        Selesai
      </span>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffMs = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 border border-rose-300 rounded-md ${
        size === 'sm' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}>
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
        Lewat {Math.abs(diffDays)} hari
      </span>
    );
  }

  if (diffDays <= 2) {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 border border-amber-300 rounded-md ${
        size === 'sm' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        Sisa {diffDays === 0 ? 'Hari Ini' : `${diffDays} hari`}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-md ${
      size === 'sm' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
    }`}>
      <Clock className="w-3 h-3 text-slate-500" />
      Sisa {diffDays} hari
    </span>
  );
};
