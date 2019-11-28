import React, {useState, useEffect, useContext} from 'react';

const AuthContext = React.createContext({});

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const [user, setUser] = useState();

  const login = (email: string, password: string, cb: Function) => {
    setUser({authenticated: true, token: '1234'});
    setTimeout(cb, 1000);
  };

  const logout = (cb: Function) => {
    setUser({authenticated: false, token: ''});
    setTimeout(cb, 1000);
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
  };
}

interface ProvideAuthProps {
  children: React.ReactNode;
}

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export const ProvideAuth: React.FC<ProvideAuthProps> = ({children}) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
