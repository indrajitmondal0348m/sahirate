import { useState } from "react";
import { Layers, Info } from "lucide-react";

interface Segment {
  name: string;
  percentage: number;
  weightKg: number;
  color: string;
  rateAvg: number;
}

const DEFAULT_SEGMENTS: Segment[] = [
  { name: "Copper Wire", percentage: 38, weightKg: 471, color: "#FF7337", rateAvg: 710 },
  { name: "Brass & Bronze", percentage: 24, weightKg: 297, color: "#F59E0B", rateAvg: 440 },
  { name: "Aluminum Cast", percentage: 18, weightKg: 223, color: "#10B981", rateAvg: 155 },
  { name: "Lead Battery", percentage: 12, weightKg: 148, color: "#8B5CF6", rateAvg: 90 },
  { name: "Rigid HDPE & PET", percentage: 8, weightKg: 101, color: "#3B82F6", rateAvg: 38 },
];

export default function MaterialDistributionPieChart({ title = "Material Intake Distribution" }: { title?: string }) {
  const [activeSegment, setActiveSegment] = useState<Segment | null>(null);

  const totalWeight = DEFAULT_SEGMENTS.reduce((sum, s) => sum + s.weightKg, 0);

  // Calculate SVG donut paths
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = DEFAULT_SEGMENTS.map((segment) => {
    const startPercent = cumulativePercent;
    cumulativePercent += segment.percentage / 100;
    const endPercent = cumulativePercent;

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);
    const largeArcFlag = segment.percentage / 100 > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX * 90} ${startY * 90}`,
      `A 90 90 0 ${largeArcFlag} 1 ${endX * 90} ${endY * 90}`,
      `L ${endX * 55} ${endY * 55}`,
      `A 55 55 0 ${largeArcFlag} 0 ${startX * 55} ${startY * 55}`,
      "Z",
    ].join(" ");

    return {
      segment,
      pathData,
    };
  });

  return (
    <div className="bg-white border border-[#EFE8DC] rounded-3xl p-6 sm:p-7 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#A8A29E]">
            YARD ANALYTICS & PIE BREAKDOWN
          </span>
          <h3 className="text-xl font-black text-[#1C1917] mt-0.5">{title}</h3>
        </div>
        <div className="p-2 rounded-xl bg-[#FAF8F3] border border-[#ECE6DA] text-[#78716C]">
          <Layers className="w-4 h-4 text-[#FF7337]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Donut Chart */}
        <div className="md:col-span-6 flex flex-col items-center justify-center relative py-2">
          <svg
            viewBox="-110 -110 220 220"
            className="w-52 h-52 sm:w-60 sm:h-60 transform -rotate-90 filter drop-shadow-sm transition-transform"
          >
            {slices.map(({ segment, pathData }, idx) => {
              const isHovered = activeSegment?.name === segment.name;
              return (
                <path
                  key={idx}
                  d={pathData}
                  fill={segment.color}
                  className="cursor-pointer transition-all duration-200 hover:opacity-90"
                  style={{
                    transform: isHovered ? "scale(1.04)" : "scale(1)",
                    transformOrigin: "0 0",
                  }}
                  onMouseEnter={() => setActiveSegment(segment)}
                  onMouseLeave={() => setActiveSegment(null)}
                />
              );
            })}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider">
              {activeSegment ? activeSegment.name : "Total Intake"}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#1C1917] font-mono leading-none mt-1">
              {activeSegment ? `${activeSegment.percentage}%` : `${totalWeight.toLocaleString()} kg`}
            </span>
            <span className="text-[11px] font-semibold text-[#78716C] mt-1">
              {activeSegment ? `${activeSegment.weightKg} kg` : "5 Scrap Categories"}
            </span>
          </div>
        </div>

        {/* Legend & Details Column */}
        <div className="md:col-span-6 space-y-2.5">
          {DEFAULT_SEGMENTS.map((seg, idx) => {
            const isHovered = activeSegment?.name === seg.name;
            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveSegment(seg)}
                onMouseLeave={() => setActiveSegment(null)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isHovered
                    ? "bg-[#FAF8F3] border-[#FF7337] shadow-sm translate-x-1"
                    : "bg-white border-[#ECE6DA]/80 hover:bg-[#FAF8F3]/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: seg.color }}
                  />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-[#1C1917] block leading-tight">
                      {seg.name}
                    </span>
                    <span className="text-[11px] text-[#A8A29E]">
                      Avg ₹{seg.rateAvg}/kg • {seg.weightKg} kg
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-xs sm:text-sm text-[#1C1917] font-mono">
                    {seg.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
