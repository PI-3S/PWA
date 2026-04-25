import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, LogIn, ClipboardList, GraduationCap, ShieldCheck, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import logoWhite from '@/assets/logo-white.png';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useapptheme';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_CONFIG } from '@/data/data';
import Footer from '@/components/Footer';

const roleConfig: Record<string, { label: string; icon: typeof ClipboardList; glowColor: string; borderColor: string; iconColor: string; accentGradient: string; redirectPath: string; perfil: string }> = {
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
  const { signIn, user: authUser } = useAuth();
  const { colors: tc } = useAppTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotDialog, setForgotDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const config = roleConfig[role || ''];
  
  if (!config) {
    navigate('/');
    return null;
  }

  const RoleIcon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Usa o signIn do AuthContext (que já lida com localStorage e fetch)
    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error);
      setIsSubmitting(false);
      return;
    }

    // 2. O AuthContext acabou de salvar o usuário no estado. 
    // Vamos pegar o perfil dele para validar se ele entrou na área certa.
    // Como o estado do context pode demorar alguns ms para refletir, 
    // lemos direto do localStorage para essa validação imediata.
    const savedUser = JSON.parse(localStorage.getItem('usuario') || '{}');
    const perfilRetornado = savedUser?.perfil;

    if (perfilRetornado !== config.perfil) {
      const messages: Record<string, string> = {
        super_admin: 'Área restrita ao Super Admin.',
        coordenador: 'Área restrita a coordenadores.',
        aluno: 'Área restrita a alunos.',
      };
      
      // Limpa tudo se o perfil estiver errado para o login escolhido
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      toast.error(`Acesso negado. ${messages[config.perfil]}`);
      setIsSubmitting(false);
      return;
    }

    navigate(config.redirectPath);
    setIsSubmitting(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      toast.error('Digite um e-mail válido.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensagem || data.error || 'Erro ao solicitar recuperação.');
      }

      toast.success('Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.');
      setForgotDialog(false);
      setForgotEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao solicitar recuperação de senha.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ background: tc.pageBg }}>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20 blur-[150px]" style={{ background: config.iconColor }} />

      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm tracking-wide transition-colors hover:text-white z-20"
        style={{ color: tc.subtitleColor }}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <img src={logoWhite} alt="Logo" className="h-14 w-auto drop-shadow-lg mb-8 relative z-10" style={{ filter: tc.logoFilter }} />

      <div
        className="w-full max-w-md rounded-xl p-8 relative z-10"
        style={{
          background: tc.cardBg,
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
          <h1 className="text-xl font-display font-bold tracking-widest uppercase" style={{ color: tc.titleColor }}>
            {config.label}
          </h1>
          <p className="text-xs mt-1 tracking-wide" style={{ color: tc.subtitleColor }}>
            Faça login para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest" style={{ color: tc.labelColor }}>
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
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 transition-all font-mono"
                style={{
                  background: tc.inputBg,
                  border: `1px solid ${tc.inputBorder}`,
                  color: tc.textPrimary,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = config.iconColor;
                  e.currentTarget.style.boxShadow = `0 0 15px -5px ${config.glowColor}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = tc.inputBorder;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest" style={{ color: tc.labelColor }}>
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
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 transition-all font-mono"
                style={{
                  background: tc.inputBg,
                  border: `1px solid ${tc.inputBorder}`,
                  color: tc.textPrimary,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = config.iconColor;
                  e.currentTarget.style.boxShadow = `0 0 15px -5px ${config.glowColor}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = tc.inputBorder;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setForgotDialog(true)}
            className="w-full text-left text-xs transition-colors hover:underline"
            style={{ color: config.iconColor }}
          >
            Esqueci minha senha
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg text-sm font-display font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:brightness-110 disabled:opacity-50"
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

      <p className="mt-10 text-xs tracking-widest uppercase font-display relative z-10" style={{ color: tc.footerColor }}>
        Sistema de Gestão de Atividades Complementares
      </p>
      <Footer />
      {/* Dialog: Esqueci minha senha */}
      <Dialog open={forgotDialog} onOpenChange={setForgotDialog}>
        <DialogContent style={{ background: tc.panelBg || tc.cardBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: tc.titleColor }} className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" style={{ color: config.iconColor }} />
              Recuperar Senha
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: tc.labelColor }}>
             Digite seu e-mail cadastrado. Enviaremos instruções para redefinir sua senha.
            </p>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: config.iconColor, opacity: 0.6 }} />
              <Input
                type="email"
                placeholder="seu@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="pl-10"
                style={{
                  background: tc.inputBg,
                  border: `1px solid ${tc.inputBorder}`,
                  color: tc.textPrimary,
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setForgotDialog(false)} variant="outline">
              Cancelar
            </Button>
            <Button
              onClick={handleForgotPassword}
              disabled={forgotLoading}
              style={{ background: config.accentGradient }}
            >
              {forgotLoading ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;