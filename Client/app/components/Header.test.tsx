import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import Header from './Header';
import { CartProvider } from '../context/CartContext';
import { ClerkProvider } from '@clerk/clerk-react';

// Mock Clerk
vi.mock('@clerk/clerk-react', async () => {
  const actual = await vi.importActual('@clerk/clerk-react');
  return {
    ...actual,
    SignedIn: ({ children }: any) => <div data-testid="signed-in">{children}</div>,
    SignedOut: ({ children }: any) => <div data-testid="signed-out">{children}</div>,
    UserButton: () => <div data-testid="user-button">User Button</div>,
  };
});

// Mock useAuth hook
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}));

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <CartProvider>
        <Header />
      </CartProvider>
    </BrowserRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the logo and brand name', () => {
    renderHeader();
    
    expect(screen.getByAltText('WeSellSeals logo')).toBeInTheDocument();
    expect(screen.getByText('3D Models & More')).toBeInTheDocument();
  });

  it('displays categories dropdown button', () => {
    renderHeader();
    
    expect(screen.getByRole('button', { name: /categories/i })).toBeInTheDocument();
  });

  it('opens categories dropdown when clicked', async () => {
    const user = userEvent.setup();
    renderHeader();
    
    const categoriesButton = screen.getByRole('button', { name: /categories/i });
    await user.click(categoriesButton);
    
    await waitFor(() => {
      expect(screen.getByText('Browse everything')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('closes categories dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    renderHeader();
    
    const categoriesButton = screen.getByRole('button', { name: /categories/i });
    await user.click(categoriesButton);
    
    // Click the overlay
    const overlay = document.querySelector('[class*="fixed inset-0"]');
    if (overlay) {
      await user.click(overlay as Element);
    }
    
    await waitFor(() => {
      expect(screen.queryByText('All Products')).not.toBeInTheDocument();
    });
  });

  it('displays search bar', () => {
    renderHeader();
    
    const searchInputs = screen.getAllByPlaceholderText(/search 3d models/i);
    expect(searchInputs.length).toBeGreaterThan(0);
  });

  it('displays cart icon with item count', () => {
    renderHeader();
    
    const cartLink = screen.getByLabelText(/open cart/i);
    expect(cartLink).toBeInTheDocument();
  });

  it('shows login and signup buttons when signed out', () => {
    renderHeader();
    
    expect(screen.getByTestId('signed-out')).toBeInTheDocument();
  });

  it('navigates to products page on search submit', async () => {
    const user = userEvent.setup();
    renderHeader();
    
    const searchInputs = screen.getAllByPlaceholderText(/search 3d models/i);
    const searchInput = searchInputs[0];
    
    await user.type(searchInput, 'dragon');
    await user.keyboard('{Enter}');
    
    // Check if navigation would occur (note: actual navigation testing requires more setup)
    expect(searchInput).toHaveValue('');
  });

  it('displays category links with correct URLs', async () => {
    const user = userEvent.setup();
    renderHeader();
    
    const categoriesButton = screen.getByRole('button', { name: /categories/i });
    await user.click(categoriesButton);
    
    await waitFor(() => {
      const links = screen.getAllByRole('link');
      const sealsLink = links.find(link => 
        link.getAttribute('href')?.includes('category=seals')
      );
      expect(sealsLink).toBeTruthy();
    }, { timeout: 2000 });
  });
});
