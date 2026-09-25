import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Lock, LogIn, ArrowLeft, Sparkles, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/i18n";
import { useCollectorAuthStore } from "@/stores/authStore";
import { useSyncStore } from "@/stores/syncStore";
import { useCreateLotStore } from "@/stores/createLotStore";
import { getApiUrl } from "@/config/api";

export default function CollectorLogin() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login, logout } = useCollectorAuthStore();
  const { isOnline } = useSyncStore();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.registeredEmail) {
      setIdentifier(location.state.registeredEmail);
    }
  }, [location.state]);

  const fillDemo = () => {
    setIdentifier("collector@sahirate.in");
    setPassword("sahirate123");
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setError("Please enter your email or phone and password.");
      setLoading(false);
      return;
    }

    try {
      // Attempt backend API login
      const res = await fetch(getApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanIdentifier,
          email: cleanIdentifier.includes("@") ? cleanIdentifier : undefined,
          phone: !cleanIdentifier.includes("@") ? cleanIdentifier : undefined,
          password,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== "COLLECTOR" && data.user.role !== "ADMIN") {
          setError("Access restricted: This portal is for registered field collectors. Recyclers and admins must sign in via the Recycler Portal.");
          setLoading(false);
          return;
        }

        login({
          id: data.user.id,
          email: data.user.email || cleanIdentifier,
          phone: data.user.phone,
          full_name: data.user.full_name || "Collector",
          location: data.user.location || "Nagpur, Ward 14",
          role: "COLLECTOR",
          is_verified: true,
          token: data.access_token,
        });

        // Check if there was a lotItem passed from the material scan page
        const navState = (location.state as any) || {};
        if (navState.lotItem) {
          const lotStore = useCreateLotStore.getState();
          lotStore.reset();
          lotStore.initDraft();
          lotStore.addItem(navState.lotItem);
          lotStore.setStep("confirm");
          navigate("/collector/create-lot");
          return;
        }

        const returnTo = navState.returnTo || "/collector";
        navigate(returnTo);
        return;
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.detail || "Authentication failed. Invalid email/phone or password.");
        return;
      }
    } catch (err: any) {
      // Offline fallback: ONLY allow demo credentials if user explicitly uses demo account offline
      if (
        (cleanIdentifier.toLowerCase() === "collector@sahirate.in" || cleanIdentifier === "9876543210") &&
        password === "sahirate123"
      ) {
        login({
          id: "demo-collector-1",
          email: "collector@sahirate.in",
          phone: "9876543210",
          full_name: "Ramesh Kumar (Collector)",
          location: "Ward 14, Nagpur",
          role: "COLLECTOR",
          is_verified: true,
        });
        navigate("/collector");
        return;
      }
      setError("Unable to reach the authentication server. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen flex flex-col justify-center animate-in fade-in">
      <header className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full mr-2">
          <ArrowLeft className="w-5 h-5 text-charcoal" />
        </Button>
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
          Field Collector Access
        </span>
      </header>

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-md shadow-primary/20">
            <LogIn className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-charcoal tracking-tight">
            {language === "hi" ? "कलेक्टर लॉगिन" : "Collector Login"}
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Sign in to create verified lots, track scrap rates, and manage digital handovers.
          </p>
        </div>

        {/* Active Session Status (if already authenticated) */}
        {isAuthenticated && user && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                {user.full_name?.[0] || "C"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-black text-emerald-950 truncate">{user.full_name}</p>
                  <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-black">LOGGED IN</span>
                </div>
                <p className="text-[11px] text-emerald-800 truncate">{user.email || user.phone} • {user.location}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => navigate("/collector")}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl"
              >
                Go to Field Dashboard
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => logout()}
                className="bg-white border-emerald-300 text-red-600 hover:bg-red-50 font-bold text-xs h-9 rounded-xl"
              >
                Sign Out
              </Button>
            </div>
          </div>
        )}

        {/* Demo Fast Access Pill */}
        <div className="bg-[#FAF8F3] border border-[#DDD8CC] p-3 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs font-black text-charcoal">Evaluator / Demo Account</p>
              <p className="text-[10px] text-muted-foreground font-mono">collector@sahirate.in • sahirate123</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={fillDemo}
            className="bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl h-8 px-3"
          >
            Auto-Fill
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Email or Phone
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="collector@sahirate.in or 9876543210"
                className="w-full bg-[#FAF8F3] border border-[#DDD8CC] rounded-xl pl-10 pr-3 py-2.5 text-xs font-medium text-charcoal placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF8F3] border border-[#DDD8CC] rounded-xl pl-10 pr-3 py-2.5 text-xs font-medium text-charcoal placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-primary/20"
          >
            {loading ? "Signing In..." : "Sign In to Collector App"}
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/collector/register" className="font-bold text-primary hover:underline">
              Register New Collector
            </Link>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-[10px] text-emerald-800 font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Works Offline: Credentials securely cached in device storage.
        </div>
      </div>
    </div>
  );
}
