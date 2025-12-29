import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5159/api/auth/user', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.email) {
            setUser({ email: data.email });
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    checkAuth();
  }, []);

  const login = (email: string) => {
    setUser({ email });
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5159/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);