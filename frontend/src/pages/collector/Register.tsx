import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, MapPin, Phone, ArrowLeft, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { useCollectorAuthStore } from "@/stores/authStore";
import { useSyncStore } from "@/stores/syncStore";
import { getApiUrl } from "@/config/api";

export default function CollectorRegister() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { login } = useCollectorAuthStore();
  const { isOnline } = useSyncStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillDemo = () => {
    setFullName("Sunil Mehra");
    setEmail("sunil.mehra@sahirate.in");
    setPhone("9823011223");
    setLocation("Ward 9, Raipur");
    setPassword("sahirate123");
    setError(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanLocation = location.trim();

    if (!cleanName || !cleanEmail || !cleanLocation || !password) {
      setError("Please fill in all required fields (Name, Email, Location, Password).");
      setLoading(false);
      return;
    }

    try {
      // Attempt backend registration
      const res = await fetch(getApiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: cleanName,
          email: cleanEmail,
          phone: cleanPhone || undefined,
          location: cleanLocation,
          password,
          role: "COLLECTOR",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.detail || "Registration failed on server. Please check your inputs or use a different email/phone.");
        setLoading(false);
        return;
      }

      const registeredUser = await res.json();

      // Automatically authenticate the newly registered collector to obtain JWT token
      const loginRes = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      if (loginRes.ok) {
        const tokenData = await loginRes.json();
        login({
          id: tokenData.user.id,
          email: tokenData.user.email || cleanEmail,
          phone: tokenData.user.phone || cleanPhone,
          full_name: tokenData.user.full_name || cleanName,
          location: tokenData.user.location || cleanLocation,
          role: "COLLECTOR",
          is_verified: true,
          token: tokenData.access_token,
        });
        navigate("/collector");
        return;
      } else {
        login({
          id: registeredUser.id,
          email: registeredUser.email || cleanEmail,
          phone: registeredUser.phone || cleanPhone,
          full_name: registeredUser.full_name || cleanName,
          location: registeredUser.location || cleanLocation,
          role: "COLLECTOR",
          is_verified: true,
        });
        navigate("/collector");
        return;
      }
    } catch (err: any) {
      setError(err.message || "Failed to reach registration server. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen flex flex-col justify-center animate-in fade-in py-8">
      <header className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full mr-2">
          <ArrowLeft className="w-5 h-5 text-charcoal" />
        </Button>
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
          Informal Collector Onboarding
        </span>
      </header>

      <div className="space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-charcoal tracking-tight">
            {language === "hi" ? "कलेक्टर पंजीकरण" : "Collector Registration"}
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Join the formal circular recycling chain to earn +66% more and get fair digital weights.
          </p>
        </div>

        {/* Demo Fast Fill Button */}
        <div className="bg-[#FAF8F3] border border-[#DDD8CC] p-3 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs font-black text-charcoal">Quick Demo Fill</p>
              <p className="text-[10px] text-muted-foreground font-mono">Sunil Mehra • Ward 9, Raipur</p>
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
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-[#FAF8F3] border border-[#DDD8CC] rounded-xl pl-10 pr-3 py-2 text-xs font-medium text-charcoal placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collector@sahirate.in"
                className="w-full bg-[#FAF8F3] border border-[#DDD8CC] rounded-xl pl-10 pr-3 py-2 text-xs font-medium text-charcoal placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Collection Ward / Location *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Ward 14, Nagpur (or city)"
                className="w-full bg-[#FAF8F3] border border-[#DDD8CC] rounded-xl pl-10 pr-3 py-2 text-xs font-medium text-charcoal placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Mobile Phone (Optional for SMS Slips)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full bg-[#FAF8F3] border border-[#DDD8CC] rounded-xl pl-10 pr-3 py-2 text-xs font-medium text-charcoal placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF8F3] border border-[#DDD8CC] rounded-xl pl-10 pr-3 py-2 text-xs font-medium text-charcoal placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-primary/20 mt-2"
          >
            {loading ? "Registering..." : "Complete Registration & Enter App"}
          </Button>
        </form>

        <div className="text-center pt-1">
          <p className="text-xs text-muted-foreground">
            Already registered?{" "}
            <Link to="/collector/login" className="font-bold text-primary hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#DDD8CC] text-center text-[10px] text-muted-foreground font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Zero Registration Fees • 100% Free for Informal Waste Pickers
        </div>
      </div>
    </div>
  );
}
