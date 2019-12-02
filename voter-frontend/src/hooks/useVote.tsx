import React, { useState, useContext } from 'react';
import { EIdentityProviderBackend, AccessProviderBackend } from '../services';

interface VoterContext {
  user: {
    authenticated: boolean;
    token: string;
    wallet: string;
  };
  contractAddress: string;
  login: (username: string, password: string) => Promise<boolean>;
  fundWallet: (token: string, wallet: string) => Promise<boolean>;
  setBallotContract: (contract: any) => void;
}

const VoterContext = React.createContext<VoterContext | null>(null);

// Hook for child components to get the auth object
// and re-render when it changes.
export const useVote = (): VoterContext | null => {
  return useContext(VoterContext);
};

// Provider hook that creates auth object and handles state
function useProvideVoterContext(): VoterContext {
  const [user, setUser] = useState({ authenticated: false, token: '', wallet: '' });
  const [contractAddress, setContractAddress] = useState('');
  const [contract, setContract] = useState();

  const login = async (username: string, password: string): Promise<boolean> => {
    const token: any = await EIdentityProviderBackend.getToken(username, password);
    setUser({ ...user, authenticated: true, token: token });
    return true;
  };

  const fundWallet = async (token: string, wallet: string): Promise<boolean> => {
    const address: string = await AccessProviderBackend.fundWallet(token, wallet);
    setUser({ ...user, wallet: wallet });
    setContractAddress(address);
    return true;
  };

  const setBallotContract = (ballotContract: any) => {
    setContract(ballotContract);
  };

  // Return the state & functions
  return {
    user,
    contractAddress,
    login,
    fundWallet,
    setBallotContract,
  };
}

interface ProvideVoterContextProps {
  children: React.ReactNode;
}

export const ProvideVoterContext: React.FC<ProvideVoterContextProps> = ({ children }) => {
  const voterCtx: VoterContext = useProvideVoterContext();
  return <VoterContext.Provider value={voterCtx}>{children}</VoterContext.Provider>;
};
