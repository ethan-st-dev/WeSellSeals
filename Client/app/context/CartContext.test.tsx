import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    expect(result.current.state.items).toEqual([]);
    expect(result.current.state.totalItems).toBe(0);
    expect(result.current.state.totalPrice).toBe(0);
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item = {
      id: 'test-1',
      title: 'Test Product',
      price: 10.99,
      imageSrc: '/test.jpg',
    };
    
    act(() => {
      result.current.addItem(item);
    });
    
    expect(result.current.state.items.length).toBe(1);
    expect(result.current.state.items[0].id).toBe('test-1');
    expect(result.current.state.totalItems).toBe(1);
    expect(result.current.state.totalPrice).toBeCloseTo(10.99, 2);
  });

  it('prevents adding duplicate items (digital products)', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item = {
      id: 'test-1',
      title: 'Test Product',
      price: 10.00,
      imageSrc: '/test.jpg',
    };
    
    act(() => {
      result.current.addItem(item);
      result.current.addItem(item); // Should not add again
      result.current.addItem(item); // Should not add again
    });
    
    expect(result.current.state.items.length).toBe(1);
    expect(result.current.state.totalItems).toBe(1);
    expect(result.current.state.totalPrice).toBeCloseTo(10.00, 2);
  });

  it('checks if item is in cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item = {
      id: 'test-1',
      title: 'Test Product',
      price: 10.00,
      imageSrc: '/test.jpg',
    };
    
    act(() => {
      result.current.addItem(item);
    });
    
    expect(result.current.isInCart('test-1')).toBe(true);
    expect(result.current.isInCart('test-2')).toBe(false);
  });

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item = {
      id: 'test-1',
      title: 'Test Product',
      price: 10.00,
      imageSrc: '/test.jpg',
    };
    
    act(() => {
      result.current.addItem(item);
      result.current.removeItem('test-1');
    });
    
    expect(result.current.state.items.length).toBe(0);
    expect(result.current.state.totalItems).toBe(0);
    expect(result.current.state.totalPrice).toBe(0);
  });

  it('clears cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item1 = {
      id: 'test-1',
      title: 'Test Product 1',
      price: 10.00,
      imageSrc: '/test1.jpg',
    };
    
    const item2 = {
      id: 'test-2',
      title: 'Test Product 2',
      price: 15.00,
      imageSrc: '/test2.jpg',
    };
    
    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
      result.current.clearCart();
    });
    
    expect(result.current.state.items).toEqual([]);
    expect(result.current.state.totalItems).toBe(0);
    expect(result.current.state.totalPrice).toBe(0);
  });

  it('calculates total price correctly with multiple items', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item1 = {
      id: 'test-1',
      title: 'Test Product 1',
      price: 10.50,
      imageSrc: '/test1.jpg',
    };
    
    const item2 = {
      id: 'test-2',
      title: 'Test Product 2',
      price: 15.25,
      imageSrc: '/test2.jpg',
    };
    
    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
    });
    
    // For digital products: 10.50 + 15.25 = 25.75
    expect(result.current.state.totalPrice).toBeCloseTo(25.75, 2);
    expect(result.current.state.totalItems).toBe(2);
  });

  it('handles removing non-existent item gracefully', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    expect(() => {
      act(() => {
        result.current.removeItem('non-existent');
      });
    }).not.toThrow();
    
    expect(result.current.state.items).toEqual([]);
  });

  it('persists cart to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    const item = {
      id: 'test-1',
      title: 'Test Product',
      price: 10.00,
      imageSrc: '/test.jpg',
    };
    
    act(() => {
      result.current.addItem(item);
    });
    
    const stored = localStorage.getItem('wessellseals_cart_v1');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.items.length).toBe(1);
    expect(parsed.items[0].id).toBe('test-1');
  });
});
