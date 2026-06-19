import { create } from 'zustand';

interface AgentDraft {
  name: string;
  domain: string;
  description: string;
  systemPrompt: string;
  baseModel: string;
  priceType: 'subscription' | 'pay_per_query' | 'free';
  priceAmount: number;
}

interface AgentWizardState {
  currentStep: number;
  draft: AgentDraft;
  setStep: (step: number) => void;
  updateDraft: (fields: Partial<AgentDraft>) => void;
  resetDraft: () => void;
}

const initialDraft: AgentDraft = {
  name: '',
  domain: 'Finance',
  description: '',
  systemPrompt: '',
  baseModel: 'meta-llama/llama-3-8b-instruct:free',
  priceType: 'subscription',
  priceAmount: 19.99
};

export const useAgentStore = create<AgentWizardState>((set) => ({
  currentStep: 1,
  draft: initialDraft,
  setStep: (currentStep) => set({ currentStep }),
  updateDraft: (fields) => set((state) => ({ draft: { ...state.draft, ...fields } })),
  resetDraft: () => set({ draft: initialDraft, currentStep: 1 })
}));
