import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Factory,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
  Phone,
  Lock,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/services/api";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "admin" ? "admin" : "recycler";

  const [role, setRole] = useState<"recycler" | "admin">(initialRole);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autofilledMessage, setAutofilledMessage] = useState<string | null>(null);

  const fillDemoCredentials = (targetRole: "recycler" | "admin") => {
    setRole(targetRole);
    if (targetRole === "recycler") {
      setPhone("9876543211");
      setPassword("sahirate123");
      setAutofilledMessage("Recycler Yard demo filled!");
    } else {
      setPhone("9876543212");
      setPassword("sahirate123");
      setAutofilledMessage("Admin Council demo filled!");
    }
    setError(null);
    setTimeout(() => setAutofilledMessage(null), 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await loginUser(phone, password);
      if (res.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/recycler");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please click the 1-Click Demo buttons on the side.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12">
      {/* Page Title */}
      <div className="text-center max-w-lg mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7337]/10 text-[#FF7337] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" /> Portal Authentication
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
          Sign In to SahiRate
        </h1>
        <p className="text-sm text-[#78716C]">
          Authorized gateway for recycling smelters and State Governance administrators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Login Card (White warm-bordered card) */}
        <div className="lg:col-span-7 bg-white border border-[#EFE8DC] rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Role Toggle Header */}
          <div className="flex bg-[#FAF8F3] p-1.5 rounded-2xl border border-[#ECE6DA] mb-6">
            <button
              type="button"
              onClick={() => setRole("recycler")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === "recycler"
                  ? "bg-white text-[#1C1917] shadow-sm font-extrabold"
                  : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              <Factory className={`w-4 h-4 ${role === "recycler" ? "text-[#FF7337]" : "text-[#A8A29E]"}`} />
              Recycler Yard
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === "admin"
                  ? "bg-white text-[#1C1917] shadow-sm font-extrabold"
                  : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${role === "admin" ? "text-[#174C4A]" : "text-[#A8A29E]"}`} />
              Admin Council
            </button>
          </div>

          {/* Feedback banner for autofill */}
          {autofilledMessage && (
            <div className="mb-6 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4 text-emerald-600" />
              {autofilledMessage}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2">
                Registered Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-[#A8A29E]" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543211"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:bg-white focus:outline-none focus:border-[#FF7337] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C]">
                  Password
                </label>
                <span className="text-[11px] text-[#A8A29E]">Default: sahirate123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#A8A29E]" />
                <input
                  type="password"
                  required
                  placeholder="Enter your security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#ECE6DA] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:bg-white focus:outline-none focus:border-[#FF7337] transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#FF7337] hover:bg-[#E55A1F] text-white font-black text-sm h-12 shadow-md shadow-[#FF7337]/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
            >
              {loading ? "Authenticating..." : `Sign In as ${role === "recycler" ? "Recycler Yard" : "Admin"}`}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#ECE6DA] text-center text-xs text-[#78716C]">
            Operating a new recycling yard?{" "}
            <Link to="/register" className="font-bold text-[#FF7337] hover:underline">
              Submit Yard KYC Registration →
            </Link>
          </div>
        </div>

        {/* 1-Click Demo Credentials Side Column (as requested by user) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#FAF8F3] border border-[#ECE6DA] rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#78716C] mb-3">
              <KeyRound className="w-4 h-4 text-[#FF7337]" />
              Quick Demo Logins (1-Click)
            </div>
            <p className="text-xs text-[#78716C] mb-5 leading-relaxed">
              Click either card below to instantly autofill test credentials and access the portal without typing:
            </p>

            {/* Recycler 1-Click Card */}
            <div
              onClick={() => fillDemoCredentials("recycler")}
              className="p-4 rounded-2xl bg-white border border-[#ECE6DA] hover:border-[#FF7337] shadow-sm hover:shadow cursor-pointer transition-all mb-3.5 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FF7337]/10 flex items-center justify-center text-[#FF7337] font-bold">
                    <Factory className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#1C1917] group-hover:text-[#FF7337] transition-colors">
                      Demo Recycler Yard
                    </div>
                    <div className="text-[11px] text-[#78716C]">EcoRecycle Yard Ltd (Yard #4)</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-xs font-bold text-[#FF7337] h-8 px-3 rounded-full bg-[#FF7337]/10 group-hover:bg-[#FF7337] group-hover:text-white transition-colors">
                  Autofill
                </Button>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#ECE6DA]/60 font-mono text-[11px] text-[#78716C] flex justify-between">
                <span>Phone: 9876543211</span>
                <span>Pass: sahirate123</span>
              </div>
            </div>

            {/* Admin 1-Click Card */}
            <div
              onClick={() => fillDemoCredentials("admin")}
              className="p-4 rounded-2xl bg-white border border-[#ECE6DA] hover:border-[#174C4A] shadow-sm hover:shadow cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#174C4A]/10 flex items-center justify-center text-[#174C4A] font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#1C1917] group-hover:text-[#174C4A] transition-colors">
                      Demo Admin Council
                    </div>
                    <div className="text-[11px] text-[#78716C]">Pollution Control Board Officer</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-xs font-bold text-[#174C4A] h-8 px-3 rounded-full bg-[#174C4A]/10 group-hover:bg-[#174C4A] group-hover:text-white transition-colors">
                  Autofill
                </Button>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#ECE6DA]/60 font-mono text-[11px] text-[#78716C] flex justify-between">
                <span>Phone: 9876543212</span>
                <span>Pass: sahirate123</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#ECE6DA] rounded-3xl p-6 shadow-sm">
            <h4 className="font-bold text-sm text-[#1C1917] flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-[#FF7337]" /> How KYC Verification Works
            </h4>
            <p className="text-xs text-[#78716C] leading-relaxed">
              When a recycler registers with SPCB/CPCB license numbers, their account status is set to <span className="font-bold text-amber-700">"Govt Verification Pending"</span>. An admin can review and approve it from the Admin Council KYC tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
