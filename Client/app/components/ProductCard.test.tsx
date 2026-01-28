import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import ProductCard from './ProductCard';
import { CartProvider } from '../context/CartContext';
import * as AuthContext from '../context/AuthContext';

// Mock the auth context
//mock
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ProductCard', () => {
  const mockSeal = {
    id: 'harbor-seal',
    title: 'Harbor Seal',
    price: 9.99,
    imageSrc: '/seals/harbor.jpg',
    imageAlt: 'Harbor Seal',
  };

  beforeEach(() => {
    // Mock useAuth to return null user (not logged in)
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      getToken: vi.fn().mockResolvedValue(null),
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <CartProvider>{component}</CartProvider>
      </BrowserRouter>
    );
  };

  it('renders seal information correctly', () => {
    renderWithProviders(<ProductCard {...mockSeal} />);

    expect(screen.getByText('Harbor Seal')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
  });

  it('displays seal image', () => {
    renderWithProviders(<ProductCard {...mockSeal} />);

    const image = screen.getByAltText('Harbor Seal');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/seals/harbor.jpg');
  });

  it('links to product detail page', () => {
    renderWithProviders(<ProductCard {...mockSeal} />);

    const links = screen.getAllByRole('link');
    const productLink = links.find(link => link.getAttribute('href') === '/products/harbor-seal');
    expect(productLink).toBeInTheDocument();
  });

  it('displays formatted price correctly', () => {
    renderWithProviders(<ProductCard {...mockSeal} price={14.99} />);

    expect(screen.getByText('$14.99')).toBeInTheDocument();
  });

  it('uses default alt text when not provided', () => {
    const sealWithoutAlt = { ...mockSeal };
    delete (sealWithoutAlt as any).imageAlt;
    
    renderWithProviders(<ProductCard {...sealWithoutAlt} />);

    const image = screen.getByAltText('Product image');
    expect(image).toBeInTheDocument();
  });
});
