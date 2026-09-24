import LanguageSelector from "./LanguageSelector";
import AudioToggle from "./AudioToggle";
import { useSyncStore } from "@/stores/syncStore";
import { Check, CloudOff, RefreshCw, AlertTriangle } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { Link } from "react-router-dom";

export default function CollectorHeader() {
  const { isOnline, isSyncing } = useSyncStore();

  const pendingCount = useLiveQuery(
    () => db.outbox.where('sync_status').anyOf('pending', 'failed', 'syncing').count(),
    []
  ) || 0;

  return (
    <header className="flex justify-between items-center px-4 h-15 backdrop-blur-xl bg-[#FAF9F5]/90 shrink-0 sticky top-0 z-30 border-b border-stone-200/60 shadow-sm shadow-black/[0.02]">
      
      {/* LOGO */}
      <Link to="/collector" className="flex items-center gap-1">
        <span className="font-black text-2xl tracking-tight leading-none" style={{ color: "#174C4A" }}>Sahi</span>
        <span className="font-black text-2xl tracking-tight leading-none" style={{ color: "#C56A3D" }}>Rate</span>
        <span className="ml-1 text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">TWA</span>
      </Link>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* SYNC STATUS PILL */}
        <div className="text-[9px] font-bold uppercase tracking-widest flex items-center">
          {isSyncing ? (
            <span className="text-primary flex items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-1 rounded-full">
              <RefreshCw className="w-3 h-3 animate-spin" /> SYNCING
            </span>
          ) : !isOnline ? (
            <span className="text-stone-500 flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-full border border-stone-200">
              <CloudOff className="w-3 h-3" /> OFFLINE
            </span>
          ) : pendingCount > 0 ? (
            <span className="text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> {pendingCount} PENDING
            </span>
          ) : (
            <span className="text-emerald-700 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
              <Check className="w-3 h-3" /> SYNCED
            </span>
          )}
        </div>
        
        <AudioToggle />
        <LanguageSelector />
      </div>
    </header>
  );
}
