import AudioGuidance from "@/components/AudioGuidance";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Cpu,
  Cable,
  Battery,
  Monitor,
  CheckCircle2,
  Camera,
  RefreshCw,
  Box,
  Image as ImageIcon,
  Cog,
  Layers,
  Recycle,
  Edit3,
  Plus,
  Trash2,
  ArrowRight,
  Check,
  Sparkles,
  Atom,
  Leaf
} from "lucide-react";
import { useCreateLotStore, type LotItemDraft } from "@/stores/createLotStore";
import { createLocalLot } from "@/services/lots";
import { db } from "@/db/dexie";
import { compressImageForLocalDb } from "@/utils/image";
import { useAudio } from "@/hooks/useAudio";
import { useSyncStore } from "@/stores/syncStore";
import { useTranslation } from "@/i18n";
import { calculateCriticalMinerals } from "@/utils/criticalMinerals";

const MATERIALS = [
  { id: "BATTERY", label: "Battery", icon: Battery, min: 80, max: 100, unit: "kg", unitLabel: "kg" },
  { id: "DISPLAY", label: "Display", icon: Monitor, min: 450, max: 520, unit: "piece", unitLabel: "display" },
  { id: "MOTOR", label: "Motor", icon: Cog, min: 450, max: 580, unit: "kg", unitLabel: "kg" },
  { id: "PCB", label: "PCB", icon: Cpu, min: 90, max: 110, unit: "piece", unitLabel: "board" },
  { id: "WIRE", label: "Wire", icon: Cable, min: 980, max: 1050, unit: "kg", unitLabel: "kg" },
  { id: "METAL", label: "Metal", icon: Layers, min: 120, max: 175, unit: "kg", unitLabel: "kg" },
  { id: "PLASTIC", label: "Plastic", icon: Recycle, min: 75, max: 90, unit: "kg", unitLabel: "kg" },
  { id: "CABLE", label: "Wire", icon: Cable, min: 980, max: 1050, unit: "kg", unitLabel: "kg" },
];

