import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Inbox,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Scale,
  Zap,
  IndianRupee,
  Layers,
  Recycle,
  Check,
  ShieldCheck,
  Building2,
  Receipt,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { getLots, getPayments, CURRENT_RECYCLER_ID } from "@/services/api";
import MaterialDistributionPieChart from "@/components/analytics/MaterialDistributionPieChart";
import PriceHistoryChart from "@/components/analytics/PriceHistoryChart";
import QuickLotLookup from "@/components/QuickLotLookup";
import type { Lot, Payment } from "@/types";

export default function RecyclerHome() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [availableLots, setAvailableLots] = useState<Lot[]>([]);
  const [myAcceptedLots, setMyAcceptedLots] = useState<Lot[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allLots, allPayments] = await Promise.all([
        getLots(),
        getPayments()
      ]);
      setAvailableLots(allLots.filter((l) => l.status === "AVAILABLE"));
      setMyAcceptedLots(allLots.filter((l) => l.accepted_by === CURRENT_RECYCLER_ID));
      setPayments(allPayments);
    } catch (err) {
      console.error("Failed to load recycler dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalDisbursed = payments.reduce((sum, p) => sum + p.amount, 0);

  const marketRates = [
    { name: "COPPER WIRE (99%)", range: "₹680 - ₹740/kg", observations: "24 observations", trend: "+2.4%" },
    { name: "BRASS UTENSIL", range: "₹420 - ₹460/kg", observations: "18 observations", trend: "+1.1%" },
    { name: "ALUMINUM CAST", range: "₹145 - ₹165/kg", observations: "32 observations", trend: "+0.8%" },
    { name: "PET BOTTLES", range: "₹28 - ₹34/kg", observations: "45 observations", trend: "+3.2%" },
    { name: "LEAD BATTERY SCRAP", range: "₹92 - ₹98/kg", observations: "21 observations", trend: "+1.5%" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. RECYCLER HERO SECTION (100% Recycler-Centric) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-[#FFFDF9] to-[#FCEFE3] border border-[#EFE8DC] p-8 sm:p-12 lg:p-14 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex-1 space-y-4 max-w-xl">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF7337]">
            {t("portal.hero_category" as any) || "RECYCLER YARD OPERATIONS"}
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-[#1C1917] tracking-tight leading-[1.1]">
            {t("portal.hero_title" as any) || "Authorized Scrap Intake & Verified Lot Settlements."}
          </h1>
          <p className="text-sm sm:text-base text-[#78716C] font-medium leading-relaxed">
            {t("portal.hero_subtitle" as any) ||
              "Receive aggregated scrap lots from verified local collectors. Inspect digital weighments, verify AI classifications, and disburse instant traceable UPI payments."}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link to="/recycler/lots">
              <Button className="rounded-full bg-[#FF7337] hover:bg-[#E55A1F] text-white font-bold text-sm h-12 px-7 shadow-lg shadow-[#FF7337]/25 transition-transform hover:scale-105">
                {t("portal.btn_browse_lots" as any) || "+ Browse Incoming Lots"}
              </Button>
            </Link>
            <Button
              onClick={loadData}
              variant="outline"
              className="rounded-full bg-white hover:bg-[#FAF8F3] text-[#1C1917] font-bold text-sm h-12 px-5 border-[#ECE6DA] shadow-sm gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#FF7337]" : "text-[#78716C]"}`} />
              {t("portal.btn_sync" as any) || "Sync Ledger"}
            </Button>
          </div>
        </div>

        {/* Right side graphic with RECYCLER badges */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full border border-[#ECE6DA]/60 animate-pulse" />
          <div className="absolute inset-8 rounded-full border border-dashed border-[#FF7337]/30" />
          <div className="absolute inset-16 rounded-full bg-[#FAF8F3] shadow-inner flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-white border border-[#EFE8DC] shadow-xl flex items-center justify-center text-[#FF7337] transform rotate-[-6deg] hover:rotate-0 transition-transform">
              <Recycle className="w-12 h-12" />
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-6 right-2 bg-white/95 backdrop-blur-sm border border-[#ECE6DA] rounded-full px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-sm flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            {t("portal.tag_ai_verified" as any) || "AI Grade Verified"}
          </div>
          <div className="absolute bottom-6 left-2 bg-white/95 backdrop-blur-sm border border-[#ECE6DA] rounded-full px-3.5 py-1 text-xs font-bold text-[#FF7337] shadow-sm flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t("portal.tag_live_api" as any) || "Live Central API"}
          </div>
        </div>
      </div>

      {/* 2. QUICK COLLECTOR UNIQUE LOT LOOKUP BAR */}
      <QuickLotLookup lots={availableLots} />

      {/* 3. 4 FEATURE / KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link to="/recycler/lots" className="block group">
          <div className="bg-white border border-[#EFE8DC] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
            <div className="w-9 h-9 rounded-full bg-[#FF7337]/10 flex items-center justify-center text-[#FF7337] mb-4">
              <Inbox className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-[#1C1917]">
              {t("portal.kpi_new_lot" as any) || "Incoming Lots"}
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              {t("portal.kpi_new_lot_sub" as any) || "Collector lots feed"}
            </p>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-[#1C1917]">{availableLots.length}</span>
              <span className="text-xs font-semibold text-[#FF7337] flex items-center gap-1">
                Queue <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </Link>

        <Link to="/recycler/rates" className="block group">
          <div className="bg-white border border-[#EFE8DC] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <IndianRupee className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-[#1C1917]">
              {t("portal.kpi_price_board" as any) || "Price Board"}
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              {t("portal.kpi_price_board_sub" as any) || "Fair benchmarks"}
            </p>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-[#1C1917]">12</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                Active benchmarks
              </span>
            </div>
          </div>
        </Link>

        <Link to="/recycler/lots?tab=accepted" className="block group">
          <div className="bg-white border border-[#EFE8DC] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-[#1C1917]">
              {t("portal.kpi_accepted_lots" as any) || "Accepted Lots"}
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              {t("portal.kpi_accepted_lots_sub" as any) || "Weighment pending"}
            </p>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-[#1C1917]">{myAcceptedLots.length}</span>
              <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                In progress
              </span>
            </div>
          </div>
        </Link>

        <Link to="/recycler/transactions" className="block group">
          <div className="bg-white border border-[#EFE8DC] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-[#1C1917]">
              {t("portal.kpi_earnings" as any) || "Disbursed Ledger"}
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              {t("portal.kpi_earnings_sub" as any) || "Settled transactions"}
            </p>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-[#1C1917]">
                ₹{totalDisbursed.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                Settled
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* 4. ANALYTICS & CHARTS SECTION (Pie Chart + 7-Day Price History) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Pie Chart of Material Intake */}
        <div className="lg:col-span-6">
          <MaterialDistributionPieChart
            title={t("portal.analytics_title" as any) || "Material Intake Distribution"}
          />
        </div>

        {/* 7-Day Price History Trend */}
        <div className="lg:col-span-6">
          <PriceHistoryChart />
        </div>
      </div>

      {/* 5. RECENT LOTS & TODAY'S PRICE BENCHMARK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Incoming Collector Lots with Unique IDs */}
        <div className="lg:col-span-7 bg-white border border-[#EFE8DC] rounded-3xl p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-black text-xl text-[#1C1917]">
                {t("portal.recent_lots_title" as any) || "Recent Incoming Lots"}
              </h3>
              <p className="text-xs text-[#78716C]">
                {t("portal.recent_lots_sub" as any) ||
                  "Real-time scrap queues ready for physical yard weighment"}
              </p>
            </div>
            <Link
              to="/recycler/lots"
              className="text-xs font-bold text-[#FF7337] hover:underline flex items-center gap-1"
            >
              {t("portal.see_all" as any) || "See all →"}
            </Link>
          </div>

          {availableLots.length === 0 ? (
            <div className="py-12 text-center text-[#A8A29E] text-sm">
              No new lots currently waiting. Click "Sync Ledger" to check.
            </div>
          ) : (
            <div className="space-y-3">
              {availableLots.slice(0, 4).map((lot) => (
                <div
                  key={lot.id}
                  className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] flex items-center justify-between gap-4 hover:bg-[#F5F2EB] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#FF7337]/10 flex items-center justify-center text-[#FF7337] font-bold text-sm shrink-0">
                      {(lot.material_id || "SC").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1C1917] text-sm">
                          {lot.material_id || "Mixed Scrap"} • {lot.approx_weight_kg || lot.total_weight_kg || 0} kg
                        </span>
                        <span className="font-mono text-[10px] font-black text-[#FF7337] bg-white border border-[#ECE6DA] px-2 py-0.5 rounded-full">
                          {lot.id}
                        </span>
                      </div>
                      <div className="text-xs text-[#78716C] mt-0.5">
                        Collector: {lot.collector_phone || lot.collector_id || "Verified Collector"} • Valuation: ₹{(lot.estimated_value || lot.estimated_value_inr || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <Link to={`/recycler/lots/${lot.id}`}>
                    <Button
                      size="sm"
                      className="rounded-full bg-white hover:bg-white text-[#1C1917] border border-[#ECE6DA] text-xs font-bold shadow-sm"
                    >
                      {t("portal.review_lot" as any) || "Review Lot"}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Market Snapshot */}
        <div className="lg:col-span-5 bg-white border border-[#EFE8DC] rounded-3xl p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider">
                {t("portal.market_snapshot" as any) || "MARKET SNAPSHOT"}
              </div>
              <h3 className="font-black text-xl text-[#1C1917] mt-0.5">
                {t("portal.todays_prices_title" as any) || "Today's Prices"}
              </h3>
            </div>
            <Link to="/recycler/rates" className="text-xs font-bold text-[#FF7337] hover:underline">
              {t("portal.see_all" as any) || "See all →"}
            </Link>
          </div>

          <div className="divide-y divide-[#ECE6DA]">
            {marketRates.map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#FF7337] rotate-45" />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-[#1C1917] tracking-tight">
                      {item.name}
                    </span>
                    <div className="text-[11px] text-[#A8A29E]">{item.observations}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs sm:text-sm text-[#1C1917]">
                    {item.range}
                  </span>
                  <div className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                    <TrendingUp className="w-3 h-3" /> {item.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
