import { useState } from "react";
import { ShieldCheck, BarChart3, TrendingUp, Users, Factory } from "lucide-react";

interface AdminStateSegment {
  name: string;
  percentage: number;
  weightTons: number;
  color: string;
}

const STATE_SEGMENTS: AdminStateSegment[] = [
  { name: "Ferrous & Heavy Steel", percentage: 42, weightTons: 62.1, color: "#174C4A" },
  { name: "Copper, Brass & Non-Ferrous", percentage: 28, weightTons: 41.4, color: "#FF7337" },
  { name: "E-Waste Circuit Boards", percentage: 16, weightTons: 23.6, color: "#F59E0B" },
  { name: "Battery & Hazardous", percentage: 14, weightTons: 20.7, color: "#8B5CF6" },
];

const WEEKLY_SETTLEMENTS = [
  { day: "Mon", amountLakhs: 2.4, heightPercent: 48 },
  { day: "Tue", amountLakhs: 3.1, heightPercent: 62 },
  { day: "Wed", amountLakhs: 4.8, heightPercent: 96 },
  { day: "Thu", amountLakhs: 3.6, heightPercent: 72 },
  { day: "Fri", amountLakhs: 5.0, heightPercent: 100 },
  { day: "Sat", amountLakhs: 4.2, heightPercent: 84 },
  { day: "Sun", amountLakhs: 1.8, heightPercent: 36 },
];

export default function AdminStateAnalytics() {
  const [activeSeg, setActiveSeg] = useState<AdminStateSegment | null>(null);

  // Calculate Donut Slices
  let cumulative = 0;
  const slices = STATE_SEGMENTS.map((seg) => {
    const startP = cumulative;
    cumulative += seg.percentage / 100;
    const endP = cumulative;

    const startX = Math.cos(2 * Math.PI * startP);
    const startY = Math.sin(2 * Math.PI * startP);
    const endX = Math.cos(2 * Math.PI * endP);
    const endY = Math.sin(2 * Math.PI * endP);
    const largeArc = seg.percentage / 100 > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX * 80} ${startY * 80}`,
      `A 80 80 0 ${largeArc} 1 ${endX * 80} ${endY * 80}`,
      `L ${endX * 50} ${endY * 50}`,
      `A 50 50 0 ${largeArc} 0 ${startX * 50} ${startY * 50}`,
      "Z",
    ].join(" ");

    return { seg, pathData };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Statewide Material Mix Donut */}
      <div className="lg:col-span-6 bg-white border border-[#EFE8DC] rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#A8A29E]">
              STATEWIDE SCRAP AGGREGATION
            </span>
            <h3 className="text-xl font-black text-[#1C1917] mt-0.5">
              Material Processing Mix
            </h3>
          </div>
          <div className="p-2 rounded-xl bg-[#FAF8F3] border border-[#ECE6DA] text-[#174C4A]">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-3">
          {/* Donut graphic */}
          <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
            <svg viewBox="-100 -100 200 200" className="w-48 h-48 transform -rotate-90">
              {slices.map(({ seg, pathData }, idx) => (
                <path
                  key={idx}
                  d={pathData}
                  fill={seg.color}
                  className="cursor-pointer transition-transform duration-200 hover:opacity-90"
                  style={{
                    transform: activeSeg?.name === seg.name ? "scale(1.05)" : "scale(1)",
                    transformOrigin: "0 0",
                  }}
                  onMouseEnter={() => setActiveSeg(seg)}
                  onMouseLeave={() => setActiveSeg(null)}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] font-bold text-[#A8A29E] uppercase">State Total</span>
              <span className="text-2xl font-black text-[#1C1917] font-mono leading-tight">
                {activeSeg ? `${activeSeg.percentage}%` : "147.8 MT"}
              </span>
              <span className="text-[10px] font-semibold text-[#78716C]">
                {activeSeg ? `${activeSeg.weightTons} MT` : "All Hubs"}
              </span>
            </div>
          </div>

          {/* Slices legend */}
          <div className="space-y-2 w-full">
            {STATE_SEGMENTS.map((s, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveSeg(s)}
                onMouseLeave={() => setActiveSeg(null)}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  activeSeg?.name === s.name ? "bg-[#FAF8F3] border-[#174C4A]" : "border-[#ECE6DA]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="font-bold text-[#1C1917] truncate max-w-[140px]">{s.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-[#1C1917] font-mono">{s.percentage}%</span>
                  <span className="text-[10px] text-[#A8A29E] block">{s.weightTons} MT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Formal Transaction Volume Bar Chart */}
      <div className="lg:col-span-6 bg-white border border-[#EFE8DC] rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#A8A29E]">
              7-DAY FORMAL SETTLEMENTS
            </span>
            <h3 className="text-xl font-black text-[#1C1917] mt-0.5">
              Weekly Disbursed Volume
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#A8A29E]">7-Day Total</span>
            <div className="font-mono font-black text-[#174C4A] text-lg">₹24.9 Lakhs</div>
          </div>
        </div>

        {/* Bar Chart Bars */}
        <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
          {WEEKLY_SETTLEMENTS.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono font-bold text-[#1C1917] transition-opacity">
                ₹{item.amountLakhs}L
              </span>
              <div
                className="w-full max-w-[34px] rounded-t-xl bg-gradient-to-t from-[#174C4A] to-emerald-500 group-hover:to-[#FF7337] transition-all shadow-xs"
                style={{ height: `${item.heightPercent}%` }}
              />
              <span className="text-xs font-bold text-[#A8A29E] group-hover:text-[#1C1917]">
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
