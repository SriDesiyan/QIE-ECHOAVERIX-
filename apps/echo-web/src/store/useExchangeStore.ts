import { create } from 'zustand';
import { EchoAgent } from 'echo-core';

interface ExchangeState {
  experts: EchoAgent[];
  filteredExperts: EchoAgent[];
  searchQuery: string;
  selectedDomain: string;
  minScore: number;
  loading: boolean;
  setExperts: (experts: EchoAgent[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedDomain: (domain: string) => void;
  setMinScore: (score: number) => void;
  setLoading: (loading: boolean) => void;
  applyFilters: () => void;
}

export const useExchangeStore = create<ExchangeState>((set, get) => ({
  experts: [],
  filteredExperts: [],
  searchQuery: '',
  selectedDomain: 'All',
  minScore: 0,
  loading: false,
  setExperts: (experts) => set({ experts, filteredExperts: experts }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedDomain: (selectedDomain) => set({ selectedDomain }),
  setMinScore: (minScore) => set({ minScore }),
  setLoading: (loading) => set({ loading }),
  applyFilters: () => {
    const { experts, searchQuery, selectedDomain, minScore } = get();
    let result = [...experts];

    if (selectedDomain !== 'All') {
      result = result.filter(e => e.domain.toLowerCase() === selectedDomain.toLowerCase());
    }

    if (searchQuery) {
      result = result.filter(e => 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (minScore > 0) {
      result = result.filter(e => e.echoScore >= minScore);
    }

    set({ filteredExperts: result });
  }
}));