function ProgressIndicator({ currentStep }: { currentStep: string }) {
  const { t } = useTranslation();
  const steps = [
    { id: "ai_scan", label: t("collector.create.capture") || "Capture" },
    { id: "material", label: t("collector.create.identify") || "Identify" },
    { id: "weight", label: t("collector.create.weight") || "Weight" },
    { id: "confirm", label: t("collector.create.slip") || "Slip" }
  ];
  let currentIndex = steps.findIndex(s => s.id === currentStep);
  if (currentStep === "material") currentIndex = 1;
  if (currentStep === "ai_scan") currentIndex = 0;

  return (
    <div className="flex flex-col items-center mb-5 w-full px-2">
      <div className="flex justify-between w-full relative">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-warm-borders -z-10 -translate-y-1/2"></div>
        {steps.map((s, idx) => {
          const isActive = idx === currentIndex;
          const isPast = idx < currentIndex;
          return (
            <div key={s.id} className="flex flex-col items-center gap-1 bg-background px-1">
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${isActive ? 'bg-primary ring-4 ring-primary/20' : isPast ? 'bg-primary' : 'bg-warm-borders'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : isPast ? 'text-charcoal' : 'text-muted-foreground'}`}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AiScanStep() { 
  const { playAudio } = useAudio(); 
  const { t } = useTranslation();
  const { 
    draft_id, setStep, setMaterial, setActiveItemMaterialId,
    items, removeItem, approx_weight_kg, estimated_value,
    aiResult, aiError, previewUri, processing, setAiState
  } = useCreateLotStore();
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const processIdRef = useRef<number>(0);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !draft_id) return;
    
    const currentProcessId = ++processIdRef.current;
    
    let savedDataUri: string | null = null;
    try {
      setAiState({ processing: true, aiError: false, aiResult: null });
      const dataUri = await compressImageForLocalDb(file);
      savedDataUri = dataUri;

      await db.transaction("rw", db.photos, async () => {
        await db.photos.where("lot_id").equals(draft_id).delete();
        await db.photos.add({
          id: uuidv4(),
          lot_id: draft_id,
          data_uri: dataUri,
          created_at_local: new Date().toISOString(),
        });
      });

      if (processIdRef.current !== currentProcessId) return;
      setAiState({ previewUri: dataUri });

      const { classifyMaterial } = await import("@/services/ai/inference");
      const result = await classifyMaterial(file);
      
      if (processIdRef.current !== currentProcessId) return;
      
      if (result) {
        setAiState({ aiResult: result });
      } else {
        setAiState({ aiError: true });
      }
    } catch (err) {
      console.error("Failed to compress/save/infer image:", err);
      if (processIdRef.current === currentProcessId) {
        setAiState({ aiError: true });
        if (!savedDataUri) {
          setAiState({ previewUri: null });
        }
      }
    } finally {
      if (processIdRef.current === currentProcessId) {
        setAiState({ processing: false });
      }
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  // Build unified detected items list (primary detected + other materials detected)
  const primaryItem = aiResult
    ? {
        materialId: (aiResult.materialId || "PLASTIC").toUpperCase(),
        materialLabel: aiResult.material || aiResult.detections?.[0]?.className || "Plastic",
        confidencePercent: aiResult.confidencePercent || 80,
        isPrimary: true,
      }
    : null;

  const otherItems = (aiResult?.otherMaterials || []).map((om: any) => ({
    materialId: om.materialId.toUpperCase(),
    materialLabel: om.material,
    confidencePercent: om.confidencePercent,
    isPrimary: false,
  }));

  const allDetected = primaryItem
    ? [primaryItem, ...otherItems.filter((o) => o.materialId !== primaryItem.materialId)]
    : [];

  const handleConfigureMaterial = (matId: string) => {
    setActiveItemMaterialId(matId);
    setMaterial(matId);
    setStep("weight");
  };

  return (
    <div className="space-y-5 flex flex-col animate-in fade-in slide-in-from-right-4">
      <h2 className="text-2xl font-extrabold text-charcoal">{t("collector.create.photograph_scrap")}</h2>
      <AudioGuidance audioKey="collector.create.take_photo" />

      {!previewUri ? (
        <div className="flex flex-col gap-4 w-full mt-2">
          <Button
            size="lg"
            className="w-full h-32 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg flex gap-3 active:scale-[0.98] transition-transform"
            onClick={() => cameraInputRef.current?.click()}
            disabled={processing}
          >
            <Camera className="w-8 h-8" />
            <span className="font-bold text-xl">{t("collector.create.take_photo")}</span>
          </Button>

          <Button
            variant="outline"
            className="h-16 text-lg w-full border-2 border-warm-borders text-charcoal hover:bg-surface/80 rounded-xl flex gap-2 active:scale-[0.98] transition-transform"
            onClick={() => galleryInputRef.current?.click()}
            disabled={processing}
          >
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
            {t("collector.create.choose_gallery")}
          </Button>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              className="text-muted-foreground hover:text-charcoal font-medium text-xs"
              onClick={() => setStep("material")}
            >
              {t("collector.create.choose_manually")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {/* Captured Image Box with Bounding Box Overlays */}
          <div className="relative w-full h-[180px] rounded-2xl overflow-hidden bg-charcoal shadow-md border-2 border-warm-borders">
            <img
              src={aiResult?.overlayUri || previewUri}
              alt={t("collector.create.photograph_scrap")}
              className="w-full h-full object-cover"
            />
            
            {processing && (
              <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 border-4 border-white/20 border-t-copper rounded-full animate-spin mb-3" />
                <p className="font-bold tracking-wide">{t("collector.create.analyzing")}</p>
                <p className="text-[10px] text-white/70 mt-2 uppercase tracking-widest">{t("collector.create.ai_material_check")}</p>
              </div>
            )}
          </div>

          {!processing && aiResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Multi-Component Detected Scrap Card */}
              <div className="bg-surface border-2 border-warm-borders rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-warm-borders pb-2">
                  <div>
                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                      {t("collector.create.ai_material_check") || "AI SCRAP OBJECTS DETECTED"}
                    </p>
                    <span className="text-xs font-bold text-charcoal">
                      Configure weight / quantity for each item:
                    </span>
                  </div>
                  <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono">
                    {allDetected.length} Detected
                  </span>
                </div>

                {/* List of Detected Components */}
                <div className="space-y-2.5">
                  {allDetected.map((item, idx) => {
                    const itemDraft = items.find(
                      (i) => i.material_id.toUpperCase() === item.materialId.toUpperCase()
                    );
                    const matMeta = MATERIALS.find((m) => m.id === item.materialId);
                    const isPiece = matMeta?.unit === "piece";
                    const unitLabel = matMeta?.unitLabel || (isPiece ? "display" : "kg");

                    if (itemDraft) {
                      // Already entered weight/quantity
                      return (
                        <div
                          key={idx}
                          className="bg-emerald-50/90 border-2 border-emerald-300 rounded-xl p-3 flex items-center justify-between shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black">
                              <Check className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-sm text-emerald-950 uppercase">
                                  {t(`material.${item.materialId}` as any) || item.materialLabel}
                                </span>
                                <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-black">
                                  ADDED
                                </span>
                              </div>
                              <p className="text-xs font-bold text-emerald-800 font-mono mt-0.5">
                                {itemDraft.weight_or_count} {itemDraft.unitLabel} • ₹{itemDraft.estimated_value.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConfigureMaterial(item.materialId)}
                              className="h-8 px-2.5 text-xs font-bold bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItem(item.materialId)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    // Awaiting weight/quantity entry
                    return (
                      <div
                        key={idx}
                        className="bg-white border-2 border-warm-borders hover:border-primary/60 rounded-xl p-3 flex items-center justify-between shadow-2xs transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-charcoal uppercase">
                              {t(`material.${item.materialId}` as any) || item.materialLabel}
                            </span>
                            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">
                              {item.confidencePercent}% {t("collector.create.confidence") || "confidence"}
                            </span>
                            {item.isPrimary && (
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                                Top Match
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Benchmark: ₹{matMeta?.min || 80}–{matMeta?.max || 100} / {unitLabel}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleConfigureMaterial(item.materialId)}
                          className="bg-primary hover:bg-primary/90 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs active:scale-95 flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Enter {isPiece ? "Qty" : "Weight"}</span>
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Button to manually add any other component */}
                <Button
                  variant="outline"
                  onClick={() => setStep("material")}
                  className="w-full h-11 border-dashed border-2 border-warm-borders-dark text-charcoal hover:bg-surface rounded-xl flex items-center justify-center gap-2 text-xs font-bold mt-1"
                >
                  <Plus className="w-4 h-4 text-primary" />
                  <span>+ Add Other Scrap Component Manually</span>
                </Button>
              </div>

              {/* Composite Collection Lot Summary Box */}
              {items.length > 0 ? (
                <div className="bg-primary/5 border-2 border-primary/30 rounded-2xl p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                        Collection Lot Ready
                      </span>
                      <h4 className="text-sm font-black text-charcoal">
                        {items.length} Component{items.length > 1 ? "s" : ""} Recorded
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Est. Value</span>
                      <p className="text-2xl font-black text-primary font-mono leading-none">
                        ₹{(estimated_value || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-primary/20">
                    {items.map((it, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold bg-white border border-primary/20 px-2 py-0.5 rounded-lg text-charcoal font-mono"
                      >
                        {it.material_id}: {it.weight_or_count} {it.unitLabel}
                      </span>
                    ))}
                  </div>

                  <Button
                    size="lg"
                    onClick={() => setStep("confirm")}
                    className="w-full h-13 text-base font-black bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md shadow-primary/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                  >
                    <span>Create Collection Lot ({items.length} Items)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 text-center">
                  👉 Click <strong>"Enter Weight"</strong> on any detected scrap object above to begin recording your lot.
                </div>
              )}
            </div>
          )}

          {!processing && (aiError || !aiResult) && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-4 shadow-sm animate-in fade-in">
              <p className="font-bold text-amber-900 text-lg">{t("collector.create.no_material_detected")}</p>
              <div className="flex flex-col gap-3 pt-2">
                <Button size="lg" className="h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold" onClick={() => setAiState({ previewUri: null, aiResult: null, aiError: false })}>
                  {t("collector.create.try_again")}
                </Button>
                <Button size="lg" variant="outline" className="h-14 bg-white border-amber-200 text-amber-800 hover:bg-amber-100 rounded-xl font-bold" onClick={() => setStep("material")}>
                  {t("collector.create.choose_manually")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={handleCapture} />
      <input type="file" accept="image/*" ref={galleryInputRef} className="hidden" onChange={handleCapture} />
    </div>
  );
}

function MaterialStep() { 
  const { t } = useTranslation();
  const { setMaterial, setActiveItemMaterialId, setStep } = useCreateLotStore();
  
  const handleSelect = (matId: string) => {
    setActiveItemMaterialId(matId);
    setMaterial(matId);
    setStep("weight");
  };

  return (
    <div className="space-y-6 flex flex-col animate-in fade-in slide-in-from-right-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-charcoal">{t("collector.create.choose_material")}</h2>
        <Button variant="ghost" size="sm" onClick={() => setStep("ai_scan")} className="text-xs font-bold text-primary">
          Back
        </Button>
      </div>
      <AudioGuidance audioKey="collector.create.choose_material" />
      <div className="grid grid-cols-2 gap-3.5">
        {MATERIALS.map((m) => (
          <Card
            key={m.id}
            className="cursor-pointer border-2 border-warm-borders hover:border-primary active:scale-[0.98] transition-transform bg-surface shadow-sm rounded-2xl"
            onClick={() => handleSelect(m.id)}
          >
            <CardContent className="flex flex-col items-center justify-center p-5 gap-2.5">
              <m.icon className="w-9 h-9 text-primary" />
              <span className="font-bold text-charcoal text-sm text-center">
                {t(`material.${m.id}` as any) || m.label}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                ₹{m.min}–{m.max}/{m.unitLabel}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WeightStep() { 
  const { playAudio } = useAudio(); 
  const { t } = useTranslation();
  const { activeItemMaterialId, material_id, items, addItem, setStep } = useCreateLotStore();
  
  const targetMatId = (activeItemMaterialId || material_id || "PLASTIC").toUpperCase();
  const material = MATERIALS.find((m) => m.id === targetMatId) || MATERIALS[0];
  const isPiece = material?.unit === "piece";
  const unitLabel = material?.unitLabel || (isPiece ? "display" : "kg");

  // Check if item was already entered to pre-fill
  const existingItem = items.find((i) => i.material_id.toUpperCase() === targetMatId);
  const [val, setVal] = useState(existingItem ? existingItem.weight_or_count.toString() : "");

  const MAX_WEIGHT = 9999; 

  const handlePad = (num: string) => {
    setVal((v) => {
      if (num === "." && v.includes(".")) return v;
      if (num === "." && v === "") return "0.";

      const newVal = v + num;
      if (parseFloat(newVal) > MAX_WEIGHT) return v;
      if (newVal.includes(".") && newVal.split(".")[1].length > 2) return v;
      return newVal;
    });
  };
  
  const handleAdd = (num: number) => {
    setVal((v) => {
      const current = parseFloat(v) || 0;
      const next = current + num;
      if (next > MAX_WEIGHT) return v;
      return next.toString();
    });
  };

  const handleDel = () => setVal((v) => v.slice(0, -1));

  const parsedWeight = parseFloat(val);
  const isValid = val !== "" && !isNaN(parsedWeight) && parsedWeight > 0 && parsedWeight <= MAX_WEIGHT && !val.endsWith(".");

  const avgPrice = material ? Math.round((material.min + material.max) / 2) : 0;
  const estimatedValue = isValid ? Math.round(avgPrice * parsedWeight) : 0;

  const handleSaveAndReturn = () => {
    if (!isValid) return;
    addItem({
      material_id: material.id,
      label: material.label,
      weight_or_count: parsedWeight,
      unit: material.unit,
      unitLabel: unitLabel,
      estimated_value: estimatedValue,
    });
    // Return back to collection review screen
    setStep("ai_scan");
  };

  return (
    <div className="space-y-4 flex flex-col items-center animate-in fade-in slide-in-from-right-4 pb-4 w-full">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-charcoal tracking-tight">
          {isPiece ? "Enter Quantity" : (t("collector.create.enter_weight") || "Enter Weight")}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep("ai_scan")}
          className="text-xs font-bold text-muted-foreground hover:text-charcoal"
        >
          Cancel
        </Button>
      </div>
      <AudioGuidance audioKey="collector.create.enter_weight" />
      
      <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
        {material && <material.icon className="w-4 h-4" />}
        <span className="text-xs uppercase tracking-widest">
          {t(`material.${material?.id}` as any) || material?.label}
        </span>
      </div>

      <div className="w-full bg-[#0A2928] text-[#E0F2F1] rounded-2xl p-4 shadow-inner border border-charcoal relative overflow-hidden flex flex-col justify-between h-[110px]">
        <div className="flex justify-between text-[10px] font-bold text-[#E0F2F1]/60 uppercase tracking-widest">
          <span>{isPiece ? "Mode: Count" : "Mode: Weight"}</span>
          <span>Benchmark: ₹{avgPrice}/{unitLabel}</span>
        </div>
        <div className="text-right flex items-baseline justify-end gap-2">
          <span className="text-sm font-bold text-[#E0F2F1]/60 uppercase tracking-widest pb-1">
            {isPiece ? "Count" : "Net"}
          </span>
          <span className="text-[40px] leading-none font-bold font-mono">{val || "0"}</span> 
          <span className="text-lg font-medium text-[#E0F2F1]/60">{unitLabel}</span>
        </div>
      </div>

      {/* 3-Box Calculation Summary */}
      <div className="grid grid-cols-3 gap-2 w-full">
        <div className="bg-white p-2.5 rounded-xl border-2 border-warm-borders flex flex-col justify-between items-center text-center shadow-xs">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
            {isPiece ? "Count" : "Mass"}
          </span>
          <div className="my-0.5">
            <span className="text-lg font-extrabold text-charcoal font-mono leading-none">
              {val || "0"}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground ml-0.5">
              {unitLabel}
            </span>
          </div>
          <span className="text-[9px] font-medium text-muted-foreground">
            {isPiece ? "Quantity" : "Net Weight"}
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-xl border-2 border-warm-borders flex flex-col justify-between items-center text-center shadow-xs">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
            Market Rate
          </span>
          <div className="my-0.5">
            <span className="text-lg font-extrabold text-charcoal font-mono leading-none">
              ₹{avgPrice}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground ml-0.5">
              /{unitLabel}
            </span>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground truncate max-w-full">
            ₹{material?.min}–{material?.max}
          </span>
        </div>

        <div className="bg-primary/5 p-2.5 rounded-xl border-2 border-primary/30 flex flex-col justify-between items-center text-center shadow-xs">
          <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
            Est. Value
          </span>
          <div className="my-0.5">
            <span className="text-lg font-extrabold text-primary font-mono leading-none">
              ₹{estimatedValue.toLocaleString()}
            </span>
          </div>
          <span className="text-[9px] font-mono text-primary/80 truncate max-w-full">
            {isValid ? `₹${Math.round((material?.min || avgPrice) * parsedWeight)}–${Math.round((material?.max || avgPrice) * parsedWeight)}` : "Qty × Rate"}
          </span>
        </div>
      </div>

      {/* Preset Increments */}
      <div className="flex w-full gap-2">
        <Button variant="outline" className="flex-1 h-10 border-warm-borders text-primary font-bold bg-primary/5 hover:bg-primary/10 active:scale-95 text-xs" onClick={() => handleAdd(1)}>+1 {unitLabel}</Button>
        <Button variant="outline" className="flex-1 h-10 border-warm-borders text-primary font-bold bg-primary/5 hover:bg-primary/10 active:scale-95 text-xs" onClick={() => handleAdd(5)}>+5 {unitLabel}</Button>
        <Button variant="outline" className="flex-1 h-10 border-warm-borders text-primary font-bold bg-primary/5 hover:bg-primary/10 active:scale-95 text-xs" onClick={() => handleAdd(10)}>+10 {unitLabel}</Button>
      </div>

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <Button
            key={n}
            variant="outline"
            className="h-[52px] text-xl font-bold bg-surface border-warm-borders hover:bg-warm-borders text-charcoal rounded-xl active:scale-[0.96] transition-transform shadow-xs"
            onClick={() => handlePad(n.toString())}
          >
            {n}
          </Button>
        ))}
        <Button
          variant="outline"
          className="h-[52px] text-xl font-bold bg-surface border-warm-borders hover:bg-warm-borders text-charcoal rounded-xl active:scale-[0.96] transition-transform shadow-xs"
          onClick={() => handlePad(".")}
        >
          .
        </Button>
        <Button
          variant="outline"
          className="h-[52px] text-xl font-bold bg-surface border-warm-borders hover:bg-warm-borders text-charcoal rounded-xl active:scale-[0.96] transition-transform shadow-xs"
          onClick={() => handlePad("0")}
        >
          0
        </Button>
        <Button
          variant="outline"
          className="h-[52px] text-lg font-bold bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 rounded-xl active:scale-[0.96] transition-transform shadow-xs"
          onClick={handleDel}
        >
          ⌫
        </Button>
      </div>

      {/* Save Item & Return to Collection Button */}
      <Button
        size="lg"
        className="w-full h-14 mt-1 text-base font-black tracking-wide bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        disabled={!isValid}
        onClick={handleSaveAndReturn}
      >
        <Check className="w-5 h-5" />
        <span>Save {material?.label} & Return to Collection</span>
      </Button>
    </div>
  );
}

function ConfirmStep() { 
  const { playAudio } = useAudio(); 
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    draft_id,
    material_id,
    approx_weight_kg,
    estimated_value,
    estimated_min,
    estimated_max,
    asking_price,
    setAskingPrice,
    items,
    reset
  } = useCreateLotStore();
  const { isOnline } = useSyncStore();
  const [saving, setSaving] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const [customPrice, setCustomPrice] = useState<number>(
    asking_price || estimated_value || 0
  );

  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (draft_id) {
      db.photos.where("lot_id").equals(draft_id).first().then(p => {
        if (p) setPhotoUri(p.data_uri);
      });
    }
  }, [draft_id]);

  useEffect(() => {
    if (!asking_price && estimated_value) {
      setCustomPrice(estimated_value);
      setAskingPrice(estimated_value);
    }
  }, [estimated_value, asking_price, setAskingPrice]);

  const minRange = estimated_min || Math.round((estimated_value || 0) * 0.94);
  const maxRange = estimated_max || Math.round((estimated_value || 0) * 1.07);

  const handlePriceChange = (val: number) => {
    const p = Math.max(0, Math.round(val));
    setCustomPrice(p);
    setAskingPrice(p);
  };

  const handleFinish = async () => {
    setSaving(true);
    const finalAsking = customPrice || asking_price || estimated_value || 0;
    const finalMin = minRange;
    const finalMax = maxRange;

    const richItems = items.map((i) => ({
      material_id: i.material_id,
      material: i.label || i.material_id,
      label: i.label || i.material_id,
      weight_or_count: i.weight_or_count,
      weight: i.weight_or_count,
      unit: i.unit,
      unitLabel: i.unitLabel,
      estimated_value: i.estimated_value,
    }));

    await createLocalLot(
      {
        material_id: material_id || (items.length > 0 ? items[0].material_id : "SCRAP_LOT"),
        approx_weight_kg: approx_weight_kg || 1,
        estimated_value: finalAsking,
        asking_price: finalAsking,
        estimated_min: finalMin,
        estimated_max: finalMax,
        items: richItems,
        extra_data: {
          items: richItems,
          asking_price: finalAsking,
          estimated_min: finalMin,
          estimated_max: finalMax,
          offer_status: "AVAILABLE",
        },
      },
      draft_id!,
    );
    setSaving(false);
    setSavedLocally(true);
    
    setTimeout(() => {
      navigate("/collector/history");
      setTimeout(() => reset(), 100);
    }, 2000);
  };

  // Composite Critical Minerals calculation across all recorded components
  const compositeMinerals = calculateCriticalMinerals(
    material_id || "PCB",
    approx_weight_kg || 2,
    items
  );

  if (savedLocally) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="w-12 h-12 text-success" />
        </div>
        <h2 className="text-3xl font-extrabold text-charcoal text-center tracking-tight">
          {t("collector.create.ready_to_save") || "Lot Created Successfully"}
        </h2>
        
        <Card className="w-full bg-[#FAF8F3] border border-[#DDD8CC] shadow-sm rounded-xl p-4">
          <div className="flex justify-between items-center text-charcoal font-bold">
            <span className="font-mono text-primary">#{draft_id}</span>
            <span>~{approx_weight_kg} kg</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {items.length > 0 ? `${items.length} materials itemized` : material_id}
          </div>
          <div className="text-primary font-mono font-bold text-xl mt-2 text-right">
            Asking Price: ₹{customPrice.toLocaleString()}
          </div>
        </Card>
        
        <p className="text-center text-sm font-bold text-muted-foreground bg-surface px-4 py-2 rounded-full border border-warm-borders">
          {isOnline ? (t("collector.sync_center.sync_now") || "Syncing with FastAPI...") : (t("collector.sync_center.auto_sync_desc") || "Stored offline in local database")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 flex flex-col animate-in fade-in slide-in-from-right-4 pb-6">
      <h2 className="text-2xl font-extrabold text-charcoal text-center">{t("collector.create.ready_to_save")}</h2>
      <AudioGuidance audioKey="collector.create.ready_to_save" />
      
      <div className="w-full bg-[#FAF8F3] border border-[#DDD8CC] shadow-sm rounded-2xl relative mx-auto overflow-hidden">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="text-center">
            <h3 className="font-extrabold text-xl text-primary tracking-tight uppercase">SahiRate Lot Slip</h3>
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DDD8CC] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Unique Lot ID:</span>
              <span className="text-xs font-mono font-black text-primary">{draft_id}</span>
            </div>
          </div>

          {/* Recorded Items Breakdown */}
          <div className="border-t-2 border-dashed border-[#CBC5B4] pt-4 space-y-2">
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              Recorded Scrap Components ({items.length || 1})
            </p>
            {items.length > 0 ? (
              <div className="divide-y divide-warm-borders/60 bg-white rounded-xl border border-warm-borders p-2.5">
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 text-xs">
                    <span className="font-extrabold text-charcoal uppercase">
                      {it.label || t(`material.${it.material_id}` as any) || it.material_id}
                    </span>
                    <div className="font-mono text-right">
                      <span className="text-muted-foreground mr-2 font-semibold">
                        {it.weight_or_count} {it.unitLabel}
                      </span>
                      <span className="font-extrabold text-primary">
                        ₹{it.estimated_value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-between items-center text-sm font-bold text-charcoal">
                <span>{material_id}</span>
                <span>{approx_weight_kg} kg</span>
              </div>
            )}
          </div>

          {photoUri && (
            <div className="flex justify-between items-center pb-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Scrap Photo</p>
              <img src={photoUri} className="w-16 h-12 object-cover rounded-lg border border-[#DDD8CC]" alt="thumbnail" />
            </div>
          )}

          {/* Extractable Strategic Minerals for this collection */}
          <div className="border-t-2 border-dashed border-[#CBC5B4] pt-3.5 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
              <span className="uppercase tracking-wider flex items-center gap-1 text-charcoal font-extrabold">
                <Atom className="w-3.5 h-3.5 text-primary" /> Extractable Critical Minerals:
              </span>
              <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase">
                Recovery Benchmark
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {compositeMinerals.minerals.map((m, idx) => (
                <div key={idx} className="bg-white border border-[#DDD8CC] px-2 py-1 rounded-lg text-[10px] font-bold shadow-2xs flex items-center gap-1">
                  <span className="w-4 h-4 rounded bg-primary/10 text-primary flex items-center justify-center font-mono text-[9px] font-black">
                    {m.symbol}
                  </span>
                  <span className="text-charcoal font-semibold">{m.name}:</span>
                  <span className="text-primary font-mono font-black">{m.amountFormatted}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fair Value Range & Collector Asking Price Negotiation */}
          <div className="border-t-2 border-dashed border-[#CBC5B4] pt-4 space-y-3">
            <div className="bg-white p-3.5 rounded-xl border border-warm-borders space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Estimated Fair Value Range:</span>
                <span className="font-mono font-bold text-charcoal bg-surface px-2 py-0.5 rounded border border-warm-borders">
                  ₹{minRange.toLocaleString()} – ₹{maxRange.toLocaleString()}
                </span>
              </div>

              <div className="pt-2 border-t border-warm-borders/60 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-black uppercase text-charcoal block">Your Asking Price</span>
                    <span className="text-[10px] text-muted-foreground">Type custom price or use buttons below</span>
                  </div>
                </div>

                {/* Direct Editable Asking Price Input */}
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 font-mono font-black text-stone-400 text-lg select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={customPrice || ""}
                    onChange={(e) => handlePriceChange(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2 bg-[#FAF8F3] border-2 border-primary/40 focus:border-primary rounded-xl text-xl font-black font-mono text-primary outline-none transition-colors"
                    placeholder="Enter asking price"
                  />
                </div>

                {/* Quick adjustment buttons (+10 / -10 and +50 / -50) */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handlePriceChange(Math.max(10, customPrice - 50))}
                    className="px-2.5 py-1.5 text-xs font-bold bg-[#FAF8F3] hover:bg-stone-200 text-charcoal rounded-lg border border-[#DDD8CC] transition-colors"
                  >
                    - ₹50
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePriceChange(Math.max(10, customPrice - 10))}
                    className="flex-1 py-1.5 text-xs font-black bg-[#FAF8F3] hover:bg-stone-200 text-primary rounded-lg border border-[#DDD8CC] transition-colors"
                  >
                    - ₹10
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePriceChange(estimated_value || 0)}
                    className="px-2.5 py-1.5 text-[11px] font-bold bg-white hover:bg-stone-100 text-stone-600 rounded-lg border border-[#DDD8CC] transition-colors"
                  >
                    Reset (₹{(estimated_value || 0).toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePriceChange(customPrice + 10)}
                    className="flex-1 py-1.5 text-xs font-black bg-[#FAF8F3] hover:bg-stone-200 text-primary rounded-lg border border-[#DDD8CC] transition-colors"
                  >
                    + ₹10
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePriceChange(customPrice + 50)}
                    className="px-2.5 py-1.5 text-xs font-bold bg-[#FAF8F3] hover:bg-stone-200 text-charcoal rounded-lg border border-[#DDD8CC] transition-colors"
                  >
                    + ₹50
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#EAE4D5] p-4 border-t border-[#DDD8CC] flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 bg-white text-charcoal border-[#CBC5B4] font-bold text-xs rounded-xl"
            onClick={() => useCreateLotStore.getState().setStep("ai_scan")}
          >
            ← Add / Edit Items
          </Button>
          <Button
            size="lg"
            className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md"
            disabled={saving}
            onClick={handleFinish}
          >
            {saving ? (t("collector.create.saving") || "Saving...") : (t("collector.create.confirm_save") || "Confirm & Save")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CreateLotWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const step = useCreateLotStore((s) => s.step);
  const initDraft = useCreateLotStore((s) => s.initDraft);
  const storeGoBack = useCreateLotStore((s) => s.goBack);
  const history = useCreateLotStore((s) => (s as any).history);

  useEffect(() => {
    initDraft();
  }, [initDraft]);

  const goBack = () => {
    if (step === "weight") {
      useCreateLotStore.getState().setStep("ai_scan");
      return;
    }
    if (step === "confirm") {
      useCreateLotStore.getState().setStep("ai_scan");
      return;
    }
    if (history && history.length > 0) {
      storeGoBack();
    } else {
      navigate(-1);
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'ai_scan': return t("collector.create.new_collection") || "New Collection";
      case 'material': return t("collector.create.choose_material") || "Choose Material";
      case 'weight': return t("collector.create.enter_weight") || "Enter Weight / Qty";
      case 'confirm': return t("collector.create.ready_to_save") || "Collection Slip";
      default: return t("collector.create.new_collection") || "New Collection";
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-20 bg-background flex flex-col">
      <header className="flex items-center py-2 mb-2 h-14">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="mr-2 -ml-2 hover:bg-surface active:scale-95 text-charcoal"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <span className="text-lg font-bold text-charcoal tracking-tight">{getTitle()}</span>
      </header>

      <ProgressIndicator currentStep={step} />

      <div className="flex-1">
        {step === "ai_scan" && <AiScanStep />}
        {step === "material" && <MaterialStep />}
        {step === "weight" && <WeightStep />}
        {step === "confirm" && <ConfirmStep />}
      </div>
    </div>
  );
}
