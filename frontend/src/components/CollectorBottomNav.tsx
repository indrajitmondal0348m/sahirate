import { Link, useLocation } from "react-router-dom";
import { Home, History, FileText, RefreshCw, QrCode } from "lucide-react";
import { useTranslation } from "@/i18n";

export default function CollectorBottomNav() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto h-[68px] backdrop-blur-2xl bg-white/90 border-t border-stone-200/70 shadow-[0_-8px_25px_rgba(0,0,0,0.04)] flex items-center justify-between px-3 z-50 pb-safe">
      
      <Link
        to="/collector"
        className={`flex flex-col items-center justify-center w-16 h-full gap-1 active:scale-95 transition-all relative ${
          pathname === "/collector" ? "text-primary font-bold" : "text-stone-400 hover:text-stone-700"
        }`}
      >
        {pathname === "/collector" && (
          <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-sm shadow-primary/30" />
        )}
        <Home className={`w-5 h-5 ${pathname === "/collector" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
        <span className="text-[10px] tracking-tight">{t("collector.nav.home") || "Home"}</span>
      </Link>

      <Link
        to="/collector/history"
        className={`flex flex-col items-center justify-center w-16 h-full gap-1 active:scale-95 transition-all relative ${
          pathname === "/collector/history" ? "text-primary font-bold" : "text-stone-400 hover:text-stone-700"
        }`}
      >
        {pathname === "/collector/history" && (
          <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-sm shadow-primary/30" />
        )}
        <History className={`w-5 h-5 ${pathname === "/collector/history" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
        <span className="text-[10px] tracking-tight">{t("collector.nav.collections") || "History"}</span>
      </Link>

      {/* Floating Center Scan Button */}
      <div className="relative w-16 h-full flex items-center justify-center">
        <Link
          to="/collector/scan"
          aria-label="Scan handover QR"
          className="absolute -top-4 flex items-center justify-center w-14 h-14 rounded-full shadow-xl shadow-primary/30 active:scale-95 transition-transform border-[3px] border-white bg-gradient-to-br from-primary to-[#0f3836]"
        >
          <QrCode className="w-6 h-6 text-white" />
        </Link>
      </div>

      <Link
        to="/collector/earnings"
        className={`flex flex-col items-center justify-center w-16 h-full gap-1 active:scale-95 transition-all relative ${
          pathname === "/collector/earnings" ? "text-primary font-bold" : "text-stone-400 hover:text-stone-700"
        }`}
      >
        {pathname === "/collector/earnings" && (
          <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-sm shadow-primary/30" />
        )}
        <FileText className={`w-5 h-5 ${pathname === "/collector/earnings" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
        <span className="text-[10px] tracking-tight">{t("collector.nav.earnings") || "Earnings"}</span>
      </Link>

      <Link
        to="/collector/sync"
        className={`flex flex-col items-center justify-center w-16 h-full gap-1 active:scale-95 transition-all relative ${
          pathname === "/collector/sync" ? "text-primary font-bold" : "text-stone-400 hover:text-stone-700"
        }`}
      >
        {pathname === "/collector/sync" && (
          <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-sm shadow-primary/30" />
        )}
        <RefreshCw className={`w-5 h-5 ${pathname === "/collector/sync" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
        <span className="text-[10px] tracking-tight">{t("collector.nav.sync") || "Sync"}</span>
      </Link>

    </nav>
  );
}
