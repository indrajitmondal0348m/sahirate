/**
 * Strategic Critical Mineral & Rare Earth Metallurgical Recovery Estimator
 * Based on published metallurgical recovery benchmark ratios per kg of e-waste.
 */

export interface MineralRecoveryResult {
  minerals: {
    name: string;
    symbol: string;
    amountFormatted: string;
    color: string;
    description: string;
  }[];
  headline: string;
  hazardAvoided: string;
}

export function calculateCriticalMinerals(
  materialId: string,
  weightKg: number,
  items?: Array<{ material_id?: string; material?: string; weight_or_count?: number; weight?: number; unit?: string }>
): MineralRecoveryResult {
  // If multi-item composite lot is provided, calculate aggregate yields across all components
  if (items && items.length > 0) {
    const mineralMap: Record<string, { name: string; symbol: string; amountMg: number; unitStr?: string; color: string; description: string }> = {};
    const hazards: string[] = [];

    for (const item of items) {
      const mat = (item.material_id || item.material || "").toUpperCase();
      const countOrWeight = Number(item.weight_or_count || item.weight || 1);
      const isPiece = item.unit === "piece" || mat.includes("DISPLAY") || mat.includes("PCB");
      const wKg = isPiece ? countOrWeight * 1.5 : countOrWeight;

      if (mat.includes("MOTOR") || mat.includes("MAGNET")) {
        const ndG = Math.round(wKg * 65);
        const dyG = Number((wKg * 12).toFixed(1));
        const cuG = Math.round(wKg * 180);
        mineralMap["Nd"] = { name: "Neodymium", symbol: "Nd", amountMg: (mineralMap["Nd"]?.amountMg || 0) + ndG * 1000, color: "bg-amber-100 text-amber-900 border-amber-300", description: "Permanent magnet alloy for EV motors & turbines" };
        mineralMap["Dy"] = { name: "Dysprosium", symbol: "Dy", amountMg: (mineralMap["Dy"]?.amountMg || 0) + dyG * 1000, color: "bg-purple-100 text-purple-900 border-purple-300", description: "Thermal stabilizer for rare earth magnets" };
        mineralMap["Cu"] = { name: "Copper", symbol: "Cu", amountMg: (mineralMap["Cu"]?.amountMg || 0) + cuG * 1000, color: "bg-orange-100 text-orange-900 border-orange-300", description: "Electrolytic rotor/stator copper" };
        hazards.push("neodymium magnet oxidation");
      } else if (mat.includes("PCB") || mat.includes("BOARD")) {
        const taMg = Math.round(wKg * 45);
        const cuG = Math.round(wKg * 210);
        const auMg = Math.round(wKg * 18);
        mineralMap["Ta"] = { name: "Tantalum", symbol: "Ta", amountMg: (mineralMap["Ta"]?.amountMg || 0) + taMg, color: "bg-blue-100 text-blue-900 border-blue-300", description: "Capacitor dielectric for defense & electronics" };
        mineralMap["Cu"] = { name: "Copper", symbol: "Cu", amountMg: (mineralMap["Cu"]?.amountMg || 0) + cuG * 1000, color: "bg-orange-100 text-orange-900 border-orange-300", description: "Pure circuit trace copper" };
        mineralMap["Au"] = { name: "Gold", symbol: "Au", amountMg: (mineralMap["Au"]?.amountMg || 0) + auMg, color: "bg-yellow-100 text-yellow-900 border-yellow-300", description: "High-conductivity bonding wire & contacts" };
        hazards.push("open-air cyanide/acid leaching");
      } else if (mat.includes("BATTERY")) {
        const liEq = Math.round(wKg * 85);
        const coG = Math.round(wKg * 140);
        mineralMap["Li"] = { name: "Lithium Carbonate", symbol: "Li", amountMg: (mineralMap["Li"]?.amountMg || 0) + liEq * 1000, color: "bg-emerald-100 text-emerald-900 border-emerald-300", description: "Cathode precursor for energy storage cells" };
        mineralMap["Co"] = { name: "Cobalt", symbol: "Co", amountMg: (mineralMap["Co"]?.amountMg || 0) + coG * 1000, color: "bg-indigo-100 text-indigo-900 border-indigo-300", description: "High-density NMC cathode chemistry" };
        hazards.push("spontaneous thermal runaway & heavy metal soil toxicity");
      } else if (mat.includes("DISPLAY") || mat.includes("LCD") || mat.includes("CRT")) {
        const inMg = Math.round(wKg * 35);
        const gaMg = Math.round(wKg * 12);
        mineralMap["In"] = { name: "Indium (ITO)", symbol: "In", amountMg: (mineralMap["In"]?.amountMg || 0) + inMg, color: "bg-teal-100 text-teal-900 border-teal-300", description: "Transparent touch-panel conductors" };
        mineralMap["Ga"] = { name: "Gallium", symbol: "Ga", amountMg: (mineralMap["Ga"]?.amountMg || 0) + gaMg, color: "bg-cyan-100 text-cyan-900 border-cyan-300", description: "Semiconductor display backlighting" };
        hazards.push("lead-glass leaching & mercury tube breakage");
      } else {
        const cuG = Math.round(wKg * 620);
        mineralMap["Cu"] = { name: "Refined Copper", symbol: "Cu", amountMg: (mineralMap["Cu"]?.amountMg || 0) + cuG * 1000, color: "bg-orange-100 text-orange-900 border-orange-300", description: "High-grade recyclable cathode copper" };
        hazards.push("open wire burning & toxic dioxin emissions");
      }
    }

    const minerals = Object.values(mineralMap).map((m) => {
      let amountFormatted = "";
      if (m.amountMg >= 1000000) {
        amountFormatted = `${(m.amountMg / 1000000).toFixed(2)}kg`;
      } else if (m.amountMg >= 1000) {
        amountFormatted = `${Math.round(m.amountMg / 1000)}g`;
      } else {
        amountFormatted = `${Math.round(m.amountMg)}mg`;
      }
      return {
        name: m.name,
        symbol: m.symbol,
        amountFormatted,
        color: m.color,
        description: m.description,
      };
    });

    const hazardSummary = hazards.length > 0
      ? `Eliminates ${Array.from(new Set(hazards)).slice(0, 3).join(", ")} via authorized channelization.`
      : "Mitigates e-waste landfill contamination and preserves secondary critical minerals.";

    return {
      headline: `Multi-Component Circular Recovery (${items.length} materials)`,
      hazardAvoided: hazardSummary,
      minerals,
    };
  }

  const normalized = (materialId || "").toUpperCase();
  const weight = Math.max(weightKg || 0, 0.1);

  if (normalized.includes("MOTOR") || normalized.includes("MAGNET")) {
    const ndGrams = Math.round(weight * 65);
    const dyGrams = (weight * 12).toFixed(1);
    const cuGrams = Math.round(weight * 180);
    return {
      headline: "Rare Earth Magnet Recovery (Certified Protocol)",
      hazardAvoided: "Prevents toxic neodymium magnet oxidation and landfill rare-earth loss",
      minerals: [
        {
          name: "Neodymium",
          symbol: "Nd",
          amountFormatted: `${ndGrams}g`,
          color: "bg-amber-100 text-amber-900 border-amber-300",
          description: "High-grade permanent magnet alloy for EV motors & turbines",
        },
        {
          name: "Dysprosium",
          symbol: "Dy",
          amountFormatted: `${dyGrams}g`,
          color: "bg-purple-100 text-purple-900 border-purple-300",
          description: "Thermal stabilizer for rare earth magnets",
        },
        {
          name: "Copper",
          symbol: "Cu",
          amountFormatted: `${cuGrams}g`,
          color: "bg-orange-100 text-orange-900 border-orange-300",
          description: "Stator winding electrolytic copper",
        },
      ],
    };
  }

  if (normalized.includes("PCB") || normalized.includes("BOARD")) {
    const taMg = Math.round(weight * 45);
    const cuGrams = Math.round(weight * 210);
    const auMg = Math.round(weight * 18);
    return {
      headline: "Strategic Critical Metals Salvaged",
      hazardAvoided: "Eliminates open-air cyanide/acid leaching and water table arsenic contamination",
      minerals: [
        {
          name: "Tantalum",
          symbol: "Ta",
          amountFormatted: `${taMg}mg`,
          color: "bg-blue-100 text-blue-900 border-blue-300",
          description: "Capacitor dielectric for defense & aerospace electronics",
        },
        {
          name: "Electrolytic Copper",
          symbol: "Cu",
          amountFormatted: `${cuGrams}g`,
          color: "bg-orange-100 text-orange-900 border-orange-300",
          description: "99.9% pure trace circuit copper",
        },
        {
          name: "Gold",
          symbol: "Au",
          amountFormatted: `${auMg}mg`,
          color: "bg-yellow-100 text-yellow-900 border-yellow-300",
          description: "Bonding wire and contact pins",
        },
      ],
    };
  }

  if (normalized.includes("BATTERY")) {
    const liEq = Math.round(weight * 85);
    const coGrams = Math.round(weight * 140);
    return {
      headline: "Battery Active Material Extraction",
      hazardAvoided: "Prevents spontaneous thermal runaway, toxic hydrogen fluoride gas & lead poisoning",
      minerals: [
        {
          name: "Lithium Carbonate (LCE)",
          symbol: "Li",
          amountFormatted: `${liEq}g`,
          color: "bg-emerald-100 text-emerald-900 border-emerald-300",
          description: "Cathode precursor for energy storage",
        },
        {
          name: "Cobalt",
          symbol: "Co",
          amountFormatted: `${coGrams}g`,
          color: "bg-indigo-100 text-indigo-900 border-indigo-300",
          description: "High-density NMC cathode chemistry",
        },
      ],
    };
  }

  if (normalized.includes("DISPLAY") || normalized.includes("LCD") || normalized.includes("CRT")) {
    const inMg = Math.round(weight * 35);
    const gaMg = Math.round(weight * 12);
    return {
      headline: "Transparent Conductor & Semiconductor Salvage",
      hazardAvoided: "Avoids lead-glass leaching (CRTs) and mercury backlight tube breakage",
      minerals: [
        {
          name: "Indium (ITO)",
          symbol: "In",
          amountFormatted: `${inMg}mg`,
          color: "bg-teal-100 text-teal-900 border-teal-300",
          description: "Transparent touchscreen electrodes",
        },
        {
          name: "Gallium",
          symbol: "Ga",
          amountFormatted: `${gaMg}mg`,
          color: "bg-cyan-100 text-cyan-900 border-cyan-300",
          description: "Semiconductor LED backlighting",
        },
      ],
    };
  }

  // Default / Cables / Mixed Metals
  const cuGrams = Math.round(weight * 620);
  return {
    headline: "Clean Metallurgical Copper Stream",
    hazardAvoided: "Stops open wire burning that releases carcinogenic dioxins, furans & black carbon",
    minerals: [
      {
        name: "Refined Copper",
        symbol: "Cu",
        amountFormatted: `${cuGrams}g`,
        color: "bg-orange-100 text-orange-900 border-orange-300",
        description: "100% recyclable electrical grade cathode",
      },
    ],
  };
}
