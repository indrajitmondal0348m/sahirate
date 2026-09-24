import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, FileText, ShieldAlert, ArrowRight, Sparkles, TrendingUp, MapPin, User } from "lucide-react";
import { useCreateLotStore } from "@/stores/createLotStore";
import { db } from "@/db/dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { useTranslation } from "@/i18n";
import { useCollectorAuthStore } from "@/stores/authStore";
import SyncNetworkBar from "@/components/SyncNetworkBar";
import { pullRemoteData } from "@/services/syncManager";

export default function CollectorHome() {
  const { t } = useTranslation();
  const { user } = useCollectorAuthStore();

  useEffect(() => {
    // Automatically pull all latest cloud lots and handovers into Dexie IndexedDB
    // so mobile phones and desktop browsers stay continuously in sync
    pullRemoteData();
  }, []);

  const lots = useLiveQuery(() => db.lots.orderBy("created_at_local").reverse().toArray(), []) || [];
  
  // Calculate today's summary safely
  const today = new Date().toDateString();
  const todayLots = lots.filter(l => {
    try {
      const d = new Date(l.created_at_local);
      return !isNaN(d.getTime()) && d.toDateString() === today;
    } catch {
      return false;
    }
  });

  const todayWeight = todayLots.reduce((sum, l) => sum + (l.payload.approx_weight_kg || 0), 0);
  const todayValue = todayLots.reduce((sum, l) => sum + (l.payload.estimated_value || 0), 0);

  const recentLots = lots.slice(0, 3); // Show top recent lots

  return (
    <div className="flex flex-col min-h-screen p-4 pb-20 space-y-5 animate-in fade-in">
      
      {/* Network & Sync Control Bar (Offline / Online Switch to FastAPI) */}
      <SyncNetworkBar />

      {/* Welcome & Collector Profile Header */}
      <div className="pt-1 flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3" /> Field Collection Terminal
          </div>
          <h1 className="text-2xl font-black text-charcoal tracking-tight">
            {user?.full_name ? user.full_name : (t("common.good_morning") || "Good morning,")}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{user?.location ? user.location : "Ward 14, Nagpur"}</span>
          </p>
        </div>

        <Link
          to="/collector/login"
          className="text-[11px] font-bold text-muted-foreground hover:text-charcoal bg-white border border-[#DDD8CC] px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1 mt-1 shrink-0"
        >
          <User className="w-3 h-3 text-primary" />
          {user ? "Account" : "Login"}
        </Link>
      </div>

      {/* NEW SCRAP COLLECTION - Dominant CTA */}
      <section>
        <Link
          to="/collector/create-lot"
          className="block w-full active:scale-[0.98] transition-transform"
          onClick={async () => {
            const draft_id = useCreateLotStore.getState().draft_id;
            if (draft_id) {
              const existingLot = await db.lots.get(draft_id);
              if (!existingLot) {
                await db.photos.where("lot_id").equals(draft_id).delete();
              }
            }
            useCreateLotStore.getState().reset();
          }}
        >
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-primary to-[#0f3836] text-white shadow-xl shadow-primary/20 flex items-center justify-between group">
            {/* Soft background glow */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />

            <div className="space-y-1 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                Offline AI Scanning
              </span>
              <h2 className="text-xl font-black tracking-tight">
                {t("collector.home.new_collection") || "New Collection"}
              </h2>
              <p className="text-xs text-white/80 font-medium">Capture photo, identify scrap, get fair price</p>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Camera className="w-7 h-7 text-white" />
            </div>
          </div>
        </Link>
      </section>

      {/* TODAY'S SUMMARY - Glass Card */}
      <section className="space-y-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
          {t("collector.home.today_summary") || "TODAY'S COLLECTION"}
        </p>
        <div className="backdrop-blur-md bg-white/85 border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Volume Today</span>
              <p className="text-2xl font-black text-charcoal tabular-nums font-mono mt-0.5">
                {todayWeight.toFixed(1)} <span className="text-sm font-semibold text-muted-foreground">kg</span>
              </p>
              <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                {todayLots.length} {todayLots.length === 1 ? 'collection' : 'collections'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estimated Payout</span>
              <p className="text-2xl font-black text-primary tabular-nums font-mono mt-0.5">
                ₹{todayValue.toLocaleString()}
              </p>
              <p className="text-[10px] font-semibold text-emerald-700 mt-0.5 flex items-center justify-end gap-0.5">
                <TrendingUp className="w-3 h-3" /> Live benchmark
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT COLLECTIONS - Glass List */}
      {recentLots.length > 0 && (
        <section className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {t("collector.home.recent") || "RECENT COLLECTIONS"}
            </p>
            <Link to="/collector/history" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              {t("collector.home.view_all") || "View all"} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentLots.map((lot) => {
              const displayTitle =
                lot.payload.items && lot.payload.items.length > 0
                  ? lot.payload.items.map((it: any) => it.material_id || it.material || "Item").join(" + ")
                  : t(`material.${lot.payload.material_id}` as any) || lot.payload.material_id || "Scrap Lot";

              return (
                <Link
                  key={lot.id}
                  to={`/collector/history/${lot.id}`}
                  className="block backdrop-blur-md bg-white/85 border border-stone-200/70 p-4 rounded-2xl shadow-sm hover:border-primary/50 active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-charcoal text-sm uppercase tracking-tight group-hover:text-primary transition-colors">
                        {displayTitle}
                      </h3>
                      <p className="text-xs text-muted-foreground font-semibold">
                        {lot.payload.approx_weight_kg} kg • <span className="text-[10px] font-mono text-stone-400">#{lot.id.slice(0, 8)}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-charcoal text-base font-mono">
                        ₹{(lot.payload.asking_price || lot.payload.estimated_value || 0).toLocaleString()}
                      </p>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        lot.sync_status === "synced"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {lot.sync_status === "synced" ? "Synced" : "Local DB"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* QUICK SHORTCUTS - 3 Cards */}
      <section className="grid grid-cols-3 gap-2.5 pt-1">
        <Link to="/collector/price" className="block active:scale-[0.98] transition-transform">
          <div className="backdrop-blur-md bg-white/80 border border-stone-200/70 p-3.5 rounded-2xl shadow-sm hover:border-primary/40 transition-colors text-center">
            <FileText className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <h4 className="font-extrabold text-[11px] text-charcoal leading-tight">Price Board</h4>
            <p className="text-[9px] text-muted-foreground mt-0.5">Spoken Audio</p>
          </div>
        </Link>

        <Link to="/collector/recyclers" className="block active:scale-[0.98] transition-transform">
          <div className="backdrop-blur-md bg-white/80 border border-stone-200/70 p-3.5 rounded-2xl shadow-sm hover:border-primary/40 transition-colors text-center">
            <MapPin className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <h4 className="font-extrabold text-[11px] text-charcoal leading-tight">Recyclers</h4>
            <p className="text-[9px] text-muted-foreground mt-0.5">Nearby Yards</p>
          </div>
        </Link>

        <Link to="/collector/safety" className="block active:scale-[0.98] transition-transform">
          <div className="backdrop-blur-md bg-white/80 border border-stone-200/70 p-3.5 rounded-2xl shadow-sm hover:border-primary/40 transition-colors text-center">
            <ShieldAlert className="w-5 h-5 text-copper mx-auto mb-1.5" />
            <h4 className="font-extrabold text-[11px] text-charcoal leading-tight">Safety Guide</h4>
            <p className="text-[9px] text-muted-foreground mt-0.5">PPE Protocol</p>
          </div>
        </Link>
      </section>

    </div>
  );
}
