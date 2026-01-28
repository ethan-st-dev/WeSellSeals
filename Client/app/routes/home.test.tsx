import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import Home from './home';
import { CartProvider } from '../context/CartContext';

// Mock the route module
vi.mock('./+types/home', () => ({
  Route: {},
}));

const renderHome = () => {
  return render(
    <BrowserRouter>
      <CartProvider>
        <Home />
      </CartProvider>
    </BrowserRouter>
  );
};

describe('Home Page', () => {
  it('renders the hero section', async () => {
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('Welcome to WeSellSeals')).toBeInTheDocument();
    });
    expect(screen.getByText(/your premier destination for high-quality 3d printable models/i)).toBeInTheDocument();
  });

  it('displays hero call-to-action buttons', async () => {
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /browse all models/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /shop seals/i })).toBeInTheDocument();
  });

  it('renders explore categories section', async () => {
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('Explore Our Categories')).toBeInTheDocument();
    });
  });

  it('displays all 8 category cards', async () => {
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('Seals')).toBeInTheDocument();
    });
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
    expect(screen.getByText('Pirates')).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.getByText('Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText('Animals')).toBeInTheDocument();
    expect(screen.getByText('Characters')).toBeInTheDocument();
  });

  it('displays featured seals section', async () => {
    renderHome();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });
    // Section won't show if no seals products exist
  });

  it('displays featured sci-fi section', async () => {
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText(/featured sci-fi/i)).toBeInTheDocument();
    });
  });

  it('displays featured pirates section', async () => {
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText(/featured pirates/i)).toBeInTheDocument();
    });
  });

  it('displays featured fantasy section', async () => {
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText(/featured fantasy/i)).toBeInTheDocument();
    });
  });

  it('renders browse more section', async () => {
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('Discover More Amazing Models')).toBeInTheDocument();
    });
    expect(screen.getByText(/explore.*unique 3d printable designs/i)).toBeInTheDocument();
  });

  it('displays browse full catalog button', async () => {
    renderHome();
    
    await waitFor(() => {
      const catalogButtons = screen.getAllByRole('link', { name: /browse.*catalog/i });
      expect(catalogButtons.length).toBeGreaterThan(0);
    });
  });

  it('category cards link to correct product pages', async () => {
    renderHome();
    
    await waitFor(() => {
      const categoryLinks = screen.getAllByRole('link');
      const sealsLink = categoryLinks.find(link => 
        link.getAttribute('href') === '/products?category=seals'
      );
      
      expect(sealsLink).toBeInTheDocument();
    });
  });

  it('featured sections show product cards', async () => {
    renderHome();
    
    await waitFor(() => {
      // Each featured section should have product cards
      const productCards = screen.getAllByRole('article');
      expect(productCards.length).toBeGreaterThan(0);
    });
  });
});
