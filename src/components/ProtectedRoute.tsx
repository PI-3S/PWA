import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserPerfil } from '@/data/data';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserPerfil[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // 1. Enquanto carrega o token do localStorage, exibe um carregamento
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // 2. Se não estiver logado, redireciona para o login apropriado
  if (!user) {
    // Tenta recuperar o perfil do localStorage para redirecionar corretamente
    const savedUserRaw = localStorage.getItem('usuario') || localStorage.getItem('userData');
    const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;
    const perfil = savedUser?.perfil;
    
    // Mapeia o perfil para a rota de login correta
    const loginRoutes: Record<string, string> = {
      super_admin: '/login/superadmin',
      coordenador: '/login/coordenador',
      aluno: '/login/aluno',
    };
    
    const redirectPath = perfil ? loginRoutes[perfil] : '/';
    return <Navigate to={redirectPath} replace />;
  }

  // 3. Se houver restrição de perfil e o perfil do usuário não estiver na lista
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.perfil)) {
    // Mapeia para redirecionar para o login correto baseado no perfil atual
    const loginRoutes: Record<string, string> = {
      super_admin: '/login/superadmin',
      coordenador: '/login/coordenador',
      aluno: '/login/aluno',
    };
    
    // Redireciona para o login apropriado ao perfil do usuário
    const redirectPath = loginRoutes[user.perfil] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  // 4. Se passou em tudo, renderiza a página (children)
  return <>{children}</>;
};

export default ProtectedRoute;