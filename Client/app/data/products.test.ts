import { describe, it, expect } from 'vitest';
import { 
  products, 
  categoryInfo, 
  getProductsByCategory, 
  searchProducts 
} from './products';

describe('Products Data', () => {
  describe('products array', () => {
    it('contains products', () => {
      expect(products.length).toBeGreaterThan(0);
    });

    it('all products have required fields', () => {
      products.forEach(product => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('title');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('image');
        expect(product).toHaveProperty('shortDescription');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('tags');
        
        expect(typeof product.id).toBe('string');
        expect(typeof product.title).toBe('string');
        expect(typeof product.price).toBe('number');
        expect(Array.isArray(product.tags)).toBe(true);
      });
    });

    it('all products have valid categories', () => {
      const validCategories = Object.keys(categoryInfo);
      
      products.forEach(product => {
        expect(validCategories).toContain(product.category);
      });
    });

    it('all product IDs are unique', () => {
      const ids = products.map(p => p.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all products have positive prices', () => {
      products.forEach(product => {
        expect(product.price).toBeGreaterThan(0);
      });
    });
  });

  describe('categoryInfo', () => {
    it('contains all expected categories', () => {
      const expectedCategories = [
        'seals', 'sci-fi', 'pirates', 'fantasy', 
        'vehicles', 'architecture', 'animals', 'characters'
      ];
      
      expectedCategories.forEach(category => {
        expect(categoryInfo).toHaveProperty(category);
      });
    });

    it('all categories have required info', () => {
      Object.values(categoryInfo).forEach(info => {
        expect(info).toHaveProperty('name');
        expect(info).toHaveProperty('description');
        expect(info).toHaveProperty('icon');
        
        expect(typeof info.name).toBe('string');
        expect(typeof info.description).toBe('string');
        expect(typeof info.icon).toBe('string');
      });
    });
  });

  describe('getProductsByCategory', () => {
    it('returns products for seals category', () => {
      const seals = getProductsByCategory('seals');
      
      expect(seals.length).toBeGreaterThan(0);
      seals.forEach(product => {
        expect(product.category).toBe('seals');
      });
    });

    it('returns products for sci-fi category', () => {
      const scifi = getProductsByCategory('sci-fi');
      
      expect(scifi.length).toBeGreaterThan(0);
      scifi.forEach(product => {
        expect(product.category).toBe('sci-fi');
      });
    });

    it('returns empty array for category with no products', () => {
      // This should not happen with current data, but tests the function
      const result = getProductsByCategory('nonexistent' as any);
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns different products for different categories', () => {
      const seals = getProductsByCategory('seals');
      const pirates = getProductsByCategory('pirates');
      
      const sealsIds = seals.map(p => p.id);
      const piratesIds = pirates.map(p => p.id);
      
      // No overlap between categories
      const overlap = sealsIds.filter(id => piratesIds.includes(id));
      expect(overlap.length).toBe(0);
    });
  });

  describe('searchProducts', () => {
    it('finds products by title', () => {
      const results = searchProducts('seal');
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(product => {
        const matchesTitle = product.title.toLowerCase().includes('seal');
        const matchesDescription = product.shortDescription.toLowerCase().includes('seal');
        const matchesTags = product.tags.some(tag => tag.toLowerCase().includes('seal'));
        
        expect(matchesTitle || matchesDescription || matchesTags).toBe(true);
      });
    });

    it('finds products by description', () => {
      const results = searchProducts('detailed');
      
      expect(results.length).toBeGreaterThan(0);
    });

    it('finds products by tags', () => {
      const results = searchProducts('collector');
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(product => {
        const matchesTags = product.tags.some(tag => 
          tag.toLowerCase().includes('collector')
        );
        expect(matchesTags).toBe(true);
      });
    });

    it('is case insensitive', () => {
      const lowerResults = searchProducts('dragon');
      const upperResults = searchProducts('DRAGON');
      const mixedResults = searchProducts('DrAgOn');
      
      expect(lowerResults.length).toBe(upperResults.length);
      expect(lowerResults.length).toBe(mixedResults.length);
    });

    it('returns empty array when no matches', () => {
      const results = searchProducts('xyznonexistentproduct123');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('can search within a specific category', () => {
      const results = searchProducts('seal', 'seals');
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(product => {
        expect(product.category).toBe('seals');
      });
    });

    it('filters by category when provided', () => {
      const allSpaceResults = searchProducts('space');
      const scifiSpaceResults = searchProducts('space', 'sci-fi');
      
      scifiSpaceResults.forEach(product => {
        expect(product.category).toBe('sci-fi');
      });
      
      expect(scifiSpaceResults.length).toBeLessThanOrEqual(allSpaceResults.length);
    });
  });

  describe('product distribution', () => {
    it('has products in each category', () => {
      const categories = Object.keys(categoryInfo);
      
      categories.forEach(category => {
        const categoryProducts = getProductsByCategory(category as any);
        expect(categoryProducts.length).toBeGreaterThan(0);
      });
    });

    it('has a reasonable distribution of products', () => {
      const categories = Object.keys(categoryInfo);
      const counts = categories.map(cat => 
        getProductsByCategory(cat as any).length
      );
      
      // Each category should have at least 2 products
      counts.forEach(count => {
        expect(count).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
