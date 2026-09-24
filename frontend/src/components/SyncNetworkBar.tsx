import { useState } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { useSyncStore } from "@/stores/syncStore";
import { syncAll } from "@/services/syncManager";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { Button } from "@/components/ui/button";

export default function SyncNetworkBar() {
  const { isOnline, isSyncing, setOnline } = useSyncStore();
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const outboxEvents = useLiveQuery(() => db.outbox.toArray(), []) || [];
  const pendingCount = outboxEvents.filter(
    (e) => e.sync_status === "pending" || e.sync_status === "failed"
  ).length;

  const toggleNetworkSync = async () => {
    if (isOnline) {
      // Turn OFF Sync / Internet (Simulate Offline)
      setOnline(false);
      setSyncToast("Offline Mode Active: All lots will save to local DB");
      setTimeout(() => setSyncToast(null), 3500);
    } else {
      // Turn ON Sync / Internet (Internet Restored)
      setOnline(true);
      setSyncToast("Internet Reconnected: Syncing local DB to FastAPI backend...");
      try {
        await syncAll();
        setSyncToast("✓ All lots synchronized with FastAPI database!");
        setTimeout(() => setSyncToast(null), 4000);
      } catch (err) {
        setSyncToast("Sync completed with remaining pending queue.");
        setTimeout(() => setSyncToast(null), 3000);
      }
    }
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      setSyncToast("Please enable Internet / Sync first.");
      setTimeout(() => setSyncToast(null), 2500);
      return;
    }
    setSyncToast("Syncing with FastAPI backend...");
    try {
      await syncAll();
      setSyncToast("✓ Local DB in sync with backend!");
    } catch {
      setSyncToast("Sync completed with partial network results.");
    }
    setTimeout(() => setSyncToast(null), 3000);
  };

  return (
    <div className="w-full">
      {/* Toast alert if triggered */}
      {syncToast && (
        <div className="bg-charcoal text-white text-xs px-3.5 py-2 rounded-xl mb-2 flex items-center justify-between shadow-md animate-in slide-in-from-top-1">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {syncToast}
          </span>
          <button onClick={() => setSyncToast(null)} className="text-white/60 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Sync Control Banner */}
      <div
        className={`px-3 py-2 rounded-2xl border transition-all flex items-center justify-between gap-2 shadow-2xs ${
          isOnline
            ? "bg-emerald-50/80 border-emerald-200/90 text-emerald-950"
            : "bg-amber-50/90 border-amber-300 text-amber-950"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <div className="text-[11px] leading-tight">
            <span className="font-extrabold block">
              {isOnline ? "Sync: ONLINE (FastAPI Connected)" : "Sync: OFF (Offline Mode)"}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {pendingCount > 0 ? `${pendingCount} lot(s) in local DB` : "Local DB clean & ready"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isOnline && (
            <Button
              size="sm"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="h-7 px-2 text-[10px] font-black bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg"
            >
              <RefreshCw className={`w-2.5 h-2.5 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
              Sync Now
            </Button>
          )}

          <Button
            size="sm"
            onClick={toggleNetworkSync}
            className={`h-7 px-2.5 text-[10px] font-black rounded-lg transition-all ${
              isOnline
                ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            }`}
          >
            {isOnline ? (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Turn Sync OFF
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Turn Sync ON
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
