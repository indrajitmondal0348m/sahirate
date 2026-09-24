import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, RefreshCw, CreditCard, Sparkles, ShieldCheck, Copy } from "lucide-react";
import { getHandover, completeHandover, recordPayment } from "@/services/api";
import type { Handover } from "@/types";

export default function HandoverDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [handover, setHandover] = useState<Handover | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "BANK">("UPI");
  const [paymentDone, setPaymentDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHandover = async () => {
    if (!id) return;
    try {
      const data = await getHandover(id);
      setHandover(data);
      if (data.status === "COMPLETED") {
        setPaymentDone(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch handover session");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandover();
    const interval = setInterval(() => {
      if (handover?.status !== "COMPLETED") {
        fetchHandover();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [id, handover?.status]);

  const handleCompleteAndPay = async () => {
    if (!handover) return;
    setCompleting(true);
    setError(null);
    try {
      let updatedH = handover;
      if (handover.status !== "COMPLETED") {
        updatedH = await completeHandover(handover.id);
        setHandover(updatedH);
      }

      await recordPayment({
        handover_id: handover.id,
        amount: handover.final_amount,
        payment_mode: paymentMode,
      });

      setPaymentDone(true);
      setTimeout(() => {
        navigate(`/recycler/transactions`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to complete transaction");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[#A8A29E] font-medium text-sm">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF7337]" />
        Loading handover session...
      </div>
    );
  }

  if (error || !handover) {
    return (
      <div className="bg-white border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto shadow-sm">
        <p className="font-bold text-red-600 text-sm">{error || "Handover not found"}</p>
        <Link to="/recycler/lots" className="mt-4 inline-block text-xs font-bold text-[#FF7337] underline">
          Back to Lots Feed
        </Link>
      </div>
    );
  }

  const qrPayload = JSON.stringify({
    type: "SAHIRATE_HANDOVER",
    handover_id: handover.id,
    lot_id: handover.lot_id,
    amount: handover.final_amount,
    weight_kg: handover.verified_weight_kg,
    status: handover.status,
    qr_ref: handover.qr_reference,
  });

  const refCode = handover.qr_reference || handover.id.slice(0, 8).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/recycler/lots"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#78716C] hover:text-[#1C1917] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Available Lots
        </Link>
        {handover.lot_id && (
          <Link
            to={`/recycler/lots/${handover.lot_id}`}
            className="text-xs font-bold text-[#FF7337] hover:underline"
          >
            View Scrap Dossier #{handover.lot_id.slice(0, 8)}
          </Link>
        )}
      </div>

      <div className="bg-white border border-[#EFE8DC] rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#174C4A] to-[#123C3B] p-7 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
              Traceable Handover Protocol
            </span>
            <h2 className="text-2xl font-black mt-1 font-mono">
              Handover #{handover.id.slice(0, 8).toUpperCase()}
            </h2>
          </div>
          <span
            className={`font-black text-xs uppercase px-3.5 py-1.5 rounded-full ${
              paymentDone || handover.status === "COMPLETED"
                ? "bg-emerald-500 text-white"
                : "bg-amber-400 text-[#1C1917]"
            }`}
          >
            {paymentDone ? "COMPLETED" : handover.status}
          </span>
        </div>

        <div className="p-7 sm:p-8 space-y-8">
          {/* QR Code Presentation */}
          <div className="flex flex-col items-center justify-center p-6 bg-[#FAF8F3] border border-[#ECE6DA] rounded-3xl space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-[#ECE6DA] shadow-md">
              <QRCodeSVG value={qrPayload} size={210} level="M" />
            </div>

            <div className="text-center space-y-2 w-full max-w-sm">
              <span className="text-xs font-bold text-[#1C1917] block">
                Show this QR Code to Collector App
              </span>
              <p className="text-[11px] text-[#78716C]">
                Collector scans this QR to confirm verified weight of {handover.verified_weight_kg} kg & ₹{handover.final_amount.toLocaleString()} payout
              </p>

              {/* Settlement Reference Code Box (For manual confirmation) */}
              <div className="mt-3 p-3.5 bg-white border border-[#DDD8CC] rounded-2xl shadow-xs flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-black text-[#A8A29E] uppercase tracking-wider block">
                    Settlement Reference Code
                  </span>
                  <span className="font-mono font-black text-lg text-[#174C4A] tracking-wider select-all">
                    {refCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(refCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-stone-600" />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              <p className="text-[10px] text-[#A8A29E] pt-1">
                If the collector's camera is unavailable, they can type this Reference Code directly in their app.
              </p>
            </div>
          </div>

          {/* Handover Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#FAF8F3] p-5 rounded-2xl border border-[#ECE6DA] text-xs">
            <div>
              <span className="text-[#A8A29E] font-bold uppercase text-[10px]">Verified Weight</span>
              <p className="font-black text-[#1C1917] text-base mt-0.5">{handover.verified_weight_kg} kg</p>
            </div>
            <div>
              <span className="text-[#A8A29E] font-bold uppercase text-[10px]">Settled Rate</span>
              <p className="font-black text-[#1C1917] text-base mt-0.5">₹{handover.final_rate}/kg</p>
            </div>
            <div>
              <span className="text-[#A8A29E] font-bold uppercase text-[10px]">Disbursement Amount</span>
              <p className="font-black text-[#FF7337] text-xl font-mono mt-0.5">₹{handover.final_amount.toLocaleString()}</p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA]">
            {handover.status === "COLLECTOR_CONFIRMED" || paymentDone ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <Clock className="w-6 h-6 text-amber-500 animate-spin shrink-0" />
            )}
            <div className="text-xs">
              <span className="font-bold text-[#1C1917] block">
                {paymentDone
                  ? "Handover Completed & Paid"
                  : handover.status === "COLLECTOR_CONFIRMED"
                  ? "Collector Confirmed via App Scan"
                  : "Awaiting Collector QR Scan Confirmation..."}
              </span>
              <span className="text-[#78716C] text-[11px]">
                {paymentDone
                  ? "Audit record securely stored in state registry."
                  : "Handover status updates automatically in real-time."}
              </span>
            </div>
          </div>

          {/* Payment Disbursement Form */}
          {!paymentDone && (
            <div className="space-y-4 pt-4 border-t border-[#ECE6DA]">
              <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider">
                Select Disbursement Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["UPI", "CASH", "BANK"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                      paymentMode === mode
                        ? "bg-[#174C4A] text-white border-[#174C4A] shadow-sm"
                        : "bg-white text-[#78716C] border-[#ECE6DA] hover:border-[#174C4A]"
                    }`}
                  >
                    {mode === "UPI" ? "⚡ Instant UPI" : mode === "CASH" ? "💵 Cash Handover" : "🏦 Bank NEFT"}
                  </button>
                ))}
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border border-red-200">
                  {error}
                </div>
              )}

              <Button
                onClick={handleCompleteAndPay}
                disabled={completing}
                className="w-full rounded-full bg-[#174C4A] hover:bg-[#123C3B] text-white font-black h-12 text-sm gap-2 shadow-md"
              >
                {completing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                Confirm Payment & Complete Handover (₹{handover.final_amount.toLocaleString()})
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
