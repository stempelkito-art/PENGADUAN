import React, { useState } from 'react';
import { Complaint } from '../../types';
import { Sparkles, Loader2, CheckCircle2, ArrowRight, AlertCircle, Copy, Check } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Partial<Complaint>;
  onApplyAnalysis?: (analysis: any) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onApplyAnalysis,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const handleRunAiAnalysis = async () => {
    setLoading(true);
    setError(null);
    setApplied(false);

    try {
      const response = await fetch('/api/ai/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokokPengaduan: complaint.pokokPengaduan,
          uraian: complaint.uraianKronologi,
          harapan: complaint.permintaanHarapan,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Gagal memproses dengan AI');
      }

      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Gagal menghubungi asisten AI.';
      if (typeof msg === 'string' && (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE'))) {
        msg = 'Server AI Gemini Google sedang mengalami lonjakan beban sementara (High Demand). Silakan klik tombol "Mulai Analisis Cerdas Sekarang" kembali untuk melanjutkan dengan server cadangan.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (analysisResult && onApplyAnalysis) {
      onApplyAnalysis(analysisResult);
      setApplied(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-red-800 via-red-700 to-amber-700 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-base">Asisten AI Penelaahan Pengaduan</h3>
                <p className="text-xs text-amber-100">
                  Membantu analisis otomatis kronologi & rekomendasi tindak lanjut Dinsos
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Input Context Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Nomor Aduan:</span>
                <span className="font-mono font-bold text-slate-800">{complaint.nomorPengaduan || 'Draf Baru'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Pengadu:</span>
                <span className="font-bold text-slate-800">{complaint.namaPengadu || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Pokok Masalah:</span>
                <p className="font-medium text-slate-900 mt-0.5">{complaint.pokokPengaduan || '-'}</p>
              </div>
            </div>

            {/* Trigger Button if not yet analyzed */}
            {!analysisResult && !loading && (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  AI akan membaca uraian kronologi, mengekstrak kata kunci, merekomendasikan klasifikasi dari 10 kategori Dinsos Tanjungbalai, dan menyarankan penentuan kewenangan serta tingkat prioritas.
                </p>
                <button
                  type="button"
                  onClick={handleRunAiAnalysis}
                  className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Mulai Analisis Cerdas Sekarang</span>
                </button>
              </div>
            )}

            {loading && (
              <div className="text-center py-10 space-y-3">
                <Loader2 className="w-8 h-8 text-red-700 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-700">
                  Membedah uraian pengaduan dan mencocokkan dengan regulasi Dinsos Tanjungbalai...
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Analysis Results Display */}
            {analysisResult && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Analisis Berhasil Dihasilkan
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Engine: {analysisResult.source || 'gemini-3.8-flash'}
                  </span>
                </div>

                {/* Ringkasan & Keywords */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Ringkasan Resmi:
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {analysisResult.ringkasan}
                  </p>
                  {analysisResult.kataKunci && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {analysisResult.kataKunci.map((kw: string, i: number) => (
                        <span key={i} className="text-[10px] bg-white border border-slate-300 px-2 py-0.5 rounded-md font-semibold text-slate-600">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rekomendasi Klasifikasi & Kewenangan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="font-bold text-blue-900 block mb-1">
                      Saran Klasifikasi:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-blue-800 font-medium">
                      {(analysisResult.saranKlasifikasi || []).map((k: string, i: number) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="font-bold text-amber-900 block mb-1">
                      Saran Kewenangan:
                    </span>
                    <p className="text-amber-950 font-bold">{analysisResult.saranKewenangan}</p>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                      {analysisResult.alasanKewenangan}
                    </p>
                  </div>
                </div>

                {/* Prioritas & Saran Tindak Lanjut */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Tingkat Prioritas yang Disarankan:</span>
                    <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${
                      analysisResult.tingkatPrioritas === 'Mendesak'
                        ? 'bg-rose-600 text-white'
                        : analysisResult.tingkatPrioritas === 'Penting'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {analysisResult.tingkatPrioritas}
                    </span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 block mb-1">Draft Rekomendasi Tindak Lanjut:</span>
                    <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                      {analysisResult.draftRekomendasi}
                    </p>
                  </div>

                  {analysisResult.draftSuratPenyaluran && (
                    <div className="bg-sky-50 p-2.5 rounded-lg border border-sky-200">
                      <span className="font-bold text-sky-950 block">Draft Penyaluran ke OPD Lain:</span>
                      <p className="text-sky-900 mt-0.5">
                        Tujuan: <strong>{analysisResult.draftSuratPenyaluran.tujuanInstansi}</strong>
                      </p>
                      <p className="text-[11px] text-sky-800 mt-0.5">
                        Alasan: {analysisResult.draftSuratPenyaluran.alasanPenyaluran}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-snug">
                  <strong>Catatan Legalitas:</strong> Hasil analisis AI bersifat sebagai rekomendasi penelaahan awal untuk mempercepat pekerjaan petugas. Keputusan final klasifikasi, kewenangan, dan tindakan tetap diputuskan oleh Pejabat Berwenang Dinas Sosial Kota Tanjungbalai.
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Tutup
            </button>

            {analysisResult && (
              <button
                type="button"
                onClick={handleApply}
                disabled={applied}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {applied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Telah Diterapkan!</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Terapkan Hasil ke Formulir</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
