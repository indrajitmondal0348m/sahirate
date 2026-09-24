import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Navigation, 
  Search, 
  ExternalLink,
  Coins,
  Building2,
  CalendarCheck,
  LocateFixed,
  RefreshCw,
  Clock,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/i18n";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";

interface AuthorizedRecycler {
  id: string;
  name: string;
  cpcbId: string;
  state: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  defaultDistanceKm: number;
  computedDistance?: number;
  rating: number;
  phone: string;
  address: string;
  landmark: string;
  operatingHours: string;
  acceptedMaterials: string[];
  pickupAvailable: boolean;
  minWeightKgForPickup: number;
  paymentModes: string[];
  verifiedPartner: boolean;
  status: "Open" | "Intake Ready";
}

const AUTHORIZED_RECYCLERS: AuthorizedRecycler[] = [
  {
    id: "REC-MH-004",
    name: "EcoRecycle Yard #4 (Nagpur Hub)",
    cpcbId: "CPCB/EW/2023/MH-0982",
    state: "Maharashtra",
    city: "Nagpur",
    district: "Nagpur Urban",
    lat: 21.0924,
    lng: 79.0019,
    defaultDistanceKm: 2.4,
    rating: 4.9,
    phone: "+91 98230 44102",
    address: "Plot B-14, Hingna MIDC Industrial Area",
    landmark: "Near Central Electronic Weighbridge Gate 2",
    operatingHours: "08:00 AM - 07:30 PM",
    acceptedMaterials: ["PCB", "BATTERY", "WIRE", "MOTOR"],
    pickupAvailable: true,
    minWeightKgForPickup: 25,
    paymentModes: ["Cash On Spot", "Instant UPI", "Bank Transfer"],
    verifiedPartner: true,
    status: "Intake Ready",
  },
  {
    id: "REC-MH-011",
    name: "Vidarbha Strategic Metals Recovery",
    cpcbId: "SPCB-MH-EW-8821",
    state: "Maharashtra",
    city: "Nagpur",
    district: "Butibori Industrial Corridor",
    lat: 20.9250,
    lng: 78.9800,
    defaultDistanceKm: 5.8,
    rating: 4.8,
    phone: "+91 97654 32180",
    address: "Sector 3, Butibori CETP Complex",
    landmark: "Opposite Power Substation #3",
    operatingHours: "08:30 AM - 08:00 PM",
    acceptedMaterials: ["MOTOR", "PCB", "DISPLAY", "METAL"],
    pickupAvailable: true,
    minWeightKgForPickup: 40,
    paymentModes: ["Cash On Spot", "Instant UPI"],
    verifiedPartner: true,
    status: "Open",
  },
  {
    id: "REC-OR-002",
    name: "Utkal Clean Metals & Refining Yard",
    cpcbId: "CPCB/EW/2024/OR-1102",
    state: "Odisha",
    city: "Bhubaneswar",
    district: "Khordha",
    lat: 20.3150,
    lng: 85.8600,
    defaultDistanceKm: 4.1,
    rating: 4.7,
    phone: "+91 94370 89201",
    address: "Plot 42, Mancheswar Industrial Estate",
    landmark: "Behind Railway Freight Corridor Gate",
    operatingHours: "09:00 AM - 07:00 PM",
    acceptedMaterials: ["BATTERY", "WIRE", "METAL", "PLASTIC"],
    pickupAvailable: true,
    minWeightKgForPickup: 30,
    paymentModes: ["Cash On Spot", "Instant UPI"],
    verifiedPartner: true,
    status: "Open",
  },
  {
    id: "REC-DL-009",
    name: "Apex Circular Secondary Smelter",
    cpcbId: "CPCB/EW/2022/DL-4029",
    state: "Delhi NCR",
    city: "New Delhi",
    district: "West Delhi",
    lat: 28.6300,
    lng: 77.1200,
    defaultDistanceKm: 6.5,
    rating: 4.9,
    phone: "+91 98110 55432",
    address: "Phase II, Mayapuri Industrial Zone",
    landmark: "Near Metal Dismantling Cluster Block C",
    operatingHours: "08:00 AM - 09:00 PM",
    acceptedMaterials: ["PCB", "BATTERY", "MOTOR", "WIRE", "METAL", "DISPLAY", "PLASTIC"],
    pickupAvailable: true,
    minWeightKgForPickup: 30,
    paymentModes: ["Cash On Spot", "Instant UPI", "Direct Jan Dhan A/C"],
    verifiedPartner: true,
    status: "Intake Ready",
  },
  {
    id: "REC-KA-014",
    name: "Deccan Urban Minerals Ltd",
    cpcbId: "SPCB-KA-EW-5519",
    state: "Karnataka",
    city: "Bengaluru",
    district: "Bengaluru Rural",
    lat: 13.0300,
    lng: 77.5100,
    defaultDistanceKm: 8.3,
    rating: 4.8,
    phone: "+91 98450 11920",
    address: "Plot 88, Peenya 2nd Stage",
    landmark: "Adjacent to Precision Tooling Compound",
    operatingHours: "09:00 AM - 06:30 PM",
    acceptedMaterials: ["PCB", "BATTERY", "WIRE", "MOTOR"],
    pickupAvailable: true,
    minWeightKgForPickup: 35,
    paymentModes: ["Instant UPI", "Bank Transfer", "Cash On Spot"],
    verifiedPartner: true,
    status: "Open",
  },
];

