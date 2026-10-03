import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCheck, Bell, AlertCircle, Info, CheckCircle, ShieldAlert } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComplaint?: (complaintId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ 
  isOpen, 
  onClose,
  onSelectComplaint 
}) => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    setViewMode,
    setSelectedComplaintId
  } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden no-print">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pemberitahuan Sistem</h3>
                <p className="text-xs text-slate-500">Notifikasi pengaduan & pembaruan status</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={markAllNotificationsRead}
                className="p-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
                title="Tandai semua dibaca"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Belum ada notifikasi baru</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUrgent = n.type === 'urgent';
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.complaintId) {
                        setViewMode('admin');
                        setSelectedComplaintId(n.complaintId);
                        onClose();
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      !n.read 
                        ? isUrgent 
                          ? 'bg-rose-50/80 border-rose-200 shadow-xs' 
                          : 'bg-blue-50/70 border-blue-200 shadow-xs'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {!n.read && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-600"></span>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'urgent' ? (
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                        ) : n.type === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <div className="text-xs font-bold text-slate-900 leading-snug">
                          {n.title}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/60 text-[10px] text-slate-400">
                          <span>{n.nomorPengaduan || 'Sistem'}</span>
                          <span>{n.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
            <p className="text-[11px] text-slate-500">
              Notifikasi terhubung dengan integrasi WhatsApp & SMS Gateway Dinsos Tanjungbalai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
