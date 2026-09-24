import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Scale,
  Sparkles,
  IndianRupee,
  Atom,
  Leaf,
  Layers,
  Send,
  AlertCircle,
  Tag,
  Package,
  QrCode,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLotById, acceptLot, makeOffer, CURRENT_RECYCLER_ID } from "@/services/api";
import { calculateCriticalMinerals } from "@/utils/criticalMinerals";
import type { Lot } from "@/types";

export default function LotDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lot, setLot] = useState<Lot | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offerSuccess, setOfferSuccess] = useState<string | null>(null);

  // Counter-offer form state
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [offerMsg, setOfferMsg] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        const data = await getLotById(id!);
        setLot(data);
        const initialPrice =
          data.asking_price ||
          data.extra_data?.asking_price ||
          data.extra_data?.offered_price ||
          data.estimated_value ||
          0;
        setCounterPrice(initialPrice);
      } catch (err: any) {
        setError(err.message || "Failed to load lot");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAccept = async () => {
    if (!lot) return;
    setAccepting(true);
    setError(null);
    try {
      const updated = await acceptLot(lot.id, CURRENT_RECYCLER_ID);
      setLot(updated);
      navigate(`/recycler/lot/${lot.id}/verify`);
    } catch (err: any) {
      setError(err.message || "Failed to accept lot");
    } finally {
      setAccepting(false);
    }
  };

  const handleSendOffer = async () => {
    if (!lot || counterPrice <= 0) return;
    setSubmittingOffer(true);
    setError(null);
    setOfferSuccess(null);
    try {
      const updated = await makeOffer(lot.id, CURRENT_RECYCLER_ID, counterPrice, offerMsg);
      setLot(updated);
      setOfferSuccess(`Counter-offer of ₹${counterPrice.toLocaleString()} submitted to collector successfully!`);
    } catch (err: any) {
      setError(err.message || "Failed to submit counter-offer");
    } finally {
      setSubmittingOffer(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[#A8A29E] font-medium text-sm">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF7337]" />
        Loading lot details from ledger...
      </div>
    );
  }

  if (error && !lot) {
    return (
      <div className="bg-white border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto shadow-sm">
        <p className="font-bold text-red-600 text-sm">{error || "Lot not found"}</p>
        <Link to="/recycler/lots" className="mt-4 inline-block text-xs font-bold text-[#FF7337] underline">
          Back to Lots Feed
        </Link>
      </div>
    );
  }

  if (!lot) return null;

  const items = lot.extra_data?.items || lot.items || [];
  const askingPrice = lot.asking_price || lot.extra_data?.asking_price || lot.estimated_value;
  const estimatedMin = lot.estimated_min || lot.extra_data?.estimated_min || Math.round(lot.estimated_value * 0.94);
  const estimatedMax = lot.estimated_max || lot.extra_data?.estimated_max || Math.round(lot.estimated_value * 1.07);
  const offeredPrice = lot.extra_data?.offered_price;
  const isOffered = lot.status === "PRICE_OFFERED";
  const weight = lot.approx_weight_kg || lot.total_weight_kg || 1;
  const recovery = calculateCriticalMinerals(lot.material_id || "PCB", weight, items);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/recycler/lots"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#78716C] hover:text-[#1C1917] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Available Lots
      </Link>

      <div className="bg-white border border-[#EFE8DC] rounded-3xl shadow-sm overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#174C4A] to-[#123C3B] p-7 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
              Collector Scrap Dossier
            </span>
            <h2 className="text-2xl font-black mt-1 font-mono tracking-tight">
              Lot #{lot.id}
            </h2>
          </div>
          <span className={`text-white font-black text-xs uppercase px-3.5 py-1.5 rounded-full border backdrop-blur-sm ${
            isOffered
              ? "bg-amber-500/80 border-amber-300"
              : lot.status === "ACCEPTED"
              ? "bg-emerald-600/80 border-emerald-400"
              : "bg-white/20 border-white/20"
          }`}>
            {isOffered ? "OFFER PENDING" : lot.status}
          </span>
        </div>

        <div className="p-7 sm:p-8 space-y-6">
          {/* Photo if available */}
          {lot.photo_reference && (
            <div className="w-full rounded-2xl overflow-hidden border border-[#ECE6DA] max-h-72 bg-[#FAF8F3] flex items-center justify-center">
              <img src={lot.photo_reference} alt="Scrap Lot Inspection" className="object-cover w-full h-72" />
            </div>
          )}

          {/* Details Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#FAF8F3] p-5 rounded-2xl border border-[#ECE6DA] text-xs">
            <div>
              <span className="text-[#A8A29E] font-bold uppercase text-[10px]">Scrap Type</span>
              <p className="font-black text-[#1C1917] text-sm mt-0.5">
                {items.length > 0 ? `Bundled Lot (${items.length} Items)` : lot.material_id}
              </p>
            </div>
            <div>
              <span className="text-[#A8A29E] font-bold uppercase text-[10px]">Collector Weight</span>
              <p className="font-black text-[#1C1917] text-sm mt-0.5">{lot.approx_weight_kg || lot.total_weight_kg || "—"} kg</p>
            </div>
            <div>
              <span className="text-[#A8A29E] font-bold uppercase text-[10px]">Collector Asking Price</span>
              <p className="font-black text-[#FF7337] text-sm font-mono mt-0.5">₹{askingPrice.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-[#A8A29E] font-bold uppercase text-[10px]">Market Fair Range</span>
              <p className="font-bold text-[#174C4A] text-xs font-mono mt-0.5">₹{estimatedMin.toLocaleString()} – ₹{estimatedMax.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-[#A8A29E] font-bold uppercase text-[10px]">Collector ID</span>
              <p className="font-bold text-[#1C1917] mt-0.5 truncate">{lot.collector_id || "Registered Collector"}</p>
            </div>
            <div>
              <span className="text-[#A8A29E] font-bold uppercase text-[10px]">Logged At</span>
              <p className="font-medium text-[#1C1917] mt-0.5">
                {lot.created_at_local ? new Date(lot.created_at_local).toLocaleDateString() : "Today"}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-[#A8A29E] font-bold uppercase text-[10px]">Assigned Recycler</span>
              <p className="font-medium text-[#1C1917] mt-0.5">{lot.accepted_by || "Available on Open Exchange"}</p>
            </div>
          </div>

          {/* Itemized Scrap Composition (No generic mixed scrap labels) */}
          {items.length > 0 ? (
            <div className="bg-[#FAF8F3] border border-[#ECE6DA] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#ECE6DA] pb-2.5">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#FF7337]" />
                  <h4 className="font-black text-sm text-[#1C1917]">
                    Itemized Scrap Breakdown ({items.length} Components)
                  </h4>
                </div>
                <span className="text-[10px] font-bold uppercase bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full">
                  Detailed Lot Contents
                </span>
              </div>

              <div className="divide-y divide-[#ECE6DA]/60">
                {items.map((item: any, idx: number) => {
                  const name = item.material_id || item.material || `Item ${idx + 1}`;
                  const qty = item.weight_or_count || item.weight || item.count || 0;
                  const unit = item.unit || (item.count ? "pcs" : "kg");
                  const rate = item.rate || item.rate_applied;
                  const val = item.value || (rate ? Math.round(rate * qty) : 0);
                  return (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#1C1917] block capitalize">
                          {name.replace(/_/g, " ").toLowerCase()}
                        </span>
                        <span className="text-[11px] text-[#78716C]">
                          Quantity: <strong className="text-stone-800">{qty} {unit}</strong>
                          {rate ? ` @ ₹${rate}/${unit}` : ""}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-xs text-[#1C1917]">
                          {val > 0 ? `₹${val.toLocaleString()}` : "Market Rate"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#ECE6DA] flex justify-between items-center text-xs font-bold">
                <span className="text-[#78716C]">Total Bundled Valuation</span>
                <span className="font-mono font-black text-[#FF7337] text-sm">
                  ₹{askingPrice.toLocaleString()}
                </span>
              </div>
            </div>
          ) : null}

          {/* Extractable Critical Materials & Minerals Analysis (Certified Benchmark) */}
          <div className="bg-[#FAF8F3] border border-[#ECE6DA] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE6DA] pb-3">
              <div className="flex items-center gap-2">
                <Atom className="w-5 h-5 text-[#FF7337]" />
                <div>
                  <h4 className="font-black text-sm text-[#1C1917]">
                    Extractable Critical Minerals & Metallurgical Yield
                  </h4>
                  <p className="text-[11px] text-[#78716C] font-medium">{recovery.headline}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#FF7337]/10 text-[#FF7337] px-2.5 py-1 rounded-full border border-[#FF7337]/20 uppercase">
                Certified Recovery Benchmark
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recovery.minerals.map((m, idx) => (
                <div key={idx} className={`p-3 rounded-xl border flex items-start gap-2.5 ${m.color}`}>
                  <div className="w-8 h-8 rounded-lg bg-white/90 border border-black/10 flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-2xs">
                    {m.symbol}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="font-black text-xs truncate">{m.name}</span>
                      <span className="font-mono font-black text-xs text-[#FF7337]">{m.amountFormatted}</span>
                    </div>
                    <p className="text-[10px] opacity-90 mt-0.5 leading-tight">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2 text-emerald-950">
              <Leaf className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="font-bold text-emerald-900 mr-1">Hazard Mitigated:</strong>
                <span>{recovery.hazardAvoided}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Negotiation Workspace */}
          {(lot.status === "AVAILABLE" || lot.status === "PRICE_OFFERED") && (
            <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 border border-amber-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-[#FF7337]" />
                  <div>
                    <h4 className="font-black text-sm text-[#1C1917]">
                      Price Settlement & Counter-Offer
                    </h4>
                    <p className="text-[11px] text-[#78716C]">
                      Fair market range: <strong className="text-stone-800">₹{estimatedMin.toLocaleString()} – ₹{estimatedMax.toLocaleString()}</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#78716C] font-bold block uppercase">Collector Asking</span>
                  <span className="font-mono font-black text-base text-[#FF7337]">
                    ₹{askingPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {isOffered && (
                <div className="p-3 bg-amber-100/80 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Your Counter-Offer of ₹{offeredPrice?.toLocaleString()} is pending collector response.</strong>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      The collector has been notified and can accept your counter-offer or decline. You can also accept their original asking price directly below.
                    </p>
                  </div>
                </div>
              )}

              {offerSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {offerSuccess}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-[#78716C] uppercase block mb-1">
                      Your Offer Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold text-stone-400">₹</span>
                      <input
                        type="number"
                        value={counterPrice || ""}
                        onChange={(e) => setCounterPrice(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-[#ECE6DA] rounded-xl text-sm font-black font-mono focus:outline-none focus:border-[#FF7337]"
                        placeholder="Enter counter offer"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-[#78716C] uppercase block mb-1">
                      Inspection Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={offerMsg}
                      onChange={(e) => setOfferMsg(e.target.value)}
                      placeholder="e.g. Based on visual grade & moisture"
                      className="w-full px-3 py-2 bg-white border border-[#ECE6DA] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#FF7337]"
                    />
                  </div>
                </div>

                {/* Quick adjustment buttons */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[10px] font-bold text-[#78716C] uppercase">Adjust:</span>
                  <button
                    type="button"
                    onClick={() => setCounterPrice((prev) => Math.max(10, prev - 100))}
                    className="px-2.5 py-1 bg-white border border-[#ECE6DA] rounded-lg font-bold text-stone-700 hover:bg-stone-50"
                  >
                    - ₹100
                  </button>
                  <button
                    type="button"
                    onClick={() => setCounterPrice((prev) => Math.max(10, prev - 50))}
                    className="px-2.5 py-1 bg-white border border-[#ECE6DA] rounded-lg font-bold text-stone-700 hover:bg-stone-50"
                  >
                    - ₹50
                  </button>
                  <button
                    type="button"
                    onClick={() => setCounterPrice(Math.round((estimatedMin + estimatedMax) / 2))}
                    className="px-2.5 py-1 bg-white border border-[#ECE6DA] rounded-lg font-bold text-[#174C4A] hover:bg-stone-50"
                  >
                    Fair Midpoint (₹{Math.round((estimatedMin + estimatedMax) / 2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCounterPrice((prev) => prev + 50)}
                    className="px-2.5 py-1 bg-white border border-[#ECE6DA] rounded-lg font-bold text-stone-700 hover:bg-stone-50"
                  >
                    + ₹50
                  </button>
                  <button
                    type="button"
                    onClick={() => setCounterPrice(askingPrice)}
                    className="px-2.5 py-1 bg-white border border-[#ECE6DA] rounded-lg font-bold text-[#FF7337] hover:bg-stone-50"
                  >
                    Match Asking (₹{askingPrice})
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <Button
                    onClick={handleSendOffer}
                    disabled={submittingOffer || counterPrice <= 0}
                    className="w-full sm:w-auto rounded-full bg-[#174C4A] hover:bg-[#123C3B] text-white font-bold px-6 h-10 text-xs gap-2"
                  >
                    {submittingOffer ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Submit Counter-Offer (₹{counterPrice.toLocaleString()})
                  </Button>

                  <span className="text-[11px] text-[#A8A29E] font-medium">or accept asking price directly</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border border-red-200">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#ECE6DA] flex items-center justify-end gap-3 flex-wrap">
            {lot.status === "AVAILABLE" || lot.status === "PRICE_OFFERED" ? (
              <Button
                onClick={handleAccept}
                disabled={accepting}
                className="rounded-full bg-[#FF7337] hover:bg-[#E55A1F] text-white font-black px-7 h-11 text-xs gap-2 shadow-sm shadow-[#FF7337]/25"
              >
                {accepting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Accept Asking Price (₹{askingPrice.toLocaleString()}) & Book Weighment
              </Button>
            ) : lot.status === "ACCEPTED" ? (
              <Link to={`/recycler/lot/${lot.id}/verify`}>
                <Button className="rounded-full bg-[#174C4A] hover:bg-[#123C3B] text-white font-bold px-7 h-11 text-xs gap-2 shadow-sm">
                  <Scale className="w-4 h-4" />
                  Proceed to Physical Weighment & QR Settlement
                </Button>
              </Link>
            ) : lot.status === "QR_GENERATED" ? (
              <Link to={`/recycler/handover/${lot.id}`}>
                <Button className="rounded-full bg-[#174C4A] hover:bg-[#123C3B] text-white font-black px-7 h-11 text-xs gap-2 shadow-sm shadow-[#174C4A]/30">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  View Settlement QR Code & Reference
                </Button>
              </Link>
            ) : lot.status === "COLLECTOR_CONFIRMED" ? (
              <Link to={`/recycler/handover/${lot.id}`}>
                <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black px-7 h-11 text-xs gap-2 shadow-sm">
                  <CreditCard className="w-4 h-4" />
                  Collector Confirmed: Disburse Payment
                </Button>
              </Link>
            ) : lot.status === "COMPLETED" ? (
              <Link to={`/recycler/handover/${lot.id}`}>
                <Button variant="outline" className="rounded-full border-[#ECE6DA] bg-white text-[#1C1917] font-bold px-7 h-11 text-xs gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  View Completed Receipt
                </Button>
              </Link>
            ) : (
              <span className="text-xs text-[#78716C] font-bold">Status: {lot.status}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

