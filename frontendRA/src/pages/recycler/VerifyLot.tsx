import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, QrCode, Scale, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLotById, getRates, createHandover, verifyLot, CURRENT_RECYCLER_ID } from "@/services/api";
import type { Lot, MaterialRate } from "@/types";

export default function VerifyLot() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lot, setLot] = useState<Lot | null>(null);
  const [rates, setRates] = useState<MaterialRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [verifiedMaterial, setVerifiedMaterial] = useState<string>("");
  const [verifiedWeight, setVerifiedWeight] = useState<number>(0);
  const [finalRate, setFinalRate] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        const [lotData, ratesData] = await Promise.all([
          getLotById(id!),
          getRates()
        ]);
        setLot(lotData);
        setRates(ratesData);

        const initialMat = lotData.recycler_verified_material || lotData.material_id;
        setVerifiedMaterial(initialMat);
        setVerifiedWeight(lotData.recycler_weight_kg || lotData.approx_weight_kg);

        const matchingRate = ratesData.find((r) => r.material_id === initialMat);
        const midRate = matchingRate
          ? Math.round((matchingRate.price_min + matchingRate.price_max) / 2)
          : Math.round(lotData.estimated_value / (lotData.approx_weight_kg || 1));
        setFinalRate(midRate);
      } catch (err: any) {
        setError(err.message || "Failed to load verification workspace");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleMaterialChange = (mat: string) => {
    setVerifiedMaterial(mat);
    const matchingRate = rates.find((r) => r.material_id === mat);
    if (matchingRate) {
      setFinalRate(Math.round((matchingRate.price_min + matchingRate.price_max) / 2));
    }
  };

  const finalAmount = Math.round((verifiedWeight || 0) * (finalRate || 0));

  const handleGenerateHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lot) return;
    if (verifiedWeight <= 0) {
      setError("Verified weight must be greater than 0");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // 1. Verify Lot
      await verifyLot(lot.id, {
        recycler_id: CURRENT_RECYCLER_ID,
        verified_material: verifiedMaterial,
        verified_weight_kg: verifiedWeight,
        final_rate: finalRate,
        final_amount: finalAmount,
      });

      // 2. Create Handover session & generate QR reference
      const handover = await createHandover({
        lot_id: lot.id,
        recycler_id: CURRENT_RECYCLER_ID,
        verified_weight_kg: verifiedWeight,
        final_rate: finalRate,
        final_amount: finalAmount,
      });

      // 3. Navigate to Handover screen
      navigate(`/recycler/handover/${handover.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to generate handover session");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[#A8A29E] font-medium text-sm">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF7337]" />
        Loading verification workspace...
      </div>
    );
  }

  if (error && !lot) {
    return (
      <div className="bg-white border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto shadow-sm">
        <p className="font-bold text-red-600 text-sm">{error}</p>
        <Link to="/recycler/lots" className="mt-4 inline-block text-xs font-bold text-[#FF7337] underline">
          Back to Lots
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to={`/recycler/lots/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#78716C] hover:text-[#1C1917] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Lot Details
      </Link>

      <div className="bg-white border border-[#EFE8DC] rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#174C4A] to-[#123C3B] p-7 text-white">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
            Yard Physical Weighment
          </span>
          <h2 className="text-2xl font-black mt-1">Weigh-in & Settlement Calculation</h2>
          <p className="text-xs text-emerald-100/80 mt-1">
            Input verified scale readings to compute algorithmic fair settlement
          </p>
        </div>

        <div className="p-7 sm:p-8">
          <form onSubmit={handleGenerateHandover} className="space-y-6">
            {/* Material Selection */}
            <div>
              <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">
                Confirmed Scrap Material
              </label>
              <select
                value={verifiedMaterial}
                onChange={(e) => handleMaterialChange(e.target.value)}
                className="w-full bg-[#FAF8F3] border border-[#ECE6DA] rounded-2xl px-4 py-3 text-sm font-bold text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#FF7337]"
              >
                {rates.map((r) => (
                  <option key={r.material_id} value={r.material_id}>
                    {r.label} (Benchmark: ₹{r.price_min} - ₹{r.price_max}/{r.unit_label})
                  </option>
                ))}
              </select>
            </div>

            {/* Weight Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  Yard Scale Weight (kg)
                </label>
                <span className="text-[11px] text-[#A8A29E]">
                  Collector claimed: {lot?.approx_weight_kg} kg
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={verifiedWeight}
                onChange={(e) => setVerifiedWeight(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-[#FAF8F3] border border-[#ECE6DA] rounded-2xl px-4 py-3 text-base font-bold text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#FF7337]"
              />
            </div>

            {/* Final Rate Input */}
            <div>
              <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">
                Agreed Rate (₹/kg)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={finalRate}
                onChange={(e) => setFinalRate(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-[#FAF8F3] border border-[#ECE6DA] rounded-2xl px-4 py-3 text-base font-bold text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#FF7337]"
              />
            </div>

            {/* Total Settlement Calculation Card */}
            <div className="bg-[#FAF8F3] border border-[#ECE6DA] rounded-2xl p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Payable Collector Amount</span>
                <p className="text-xs text-[#78716C] mt-0.5 font-medium">{verifiedWeight} kg × ₹{finalRate}/kg</p>
              </div>
              <div className="text-3xl font-black text-[#174C4A] font-mono">
                ₹{finalAmount.toLocaleString()}
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || verifiedWeight <= 0}
              className="w-full rounded-full bg-[#FF7337] hover:bg-[#E55A1F] text-white font-black h-12 text-sm gap-2 shadow-md shadow-[#FF7337]/25"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
              Generate Handover QR Code for Collector Scan
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
