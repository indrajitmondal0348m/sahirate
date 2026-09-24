import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, CheckCircle2, Printer } from "lucide-react";
import { getAdminTransactionById } from "@/services/api";

export default function RecyclerTransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const [tx, setTx] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const data = await getAdminTransactionById(id!);
        setTx(data);
      } catch (err) {
        console.error("Failed to load transaction:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-stone-500 text-sm">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#174C4A]" />
        Loading transaction receipt...
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-red-200 text-red-600 text-sm max-w-lg mx-auto">
        Transaction receipt not found.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Link
        to="/recycler/transactions"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Transactions
      </Link>

      {/* Printable Receipt Card */}
      <div className="bg-[#FAF8F3] border-2 border-dashed border-stone-300 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="text-center pb-3 border-b border-dashed border-stone-300">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight">Payment Receipt</h2>
          <p className="text-[10px] text-stone-500 font-mono mt-0.5">TX: {tx.id.toUpperCase()}</p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-stone-500">Material</span>
            <span className="font-extrabold text-stone-900">{tx.material}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Verified Yard Weight</span>
            <span className="font-extrabold text-stone-900">{tx.verified_weight} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Agreed Settlement Rate</span>
            <span className="font-bold text-stone-900 font-mono">₹{tx.rate_per_kg}/kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">QR Verification Code</span>
            <span className="font-mono font-bold text-stone-900">{tx.qr_reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Disbursed Via</span>
            <span className="font-bold text-stone-900">{tx.payment?.mode || "UPI"}</span>
          </div>
        </div>

        <div className="pt-4 border-t-2 border-stone-900 flex justify-between items-center">
          <span className="text-xs font-black uppercase tracking-wider text-stone-900">Total Payout</span>
          <span className="text-2xl font-black font-mono text-[#174C4A]">
            ₹{tx.total_amount?.toLocaleString()}
          </span>
        </div>

        <div className="text-center text-[10px] text-stone-400 font-medium">
          Authorized recycling chain traceability • SahiRate SIH26229
        </div>
      </div>
    </div>
  );
}
