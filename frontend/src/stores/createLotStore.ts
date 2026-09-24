import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { MaterialClassificationResult } from '@/services/ai/inference';

export interface LotItemDraft {
  material_id: string;
  label?: string;
  weight_or_count: number;
  unit: string;
  unitLabel: string;
  rate_min?: number;
  rate_max?: number;
  estimated_value: number;
  confidence?: number;
}

interface CreateLotState {
  draft_id: string | null;
  step: 'ai_scan' | 'material' | 'weight' | 'price' | 'photo' | 'confirm';
  history: ('ai_scan' | 'material' | 'weight' | 'price' | 'photo' | 'confirm')[];
  material_id: string | null;
  approx_weight_kg: number | null;
  estimated_value: number | null;
  estimated_min: number | null;
  estimated_max: number | null;
  asking_price: number | null;
  ai_confidence: number | null;
  
  // Multi-item composite lot support
  items: LotItemDraft[];
  activeItemMaterialId: string | null;

  // Transient UI State
  aiResult: MaterialClassificationResult | null;
  aiError: boolean;
  previewUri: string | null;
  processing: boolean;

  setMaterial: (id: string) => void;
  setActiveItemMaterialId: (id: string | null) => void;
  addItem: (item: LotItemDraft) => void;
  removeItem: (material_id: string) => void;
  setWeight: (weight: number, value: number) => void;
  setEstimatedValue: (value: number) => void;
  setAskingPrice: (price: number) => void;
  setStep: (step: CreateLotState['step']) => void;
  goBack: () => void;
  setAiConfidence: (confidence: number) => void;
  setAiState: (state: Partial<Pick<CreateLotState, 'aiResult' | 'aiError' | 'previewUri' | 'processing'>>) => void;
  initDraft: () => void;
  reset: () => void;
}

