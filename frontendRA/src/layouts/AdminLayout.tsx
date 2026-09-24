import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Receipt, UserCheck, AlertTriangle, FileText, Shield, Database } from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { label: "Overview", path: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Transactions", path: "/admin/transactions", icon: Receipt },
    { label: "KYC & Verifications", path: "/admin/verification", icon: UserCheck },
    { label: "Datasets & Economics", path: "/admin/datasets", icon: Database },
    { label: "Fraud & Alerts", path: "/admin/alerts", icon: AlertTriangle },
    { label: "Audit Logs", path: "/admin/audit", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Header Bar in clean warm cream */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#ECE6DA]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#174C4A]">
            <Shield className="w-3.5 h-3.5" /> State Oversight & Regulatory Council
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight mt-1">
            Platform Administration & Compliance
          </h1>
          <p className="text-xs text-[#78716C] font-medium mt-0.5">
            Monitor formal chain transactions, approve registered recycler PCB authorizations, and audit tamper-evident logs
          </p>
        </div>

        {/* Subnav Pill Tabs */}
        <nav className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EFEBE3] rounded-2xl">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white text-[#1C1917] shadow-sm font-extrabold"
                    : "text-[#78716C] hover:text-[#1C1917]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#174C4A]" : "text-[#A8A29E]"}`} />
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