// Haversine distance calculator in Kilometers
function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export default function CollectorRecyclers() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [selectedMaterial, setSelectedMaterial] = useState<string>("ALL");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>(" ");
  const [bookedRecycler, setBookedRecycler] = useState<AuthorizedRecycler | null>(null);

  // User live geolocation
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Clean initial search query
  useEffect(() => {
    setSearchQuery("");
  }, []);

  // Safe offline pending lots query that handles schema variations gracefully
  const pendingLots = useLiveQuery(
    async () => {
      try {
        const all = await db.lots.toArray();
        return all.filter((l) => l.status === "available" || l.status === "pending" || l.sync_status === "pending");
      } catch (err) {
        console.warn("Could not query lots for recyclers page:", err);
        return [];
      }
    },
    []
  ) || [];

  // Request device geolocation to compute precise real distances
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    setLocationStatus("Locating nearest recyclers via GPS...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
        setLocationStatus("GPS Location Active • Distances Calibrated");
      },
      (err) => {
        setLocating(false);
        setLocationStatus("GPS permission denied. Showing regional distances.");
        console.warn("GPS error:", err);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Recyclers list with live calculated distances
  const enrichedRecyclers = useMemo(() => {
    return AUTHORIZED_RECYCLERS.map((rec) => {
      const distance = userCoords
        ? computeDistanceKm(userCoords.lat, userCoords.lng, rec.lat, rec.lng)
        : rec.defaultDistanceKm;
      return {
        ...rec,
        computedDistance: distance,
      };
    });
  }, [userCoords]);

  // Filtered & sorted recyclers
  const filteredRecyclers = useMemo(() => {
    return enrichedRecyclers
      .filter((rec) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          rec.name.toLowerCase().includes(query) ||
          rec.city.toLowerCase().includes(query) ||
          rec.district.toLowerCase().includes(query) ||
          rec.address.toLowerCase().includes(query) ||
          rec.cpcbId.toLowerCase().includes(query);

        const matchesCity = selectedCity === "ALL" || rec.city.toLowerCase() === selectedCity.toLowerCase();
        const matchesMaterial = selectedMaterial === "ALL" || rec.acceptedMaterials.includes(selectedMaterial);

        return matchesSearch && matchesCity && matchesMaterial;
      })
      .sort((a, b) => a.computedDistance - b.computedDistance);
  }, [enrichedRecyclers, searchQuery, selectedCity, selectedMaterial]);

  const materialsList = ["ALL", "PCB", "BATTERY", "WIRE", "MOTOR", "METAL", "DISPLAY", "PLASTIC"];
  const citiesList = ["ALL", "Nagpur", "Bhubaneswar", "New Delhi", "Bengaluru"];

  const handleBack = () => {
    navigate("/collector");
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-24 animate-in fade-in">
      {/* Top Header */}
      <header className="flex items-center justify-between py-3 mb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full hover:bg-stone-200"
            title="Back to Collector Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-charcoal" />
          </Button>
          <div>
            <h1 className="text-lg font-black text-charcoal tracking-tight">
              {language === "hi"
                ? "नजदीकी प्रमाणित रीसाइक्लर"
                : language === "mr"
                ? "जवळचे अधिकृत पुनर्वापर केंद्र"
                : language === "bn"
                ? "কাছাকাছি অনুমোদিত রিসাইক্লার"
                : "Authorized Recyclers"}
            </h1>
            <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> CPCB/SPCB Registered Yards (Direct Sale)
            </p>
          </div>
        </div>

        {/* Live GPS calibration button */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleDetectLocation}
          disabled={locating}
          className="rounded-xl border-[#DDD8CC] bg-white text-xs font-bold text-stone-700 hover:text-primary gap-1.5 h-8 px-2.5 shadow-2xs"
        >
          {locating ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" /> : <LocateFixed className="w-3.5 h-3.5 text-primary" />}
          <span>{userCoords ? "GPS Active" : "Detect GPS"}</span>
        </Button>
      </header>

      {/* GPS Status feedback */}
      {locationStatus && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] font-semibold text-amber-900 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>{locationStatus}</span>
        </div>
      )}

      {/* Benefits Banner */}
      <div className="bg-[#FAF8F3] border border-[#DDD8CC] rounded-2xl p-3.5 mb-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
              +66%
            </div>
            <div>
              <p className="text-xs font-black text-charcoal">
                {language === "hi" ? "सीधा रीसाइक्लर को बेचें" : "Direct Yard Handover"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {language === "hi"
                  ? "कांटे में हेराफेरी बंद • मौके पर नकद या UPI भुगतान"
                  : "Verified digital scale • Instant cash or UPI"}
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
            Govt Rule 2022
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            language === "hi"
              ? "रीसाइक्लर, इलाका या शहर खोजें..."
              : "Search yard, industrial area, or city..."
          }
          className="w-full bg-[#FAF8F3] border border-[#DDD8CC] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-charcoal placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
        />
      </div>

      {/* City / Area Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2">
        <span className="text-[10px] font-bold uppercase text-stone-400 shrink-0">City:</span>
        {citiesList.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCity(c)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shrink-0 transition-all ${
              selectedCity === c
                ? "bg-[#174C4A] text-white shadow-xs"
                : "bg-white text-muted-foreground border border-[#DDD8CC] hover:text-charcoal"
            }`}
          >
            {c === "ALL" ? "All Areas" : c}
          </button>
        ))}
      </div>

      {/* Material Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        <span className="text-[10px] font-bold uppercase text-stone-400 shrink-0">Scrap:</span>
        {materialsList.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMaterial(m)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shrink-0 transition-all ${
              selectedMaterial === m
                ? "bg-primary text-white shadow-xs"
                : "bg-white text-muted-foreground border border-[#DDD8CC] hover:text-charcoal"
            }`}
          >
            {m === "ALL" ? (language === "hi" ? "सभी" : "All") : t(`material.${m}` as any) || m}
          </button>
        ))}
      </div>

      {/* Recyclers Count */}
      <div className="flex items-center justify-between px-1 mb-2">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {filteredRecyclers.length} {language === "hi" ? "प्रमाणित केंद्र उपलब्ध" : "Verified Yards Found"}
        </p>
        <span className="text-[10px] text-muted-foreground font-mono">
          {userCoords ? "GPS Live Nearest First" : "Sorted by Distance"}
        </span>
      </div>

      {/* Recycler Cards */}
      <div className="space-y-3">
        {filteredRecyclers.map((rec) => (
          <Card key={rec.id} className="border border-[#DDD8CC] bg-[#FAF8F3] overflow-hidden hover:border-primary/50 transition-all shadow-2xs">
            <CardContent className="p-4 space-y-3">
              {/* Header info */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="font-extrabold text-[15px] text-charcoal tracking-tight">{rec.name}</h2>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">
                      {rec.cpcbId}
                    </span>
                    {rec.verifiedPartner && (
                      <span className="text-[9px] font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                        Verified Partner
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1 bg-white border border-[#DDD8CC] px-2.5 py-1 rounded-xl shadow-2xs">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-black text-charcoal font-mono">
                      {rec.computedDistance} km
                    </span>
                  </div>
                </div>
              </div>

              {/* Exact Location & Landmark in Area */}
              <div className="space-y-1 bg-white/70 p-2.5 rounded-xl border border-[#ECE6DA] text-xs">
                <p className="font-semibold text-charcoal flex items-start gap-1.5">
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-primary mt-0.5" />
                  <span>{rec.address}, <strong className="text-stone-900">{rec.city}</strong></span>
                </p>
                <p className="text-[11px] text-muted-foreground pl-5">
                  <strong className="text-stone-600">Landmark:</strong> {rec.landmark}
                </p>
                <p className="text-[10px] text-stone-500 pl-5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>Hours: {rec.operatingHours}</span>
                </p>
              </div>

              {/* Accepted materials */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Accepted Materials
                </span>
                <div className="flex flex-wrap gap-1">
                  {rec.acceptedMaterials.map((mat) => (
                    <span
                      key={mat}
                      className="text-[10px] font-semibold bg-white border border-[#DDD8CC] px-1.5 py-0.5 rounded text-charcoal"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features: Pickup, Payment Modes */}
              <div className="pt-2 border-t border-[#DDD8CC]/70 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-emerald-800 font-bold">
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cash & UPI on spot</span>
                </div>

                {rec.pickupAvailable ? (
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Free Pickup ≥{rec.minWeightKgForPickup}kg
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Self Drop-off</span>
                )}
              </div>

              {/* Action Buttons: Call, Google Maps, Book */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* 1. Call Yard */}
                <a href={`tel:${rec.phone}`} className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-[11px] font-bold border-[#DDD8CC] bg-white text-charcoal hover:bg-stone-50 px-1"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1 text-primary" />
                    Call
                  </Button>
                </a>

                {/* 2. Google Maps Navigation to exact yard coordinates */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${rec.lat},${rec.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-[11px] font-bold border-[#DDD8CC] bg-white text-charcoal hover:bg-stone-50 px-1"
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1 text-[#174C4A]" />
                    Map
                  </Button>
                </a>

                {/* 3. Book Handover Slot */}
                <Button
                  size="sm"
                  onClick={() => setBookedRecycler(rec)}
                  className="w-full text-[11px] font-bold bg-primary hover:bg-primary/90 text-white shadow-xs px-1"
                >
                  <CalendarCheck className="w-3.5 h-3.5 mr-1" />
                  Book
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRecyclers.length === 0 && (
          <div className="bg-white border border-[#DDD8CC] rounded-2xl p-8 text-center space-y-2">
            <Building2 className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="font-bold text-sm text-charcoal">No recyclers matching your filter</p>
            <p className="text-xs text-muted-foreground">
              Try selecting "All Areas" or changing the scrap material filter.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedCity("ALL");
                setSelectedMaterial("ALL");
                setSearchQuery("");
              }}
              className="mt-2 text-xs font-bold"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Handover Booking Confirmation Modal */}
      {bookedRecycler && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-[#DDD8CC] animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-charcoal">Intake Slot Reserved</h3>
              <p className="text-xs text-muted-foreground font-medium">
                {bookedRecycler.name} has been notified of your upcoming scrap lot handover.
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-[#DDD8CC] p-3.5 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yard CPCB ID:</span>
                <span className="font-mono font-bold text-charcoal">{bookedRecycler.cpcbId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yard Distance:</span>
                <span className="font-bold text-charcoal font-mono">{bookedRecycler.computedDistance} km away</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Area & Landmark:</span>
                <span className="font-medium text-stone-800 text-right max-w-[180px] truncate">
                  {bookedRecycler.landmark}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Assured:</span>
                <span className="font-bold text-emerald-700">Instant Cash / UPI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Ready Lots:</span>
                <span className="font-bold text-primary">{pendingLots.length} lot(s) ready</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
              Show your SahiRate QR code at the weighbridge to record verified weight and instant settlement.
            </p>

            <div className="space-y-2">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                onClick={() => {
                  setBookedRecycler(null);
                  navigate("/collector/scan");
                }}
              >
                Scan Handover QR Now
              </Button>
              <Button
                variant="ghost"
                className="w-full text-xs font-semibold text-muted-foreground"
                onClick={() => setBookedRecycler(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
