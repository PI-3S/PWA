import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API_CONFIG, User } from '@/data/data';

// 1. Definição rigorosa da Interface para o Provider aceitar
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

// Inicializamos com undefined para garantir que o useAuth seja usado dentro do Provider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('usuario');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
    setLoading(false);
  }, []);

  // 2. A função signIn deve retornar exatamente Promise<{ error: string | null }>
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        
        setToken(data.token);
        setUser(data.usuario);
        
        return { error: null };
      } else {
        return { error: data.mensagem || 'Erro ao realizar login' };
      }
    } catch (err) {
      return { error: 'Erro de conexão com o servidor' };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    // Se o erro persistir aqui, verifique se todos os nomes (user, token, loading...) 
    // existem na interface AuthContextType acima.
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};