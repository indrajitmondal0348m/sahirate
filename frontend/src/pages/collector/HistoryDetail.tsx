import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Weight, IndianRupee, Clock, CheckCircle2, Sparkles, AlertCircle, Layers, Check, X, MapPin, Phone, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { useTranslation } from "@/i18n";
import { calculateCriticalMinerals } from "@/utils/criticalMinerals";
import { useSyncStore } from "@/stores/syncStore";
import { getApiUrl } from "@/config/api";

const RECYCLER_DIRECTORY: Record<string, { name: string; phone: string; location: string; hours: string }> = {
  "REC-MH-004": { name: "EcoRecycle Yard #4 (Nagpur Hub)", phone: "+91 98230 44102", location: "Plot B-14, Hingna MIDC, Nagpur", hours: "08:00 AM - 07:30 PM" },
  "REC-MH-011": { name: "Vidarbha Strategic Metals", phone: "+91 97654 32180", location: "Sector 3, Butibori CETP Complex, Nagpur", hours: "08:30 AM - 08:00 PM" },
  "REC-OR-002": { name: "Utkal Clean Metals & Refining Yard", phone: "+91 94370 89201", location: "Plot 42, Mancheswar Industrial Estate, Bhubaneswar", hours: "09:00 AM - 07:00 PM" },
  "REC-DL-009": { name: "Apex Circular Secondary Smelter", phone: "+91 98110 55432", location: "Phase II, Mayapuri Metal Recycling Zone, New Delhi", hours: "08:00 AM - 09:00 PM" },
  "REC-KA-014": { name: "Deccan Urban Minerals Ltd", phone: "+91 98450 11920", location: "Plot 88, Peenya 2nd Stage, Bengaluru", hours: "09:00 AM - 06:30 PM" },
  "demo-recycler-123": { name: "EcoRecycle Yard #4 (Nagpur Hub)", phone: "+91 98230 44102", location: "Plot B-14, Hingna MIDC, Nagpur", hours: "08:00 AM - 07:30 PM" }
};

