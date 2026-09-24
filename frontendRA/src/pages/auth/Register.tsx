import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Factory,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Phone,
  Lock,
  Building,
  FileCheck,
  Scale,
  MapPin,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerRecycler } from "@/services/api";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Form State
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("sahirate123");
  const [yardName, setYardName] = useState("");
  const [contactName, setContactName] = useState("");
  const [spcbLicense, setSpcbLicense] = useState("");
  const [city, setCity] = useState("Bhubaneswar");
  const [capacityMt, setCapacityMt] = useState("150");
  const [materials, setMaterials] = useState("Copper, Brass, Plastics, Battery Scrap");

  const fillDemoRecyclerData = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setPhone(`98765${randomSuffix}`);
    setYardName(`Utkal Green Recyclers #${randomSuffix.toString().substring(0, 2)}`);
    setContactName("Pradeep Mohapatra");
    setSpcbLicense(`OD/SPCB/HW-${randomSuffix}/2026`);
    setCity("Bhubaneswar Hub");
    setCapacityMt("250");
    setMaterials("Copper Wire, Cast Aluminum, Battery Scrap, HDPE Bottles");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await registerRecycler({
        phone,
        password,
        yard_name: yardName,
        contact_name: contactName,
        spcb_license: spcbLicense,
        city,
        capacity_mt: parseFloat(capacityMt) || 100,
        materials,
      });

      setSubmittedData({
        phone,
        yardName,
        spcbLicense,
        city,
        verificationId: res?.id || `VER-${Date.now().toString().slice(-6)}`,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check form inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7337]/10 text-[#FF7337] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" /> Formal Recycling Facility Registration
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
          Register Your Scrap Yard
        </h1>
        <p className="text-sm text-[#78716C]">
          Connect your processing facility with informal collectors. Requires statutory CPCB/SPCB hazardous & municipal waste credentials.
        </p>
      </div>

      {isSuccess ? (
        /* PENDING GOVT VERIFICATION SCREEN as requested */
        <div className="bg-white border border-[#EFE8DC] rounded-3xl p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
            <Clock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 text-amber-800">
              Registration Received • Status: Pending
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917]">
              Govt SPCB Verification In Progress
            </h2>
            <p className="text-sm text-[#78716C] max-w-lg mx-auto leading-relaxed">
              Your application for <span className="font-bold text-[#1C1917]">{submittedData?.yardName}</span> has been dispatched to the State Pollution Control Board queue for license audit.
            </p>
          </div>

          {/* Application Summary Box */}
          <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] text-left text-xs space-y-2.5 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-[#78716C]">Application Ref:</span>
              <span className="font-mono font-bold text-[#1C1917]">{submittedData?.verificationId || "VER-REQ-001"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#78716C]">SPCB License No:</span>
              <span className="font-mono font-bold text-[#1C1917]">{submittedData?.spcbLicense}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#78716C]">Phone:</span>
              <span className="font-bold text-[#1C1917]">{submittedData?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#78716C]">Operational Hub:</span>
              <span className="font-bold text-[#1C1917]">{submittedData?.city}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link to="/admin/verification" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto rounded-full bg-[#174C4A] hover:bg-[#123C3B] text-white font-bold text-xs h-11 px-6 shadow-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Open Admin Portal to Review & Approve
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto rounded-full bg-white hover:bg-[#FAF8F3] text-[#1C1917] font-bold text-xs h-11 px-6 border-[#ECE6DA]">
                Go to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* REGISTRATION FORM */
        <div className="bg-white border border-[#EFE8DC] rounded-3xl p-8 sm:p-10 shadow-sm">
          {/* Quick Demo Autofill Bar */}
          <div className="mb-8 p-4 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-xs text-[#1C1917] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF7337]" /> Quick Demonstration Mode
              </div>
              <p className="text-[11px] text-[#78716C]">
                Click below to instantly autofill realistic SPCB recycling yard details.
              </p>
            </div>
            <Button
              type="button"
              onClick={fillDemoRecyclerData}
              size="sm"
              className="rounded-full bg-[#FF7337] hover:bg-[#E55A1F] text-white text-xs font-bold h-9 px-4 shadow-sm"
            >
              Autofill Demo Form
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2">
                  Scrap Yard / Company Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-[#A8A29E]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Utkal Clean Metals Pvt Ltd"
                    value={yardName}
                    onChange={(e) => setYardName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:bg-white focus:outline-none focus:border-[#FF7337]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2">
                  Authorized Manager Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra Sethi"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:bg-white focus:outline-none focus:border-[#FF7337]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2">
                  Official Contact Phone (Login ID)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-[#A8A29E]" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:bg-white focus:outline-none focus:border-[#FF7337]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2">
                  SPCB / CPCB Authorization License No.
                </label>
                <div className="relative">
                  <FileCheck className="w-4 h-4 absolute left-3.5 top-3.5 text-[#A8A29E]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. OD/SPCB/HW-7821/2026"
                    value={spcbLicense}
                    onChange={(e) => setSpcbLicense(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] text-sm font-mono text-[#1C1917] placeholder:text-[#A8A29E] focus:bg-white focus:outline-none focus:border-[#FF7337]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2">
                  Operating City / Industrial Cluster
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-[#A8A29E]" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] text-sm text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#FF7337]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2">
                  Monthly Processing Capacity (MT/Month)
                </label>
                <div className="relative">
                  <Scale className="w-4 h-4 absolute left-3.5 top-3.5 text-[#A8A29E]" />
                  <input
                    type="number"
                    required
                    value={capacityMt}
                    onChange={(e) => setCapacityMt(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] text-sm text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#FF7337]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2">
                Accepted Waste Material Categories
              </label>
              <input
                type="text"
                required
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="e.g. Copper Wire, Lead Battery, Brass, Rigid Plastics"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] text-sm text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#FF7337]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2">
                Account Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#A8A29E]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] text-sm text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#FF7337]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#FF7337] hover:bg-[#E55A1F] text-white font-black text-sm h-12 shadow-md shadow-[#FF7337]/25 flex items-center justify-center gap-2"
            >
              {loading ? "Submitting Application..." : "Submit Yard Registration for Govt Verification"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#ECE6DA] text-center text-xs text-[#78716C]">
            Already have an authorized yard account?{" "}
            <Link to="/login" className="font-bold text-[#FF7337] hover:underline">
              Sign In Here →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
