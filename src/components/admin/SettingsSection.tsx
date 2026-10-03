import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  Clock, 
  Building2, 
  Bell, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  Database, 
  Upload, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  UserCheck, 
  Check,
  Cloud,
  FileSpreadsheet
} from 'lucide-react';
import { GoogleWorkspaceSyncModal } from '../common/GoogleWorkspaceSyncModal';

export const SettingsSection: React.FC = () => {
  const { 
    officialInfo, 
    updateOfficialInfo, 
    resetToDefaultData, 
    backupDatabase, 
    restoreDatabase 
  } = useApp();

  // Form states for Institution / Agency Info
  const [instansi, setInstansi] = useState(officialInfo.instansi);
  const [dinas, setDinas] = useState(officialInfo.dinas);
  const [alamat, setAlamat] = useState(officialInfo.alamat);
  const [telepon, setTelepon] = useState(officialInfo.telepon || '(0623) 92086');
  const [website, setWebsite] = useState(officialInfo.website);
  const [email, setEmail] = useState(officialInfo.email);
  const [kotaKodePos, setKotaKodePos] = useState(officialInfo.kotaKodePos);

  // Pejabat Kepala Dinas
  const [kadisNama, setKadisNama] = useState(officialInfo.kadis.nama);
  const [kadisNip, setKadisNip] = useState(officialInfo.kadis.nip);
  const [kadisJabatan, setKadisJabatan] = useState(officialInfo.kadis.jabatan);
  const [kadisPangkat, setKadisPangkat] = useState(officialInfo.kadis.pangkat);

  // SLA Configuration
  const [slaMendesak, setSlaMendesak] = useState(String(officialInfo.slaDays?.mendesak || 3));
  const [slaPenting, setSlaPenting] = useState(String(officialInfo.slaDays?.penting || 7));
  const [slaBiasa, setSlaBiasa] = useState(String(officialInfo.slaDays?.biasa || 14));

  // Gateway configurations
  const [waGatewayUrl, setWaGatewayUrl] = useState('https://api.whatsapp-gateway.dinsostanjungbalai.go.id/v1/send');
  const [emailSmtp, setEmailSmtp] = useState('smtp.tanjungbalaikota.go.id');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState('');

  // Google Workspace Cloud state
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleModalTab, setGoogleModalTab] = useState<'sheets' | 'drive'>('sheets');

  // Sync state if officialInfo changes externally
  useEffect(() => {
    setInstansi(officialInfo.instansi);
    setDinas(officialInfo.dinas);
    setAlamat(officialInfo.alamat);
    setTelepon(officialInfo.telepon || '(0623) 92086');
    setWebsite(officialInfo.website);
    setEmail(officialInfo.email);
    setKotaKodePos(officialInfo.kotaKodePos);
    setKadisNama(officialInfo.kadis.nama);
    setKadisNip(officialInfo.kadis.nip);
    setKadisJabatan(officialInfo.kadis.jabatan);
    setKadisPangkat(officialInfo.kadis.pangkat);
    setSlaMendesak(String(officialInfo.slaDays?.mendesak || 3));
    setSlaPenting(String(officialInfo.slaDays?.penting || 7));
    setSlaBiasa(String(officialInfo.slaDays?.biasa || 14));
  }, [officialInfo]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateOfficialInfo({
      instansi: instansi.trim(),
      dinas: dinas.trim(),
      alamat: alamat.trim(),
      telepon: telepon.trim(),
      website: website.trim(),
      email: email.trim(),
      kotaKodePos: kotaKodePos.trim(),
      kadis: {
        nama: kadisNama.trim(),
        nip: kadisNip.trim(),
        jabatan: kadisJabatan.trim(),
        pangkat: kadisPangkat.trim(),
      },
      slaDays: {
        mendesak: Number(slaMendesak) || 3,
        penting: Number(slaPenting) || 7,
        biasa: Number(slaBiasa) || 14,
      }
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const ok = restoreDatabase(text);
          if (ok) {
            setRestoreMessage('Database berhasil dipulihkan dari cadangan.');
            setTimeout(() => setRestoreMessage(''), 4000);
          } else {
            setRestoreMessage('Gagal memulihkan file cadangan. Format JSON tidak valid.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Pengaturan Informasi & Konfigurasi Sistem
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ubah identitas resmi instansi, alamat, kontak, pejabat penandatangan, dan target waktu SLA.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-2.5 px-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Semua Informasi Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. INFORMASI RESMI INSTANSI & KOP SURAT */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b pb-3">
            <Building2 className="w-5 h-5 text-red-700" />
            <span>Identitas Instansi & Dokumen Resmi (Kop Surat)</span>
          </div>

          <p className="text-xs text-slate-500">
            Perubahan pada bagian ini akan otomatis memperbarui Kop Surat dan lembar cetak formulir resmi di seluruh aplikasi.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Pemerintah / Instansi Atas:</label>
              <input
                type="text"
                required
                value={instansi}
                onChange={(e) => setInstansi(e.target.value)}
                placeholder="Contoh: PEMERINTAH KOTA TANJUNGBALAI"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold uppercase text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Dinas / Satuan Kerja:</label>
              <input
                type="text"
                required
                value={dinas}
                onChange={(e) => setDinas(e.target.value)}
                placeholder="Contoh: DINAS SOSIAL"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold uppercase text-slate-900 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap Kantor:</label>
              <input
                type="text"
                required
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Contoh: JLN. JENDERAL SUDIRMAN KM. 1,5 TELP. (0623) 92086"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / Hotline:</label>
              <input
                type="text"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="Contoh: (0623) 92086"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kota & Kode Pos:</label>
              <input
                type="text"
                value={kotaKodePos}
                onChange={(e) => setKotaKodePos(e.target.value)}
                placeholder="Contoh: TANJUNGBALAI - 21368"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Resmi Kedinasan:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: dinsos@tanjungbalaikota.go.id"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Website Portal Resmi:</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Contoh: dinsos.tanjungbalaikota.go.id"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 2. PEJABAT PENANDATANGAN RESMI (KEPALA DINAS) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b pb-3">
            <UserCheck className="w-5 h-5 text-red-700" />
            <span>Pejabat Penandatangan Resmi (Kepala Dinas)</span>
          </div>

          <p className="text-xs text-slate-500">
            Identitas Kepala Dinas yang tercetak pada lembar pengesahan tanda terima, surat penyaluran, dan lembar telaah.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar Kepala Dinas:</label>
              <input
                type="text"
                required
                value={kadisNama}
                onChange={(e) => setKadisNama(e.target.value)}
                placeholder="Contoh: ZUL ABDIMAN, S.Kom., M.M"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NIP Kepala Dinas:</label>
              <input
                type="text"
                required
                value={kadisNip}
                onChange={(e) => setKadisNip(e.target.value)}
                placeholder="Contoh: 19741228 200003 1 003"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jabatan Resmi Dinas:</label>
              <input
                type="text"
                required
                value={kadisJabatan}
                onChange={(e) => setKadisJabatan(e.target.value)}
                placeholder="Contoh: KEPALA DINAS SOSIAL KOTA TANJUNGBALAI"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pangkat & Golongan Ruang:</label>
              <input
                type="text"
                value={kadisPangkat}
                onChange={(e) => setKadisPangkat(e.target.value)}
                placeholder="Contoh: Pembina Utama Muda (IV/c)"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 3. TARGET WAKTU PENYELESAIAN (SLA) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b pb-3">
            <Clock className="w-5 h-5 text-red-700" />
            <span>Target Standar Waktu Pelayanan (SLA Target Hari Kerja)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-rose-700 mb-1">Prioritas Mendesak (Hari Kerja):</label>
              <input
                type="number"
                min="1"
                max="10"
                value={slaMendesak}
                onChange={(e) => setSlaMendesak(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
              <span className="text-[10px] text-slate-400">Untuk darurat jenazah, bencana, evakuasi</span>
            </div>

            <div>
              <label className="block font-bold text-amber-700 mb-1">Prioritas Penting (Hari Kerja):</label>
              <input
                type="number"
                min="1"
                max="30"
                value={slaPenting}
                onChange={(e) => setSlaPenting(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
              <span className="text-[10px] text-slate-400">Bansos PKH, lansia, disabilitas, PBI JKN</span>
            </div>

            <div>
              <label className="block font-bold text-blue-700 mb-1">Prioritas Biasa (Hari Kerja):</label>
              <input
                type="number"
                min="1"
                max="60"
                value={slaBiasa}
                onChange={(e) => setSlaBiasa(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
              <span className="text-[10px] text-slate-400">Permohonan informasi, pendaftaran LKS</span>
            </div>
          </div>
        </div>

        {/* 4. INTEGRASI KANAL NOTIFIKASI */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b pb-3">
            <Bell className="w-5 h-5 text-red-700" />
            <span>Integrasi Kanal Notifikasi (WhatsApp & Email Gateway)</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Endpoint WhatsApp Gateway:</label>
              <input
                type="text"
                value={waGatewayUrl}
                onChange={(e) => setWaGatewayUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Server SMTP Email Dinsos:</label>
              <input
                type="text"
                value={emailSmtp}
                onChange={(e) => setEmailSmtp(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* 5. PENYIMPANAN CLOUD GOOGLE WORKSPACE */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Cloud className="w-5 h-5 text-emerald-700" />
              <span>Penyimpanan Berkas Cloud (Google Drive & Google Sheets)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Integrasi Resmi
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Hubungkan akun Google petugas untuk menyimpan dan menyinkronkan seluruh rekap pengaduan ke <strong>Google Sheets</strong> dan mencadangkan berkas arsip resmi ke folder <strong>Google Drive</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                setGoogleModalTab('sheets');
                setGoogleModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-98"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Sinkronkan ke Google Sheets</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setGoogleModalTab('drive');
                setGoogleModalOpen(true);
              }}
              className="px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-98"
            >
              <Cloud className="w-4 h-4 text-sky-200" />
              <span>Buka Penyimpanan Google Drive</span>
            </button>
          </div>
        </div>

        {/* 6. CADANGAN & RESET DATA */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b pb-3">
            <Database className="w-5 h-5 text-red-700" />
            <span>Cadangan & Pemulihan Database (Backup & Restore)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              onClick={backupDatabase}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Database className="w-4 h-4" />
              <span>Unduh Cadangan JSON</span>
            </button>

            <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 border border-slate-300">
              <Upload className="w-4 h-4" />
              <span>Pulihkan Database dari JSON</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestoreFile}
              />
            </label>

            <button
              type="button"
              onClick={() => {
                if (confirm('Kembalikan seluruh data demo ke kondisi awal Dinas Sosial Kota Tanjungbalai?')) {
                  resetToDefaultData();
                  alert('Data dan konfigurasi sistem telah dikembalikan ke kondisi awal!');
                }
              }}
              className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Data Demo</span>
            </button>
          </div>

          {restoreMessage && (
            <p className="text-xs font-semibold text-emerald-700 mt-2 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
              {restoreMessage}
            </p>
          )}
        </div>

        {/* TOMBOL SIMPAN PENGATURAN */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 bg-red-700 hover:bg-red-800 active:scale-98 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-900/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Perubahan Disimpan!' : 'Simpan Semua Informasi & Pengaturan'}</span>
          </button>
        </div>
      </form>

      {/* Google Workspace Cloud Modal */}
      <GoogleWorkspaceSyncModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        defaultTab={googleModalTab}
      />
    </div>
  );
};
