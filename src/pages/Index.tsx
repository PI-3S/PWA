import { useNavigate } from 'react-router-dom';
import { ClipboardList, GraduationCap, ShieldCheck, ChevronRight } from 'lucide-react';
import logoWhite from '@/assets/logo-white.png';
import ThemeSwitcher from '@/components/themeswitcher';
import { useTheme } from '@/contexts/ThemeContext';

const roles = [
  {
    id: 'superadmin',
    label: 'Super Admin',
    description: 'Gerencie cursos, usuários e configurações globais do sistema',
    icon: ShieldCheck,
    path: '/admin',
    glowColor: 'hsla(210, 80%, 55%, 0.15)',
    borderColor: 'hsla(210, 80%, 55%, 0.25)',
    iconColor: 'hsl(210, 80%, 60%)',
    accentGradient: 'linear-gradient(90deg, hsl(210, 80%, 55%), hsl(220, 80%, 65%))',
  },
  {
    id: 'coordenador',
    label: 'Coordenador',
    description: 'Analise e valide atividades complementares dos alunos',
    icon: ClipboardList,
    path: '/coordenador',
    glowColor: 'hsla(30, 95%, 55%, 0.15)',
    borderColor: 'hsla(30, 95%, 55%, 0.25)',
    iconColor: 'hsl(30, 95%, 60%)',
    accentGradient: 'linear-gradient(90deg, hsl(30, 95%, 55%), hsl(40, 95%, 65%))',
  },
  {
    id: 'aluno',
    label: 'Aluno',
    description: 'Submeta e acompanhe suas atividades complementares',
    icon: GraduationCap,
    path: '/aluno',
    glowColor: 'hsla(160, 70%, 45%, 0.15)',
    borderColor: 'hsla(160, 70%, 45%, 0.25)',
    iconColor: 'hsl(160, 70%, 55%)',
    accentGradient: 'linear-gradient(90deg, hsl(160, 70%, 45%), hsl(170, 70%, 55%))',
  },
];

const themeStyles = {
  dark: {
    bg: 'linear-gradient(165deg, hsl(220, 50%, 10%) 0%, hsl(225, 45%, 14%) 40%, hsl(220, 45%, 11%) 100%)',
    cardBg: 'linear-gradient(145deg, hsla(220, 50%, 15%, 0.7), hsla(220, 50%, 12%, 0.8))',
    titleColor: 'hsl(0, 0%, 100%)',
    subtitleColor: 'hsl(200, 30%, 55%)',
    descColor: 'hsl(220, 20%, 55%)',
    footerColor: 'hsl(220, 20%, 35%)',
    cardInsetGlow: 'hsla(0,0%,100%,0.05)',
    cardInsetGlowHover: 'hsla(0,0%,100%,0.1)',
  },
  light: {
    bg: 'linear-gradient(165deg, hsl(220, 20%, 95%) 0%, hsl(220, 15%, 98%) 40%, hsl(220, 20%, 93%) 100%)',
    cardBg: 'linear-gradient(145deg, hsla(0, 0%, 100%, 0.95), hsla(220, 20%, 97%, 0.9))',
    titleColor: 'hsl(220, 50%, 15%)',
    subtitleColor: 'hsl(220, 30%, 45%)',
    descColor: 'hsl(220, 15%, 45%)',
    footerColor: 'hsl(220, 15%, 65%)',
    cardInsetGlow: 'hsla(220,30%,80%,0.3)',
    cardInsetGlowHover: 'hsla(220,30%,70%,0.4)',
  },
};

const Index = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const ts = themeStyles[theme];

  const senacColor = theme === 'light' ? 'hsl(220, 55%, 35%)' : 'hsl(30, 95%, 60%)';
  const logoFilter = theme === 'light' ? 'invert(1) brightness(0.2)' : 'none';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ background: ts.bg }}>
      
      {/* Theme Switcher */}
      <div className="absolute top-5 left-5 z-20">
        <ThemeSwitcher />
      </div>

      <div className="flex flex-col items-center mb-14 relative z-10">
        <div className="mb-8">
          <img src={logoWhite} alt="Logo" className="h-20 w-auto drop-shadow-lg" style={{ filter: logoFilter }} />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-widest text-center uppercase" style={{ color: ts.titleColor, textShadow: theme === 'dark' ? '0 0 20px hsla(200, 80%, 60%, 0.3)' : 'none' }}>
          Atividades Complementares
        </h1>
       
        <p className="text-sm md:text-base mt-3 tracking-wide" style={{ color: ts.subtitleColor }}>
          Selecione seu perfil de acesso
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full relative z-10">
        {roles.map((role) => {
          const borderCol = theme === 'light' ? role.borderColor.replace(/0\.\d+\)/, '0.4)') : role.borderColor;
          const glowCol = theme === 'light' ? role.glowColor.replace(/0\.\d+\)/, '0.08)') : role.glowColor;
          const iconCol = theme === 'light' ? role.iconColor.replace(/60%\)/, '45%)') : role.iconColor;

          return (
            <button
              key={role.id}
              onClick={() => navigate(`/login/${role.id}`)}
              className="group text-left rounded-xl p-6 transition-all duration-500 hover:scale-[1.04] focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              style={{
                background: ts.cardBg,
                border: `1px solid ${borderCol}`,
                boxShadow: `0 0 30px -10px ${glowCol}, inset 0 1px 0 ${ts.cardInsetGlow}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 50px -5px ${glowCol}, 0 0 80px -20px ${glowCol}, inset 0 1px 0 ${ts.cardInsetGlowHover}`;
                e.currentTarget.style.borderColor = iconCol;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 0 30px -10px ${glowCol}, inset 0 1px 0 ${ts.cardInsetGlow}`;
                e.currentTarget.style.borderColor = borderCol;
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-5"
                style={{
                  background: glowCol,
                  border: `1px solid ${borderCol}`,
                  boxShadow: `0 0 20px -5px ${glowCol}`,
                }}
              >
                <role.icon className="h-6 w-6" style={{ color: iconCol }} />
              </div>
              <h2 className="text-lg font-semibold mb-1 tracking-wide font-display text-sm uppercase" style={{ color: ts.titleColor }}>{role.label}</h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: ts.descColor }}>
                {role.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="h-[2px] w-12 rounded-full" style={{ background: role.accentGradient }} />
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" style={{ color: iconCol, opacity: 0.6 }} />
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-16 text-center px-4 text-xs sm:text-sm tracking-widest uppercase font-display" style={{ color: ts.footerColor }}>
        Sistema de Gestão de Atividades Complementares
      </p>
    </div>
  );
};

export default Index;

