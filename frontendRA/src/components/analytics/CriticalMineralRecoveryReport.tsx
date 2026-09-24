import { Sparkles, ShieldCheck, Zap, Factory, Award, ArrowUpRight } from "lucide-react";

interface MineralMetric {
  name: string;
  symbol: string;
  salvagedAmount: string;
  purity: string;
  primaryOreMultiplier: string; // e.g. "45x richer than virgin ore"
  application: string;
  recoveryStandard: string;
  color: string;
}

const CRITICAL_MINERALS_DATA: MineralMetric[] = [
  {
    name: "Neodymium (NdFeB)",
    symbol: "Nd",
    salvagedAmount: "142.8 kg",
    purity: "98.5%",
    primaryOreMultiplier: "60x richer than monazite sand",
    application: "Permanent magnets for EV traction motors & wind generators",
    recoveryStandard: "NCM-REE-2023/M1",
    color: "bg-amber-500",
  },
  {
    name: "Lithium Carbonate Eq.",
    symbol: "Li",
    salvagedAmount: "318.5 kg",
    purity: "99.2%",
    primaryOreMultiplier: "35x richer than spodumene ore",
    application: "Cathode active material for localized Indian battery manufacturing",
    recoveryStandard: "NCM-LIB-2024/C3",
    color: "bg-emerald-500",
  },
  {
    name: "Cobalt Metal",
    symbol: "Co",
    salvagedAmount: "186.2 kg",
    purity: "99.0%",
    primaryOreMultiplier: "50x richer than laterite cobalt ore",
    application: "Defense aerospace superalloys and high-density NMC cells",
    recoveryStandard: "NCM-STRAT-2023/B2",
    color: "bg-blue-500",
  },
  {
    name: "Tantalum Powder",
    symbol: "Ta",
    salvagedAmount: "14.6 kg",
    purity: "99.95%",
    primaryOreMultiplier: "120x richer than tantalite ore",
    application: "Ultra-compact electrolytic capacitors for avionics and 5G base stations",
    recoveryStandard: "NCM-REE-2022/T4",
    color: "bg-indigo-500",
  },
  {
    name: "Indium & Gallium",
    symbol: "In-Ga",
    salvagedAmount: "8.4 kg",
    purity: "99.99%",
    primaryOreMultiplier: "80x richer than zinc sphalerite",
    application: "Indium Tin Oxide (ITO) transparent conductors & RF semiconductors",
    recoveryStandard: "NCM-SEMI-2024/G1",
    color: "bg-purple-500",
  },
  {
    name: "Electrolytic Copper",
    symbol: "Cu",
    salvagedAmount: "12,450 kg",
    purity: "99.99%",
    primaryOreMultiplier: "25x richer than copper porphyry",
    application: "National grid transmission & transformer windings",
    recoveryStandard: "NCM-NF-2021/CU9",
    color: "bg-orange-500",
  },
];

export default function CriticalMineralRecoveryReport() {
  return (
    <div className="bg-[#FAF8F3] border border-[#DDD8CC] rounded-3xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDD8CC]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-[10px] font-black uppercase tracking-wider mb-2">
            <Award className="w-3 h-3 text-amber-700" /> Ministry of Mines & Critical Minerals Mandate
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight">
            Strategic & Rare Earth Minerals Recovery Index
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl font-medium">
            Directly aligned with India's National Critical Mineral Mission. By formalizing last-mile aggregators, 
            critical materials avoid acid-burning loss and enter certified metallurgical refining streams.
          </p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-[#DDD8CC] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Cumulative Salvaged
            </span>
            <span className="text-xs font-black text-charcoal font-mono">13,120+ kg Pure Elements</span>
          </div>
        </div>
      </div>

      {/* Primary vs Urban Mining Callout Banner */}
      <div className="bg-linear-to-r from-emerald-600 to-[#174C4A] text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
            Urban Mining Metallurgical Advantage
          </span>
          <h3 className="text-lg font-black tracking-tight">
            1 Ton of Electronic Scrap Yields 40× More Gold & 25× More Copper than 1 Ton of Mined Ore
          </h3>
          <p className="text-xs text-emerald-100/90 font-medium">
            Requires 80% less carbon emissions and zero cyanide tailing dam discharge compared to virgin open-cast extraction.
          </p>
        </div>
        <div className="shrink-0 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-center">
          <span className="text-xs font-black block font-mono">82% CO₂ Cut</span>
          <span className="text-[10px] text-white/80">vs Primary Smelting</span>
        </div>
      </div>

      {/* Minerals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CRITICAL_MINERALS_DATA.map((mineral) => (
          <div
            key={mineral.symbol}
            className="bg-white rounded-2xl p-4 border border-[#DDD8CC] shadow-xs flex flex-col justify-between hover:border-primary/50 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-xl ${mineral.color} text-white flex items-center justify-center font-black text-xs font-mono shadow-xs`}>
                    {mineral.symbol}
                  </span>
                  <div>
                    <h4 className="font-black text-xs text-charcoal leading-tight">{mineral.name}</h4>
                    <span className="text-[10px] font-mono text-muted-foreground">{mineral.recoveryStandard}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {mineral.purity}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-[11px]">Intake Volume:</span>
                  <span className="font-mono font-black text-sm text-primary">{mineral.salvagedAmount}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                  <span>Enrichment Ratio:</span>
                  <span className="text-charcoal font-bold">{mineral.primaryOreMultiplier}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-100 text-[10px] text-muted-foreground">
              <strong className="text-charcoal block mb-0.5">High-Value Application:</strong>
              {mineral.application}
            </div>
          </div>
        ))}
      </div>

      {/* Protocol Badge Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-muted-foreground font-medium">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Compliant with E-Waste (Management) Rules 2022 & Critical Minerals Mission 2024
        </span>
        <span className="font-mono text-[10px] text-stone-500">
          Certified Metallurgical Extraction Standard Rev 3.2
        </span>
      </div>
    </div>
  );
}
