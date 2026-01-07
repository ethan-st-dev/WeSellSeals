import React, { createContext, useContext, useEffect } from 'react';
import { useUser, useClerk, useSession } from '@clerk/clerk-react';
import { API_URL } from '../lib/apiClient';

interface User {
  email: string;
  id: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  getToken: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { session } = useSession();

  useEffect(() => {
    if (isLoaded && clerkUser) {
      cleanCartOfOwnedSeals();
    }
  }, [isLoaded, clerkUser]);

  const login = async (email: string) => {
    // Login is handled by Clerk, this is just for compatibility
    await cleanCartOfOwnedSeals();
  };

  const logout = async () => {
    await signOut();
  };
  const getToken = async (): Promise<string | null> => {
    if (!session) return null;
    try {
      // Get the session token from Clerk
      const token = await session.getToken();
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const cleanCartOfOwnedSeals = async () => {
    try {
      // Get cart items from localStorage
      const cartData = localStorage.getItem('wessellseals_cart_v1');
      if (!cartData) return;
      
      const cart = JSON.parse(cartData);
      if (!cart.items || cart.items.length === 0) return;
      
      const sealIds = cart.items.map((item: any) => item.id);
      
      // Get auth token
      const token = await getToken();
      if (!token) return;
      
      // Check which seals the user already owns
      const response = await fetch(`${API_URL}/api/purchases/check-multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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

  const user = clerkUser
    ? {
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        id: clerkUser.id,
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
      }
    : null;

  return (
    <AuthContext.Provider value={{ user, loading: !isLoaded, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);