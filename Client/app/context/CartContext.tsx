import React, { createContext, useContext, useEffect, useReducer } from "react";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  imageSrc?: string;
};

export type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
};

const STORAGE_KEY = "wessellseals_cart_v1";

const initialState: CartState = { items: [], totalItems: 0, totalPrice: 0 };

function calcTotals(items: CartItem[]) {
  const totalItems = items.length;
  const totalPrice = items.reduce((s, it) => s + it.price, 0);
  return { totalItems, totalPrice };
}

type Action =
  | { type: "ADD"; payload: { item: CartItem } }
  | { type: "REMOVE"; payload: { id: string } }
  | { type: "CLEAR" }
  | { type: "SET"; payload: CartState };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "ADD": {
      const { item } = action.payload;
      // Check if item already in cart (digital products can only be added once)
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return state; // Already in cart, don't add again
      }
      const newItems = [...state.items, item];
      const totals = calcTotals(newItems);
      return { items: newItems, ...totals };
    }
    case "REMOVE": {
      const newItems = state.items.filter((i) => i.id !== action.payload.id);
      const totals = calcTotals(newItems);
      return { items: newItems, ...totals };
    }
    case "CLEAR":
      return initialState;
    default:
      return state;
  }
}

type CartContextValue = {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    (init) => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return init;
        const parsed = JSON.parse(raw) as CartState;
        return parsed;
      } catch {
        return init;
      }
    }
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const addItem = (item: CartItem) =>
    dispatch({ type: "ADD", payload: { item } });

  const removeItem = (id: string) => dispatch({ type: "REMOVE", payload: { id } });

  const clearCart = () => dispatch({ type: "CLEAR" });

  const isInCart = (id: string) => state.items.some((item) => item.id === id);

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

