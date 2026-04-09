export const API_BASE_URL = 'https://back-end-banco-five.vercel.app';

export const apiClient = {
  get: async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensagem || errorData.message || 'Erro na requisição');
    }

    return response.json();
  },

  post: async (endpoint: string, data: any, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensagem || errorData.message || 'Erro na requisição');
    }

    return response.json();
  },

  patch: async (endpoint: string, data: any, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensagem || errorData.message || 'Erro na requisição');
    }

    return response.json();
  },

  delete: async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensagem || errorData.message || 'Erro na requisição');
    }

    return response.json();
  },
};