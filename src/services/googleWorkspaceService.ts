import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Complaint, DigitalFile } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with Drive and Sheets scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory token cache (NEVER in localStorage/sessionStorage as required by SKILL.md)
let cachedAccessToken: string | null = null;
let cachedGoogleUser: User | null = null;
let isSigningIn = false;

// Initialize Auth listener
export const initWorkspaceAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    cachedGoogleUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token must be obtained via interaction if expired
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal memperoleh access token dari Google Workspace Auth');
    }

    cachedAccessToken = credential.accessToken;
    cachedGoogleUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in Google error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Sign out
export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedGoogleUser = null;
};

// Access token getter
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Current Google User getter
export const getCurrentGoogleUser = (): User | null => {
  return cachedGoogleUser;
};

// ==========================================
// GOOGLE DRIVE API FUNCTIONS
// ==========================================

export interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink?: string;
}

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  size?: string;
  createdTime?: string;
}

/**
 * Find or create a specific folder in Google Drive
 */
export const getOrCreateDriveFolder = async (folderName = 'SIPMAS_Dinsos_Tanjungbalai'): Promise<DriveFolderInfo> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Silakan hubungkan akun Google terlebih dahulu');

  // 1. Search for existing folder created by this app
  const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
  }

  // 2. Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Folder Resmi Penyimpanan Arsip & Rekapitulasi SIPMAS Dinas Sosial Kota Tanjungbalai',
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json();
    throw new Error(errData.error?.message || 'Gagal membuat folder di Google Drive');
  }

  return await createRes.json();
};

/**
 * Upload a document/file to Google Drive inside the SIPMAS folder
 */
export const uploadFileToDrive = async (
  fileName: string,
  content: string | Blob,
  mimeType = 'text/plain',
  folderId?: string
): Promise<DriveFileInfo> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Silakan hubungkan akun Google terlebih dahulu');

  // Ensure folder exists
  let targetFolderId = folderId;
  if (!targetFolderId) {
    const folder = await getOrCreateDriveFolder();
    targetFolderId = folder.id;
  }

  const metadata = {
    name: fileName,
    parents: [targetFolderId],
    description: `Berkas Pengaduan Masyarakat SIPMAS Dinsos Tanjungbalai - Diunggah pada ${new Date().toLocaleString('id-ID')}`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let fileData: string;
  if (typeof content === 'string') {
    fileData = content;
  } else {
    fileData = await content.text();
  }

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    fileData +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime,size', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error?.message || 'Gagal mengunggah berkas ke Google Drive');
  }

  return await res.json();
};

/**
 * List files in the SIPMAS Google Drive folder
 */
