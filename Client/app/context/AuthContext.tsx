import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string) => {
    setUser({ email });
    
    // Check cart for owned seals and remove them
    await cleanCartOfOwnedSeals();
  };

  const cleanCartOfOwnedSeals = async () => {
    try {
      // Get cart items from localStorage
      const cartData = localStorage.getItem('wessellseals_cart_v1');
      if (!cartData) return;
      
      const cart = JSON.parse(cartData);
      if (!cart.items || cart.items.length === 0) return;
      
      const sealIds = cart.items.map((item: any) => item.id);
      
      // Check which seals the user already owns
      const response = await fetch('http://localhost:5159/api/purchases/check-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ sealIds }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.ownedSealIds && data.ownedSealIds.length > 0) {
          // Remove owned seals from cart
          const updatedItems = cart.items.filter(
            (item: any) => !data.ownedSealIds.includes(item.id)
          );
          
          // Recalculate totals
          const totalItems = updatedItems.length;
          const totalPrice = updatedItems.reduce((sum: number, item: any) => sum + item.price, 0);
          
          // Update localStorage
          localStorage.setItem('wessellseals_cart_v1', JSON.stringify({
            items: updatedItems,
            totalItems,
            totalPrice,
          }));
          
          // Trigger a storage event to update the cart context
          window.dispatchEvent(new Event('storage'));
        }
      }
    } catch (error) {
      console.error('Error cleaning cart:', error);
    }
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