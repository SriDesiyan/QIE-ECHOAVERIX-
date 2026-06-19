import { create } from 'zustand';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  hasPass: boolean;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  address: null,
  hasPass: false,
  balance: '0.00',
  connect: async () => {
    // Simulate wallet connection and pass check
    const mockAddress = '0x3D9bC838e1239dBdEE00732E904B46c43C116744';
    set({
      isConnected: true,
      address: mockAddress,
      hasPass: true,
      balance: '1250.75'
    });
  },
  disconnect: () => {
    set({
      isConnected: false,
      address: null,
      hasPass: false,
      balance: '0.00'
    });
  }
}));
