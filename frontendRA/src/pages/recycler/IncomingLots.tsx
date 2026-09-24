import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw, Filter, Inbox, Scale, CheckCircle2, QrCode, Sparkles, MapPin, Search, Atom, Leaf, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { getLots, CURRENT_RECYCLER_ID } from "@/services/api";
import { calculateCriticalMinerals } from "@/utils/criticalMinerals";
import type { Lot } from "@/types";

type FilterTab = "all" | "available" | "accepted";

export default function IncomingLots() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [searchLotId, setSearchLotId] = useState("");
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLots = async () => {
    setLoading(true);
    try {
      const data = await getLots();
      setLots(data);
    } catch (err) {
      console.error("Failed to load lots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const filteredLots = lots.filter((lot) => {
    if (searchLotId.trim()) {
      const q = searchLotId.trim().toLowerCase();
      const matchesId = lot.id.toLowerCase().includes(q);
      const matchesMat = (lot.material_id || "").toLowerCase().includes(q);
      const matchesCollector = (lot.collector_id || "").toLowerCase().includes(q);
      if (!matchesId && !matchesMat && !matchesCollector) return false;
    }

    if (filter === "available") return lot.status === "AVAILABLE";
    if (filter === "accepted") return lot.accepted_by === CURRENT_RECYCLER_ID;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">AVAILABLE</span>;
      case "ACCEPTED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">ACCEPTED</span>;
      case "VERIFIED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">VERIFIED</span>;
      case "QR_GENERATED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">QR ACTIVE</span>;
      case "COLLECTOR_CONFIRMED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">CONFIRMED</span>;
      case "COMPLETED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">COMPLETED</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#FF7337]">
            {t("portal.recycler_space" as any) || "RECYCLER INVENTORY"}
          </div>
          <h1 className="text-3xl font-black text-[#1C1917] tracking-tight">
            {t("portal.nav_incoming_lots" as any) || "Available & Accepted Lots"}
          </h1>
          <p className="text-xs text-[#78716C] font-medium mt-0.5">
            Real-time collector lots synced to the central FastAPI backend
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Pills */}
          <div className="flex p-1 bg-[#EFEBE3] rounded-2xl">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                filter === "all" ? "bg-white text-[#1C1917] shadow-sm font-extrabold" : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              All ({lots.length})
            </button>
            <button
              onClick={() => setFilter("available")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                filter === "available" ? "bg-white text-[#FF7337] shadow-sm font-extrabold" : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              Available ({lots.filter((l) => l.status === "AVAILABLE").length})
            </button>
            <button
              onClick={() => setFilter("accepted")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                filter === "accepted" ? "bg-white text-blue-700 shadow-sm font-extrabold" : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              My Accepted ({lots.filter((l) => l.accepted_by === CURRENT_RECYCLER_ID).length})
            </button>
          </div>

          <Button
            onClick={fetchLots}
            variant="outline"
            className="rounded-2xl bg-white hover:bg-[#FAF8F3] text-[#1C1917] border-[#ECE6DA] shadow-sm text-xs font-bold h-10 px-4"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-[#FF7337]" : "text-[#78716C]"}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Search by Unique Lot ID */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
        <input
          type="text"
          value={searchLotId}
          onChange={(e) => setSearchLotId(e.target.value)}
          placeholder="Filter by Unique Lot ID (e.g. SR-LOT-8421)..."
          className="w-full bg-white border border-[#ECE6DA] rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-[#1C1917] placeholder:font-sans placeholder:font-normal placeholder:text-[#A8A29E] focus:outline-none focus:border-[#FF7337] shadow-xs"
        />
        {searchLotId && (
          <button
            onClick={() => setSearchLotId("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#A8A29E] hover:text-[#1C1917]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Content List */}
      {loading ? (
        <div className="py-20 text-center text-[#A8A29E] font-medium text-sm">
          Loading incoming lots from backend...
        </div>
      ) : filteredLots.length === 0 ? (
        <div className="bg-white border border-[#EFE8DC] rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FF7337]/10 text-[#FF7337] flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-[#1C1917]">No lots found</h3>
          <p className="text-xs text-[#78716C] mt-1">
            {searchLotId
              ? `No lot found matching "${searchLotId}". Try clearing the search.`
              : "There are no lots matching the selected filter currently in the database."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLots.map((lot) => (
            <div
              key={lot.id}
              className="bg-white border border-[#EFE8DC] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {getStatusBadge(lot.status)}
                  <span className="font-mono text-xs font-black text-[#FF7337] bg-[#FAF8F3] border border-[#ECE6DA] px-2.5 py-0.5 rounded-full">
                    {lot.id}
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-lg text-[#1C1917]">
                    {(lot.extra_data?.items || lot.items)?.length
                      ? `Bundled Lot (${(lot.extra_data?.items || lot.items)!.length} Materials)`
                      : lot.material_id === "MIXED_SCRAP"
                      ? `Scrap Lot #${lot.id.slice(0, 8)}`
                      : lot.material_id || "Scrap Lot"}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#78716C] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#A8A29E]" />
                    <span>Bhubaneswar Industrial Zone</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#A8A29E] block text-[11px]">Weight</span>
                    <span className="font-black text-[#1C1917] text-base">
                      {lot.approx_weight_kg || lot.total_weight_kg || 0} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-[#A8A29E] block text-[11px]">
                      {lot.asking_price || lot.extra_data?.asking_price ? "Asking Price" : "Est. Value"}
                    </span>
                    <span className="font-black text-[#FF7337] text-base">
                      ₹{(lot.asking_price || lot.extra_data?.asking_price || lot.estimated_value || lot.estimated_value_inr || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-[#ECE6DA]/60">
                    <span className="text-[#A8A29E] text-[11px]">Collector Reference: </span>
                    <span className="font-semibold text-[#1C1917]">
                      {lot.collector_phone || lot.collector_id || "Anonymous Collector"}
                    </span>
                  </div>
                </div>

                {/* Extractable Critical Materials & Minerals Box */}
                {(() => {
                  const items = lot.extra_data?.items || lot.items || [];
                  const weight = lot.approx_weight_kg || lot.total_weight_kg || 1;
                  const recovery = calculateCriticalMinerals(lot.material_id || "PCB", weight, items);
                  return (
                    <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1C1917] flex items-center gap-1.5">
                          <Atom className="w-3.5 h-3.5 text-[#FF7337]" />
                          Extractable Minerals:
                        </span>
                        <span className="text-[9px] font-bold text-[#A8A29E] uppercase tracking-wider font-mono">
                          Mineral Recovery Yield
                        </span>
                      </div>

                      {/* Recoverable elements pills */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {recovery.minerals.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            className="inline-flex items-center gap-1.5 bg-white border border-[#DDD8CC] px-2 py-1 rounded-xl text-[10px] font-bold shadow-2xs"
                            title={m.description}
                          >
                            <span className="w-4 h-4 rounded bg-[#FF7337]/10 text-[#FF7337] flex items-center justify-center font-mono text-[9px] font-black">
                              {m.symbol}
                            </span>
                            <span className="text-[#1C1917] font-semibold">{m.name}:</span>
                            <span className="font-mono text-[#FF7337] font-black">{m.amountFormatted}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold pt-1 border-t border-[#ECE6DA]/60">
                        <Leaf className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{recovery.hazardAvoided}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="pt-5 mt-5 border-t border-[#ECE6DA]">
                {lot.status === "AVAILABLE" ? (
                  <Link to={`/recycler/lots/${lot.id}`} className="block">
                    <Button className="w-full rounded-full bg-[#FF7337] hover:bg-[#E55A1F] text-white font-bold text-xs h-10 shadow-sm shadow-[#FF7337]/20 flex items-center justify-center gap-1.5">
                      Review & Accept Lot <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                ) : lot.status === "ACCEPTED" ? (
                  <Link to={`/recycler/lots/${lot.id}/verify`} className="block">
                    <Button className="w-full rounded-full bg-[#174C4A] hover:bg-[#123C3B] text-white font-bold text-xs h-10 shadow-sm flex items-center justify-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" /> Physical Weighment & Verify
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/recycler/lots/${lot.id}`} className="block">
                    <Button variant="outline" className="w-full rounded-full bg-white hover:bg-[#FAF8F3] text-[#1C1917] border-[#ECE6DA] font-bold text-xs h-10 shadow-sm flex items-center justify-center gap-1.5">
                      View Audit Details <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
