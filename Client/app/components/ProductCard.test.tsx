import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  const mockSeal = {
    id: 'harbor-seal',
    title: 'Harbor Seal',
    price: 9.99,
    imageSrc: '/seals/harbor.jpg',
    imageAlt: 'Harbor Seal',
  };

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders seal information correctly', () => {
    renderWithRouter(<ProductCard {...mockSeal} />);

    expect(screen.getByText('Harbor Seal')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
  });

  it('displays seal image', () => {
    renderWithRouter(<ProductCard {...mockSeal} />);

    const image = screen.getByAltText('Harbor Seal');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/seals/harbor.jpg');
  });

  it('links to seal detail page', () => {
    renderWithRouter(<ProductCard {...mockSeal} />);

    const link = screen.getByRole('link', { name: /view details for harbor seal/i });
    expect(link).toHaveAttribute('href', '/seals/harbor-seal');
  });

  it('displays formatted price correctly', () => {
    renderWithRouter(<ProductCard {...mockSeal} price={14.99} />);

    expect(screen.getByText('$14.99')).toBeInTheDocument();
  });

  it('uses default alt text when not provided', () => {
    const sealWithoutAlt = { ...mockSeal };
    delete (sealWithoutAlt as any).imageAlt;
    
    renderWithRouter(<ProductCard {...sealWithoutAlt} />);

    const image = screen.getByAltText('Product image');
    expect(image).toBeInTheDocument();
  });
});
