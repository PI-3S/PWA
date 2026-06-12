import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_CONFIG } from '@/data/data';
import { toastError } from '@/lib/toast';

const API_BASE = API_CONFIG.BASE_URL;

/**
 * Hook centralizado para chamadas autenticadas à API.
 * Injeta o Bearer token automaticamente e trata erros 401/403.
 */
export const useApi = () => {
  const { token, signOut } = useAuth();

  const apiFetch = useCallback(async (path: string, opts?: RequestInit) => {
    if (!token) {
      toastError('Sessão expirada. Faça login novamente.');
      signOut();
      throw new Error('Token não encontrado');
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      const res = await fetch(`${API_BASE}${path}`, { headers, ...opts });

      if (res.status === 401 || res.status === 403) {
        toastError('Sessão expirada. Faça login novamente.');
        signOut();
        throw new Error('Não autorizado');
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.mensagem || err.error || `Erro ${res.status}`);
      }

      return res.json();
    } catch (error: any) {
      if (error.message !== 'Não autorizado') {
        console.error('API Error:', error);
      }
      throw error;
    }
  }, [token, signOut]);

  return { apiFetch };
};
