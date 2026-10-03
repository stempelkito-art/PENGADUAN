import React from 'react';
import { StatusPengaduan, PrioritasType, KewenanganType } from '../../types';
import { 
  Clock, 
  CheckCircle2, 
  Send, 
  FileQuestion, 
  Users, 
  XCircle, 
  AlertCircle,
  FileCheck,
  Building2,
  Sparkles
} from 'lucide-react';

interface StatusBadgeProps {
  status: StatusPengaduan;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  let colorClasses = 'bg-slate-100 text-slate-800 border-slate-300';
  let Icon = Clock;

  switch (status) {
    case 'Baru':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      Icon = AlertCircle;
      break;
    case 'Diverifikasi':
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      Icon = FileCheck;
      break;
    case 'Dalam Penelaahan':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-300';
      Icon = Clock;
      break;
    case 'Sedang Diproses':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
      Icon = Clock;
      break;
    case 'Diteruskan':
      colorClasses = 'bg-sky-50 text-sky-700 border-sky-300';
      Icon = Send;
      break;
    case 'Menunggu Data':
      colorClasses = 'bg-orange-50 text-orange-800 border-orange-200';
      Icon = FileQuestion;
      break;
    case 'Menunggu Koordinasi':
      colorClasses = 'bg-yellow-50 text-yellow-800 border-yellow-200';
      Icon = Users;
      break;
    case 'Selesai - Ditindaklanjuti':
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      Icon = CheckCircle2;
      break;
    case 'Selesai - Klarifikasi':
      colorClasses = 'bg-teal-50 text-teal-800 border-teal-300';
      Icon = CheckCircle2;
      break;
    case 'Tidak Dapat Ditindaklanjuti':
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-300';
      Icon = XCircle;
      break;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full font-medium border shadow-xs transition-colors ${colorClasses} ${sizeClasses}`}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{status}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ prioritas: PrioritasType; size?: 'sm' | 'md' }> = ({ 
  prioritas,
  size = 'md'
}) => {
  const isUrgent = prioritas === 'Mendesak';
  const isImportant = prioritas === 'Penting';

  const badgeStyle = isUrgent
    ? 'bg-rose-600 text-white border-rose-700 shadow-rose-200 animate-pulse'
    : isImportant
    ? 'bg-amber-500 text-white border-amber-600'
    : 'bg-slate-100 text-slate-700 border-slate-300';

  const sizeStyle = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-md font-semibold border shadow-xs ${badgeStyle} ${sizeStyle}`}>
      {isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
      {prioritas}
    </span>
  );
};

export const KewenanganBadge: React.FC<{ kewenangan: KewenanganType }> = ({ kewenangan }) => {
  const isDinsos = kewenangan === 'Dinas Sosial Kota Tanjungbalai';
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md font-medium border ${
      isDinsos ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-800 border-slate-300'
    }`}>
      <Building2 className="w-3.5 h-3.5 opacity-70" />
      <span className="truncate max-w-[200px]">{kewenangan}</span>
    </span>
  );
};
