/**
 * Utility helper untuk pencetakan dokumen resmi Dinas Sosial Kota Tanjungbalai.
 * Menghilangkan header peramban otomatis (judul halaman 'SIPMAS - Pengaduan Masyarakat Dinsos Tanjungbalai'
 * dan tanggal/waktu di bagian atas lembar kertas), serta footer peramban (URL dan nomor halaman).
 */

let originalTitleBackup: string | null = null;
let restoreTimeoutId: ReturnType<typeof setTimeout> | null = null;

/**
 * Memastikan style @page dengan margin 0mm terpasang di DOM
 * agar engine browser (Chromium/Chrome, Edge, Firefox, Safari)
 * tidak memunculkan header bawaan (judul web & tanggal) di atas lembar cetak.
 */
export const injectZeroMarginPrintStyle = () => {
  if (typeof document === 'undefined') return;
  const styleId = 'sipmas-zero-margin-print-style';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.innerHTML = `
      @page {
        size: auto;
        margin: 0mm !important;
      }
      @media print {
        @page {
          size: auto;
          margin: 0mm !important;
        }
        html, body {
          margin: 0mm !important;
          padding: 0mm !important;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }
};

/**
 * Membersihkan judul dokumen secara sementara selama sesi cetak berlangsung,
 * sehingga peramban tidak akan pernah mencetak judul dan tanggal di bagian atas.
 */
export const clearTitleForPrint = () => {
  if (typeof document === 'undefined') return;
  if (originalTitleBackup === null) {
    originalTitleBackup = document.title || 'SIPMAS - Pengaduan Masyarakat Dinsos Tanjungbalai';
  }
  document.title = '';
};

/**
 * Mengembalikan judul dokumen ke semula setelah proses cetak / dialog pratinjau ditutup.
 */
export const restoreTitleAfterPrint = () => {
  if (typeof document === 'undefined') return;
  if (originalTitleBackup !== null) {
    document.title = originalTitleBackup;
    originalTitleBackup = null;
  }
  if (restoreTimeoutId) {
    clearTimeout(restoreTimeoutId);
    restoreTimeoutId = null;
  }
};

/**
 * Inisialisasi pendengar event global beforeprint dan afterprint.
 * Berfungsi jika pengguna menekan tombol Cetak di antarmuka ATAU shortcut keyboard (Ctrl+P / Cmd+P).
 */
export const setupGlobalPrintListeners = () => {
  if (typeof window === 'undefined') return;

  injectZeroMarginPrintStyle();

  window.addEventListener('beforeprint', () => {
    injectZeroMarginPrintStyle();
    clearTitleForPrint();
  });

  window.addEventListener('afterprint', () => {
    restoreTitleAfterPrint();
  });
};

/**
 * Pemicu cetak dokumen dengan proteksi penuh terhadap judul dan tanggal peramban.
 * @param temporaryTitle Judul sementara (default: string kosong '' agar tidak ada tulisan tercetak di atas)
 */
export const triggerPrint = (temporaryTitle: string = '') => {
  if (typeof window === 'undefined') return;

  injectZeroMarginPrintStyle();

  if (originalTitleBackup === null) {
    originalTitleBackup = document.title || 'SIPMAS - Pengaduan Masyarakat Dinsos Tanjungbalai';
  }
  document.title = temporaryTitle;

  const handleAfterPrintOnce = () => {
    restoreTitleAfterPrint();
    window.removeEventListener('afterprint', handleAfterPrintOnce);
  };

  window.addEventListener('afterprint', handleAfterPrintOnce);

  // Berikan waktu satu tick agar thread DOM peramban mengaplikasikan title kosong sebelum dialog print aktif
  setTimeout(() => {
    try {
      window.print();
    } catch (err) {
      console.error('Error saat memanggil window.print():', err);
      restoreTitleAfterPrint();
    }
  }, 60);

  // Fallback pengaman hanya jika event afterprint tidak dikirimkan peramban (misal 2 menit, bukan cepat 1.5 detik)
  if (restoreTimeoutId) clearTimeout(restoreTimeoutId);
  restoreTimeoutId = setTimeout(() => {
    restoreTitleAfterPrint();
  }, 120000);
};
