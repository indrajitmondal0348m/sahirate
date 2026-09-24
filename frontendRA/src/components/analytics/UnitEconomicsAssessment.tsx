import { useState } from "react";
import { TrendingUp, Scale, Coins, ShieldCheck, ArrowRight, Sparkles, Building2, HelpCircle } from "lucide-react";

export default function UnitEconomicsAssessment() {
  const [monthlyVolumeTons, setMonthlyVolumeTons] = useState<number>(25);

  // Calculations based on 1 kg of mixed electronic scrap
  const cpcbBenchmarkRate = 80; // ₹80 / kg fair market value
  
  // Middleman (Informal unverified path)
  const middlemanReportedWeight = 0.75; // Rigged scale (-25%)
  const middlemanRateOffered = 64; // Underpaid rate (-20%)
  const middlemanCollectorPayout = middlemanReportedWeight * middlemanRateOffered; // ₹48.00
  
  // SahiRate Formal Path
  const sahirateWeight = 1.0; // Digitally calibrated load cell
  const sahirateRateOffered = 80; // CPCB / National Scrap Benchmark price index
  const sahirateCollectorPayout = sahirateWeight * sahirateRateOffered; // ₹80.00
  const collectorLiftPct = Math.round(((sahirateCollectorPayout - middlemanCollectorPayout) / middlemanCollectorPayout) * 100); // +66.7%

  // Platform Sustainability Model
  const eprFeeRate = 0.015; // 1.5% fee charged to the authorized smelter/producer for EPR compliance certification
  const platformFeePerKg = sahirateRateOffered * eprFeeRate; // ₹1.20 / kg (₹1,200 per ton)
  const monthlyKg = monthlyVolumeTons * 1000;
  const monthlyCollectorExtraEarnings = (sahirateCollectorPayout - middlemanCollectorPayout) * monthlyKg;
  const monthlyPlatformRevenue = platformFeePerKg * monthlyKg;

  return (
    <div className="bg-[#FAF8F3] border border-[#DDD8CC] rounded-3xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDD8CC]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-emerald-700" /> SIH Evaluation Criteria • Financial Feasibility
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight">
            Unit Economics & Platform Financial Sustainability
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl font-medium">
            Comparative analysis demonstrating the +66% collector income lift over predatory middlemen, 
            and how the zero-cost collector model sustains itself via 1.5% EPR transaction compliance fees.
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#DDD8CC] shadow-xs flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base">
            +{collectorLiftPct}%
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Collector Net Income Lift
            </span>
            <span className="text-xs font-black text-charcoal">Eliminating Rigged Scales</span>
          </div>
        </div>
      </div>

      {/* Head-to-Head Comparison: Middleman vs SahiRate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Traditional Informal Middleman */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Informal Route (Current Reality)
              </span>
              <h3 className="font-black text-base text-charcoal mt-1">Predatory Middleman / Aggregator</h3>
            </div>
            <Scale className="w-5 h-5 text-rose-500" />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-muted-foreground font-medium">Physical Weight Intake</span>
              <span className="font-mono font-bold text-charcoal">1.00 kg</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-muted-foreground font-medium">Scale Reading (Rigged -25%)</span>
              <span className="font-mono font-bold text-rose-700">0.75 kg</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-muted-foreground font-medium">Arbitrary Discounting Cut</span>
              <span className="font-mono font-bold text-rose-700">₹64 / kg (vs ₹80 bench)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-muted-foreground font-medium">Backyard Acid Leaching Hazard</span>
              <span className="font-bold text-rose-600">High (No EPR / Unsafe)</span>
            </div>
          </div>

          <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200/80 flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900">Collector Take-Home:</span>
            <span className="text-xl font-black font-mono text-rose-800">₹{middlemanCollectorPayout.toFixed(2)}</span>
          </div>
        </div>

        {/* Card 2: SahiRate Formal Chain */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-300 shadow-xs space-y-4 ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                SahiRate Formal Chain
              </span>
              <h3 className="font-black text-base text-charcoal mt-1">Authorized CPCB Registered Yard</h3>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-muted-foreground font-medium">Physical Weight Intake</span>
              <span className="font-mono font-bold text-charcoal">1.00 kg</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-muted-foreground font-medium">Digital Calibrated Weight</span>
              <span className="font-mono font-bold text-emerald-700">1.00 kg (100% Accurate)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-muted-foreground font-medium">CPCB Benchmark Rate Applied</span>
              <span className="font-mono font-bold text-emerald-700">₹80.00 / kg</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-muted-foreground font-medium">Collector Platform Fee</span>
              <span className="font-bold text-emerald-700">₹0.00 (Zero Fee to Collector)</span>
            </div>
          </div>

          <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-300 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-950">Collector Take-Home:</span>
              <span className="text-[10px] text-emerald-800 font-bold block">
                +₹{(sahirateCollectorPayout - middlemanCollectorPayout).toFixed(2)} extra per kg
              </span>
            </div>
            <span className="text-2xl font-black font-mono text-emerald-700">₹{sahirateCollectorPayout.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Interactive Volume Simulator */}
      <div className="bg-white rounded-2xl p-6 border border-[#DDD8CC] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-sm text-charcoal uppercase tracking-wider">
              Platform Scalability & Revenue Simulation
            </h3>
            <p className="text-xs text-muted-foreground">
              Adjust monthly collection volume to see platform sustainability and collector wealth creation.
            </p>
          </div>
          <div className="bg-[#FAF8F3] px-3.5 py-1.5 rounded-xl border border-[#DDD8CC] text-right">
            <span className="text-xs font-mono font-black text-primary">{monthlyVolumeTons} Metric Tons</span>
            <span className="text-[10px] text-muted-foreground block">({(monthlyVolumeTons * 1000).toLocaleString()} kg / mo)</span>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="pt-2">
          <input
            type="range"
            min="5"
            max="150"
            step="5"
            value={monthlyVolumeTons}
            onChange={(e) => setMonthlyVolumeTons(Number(e.target.value))}
            className="w-full accent-primary h-2 bg-stone-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
            <span>5 Tons (Pilot Ward)</span>
            <span>50 Tons (District Hub)</span>
            <span>150 Tons (State Metro)</span>
          </div>
        </div>

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#DDD8CC]">
          <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#DDD8CC]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Collector Extra Income
            </span>
            <p className="text-xl font-black text-emerald-700 font-mono mt-1">
              ₹{Math.round(monthlyCollectorExtraEarnings).toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">Directly injected into informal economy</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#DDD8CC]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              1.5% EPR Fee Revenue
            </span>
            <p className="text-xl font-black text-primary font-mono mt-1">
              ₹{Math.round(monthlyPlatformRevenue).toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">Paid by smelters/brands per ton</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#DDD8CC]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Annual Self-Sustaining Run-Rate
            </span>
            <p className="text-xl font-black text-charcoal font-mono mt-1">
              ₹{Math.round(monthlyPlatformRevenue * 12).toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">100% Zero-Taxpayer-Subsidy</span>
          </div>
        </div>
      </div>

      {/* Rationale Bullet Points for Evaluators */}
      <div className="bg-[#FAF8F3] p-4 rounded-2xl border border-[#DDD8CC] text-xs space-y-2 text-[#44403C]">
        <p className="font-black text-charcoal flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-primary" /> Key Arguments for the SIH Jury & Ministry of Mines:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>
            <strong className="text-charcoal">Why Collectors Switch Voluntarily:</strong> They earn 66% more cash immediately with zero technology barrier (cash or UPI payout on certified scale).
          </li>
          <li>
            <strong className="text-charcoal">Why Recyclers Will Pay 1.5%:</strong> Formal recyclers face heavy CPCB penalties (up to ₹5,000/ton) for failing EPR quotas; SahiRate provides verified chain-of-custody certificates that legally satisfy Central EPR mandates.
          </li>
          <li>
            <strong className="text-charcoal">No Operational Grants Needed:</strong> Cloud hosting, load cell verification APIs, and field worker outreach are fully covered by the ₹1,200/ton transaction margin.
          </li>
        </ul>
      </div>
    </div>
  );
}
