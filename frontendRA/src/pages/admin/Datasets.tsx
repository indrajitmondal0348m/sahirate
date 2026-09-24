import { useState } from "react";
import { 
  Database, 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  Table, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Filter, 
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import UnitEconomicsAssessment from "@/components/analytics/UnitEconomicsAssessment";
import CriticalMineralRecoveryReport from "@/components/analytics/CriticalMineralRecoveryReport";

// Dataset 1: Scrap Material Master
const DATASET_MATERIALS = [
  { material_id: "BATTERY_LI", name: "Lithium-Ion Battery Pack", cpcb_code: "B4010", base_rate: 90, unit: "kg", hazard_class: "Class 9 Flammable", strategic_elements: "Li, Co, Ni" },
  { material_id: "PCB_HIGH", name: "High-Grade Motherboard (Server/PC)", cpcb_code: "B1110", base_rate: 105, unit: "kg", hazard_class: "Class 6 Heavy Metal", strategic_elements: "Au, Ag, Ta, Cu" },
  { material_id: "MOTOR_NEO", name: "Permanent Magnet BLDC Motor", cpcb_code: "B1010", base_rate: 515, unit: "kg", hazard_class: "Non-Hazardous", strategic_elements: "Nd, Dy, Cu" },
  { material_id: "WIRE_CU", name: "Insulated Copper Wire Harness", cpcb_code: "B1020", base_rate: 1015, unit: "kg", hazard_class: "Non-Hazardous", strategic_elements: "Cu 99.9%" },
  { material_id: "DISPLAY_LED", name: "Flat Panel LED/LCD Screen", cpcb_code: "B1110", base_rate: 480, unit: "piece", hazard_class: "Class 8 Corrosive", strategic_elements: "In, Ga, Si" },
  { material_id: "METAL_AL_FE", name: "Shredded Structural Light Metal", cpcb_code: "B1010", base_rate: 145, unit: "kg", hazard_class: "Non-Hazardous", strategic_elements: "Al, Fe, Zn" },
  { material_id: "PLASTIC_ENG", name: "High-Impact Flame-Retardant ABS", cpcb_code: "B3010", base_rate: 82, unit: "kg", hazard_class: "Brominated Flame Retardant", strategic_elements: "ABS Polymer" },
];

// Dataset 2: Daily Benchmark Prices
const DATASET_PRICES = [
  { date: "2026-09-23", commodity: "Copper Wire Harness", benchmark_rate: 1020, mandi_wholesale: 1060, spcb_floor_price: 980, volatility_7d: "+3.8%", epr_multiplier: 1.25 },
  { date: "2026-09-23", commodity: "BLDC Neodymium Motors", benchmark_rate: 520, mandi_wholesale: 550, spcb_floor_price: 490, volatility_7d: "+2.4%", epr_multiplier: 1.40 },
  { date: "2026-09-23", commodity: "Lithium-Ion Scrap Battery", benchmark_rate: 95, mandi_wholesale: 105, spcb_floor_price: 85, volatility_7d: "+1.2%", epr_multiplier: 1.50 },
  { date: "2026-09-23", commodity: "High-Grade PCB Motherboards", benchmark_rate: 100, mandi_wholesale: 112, spcb_floor_price: 92, volatility_7d: "+5.1%", epr_multiplier: 1.35 },
  { date: "2026-09-22", commodity: "Copper Wire Harness", benchmark_rate: 995, mandi_wholesale: 1030, spcb_floor_price: 975, volatility_7d: "+1.9%", epr_multiplier: 1.25 },
  { date: "2026-09-22", commodity: "BLDC Neodymium Motors", benchmark_rate: 510, mandi_wholesale: 540, spcb_floor_price: 480, volatility_7d: "+0.8%", epr_multiplier: 1.40 },
  { date: "2026-09-21", commodity: "Lithium-Ion Scrap Battery", benchmark_rate: 92, mandi_wholesale: 100, spcb_floor_price: 85, volatility_7d: "-0.5%", epr_multiplier: 1.50 },
];

// Dataset 3: Authorized Recycler Registry
const DATASET_RECYCLERS = [
  { recycler_id: "REC-MH-004", name: "EcoRecycle Yard #4", permit_no: "CPCB/EW/2023/MH-0982", state: "Maharashtra", district: "Nagpur", annual_capacity_mt: 12000, compliance_score: "98.4%", certified_smelter: "YES" },
  { recycler_id: "REC-MH-011", name: "Vidarbha Strategic Metals", permit_no: "SPCB-MH-EW-8821", state: "Maharashtra", district: "Nagpur", annual_capacity_mt: 8500, compliance_score: "96.1%", certified_smelter: "YES" },
  { recycler_id: "REC-OR-002", name: "Utkal Clean Metals Hub", permit_no: "CPCB/EW/2024/OR-1102", state: "Odisha", district: "Khordha", annual_capacity_mt: 6000, compliance_score: "94.5%", certified_smelter: "NO" },
  { recycler_id: "REC-DL-009", name: "Apex Circular Smelter", permit_no: "CPCB/EW/2022/DL-4029", state: "Delhi NCR", district: "West Delhi", annual_capacity_mt: 15000, compliance_score: "99.2%", certified_smelter: "YES" },
  { recycler_id: "REC-KA-014", name: "Deccan Urban Minerals Ltd", permit_no: "SPCB-KA-EW-5519", state: "Karnataka", district: "Bengaluru Rural", annual_capacity_mt: 11000, compliance_score: "97.0%", certified_smelter: "YES" },
];

// Dataset 4: Verified Lot Transactions
const DATASET_TRANSACTIONS = [
  { transaction_id: "TXN-2026-0901", lot_id: "SR-LOT-7842-PCB", date: "2026-09-23", recycler_id: "REC-MH-004", material: "PCB_HIGH", verified_weight_kg: 18.4, rate_per_kg: 105, total_payout: 1932, payment_mode: "Instant Cash Voucher", epr_cert_hash: "0x8f2d...91c4" },
  { transaction_id: "TXN-2026-0902", lot_id: "SR-LOT-7843-WIR", date: "2026-09-23", recycler_id: "REC-MH-004", material: "WIRE_CU", verified_weight_kg: 42.1, rate_per_kg: 1015, total_payout: 42731, payment_mode: "Direct UPI", epr_cert_hash: "0x12a9...5b37" },
  { transaction_id: "TXN-2026-0903", lot_id: "SR-LOT-7840-MOT", date: "2026-09-22", recycler_id: "REC-MH-011", material: "MOTOR_NEO", verified_weight_kg: 12.0, rate_per_kg: 515, total_payout: 6180, payment_mode: "Direct Jan Dhan A/C", epr_cert_hash: "0x44cf...88e1" },
  { transaction_id: "TXN-2026-0904", lot_id: "SR-LOT-7839-BAT", date: "2026-09-22", recycler_id: "REC-DL-009", material: "BATTERY_LI", verified_weight_kg: 65.5, rate_per_kg: 90, total_payout: 5895, payment_mode: "Instant Cash Voucher", epr_cert_hash: "0x77ae...20f3" },
  { transaction_id: "TXN-2026-0905", lot_id: "SR-LOT-7835-DIS", date: "2026-09-21", recycler_id: "REC-OR-002", material: "DISPLAY_LED", verified_weight_kg: 8.0, rate_per_kg: 480, total_payout: 3840, payment_mode: "Direct UPI", epr_cert_hash: "0x91da...66c2" },
];

// Dataset 5: Traceability & Chain of Custody Audit Log
const DATASET_TRACEABILITY = [
  { event_id: "EVT-8801", lot_id: "SR-LOT-7842-PCB", timestamp: "2026-09-23T06:14:00Z", stage: "COLLECTOR_OFFLINE_LOG", lat_lng: "21.1458,79.0882", sha256_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", tamper_flag: "CLEAN" },
  { event_id: "EVT-8802", lot_id: "SR-LOT-7842-PCB", timestamp: "2026-09-23T06:45:12Z", stage: "SCALE_WEIGH_INSPECTION", lat_lng: "21.0924,79.0019", sha256_hash: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb", tamper_flag: "CLEAN" },
  { event_id: "EVT-8803", lot_id: "SR-LOT-7842-PCB", timestamp: "2026-09-23T06:46:05Z", stage: "CASH_SETTLEMENT_RECORD", lat_lng: "21.0924,79.0019", sha256_hash: "587ff771702576b4c35f683b28666fb4cb427f477b63952865ba79b9b1ab6f0b", tamper_flag: "CLEAN" },
  { event_id: "EVT-8804", lot_id: "SR-LOT-7843-WIR", timestamp: "2026-09-23T06:50:00Z", stage: "COLLECTOR_OFFLINE_LOG", lat_lng: "21.1210,79.0540", sha256_hash: "a4f89d38092797e887bb615c48b2eb59fe7b7be3b7b4d115e5812759e612eb0f", tamper_flag: "CLEAN" },
  { event_id: "EVT-8805", lot_id: "SR-LOT-7843-WIR", timestamp: "2026-09-23T07:05:40Z", stage: "EPR_CREDIT_MINTED", lat_lng: "21.0924,79.0019", sha256_hash: "f6e0a1e2ac41945a9aa7ff8a8aaa0cebc12a3bcc981a929ad50d222ca144365d", tamper_flag: "CLEAN" },
];

// Dataset 6: Collector Socio-Economic & Recovery Impact
const DATASET_COLLECTORS = [
  { collector_pseudonym: "COL-NAG-0142", region: "Nagpur East (Ward 22)", monthly_volume_kg: 840, extra_earnings_vs_middleman: 26880, formal_conversion_date: "2026-06-12", safety_training_completed: "YES", digital_voucher_usage: "92%" },
  { collector_pseudonym: "COL-NAG-0089", region: "Nagpur South (Ward 15)", monthly_volume_kg: 1120, extra_earnings_vs_middleman: 35840, formal_conversion_date: "2026-05-04", safety_training_completed: "YES", digital_voucher_usage: "88%" },
  { collector_pseudonym: "COL-BBI-0031", region: "Bhubaneswar Central", monthly_volume_kg: 620, extra_earnings_vs_middleman: 19840, formal_conversion_date: "2026-07-20", safety_training_completed: "YES", digital_voucher_usage: "75%" },
  { collector_pseudonym: "COL-DEL-0419", region: "Mayapuri Aggregator Ring", monthly_volume_kg: 2400, extra_earnings_vs_middleman: 76800, formal_conversion_date: "2026-04-18", safety_training_completed: "YES", digital_voucher_usage: "96%" },
  { collector_pseudonym: "COL-BLR-0210", region: "Peenya Industrial Cluster", monthly_volume_kg: 950, extra_earnings_vs_middleman: 30400, formal_conversion_date: "2026-08-01", safety_training_completed: "YES", digital_voucher_usage: "84%" },
];

type DatasetKey = "materials" | "prices" | "recyclers" | "transactions" | "traceability" | "collectors";

export default function AdminDatasets() {
  const [activeTab, setActiveTab] = useState<DatasetKey>("materials");
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const datasets: Record<
    DatasetKey,
    { title: string; filename: string; description: string; data: any[]; count: number }
  > = {
    materials: {
      title: "1. Scrap Material Master Dataset",
      filename: "sahirate_material_master.csv",
      description: "Standardized scrap classifications, CPCB e-waste categorization codes, and critical metallurgical constituent profiles.",
      data: DATASET_MATERIALS,
      count: DATASET_MATERIALS.length,
    },
    prices: {
      title: "2. Daily Benchmark Price Trend Dataset",
      filename: "sahirate_price_trends.csv",
      description: "Historical 7-day fair-market benchmark rates, regional Mandi wholesale prices, and SPCB floor price indicators.",
      data: DATASET_PRICES,
      count: DATASET_PRICES.length,
    },
    recyclers: {
      title: "3. CPCB/SPCB Authorized Recycler Registry",
      filename: "sahirate_authorized_recyclers.csv",
      description: "Government-licensed recycler registry, annual MT throughput capacity, SPCB consent numbers, and Central Recovery accreditation status.",
      data: DATASET_RECYCLERS,
      count: DATASET_RECYCLERS.length,
    },
    transactions: {
      title: "4. Verified Lot Transactions Dataset",
      filename: "sahirate_verified_transactions.csv",
      description: "Digital scale weighment intake logs, tamper-evident lot IDs, transparent rates applied, and instant settlement methods.",
      data: DATASET_TRANSACTIONS,
      count: DATASET_TRANSACTIONS.length,
    },
    traceability: {
      title: "5. Traceability & Chain of Custody Audit Log",
      filename: "sahirate_custody_traceability.csv",
      description: "SHA-256 tamper-evident log records documenting movement of e-waste from informal collector custody to certified smelter batching.",
      data: DATASET_TRACEABILITY,
      count: DATASET_TRACEABILITY.length,
    },
    collectors: {
      title: "6. Collector Socio-Economic Impact Dataset",
      filename: "sahirate_collector_impact.csv",
      description: "Anonymized socio-economic metrics tracking the +66% net income lift, informal worker inclusion, and PPE safety certifications.",
      data: DATASET_COLLECTORS,
      count: DATASET_COLLECTORS.length,
    },
  };

  const currentDataset = datasets[activeTab];

  // Helper to convert objects to CSV
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = row[h] !== undefined ? String(row[h]) : "";
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`Exported ${filename} successfully!`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Helper to convert objects to JSON
  const exportToJSON = (data: any[], filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename.replace(".csv", ".json"));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`Exported JSON successfully!`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Export all 6 datasets bundled in a single multi-table JSON
  const exportAllDatasets = () => {
    const bundle: Record<string, any[]> = {};
    for (const key of Object.keys(datasets) as DatasetKey[]) {
      bundle[datasets[key].title] = datasets[key].data;
    }
    const jsonStr = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sahirate_sih_complete_dataset_bundle.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess("Complete 6-Dataset SIH Package exported!");
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DDD8CC] shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider mb-2">
            <Database className="w-3.5 h-3.5" /> SIH Mandate • Open Public Datasets Center
          </div>
          <h2 className="text-2xl font-black text-charcoal tracking-tight">
            The 6 Standardized Circular Datasets & Financial Models
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl font-medium">
            Curated machine-readable data feeds ready for CPCB EPR integration, Ministry of Mines dashboarding, 
            and algorithmic pricing verification. Available for 1-click export in CSV & JSON formats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={exportAllDatasets}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 rounded-xl h-11"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export All 6 Datasets (.JSON Bundle)
          </Button>
        </div>
      </div>

      {/* Success Notification Bar */}
      {downloadSuccess && (
        <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          {downloadSuccess}
        </div>
      )}

      {/* Dataset Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {(Object.keys(datasets) as DatasetKey[]).map((key) => {
          const ds = datasets[key];
          const isSelected = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                isSelected
                  ? "bg-white text-primary border-primary shadow-xs ring-2 ring-primary/20"
                  : "bg-[#FAF8F3] text-muted-foreground border-[#DDD8CC] hover:text-charcoal hover:bg-white"
              }`}
            >
              {ds.title}
            </button>
          );
        })}
      </div>

      {/* Active Dataset Container */}
      <div className="bg-white rounded-3xl border border-[#DDD8CC] shadow-xs overflow-hidden">
        {/* Dataset Header */}
        <div className="p-6 border-b border-[#DDD8CC] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF8F3]/60">
          <div>
            <h3 className="font-black text-lg text-charcoal">{currentDataset.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{currentDataset.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(currentDataset.data, currentDataset.filename)}
              className="text-xs font-bold border-[#DDD8CC] bg-white text-charcoal hover:bg-stone-50 rounded-xl"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Download CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToJSON(currentDataset.data, currentDataset.filename)}
              className="text-xs font-bold border-[#DDD8CC] bg-white text-charcoal hover:bg-stone-50 rounded-xl"
            >
              <FileCode className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Download JSON
            </Button>
          </div>
        </div>

        {/* Live Table Preview */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F3] border-b border-[#DDD8CC] text-muted-foreground font-black uppercase text-[10px] tracking-wider">
                {currentDataset.data.length > 0 &&
                  Object.keys(currentDataset.data[0]).map((h) => (
                    <th key={h} className="p-3.5">
                      {h.replace(/_/g, " ")}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {currentDataset.data.map((row, idx) => (
                <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                  {Object.keys(row).map((k) => (
                    <td key={k} className="p-3.5 text-charcoal whitespace-nowrap">
                      {typeof row[k] === "number" ? (
                        <span className="font-mono font-bold">{row[k].toLocaleString()}</span>
                      ) : (
                        <span>{String(row[k])}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-[#DDD8CC] bg-[#FAF8F3] flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {currentDataset.count} sample rows • Ready for CPCB EPR bulk API push</span>
          <span className="font-mono text-[10px]">Format: UTF-8 RFC-4180 Standard</span>
        </div>
      </div>

      {/* Embedded Component 1: Critical Mineral Recovery Report */}
      <CriticalMineralRecoveryReport />

      {/* Embedded Component 2: Unit Economics Assessment */}
      <UnitEconomicsAssessment />
    </div>
  );
}
