import { apiClient } from "~/lib/apiClient";

export type ProductCategory = 
  | "seals"
  | "sci-fi"
  | "pirates"
  | "fantasy"
  | "vehicles"
  | "architecture"
  | "animals"
  | "characters";

export type Comment = {
  id: string;
  productId: string;
  userId: string;
  userName: string; 
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  shortDescription: string;
  longDescription?: string;
  modelUrl?: string; // optional 3D model URL (GLB)
  category: ProductCategory;
  subcategory?: string;
  tags: string | string[]; // API returns JSON string, we'll parse it
  createdAt?: string;
  updatedAt?: string;
  comments?: Comment[];
};

// Convert API product to frontend product (parse tags if needed)
function normalizeProduct(product: any): Product {
  return {
    ...product,
    tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
  };
}

// Fetch all products from API
export async function getProducts(): Promise<Product[]> {
  const response = await apiClient('/api/products');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const products = await response.json();
  return products.map(normalizeProduct);
}

// Fetch single product by ID
export async function getProduct(id: string): Promise<Product | null> {
  const response = await apiClient(`/api/products/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch product');
  }
  const product = await response.json();
  return normalizeProduct(product);
}

// Fetch products by category
export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const response = await apiClient(`/api/products/category/${category}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const products = await response.json();
  return products.map(normalizeProduct);
}

// Create a new product (requires authentication)
export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Product> {
  const productData = {
    ...product,
    tags: typeof product.tags === 'string' ? product.tags : JSON.stringify(product.tags),
  };
  
  const response = await apiClient('/api/products', {
    method: 'POST',
    body: JSON.stringify(productData),
    token,
  });
  
  if (!response.ok) {
    throw new Error('Failed to create product');
  }
  
  const createdProduct = await response.json();
  return normalizeProduct(createdProduct);
}

// Update an existing product (requires authentication)
export async function updateProduct(id: string, product: Partial<Product>, token: string): Promise<Product> {
  const productData = {
    ...product,
    tags: product.tags ? (typeof product.tags === 'string' ? product.tags : JSON.stringify(product.tags)) : undefined,
  };
  
  const response = await apiClient(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
    token,
  });
  
  if (!response.ok) {
    throw new Error('Failed to update product');
  }
  
  const updatedProduct = await response.json();
  return normalizeProduct(updatedProduct);
}

// Delete a product (requires authentication)
export async function deleteProduct(id: string, token: string): Promise<void> {
  const response = await apiClient(`/api/products/${id}`, {
    method: 'DELETE',
    token,
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete product');
  }
}

export async function addComment(productId: string, content: string, token: string): Promise<Comment> {
  const response = await apiClient(`/api/products/${productId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
    token,
  });

  if (!response.ok) {
    throw new Error('Failed to add comment');
  }

  const comment = await response.json();
  return comment;
}
export async function deleteComment(productId: string, commentId: string, token: string): Promise<void> {
  const response = await apiClient(`/api/products/${productId}/comments/${commentId}`, {
    method: 'DELETE',
    token,
  });

  if (!response.ok) {
    throw new Error('Failed to delete comment');
  }
}
export async function editComment(productId: string, commentId: string, content: string, token: string): Promise<Comment> {
  const response = await apiClient(`/api/products/${productId}/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
    token,
  });

  if (!response.ok) {
    throw new Error('Failed to edit comment');
  }

  const comment = await response.json();
  return comment;
}

// Helper function to search/filter products (can be used on fetched products)
export function searchProducts(products: Product[], query: string, category?: ProductCategory): Product[] {
  if (!query && !category) {
    return products;
  }
  
  const lowerQuery = query.toLowerCase();
  let filtered = products;
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  if (!query) {
    return filtered;
  }
  
  return filtered.filter(p => {
    const tags = Array.isArray(p.tags) ? p.tags : [];
    return (
      p.title.toLowerCase().includes(lowerQuery) ||
      p.shortDescription.toLowerCase().includes(lowerQuery) ||
      tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(lowerQuery))
    );
  });
}

// Category metadata for UI
export const categories = {
  seals: {
    name: "Seals",
    description: "Adorable marine mammals",
    icon: "🦭"
  },
  "sci-fi": {
    name: "Sci-Fi",
    description: "Futuristic figures and vehicles",
    icon: "🚀"
  },
  pirates: {
    name: "Pirates",
    description: "Swashbuckling adventure models",
    icon: "🏴‍☠️"
  },
  fantasy: {
    name: "Fantasy",
    description: "Mythical creatures and heroes",
    icon: "🐉"
  },
  vehicles: {
    name: "Vehicles",
    description: "Cars, planes, and more",
    icon: "🚗"
  },
  architecture: {
    name: "Architecture",
    description: "Buildings and structures",
    icon: "🏛️"
  },
  animals: {
    name: "Animals",
    description: "Wildlife and pets",
    icon: "🦁"
  },
  characters: {
    name: "Characters",
    description: "Action figures and collectibles",
    icon: "🦸"
  },
} as const;

// Legacy: Keep products array export for backwards compatibility during migration
// This will be empty and should be replaced with getProducts() calls
export const products: Product[] = [];
