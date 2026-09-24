import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Receipt, ArrowRight, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminTransactions, CURRENT_RECYCLER_ID } from "@/services/api";
import type { AdminTransaction } from "@/types";

export default function RecyclerTransactions() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getAdminTransactions();
      setTransactions(data.filter((t) => t.recycler_id === CURRENT_RECYCLER_ID || t.status === "COMPLETED"));
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalDisbursed = transactions.reduce((sum, t) => sum + (t.amount || t.final_amount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#A8A29E]">
            AUDIT SETTLEMENT LEDGER
          </div>
          <h1 className="text-3xl font-black text-[#1C1917] tracking-tight">Yard Settlements & Transactions</h1>
          <p className="text-xs text-[#78716C] font-medium mt-0.5">
            History of completed handovers, weighbridge logs, and collector disbursements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#ECE6DA] text-xs font-bold text-[#1C1917] shadow-sm">
            <span>Total Settled:</span>
            <span className="font-mono text-[#FF7337]">₹{totalDisbursed.toLocaleString()}</span>
          </div>

          <Button
            onClick={fetchTransactions}
            variant="outline"
            size="sm"
            className="rounded-2xl bg-white hover:bg-[#FAF8F3] text-[#1C1917] border-[#ECE6DA] shadow-sm h-10 px-4 gap-1.5 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FF7337]" : "text-[#78716C]"}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-[#A8A29E] font-medium text-sm">
          Loading settlements from audit ledger...
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white border border-[#EFE8DC] rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FF7337]/10 text-[#FF7337] flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-[#1C1917]">No completed transactions yet</h3>
          <p className="text-xs text-[#78716C] mt-1">
            Completed handovers and payment disbursements will be immutably cataloged here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#EFE8DC] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F3] border-b border-[#ECE6DA] text-[#A8A29E] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Transaction ID</th>
                  <th className="py-4 px-6">Material</th>
                  <th className="py-4 px-6">Yard Weight</th>
                  <th className="py-4 px-6">Settled Rate</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Mode</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2EB]">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#1C1917]">
                      #{t.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-4 px-6 font-bold text-[#1C1917]">
                      {t.material}
                    </td>
                    <td className="py-4 px-6 text-[#78716C] font-semibold">
                      {t.weight_kg} kg
                    </td>
                    <td className="py-4 px-6 text-[#78716C] font-mono">
                      ₹{t.rate_per_kg}/kg
                    </td>
                    <td className="py-4 px-6 font-mono font-black text-[#174C4A] text-sm">
                      ₹{(t.amount || t.final_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF8F3] border border-[#ECE6DA] text-[#78716C]">
                        {t.payment_mode || "UPI"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link to={`/recycler/transactions/${t.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-bold text-[#FF7337] hover:bg-[#FF7337]/10 rounded-full px-3"
                        >
                          View Receipt →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
