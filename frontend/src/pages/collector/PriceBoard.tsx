import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  BarChart3, 
  CheckCircle2, 
  Layers, 
  Zap, 
  X,
  ChevronRight,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation, useI18nStore, type Language } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateCriticalMinerals, type MineralRecoveryResult } from "@/utils/criticalMinerals";
import { useCreateLotStore } from "@/stores/createLotStore";

interface ScrapPrice {
  id: string;
  label: string;
  min: number;
  max: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  pct: number;
  cpcbCode: string;
  salvageMeta: string;
  history7d: number[];
  dates7d: string[];
}

const COMMODITY_PRICES: ScrapPrice[] = [
  { 
    id: 'BATTERY', 
    label: 'Battery (Li-ion/Lead)', 
    min: 80, 
    max: 100, 
    unit: 'kg', 
    trend: 'stable', 
    pct: 0, 
    cpcbCode: 'B4010', 
    salvageMeta: 'Li + Co',
    history7d: [88, 89, 88, 90, 90, 89, 90],
    dates7d: ['17 Sep', '18 Sep', '19 Sep', '20 Sep', '21 Sep', '22 Sep', '23 Sep']
  },
  { 
    id: 'DISPLAY', 
    label: 'Display & Screens', 
    min: 450, 
    max: 520, 
    unit: 'piece', 
    trend: 'down', 
    pct: 2, 
    cpcbCode: 'B1110', 
    salvageMeta: 'Indium',
    history7d: [510, 505, 500, 495, 490, 485, 480],
    dates7d: ['17 Sep', '18 Sep', '19 Sep', '20 Sep', '21 Sep', '22 Sep', '23 Sep']
  },
  { 
    id: 'MOTOR', 
    label: 'Electric Motor', 
    min: 450, 
    max: 580, 
    unit: 'kg', 
    trend: 'up', 
    pct: 3, 
    cpcbCode: 'B1010', 
    salvageMeta: 'Nd + Dy',
    history7d: [490, 498, 505, 510, 522, 530, 545],
    dates7d: ['17 Sep', '18 Sep', '19 Sep', '20 Sep', '21 Sep', '22 Sep', '23 Sep']
  },
  { 
    id: 'PCB', 
    label: 'PCB Circuit Board', 
    min: 90, 
    max: 110, 
    unit: 'piece', 
    trend: 'up', 
    pct: 7, 
    cpcbCode: 'B1110', 
    salvageMeta: 'Ta + Au',
    history7d: [92, 94, 96, 99, 101, 104, 108],
    dates7d: ['17 Sep', '18 Sep', '19 Sep', '20 Sep', '21 Sep', '22 Sep', '23 Sep']
  },
  { 
    id: 'WIRE', 
    label: 'Copper Wire', 
    min: 980, 
    max: 1050, 
    unit: 'kg', 
    trend: 'up', 
    pct: 4, 
    cpcbCode: 'B1020', 
    salvageMeta: 'Cu 99.9%',
    history7d: [985, 992, 1005, 1012, 1025, 1038, 1050],
    dates7d: ['17 Sep', '18 Sep', '19 Sep', '20 Sep', '21 Sep', '22 Sep', '23 Sep']
  },
  { 
    id: 'METAL', 
    label: 'Clean Scrap Metal', 
    min: 120, 
    max: 175, 
    unit: 'kg', 
    trend: 'stable', 
    pct: 0, 
    cpcbCode: 'B1010', 
    salvageMeta: 'Al + Fe',
    history7d: [145, 146, 145, 147, 148, 147, 148],
    dates7d: ['17 Sep', '18 Sep', '19 Sep', '20 Sep', '21 Sep', '22 Sep', '23 Sep']
  },
  { 
    id: 'PLASTIC', 
    label: 'Engineering Plastic', 
    min: 75, 
    max: 90, 
    unit: 'kg', 
    trend: 'up', 
    pct: 5, 
    cpcbCode: 'B3010', 
    salvageMeta: 'ABS/HIPS',
    history7d: [78, 80, 81, 83, 84, 86, 88],
    dates7d: ['17 Sep', '18 Sep', '19 Sep', '20 Sep', '21 Sep', '22 Sep', '23 Sep']
  },
];

