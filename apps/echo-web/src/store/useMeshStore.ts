import { create } from 'zustand';

interface MeshContribution {
  name: string;
  domain: string;
  weight: number;
}

interface MeshSessionState {
  query: string;
  response: string;
  attribution: Record<string, MeshContribution>;
  expertsConsulted: string[];
  isRouting: boolean;
  setSession: (data: { query: string; response: string; attribution: Record<string, MeshContribution>; expertsConsulted: string[] }) => void;
  setRouting: (routing: boolean) => void;
}

export const useMeshStore = create<MeshSessionState>((set) => ({
  query: '',
  response: '',
  attribution: {},
  expertsConsulted: [],
  isRouting: false,
  setSession: (data) => set({ ...data, isRouting: false }),
  setRouting: (isRouting) => set({ isRouting })
}));
