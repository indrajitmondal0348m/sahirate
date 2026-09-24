import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Inbox, History, Sparkles } from "lucide-react";

export default function RecyclerLayout() {
  const location = useLocation();

  const navItems = [
    { label: "Yard Overview", path: "/recycler", icon: LayoutDashboard, exact: true },
    { label: "Available & Accepted Lots", path: "/recycler/lots", icon: Inbox },
    { label: "Disbursements & Receipts", path: "/recycler/transactions", icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Recycler Header Bar in clean warm cream */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#ECE6DA]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#FF7337]">
            <Sparkles className="w-3.5 h-3.5" /> Formal Recycling Facility Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight mt-1">
            Recycler Yard Operations
          </h1>
          <p className="text-xs text-[#78716C] font-medium mt-0.5">
            Accept collection lots from informal scrap collectors, log weighbridge readings, and disburse traceable payments
          </p>
        </div>

        {/* Subnav Pill Tabs */}
        <nav className="flex items-center gap-1.5 p-1 bg-[#EFEBE3] rounded-2xl">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white text-[#1C1917] shadow-sm font-extrabold"
                    : "text-[#78716C] hover:text-[#1C1917]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FF7337]" : "text-[#A8A29E]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