export default function HistoryDetail() {
  const { t } = useTranslation();
  const { lotId } = useParams<{ lotId: string }>();
  const navigate = useNavigate();
  const { isOnline } = useSyncStore();

  const lot = useLiveQuery(() => (lotId ? db.lots.get(lotId) : undefined), [lotId]);
  const handover = useLiveQuery(() => (lotId ? db.handovers.where("lot_id").equals(lotId).first() : undefined), [lotId]);
  const payment = useLiveQuery(() => (handover ? db.payments.where("handover_id").equals(handover.id).first() : undefined), [handover]);
  const photo = useLiveQuery(() => (lotId ? db.photos.where("lot_id").equals(lotId).first() : undefined), [lotId]);
  const outboxEvents = useLiveQuery(() => db.outbox.toArray(), []) || [];

  const [liveLot, setLiveLot] = useState<any>(null);
  const [respondingOffer, setRespondingOffer] = useState(false);
  const [offerFeedback, setOfferFeedback] = useState<string | null>(null);

  // Poll or fetch latest live server state when online
  useEffect(() => {
    if (!lotId || !isOnline) return;
    let isMounted = true;
    fetch(getApiUrl(`/lots/${lotId}`))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setLiveLot(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [lotId, isOnline]);

  if (lot === undefined) return <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>;
  if (!lot) return <div className="p-8 text-center font-bold">{t("collector.history_detail.transaction_not_found")}</div>;

  const isPendingSync = lot.sync_status !== "synced" || outboxEvents.some((e: any) =>
    e.sync_status !== "synced" && (e.payload?.lot_id === lot.id || (handover && e.payload?.handover_id === handover.id))
  );

  // Resolve active data between local Dexie and live server
  const activeExtra = liveLot?.extra_data || lot.payload?.extra_data || {};
  const activeItems = activeExtra?.items || lot.payload?.items || [];
  const askingPrice = activeExtra?.asking_price || lot.payload?.asking_price || lot.payload?.estimated_value || 0;
  const offeredPrice = activeExtra?.offered_price;
  const isOfferPending = activeExtra?.offer_status === "PENDING_COLLECTOR" && offeredPrice;
  const isOfferAccepted = activeExtra?.offer_status === "ACCEPTED";

  const displayWeight = handover?.verified_weight_kg || lot.payload.approx_weight_kg || "—";
  const displayAmount = payment?.amount || handover?.final_amount || (isOfferAccepted ? offeredPrice : askingPrice) || "—";

  const handleRespondOffer = async (action: "ACCEPT" | "REJECT") => {
    if (!lotId) return;
    setRespondingOffer(true);
    setOfferFeedback(null);
    try {
      const res = await fetch(getApiUrl(`/lots/${lotId}/respond-offer`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          collector_id: lot.payload?.collector_id,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setLiveLot(updated);

        // Update local Dexie lot
        await db.lots.update(lot.id, {
          status: action === "ACCEPT" ? "accepted" : "available",
          payload: {
            ...lot.payload,
            estimated_value: action === "ACCEPT" ? offeredPrice : askingPrice,
            extra_data: updated.extra_data,
          },
        });

        setOfferFeedback(
          action === "ACCEPT"
            ? `Offer of ₹${Number(offeredPrice).toLocaleString()} accepted! You can now proceed to yard handover.`
            : "Counter-offer declined. Lot remains open."
        );
      }
    } catch (err: any) {
      setOfferFeedback("Failed to submit response. Please check your network.");
    } finally {
      setRespondingOffer(false);
    }
  };

  const weightVal = typeof displayWeight === "number" ? displayWeight : parseFloat(String(displayWeight)) || 1;
  const mineralData = calculateCriticalMinerals(lot.payload.material_id || "", weightVal, activeItems);

  return (
    <div className="flex flex-col min-h-screen p-4 pb-24 space-y-6 animate-in fade-in slide-in-from-right-4">
      <header className="flex items-center py-4">
        <button
          onClick={() => navigate("/collector/history")}
          className="mr-4 text-muted-foreground hover:text-foreground"
          aria-label={t("common.go_back_history")}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">{t("collector.history_detail.title")}</h1>
          <span className="text-xs font-mono font-bold text-primary">#{lot.id}</span>
        </div>
      </header>

      {isPendingSync && (
        <div className="bg-amber-100 text-amber-800 border-amber-200 border p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold">
          <Clock className="w-4 h-4" />
          Offline — awaiting sync
        </div>
      )}

      {/* Recycler Counter-Offer Notification & Decision Banner */}
      {isOfferPending && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-black uppercase text-amber-950 tracking-wider">
                Recycler Counter-Offer Received
              </span>
            </div>
            <span className="text-2xl font-black text-amber-700 font-mono">
              ₹{Number(offeredPrice).toLocaleString()}
            </span>
          </div>

          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            An authorized recycler reviewed your scrap photos and offered{" "}
            <strong>₹{Number(offeredPrice).toLocaleString()}</strong> for this lot.
            <br />
            <span className="text-amber-800/80">
              (Your Asking Price: ₹{Number(askingPrice).toLocaleString()})
            </span>
          </p>

          {offerFeedback && (
            <div className="p-2.5 bg-white/80 rounded-xl border border-amber-300 text-xs font-bold text-amber-950">
              {offerFeedback}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              onClick={() => handleRespondOffer("ACCEPT")}
              disabled={respondingOffer}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 rounded-xl shadow-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Accept Offer (₹{Number(offeredPrice).toLocaleString()})</span>
            </Button>
            <Button
              onClick={() => handleRespondOffer("REJECT")}
              disabled={respondingOffer}
              variant="outline"
              className="flex-1 bg-white border-amber-300 text-amber-950 hover:bg-amber-100 font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4 text-amber-700" />
              <span>Decline</span>
            </Button>
          </div>
        </div>
      )}

      {isOfferAccepted && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-emerald-950">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-black block uppercase text-[10px] text-emerald-800">Deal Agreed</span>
            <span>Recycler offer of <strong>₹{Number(offeredPrice).toLocaleString()}</strong> was accepted.</span>
          </div>
        </div>
      )}

      {/* Primary Details */}
      <Card className="shadow-sm">
        <CardContent className="p-0 overflow-hidden">
          {photo?.data_uri ? (
            <div className="w-full h-48 bg-muted">
              <img src={photo.data_uri} alt="Collection" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-12 bg-primary/5"></div>
          )}
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                  Scrap Lot Identifier
                </span>
                <h2 className="text-2xl font-black font-mono tracking-tight text-charcoal">
                  #{lot.id}
                </h2>
                {handover?.recycler_id && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("collector.history_detail.recycler_id")}: {handover.recycler_id}
                  </p>
                )}
              </div>
            </div>

            {/* Itemized Materials Breakdown */}
            {activeItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-muted">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-copper" /> Itemized Scrap Breakdown ({activeItems.length})
                </span>
                <div className="divide-y divide-warm-borders/60 bg-[#FAF8F3] rounded-xl border border-[#DDD8CC] p-3">
                  {activeItems.map((it: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-2 text-xs">
                      <div>
                        <span className="font-extrabold text-charcoal block">
                          {it.label || t(`material.${it.material_id || it.material}` as any) || it.material_id || it.material}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {it.weight_or_count || it.weight} {it.unitLabel || it.unit || "kg"}
                        </span>
                      </div>
                      <div className="font-mono text-right font-black text-primary">
                        {it.estimated_value ? `₹${Number(it.estimated_value).toLocaleString()}` : "Included"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-muted">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Weight className="w-4 h-4" /> {t("common.weight")}
                </span>
                <p className="text-xl font-bold">{displayWeight} kg</p>
              </div>

              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" /> Asking / Agreed
                </span>
                <p className="text-xl font-bold">
                  {activeItems.length > 1 ? "Itemized" : `₹${askingPrice}`}
                </p>
              </div>

              <div className="col-span-2 space-y-1 pt-2">
                <span className="text-sm text-muted-foreground">
                  {isOfferAccepted ? "Agreed Handover Value" : t("collector.history_detail.final_amount")}
                </span>
                <p className="text-3xl font-black text-primary">
                  ₹{Number(displayAmount).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Mineral Salvage Section */}
            <div className="mt-4 p-4 rounded-xl bg-[#FAF8F3] border border-[#DDD8CC]">
              <div className="flex items-center justify-between pb-2 border-b border-[#DDD8CC]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-charcoal">
                    Critical Mineral & Metal Recovery
                  </h4>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300">
                  Certified Recovery
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                {mineralData.minerals.map((m, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-[#DDD8CC] text-center shadow-xs">
                    <span className="text-xs font-black block text-primary">{m.symbol}</span>
                    <span className="text-sm font-black text-charcoal block">{m.amountFormatted}</span>
                    <span className="text-[10px] text-muted-foreground truncate block">{m.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-emerald-900 font-medium mt-2.5">
                ✓ {mineralData.hazardAvoided}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle Timeline */}
      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-6">
          <h3 className="font-semibold text-lg">{t("collector.history_detail.timeline")}</h3>

          <div className="relative border-l-2 border-muted ml-3 space-y-6">
            {/* 1. Created */}
            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 bg-primary text-primary-foreground rounded-full p-0.5">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <p className="font-medium">{t("collector.history_detail.lot_created")}</p>
              <p className="text-xs text-muted-foreground">{new Date(lot.created_at_local).toLocaleString()}</p>
            </div>

            {/* 2. Accepted / Offered */}
            {(lot.status === "accepted" || isOfferAccepted) && (
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <p className="font-medium">{t("collector.history_detail.accepted_by_recycler")}</p>
                {lot.accepted_at && (
                  <p className="text-xs text-muted-foreground">{new Date(lot.accepted_at).toLocaleString()}</p>
                )}
              </div>
            )}

            {/* 3. Verified / QR Generated */}
            {handover && (
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <p className="font-medium">{t("collector.history_detail.weight_verified")}</p>
                <p className="text-xs text-muted-foreground">{new Date(handover.created_at_local).toLocaleString()}</p>
              </div>
            )}

            {/* 4. Collector Confirmed */}
            {handover?.collector_confirmed_at && (
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <p className="font-medium">{t("collector.history_detail.collector_confirmed")}</p>
                <p className="text-xs text-muted-foreground">{new Date(handover.collector_confirmed_at).toLocaleString()}</p>
              </div>
            )}

            {/* 5. Completed */}
            {handover?.status === "COMPLETED" && handover.completed_at && (
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <p className="font-medium">{t("collector.history_detail.handover_completed")}</p>
                <p className="text-xs text-muted-foreground">{new Date(handover.completed_at).toLocaleString()}</p>
              </div>
            )}

            {/* 6. Payment */}
            {payment && payment.paid_at && (
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 bg-green-500 text-white rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <p className="font-medium text-green-700">{t("status.paid")}</p>
                <p className="text-xs text-muted-foreground">{new Date(payment.paid_at).toLocaleString()} via {payment.payment_mode}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recycler Contact & Settlement Action Card */}
      {(lot.status === "accepted" || liveLot?.status === "ACCEPTED" || liveLot?.status === "QR_GENERATED" || liveLot?.status === "COLLECTOR_CONFIRMED" || isOfferAccepted) && (() => {
        const assignedRecyclerId = lot.accepted_by || liveLot?.accepted_by || "demo-recycler-123";
        const recyclerInfo = RECYCLER_DIRECTORY[assignedRecyclerId] || RECYCLER_DIRECTORY["demo-recycler-123"];
        return (
          <Card className="border-2 border-[#174C4A]/30 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 shadow-md rounded-2xl overflow-hidden animate-in fade-in">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    Assigned Authorized Recycler
                  </span>
                  <h3 className="font-black text-base text-charcoal mt-1">
                    {recyclerInfo.name}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{recyclerInfo.location}</span>
                  </p>
                </div>

                <a href={`tel:${recyclerInfo.phone}`} className="shrink-0">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl gap-1.5 h-9 px-3.5 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Recycler</span>
                  </Button>
                </a>
              </div>

              {/* Recycler Contact Number Display */}
              <div className="p-3 bg-white border border-[#DDD8CC] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Recycler Contact Number</span>
                  <span className="font-mono font-black text-sm text-[#1C1917]">{recyclerInfo.phone}</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {recyclerInfo.hours}
                </span>
              </div>

              {/* Payment Settlement QR Scan Button */}
              <div className="pt-2 border-t border-emerald-200/60 space-y-2">
                <Button
                  onClick={() => navigate(`/collector/scan`, { state: { lotId: lot.id } })}
                  className="w-full h-12 bg-[#174C4A] hover:bg-[#123C3B] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md gap-2"
                >
                  <QrCode className="w-4 h-4 text-emerald-300" />
                  <span>Scan Recycler QR to Confirm Payment</span>
                </Button>
                <p className="text-[11px] text-stone-500 text-center font-medium">
                  Scan the settlement QR displayed on the recycler's weighbridge screen to verify weight and lock instant payment.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {handover?.qr_reference && (
        <div className="text-center pb-4">
          <Badge variant="outline" className="text-xs font-mono text-muted-foreground">
            Ref: {handover.qr_reference}
          </Badge>
        </div>
      )}
    </div>
  );
}
