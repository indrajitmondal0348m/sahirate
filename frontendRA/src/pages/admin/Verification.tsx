import { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Eye,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  Scale,
  Sparkles,
  Check,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVerifications, approveVerification, rejectVerification } from "@/services/api";
import type { VerificationRequest } from "@/types";

export default function AdminVerification() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [activeModalItem, setActiveModalItem] = useState<VerificationRequest | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const data = await getVerifications();
      setVerifications(data);
    } catch (err) {
      console.error("Failed to load verifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    setActingId(id);
    try {
      await approveVerification(id);
      setActionSuccess(`Approved statutory license for "${name}". Yard account is now active.`);
      await fetchVerifications();
      if (activeModalItem?.id === id) {
        setActiveModalItem(null);
      }
    } catch (err: any) {
      console.error("Approval failed:", err);
    } finally {
      setActingId(null);
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setActingId(id);
    try {
      await rejectVerification(id);
      setActionSuccess(`Rejected registration application for "${name}".`);
      await fetchVerifications();
      if (activeModalItem?.id === id) {
        setActiveModalItem(null);
      }
    } catch (err: any) {
      console.error("Rejection failed:", err);
    } finally {
      setActingId(null);
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  const filtered = verifications.filter((v) => {
    if (filter === "ALL") return true;
    return v.status === filter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#A8A29E]">
            GOVERNMENT STATUTORY OVERSIGHT
          </div>
          <h1 className="text-3xl font-black text-[#1C1917] tracking-tight">
            Recycler KYC Authorizations
          </h1>
          <p className="text-xs text-[#78716C] font-medium mt-0.5">
            Review registered recycling yards, inspect PCB pollution permits, and authorize formal chain access
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#EFEBE3] p-1 rounded-2xl text-xs font-bold">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  filter === st
                    ? "bg-white text-[#1C1917] shadow-sm font-extrabold"
                    : "text-[#78716C] hover:text-[#1C1917]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <Button
            onClick={fetchVerifications}
            variant="outline"
            size="sm"
            className="rounded-2xl bg-white hover:bg-[#FAF8F3] text-[#1C1917] border-[#ECE6DA] shadow-sm h-9 px-3.5 gap-1.5 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FF7337]" : "text-[#78716C]"}`} />
            Refresh
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-500 hover:text-emerald-700">&times;</button>
        </div>
      )}

      {/* Grid of Verifications */}
      {loading ? (
        <div className="py-20 text-center text-[#A8A29E] font-medium text-sm">
          Loading statutory verification records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#EFE8DC] rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#174C4A]/10 text-[#174C4A] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-[#1C1917]">No applications found</h3>
          <p className="text-xs text-[#78716C] mt-1">
            No verification requests matching filter "{filter}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((v) => {
            const details = v.details || {};
            const isPending = v.status === "PENDING";

            return (
              <div
                key={v.id}
                className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isPending ? "border-[#FF7337]/40 ring-2 ring-[#FF7337]/10" : "border-[#EFE8DC]"
                }`}
              >
                <div className="space-y-4">
                  {/* Badge Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#FAF8F3] text-[#78716C] border border-[#ECE6DA] px-2.5 py-1 rounded-md">
                      {v.role} YARD
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        v.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : v.status === "PENDING"
                          ? "bg-amber-100 text-amber-800 animate-pulse"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="font-black text-lg text-[#1C1917] leading-snug">
                      {v.user_name}
                    </h3>
                    <p className="text-xs text-[#78716C] mt-1 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
                      {v.location || details.location || "Location Not Provided"}
                    </p>
                  </div>

                  {/* License Info Box */}
                  <div className="bg-[#FAF8F3] border border-[#ECE6DA] rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#A8A29E] font-bold uppercase text-[10px]">Document</span>
                      <span className="font-bold text-[#1C1917] truncate max-w-[180px]">{v.document_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#A8A29E] font-bold uppercase text-[10px]">License #</span>
                      <span className="font-mono font-bold text-[#174C4A] bg-[#174C4A]/10 px-2 py-0.5 rounded">
                        {v.document_number || details.pcb_license || "—"}
                      </span>
                    </div>
                    {details.contact_person && (
                      <div className="flex justify-between items-center">
                        <span className="text-[#A8A29E] font-bold uppercase text-[10px]">Representative</span>
                        <span className="font-medium text-[#1C1917]">{details.contact_person}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="pt-4 mt-4 border-t border-[#ECE6DA] flex items-center justify-between gap-2">
                  <Button
                    onClick={() => setActiveModalItem(v)}
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold text-[#78716C] hover:text-[#1C1917] gap-1 px-2"
                  >
                    <Eye className="w-3.5 h-3.5" /> Inspect Form
                  </Button>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleReject(v.id, v.user_name)}
                        disabled={actingId === v.id}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 px-2.5 rounded-full"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        onClick={() => handleApprove(v.id, v.user_name)}
                        disabled={actingId === v.id}
                        size="sm"
                        className="h-8 text-xs font-bold bg-[#174C4A] hover:bg-[#123C3B] text-white gap-1 px-3.5 rounded-full shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL INSPECTION MODAL */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFE8DC] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-[#ECE6DA] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#174C4A] bg-[#174C4A]/10 px-2.5 py-0.5 rounded-full">
                  Government PCB Statutory Dossier
                </span>
                <h3 className="text-2xl font-black text-[#1C1917] mt-1">
                  {activeModalItem.user_name}
                </h3>
                <p className="text-xs text-[#78716C] font-medium">Application ID: {activeModalItem.id}</p>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="w-8 h-8 rounded-full bg-[#FAF8F3] hover:bg-[#EFEBE3] flex items-center justify-center font-bold text-[#78716C]"
              >
                &times;
              </button>
            </div>

            {/* Complete Submitted Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#FAF8F3] border border-[#ECE6DA] p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#A8A29E]">PCB Authorization Number</span>
                <p className="font-mono font-black text-sm text-[#174C4A]">
                  {activeModalItem.document_number || activeModalItem.details?.pcb_license || "N/A"}
                </p>
              </div>

              <div className="bg-[#FAF8F3] border border-[#ECE6DA] p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#A8A29E]">GSTIN / Tax Registration</span>
                <p className="font-mono font-bold text-sm text-[#1C1917]">
                  {activeModalItem.details?.gst_number || "Not provided"}
                </p>
              </div>

              <div className="bg-[#FAF8F3] border border-[#ECE6DA] p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#A8A29E]">Authorized Contact Person</span>
                <p className="font-bold text-sm text-[#1C1917]">
                  {activeModalItem.details?.contact_person || activeModalItem.user_name}
                </p>
              </div>

              <div className="bg-[#FAF8F3] border border-[#ECE6DA] p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#A8A29E]">Phone & Email</span>
                <p className="font-bold text-sm text-[#1C1917]">
                  {activeModalItem.phone || activeModalItem.details?.phone || "N/A"} • {activeModalItem.details?.email || "N/A"}
                </p>
              </div>

              <div className="bg-[#FAF8F3] border border-[#ECE6DA] p-4 rounded-2xl space-y-1 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase text-[#A8A29E]">Physical Yard Facility Address</span>
                <p className="font-bold text-sm text-[#1C1917]">
                  {activeModalItem.details?.address || activeModalItem.location || "N/A"} ({activeModalItem.location})
                </p>
              </div>

              <div className="bg-[#FAF8F3] border border-[#ECE6DA] p-4 rounded-2xl space-y-1 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase text-[#A8A29E]">Facility Type & Daily Capacity</span>
                <p className="font-bold text-sm text-[#1C1917]">
                  {activeModalItem.details?.facility_type || "Authorized E-Waste Dismantler"} — {activeModalItem.details?.daily_capacity_kg || 2500} kg/day
                </p>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-[#ECE6DA] flex items-center justify-end gap-3">
              <Button
                onClick={() => setActiveModalItem(null)}
                variant="outline"
                className="rounded-full border-[#ECE6DA] text-xs font-bold"
              >
                Close
              </Button>

              {activeModalItem.status === "PENDING" && (
                <>
                  <Button
                    onClick={() => handleReject(activeModalItem.id, activeModalItem.user_name)}
                    variant="outline"
                    className="rounded-full text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject Registration
                  </Button>
                  <Button
                    onClick={() => handleApprove(activeModalItem.id, activeModalItem.user_name)}
                    className="rounded-full text-xs font-bold bg-[#174C4A] hover:bg-[#123C3B] text-white gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Activate Facility
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
