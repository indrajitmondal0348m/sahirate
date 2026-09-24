import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { getAdminAlerts } from "@/services/api";
import type { AdminAlert } from "@/types";

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getAdminAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-stone-900">Platform Fraud & Discrepancy Alerts</h2>
          <p className="text-xs text-stone-500 font-medium">Automated triggers on weight mismatches, abnormal rate spikes, and stalled handovers</p>
        </div>

        <Button onClick={fetchAlerts} variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-stone-500 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-800" />
          Loading alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-stone-200 text-stone-500 text-sm">
          No platform alerts at this time. All lot handovers within normal parameters.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className="bg-white border-stone-200 rounded-xl shadow-sm overflow-hidden">
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${
                  alert.severity === "HIGH"
                    ? "bg-red-100 text-red-700"
                    : alert.severity === "MEDIUM"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  <ShieldAlert className="w-6 h-6" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        alert.severity === "HIGH"
                          ? "bg-red-200 text-red-900"
                          : alert.severity === "MEDIUM"
                          ? "bg-amber-200 text-amber-900"
                          : "bg-blue-200 text-blue-900"
                      }`}>
                        {alert.severity} Severity
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">ID: {alert.id}</span>
                    </div>

                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      alert.status === "OPEN" ? "bg-red-50 text-red-700 border border-red-200" : "bg-stone-100 text-stone-600"
                    }`}>
                      {alert.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-stone-900 text-base">{alert.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{alert.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
