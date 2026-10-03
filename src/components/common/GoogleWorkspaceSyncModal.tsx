import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  googleSignIn, 
  googleSignOut, 
  initWorkspaceAuth, 
  getAccessToken,
  getCurrentGoogleUser,
  getOrCreateDriveFolder,
  uploadFileToDrive,
  listDriveFiles,
  deleteDriveFile,
  syncComplaintsToGoogleSheets,
  DriveFileInfo,
  SpreadsheetInfo,
  getOrCreateSpreadsheet
} from '../../services/googleWorkspaceService';
import { 
  Cloud, 
  FileSpreadsheet, 
  FolderCheck, 
  ExternalLink, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  FileText,
  LogOut,
  FolderSync,
  Sparkles,
  Database
} from 'lucide-react';
import { User } from 'firebase/auth';

interface GoogleWorkspaceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'sheets' | 'drive';
}

export const GoogleWorkspaceSyncModal: React.FC<GoogleWorkspaceSyncModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'sheets',
}) => {
  const { complaints, officialInfo } = useApp();

  const [activeTab, setActiveTab] = useState<'sheets' | 'drive'>(defaultTab);
  const [googleUser, setGoogleUser] = useState<User | null>(getCurrentGoogleUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getCurrentGoogleUser());
  const [loading, setLoading] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sheets state
  const [spreadsheetInfo, setSpreadsheetInfo] = useState<SpreadsheetInfo | null>(null);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);

  // Drive state
  const [driveFolderLink, setDriveFolderLink] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileInfo[]>([]);
  const [uploadingDrive, setUploadingDrive] = useState(false);

  // Initialize Auth
  useEffect(() => {
    const unsubscribe = initWorkspaceAuth(
      (user, _token) => {
        setGoogleUser(user);
        setIsAuthenticated(true);
      },
      () => {
        setGoogleUser(null);
        setIsAuthenticated(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // When authenticated, fetch folder info and file list
  useEffect(() => {
    if (isAuthenticated) {
      loadDriveData();
    }
  }, [isAuthenticated]);

  const loadDriveData = async () => {
    try {
      const folder = await getOrCreateDriveFolder();
      if (folder.webViewLink) {
        setDriveFolderLink(folder.webViewLink);
      }
      const files = await listDriveFiles(folder.id);
      setDriveFiles(files);
    } catch (e: any) {
      console.warn('Could not auto-load Drive files:', e.message);
    }
  };

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setIsAuthenticated(true);
        setSyncStatusMessage('Berhasil terhubung ke akun Google Workspace!');
        setTimeout(() => setSyncStatusMessage(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal login ke akun Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setIsAuthenticated(false);
    setDriveFiles([]);
    setSpreadsheetInfo(null);
    setSyncStatusMessage('Akun Google berhasil diputuskan.');
    setTimeout(() => setSyncStatusMessage(null), 3000);
  };

  // Sync to Google Sheets
  const handleSyncToSheets = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSyncStatusMessage(null);

    try {
      const res = await syncComplaintsToGoogleSheets(complaints, officialInfo);
      setSpreadsheetInfo({
        id: 'synced',
        spreadsheetUrl: res.spreadsheetUrl,
        title: 'SIPMAS_Dinsos_Tanjungbalai_Rekap_Pengaduan',
      });
      setLastSyncDate(new Date().toLocaleTimeString('id-ID'));
      setSyncStatusMessage(`Berhasil menyinkronkan ${res.updatedRows} data pengaduan ke Google Sheets!`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal menyinkronkan data ke Google Sheets');
    } finally {
      setLoading(false);
    }
  };

  // Backup all archives to Google Drive
  const handleBackupAllArchivesToDrive = async () => {
    setUploadingDrive(true);
    setErrorMessage(null);
    setSyncStatusMessage(null);

    try {
      const folder = await getOrCreateDriveFolder();
      setDriveFolderLink(folder.webViewLink || null);

      let uploadCount = 0;
      // Upload summaries of complaints as official dossier files
      for (const complaint of complaints.slice(0, 8)) {
        const klasifikasiStr = complaint.telaah?.klasifikasiList.find(k => k.ya)?.klasifikasi || '-';
        const rekomendasiStr = complaint.telaah?.rekomendasiTindakLanjut || complaint.penyelesaian?.hasilPenyelesaian || '-';
        const dossierContent = `PEMERINTAH KOTA TANJUNGBALAI\nDINAS SOSIAL\nBERKAS ARSIP DIGITAL PENGADUAN MASYARAKAT (SIPMAS)\n=========================================================\nNomor Pengaduan    : ${complaint.nomorPengaduan}\nTanggal Penerimaan : ${complaint.tanggalPenerimaan}\nNama Pengadu       : ${complaint.namaPengadu}\nNIK                : ${complaint.nik}\nNo. Telepon        : ${complaint.nomorTelepon}\nAlamat             : ${complaint.alamat}\nStatus Hubungan    : ${complaint.statusHubungan}\nMedia Pengaduan    : ${complaint.mediaPengaduan}\n\nPOKOK PENGADUAN:\n${complaint.pokokPengaduan}\n\nURAIAN KRONOLOGI:\n${complaint.uraianKronologi}\n\nPERMINTAAN / HARAPAN:\n${complaint.permintaanHarapan || '-'}\n\nHASIL PENELAAHAN:\nKlasifikasi: ${klasifikasiStr}\nKewenangan : ${complaint.kewenangan}\nPrioritas  : ${complaint.prioritas}\nStatus Saat Ini : ${complaint.status}\nBatas Waktu SLA : ${complaint.slaDeadline}\n\nCatatan Rekomendasi:\n${rekomendasiStr}\n\n[Diarsipkan secara otomatis ke Google Drive oleh SIPMAS Dinsos Tanjungbalai]`;

        const fileName = `Berkas_Pengaduan_${complaint.nomorPengaduan.replace(/\//g, '_')}.txt`;
        await uploadFileToDrive(fileName, dossierContent, 'text/plain', folder.id);
        uploadCount++;
      }

      const files = await listDriveFiles(folder.id);
      setDriveFiles(files);
      setSyncStatusMessage(`Berhasil mencadangkan ${uploadCount} berkas arsip ke folder Google Drive!`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal mengunggah berkas ke Google Drive');
    } finally {
      setUploadingDrive(false);
    }
  };

  // Upload custom file from user's machine to Google Drive
  const handleUploadCustomFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDrive(true);
    setErrorMessage(null);
    try {
      const folder = await getOrCreateDriveFolder();
      const content = await file.text();
      await uploadFileToDrive(file.name, content, file.type || 'text/plain', folder.id);

      const files = await listDriveFiles(folder.id);
      setDriveFiles(files);
      setSyncStatusMessage(`Berkas "${file.name}" berhasil diunggah ke Google Drive!`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal mengunggah berkas.');
    } finally {
      setUploadingDrive(false);
      e.target.value = '';
    }
  };

  // Delete file with user confirmation (mandatory per SKILL.md)
  const handleDeleteFile = async (file: DriveFileInfo) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus berkas "${file.name}" dari Google Drive? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    try {
      await deleteDriveFile(file.id);
      setDriveFiles(prev => prev.filter(f => f.id !== file.id));
      setSyncStatusMessage(`Berkas "${file.name}" berhasil dihapus dari Google Drive.`);
    } catch (err: any) {
      setErrorMessage('Gagal menghapus berkas dari Google Drive.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
                <Cloud className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                  <span>Penyimpanan Google Workspace</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                    Drive & Sheets
                  </span>
                </h3>
                <p className="text-xs text-emerald-100/90">
                  Sinkronisasi rekap data ke Google Sheets & penyimpanan arsip dokumen di Google Drive
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
            {/* Account Connection State */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {isAuthenticated && googleUser ? (
                <div className="flex items-center gap-3">
                  {googleUser.photoURL ? (
                    <img 
                      src={googleUser.photoURL} 
                      alt={googleUser.displayName || 'Akun Google'} 
                      className="w-11 h-11 rounded-full border-2 border-emerald-500 object-cover"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm">
                      {googleUser.email?.substring(0, 2).toUpperCase() || 'GW'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {googleUser.displayName || 'Petugas Dinsos'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terhubung
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-500">{googleUser.email}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Akun Google Belum Terhubung</h4>
                  <p className="text-xs text-slate-500">
                    Hubungkan akun Google Anda untuk menyimpan rekap ke Spreadsheet dan arsip berkas ke Drive.
                  </p>
                </div>
              )}

              {isAuthenticated ? (
                <button
                  onClick={handleSignOut}
                  className="px-3.5 py-1.5 text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Putuskan Akun</span>
                </button>
              ) : (
                /* Official Google Sign-in Button style per guidelines */
                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-xs flex items-center gap-3 cursor-pointer transition-all hover:shadow-md disabled:opacity-50 ml-auto"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>{loading ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>

            {/* Notification messages */}
            {syncStatusMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{syncStatusMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Navigation Tabs (Sheets vs Drive) */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('sheets')}
                className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
                  activeTab === 'sheets'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Google Sheets (Rekapitulasi Data)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('drive')}
                className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
                  activeTab === 'drive'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Cloud className="w-4 h-4 text-sky-600" />
                <span>Google Drive (Penyimpanan Berkas Arsip)</span>
              </button>
            </div>

            {/* TAB 1: GOOGLE SHEETS */}
            {activeTab === 'sheets' && (
              <div className="space-y-4">
                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h5 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Spreadsheet Resmi SIPMAS</span>
                    </h5>
                    <p className="text-emerald-800/80 mt-0.5">
                      Seluruh 18 kolom pengaduan (identitas pengadu, nomor aduan, telaah, prioritas, SLA, status) disinkronkan ke dalam spreadsheet Google Sheets.
                    </p>
                    {lastSyncDate && (
                      <p className="text-[11px] font-mono text-emerald-700 mt-1">
                        Terakhir disinkronkan: Hari ini pukul {lastSyncDate} WIB ({complaints.length} baris aduan)
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleSyncToSheets}
                    disabled={!isAuthenticated || loading}
                    className="shrink-0 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>{loading ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
                  </button>
                </div>

                {/* Direct Link to Google Sheets if available */}
                {spreadsheetInfo && (
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                        GS
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{spreadsheetInfo.title}</span>
                        <span className="text-slate-500 font-mono text-[11px]">Telah disinkronkan & siap diedit bersama</span>
                      </div>
                    </div>

                    <a
                      href={spreadsheetInfo.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Buka di Google Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                    </a>
                  </div>
                )}

                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">Pratinjau Data yang Disinkronkan ({complaints.length} Data):</span>
                  <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold">
                        <tr>
                          <th className="p-2">No. Aduan</th>
                          <th className="p-2">Pengadu</th>
                          <th className="p-2">Pokok Masalah</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">SLA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {complaints.slice(0, 5).map(c => (
                          <tr key={c.id}>
                            <td className="p-2 font-mono font-bold text-slate-900">{c.nomorPengaduan}</td>
                            <td className="p-2 text-slate-800">{c.namaPengadu}</td>
                            <td className="p-2 text-slate-600 truncate max-w-xs">{c.pokokPengaduan}</td>
                            <td className="p-2 font-bold text-slate-700">{c.status}</td>
                            <td className="p-2 font-mono text-slate-500">{c.slaDeadline}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GOOGLE DRIVE */}
            {activeTab === 'drive' && (
              <div className="space-y-4">
                <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h5 className="font-bold text-sky-950 text-sm flex items-center gap-1.5">
                      <FolderCheck className="w-4 h-4 text-sky-700" />
                      <span>Folder Cloud: SIPMAS_Dinsos_Tanjungbalai</span>
                    </h5>
                    <p className="text-sky-800/80 mt-0.5">
                      Penyimpanan berkas tanda terima, formulir penelaahan, surat penyaluran, dan dokumen bukti pengaduan di Google Drive.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleBackupAllArchivesToDrive}
                      disabled={!isAuthenticated || uploadingDrive}
                      className="px-4 py-2 bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <FolderSync className={`w-3.5 h-3.5 ${uploadingDrive ? 'animate-spin' : ''}`} />
                      <span>{uploadingDrive ? 'Mengunggah...' : 'Cadangkan Berkas Pengaduan'}</span>
                    </button>

                    <label className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl cursor-pointer flex items-center gap-1 text-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah File Baru</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleUploadCustomFile}
                        disabled={!isAuthenticated || uploadingDrive}
                      />
                    </label>

                    {driveFolderLink && (
                      <a
                        href={driveFolderLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer"
                        title="Buka Folder di Google Drive"
                      >
                        <ExternalLink className="w-4 h-4 text-amber-300" />
                      </a>
                    )}
                  </div>
                </div>

                {/* File List in Google Drive */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Berkas di Folder Google Drive ({driveFiles.length} Berkas):
                    </span>
                    <button
                      onClick={loadDriveData}
                      className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Muat Ulang</span>
                    </button>
                  </div>

                  {driveFiles.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      Belum ada berkas di Google Drive. Klik tombol <strong>"Cadangkan Berkas Pengaduan"</strong> di atas.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {driveFiles.map(file => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText className="w-4 h-4 text-red-700 shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-slate-800 truncate block">{file.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Diunggah: {file.createdTime ? new Date(file.createdTime).toLocaleDateString('id-ID') : '-'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <span>Buka</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteFile(file)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                              title="Hapus dari Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-500 text-[11px]">
              Kerahasiaan data terjamin dengan otentikasi resmi Google Workspace API.
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
