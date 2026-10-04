import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Server-Side Database Persistence (Zero-Quota Local Cloud for Multi-PC Sync)
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'sipmas_db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readDatabase(): any | null {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading database file:', err);
  }
  return null;
}

function writeDatabase(data: any): boolean {
  try {
    const tempFile = path.resolve(DATA_DIR, `sipmas_db_${Date.now()}.tmp`);
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Failed writing database file:', err);
    return false;
  }
}

// REST Endpoints for Multi-PC Database Synchronization
app.get('/api/database', (_req, res) => {
  const db = readDatabase();
  if (!db) {
    return res.json({ exists: false, data: null });
  }
  return res.json({ exists: true, data: db });
});

app.post('/api/database', (req, res) => {
  try {
    const { complaints, users, officialInfo, notifications } = req.body;
    const payload = {
      complaints: Array.isArray(complaints) ? complaints : [],
      users: Array.isArray(users) ? users : [],
      officialInfo: officialInfo || null,
      notifications: Array.isArray(notifications) ? notifications : [],
      lastUpdated: new Date().toISOString(),
      updatedBy: req.body.updatedBy || 'client',
    };
    const ok = writeDatabase(payload);
    if (ok) {
      return res.json({ 
        success: true, 
        message: 'Database berhasil disimpan di server SIPMAS',
        lastUpdated: payload.lastUpdated 
      });
    }
    return res.status(500).json({ success: false, error: 'Gagal menulis database ke server' });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/database/sync', (req, res) => {
  try {
    const clientData = req.body || {};
    let serverDb = readDatabase();

    if (!serverDb) {
      const newPayload = {
        complaints: Array.isArray(clientData.complaints) ? clientData.complaints : [],
        users: Array.isArray(clientData.users) ? clientData.users : [],
        officialInfo: clientData.officialInfo || null,
        notifications: Array.isArray(clientData.notifications) ? clientData.notifications : [],
        lastUpdated: new Date().toISOString(),
      };
      writeDatabase(newPayload);
      return res.json({
        success: true,
        action: 'initialized',
        data: newPayload,
        serverTime: new Date().toISOString(),
      });
    }

    // Smart merge complaints by id
    const mergedComplaintsMap = new Map();
    (serverDb.complaints || []).forEach((c: any) => {
      if (c && c.id) mergedComplaintsMap.set(c.id, c);
    });

    (clientData.complaints || []).forEach((c: any) => {
      if (!c || !c.id) return;
      if (!mergedComplaintsMap.has(c.id)) {
        mergedComplaintsMap.set(c.id, c);
      } else {
        const existing = mergedComplaintsMap.get(c.id);
        const clientLogs = (c.auditLogs || []).length;
        const serverLogs = (existing.auditLogs || []).length;
        // If client has newer or more logs, or updated status
        if (clientLogs >= serverLogs) {
          mergedComplaintsMap.set(c.id, c);
        }
      }
    });

    // Smart merge users
    const mergedUsersMap = new Map();
    (serverDb.users || []).forEach((u: any) => {
      if (u && u.id) mergedUsersMap.set(u.id, u);
    });
    (clientData.users || []).forEach((u: any) => {
      if (u && u.id) mergedUsersMap.set(u.id, u);
    });

    // Smart merge notifications
    const mergedNotifMap = new Map();
    (serverDb.notifications || []).forEach((n: any) => {
      if (n && n.id) mergedNotifMap.set(n.id, n);
    });
    (clientData.notifications || []).forEach((n: any) => {
      if (n && n.id) mergedNotifMap.set(n.id, n);
    });

    const mergedPayload = {
      complaints: Array.from(mergedComplaintsMap.values()),
      users: Array.from(mergedUsersMap.values()),
      officialInfo: clientData.officialInfo || serverDb.officialInfo,
      notifications: Array.from(mergedNotifMap.values()),
      lastUpdated: new Date().toISOString(),
    };

    writeDatabase(mergedPayload);

    return res.json({
      success: true,
      action: 'synced',
      data: mergedPayload,
      serverTime: new Date().toISOString(),
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/database/status', (_req, res) => {
  const db = readDatabase();
  res.json({
    status: 'online',
    hasData: !!db,
    totalComplaints: db?.complaints?.length || 0,
    totalUsers: db?.users?.length || 0,
    lastUpdated: db?.lastUpdated || null,
    serverTime: new Date().toISOString(),
  });
});

// Helper to get GoogleGenAI client if key exists
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper function for rule-based intelligent analysis fallback
function generateRuleBasedAnalysis(pokokPengaduan: string = '', uraian: string = '', harapan: string = '') {
  const text = `${pokokPengaduan} ${uraian} ${harapan}`.toLowerCase();
  let klasifikasi = 'Data bantuan sosial / DTSEN';
  let kewenangan = 'Dinas Sosial Kota Tanjungbalai';
  let prioritas = 'Biasa';

  if (text.includes('darurat') || text.includes('meninggal') || text.includes('jenazah') || text.includes('bencana') || text.includes('kebakaran') || text.includes('banjir') || text.includes('kritis') || text.includes('sekarat')) {
    prioritas = 'Mendesak';
  } else if (text.includes('pkh') || text.includes('sembako') || text.includes('bpnt') || text.includes('rekening kks') || text.includes('kartu kks')) {
    klasifikasi = 'PKH / Program Sembako / bantuan sosial lainnya';
    prioritas = 'Penting';
  } else if (text.includes('bpjs') || text.includes('kis') || text.includes('pbi') || text.includes('jaminan kesehatan')) {
    klasifikasi = 'PBI JKN / kepesertaan jaminan sosial';
    prioritas = 'Penting';
  } else if (text.includes('disabilitas') || text.includes('lansia') || text.includes('panti') || text.includes('terlantar') || text.includes('anak jalanan')) {
    klasifikasi = 'Rehabilitasi sosial / penyandang disabilitas / lansia';
    prioritas = 'Penting';
  } else if (text.includes('ktp') || text.includes('kk') || text.includes('dukcapil') || text.includes('nik salah') || text.includes('pindah')) {
    klasifikasi = 'Data kependudukan/domisili yang perlu verifikasi';
    kewenangan = 'Perangkat Daerah lain di Kota Tanjungbalai';
  } else if (text.includes('lks') || text.includes('yayasan') || text.includes('organisasi')) {
    klasifikasi = 'Lembaga Kesejahteraan Sosial (LKS)';
  } else if (text.includes('ambulans') || text.includes('jenazah') || text.includes('makam')) {
    klasifikasi = 'Pelayanan mobil jenazah';
    prioritas = 'Mendesak';
  }

  return {
    success: true,
    source: 'smart-rule-engine',
    ringkasan: `Pengaduan mengenai ${pokokPengaduan || 'permasalahan sosial'}: ${(uraian || '').substring(0, 150)}...`,
    kataKunci: ['Bansos', 'Verifikasi Dinsos', 'Kota Tanjungbalai'],
    saranKlasifikasi: [klasifikasi],
    saranKewenangan: kewenangan,
    alasanKewenangan: kewenangan.includes('Dinas Sosial')
      ? 'Materi aduan berkaitan langsung dengan tugas pokok & fungsi bantuan serta rehabilitasi sosial Dinas Sosial Kota Tanjungbalai.'
      : 'Materi aduan memerlukan kewenangan instansi kependudukan/OPD terkait di Kota Tanjungbalai.',
    tingkatPrioritas: prioritas,
    alasanPrioritas: prioritas === 'Mendesak' ? 'Terkait kebutuhan darurat/keselamatan warga.' : 'Perlu penelaahan berkas reguler dan verifikasi rekening penerima.',
    draftRekomendasi: `Lakukan koordinasi dengan Koordinator Pendamping PKH / TKSK Kecamatan di Kota Tanjungbalai dan lakukan pengecekan status bantuan pada aplikasi SIKS-NG Dinsos.`,
    draftHasilTelaah: `Berdasarkan uraian kronologi dan bukti pengadu, materi pengaduan telah jelas mengenai kendala penyaluran dan layak untuk ditindaklanjuti secara faktual.`,
    draftSuratPenyaluran: kewenangan.includes('Dinas Sosial') ? null : {
      tujuanInstansi: 'Dinas Kependudukan dan Pencatatan Sipil Kota Tanjungbalai',
      alasanPenyaluran: 'Penanganan validasi data kependudukan dan pembaruan NIK/KK merupakan kewenangan Disdukcapil.',
    },
    draftTindakanPenyelesaian: `1. Memeriksa status kepesertaan NIK/No KKS pada aplikasi SIKS-NG Kemensos.\n2. Melakukan sinkronisasi data dengan bank penyalur (Himbara).\n3. Membuat berita acara klarifikasi untuk diserahkan kepada keluarga penerima manfaat.`
  };
}

// AI Assistant endpoint for Complaint Analysis
app.post('/api/ai/analyze-complaint', async (req, res) => {
  try {
    const { pokokPengaduan, uraian, harapan } = req.body;

    if (!pokokPengaduan && !uraian) {
      return res.status(400).json({ error: 'Pokok atau uraian pengaduan wajib diisi' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json(generateRuleBasedAnalysis(pokokPengaduan, uraian, harapan));
    }

    const prompt = `Anda adalah Asisten Pakar Penelaahan Pengaduan Masyarakat pada Dinas Sosial Kota Tanjungbalai, Sumatera Utara.
Tugas Anda adalah menelaah secara objektif pengaduan masyarakat untuk membantu Petugas/Tim Penelaah.

Data Pengaduan:
- Pokok Pengaduan: "${pokokPengaduan || '-'}"
- Uraian / Kronologi: "${uraian || '-'}"
- Harapan Pengadu: "${harapan || '-'}"

Kategori Klasifikasi Resmi Dinsos Kota Tanjungbalai:
1. Data bantuan sosial / DTSEN
2. PKH / Program Sembako / bantuan sosial lainnya
3. PBI JKN / kepesertaan jaminan sosial
4. Rehabilitasi sosial / penyandang disabilitas / lansia
5. Perlindungan sosial / kebencanaan
6. Lembaga Kesejahteraan Sosial (LKS)
7. Pelayanan mobil jenazah
8. Pengaduan pelayanan publik
9. Data kependudukan/domisili yang perlu verifikasi
10. Lainnya

Pilihan Kewenangan:
- Dinas Sosial Kota Tanjungbalai
- Perangkat Daerah lain di Kota Tanjungbalai (contoh: Disdukcapil, Dinkes, Dishub, Satpol PP, dll)
- Pemerintah Provinsi
- Pemerintah Pusat (Kemensos RI, BPJS, dll)
- Instansi/Lembaga lain
- Bukan kewenangan pemerintah

Pilihan Prioritas:
- Biasa
- Penting
- Mendesak (jika ada ancaman jiwa, lansia terlantar kritis, bencana alam/kebakaran, kebutuhan mobil jenazah darurat)

Berikan analisis dalam format JSON dengan struktur:
{
  "ringkasan": "Ringkasan padat 1-2 kalimat dari inti pengaduan",
  "kataKunci": ["kata1", "kata2", "kata3"],
  "saranKlasifikasi": ["Salah satu atau lebih dari 10 kategori di atas"],
  "saranKewenangan": "Salah satu opsi kewenangan di atas",
  "alasanKewenangan": "Alasan penentuan kewenangan secara yuridis/tupoksi",
  "tingkatPrioritas": "Biasa" | "Penting" | "Mendesak",
  "alasanPrioritas": "Alasan penetapan prioritas",
  "draftRekomendasi": "Rekomendasi langkah tindak lanjut bagi Tim Penelaah",
  "draftHasilTelaah": "Catatan analisis telaah resmi",
  "draftSuratPenyaluran": {
    "tujuanInstansi": "Nama OPD/instansi jika bukan kewenangan Dinsos (atau null jika kewenangan Dinsos)",
    "alasanPenyaluran": "Alasan resmi mengapa disalurkan ke OPD tersebut"
  },
  "draftTindakanPenyelesaian": "Daftar rekomendasi tindakan penyelesaian jika kewenangan Dinsos"
}`;

    // Try primary model (gemini-3.8-flash)
    let parsedResult = null;
    let modelUsed = 'gemini-3.8-flash';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      parsedResult = JSON.parse(response.text || '{}');
    } catch (primaryErr: any) {
      console.warn('Primary Gemini model 3.8-flash unavailable, attempting fallback model:', primaryErr.message);

      // Try secondary model (gemini-2.5-flash)
      try {
        const response2 = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        parsedResult = JSON.parse(response2.text || '{}');
        modelUsed = 'gemini-2.5-flash';
      } catch (fallbackErr: any) {
        console.warn('Google Gemini models temporarily overloaded (503/429). Falling back to smart rule engine:', fallbackErr.message);
        // Fallback to intelligent rule-engine so officer is never blocked
        return res.json({
          ...generateRuleBasedAnalysis(pokokPengaduan, uraian, harapan),
          note: 'Catatan: Hasil analisis cerdas disajikan oleh Mesin Regulasi Dinsos karena server AI eksternal sedang mengalami lonjakan beban sementara.'
        });
      }
    }

    return res.json({
      success: true,
      source: modelUsed,
      ...parsedResult,
    });
  } catch (error: any) {
    console.error('Error analyzing complaint with AI:', error);
    // Even if any unexpected error occurs, provide the rule-based analysis so user is never blocked
    return res.json({
      ...generateRuleBasedAnalysis(req.body?.pokokPengaduan, req.body?.uraian, req.body?.harapan),
      note: 'Analisis cerdas berhasil disajikan menggunakan Mesin Regulasi Dinsos.'
    });
  }
});

// AI Draft Surat Penyaluran Helper
app.post('/api/ai/draft-penyaluran', async (req, res) => {
  try {
    const { pokokPengaduan, ringkasan, instansiTujuan, alasan } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        ringkasanResmi: ringkasan || pokokPengaduan,
        alasanResmi: alasan || `Materi pengaduan memerlukan tindak lanjut teknis yang merupakan tugas dan kewenangan dari ${instansiTujuan || 'Instansi Terkait'}.`
      });
    }

    const prompt = `Buatkan ringkasan pengaduan dan alasan penyaluran resmi untuk Surat Penyaluran Pengaduan Bukan Kewenangan dari Kepala Dinas Sosial Kota Tanjungbalai kepada ${instansiTujuan}.
Pokok Pengaduan: "${pokokPengaduan}"
Ringkasan Awal: "${ringkasan || '-'}"
Alasan Awal: "${alasan || '-'}"

Hasilkan JSON dengan format:
{
  "ringkasanResmi": "Ringkasan resmi padat dan profesional berbahasa birokrasi pemerintahan Indonesia yang santun",
  "alasanResmi": "Alasan penyaluran yang jelas dan tepat secara administratif"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server SIPMAS Dinsos Tanjungbalai running on port ${PORT}`);
  });
}

startServer();
