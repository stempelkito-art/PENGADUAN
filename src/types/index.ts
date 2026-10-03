export type MediaPengaduan = 
  | 'Tatap Muka'
  | 'Surat'
  | 'Telepon'
  | 'WhatsApp'
  | 'Email'
  | 'Website'
  | 'Lainnya';

export type StatusHubungan = 
  | 'Diri sendiri'
  | 'Keluarga'
  | 'Masyarakat'
  | 'Lembaga'
  | 'Lainnya';

export type KewenanganType = 
  | 'Dinas Sosial Kota Tanjungbalai'
  | 'Perangkat Daerah lain di Kota Tanjungbalai'
  | 'Pemerintah Provinsi'
  | 'Pemerintah Pusat'
  | 'Instansi/Lembaga lain'
  | 'Bukan kewenangan pemerintah';

export type PrioritasType = 'Biasa' | 'Penting' | 'Mendesak';

export type StatusPengaduan = 
  | 'Baru'
  | 'Diverifikasi'
  | 'Dalam Penelaahan'
  | 'Sedang Diproses'
  | 'Diteruskan'
  | 'Menunggu Data'
  | 'Menunggu Koordinasi'
  | 'Selesai - Ditindaklanjuti'
  | 'Selesai - Klarifikasi'
  | 'Tidak Dapat Ditindaklanjuti';

export type UserRole = 
  | 'ADMIN'
  | 'PETUGAS_PENERIMA'
  | 'PETUGAS_PENELAAH'
  | 'PETUGAS_PENYELESAIAN'
  | 'PIMPINAN'
  | 'MASYARAKAT';

export interface OfficialInfo {
  instansi: string;
  dinas: string;
  alamat: string;
  telepon?: string;
  website: string;
  email: string;
  kotaKodePos: string;
  kadis: {
    nama: string;
    nip: string;
    jabatan: string;
    pangkat: string;
  };
  slaDays?: {
    mendesak: number;
    penting: number;
    biasa: number;
  };
}

export interface User {
  id: string;
  nama: string;
  nip?: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  jabatan: string;
  avatar?: string;
}

export interface DokumenPendukungItem {
  no: number;
  uraian: string;
  ada: boolean;
  keterangan: string;
  fileName?: string;
  fileSize?: string;
  uploadDate?: string;
}

export interface AspekTelaahItem {
  no: number;
  aspek: string;
  ya: boolean;
  catatan: string;
}

export interface KlasifikasiItem {
  no: number;
  klasifikasi: string;
  ya: boolean;
  keterangan: string;
}

export interface PenyaluranTujuanItem {
  no: number;
  tujuanUnit: string;
  jenisPenyaluran: 'Surat' | 'Sistem' | 'Email' | 'Lainnya';
  keterangan: string;
}

export interface PenyaluranRecord {
  tanggalPenyaluran: string;
  nomorSuratPenyaluran: string;
  dari: string;
  kepada: string;
  namaPengadu: string;
  pokokPengaduan: string;
  ringkasanPengaduan?: string;
  hasilPenelaahan: string;
  alasanPenyaluran: string;
  tujuanList: PenyaluranTujuanItem[];
  statusMonitoring?: string;
  pejabatNama: string;
  pejabatNip: string;
}

export interface PenyelesaianRecord {
  tanggalPenyelesaian: string;
  petugasPelaksana: string;
  nipPelaksana?: string;
  verifikasiKlarifikasi: string;
  tindakanDilakukan: string;
  hasilPenyelesaian: string;
  dokumenBukti: Array<{
    id: string;
    nama: string;
    ukuran?: string;
    tanggal: string;
  }>;
  statusPilihan: string;
  statusKeterangan: string;
}

export interface KonfirmasiPengaduRecord {
  tanggalPenyampaianHasil: string;
  mediaPenyampaian: 'Tatap muka' | 'Surat' | 'Telepon' | 'WhatsApp' | 'Email' | 'Lainnya';
  tanggapanPengadu: string;
  konfirmasi: 'Pengadu menerima hasil penyelesaian' | 'Pengadu masih memerlukan tindak lanjut';
  ttdPengadu: string;
  ttdPetugas: string;
  nipPetugas: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  detail: string;
}

export interface DigitalFile {
  id: string;
  kategori: 'Identitas' | 'Bukti Pengaduan' | 'Penelaahan' | 'Surat Penyaluran' | 'Tindak Lanjut' | 'Dokumen Tindak Lanjut' | 'Penyelesaian' | 'Konfirmasi';
  namaFile: string;
  tanggal: string;
  ukuran: string;
  diunggahOleh: string;
}

export interface Complaint {
  id: string;
  nomorPengaduan: string; // misal PDM/DSKT/2026/000001
  tanggalPenerimaan: string; // YYYY-MM-DD HH:mm
  mediaPengaduan: MediaPengaduan;
  mediaLainnya?: string;
  petugasPenerima: string;
  
  // A. Identitas Pengadu
  namaPengadu: string;
  nik: string;
  alamat: string;
  nomorTelepon: string;
  email: string;
  statusHubungan: StatusHubungan;
  statusHubunganLainnya?: string;

  // B. Uraian Pengaduan
  pokokPengaduan: string;
  uraianKronologi: string;
  permintaanHarapan: string;

  // C. Dokumen Bukti Pendukung
  dokumenPendukung: DokumenPendukungItem[];
  catatanPetugasPenerima: string;
  ttdPengadu: string;
  ttdPetugasPenerima: string;

  // Penelaahan & Klasifikasi
  telaah?: {
    tanggalTelaah: string;
    petugasPenelaah: string;
    nipPenelaah: string;
    aspekTelaah: AspekTelaahItem[];
    klasifikasiList: KlasifikasiItem[];
    klasifikasiLainnya?: string;
    kewenangan: KewenanganType;
    prioritas: PrioritasType;
    rekomendasiTindakLanjut: string;
    hasilTelaahAnalisis: string;
  };

  // Penyaluran
  penyaluran?: PenyaluranRecord;

  // Penyelesaian
  penyelesaian?: PenyelesaianRecord;

  // Konfirmasi
  konfirmasi?: KonfirmasiPengaduRecord;

  // Status & SLA
  status: StatusPengaduan;
  prioritas: PrioritasType;
  kewenangan: KewenanganType;
  slaTargetHari: number;
  slaDeadline: string; // YYYY-MM-DD
  
  // History & Files
  auditLogs: AuditLog[];
  arsipDigital: DigitalFile[];

  // AI Assistant cache
  aiAnalysis?: {
    ringkasan: string;
    kataKunci: string[];
    saranKlasifikasi: string[];
    saranKewenangan: string;
    alasanKewenangan: string;
    tingkatPrioritas: PrioritasType;
    draftRekomendasi: string;
    draftHasilTelaah: string;
    draftSuratPenyaluran?: {
      tujuanInstansi: string;
      alasanPenyaluran: string;
    };
    draftTindakanPenyelesaian?: string;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  nomorPengaduan?: string;
  complaintId?: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  timestamp: string;
  read: boolean;
}
