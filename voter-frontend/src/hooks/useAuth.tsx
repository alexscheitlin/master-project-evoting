import React, {useState, useEffect, useContext} from 'react';
import {loginUser, logoutUser, delay} from '../util/fakeAuth';

interface Auth {
  user: {
    authenticated: boolean;
    token: string;
    wallet: string;
  };
  login: (username: string, password: string) => void;
  logout: () => void;
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
    loginUser(username, password).then(res => {
      setUser({...user, authenticated: true, token: res.token});
      localStorage.setItem('token', res.token);
    });
  };

  const logout = () => {
    logoutUser().then(() => {
      setUser({...user, authenticated: false, token: ''});
      localStorage.setItem('token', '');
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
    logout,
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
