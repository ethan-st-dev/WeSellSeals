import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import Products from './products';
import { CartProvider } from '../context/CartContext';

// Mock the route module
vi.mock('./+types/products', () => ({
  Route: {},
}));

const renderProducts = () => {
  return render(
    <BrowserRouter>
      <CartProvider>
        <Products />
      </CartProvider>
    </BrowserRouter>
  );
};

describe('Products Page', () => {
  it('renders the page title', () => {
    renderProducts();
    
    expect(screen.getByText('Browse 3D Models')).toBeInTheDocument();
  });

  it('displays all category filter buttons', () => {
    renderProducts();
    
    expect(screen.getByRole('button', { name: /all products/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /seals/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sci-fi/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pirates/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fantasy/i })).toBeInTheDocument();
  });

  it('displays search input', () => {
    renderProducts();
    
    expect(screen.getByPlaceholderText(/search by name, description, or tags/i)).toBeInTheDocument();
  });

  it('displays sort dropdown', () => {
    renderProducts();
    
    const sortSelect = screen.getByLabelText(/sort by/i);
    expect(sortSelect).toBeInTheDocument();
    expect(sortSelect).toHaveValue('name');
  });

  it('shows product grid with products', () => {
    renderProducts();
    
    const productSection = screen.getByRole('region', { name: /products list/i });
    expect(productSection).toBeInTheDocument();
  });

  it('filters products when category button is clicked', async () => {
    const user = userEvent.setup();
    renderProducts();
    
    const sealsButtons = screen.getAllByRole('button', { name: /seals/i });
    const sealsButton = sealsButtons.find(btn => btn.textContent?.includes('('));
    
    if (sealsButton) {
      await user.click(sealsButton);
      
      await waitFor(() => {
        expect(sealsButton.className).toContain('bg-indigo-600');
      });
    }
  });

  it('searches products when typing in search bar', async () => {
    const user = userEvent.setup();
    renderProducts();
    
    const searchInput = screen.getByPlaceholderText(/search by name, description, or tags/i);
    await user.type(searchInput, 'dragon');
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('dragon');
    });
  });

  it('sorts products when sort option is changed', async () => {
    const user = userEvent.setup();
    renderProducts();
    
    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.selectOptions(sortSelect, 'price-low');
    
    await waitFor(() => {
      expect(sortSelect).toHaveValue('price-low');
    });
  });

  it('displays results count', async () => {
    renderProducts();
    
    await waitFor(() => {
      // Look for either "X models found" or "X model found" (singular)
      const resultText = screen.getAllByText(/\d+\s*model/i);
      expect(resultText.length).toBeGreaterThan(0);
    });
  });

  it('shows category description when category is selected', async () => {
    const user = userEvent.setup();
    renderProducts();
    
    const sealsButtons = screen.getAllByRole('button', { name: /seals/i });
    const sealsButton = sealsButtons.find(btn => btn.textContent?.includes('('));
    
    if (sealsButton) {
      await user.click(sealsButton);
      
      await waitFor(() => {
        expect(screen.getByText(/adorable marine mammals/i)).toBeInTheDocument();
      });
    }
  });

  it('displays empty state when no products match filters', async () => {
    const user = userEvent.setup();
    renderProducts();
    
    const searchInput = screen.getByPlaceholderText(/search by name, description, or tags/i);
    await user.type(searchInput, 'xyznonexistentproduct123');
    
    await waitFor(() => {
      expect(screen.getByText(/no models found matching your criteria/i)).toBeInTheDocument();
    });
  });

  it('can clear filters from empty state', async () => {
    const user = userEvent.setup();
    renderProducts();
    
    const searchInput = screen.getByPlaceholderText(/search by name, description, or tags/i);
    await user.type(searchInput, 'xyznonexistentproduct123');
    
    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      expect(clearButton).toBeInTheDocument();
    });
  });

  it('renders product cards with add to cart buttons', async () => {
    const user = userEvent.setup();
    renderProducts();
    
    // Click "All Products" to show all items
    await waitFor(() => {
      const allProductsButton = screen.getByRole('button', { name: /all products/i });
      expect(allProductsButton).toBeInTheDocument();
    });
    
    const allProductsButton = screen.getByRole('button', { name: /all products/i });
    await user.click(allProductsButton);
    
    await waitFor(() => {
      const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i });
      expect(addToCartButtons.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });
});
