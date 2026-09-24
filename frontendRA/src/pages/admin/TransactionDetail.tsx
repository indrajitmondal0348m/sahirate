import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, CheckCircle2, ShieldCheck } from "lucide-react";
import { getAdminTransactionById } from "@/services/api";

export default function AdminTransactionDetail() {
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
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-800" />
        Loading transaction audit record...
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-red-200 text-red-600 text-sm max-w-lg mx-auto">
        Transaction audit record not found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/admin/transactions"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Transactions
      </Link>

      <Card className="bg-white border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-amber-900 p-6 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200">
              Audit Record & Chain-of-Custody
            </span>
            <h2 className="text-xl font-black mt-1 font-mono">TX #{tx.id.slice(0, 8).toUpperCase()}</h2>
          </div>
          <span className="bg-white/20 text-white font-bold text-xs uppercase px-3 py-1 rounded-full">
            {tx.status}
          </span>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <span className="text-stone-400 font-bold uppercase text-[10px]">Scrap Material</span>
              <p className="font-extrabold text-stone-900 text-base">{tx.material}</p>
            </div>
            <div>
              <span className="text-stone-400 font-bold uppercase text-[10px]">Collector ID</span>
              <p className="font-bold text-stone-900 font-mono">{tx.collector_id}</p>
            </div>
            <div>
              <span className="text-stone-400 font-bold uppercase text-[10px]">Recycler Yard</span>
              <p className="font-bold text-stone-900 font-mono">{tx.recycler_id}</p>
            </div>
            <div>
              <span className="text-stone-400 font-bold uppercase text-[10px]">QR Reference</span>
              <p className="font-bold text-stone-900 font-mono">{tx.qr_reference}</p>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-stone-200 text-xs">
            <h4 className="font-black text-stone-900 uppercase tracking-wider text-xs">Weighing Reconciliation</h4>
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="text-stone-600">Collector Declared Weight</span>
              <span className="font-bold text-stone-900">{tx.approx_weight} kg</span>
            </div>
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="text-stone-600">Yard Physical Scale Weight</span>
              <span className="font-extrabold text-stone-900">{tx.verified_weight} kg</span>
            </div>
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="text-stone-600">Settled Unit Rate</span>
              <span className="font-mono font-bold text-stone-900">₹{tx.rate_per_kg}/kg</span>
            </div>
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="text-stone-600">Payment Status</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase text-[10px]">
                {tx.payment?.status || "PAID"} ({tx.payment?.mode || "UPI"})
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-sm font-black">
            <span>Disbursed Amount</span>
            <span className="text-2xl font-mono text-emerald-800">
              ₹{tx.total_amount?.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
