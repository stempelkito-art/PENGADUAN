import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  Complaint, 
  User, 
  UserRole, 
  AppNotification, 
  StatusPengaduan,
  AuditLog,
  DigitalFile,
  OfficialInfo
} from '../types';
import { 
  DEFAULT_USERS, 
  INITIAL_COMPLAINTS, 
  INITIAL_NOTIFICATIONS, 
  OFFICIAL_INFO 
} from '../data/initialData';

interface AppContextType {
  complaints: Complaint[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  setUserRole: (role: UserRole) => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Official Institution Info
  officialInfo: OfficialInfo;
  updateOfficialInfo: (updates: Partial<OfficialInfo>) => void;
  
  // Navigation & View
  viewMode: 'public' | 'admin';
  setViewMode: (mode: 'public' | 'admin') => void;
  adminActiveMenu: string;
  setAdminActiveMenu: (menu: string) => void;
  publicActiveTab: string;
  setPublicActiveTab: (tab: string) => void;
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;

  // Actions
  createComplaint: (data: Partial<Complaint>) => Complaint;
  updateComplaint: (id: string, updates: Partial<Complaint>, actionDescription?: string) => void;
  reviewComplaint: (id: string, telaahData: any) => void;
  distributeComplaint: (id: string, penyaluranData: any) => void;
  resolveComplaint: (id: string, penyelesaianData: any) => void;
  confirmComplaint: (id: string, konfirmasiData: any) => void;
  updateComplaintStatus: (id: string, newStatus: StatusPengaduan, reason: string) => void;
  deleteComplaint: (id: string) => void;
  uploadArsipFile: (complaintId: string, file: Partial<DigitalFile>) => void;

  // Modal Controls
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isOfficerLoggedIn: boolean;
  setIsOfficerLoggedIn: (loggedIn: boolean) => void;
  logoutOfficer: () => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Server-side Multi-PC Cloud Sync
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncTime: string | null;
  isServerConnected: boolean;
  triggerManualSync: () => Promise<void>;

  // Utilities
  resetToDefaultData: () => void;
  exportComplaintsCSV: () => void;
  backupDatabase: () => void;
  restoreDatabase: (jsonData: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_COMPLAINTS = 'sipmas_dinsos_complaints_v1';
const STORAGE_KEY_USERS = 'sipmas_dinsos_users_v1';
const STORAGE_KEY_NOTIF = 'sipmas_dinsos_notifications_v1';
const STORAGE_KEY_CURRENT_USER = 'sipmas_dinsos_current_user_v1';
const STORAGE_KEY_OFFICIAL_INFO = 'sipmas_dinsos_official_info_v1';
const STORAGE_KEY_OFFICER_AUTH = 'sipmas_dinsos_auth_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [officialInfo, setOfficialInfo] = useState<OfficialInfo>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OFFICIAL_INFO);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load official info from storage', e);
    }
    return OFFICIAL_INFO;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
      if (stored) {
        const parsed: Complaint[] = JSON.parse(stored);
        const existingIds = new Set(parsed.map(c => c.id));
        const missingDefaults = INITIAL_COMPLAINTS.filter(c => !existingIds.has(c.id));
        if (missingDefaults.length > 0) {
          const merged = [...parsed, ...missingDefaults];
          localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load complaints from storage', e);
    }
    return INITIAL_COMPLAINTS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS);
      if (stored) {
        const parsed: User[] = JSON.parse(stored);
        return parsed.map(u => {
          const defaultMatch = DEFAULT_USERS.find(du => du.id === u.id);
          return {
            ...u,
            username: u.username || defaultMatch?.username || u.email.split('@')[0] || 'petugas',
            password: u.password || defaultMatch?.password || 'dinsos123'
          };
        });
      }
    } catch (e) {
      console.error('Failed to load users from storage', e);
    }
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (stored) {
        const parsed = JSON.parse(stored);
        const match = DEFAULT_USERS.find(u => u.id === parsed.id);
        if (match) return match;
      }
    } catch (e) {}
    return DEFAULT_USERS[0]; // Admin by default
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTIF);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_NOTIFICATIONS;
  });

  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [adminActiveMenu, setAdminActiveMenu] = useState<string>('dashboard');
  const [publicActiveTab, setPublicActiveTab] = useState<string>('beranda');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isOfficerLoggedIn, setIsOfficerLoggedInState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_OFFICER_AUTH) === 'true';
    } catch (e) {
      return false;
    }
  });

  const setIsOfficerLoggedIn = (loggedIn: boolean) => {
    setIsOfficerLoggedInState(loggedIn);
    try {
      if (loggedIn) {
        localStorage.setItem(STORAGE_KEY_OFFICER_AUTH, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEY_OFFICER_AUTH);
      }
    } catch (e) {}
  };

  const logoutOfficer = () => {
    setIsOfficerLoggedIn(false);
    setViewMode('public');
    setPublicActiveTab('beranda');
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OFFICIAL_INFO, JSON.stringify(officialInfo));
    } catch (e) {}
  }, [officialInfo]);

  const updateOfficialInfo = (updates: Partial<OfficialInfo>) => {
    setOfficialInfo(prev => ({
      ...prev,
      ...updates,
      kadis: {
        ...prev.kadis,
        ...(updates.kadis || {})
      },
      slaDays: {
        mendesak: updates.slaDays?.mendesak ?? prev.slaDays?.mendesak ?? 3,
        penting: updates.slaDays?.penting ?? prev.slaDays?.penting ?? 7,
        biasa: updates.slaDays?.biasa ?? prev.slaDays?.biasa ?? 14,
      }
    }));
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
    } catch (e) {
      console.error(e);
    }
  }, [complaints]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIF, JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  // Server-Side Multi-PC Database Synchronization State
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isServerConnected, setIsServerConnected] = useState<boolean>(true);
  const initialSyncCompleted = useRef<boolean>(false);
  const syncDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Function to pull latest updates from server (other PCs)
  const fetchUpdatesFromServer = useCallback(async () => {
    try {
      const res = await fetch('/api/database');
      if (!res.ok) throw new Error('Server unreachable');
      const json = await res.json();
      if (json.exists && json.data) {
        const sData = json.data;
        setIsServerConnected(true);
        setSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));

        if (Array.isArray(sData.complaints) && sData.complaints.length > 0) {
          setComplaints(prev => {
            const serverList: Complaint[] = sData.complaints;
            if (serverList.length !== prev.length) return serverList;
            const prevMap = new Map(prev.map(c => [c.id, c]));
            for (const sc of serverList) {
              const pc = prevMap.get(sc.id);
              if (!pc || pc.status !== sc.status || (pc.auditLogs?.length || 0) !== (sc.auditLogs?.length || 0)) {
                return serverList;
              }
            }
            return prev;
          });
        }

        if (Array.isArray(sData.users) && sData.users.length > 0) {
          setUsers(prev => {
            const serverUsers: User[] = sData.users;
            return serverUsers.length !== prev.length ? serverUsers : prev;
          });
        }
      }
    } catch (err) {
      setIsServerConnected(false);
      setSyncStatus('offline');
    }
  }, []);

  // Manual Trigger Sync
  const triggerManualSync = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/database/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaints,
          users,
          officialInfo,
          notifications
        })
      });
      if (res.ok) {
        const json = await res.json();
        setIsServerConnected(true);
        setSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        if (json.data?.complaints) {
          setComplaints(json.data.complaints);
        }
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      setSyncStatus('offline');
      setIsServerConnected(false);
    }
  }, [complaints, users, officialInfo, notifications]);

  // Initial Load from Server & Multi-PC Background Polling
  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        setSyncStatus('syncing');
        const res = await fetch('/api/database');
        if (!res.ok) throw new Error('Failed to reach server');
        const json = await res.json();

        if (json.exists && json.data) {
          const s = json.data;
          if (isMounted) {
            if (Array.isArray(s.complaints) && s.complaints.length > 0) {
              setComplaints(s.complaints);
            }
            if (Array.isArray(s.users) && s.users.length > 0) {
              setUsers(s.users);
            }
            if (s.officialInfo) {
              setOfficialInfo(s.officialInfo);
            }
            if (Array.isArray(s.notifications) && s.notifications.length > 0) {
              setNotifications(s.notifications);
            }
            setIsServerConnected(true);
            setSyncStatus('synced');
            setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
          }
        } else {
          // Initialize server with default local dataset
          await fetch('/api/database', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              complaints,
              users,
              officialInfo,
              notifications,
              updatedBy: 'initialization'
            })
          });
          if (isMounted) {
            setIsServerConnected(true);
            setSyncStatus('synced');
            setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
          }
        }
      } catch (err) {
        console.warn('Server sync initial load warning:', err);
        if (isMounted) {
          setSyncStatus('offline');
          setIsServerConnected(false);
        }
      } finally {
        initialSyncCompleted.current = true;
      }
    }

    initialLoad();

    // Poll server every 12 seconds so updates made from other PCs appear automatically
    const pollInterval = setInterval(() => {
      fetchUpdatesFromServer();
    }, 12000);

    const onFocus = () => {
      fetchUpdatesFromServer();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchUpdatesFromServer]);

  // Debounced Auto-Sync to Server on local changes
  useEffect(() => {
    if (!initialSyncCompleted.current) return;

    if (syncDebounceRef.current) {
      clearTimeout(syncDebounceRef.current);
    }

    syncDebounceRef.current = setTimeout(async () => {
      try {
        setSyncStatus('syncing');
        const res = await fetch('/api/database/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            complaints,
            users,
            officialInfo,
            notifications
          })
        });
        if (res.ok) {
          setIsServerConnected(true);
          setSyncStatus('synced');
          setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        }
      } catch (err) {
        setSyncStatus('offline');
      }
    }, 700);

    return () => {
      if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    };
  }, [complaints, users, officialInfo, notifications]);

  const setUserRole = (role: UserRole) => {
    const target = users.find(u => u.role === role) || {
      id: `user-${role.toLowerCase()}`,
      nama: role === 'MASYARAKAT' ? 'Masyarakat Pemohon' : `Petugas ${role}`,
      email: `${role.toLowerCase()}@tanjungbalaikota.go.id`,
      role,
      jabatan: role === 'MASYARAKAT' ? 'Masyarakat Umum' : `Petugas Bidang ${role}`,
    };
    setCurrentUser(target);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const defaultUsername = userData.username || userData.email.split('@')[0] || userData.nama.toLowerCase().replace(/[^a-z0-9]/g, '') || 'petugas';
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      username: defaultUsername,
      password: userData.password || 'dinsos123'
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    setCurrentUser(prev => (prev.id === id ? { ...prev, ...updates } : prev));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Helper to format Date
  const formatDateTime = (date: Date = new Date()) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const calculateDeadline = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Generate Unique Complaint Number: PDM/DSKT/2026/00000X
  const generateComplaintNumber = (): string => {
    const year = new Date().getFullYear();
    const count = complaints.length + 1;
    const padded = String(count).padStart(6, '0');
    return `PDM/DSKT/${year}/${padded}`;
  };

  // Create Complaint
  const createComplaint = (data: Partial<Complaint>): Complaint => {
    const nowStr = formatDateTime();
    const nomor = generateComplaintNumber();
    const id = `complaint-${Date.now()}`;
    const targetDays = data.prioritas === 'Mendesak' ? 3 : data.prioritas === 'Penting' ? 7 : 14;

    const initialAudit: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: nowStr,
      user: data.namaPengadu || currentUser.nama,
      role: currentUser.role,
      action: 'Penerimaan Pengaduan Baru',
      detail: `Pengaduan berhasil didaftarkan melalui media ${data.mediaPengaduan || 'Website'}. Nomor Pengaduan: ${nomor}`,
    };

    const initialDigitalFiles: DigitalFile[] = [];
    if (data.dokumenPendukung) {
      data.dokumenPendukung.forEach((doc, idx) => {
        if (doc.ada && doc.fileName) {
          initialDigitalFiles.push({
            id: `file-${Date.now()}-${idx}`,
            kategori: doc.uraian.includes('KTP') || doc.uraian.includes('KK') ? 'Identitas' : 'Bukti Pengaduan',
            namaFile: doc.fileName,
            tanggal: nowStr.split(' ')[0],
            ukuran: doc.fileSize || '1.0 MB',
            diunggahOleh: currentUser.nama || 'Pengadu'
          });
        }
      });
    }

    const newComplaint: Complaint = {
      id,
      nomorPengaduan: nomor,
      tanggalPenerimaan: data.tanggalPenerimaan || nowStr,
      mediaPengaduan: data.mediaPengaduan || 'Website',
      mediaLainnya: data.mediaLainnya,
      petugasPenerima: data.petugasPenerima || 'Petugas Front Office Dinsos',
      namaPengadu: data.namaPengadu || '',
      nik: data.nik || '',
      alamat: data.alamat || '',
      nomorTelepon: data.nomorTelepon || '',
      email: data.email || '',
      statusHubungan: data.statusHubungan || 'Diri sendiri',
      statusHubunganLainnya: data.statusHubunganLainnya,
      pokokPengaduan: data.pokokPengaduan || '',
      uraianKronologi: data.uraianKronologi || '',
      permintaanHarapan: data.permintaanHarapan || '',
      dokumenPendukung: data.dokumenPendukung || [],
      catatanPetugasPenerima: data.catatanPetugasPenerima || '',
      ttdPengadu: data.ttdPengadu || data.namaPengadu || '',
      ttdPetugasPenerima: data.ttdPetugasPenerima || 'Aisyah Putri, S.Sos',
      status: 'Baru',
      prioritas: data.prioritas || 'Biasa',
      kewenangan: 'Dinas Sosial Kota Tanjungbalai',
      slaTargetHari: targetDays,
      slaDeadline: calculateDeadline(targetDays),
      auditLogs: [initialAudit],
      arsipDigital: initialDigitalFiles,
    };

    setComplaints(prev => [newComplaint, ...prev]);

    // Push notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Pengaduan Baru Terdaftar',
      message: `Nomor ${nomor} dari ${data.namaPengadu} berhasil masuk sistem.`,
      nomorPengaduan: nomor,
      complaintId: id,
      type: data.prioritas === 'Mendesak' ? 'urgent' : 'info',
      timestamp: nowStr,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newComplaint;
  };

  // Update generic fields
  const updateComplaint = (id: string, updates: Partial<Complaint>, actionDescription?: string) => {
    const nowStr = formatDateTime();
    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, ...updates };
      if (actionDescription) {
        updated.auditLogs = [
          ...updated.auditLogs,
          {
            id: `log-${Date.now()}`,
            timestamp: nowStr,
            user: currentUser.nama,
            role: currentUser.role,
            action: 'Pembaruan Data',
            detail: actionDescription,
          }
        ];
      }
      return updated;
    }));
  };

  // Review & Classification
  const reviewComplaint = (id: string, telaahData: any) => {
    const nowStr = formatDateTime();
    const isDinsos = telaahData.kewenangan === 'Dinas Sosial Kota Tanjungbalai';
    const newStatus: StatusPengaduan = isDinsos ? 'Sedang Diproses' : 'Diteruskan';
    const targetDays = telaahData.prioritas === 'Mendesak' ? 3 : telaahData.prioritas === 'Penting' ? 7 : 14;

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newAudit: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        user: currentUser.nama,
        role: currentUser.role,
        action: 'Penelaahan & Pengklasifikasian',
        detail: `Hasil telaah: Kewenangan [${telaahData.kewenangan}], Prioritas [${telaahData.prioritas}]. Status diubah ke ${newStatus}.`,
      };

      const telaahFile: DigitalFile = {
        id: `file-telaah-${Date.now()}`,
        kategori: 'Penelaahan',
        namaFile: `Lembar_Telaah_${c.nomorPengaduan.replace(/\//g, '_')}.pdf`,
        tanggal: nowStr.split(' ')[0],
        ukuran: '420 KB',
        diunggahOleh: currentUser.nama,
      };

      return {
        ...c,
        telaah: telaahData,
        status: newStatus,
        kewenangan: telaahData.kewenangan,
        prioritas: telaahData.prioritas,
        slaTargetHari: targetDays,
        slaDeadline: calculateDeadline(targetDays),
        auditLogs: [...c.auditLogs, newAudit],
        arsipDigital: [...c.arsipDigital, telaahFile],
      };
    }));

    // Notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Pengaduan Telah Ditelaah',
      message: `Hasil telaah telah disimpan untuk pengaduan #${id}.`,
      complaintId: id,
      type: 'info',
      timestamp: nowStr,
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Distribution (Penyaluran)
  const distributeComplaint = (id: string, penyaluranData: any) => {
    const nowStr = formatDateTime();
    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newAudit: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        user: currentUser.nama,
        role: currentUser.role,
        action: 'Penerbitan Surat Penyaluran',
        detail: `Surat Penyaluran resmi No. ${penyaluranData.nomorSuratPenyaluran} diterbitkan kepada ${penyaluranData.kepada}.`,
      };

      const suratFile: DigitalFile = {
        id: `file-surat-${Date.now()}`,
        kategori: 'Surat Penyaluran',
        namaFile: `Surat_Penyaluran_${penyaluranData.nomorSuratPenyaluran.replace(/\//g, '_')}.pdf`,
        tanggal: nowStr.split(' ')[0],
        ukuran: '550 KB',
        diunggahOleh: currentUser.nama,
      };

      return {
        ...c,
        penyaluran: penyaluranData,
        status: 'Diteruskan',
        auditLogs: [...c.auditLogs, newAudit],
        arsipDigital: [...c.arsipDigital, suratFile],
      };
    }));

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Surat Penyaluran Diterbitkan',
      message: `Pengaduan disalurkan ke ${penyaluranData.kepada}.`,
      complaintId: id,
      type: 'warning',
      timestamp: nowStr,
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Resolution (Penyelesaian)
  const resolveComplaint = (id: string, penyelesaianData: any) => {
    const nowStr = formatDateTime();
    let targetStatus: StatusPengaduan = 'Selesai - Ditindaklanjuti';
    if (penyelesaianData.statusPilihan.includes('klarifikasi')) {
      targetStatus = 'Selesai - Klarifikasi';
    } else if (penyelesaianData.statusPilihan.includes('menunggu data')) {
      targetStatus = 'Menunggu Data';
    } else if (penyelesaianData.statusPilihan.includes('menunggu koordinasi')) {
      targetStatus = 'Menunggu Koordinasi';
    } else if (penyelesaianData.statusPilihan.includes('Tidak dapat ditindaklanjuti')) {
      targetStatus = 'Tidak Dapat Ditindaklanjuti';
    }

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newAudit: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        user: currentUser.nama,
        role: currentUser.role,
        action: 'Penyelesaian Pengaduan',
        detail: `Tindakan penyelesaian diinput. Status diubah ke ${targetStatus}.`,
      };

      const filesToAdd: DigitalFile[] = [];
      if (penyelesaianData.dokumenBukti) {
        penyelesaianData.dokumenBukti.forEach((doc: any, i: number) => {
          filesToAdd.push({
            id: `file-res-${Date.now()}-${i}`,
            kategori: 'Penyelesaian',
            namaFile: doc.nama || `Bukti_Penyelesaian_${i + 1}.pdf`,
            tanggal: nowStr.split(' ')[0],
            ukuran: doc.ukuran || '1.0 MB',
            diunggahOleh: currentUser.nama,
          });
        });
      }

      return {
        ...c,
        penyelesaian: penyelesaianData,
        status: targetStatus,
        auditLogs: [...c.auditLogs, newAudit],
        arsipDigital: [...c.arsipDigital, ...filesToAdd],
      };
    }));

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Penyelesaian Pengaduan Dicatat',
      message: `Tindakan penyelesaian untuk pengaduan #${id} berhasil disimpan.`,
      complaintId: id,
      type: 'success',
      timestamp: nowStr,
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Confirmation (Konfirmasi Pengadu)
  const confirmComplaint = (id: string, konfirmasiData: any) => {
    const nowStr = formatDateTime();
    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newAudit: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        user: currentUser.nama,
        role: currentUser.role,
        action: 'Konfirmasi Pengadu',
        detail: `Hasil penyampaian via ${konfirmasiData.mediaPenyampaian}. Tanggapan: ${konfirmasiData.konfirmasi}.`,
      };

      const konfirmasiFile: DigitalFile = {
        id: `file-konf-${Date.now()}`,
        kategori: 'Konfirmasi',
        namaFile: `Berita_Acara_Konfirmasi_${c.nomorPengaduan.replace(/\//g, '_')}.pdf`,
        tanggal: nowStr.split(' ')[0],
        ukuran: '320 KB',
        diunggahOleh: currentUser.nama,
      };

      return {
        ...c,
        konfirmasi: konfirmasiData,
        auditLogs: [...c.auditLogs, newAudit],
        arsipDigital: [...c.arsipDigital, konfirmasiFile],
      };
    }));

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Konfirmasi Pengadu Selesai',
      message: `Berita acara konfirmasi warga #${id} telah tuntas.`,
      complaintId: id,
      type: 'success',
      timestamp: nowStr,
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Manual Status Update
  const updateComplaintStatus = (id: string, newStatus: StatusPengaduan, reason: string) => {
    const nowStr = formatDateTime();
    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        status: newStatus,
        auditLogs: [
          ...c.auditLogs,
          {
            id: `log-${Date.now()}`,
            timestamp: nowStr,
            user: currentUser.nama,
            role: currentUser.role,
            action: 'Perubahan Status Pengaduan',
            detail: `Status diubah dari [${c.status}] menjadi [${newStatus}]. Alasan: ${reason}`,
          }
        ]
      };
    }));
  };

  // Upload to digital archive
  const uploadArsipFile = (complaintId: string, file: Partial<DigitalFile>) => {
    const nowStr = formatDateTime();
    const newFile: DigitalFile = {
      id: `file-${Date.now()}`,
      kategori: file.kategori || 'Dokumen Tindak Lanjut',
      namaFile: file.namaFile || 'Dokumen_Tambahan.pdf',
      tanggal: nowStr.split(' ')[0],
      ukuran: file.ukuran || '1.2 MB',
      diunggahOleh: currentUser.nama,
    };

    setComplaints(prev => prev.map(c => {
      if (c.id !== complaintId) return c;
      return {
        ...c,
        arsipDigital: [...c.arsipDigital, newFile],
        auditLogs: [
          ...c.auditLogs,
          {
            id: `log-${Date.now()}`,
            timestamp: nowStr,
            user: currentUser.nama,
            role: currentUser.role,
            action: 'Upload Dokumen Arsip',
            detail: `Mengunggah file ${newFile.namaFile} pada kategori ${newFile.kategori}.`,
          }
        ]
      };
    }));
  };

  const deleteComplaint = (id: string) => {
    setComplaints(prev => prev.filter(c => c.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEY_COMPLAINTS);
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_NOTIF);
    localStorage.removeItem(STORAGE_KEY_OFFICIAL_INFO);
    setComplaints(INITIAL_COMPLAINTS);
    setUsers(DEFAULT_USERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setOfficialInfo(OFFICIAL_INFO);

    // Sync reset to server
    fetch('/api/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complaints: INITIAL_COMPLAINTS,
        users: DEFAULT_USERS,
        officialInfo: OFFICIAL_INFO,
        notifications: INITIAL_NOTIFICATIONS,
        updatedBy: 'reset-defaults'
      })
    }).catch(err => console.warn('Failed resetting server db:', err));
  };

  const exportComplaintsCSV = () => {
    const headers = [
      'Nomor Pengaduan',
      'Tanggal Penerimaan',
      'Media',
      'Nama Pengadu',
      'NIK (Masked)',
      'No Telp',
      'Pokok Pengaduan',
      'Klasifikasi Utama',
      'Kewenangan',
      'Prioritas',
      'Status',
      'Deadline SLA'
    ];

    const rows = complaints.map(c => [
      `"${c.nomorPengaduan}"`,
      `"${c.tanggalPenerimaan}"`,
      `"${c.mediaPengaduan}"`,
      `"${c.namaPengadu.replace(/"/g, '""')}"`,
      `"${c.nik.substring(0, 6)}******${c.nik.substring(12)}"`,
      `"${c.nomorTelepon}"`,
      `"${c.pokokPengaduan.replace(/"/g, '""')}"`,
      `"${c.telaah?.klasifikasiList.find(k => k.ya)?.klasifikasi || '-'}"`,
      `"${c.kewenangan}"`,
      `"${c.prioritas}"`,
      `"${c.status}"`,
      `"${c.slaDeadline}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Pengaduan_Dinsos_Tanjungbalai_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const backupDatabase = () => {
    const data = {
      instansi: officialInfo,
      backupDate: new Date().toISOString(),
      complaints,
      users,
      notifications
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_SIPMAS_Dinsos_Tanjungbalai_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const restoreDatabase = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.complaints && Array.isArray(parsed.complaints)) {
        setComplaints(parsed.complaints);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.instansi) setOfficialInfo(parsed.instansi);

        // Immediate sync to server database
        fetch('/api/database', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            complaints: parsed.complaints,
            users: parsed.users || users,
            officialInfo: parsed.instansi || officialInfo,
            notifications: parsed.notifications || notifications,
            updatedBy: 'restored-backup'
          })
        }).catch(err => console.warn('Failed syncing restored db to server:', err));

        return true;
      }
    } catch (e) {
      console.error('Invalid backup format', e);
    }
    return false;
  };

  return (
    <AppContext.Provider value={{
      complaints,
      currentUser,
      setCurrentUser,
      setUserRole,
      users,
      addUser,
      updateUser,
      deleteUser,
      officialInfo,
      updateOfficialInfo,
      viewMode,
      setViewMode,
      adminActiveMenu,
      setAdminActiveMenu,
      publicActiveTab,
      setPublicActiveTab,
      selectedComplaintId,
      setSelectedComplaintId,
      createComplaint,
      updateComplaint,
      reviewComplaint,
      distributeComplaint,
      resolveComplaint,
      confirmComplaint,
      updateComplaintStatus,
      deleteComplaint,
      uploadArsipFile,
      isLoginModalOpen,
      openLoginModal,
      closeLoginModal,
      isOfficerLoggedIn,
      setIsOfficerLoggedIn,
      logoutOfficer,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      syncStatus,
      lastSyncTime,
      isServerConnected,
      triggerManualSync,
      resetToDefaultData,
      exportComplaintsCSV,
      backupDatabase,
      restoreDatabase
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
