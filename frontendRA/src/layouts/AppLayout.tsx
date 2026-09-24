import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Package,
  Receipt,
  TrendingUp,
  ShieldCheck,
  LayoutDashboard,
  AlertTriangle,
  FileText,
  LogOut,
  LogIn,
  Sparkles,
  RefreshCw,
  Menu,
  X,
  Factory,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "@/i18n";
import { getStoredUser, logoutUser } from "@/services/api";
import type { User } from "@/types";

export default function AppLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, [location.pathname]);

  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await fetch("/health");
        setBackendOnline(res.ok);
      } catch {
        setBackendOnline(false);
      }
    }
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    navigate("/login");
  };

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isRecycler = location.pathname.startsWith("/recycler");
  const isAdmin = location.pathname.startsWith("/admin");

  const currentSpace = isAdmin ? "admin" : "recycler";

  const recyclerNavItems = [
    { name: t("portal.nav_home" as any) || "Home", path: "/recycler", icon: Home },
    { name: t("portal.nav_incoming_lots" as any) || "Incoming Lots", path: "/recycler/lots", icon: Package },
    { name: t("portal.nav_transactions" as any) || "Transactions", path: "/recycler/transactions", icon: Receipt },
    { name: t("portal.nav_price_board" as any) || "Price Board", path: "/recycler/rates", icon: TrendingUp },
  ];

  const adminNavItems = [
    { name: t("portal.nav_overview" as any) || "Overview", path: "/admin", icon: LayoutDashboard },
    { name: "Datasets & Economics", path: "/admin/datasets", icon: FileText },
    { name: t("portal.nav_kyc" as any) || "KYC Verification", path: "/admin/verification", icon: ShieldCheck },
    { name: t("portal.nav_transactions" as any) || "Transactions", path: "/admin/transactions", icon: Receipt },
    { name: t("portal.nav_alerts" as any) || "Govt Alerts", path: "/admin/alerts", icon: AlertTriangle },
  ];

  const activeNavItems = currentSpace === "admin" ? adminNavItems : recyclerNavItems;

  return (
    <div className="min-h-screen w-full bg-[#FAF8F3] text-[#1C1917] flex font-sans antialiased selection:bg-[#FF7337]/20 selection:text-[#FF7337]">
      {/* Mobile Drawer Backdrop (Only on portal pages) */}
      {!isAuthPage && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR - Persistent Desktop Layout (Hidden on Login/Register) */}
      {!isAuthPage && (
        <aside
          className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-[#FAF8F3] border-r border-[#ECE6DA] flex flex-col justify-between py-6 px-4 transition-transform duration-200 lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex flex-col gap-6">
            {/* Brand Header */}
            <div className="flex items-center justify-between px-2">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-[#FF7337] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#FF7337]/25 transition-transform group-hover:scale-105">
                  S
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tight text-[#1C1917] leading-none">
                    Sahi<span className="text-[#FF7337]">Rate</span>
                  </span>
                  <span className="text-[10px] font-bold tracking-wider text-[#A8A29E] uppercase mt-0.5">
                    {currentUser?.role === "ADMIN" ? "Recycler & Admin" : "Recycler Facility"}
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden text-[#78716C] hover:text-[#1C1917] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher - ONLY visible to ADMIN users. Recyclers NEVER see the Admin button */}
            {currentUser?.role === "ADMIN" && (
              <div className="p-1 bg-[#EFEBE3] rounded-2xl flex items-center gap-1 text-xs font-bold">
                <Link
                  to="/recycler"
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                    isRecycler
                      ? "bg-white text-[#1C1917] shadow-sm font-extrabold"
                      : "text-[#78716C] hover:text-[#1C1917]"
                  }`}
                >
                  <Factory className="w-3.5 h-3.5 text-[#FF7337]" />
                  {t("portal.recycler_tab" as any) || "Recycler"}
                </Link>
                <Link
                  to="/admin"
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                    isAdmin
                      ? "bg-white text-[#1C1917] shadow-sm font-extrabold"
                      : "text-[#78716C] hover:text-[#1C1917]"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#174C4A]" />
                  {t("portal.admin_tab" as any) || "Admin"}
                </Link>
              </div>
            )}

            {/* Navigation Links */}
            <div className="flex flex-col gap-1">
              <div className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-widest px-3 mb-1">
                {currentSpace === "admin"
                  ? (t("portal.admin_space" as any) || "ADMIN COUNCIL")
                  : (t("portal.recycler_space" as any) || "RECYCLER SPACE")}
              </div>

              {activeNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white text-[#1C1917] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#ECE6DA]"
                        : "text-[#78716C] hover:text-[#1C1917] hover:bg-black/[0.02]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-[#FF7337]" : "text-[#A8A29E]"
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sidebar Bottom Sync Badge */}
          <div className="flex flex-col gap-3">
            <div className="bg-white/80 border border-[#ECE6DA] rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FF7337]/10 flex items-center justify-center text-[#FF7337]">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-[#1C1917]">
                  {t("portal.ready_to_sync" as any) || "Ready to sync"}
                </span>
                <span className="text-[11px] text-[#A8A29E]">
                  {t("portal.pending_updates" as any) || "0 pending updates"}
                </span>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* RIGHT MAIN AREA */}
      <div className={`flex-1 min-w-0 flex flex-col min-h-screen ${isAuthPage ? "" : "lg:pl-[260px]"}`}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#FAF8F3]/90 backdrop-blur-md px-6 sm:px-10 py-4 flex items-center justify-between border-b border-[#ECE6DA]/60">
          <div className="flex items-center gap-3">
            {!isAuthPage && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-[#ECE6DA] bg-white text-[#1C1917] hover:bg-[#F5F2EB]"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {isAuthPage ? (
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF7337] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#FF7337]/25">
                  S
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-[#1C1917] leading-none">
                    Sahi<span className="text-[#FF7337]">Rate</span>
                  </span>
                  <span className="text-[9px] font-bold tracking-wider text-[#A8A29E] uppercase">
                    Recycler & Admin Gateway
                  </span>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#78716C]">
                <span className="capitalize">
                  {currentSpace === "admin"
                    ? (t("portal.admin_tab" as any) || "Admin")
                    : (t("portal.recycler_tab" as any) || "Recycler")}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
                <span className="text-[#1C1917]">
                  {location.pathname.split("/")[2]
                    ? location.pathname.split("/")[2].toUpperCase()
                    : (t("portal.nav_home" as any) || "HOME")}
                </span>
              </div>
            )}
          </div>

          {/* Top Right Action Pills */}
          <div className="flex items-center gap-2.5">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Live / Offline Connected Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#ECE6DA] text-xs font-medium text-[#57534E] shadow-sm">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    backendOnline ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    backendOnline ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
              </span>
              <span className="hidden sm:inline font-semibold">
                {backendOnline === null
                  ? "Checking..."
                  : backendOnline
                  ? (t("portal.live_ready" as any) || "Live ready")
                  : (t("portal.offline_ready" as any) || "Offline ready")}
              </span>
            </div>

            {/* Auth Pill Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#1C1917] leading-tight">
                    {currentUser.full_name || currentUser.phone}
                  </span>
                  <span className="text-[10px] font-bold text-[#FF7337] uppercase">
                    {currentUser.role}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="rounded-full h-9 px-3 text-xs font-bold text-[#78716C] hover:text-[#1C1917] bg-white border-[#ECE6DA] shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  {t("portal.logout" as any) || "Logout"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button
                    size="sm"
                    className="rounded-full bg-white hover:bg-[#F5F2EB] text-[#1C1917] font-bold text-xs h-9 px-4 border border-[#ECE6DA] shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5 mr-1" />
                    {t("portal.login" as any) || "Log in"}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="rounded-full bg-[#FF7337] hover:bg-[#E55A1F] text-white font-bold text-xs h-9 px-4 shadow-sm shadow-[#FF7337]/25"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    {t("portal.register_yard" as any) || "Register Yard"}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 w-full px-6 sm:px-10 py-8">
          <Outlet />
        </main>

        {/* Minimal Clean Warm Footer */}
        <footer className="border-t border-[#ECE6DA] py-6 px-6 sm:px-10 text-xs text-[#A8A29E] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SahiRate Portal • SIH26229 Authorized Scrap Value Architecture</span>
          <span>Government Central PCB Verification Node #4</span>
        </footer>
      </div>
    </div>
  );
}
