import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserPerfil } from '@/data/data';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: UserPerfil[]; // Perfis que podem acessar esta rota
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Se ainda estiver carregando a sessão do localStorage, exibe um loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0b10]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  // 1. Verifica se o usuário está logado
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Verifica se o perfil do usuário tem permissão para esta rota específica
  if (allowedRoles && !allowedRoles.includes(user.perfil)) {
    // Se for aluno tentando entrar no admin, manda pro dashboard dele
    const redirectPath = user.perfil === 'aluno' ? '/aluno' : 
                         user.perfil === 'coordenador' ? '/coordenador' : '/admin';
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;