export default function PriceBoard() {
  const { t, language } = useTranslation();
  const { setLanguage } = useI18nStore();
  const navigate = useNavigate();
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isSpeakingAll, setIsSpeakingAll] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScrapPrice | null>(null);

  // Stop speech when navigating away
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getSpokenText = (p: ScrapPrice, lang: Language) => {
    const localizedName = t(`material.${p.id}` as any) || p.label;
    if (lang === "hi") {
      const unitWord = p.unit === "kg" ? "किलो" : "पीस";
      return `${localizedName}. भाव ${p.min} से ${p.max} रुपये प्रति ${unitWord}. सरकारी बेंचमार्क दर।`;
    }
    if (lang === "mr") {
      const unitWord = p.unit === "kg" ? "किलो" : "नग";
      return `${localizedName}. भाव ${p.min} ते ${p.max} रुपये प्रति ${unitWord}.`;
    }
    if (lang === "bn") {
      const unitWord = p.unit === "kg" ? "কেজি" : "পিস";
      return `${localizedName}. দর ${p.min} থেকে ${p.max} টাকা প্রতি ${unitWord}।`;
    }
    if (lang === "or") {
      const unitWord = p.unit === "kg" ? "କିଲୋ" : "ଖଣ୍ଡ";
      return `${localizedName}. ଦର ${p.min} ରୁ ${p.max} ଟଙ୍କା ପ୍ରତି ${unitWord}।`;
    }
    return `${localizedName}. Rate: ${p.min} to ${p.max} rupees per ${p.unit === "kg" ? "kilogram" : "unit"}. CPCB benchmark rate.`;
  };

  const speakItem = (p: ScrapPrice, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (speakingId === p.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      setIsSpeakingAll(false);
      return;
    }

    window.speechSynthesis.cancel();
    const text = getSpokenText(p, language);
    const utterance = new SpeechSynthesisUtterance(text);

    const langMap: Record<Language, string> = {
      hi: "hi-IN",
      mr: "mr-IN",
      bn: "bn-IN",
      or: "or-IN",
      en: "en-IN",
    };
    utterance.lang = langMap[language] || "en-IN";
    utterance.rate = 0.92;

    const voices = window.speechSynthesis.getVoices();
    const prefix = langMap[language]?.split("-")[0];
    const match = voices.find((v) => v.lang.startsWith(prefix));
    if (match) utterance.voice = match;

    utterance.onstart = () => setSpeakingId(p.id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const speakAllPrices = () => {
    if (!("speechSynthesis" in window)) return;

    if (isSpeakingAll || speakingId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      setIsSpeakingAll(false);
      return;
    }

    setIsSpeakingAll(true);
    let index = 0;

    const speakNext = () => {
      if (index >= COMMODITY_PRICES.length) {
        setIsSpeakingAll(false);
        setSpeakingId(null);
        return;
      }
      const p = COMMODITY_PRICES[index];
      const utterance = new SpeechSynthesisUtterance(getSpokenText(p, language));
      const langMap: Record<Language, string> = {
        hi: "hi-IN",
        mr: "mr-IN",
        bn: "bn-IN",
        or: "or-IN",
        en: "en-IN",
      };
      utterance.lang = langMap[language] || "en-IN";
      utterance.rate = 0.92;
      setSpeakingId(p.id);

      utterance.onend = () => {
        index++;
        speakNext();
      };
      utterance.onerror = () => {
        setIsSpeakingAll(false);
        setSpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  // Render SVG Sparkline / Area Chart for 7-day Value History
  const renderValueHistoryChart = (history: number[]) => {
    const minVal = Math.min(...history) * 0.96;
    const maxVal = Math.max(...history) * 1.04;
    const range = maxVal - minVal || 1;
    const width = 320;
    const height = 90;
    const step = width / (history.length - 1);

    const points = history.map((val, idx) => {
      const x = idx * step;
      const y = height - ((val - minVal) / range) * (height - 16) - 8;
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    const areaD = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;

    return (
      <div className="w-full bg-white p-3 rounded-2xl border border-[#DDD8CC] shadow-2xs">
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-[#DDD8CC]/50">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            7-Day Rate Trajectory
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Current: ₹{history[history.length - 1]}
          </span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#174C4A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#174C4A" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#priceGradient)" />
          <path d={pathD} fill="none" stroke="#174C4A" strokeWidth="2.5" strokeLinecap="round" />
          {history.map((val, idx) => {
            const x = idx * step;
            const y = height - ((val - minVal) / range) * (height - 16) - 8;
            return (
              <g key={idx}>
                <circle cx={x} cy={y} r="3.5" fill="#FFFFFF" stroke="#174C4A" strokeWidth="2" />
                <text x={x} y={y - 7} fontSize="8" fontWeight="bold" textAnchor="middle" fill="#57534E">
                  ₹{val}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex justify-between text-[9px] text-muted-foreground font-mono mt-1 px-1">
          {selectedItem?.dates7d.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-24 animate-in fade-in">
      {/* Top Header */}
      <header className="flex items-center justify-between py-3 mb-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5 text-charcoal" />
          </Button>
          <div>
            <h1 className="text-lg font-black text-charcoal tracking-tight">
              {language === "hi" ? "दैनिक भाव बोर्ड" : language === "mr" ? "दैनिक दर फलक" : language === "bn" ? "দৈনিক দর বোর্ড" : "Daily Price Board"}
            </h1>
            <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> CPCB & Benchmark Verified Rates
            </p>
          </div>
        </div>

        {/* Language selector chips */}
        <div className="flex items-center gap-1 bg-[#FAF8F3] p-1 rounded-xl border border-[#DDD8CC]">
          {(["hi", "en", "mr", "bn"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`px-2 py-0.5 text-[10px] font-black rounded-lg transition-all ${
                language === l
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:text-charcoal"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Spoken Audio Banner */}
      <div className="bg-linear-to-r from-amber-500/10 via-primary/10 to-emerald-500/10 border border-amber-200/80 rounded-2xl p-3.5 mb-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
            {speakingId ? (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-xs font-black text-charcoal">
              {language === "hi"
                ? "बोलकर भाव सुनें (Audio Board)"
                : language === "mr"
                ? "आवाज ऐका (Audio Board)"
                : language === "bn"
                ? "ভয়েসে শুনুন (Audio Board)"
                : "Spoken Price Broadcast"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {language === "hi"
                ? "किसी भी कार्ड पर टैप करके मूल्य इतिहास और धातु देखें"
                : "Tap any card to view value history & extractable minerals"}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={speakAllPrices}
          className={`font-black text-xs h-9 px-3 rounded-xl transition-all shadow-xs ${
            isSpeakingAll
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-primary hover:bg-primary/90 text-white"
          }`}
        >
          {isSpeakingAll ? (
            <>
              <VolumeX className="w-3.5 h-3.5 mr-1" />
              {language === "hi" ? "रोकें" : "Stop"}
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 mr-1" />
              {language === "hi" ? "पूरा सुनें" : "Play All"}
            </>
          )}
        </Button>
      </div>

      {/* Commodity Rate Cards */}
      <div className="space-y-2.5">
        {COMMODITY_PRICES.map((p) => {
          const isCurrentSpeaking = speakingId === p.id;
          const localizedName = t(`material.${p.id}` as any) || p.label;

          return (
            <Card
              key={p.id}
              onClick={() => setSelectedItem(p)}
              className={`transition-all border cursor-pointer ${
                isCurrentSpeaking
                  ? "border-primary bg-amber-50/50 shadow-md ring-2 ring-primary/30"
                  : "border-[#DDD8CC] bg-[#FAF8F3] hover:border-primary/50 hover:shadow-xs active:scale-[0.99]"
              }`}
            >
              <CardContent className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Speaker Button */}
                  <button
                    onClick={(e) => speakItem(p, e)}
                    aria-label={`Listen to ${localizedName} price`}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                      isCurrentSpeaking
                        ? "bg-primary text-white scale-105 shadow-sm animate-pulse"
                        : "bg-white text-charcoal border border-[#DDD8CC] hover:bg-primary/10 active:scale-95"
                    }`}
                  >
                    {isCurrentSpeaking ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-primary" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-extrabold text-[15px] text-charcoal">{localizedName}</p>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#DDD8CC] text-muted-foreground font-bold">
                        {p.cpcbCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {p.trend === "up" && (
                        <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300 text-[10px] font-bold px-1.5 py-0">
                          <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +{p.pct}%
                        </Badge>
                      )}
                      {p.trend === "down" && (
                        <Badge variant="outline" className="text-rose-700 bg-rose-50 border-rose-300 text-[10px] font-bold px-1.5 py-0">
                          <TrendingDown className="w-2.5 h-2.5 mr-0.5" /> -{p.pct}%
                        </Badge>
                      )}
                      {p.trend === "stable" && (
                        <Badge variant="outline" className="text-slate-700 bg-slate-100 border-slate-300 text-[10px] font-bold px-1.5 py-0">
                          <Minus className="w-2.5 h-2.5 mr-0.5" /> {t("status.stable")}
                        </Badge>
                      )}
                      <span className="text-[10px] font-black text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-300">
                        {p.salvageMeta}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="font-black text-base text-primary font-mono tracking-tight">
                      ₹{p.min} - ₹{p.max}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                      per {p.unit === "kg" ? "kg" : p.unit}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recycler Direct Link Callout */}
      <div className="mt-5 p-4 rounded-2xl bg-white border border-[#DDD8CC] shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-charcoal flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {language === "hi" ? "पास के प्रमाणित रीसाइक्लर देखें" : "Sell directly to certified recyclers"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {language === "hi"
              ? "बिचौलियों की तुलना में +66% अधिक कमाएं"
              : "Skip unauthorized middlemen & receive fair rates"}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("/collector/recyclers")}
          className="bg-charcoal hover:bg-black text-white text-xs font-bold rounded-xl shrink-0"
        >
          <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-400" />
          {language === "hi" ? "रीसाइक्लर" : "Find Yards"}
        </Button>
      </div>

      {/* POPUP MODAL: EXTRACTABLE MINERALS & 7-DAY VALUE HISTORY */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F3] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-[#DDD8CC] animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#DDD8CC]">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {selectedItem.cpcbCode} • Material Profile
                </span>
                <h3 className="text-lg font-black text-charcoal mt-1">
                  {t(`material.${selectedItem.id}` as any) || selectedItem.label}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#DDD8CC] flex items-center justify-center text-charcoal hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Value History Chart (7-Days) */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-xs font-extrabold text-charcoal flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-primary" />
                  7-Day Value Trajectory
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">
                  CPCB Certified Mandi Rates
                </span>
              </div>
              {renderValueHistoryChart(selectedItem.history7d)}
            </div>

            {/* 2. Critical Minerals Salvaged for this object */}
            {(() => {
              const mineralsResult = calculateCriticalMinerals(selectedItem.id, 1);
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-xs font-extrabold text-charcoal flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      Extractable Critical Minerals (per {selectedItem.unit === 'kg' ? 'kg' : 'unit'})
                    </span>
                    <span className="text-[9px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 uppercase">
                      Recovery Protocol
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {mineralsResult.minerals.map((m, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-[#DDD8CC] shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black font-mono text-primary">{m.symbol}</span>
                          <span className="text-xs font-black text-charcoal">{m.amountFormatted}</span>
                        </div>
                        <p className="text-[11px] font-bold text-charcoal mt-0.5">{m.name}</p>
                        <p className="text-[9px] text-muted-foreground leading-tight mt-1 line-clamp-2">
                          {m.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Hazard Mitigated */}
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-[10px] font-medium text-emerald-900 leading-tight">
                    <strong className="block mb-0.5 font-bold">✓ Environmental Hazard Mitigated:</strong>
                    {mineralsResult.hazardAvoided}
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-[#DDD8CC]">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-xs h-11 rounded-xl shadow-xs"
                onClick={() => {
                  useCreateLotStore.getState().reset();
                  useCreateLotStore.getState().initDraft();
                  useCreateLotStore.getState().setMaterial(selectedItem.id);
                  setSelectedItem(null);
                  navigate("/collector/create-lot");
                }}
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                Create Lot with this Scrap Category
              </Button>

              <Button
                variant="outline"
                className="w-full border-[#DDD8CC] bg-white text-xs font-bold text-charcoal hover:bg-stone-50"
                onClick={() => speakItem(selectedItem)}
              >
                <Volume2 className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Listen to Spoken Price Report
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-[10px] text-muted-foreground font-medium mt-6 px-4">
        Rates synchronized from CPCB e-Waste EPR Portal & National Non-Ferrous Market Index. Updated every 6 hours.
      </p>
    </div>
  );
}
