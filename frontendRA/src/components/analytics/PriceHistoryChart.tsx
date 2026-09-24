import { useState } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, Sparkles } from "lucide-react";

interface CommodityHistory {
  id: string;
  name: string;
  currentRate: number;
  changePercent: number;
  unit: string;
  history: { day: string; price: number }[];
}

const COMMODITIES: CommodityHistory[] = [
  {
    id: "copper",
    name: "Copper Wire (99% Purity)",
    currentRate: 740,
    changePercent: 4.2,
    unit: "kg",
    history: [
      { day: "Thu", price: 710 },
      { day: "Fri", price: 715 },
      { day: "Sat", price: 718 },
      { day: "Sun", price: 725 },
      { day: "Mon", price: 728 },
      { day: "Tue", price: 735 },
      { day: "Today", price: 740 },
    ],
  },
  {
    id: "brass",
    name: "Brass Utensils & Fittings",
    currentRate: 460,
    changePercent: 2.1,
    unit: "kg",
    history: [
      { day: "Thu", price: 445 },
      { day: "Fri", price: 448 },
      { day: "Sat", price: 450 },
      { day: "Sun", price: 452 },
      { day: "Mon", price: 455 },
      { day: "Tue", price: 458 },
      { day: "Today", price: 460 },
    ],
  },
  {
    id: "aluminum",
    name: "Cast Aluminum Sections",
    currentRate: 165,
    changePercent: -1.2,
    unit: "kg",
    history: [
      { day: "Thu", price: 168 },
      { day: "Fri", price: 169 },
      { day: "Sat", price: 167 },
      { day: "Sun", price: 166 },
      { day: "Mon", price: 165 },
      { day: "Tue", price: 164 },
      { day: "Today", price: 165 },
    ],
  },
  {
    id: "battery",
    name: "Lead Acid Battery Scrap",
    currentRate: 98,
    changePercent: 3.5,
    unit: "kg",
    history: [
      { day: "Thu", price: 92 },
      { day: "Fri", price: 93 },
      { day: "Sat", price: 94 },
      { day: "Sun", price: 95 },
      { day: "Mon", price: 96 },
      { day: "Tue", price: 97 },
      { day: "Today", price: 98 },
    ],
  },
];

export default function PriceHistoryChart() {
  const [selectedCommodityId, setSelectedCommodityId] = useState("copper");

  const selected = COMMODITIES.find((c) => c.id === selectedCommodityId) || COMMODITIES[0];

  const minPrice = Math.min(...selected.history.map((h) => h.price)) * 0.96;
  const maxPrice = Math.max(...selected.history.map((h) => h.price)) * 1.04;
  const range = maxPrice - minPrice || 1;

  // Chart Dimensions
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = selected.history.map((item, idx) => {
    const x = paddingX + (idx / (selected.history.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((item.price - minPrice) / range) * (height - paddingY * 2);
    return { x, y, day: item.day, price: item.price };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="bg-white border border-[#EFE8DC] rounded-3xl p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#A8A29E]">
              7-DAY STATE BENCHMARK COMMODITY TRENDS
            </span>
          </div>
          <h3 className="text-xl font-black text-[#1C1917] mt-0.5">
            Historical Price Trajectory
          </h3>
        </div>

        {/* Commodity Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FAF8F3] border border-[#ECE6DA] rounded-2xl">
          {COMMODITIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCommodityId(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCommodityId === c.id
                  ? "bg-white text-[#1C1917] shadow-sm font-extrabold border border-[#ECE6DA]"
                  : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              {c.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Selected Stats Ribbon */}
      <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-[#ECE6DA]">
        <div>
          <span className="text-xs font-bold text-[#78716C] block">{selected.name}</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-black text-[#1C1917] font-mono">
              ₹{selected.currentRate}/{selected.unit}
            </span>
            <span
              className={`text-xs font-bold flex items-center ${
                selected.changePercent >= 0 ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {selected.changePercent >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {Math.abs(selected.changePercent)}% 7d
            </span>
          </div>
        </div>

        <div className="text-right text-xs text-[#A8A29E]">
          <span>Verified State Benchmark</span>
          <div className="font-bold text-[#1C1917]">Bhubaneswar Yard Cluster</div>
        </div>
      </div>

      {/* SVG Interactive Area Chart */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 sm:h-52">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF7337" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FF7337" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#ECE6DA"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={(height - paddingY) / 2}
            x2={width - paddingX}
            y2={(height - paddingY) / 2}
            stroke="#ECE6DA"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#ECE6DA"
          />

          {/* Area fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Line stroke */}
          <path d={pathD} fill="none" stroke="#FF7337" strokeWidth="3" strokeLinecap="round" />

          {/* Points & Values */}
          {points.map((pt, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill="#FFFFFF"
                stroke="#FF7337"
                strokeWidth="2.5"
                className="transition-transform group-hover:scale-150"
              />
              {/* Day Label */}
              <text
                x={pt.x}
                y={height - 6}
                textAnchor="middle"
                fontSize="11"
                fill="#A8A29E"
                fontWeight="600"
              >
                {pt.day}
              </text>
              {/* Price Tag over point */}
              <text
                x={pt.x}
                y={pt.y - 10}
                textAnchor="middle"
                fontSize="11"
                fill="#1C1917"
                fontWeight="800"
                fontFamily="monospace"
              >
                ₹{pt.price}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
