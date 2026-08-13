import { create } from 'zustand';
import { phaseOptions, type PhaseConfig } from '../lib/demoData';
import type { PhaseType } from '../types/database';

interface PhaseStore {
  activeType: PhaseType;
  setPhase: (type: PhaseType) => void;
}

export const usePhaseStore = create<PhaseStore>((set) => ({
  activeType: 'cutting',
  setPhase: (type) => set({ activeType: type }),
}));

export function useActivePhase(): PhaseConfig {
  const activeType = usePhaseStore((s) => s.activeType);
  return phaseOptions.find((p) => p.type === activeType) ?? phaseOptions[0];
}
