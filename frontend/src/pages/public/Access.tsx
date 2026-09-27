import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { User, Factory, ShieldCheck, ChevronRight, ArrowLeft, ExternalLink } from "lucide-react";
import { PORTAL_BASE_URL } from "@/config/api";

export default function Access() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col px-4 py-6 space-y-6">
      
      <div className="flex items-center mb-2">
        <Link to="/" className="flex items-center gap-2 text-charcoal hover:text-primary transition-colors active:scale-95 -ml-2 p-2 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-[15px]">Access SahiRate</span>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-charcoal">
          {t("public.access.title")}
        </h1>
        <div className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ml-4">
          Collector Field App
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {/* Collector Card */}
        <Link to="/collector" className="block active:scale-[0.98] transition-transform">
          <Card className="border-2 border-primary bg-white shadow-md hover:shadow-lg rounded-2xl overflow-hidden ring-4 ring-primary/10">
            <CardContent className="p-0">
              <div className="flex items-center p-5 gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-1">
                      {t("public.access.collector")}
                    </h3>
                    <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">This App</span>
                  </div>
                  <p className="text-base font-bold text-charcoal leading-snug">
                    {t("public.access.collector_desc")}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-primary shrink-0" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Collector Quick Login / Register Bar */}
        <div className="flex items-center justify-between px-2 pt-1 pb-1">
          <Link
            to="/collector/login"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Sign In with Email / Phone
          </Link>
          <span className="text-stone-300">•</span>
          <Link
            to="/collector/register"
            className="text-xs font-bold text-charcoal hover:text-primary flex items-center gap-1"
          >
            Register New Collector
          </Link>
        </div>

        {/* Recycler Portal Info */}
        <div className="p-4 rounded-xl border border-warm-borders bg-surface/50 text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-copper" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">Recycler Yard Portal</h4>
          </div>
          <p className="text-xs leading-relaxed">
            Recyclers manage yard weigh-ins, material verification, and payments via the dedicated <strong>SahiRate Web Portal</strong> (running on desktop/browser).
          </p>
          {/* THis here link corrreted but staged not */}
          <a
            href={PORTAL_BASE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-copper hover:underline mt-1"
          >
            Open Recycler Portal (Web) <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Admin Portal Info */}
        <div className="p-4 rounded-xl border border-warm-borders bg-surface/50 text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">Admin & Compliance Portal</h4>
          </div>
          <p className="text-xs leading-relaxed">
            Platform governance, verification approvals, fraud alerts, and audit logs are managed on the <strong>SahiRate Admin Web Portal</strong>.
          </p>
          <a
            href={PORTAL_BASE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline mt-1"
          >
            Open Admin Portal (Web) <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
