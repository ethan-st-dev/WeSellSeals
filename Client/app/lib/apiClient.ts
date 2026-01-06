// API client helper for making authenticated requests to the backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5159';

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
