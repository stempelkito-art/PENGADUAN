import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Complaint } from '../../types';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Percent, 
  Filter, 
  Table,
  ArrowUpRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface MonthlyComplaintChartProps {
  complaints: Complaint[];
  className?: string;
}

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const MONTH_NAMES_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

type ChartViewType = 'area' | 'bar' | 'rate';

export const MonthlyComplaintChart: React.FC<MonthlyComplaintChartProps> = ({ 
  complaints,
  className = ''
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>(currentYear);
  const [chartView, setChartView] = useState<ChartViewType>('area');
  const [showTable, setShowTable] = useState(false);

  // Extract available years from complaints
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(currentYear);
    complaints.forEach(c => {
      if (c.tanggalPenerimaan) {
        const yr = parseInt(c.tanggalPenerimaan.substring(0, 4), 10);
        if (!isNaN(yr) && yr > 2000) yearsSet.add(yr);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [complaints, currentYear]);

  // Aggregate monthly data
  const monthlyData = useMemo(() => {
    // Initialize 12 months array
    const data = Array.from({ length: 12 }, (_, idx) => ({
      monthIndex: idx,
      bulan: MONTH_NAMES_SHORT[idx],
      bulanLengkap: MONTH_NAMES_FULL[idx],
      total: 0,
      selesai: 0,
      proses: 0,
      baru: 0,
      tingkatSelesai: 0,
    }));

    complaints.forEach(c => {
      if (!c.tanggalPenerimaan) return;
      const yr = parseInt(c.tanggalPenerimaan.substring(0, 4), 10);
      if (selectedYear !== 'ALL' && yr !== selectedYear) return;

      const mth = parseInt(c.tanggalPenerimaan.substring(5, 7), 10) - 1;
      if (mth >= 0 && mth < 12) {
        data[mth].total += 1;
        if (c.status.startsWith('Selesai')) {
          data[mth].selesai += 1;
        } else if (c.status === 'Baru') {
          data[mth].baru += 1;
        } else {
          data[mth].proses += 1;
        }
      }
    });

    // Compute completion percentage
    return data.map(item => ({
      ...item,
      tingkatSelesai: item.total > 0 ? Math.round((item.selesai / item.total) * 100) : 0
    }));
  }, [complaints, selectedYear]);

  // Key KPI Metrics
  const metrics = useMemo(() => {
    const totalAduan = monthlyData.reduce((acc, curr) => acc + curr.total, 0);
    const totalSelesai = monthlyData.reduce((acc, curr) => acc + curr.selesai, 0);
    const totalProses = monthlyData.reduce((acc, curr) => acc + curr.proses, 0);
    const totalBaru = monthlyData.reduce((acc, curr) => acc + curr.baru, 0);
    const avgPerMonth = (totalAduan / 12).toFixed(1);
    const overallRate = totalAduan > 0 ? Math.round((totalSelesai / totalAduan) * 100) : 0;

    // Find peak month
    let peakMonth = monthlyData[0];
    monthlyData.forEach(m => {
      if (m.total > peakMonth.total) peakMonth = m;
    });

    return {
      totalAduan,
      totalSelesai,
      totalProses,
      totalBaru,
      avgPerMonth,
      overallRate,
      peakMonth: peakMonth.total > 0 ? `${peakMonth.bulanLengkap} (${peakMonth.total} Aduan)` : 'Belum Ada'
    };
  }, [monthlyData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs min-w-[210px] space-y-2">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
            <span className="font-bold text-amber-400 font-sans tracking-wide">
              {item.bulanLengkap} {selectedYear !== 'ALL' ? selectedYear : ''}
            </span>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-mono">
              Total: {item.total}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Tuntas / Selesai:
              </span>
              <span className="font-bold font-mono">{item.selesai}</span>
            </div>

            <div className="flex justify-between items-center text-amber-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                Dalam Penanganan:
              </span>
              <span className="font-bold font-mono">{item.proses}</span>
            </div>

            <div className="flex justify-between items-center text-sky-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                Pengaduan Baru:
              </span>
              <span className="font-bold font-mono">{item.baru}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
            <span className="text-slate-400">Tingkat Ketuntasan:</span>
            <span className="font-bold text-emerald-300 font-mono">
              {item.tingkatSelesai}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6 ${className}`}>
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-red-50 text-red-700 font-bold text-[10px] uppercase tracking-wider rounded-md border border-red-200">
              Recharts Visual Analytics
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Tahun {selectedYear === 'ALL' ? 'Semua Periode' : selectedYear}</span>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
            Ringkasan & Tren Pengaduan Bulanan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Grafik pemantauan volume laporan masyarakat per bulan dan efektivitas tindak lanjut Dinas Sosial Kota Tanjungbalai.
          </p>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Year Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <span className="text-slate-400 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" />
            </span>
            {availableYears.map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {yr}
              </button>
            ))}
            <button
              onClick={() => setSelectedYear('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                selectedYear === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setChartView('area')}
              className={`px-3 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1 cursor-pointer ${
                chartView === 'area'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grafik Tren Area"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Area</span>
            </button>
            <button
              onClick={() => setChartView('bar')}
              className={`px-3 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1 cursor-pointer ${
                chartView === 'bar'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grafik Batang Komparatif"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Batang</span>
            </button>
            <button
              onClick={() => setChartView('rate')}
              className={`px-3 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1 cursor-pointer ${
                chartView === 'rate'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tingkat Ketuntasan (%)"
            >
              <Percent className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">% Tuntas</span>
            </button>
          </div>

          {/* Table Toggle */}
          <button
            onClick={() => setShowTable(!showTable)}
            className={`p-2 rounded-xl text-xs border transition-all cursor-pointer ${
              showTable 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Tampilkan Data Rincian Tabel"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Highlight Mini-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Laporan Masuk
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {metrics.totalAduan}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Pengaduan</span>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Tuntas & Selesai
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">
              {metrics.totalSelesai}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">({metrics.overallRate}%)</span>
          </div>
        </div>

        <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            Dalam Proses
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-black text-amber-800 font-mono">
              {metrics.totalProses + metrics.totalBaru}
            </span>
            <span className="text-[10px] text-amber-600 font-medium">Kasus Aktif</span>
          </div>
        </div>

        <div className="p-3.5 bg-sky-50/60 rounded-2xl border border-sky-200/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-sky-600" />
            Rata-rata Bulanan
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-black text-sky-800 font-mono">
              {metrics.avgPerMonth}
            </span>
            <span className="text-[10px] text-sky-600 font-medium">Aduan / Bulan</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="w-full h-[320px] pt-2">
        <ResponsiveContainer width="100%" height={320}>
          {chartView === 'area' ? (
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.45}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorProses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="bulan" 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 11, fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                name="Total Aduan Masuk" 
                stroke="#dc2626" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
              <Area 
                type="monotone" 
                dataKey="selesai" 
                name="Selesai Ditangani" 
                stroke="#059669" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorSelesai)" 
              />
              <Area 
                type="monotone" 
                dataKey="proses" 
                name="Sedang Diproses" 
                stroke="#d97706" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorProses)" 
              />
            </AreaChart>
          ) : chartView === 'bar' ? (
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="bulan" 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 11, fontWeight: 600 }}
              />
              <Bar 
                dataKey="total" 
                name="Total Masuk" 
                fill="#dc2626" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={32}
              />
              <Bar 
                dataKey="selesai" 
                name="Selesai" 
                fill="#059669" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={32}
              />
              <Bar 
                dataKey="proses" 
                name="Dalam Proses" 
                fill="#d97706" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={32}
              />
            </BarChart>
          ) : (
            <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="bulan" 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 11, fontWeight: 600 }}
              />
              <Line 
                type="monotone" 
                dataKey="tingkatSelesai" 
                name="Tingkat Ketuntasan (%)" 
                stroke="#059669" 
                strokeWidth={3}
                dot={{ fill: '#059669', r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#059669' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Monthly Breakdown Table (Expandable) */}
      {showTable && (
        <div className="pt-4 border-t border-slate-100 overflow-x-auto">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Tabel Rincian Pengaduan Bulanan Tahun {selectedYear}</span>
          </h4>
          <table className="w-full text-xs text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Bulan</th>
                <th className="p-2.5 text-center">Total Masuk</th>
                <th className="p-2.5 text-center">Baru</th>
                <th className="p-2.5 text-center">Dalam Proses</th>
                <th className="p-2.5 text-center">Selesai</th>
                <th className="p-2.5 text-center">Tingkat Ketuntasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyData.map(m => (
                <tr key={m.monthIndex} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-2.5 font-semibold text-slate-900">{m.bulanLengkap}</td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-800">{m.total}</td>
                  <td className="p-2.5 text-center font-mono text-sky-700">{m.baru}</td>
                  <td className="p-2.5 text-center font-mono text-amber-700">{m.proses}</td>
                  <td className="p-2.5 text-center font-mono font-bold text-emerald-700">{m.selesai}</td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      m.tingkatSelesai >= 80 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : m.tingkatSelesai >= 50 
                        ? 'bg-amber-100 text-amber-800' 
                        : m.total === 0 
                        ? 'text-slate-400' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {m.total === 0 ? '-' : `${m.tingkatSelesai}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
