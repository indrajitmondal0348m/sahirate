import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Package, AlertCircle, Scale, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import type { Lot } from "@/types";

interface QuickLotLookupProps {
  lots?: Lot[];
  onSelectLot?: (lot: Lot) => void;
}

export default function QuickLotLookup({ lots = [], onSelectLot }: QuickLotLookupProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searched, setSearched] = useState(false);
  const [matchedLot, setMatchedLot] = useState<Lot | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearched(true);
    const cleanQuery = searchTerm.trim().toLowerCase();

    // Look for exact or partial match in provided lots
    const found = lots.find(
      (l) =>
        l.id.toLowerCase() === cleanQuery ||
        l.id.toLowerCase().includes(cleanQuery) ||
        (l.collector_id && l.collector_id.toLowerCase().includes(cleanQuery))
    );

    if (found) {
      setMatchedLot(found);
      if (onSelectLot) onSelectLot(found);
    } else {
      setMatchedLot(null);
    }
  };

  const handleProceed = () => {
    if (matchedLot) {
      navigate(`/recycler/lots/${matchedLot.id}`);
    } else if (searchTerm.trim()) {
      // Navigate directly with the ID entered
      navigate(`/recycler/lots/${searchTerm.trim()}`);
    }
  };

  return (
    <div className="bg-white border border-[#EFE8DC] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF7337] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> {t("portal.quick_lookup_title" as any) || "QUICK COLLECTOR LOT LOOKUP"}
          </span>
          <h3 className="text-xl font-black text-[#1C1917] mt-0.5">
            Instant Yard Weighment Intake
          </h3>
        </div>
      </div>

      <p className="text-xs text-[#78716C] leading-relaxed">
        {t("portal.quick_lookup_desc" as any) ||
          "Got a collector at your yard? Enter their Unique Lot ID to immediately inspect weighment and initiate settlement:"}
      </p>

      {/* Input & Search Form */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearched(false);
            }}
            placeholder={
              t("portal.quick_lookup_placeholder" as any) ||
              "Enter Collector Unique Lot ID (e.g. SR-LOT-8421)..."
            }
            className="w-full bg-[#FAF8F3] border border-[#ECE6DA] rounded-full pl-11 pr-4 py-3 text-xs sm:text-sm font-mono font-bold text-[#1C1917] placeholder:font-sans placeholder:font-normal placeholder:text-[#A8A29E] focus:bg-white focus:outline-none focus:border-[#FF7337] transition-all"
          />
        </div>

        <Button
          type="submit"
          className="w-full sm:w-auto rounded-full bg-[#FF7337] hover:bg-[#E55A1F] text-white font-bold text-xs h-11 px-6 shadow-sm shadow-[#FF7337]/25 shrink-0"
        >
          {t("portal.quick_lookup_btn" as any) || "Inspect Lot"}
        </Button>
      </form>

      {/* Matched Lot Preview Card */}
      {searched && matchedLot && (
        <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-emerald-300 text-xs space-y-3 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between">
            <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Found Lot: {matchedLot.id}
            </span>
            <span className="text-[10px] uppercase font-bold text-[#78716C] bg-white px-2 py-0.5 rounded border border-[#ECE6DA]">
              {matchedLot.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div>
              <span className="text-[#A8A29E] block text-[10px]">Material</span>
              <span className="font-bold text-[#1C1917] text-sm">{matchedLot.material_id}</span>
            </div>
            <div>
              <span className="text-[#A8A29E] block text-[10px]">Approx Weight</span>
              <span className="font-bold text-[#1C1917] text-sm">
                {matchedLot.approx_weight_kg || matchedLot.total_weight_kg || 0} kg
              </span>
            </div>
            <div>
              <span className="text-[#A8A29E] block text-[10px]">Fair Valuation</span>
              <span className="font-black text-[#FF7337] text-sm font-mono">
                ₹{(matchedLot.estimated_value || matchedLot.estimated_value_inr || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-end">
              <Button
                onClick={handleProceed}
                size="sm"
                className="rounded-full bg-[#174C4A] hover:bg-[#123C3B] text-white font-bold text-xs shadow-sm h-8 px-4"
              >
                Open & Verify <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {searched && !matchedLot && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>No local cached lot matches "{searchTerm}". Click to inspect backend directly:</span>
          </div>
          <Button
            onClick={handleProceed}
            size="sm"
            variant="outline"
            className="rounded-full bg-white text-xs font-bold border-amber-300"
          >
            Direct Lookup →
          </Button>
        </div>
      )}
    </div>
  );
}
