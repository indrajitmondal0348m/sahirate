import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText } from "lucide-react";
import { getAuditLogs } from "@/services/api";
import type { AuditLog } from "@/types";

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-stone-900">Immutable Audit Trail</h2>
          <p className="text-xs text-stone-500 font-medium">Tamper-evident logs of all lot creations, handovers, verifications, and payments</p>
        </div>

        <Button onClick={fetchLogs} variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-stone-500 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-800" />
          Loading audit trail...
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-stone-200 text-stone-500 text-sm">
          No audit records logged yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Entity ID</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                        {l.event_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 font-bold">
                      {l.actor_role || "SYSTEM"} {l.actor_id ? `(${l.actor_id.slice(0, 8)})` : ""}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500">
                      {l.entity_id ? l.entity_id.slice(0, 10) : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-stone-600 max-w-xs truncate">
                      {l.details ? JSON.stringify(l.details) : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right text-stone-400 font-mono text-[11px]">
                      {l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : "Now"}
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
