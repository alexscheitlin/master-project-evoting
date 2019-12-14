import { create } from 'zustand';

export const [useVoterStore] = create((set, get) => ({
  authenticated: false,
  token: '',
  wallet: '',
  contract: {},
  contractAddress: '',
  connectionNodeUrl: '',

  // -----------------------------------
  // LOGOUT
  // -----------------------------------
  logout: () => {
    localStorage.clear();
    set({ authenticated: false });
  },

  // -----------------------------------
  // AUTHENTICATION
  // -----------------------------------
  isAuthenticated: () => {
    const isAuth = localStorage.getItem('authenticated');
    if (isAuth === 'true') {
      return true;
    } else {
      return false;
    }
  },
  setAuthenicated: (auth: boolean) => {
    set({ authenticated: auth });
    localStorage.setItem('authenticated', auth.toString());
  },

  // -----------------------------------
  // TOKEN
  // -----------------------------------
  isTokenSet: () => {
    const token = localStorage.getItem('token');
    if (token === null || token === '') {
      return false;
    } else {
      return true;
    }
  },
  getToken: () => {
    if (get().isTokenSet()) {
      return localStorage.getItem('token');
    }
  },
  setToken: (token: string) => {
    set({ token: token });
    localStorage.setItem('token', token);
  },

  // -----------------------------------
  // WALLET
  // -----------------------------------
  isWalletSet: () => {
    const wallet = localStorage.getItem('wallet');
    if (wallet === null || wallet === '') {
      return false;
    } else {
      return true;
    }
  },
  getWallet: () => {
    if (get().isWalletSet()) {
      return localStorage.getItem('wallet');
    }
  },
  setWallet: (wallet: string) => {
    set({ wallet: wallet });
    localStorage.setItem('wallet', wallet);
  },

  // -----------------------------------
  // CONTRACT
  // -----------------------------------
  setContract: (contract: any) => {
    set({ contract: contract });
  },

  // -----------------------------------
  // BALLOT CONTRACT ADDRESS
  // -----------------------------------
  isBallotContractAddressSet: () => {
    const address = localStorage.getItem('contractAddress');
    if (address === null || address === '') {
      return false;
    } else {
      return true;
    }
  },
  getBallotContractAddress: () => {
    if (get().isBallotContractAddressSet()) {
      return localStorage.getItem('contractAddress');
    }
  },
  setBallotContractAddress: (address: string) => {
    set({ contractAddress: address });
    localStorage.setItem('contractAddress', address);
  },

  // -----------------------------------
  // CONNECTION NODE
  // -----------------------------------
  isConnectionNodeUrlSet: () => {
    const url = localStorage.getItem('connectionNodeUrl');
    if (url === null || url === '') {
      return false;
    } else {
      return true;
    }
  },
  getConnectionNodeUrl: () => {
    if (get().isConnectionNodeUrlSet()) {
      return localStorage.getItem('connectionNodeUrl');
    }
  },
  setConnectionNodeUrl: (url: string) => {
    set({ connectionNodeUrl: url });
    localStorage.setItem('connectionNodeUrl', url);
  },
}));
