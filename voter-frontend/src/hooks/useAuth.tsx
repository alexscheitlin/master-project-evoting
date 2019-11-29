import React, {useState, useEffect, useContext} from 'react';
import {EIdentityProviderBackend, AccessProviderBackend} from '../mock';
import axios from 'axios';

interface Auth {
  user: {
    authenticated: boolean;
    token: string;
    wallet: string;
  };
  login: (username: string, password: string) => void;
  setWallet: (wallet: string) => void;
}

const AuthContext = React.createContext<Auth | null>(null);

// Hook for child components to get the auth object
// and re-render when it changes.
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider hook that creates auth object and handles state
function useProvideAuth(): Auth {
  const [user, setUser] = useState({authenticated: false, token: '', wallet: ''});

  const login = (username: string, password: string) => {
    EIdentityProviderBackend.getToken().then((token: any) => {
      setUser({...user, authenticated: true, token: token});
      localStorage.setItem('token', token);
      console.log(token);
    });
  };

  const setWallet = (wallet: string) => {
    setUser({...user, wallet: wallet});
  };

  useEffect(() => {
    const unsubscribe = () => {
      console.log('unsubscribing');
    };
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Return the user object and auth methods
  return {
    user,
    login,
    setWallet,
  };
}

interface ProvideAuthProps {
  children: React.ReactNode;
}

// Provider component that wraps your app and makes auth object
// available to any child component that calls useAuth().
export const ProvideAuth: React.FC<ProvideAuthProps> = ({children}) => {
  const auth: Auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
