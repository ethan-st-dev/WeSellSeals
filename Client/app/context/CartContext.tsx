import React, { createContext, useContext, useEffect, useReducer } from "react";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
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
  const totalItems = items.reduce((s, it) => s + it.quantity, 0);
  const totalPrice = items.reduce((s, it) => s + it.price * it.quantity, 0);
  return { totalItems, totalPrice };
}

type Action =
  | { type: "ADD"; payload: { item: Omit<CartItem, "quantity">; quantity?: number } }
  | { type: "REMOVE"; payload: { id: string } }
  | { type: "UPDATE"; payload: { id: string; quantity: number } }
  | { type: "CLEAR" }
  | { type: "SET"; payload: CartState };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "ADD": {
      const { item, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.id === item.id);
      let newItems: CartItem[];
      if (existing) {
        newItems = state.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i));
      } else {
        newItems = [...state.items, { ...item, quantity } as CartItem];
      }
      const totals = calcTotals(newItems);
      return { items: newItems, ...totals };
    }
    case "REMOVE": {
      const newItems = state.items.filter((i) => i.id !== action.payload.id);
      const totals = calcTotals(newItems);
      return { items: newItems, ...totals };
    }
    case "UPDATE": {
      const { id, quantity } = action.payload;
      const newItems = state.items
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i))
        .filter((i) => i.quantity > 0);
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
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
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

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) =>
    dispatch({ type: "ADD", payload: { item, quantity } });

  const removeItem = (id: string) => dispatch({ type: "REMOVE", payload: { id } });

  const updateQuantity = (id: string, quantity: number) =>
    dispatch({ type: "UPDATE", payload: { id, quantity } });

  const clearCart = () => dispatch({ type: "CLEAR" });

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

