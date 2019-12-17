import { create } from 'zustand'

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
  logout: (): void => {
    localStorage.clear()
    set({ authenticated: false })
  },

  // -----------------------------------
  // AUTHENTICATION
  // -----------------------------------
  isAuthenticated: (): boolean => {
    const isAuth = localStorage.getItem('authenticated')
    if (isAuth === 'true') {
      return true
    } else {
      return false
    }
  },
  setAuthenicated: (auth: boolean): void => {
    set({ authenticated: auth })
    localStorage.setItem('authenticated', auth.toString())
  },

  // -----------------------------------
  // TOKEN
  // -----------------------------------
  isTokenSet: (): boolean => {
    const token = localStorage.getItem('token')
    if (token === null || token === '') {
      return false
    } else {
      return true
    }
  },
  getToken: (): string | undefined | null => {
    if (get().isTokenSet()) {
      return localStorage.getItem('token')
    }
  },
  setToken: (token: string): void => {
    set({ token: token })
    localStorage.setItem('token', token)
  },

  // -----------------------------------
  // WALLET
  // -----------------------------------
  isWalletSet: (): boolean => {
    const wallet = localStorage.getItem('wallet')
    if (wallet === null || wallet === '') {
      return false
    } else {
      return true
    }
  },
  getWallet: (): string | undefined | null => {
    if (get().isWalletSet()) {
      return localStorage.getItem('wallet')
    }
  },
  setWallet: (wallet: string): void => {
    set({ wallet: wallet })
    localStorage.setItem('wallet', wallet)
  },

  // -----------------------------------
  // CONTRACT
  // -----------------------------------
  setContract: (contract: any): void => {
    set({ contract: contract })
  },

  // -----------------------------------
  // BALLOT CONTRACT ADDRESS
  // -----------------------------------
  isBallotContractAddressSet: (): boolean => {
    const address = localStorage.getItem('contractAddress')
    if (address === null || address === '') {
      return false
    } else {
      return true
    }
  },
  getBallotContractAddress: (): string | undefined | null => {
    if (get().isBallotContractAddressSet()) {
      return localStorage.getItem('contractAddress')
    }
  },
  setBallotContractAddress: (address: string): void => {
    set({ contractAddress: address })
    localStorage.setItem('contractAddress', address)
  },

  // -----------------------------------
  // CONNECTION NODE
  // -----------------------------------
  isConnectionNodeUrlSet: (): boolean => {
    const url = localStorage.getItem('connectionNodeUrl')
    if (url === null || url === '') {
      return false
    } else {
      return true
    }
  },
  getConnectionNodeUrl: (): string | undefined | null => {
    if (get().isConnectionNodeUrlSet()) {
      return localStorage.getItem('connectionNodeUrl')
    }
  },
  setConnectionNodeUrl: (url: string): void => {
    set({ connectionNodeUrl: url })
    localStorage.setItem('connectionNodeUrl', url)
  },
}))
