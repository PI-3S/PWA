import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API_CONFIG, User } from '@/data/data';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para renovar o token automaticamente usando o Refresh Token do Firebase
  const refreshAccessToken = async () => {
    const savedRefreshToken = localStorage.getItem('refreshToken');

    if (!savedRefreshToken) {
      return;
    }

    if (!API_CONFIG.FIREBASE_KEY) {
      console.error('FIREBASE_KEY não configurada. Token refresh desabilitado.');
      return;
    }

    try {
      // Endpoint oficial do Google para troca de Refresh Token
      const response = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=${API_CONFIG.FIREBASE_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: savedRefreshToken,
          }),
        }
      );

      const data = await response.json();

      if (data.id_token) {
        // Atualiza tanto o estado quanto o armazenamento local com os novos tokens
        localStorage.setItem('token', data.id_token);
        localStorage.setItem('authToken', data.id_token); // Compatibilidade com Admin
        localStorage.setItem('refreshToken', data.refresh_token);
        setToken(data.id_token);
        console.log("Sessão renovada automaticamente via Refresh Token.");
      } else {
        // Se o refresh falhar (ex: token revogado no console do Firebase), desloga
        signOut();
      }
    } catch (err) {
      console.error("Erro ao renovar sessão:", err);
    }
  };

  useEffect(() => {
    const loadStorageData = () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('usuario');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('tokenExpiry');
        }
      }
      setLoading(false);
    };

    loadStorageData();
  }, []);

  // Monitor de expiração: A cada 45 minutos verifica e renova o token
  // O token do Firebase dura 60 minutos, renovamos antes para evitar falhas em requisições
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (token) {
      interval = setInterval(() => {
        refreshAccessToken();
      }, 45 * 60 * 1000); // 45 minutos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [token]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();

      if (data.success) {
        // Salva com as chaves originais
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        
        // ADICIONADO: Compatibilidade com o Admin
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.usuario));
        localStorage.setItem('tokenExpiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
        
        setToken(data.token);
        setUser(data.usuario);
        
        return { error: null };
      } else {
        return { error: data.error || data.mensagem || 'Erro ao realizar login' };
      }
    } catch (err) {
      return { error: 'Erro de conexão com o servidor' };
    }
  };

  const signOut = () => {
    // Remove as chaves originais
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
    
    // ADICIONADO: Remove as chaves de compatibilidade
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userEmail');
    
    setToken(null);
    setUser(null);
  };

  return (
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