import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowRight, Search, Filter } from "lucide-react";
import { getAdminTransactions } from "@/services/api";
import type { AdminTransaction } from "@/types";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getAdminTransactions();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = transactions.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.material.toLowerCase().includes(q) ||
      t.collector_id.toLowerCase().includes(q) ||
      t.recycler_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900">Platform Transaction Ledger</h2>
          <p className="text-xs text-stone-500 font-medium">Traceable scrap lot handovers and settlement records across all yards</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by ID, material, actor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-stone-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800 w-56"
            />
          </div>

          <Button onClick={fetchTransactions} variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-stone-500 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-800" />
          Loading ledger records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-stone-200 text-stone-500 text-sm">
          No transactions match search criteria.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Material</th>
                  <th className="py-3.5 px-4">Collector</th>
                  <th className="py-3.5 px-4">Recycler Yard</th>
                  <th className="py-3.5 px-4">Verified Weight</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {t.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-800">
                      {t.material}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium font-mono text-[11px]">
                      {t.collector_id}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium font-mono text-[11px]">
                      {t.recycler_id}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 font-medium">
                      {t.weight_kg} kg
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900 font-mono text-sm">
                      ₹{t.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/admin/transactions/${t.id}`}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs font-bold gap-1 text-amber-800">
                          Audit <ArrowRight className="w-3 h-3" />
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
