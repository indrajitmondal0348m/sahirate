import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Receipt, Users, ShieldCheck, Scale, AlertTriangle, FileText, RefreshCw, ArrowRight, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { getAdminStats, getAdminAlerts, getVerifications } from "@/services/api";
import AdminStateAnalytics from "@/components/analytics/AdminStateAnalytics";
import CriticalMineralRecoveryReport from "@/components/analytics/CriticalMineralRecoveryReport";
import type { AdminStats, AdminAlert, VerificationRequest } from "@/types";

export default function AdminHome() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, alertsData, verifsData] = await Promise.all([
        getAdminStats(),
        getAdminAlerts(),
        getVerifications("PENDING")
      ]);
      setStats(statsData);
      setAlerts(alertsData);
      setVerifications(verifsData);
    } catch (err) {
      console.error("Failed to load admin overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Overview Banner: Warm Cream / Ivory Theme */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-[#FFFDF9] to-[#F2EAE0] border border-[#EFE8DC] p-8 sm:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-[#174C4A]/10 text-[#174C4A] border border-[#174C4A]/20 px-3 py-1 rounded-full">
            <Shield className="w-3.5 h-3.5" /> State Oversight & Chain Traceability Node #4
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#1C1917] tracking-tight leading-tight">
            Central Platform Governance
          </h1>
          <p className="text-sm sm:text-base text-[#78716C] font-medium leading-relaxed">
            Live cross-facility monitoring of authorized scrap recyclers, statutory PCB permits, and algorithmic price protection for informal pickers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={loadData}
            variant="outline"
            className="rounded-full bg-white hover:bg-[#FAF8F3] text-[#1C1917] border-[#ECE6DA] gap-2 text-xs font-bold h-11 px-5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FF7337]" : "text-[#78716C]"}`} />
            Refresh Metrics
          </Button>
          <Link to="/admin/verification">
            <Button className="rounded-full bg-[#174C4A] hover:bg-[#123C3B] text-white font-bold text-xs h-11 px-6 shadow-sm">
              Review Verifications ({verifications.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-[#EFE8DC] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#A8A29E]">Total Transactions</span>
              <p className="text-3xl font-black text-[#1C1917] font-mono mt-0.5">
                {stats?.totalTransactions.toLocaleString() || "..."}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#EFE8DC] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#A8A29E]">Active Collectors</span>
              <p className="text-3xl font-black text-[#1C1917] font-mono mt-0.5">
                {stats?.activeCollectors.toLocaleString() || "..."}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#EFE8DC] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#A8A29E]">Verified Recyclers</span>
              <p className="text-3xl font-black text-[#1C1917] font-mono mt-0.5">
                {stats?.verifiedRecyclers.toLocaleString() || "..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics: Statewide Processing Mix Pie Chart & Weekly Settlements */}
      <AdminStateAnalytics />

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-[#EFE8DC] rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#78716C]">Total Mass Processed</span>
            <div className="text-2xl font-black text-[#1C1917] mt-1 font-mono">
              {(((stats?.monthlyVolumeKg || stats?.totalWeightKg || 0)) / 1000).toFixed(1)} MT
            </div>
          </div>
          <Scale className="w-8 h-8 text-[#A8A29E]" />
        </div>

        <div className="bg-white border border-[#EFE8DC] rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#78716C]">Gross Settlement Volume</span>
            <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
              ₹{(stats?.totalVolumeInr || (stats?.monthlyVolumeKg ? stats.monthlyVolumeKg * 165 : 245000)).toLocaleString()}
            </div>
          </div>
          <Receipt className="w-8 h-8 text-emerald-600" />
        </div>

        <div className="bg-white border border-[#EFE8DC] rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#78716C]">Pending KYC Applications</span>
            <div className="text-2xl font-black text-amber-600 mt-1 font-mono">
              {verifications.length}
            </div>
          </div>
          <FileText className="w-8 h-8 text-amber-600" />
        </div>
      </div>

      {/* SIH Datasets & Unit Economics Center Quick Link */}
      <div className="bg-linear-to-r from-[#174C4A] via-[#1b5855] to-[#24706c] text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
            SIH Problem Statement Mandate
          </span>
          <h3 className="text-xl font-black tracking-tight mt-0.5">
            The 6 Standardized Circular Datasets & Financial Sustainability Center
          </h3>
          <p className="text-xs text-white/80 mt-1 max-w-xl font-medium">
            Access exportable datasets (Materials, Prices, Recyclers, Transactions, Traceability, Collector Impact) 
            plus the interactive +66% collector unit economics simulator.
          </p>
        </div>
        <Link to="/admin/datasets">
          <Button className="bg-white hover:bg-white/90 text-[#174C4A] font-black text-xs h-11 px-5 rounded-2xl shadow-sm shrink-0">
            Explore 6 Datasets & Financial Model <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>

      {/* Critical & Strategic Minerals Extraction Index */}
      <CriticalMineralRecoveryReport />

      {/* Content Columns: Verifications vs System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Pending KYC Verifications */}
        <div className="lg:col-span-7 bg-white border border-[#EFE8DC] rounded-3xl p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-xl text-[#1C1917]">Pending Recycler Verifications</h3>
              <p className="text-xs text-[#78716C]">Requires Pollution Control Board permit clearance</p>
            </div>
            <Link to="/admin/verification" className="text-xs font-bold text-[#174C4A] hover:underline flex items-center gap-1">
              Inspect all ({verifications.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {verifications.length === 0 ? (
            <div className="py-12 text-center text-[#A8A29E] text-xs font-semibold">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All registered recycling yards are up to date and verified.
            </div>
          ) : (
            <div className="space-y-3">
              {verifications.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] flex items-center justify-between gap-4 hover:bg-[#F5F2EB] transition-colors"
                >
                  <div>
                    <div className="font-bold text-sm text-[#1C1917]">{v.user_name}</div>
                    <div className="text-xs text-[#78716C] mt-0.5">
                      Lic: <span className="font-mono font-bold text-[#174C4A]">{v.document_number || "OD/SPCB/2026"}</span> • {v.location || "Bhubaneswar"}
                    </div>
                  </div>
                  <Link to="/admin/verification">
                    <Button size="sm" className="rounded-full bg-[#174C4A] hover:bg-[#123C3B] text-white text-xs font-bold shadow-sm">
                      Review & Authorize
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Security & Statutory Alerts */}
        <div className="lg:col-span-5 bg-white border border-[#EFE8DC] rounded-3xl p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-xl text-[#1C1917]">System Traceability Alerts</h3>
              <p className="text-xs text-[#78716C]">Fraud prevention & weight deviation triggers</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              {alerts.length} Active
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="py-12 text-center text-[#A8A29E] text-xs font-semibold">
              No active fraud or weighment anomalies flagged by the state model.
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      {al.severity}
                    </span>
                    <span className="text-[10px] text-[#A8A29E]">
                      {al.created_at ? new Date(al.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#1C1917] leading-relaxed">
                    {al.description || al.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
