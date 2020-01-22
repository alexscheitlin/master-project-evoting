import { create } from 'zustand'
import { VoteTransaction } from '../models/voting'

export const [useVoterStore] = create((set, get) => ({
  authenticated: false,
  token: '',
  wallet: '',
  contract: {},
  contractAddress: '',
  connectionNodeUrl: '',
  error: false,
  message: '',
  voteTx: '',

  // -----------------------------------
  // SET Message
  // -----------------------------------
  setMessage: (message: string) => {
    set({ message: message })
  },

  // -----------------------------------
  // SET IF ERRORs
  // -----------------------------------
  setError: (flag: boolean) => {
    set({ error: flag })
  },

  // -----------------------------------
  // LOGOUT
  // -----------------------------------
  logout: (): void => {
    sessionStorage.clear()
    set({ authenticated: false })
  },

  // -----------------------------------
  // AUTHENTICATION
  // -----------------------------------
  isAuthenticated: (): boolean => {
    const isAuth = sessionStorage.getItem('authenticated')
    if (isAuth === 'true') {
      return true
    } else {
      return false
    }
  },
  setAuthenicated: (auth: boolean): void => {
    set({ authenticated: auth })
    sessionStorage.setItem('authenticated', auth.toString())
  },

  // -----------------------------------
  // TOKEN
  // -----------------------------------
  isTokenSet: (): boolean => {
    const token = sessionStorage.getItem('token')
    if (token === null || token === '') {
      return false
    } else {
      return true
    }
  },
  getToken: (): string | undefined | null => {
    if (get().isTokenSet()) {
      return sessionStorage.getItem('token')
    }
  },
  setToken: (token: string): void => {
    set({ token: token })
    sessionStorage.setItem('token', token)
  },

  // -----------------------------------
  // WALLET
  // -----------------------------------
  isWalletSet: (): boolean => {
    const wallet = sessionStorage.getItem('wallet')
    if (wallet === null || wallet === '') {
      return false
    } else {
      return true
    }
  },
  getWallet: (): string | undefined | null => {
    if (get().isWalletSet()) {
      return sessionStorage.getItem('wallet')
    }
  },
  setWallet: (wallet: string): void => {
    set({ wallet: wallet })
    sessionStorage.setItem('wallet', wallet)
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
    const address = sessionStorage.getItem('contractAddress')
    if (address === null || address === '') {
      return false
    } else {
      return true
    }
  },
  getBallotContractAddress: (): string | undefined | null => {
    if (get().isBallotContractAddressSet()) {
      return sessionStorage.getItem('contractAddress')
    }
  },
  setBallotContractAddress: (address: string): void => {
    set({ contractAddress: address })
    sessionStorage.setItem('contractAddress', address)
  },

  // -----------------------------------
  // CONNECTION NODE
  // -----------------------------------
  isConnectionNodeUrlSet: (): boolean => {
    const url = sessionStorage.getItem('connectionNodeUrl')
    if (url === null || url === '') {
      return false
    } else {
      return true
    }
  },
  getConnectionNodeUrl: (): string | undefined | null => {
    if (get().isConnectionNodeUrlSet()) {
      return sessionStorage.getItem('connectionNodeUrl')
    }
  },
  setConnectionNodeUrl: (url: string): void => {
    set({ connectionNodeUrl: url })
    sessionStorage.setItem('connectionNodeUrl', url)
  },

  // -----------------------------------
  // Vote Transaction
  // -----------------------------------
  isVoteTxSet: (): boolean => {
    const tx = sessionStorage.getItem('voteTx')
    if (tx === null || tx === '') {
      return false
    } else {
      return true
    }
  },
  getVoteTx: (): VoteTransaction | undefined | null => {
    if (get().isVoteTxSet()) {
      const tx = sessionStorage.getItem('voteTx')
      if (tx !== null) {
        set({ voteTx: JSON.parse(tx) })
        return JSON.parse(tx)
      }
    } else {
      return undefined
    }
  },
  setVoteTx: (tx: VoteTransaction) => {
    set({ voteTx: tx })
    sessionStorage.setItem('voteTx', JSON.stringify(tx))
  },
}))
