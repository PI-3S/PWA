import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, LogIn, ClipboardList, GraduationCap, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import logoWhite from '@/assets/logo-white.png';
import { useAuth } from '@/contexts/AuthContext'; 

const roleConfig: Record<string, { 
  label: string; 
  icon: typeof ClipboardList; 
  glowColor: string; 
  borderColor: string; 
  iconColor: string; 
  accentGradient: string; 
  redirectPath: string; 
  perfil: string 
}> = {
  superadmin: {
    label: 'Super Admin',
    icon: ShieldCheck,
    glowColor: 'hsla(210, 80%, 55%, 0.15)',
    borderColor: 'hsla(210, 80%, 55%, 0.25)',
    iconColor: 'hsl(210, 80%, 60%)',
    accentGradient: 'linear-gradient(90deg, hsl(210, 80%, 55%), hsl(220, 80%, 65%))',
    redirectPath: '/admin',
    perfil: 'super_admin',
  },
  coordenador: {
    label: 'Coordenador',
    icon: ClipboardList,
    glowColor: 'hsla(30, 95%, 55%, 0.15)',
    borderColor: 'hsla(30, 95%, 55%, 0.25)',
    iconColor: 'hsl(30, 95%, 60%)',
    accentGradient: 'linear-gradient(90deg, hsl(30, 95%, 55%), hsl(40, 95%, 65%))',
    redirectPath: '/coordenador',
    perfil: 'coordenador',
  },
  aluno: {
    label: 'Aluno',
    icon: GraduationCap,
    glowColor: 'hsla(160, 70%, 45%, 0.15)',
    borderColor: 'hsla(160, 70%, 45%, 0.25)',
    iconColor: 'hsl(160, 70%, 55%)',
    accentGradient: 'linear-gradient(90deg, hsl(160, 70%, 45%), hsl(170, 70%, 55%))',
    redirectPath: '/aluno',
    perfil: 'aluno',
  },
};

const Login = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { signIn } = useAuth(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = roleConfig[role || ''];
  
  if (!config) {
    navigate('/');
    return null;
  }

  const RoleIcon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Tenta realizar o login via AuthContext
    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error);
      setIsSubmitting(false);
      return;
    }

    // 2. Validação de Perfil: Pegamos o usuário que o signIn acabou de salvar
    const savedUserRaw = localStorage.getItem('usuario');
    const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;
    const perfilRetornado = savedUser?.perfil;

    // 3. Verifica se o perfil no banco condiz com a tela de login acessada
    if (perfilRetornado !== config.perfil) {
      const messages: Record<string, string> = {
        super_admin: 'Esta conta não possui privilégios de Administrador.',
        coordenador: 'Esta conta não possui privilégios de Coordenador.',
        aluno: 'Esta conta não é de um Aluno.',
      };
      
      // Limpa os dados salvos para evitar que o ProtectedRoute permita acesso indevido
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('usuario');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('tokenExpiry');
      
      toast.error(`Acesso negado: ${messages[config.perfil]}`);
      setIsSubmitting(false);
      return;
    }

    // 4. Sucesso! Notifica e redireciona
    toast.success('Bem-vindo ao Maestria!');
    
    // ADICIONADO: Pequeno delay para garantir que o estado foi atualizado
    setTimeout(() => {
      navigate(config.redirectPath);
    }, 100);
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ background: 'linear-gradient(165deg, hsl(220, 50%, 10%) 0%, hsl(225, 45%, 14%) 40%, hsl(220, 45%, 11%) 100%)' }}>
      {/* Glow Effect Background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20 blur-[150px]" style={{ background: config.iconColor }} />

      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm tracking-wide transition-colors hover:text-white z-20"
        style={{ color: 'hsl(200, 30%, 55%)' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <img src={logoWhite} alt="Logo Maestria" className="h-14 w-auto drop-shadow-lg mb-8 relative z-10" />

      <div
        className="w-full max-w-md rounded-xl p-8 relative z-10"
        style={{
          background: 'linear-gradient(145deg, hsla(220, 50%, 15%, 0.8), hsla(220, 50%, 10%, 0.9))',
          border: `1px solid ${config.borderColor}`,
          boxShadow: `0 0 60px -15px ${config.glowColor}, inset 0 1px 0 hsla(0,0%,100%,0.05)`,
        }}
      >
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center mb-4"
            style={{
              background: config.glowColor,
              border: `1px solid ${config.borderColor}`,
              boxShadow: `0 0 25px -5px ${config.glowColor}`,
            }}
          >
            <RoleIcon className="h-7 w-7" style={{ color: config.iconColor }} />
          </div>
          <h1 className="text-xl font-display font-bold text-white tracking-widest uppercase text-center">
            {config.label}
          </h1>
          <p className="text-xs mt-1 tracking-wide" style={{ color: 'hsl(200, 30%, 55%)' }}>
            Faça login para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest block ml-1" style={{ color: 'hsl(200, 30%, 55%)' }}>
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: config.iconColor, opacity: 0.6 }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none transition-all font-mono"
                style={{
                  background: 'hsla(220, 40%, 12%, 0.8)',
                  border: `1px solid hsla(220, 30%, 25%, 0.5)`,
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest block ml-1" style={{ color: 'hsl(200, 30%, 55%)' }}>
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: config.iconColor, opacity: 0.6 }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none transition-all font-mono"
                style={{
                  background: 'hsla(220, 40%, 12%, 0.8)',
                  border: `1px solid hsla(220, 30%, 25%, 0.5)`,
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg text-sm font-display font-semibold uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{
              background: config.accentGradient,
              boxShadow: `0 0 30px -10px ${config.glowColor}`,
            }}
          >
            <LogIn className="h-4 w-4" />
            {isSubmitting ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <div className="h-[2px] w-16 rounded-full" style={{ background: config.accentGradient }} />
        </div>
      </div>

      <p className="mt-10 text-xs tracking-widest uppercase font-display relative z-10" style={{ color: 'hsl(220, 20%, 35%)' }}>
        Sistema de Gestão de Atividades Complementares
      </p>
    </div>
  );
};

export default Login;