export const useCreateLotStore = create<CreateLotState>()(
  persist(
    (set) => ({
      draft_id: null,
      step: 'ai_scan',
      history: [],
      material_id: null,
      approx_weight_kg: null,
      estimated_value: null,
      estimated_min: null,
      estimated_max: null,
      asking_price: null,
      ai_confidence: null,
      items: [],
      activeItemMaterialId: null,
      aiResult: null,
      aiError: false,
      previewUri: null,
      processing: false,

      setMaterial: (id) => set((state) => ({
        material_id: id,
        activeItemMaterialId: id,
        step: 'weight',
        history: [...state.history, state.step],
      })),

      setActiveItemMaterialId: (id) => set({ activeItemMaterialId: id }),

      addItem: (item) => set((state) => {
        const existingIdx = state.items.findIndex(
          (i) => i.material_id.toUpperCase() === item.material_id.toUpperCase()
        );
        let newItems: LotItemDraft[];
        if (existingIdx >= 0) {
          newItems = [...state.items];
          newItems[existingIdx] = item;
        } else {
          newItems = [...state.items, item];
        }

        // Calculate composite weights and values
        const totalWeight = newItems.reduce((acc, curr) => {
          const w = curr.unit === 'piece' ? curr.weight_or_count * 1.5 : curr.weight_or_count;
          return Number((acc + w).toFixed(2));
        }, 0);
        const totalValue = newItems.reduce((acc, curr) => acc + curr.estimated_value, 0);

        // Compute fair benchmark band (min and max)
        const totalMin = newItems.reduce((acc, curr) => {
          const minVal = curr.rate_min
            ? Math.round(curr.rate_min * curr.weight_or_count)
            : Math.round(curr.estimated_value * 0.94);
          return acc + minVal;
        }, 0);

        const totalMax = newItems.reduce((acc, curr) => {
          const maxVal = curr.rate_max
            ? Math.round(curr.rate_max * curr.weight_or_count)
            : Math.round(curr.estimated_value * 1.07);
          return acc + maxVal;
        }, 0);

        const lotLabel = newItems.length === 1
          ? (newItems[0].label || newItems[0].material_id)
          : newItems.map((i) => i.label || i.material_id).join(' + ');

        return {
          items: newItems,
          material_id: lotLabel,
          approx_weight_kg: totalWeight,
          estimated_value: totalValue,
          estimated_min: totalMin,
          estimated_max: totalMax,
          asking_price: state.asking_price && state.asking_price > 0 ? state.asking_price : totalValue,
        };
      }),

      removeItem: (matId) => set((state) => {
        const newItems = state.items.filter(
          (i) => i.material_id.toUpperCase() !== matId.toUpperCase()
        );
        const totalWeight = newItems.reduce((acc, curr) => {
          const w = curr.unit === 'piece' ? curr.weight_or_count * 1.5 : curr.weight_or_count;
          return Number((acc + w).toFixed(2));
        }, 0);
        const totalValue = newItems.reduce((acc, curr) => acc + curr.estimated_value, 0);

        const totalMin = newItems.reduce((acc, curr) => {
          const minVal = curr.rate_min
            ? Math.round(curr.rate_min * curr.weight_or_count)
            : Math.round(curr.estimated_value * 0.94);
          return acc + minVal;
        }, 0);

        const totalMax = newItems.reduce((acc, curr) => {
          const maxVal = curr.rate_max
            ? Math.round(curr.rate_max * curr.weight_or_count)
            : Math.round(curr.estimated_value * 1.07);
          return acc + maxVal;
        }, 0);

        const lotLabel = newItems.length > 0
          ? (newItems.length === 1 ? (newItems[0].label || newItems[0].material_id) : newItems.map((i) => i.label || i.material_id).join(' + '))
          : null;

        return {
          items: newItems,
          material_id: lotLabel,
          approx_weight_kg: totalWeight,
          estimated_value: totalValue,
          estimated_min: totalMin,
          estimated_max: totalMax,
          asking_price: totalValue,
        };
      }),

      setWeight: (weight, value) => set((state) => ({
        approx_weight_kg: weight,
        estimated_value: value,
        estimated_min: Math.round(value * 0.94),
        estimated_max: Math.round(value * 1.07),
        asking_price: value,
        step: 'confirm',
        history: [...state.history, state.step],
      })),

      setEstimatedValue: (value) => set((state) => ({
        estimated_value: value,
        estimated_min: Math.round(value * 0.94),
        estimated_max: Math.round(value * 1.07),
        asking_price: state.asking_price || value,
        step: 'confirm',
        history: [...state.history, state.step],
      })),

      setAskingPrice: (price) => set({ asking_price: price }),

      setStep: (step) => set((state) => ({ step, history: [...state.history, state.step] })),
      setAiConfidence: (confidence) => set({ ai_confidence: confidence }),
      
      goBack: () => set((state) => {
        const newHistory = [...state.history];
        const previousStep = newHistory.pop();
        if (previousStep) {
          return { step: previousStep, history: newHistory };
        }
        return state;
      }),

      setAiState: (newState) => set(newState),

      initDraft: () => set((state) => {
        if (state.draft_id) return state;
        const num = Math.floor(1000 + Math.random() * 9000);
        const code = Date.now().toString(36).slice(-3).toUpperCase();
        return { draft_id: `SR-LOT-${num}-${code}` };
      }),

      reset: () => set({ 
        draft_id: null,
        step: 'ai_scan',
        material_id: null,
        approx_weight_kg: null, 
        estimated_value: null,
        estimated_min: null,
        estimated_max: null,
        asking_price: null,
        ai_confidence: null,
        items: [],
        activeItemMaterialId: null,
        aiResult: null,
        aiError: false, 
        previewUri: null,
        processing: false,
        history: [],
      }),
    }),
    {
      name: 'sahirate-createlot-draft',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        draft_id: state.draft_id,
        step: state.step,
        material_id: state.material_id,
        approx_weight_kg: state.approx_weight_kg,
        estimated_value: state.estimated_value,
        estimated_min: state.estimated_min,
        estimated_max: state.estimated_max,
        asking_price: state.asking_price,
        ai_confidence: state.ai_confidence,
        items: state.items,
        activeItemMaterialId: state.activeItemMaterialId,
      }),
    }
  )
);