export const listDriveFiles = async (folderId?: string): Promise<DriveFileInfo[]> => {
  const token = await getAccessToken();
  if (!token) return [];

  let targetFolderId = folderId;
  if (!targetFolderId) {
    try {
      const folder = await getOrCreateDriveFolder();
      targetFolderId = folder.id;
    } catch {
      return [];
    }
  }

  const query = encodeURIComponent(`'${targetFolderId}' in parents and trashed = false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink,createdTime,size)&orderBy=createdTime desc`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.files || [];
};

/**
 * Delete a file in Google Drive (Destructive: requires user confirmation before calling)
 */
export const deleteDriveFile = async (fileId: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Silakan hubungkan akun Google');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.ok;
};

// ==========================================
// GOOGLE SHEETS API FUNCTIONS
// ==========================================

export interface SpreadsheetInfo {
  id: string;
  spreadsheetUrl: string;
  title: string;
}

/**
 * Find or create official SIPMAS spreadsheet in Google Sheets
 */
export const getOrCreateSpreadsheet = async (
  title = 'SIPMAS_Dinsos_Tanjungbalai_Rekap_Pengaduan'
): Promise<SpreadsheetInfo> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Silakan hubungkan akun Google terlebih dahulu');

  // 1. Check if folder exists so we can organize it inside the SIPMAS Drive folder
  const folder = await getOrCreateDriveFolder();

  // 2. Search if file already exists in Drive
  const query = encodeURIComponent(`name = '${title}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return {
        id: data.files[0].id,
        spreadsheetUrl: data.files[0].webViewLink || `https://docs.google.com/spreadsheets/d/${data.files[0].id}/edit`,
        title,
      };
    }
  }

  // 3. Create new Spreadsheet via Sheets API
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
        locale: 'id_ID',
        timeZone: 'Asia/Jakarta',
      },
      sheets: [
        {
          properties: {
            title: 'Rekap Pengaduan Masyarakat',
            gridProperties: {
              frozenRowCount: 4,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json();
    throw new Error(errData.error?.message || 'Gagal membuat Google Spreadsheet baru');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // Move created sheet into the SIPMAS folder in Google Drive
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${folder.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (e) {
    console.warn('Could not move sheet to folder:', e);
  }

  return {
    id: spreadsheetId,
    spreadsheetUrl: sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    title,
  };
};

/**
 * Synchronize all complaints into the Google Sheet
 */
export const syncComplaintsToGoogleSheets = async (
  complaints: Complaint[],
  officialInfo?: any
): Promise<{ updatedRows: number; spreadsheetUrl: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Silakan hubungkan akun Google terlebih dahulu');

  const spreadsheet = await getOrCreateSpreadsheet();
  const spreadsheetId = spreadsheet.id;

  // Prepare Header and Content matrix
  const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
  const instansiName = officialInfo?.instansi || 'PEMERINTAH KOTA TANJUNGBALAI';
  const dinasName = officialInfo?.dinas || 'DINAS SOSIAL';

  const rows: any[][] = [
    [`REKAPITULASI RESMI PENGADUAN MASYARAKAT (SIPMAS)`],
    [`${instansiName} - ${dinasName}`],
    [`Sinkronisasi Terakhir: ${nowStr} WIB | Total Pengaduan: ${complaints.length}`],
    [
      'No',
      'Nomor Pengaduan',
      'Tanggal Diterima',
      'Media Pengaduan',
      'Nama Pengadu',
      'NIK (Tersamar)',
      'No. Telepon / WA',
      'Alamat Domisili',
      'Status Hubungan',
      'Pokok Pengaduan',
      'Uraian Kronologi Singkat',
      'Harapan Pengadu',
      'Klasifikasi Aduan',
      'Kewenangan Penanganan',
      'Prioritas',
      'Status Pengaduan',
      'Target Waktu SLA',
      'Catatan / Rekomendasi Tim',
    ],
  ];

  complaints.forEach((c, idx) => {
    const klasifikasiStr = c.telaah?.klasifikasiList?.find(k => k.ya)?.klasifikasi || '-';
    const maskedNik = c.nik ? `${c.nik.substring(0, 6)}******${c.nik.substring(12)}` : '-';
    const uraianSingkat = c.uraianKronologi?.length > 150 ? `${c.uraianKronologi.substring(0, 147)}...` : c.uraianKronologi;

    rows.push([
      idx + 1,
      c.nomorPengaduan,
      c.tanggalPenerimaan,
      c.mediaPengaduan,
      c.namaPengadu,
      maskedNik,
      c.nomorTelepon,
      c.alamat,
      c.statusHubungan,
      c.pokokPengaduan,
      uraianSingkat,
      c.permintaanHarapan || '-',
      klasifikasiStr,
      c.kewenangan,
      c.prioritas,
      c.status,
      c.slaDeadline,
      c.telaah?.rekomendasiTindakLanjut || c.penyelesaian?.hasilPenyelesaian || c.penyelesaian?.tindakanDilakukan || '-',
    ]);
  });

  // Write values to Google Sheets via Value Update API
  const range = `Rekap Pengaduan Masyarakat!A1:R${rows.length}`;
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!updateRes.ok) {
    const errData = await updateRes.json();
    throw new Error(errData.error?.message || 'Gagal menulis baris data ke Google Sheets');
  }

  // Also style the header rows (A1, A2, A3, and row 4 table header)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Row 1 Title formatting
          {
            repeatCell: {
              range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 18 },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true, fontSize: 13, foregroundColor: { red: 0.6, green: 0.1, blue: 0.1 } },
                },
              },
              fields: 'userEnteredFormat.textFormat',
            },
          },
          // Row 4 Table Header formatting (Burgundy red background with white text)
          {
            repeatCell: {
              range: { sheetId: 0, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 0, endColumnIndex: 18 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.62, green: 0.08, blue: 0.08 },
                  textFormat: { bold: true, fontSize: 10, foregroundColor: { red: 1, green: 1, blue: 1 } },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
        ],
      }),
    });
  } catch (e) {
    console.warn('Could not apply formatting to sheet:', e);
  }

  return {
    updatedRows: complaints.length,
    spreadsheetUrl: spreadsheet.spreadsheetUrl,
  };
};
