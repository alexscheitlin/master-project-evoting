import { create } from 'zustand';

export const [useVoterStore] = create(set => ({
  authenticated: false,
  token: '',
  wallet: '',
  contract: {},
  contractAddress: '',
  connectionNodeUrl: '',

  setAuthenicated: (auth: boolean) => set({ authenticated: auth }),
  setToken: (token: string) => set({ token: token }),
  setWallet: (wallet: string) => set({ wallet: wallet }),
  setContract: (contract: any) => set({ contract: contract }),
  setBallotContractAddress: (address: string) => set({ contractAddress: address }),
  setConnectionNodeUrl: (url: string) => set({ connectionNodeUrl: url }),
}));
