import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getProducts,
  getProduct,
  getProductsByCategory,
  searchProducts,
  categories,
  type Product 
} from './products';

// Mock the apiClient
vi.mock('~/lib/apiClient', () => ({
  apiClient: vi.fn(),
  API_URL: 'http://localhost:5159'
}));

import { apiClient } from '~/lib/apiClient';

describe('Products Data', () => {
  const mockProducts: Product[] = [
    {
      id: 'seal-1',
      title: 'Harbor Seal Classic',
      price: 9.99,
      image: '/seal-logo2.png',
      shortDescription: 'A compact, adorable harbor seal figure.',
      category: 'seals',
      tags: ['classic', 'small', 'marine']
    },
    {
      id: 'robot-1',
      title: 'Futuristic Android',
      price: 34.99,
      image: 'https://picsum.photos/seed/android/800/600',
      shortDescription: 'A sleek android figure.',
      category: 'sci-fi',
      tags: ['robot', 'futuristic']
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('fetches and normalizes products from API', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockProducts)
      };
      (apiClient as any).mockResolvedValue(mockResponse);

      const products = await getProducts();
      
      expect(apiClient).toHaveBeenCalledWith('/api/products');
      expect(products).toHaveLength(2);
      expect(products[0].id).toBe('seal-1');
    });

    it('throws error if API call fails', async () => {
      const mockResponse = { ok: false };
      (apiClient as any).mockResolvedValue(mockResponse);

      await expect(getProducts()).rejects.toThrow('Failed to fetch products');
    });
  });

  describe('getProduct', () => {
    it('fetches single product by ID', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockProducts[0])
      };
      (apiClient as any).mockResolvedValue(mockResponse);

      const product = await getProduct('seal-1');
      
      expect(apiClient).toHaveBeenCalledWith('/api/products/seal-1');
      expect(product?.id).toBe('seal-1');
      expect(product?.title).toBe('Harbor Seal Classic');
    });

    it('returns null for 404', async () => {
      const mockResponse = { ok: false, status: 404 };
      (apiClient as any).mockResolvedValue(mockResponse);

      const product = await getProduct('nonexistent');
      
      expect(product).toBeNull();
    });
  });

  describe('getProductsByCategory', () => {
    it('fetches products by category', async () => {
      const sealsOnly = [mockProducts[0]];
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(sealsOnly)
      };
      (apiClient as any).mockResolvedValue(mockResponse);

      const products = await getProductsByCategory('seals');
      
      expect(apiClient).toHaveBeenCalledWith('/api/products/category/seals');
      expect(products).toHaveLength(1);
      expect(products[0].category).toBe('seals');
    });
  });

  describe('searchProducts', () => {
    it('returns all products when no query or category', () => {
      const result = searchProducts(mockProducts, '', undefined);
      expect(result).toEqual(mockProducts);
    });

    it('filters by category', () => {
      const result = searchProducts(mockProducts, '', 'seals');
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('seals');
    });

    it('filters by search query in title', () => {
      const result = searchProducts(mockProducts, 'android', undefined);
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain('Android');
    });

    it('filters by search query in tags', () => {
      const result = searchProducts(mockProducts, 'marine', undefined);
      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('marine');
    });

    it('combines category and search query', () => {
      const result = searchProducts(mockProducts, 'classic', 'seals');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('seal-1');
    });

    it('is case-insensitive', () => {
      const result = searchProducts(mockProducts, 'ANDROID', undefined);
      expect(result).toHaveLength(1);
    });
  });

  describe('categories metadata', () => {
    it('contains all expected categories', () => {
      expect(categories).toHaveProperty('seals');
      expect(categories).toHaveProperty('sci-fi');
      expect(categories).toHaveProperty('pirates');
      expect(categories).toHaveProperty('fantasy');
      expect(categories).toHaveProperty('vehicles');
      expect(categories).toHaveProperty('architecture');
      expect(categories).toHaveProperty('animals');
      expect(categories).toHaveProperty('characters');
    });

    it('each category has required fields', () => {
      Object.values(categories).forEach(category => {
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('icon');
      });
    });
  });
});
