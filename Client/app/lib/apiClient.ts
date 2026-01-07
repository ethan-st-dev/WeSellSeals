// API client helper for making authenticated requests to the backend
// Prefer configured URL, fall back to known production host when running on Azure, and finally local dev.
const DEFAULT_PROD_API = "https://wesellseals-api.azurecontainerapps.io";
const API_URL = (
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname.endsWith("azurestaticapps.net")
    ? DEFAULT_PROD_API
    : "http://localhost:5159")
).replace(/\/$/, "");

interface FetchOptions extends RequestInit {
  token?: string | null;
}

export async function apiClient(endpoint: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };
  
  // Add Authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });
  
  return response;
}

export { API_URL };

// Product API methods
export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  shortDescription: string;
  longDescription?: string;
  modelUrl?: string;
  category: string;
  subcategory?: string;
  tags: string; // JSON string array
  createdAt: string;
  updatedAt: string;
}

export async function getProducts(): Promise<Product[]> {
  const response = await apiClient('/api/products');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

export async function getProductById(id: string): Promise<Product> {
  const response = await apiClient(`/api/products/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  return response.json();
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const response = await apiClient(`/api/products/category/${category}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products by category');
  }
  return response.json();
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, token?: string): Promise<Product> {
  const response = await apiClient('/api/products', {
    method: 'POST',
    body: JSON.stringify(product),
    token,
  });
  if (!response.ok) {
    throw new Error('Failed to create product');
  }
  return response.json();
}

export async function updateProduct(id: string, product: Partial<Product>, token?: string): Promise<Product> {
  const response = await apiClient(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
    token,
  });
  if (!response.ok) {
    throw new Error('Failed to update product');
  }
  return response.json();
}

export async function deleteProduct(id: string, token?: string): Promise<void> {
  const response = await apiClient(`/api/products/${id}`, {
    method: 'DELETE',
    token,
  });
  if (!response.ok) {
    throw new Error('Failed to delete product');
  }
}

export async function uploadFile(file: File): Promise<{ url: string; fileName: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload file');
  }
  
  return response.json();
}
