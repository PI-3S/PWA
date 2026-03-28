import { useNavigate } from 'react-router-dom';
import { ClipboardList, GraduationCap, ChevronRight } from 'lucide-react';
import logoWhite from '@/assets/logo-white.png';

const roles = [
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

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ background: 'linear-gradient(165deg, hsl(220, 50%, 10%) 0%, hsl(225, 45%, 14%) 40%, hsl(220, 45%, 11%) 100%)' }}>

      <div className="flex flex-col items-center mb-14 relative z-10">
        <div className="mb-8">
          <img src={logoWhite} alt="Logo" className="h-20 w-auto drop-shadow-lg" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-widest text-center text-glow uppercase">
          Atividades Complementares
        </h1>
        <span className="text-lg md:text-xl font-display font-semibold tracking-[0.3em] uppercase mt-2" style={{ color: 'hsl(30, 95%, 60%)' }}>
          SENAC
        </span>
        <p className="text-sm md:text-base mt-3 tracking-wide" style={{ color: 'hsl(200, 30%, 55%)' }}>
          Selecione seu perfil de acesso
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full relative z-10">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => navigate(`/login/${role.id}`)}
            className="group text-left rounded-xl p-6 transition-all duration-500 hover:scale-[1.04] focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            style={{
              background: `linear-gradient(145deg, hsla(220, 50%, 15%, 0.7), hsla(220, 50%, 12%, 0.8))`,
              border: `1px solid ${role.borderColor}`,
              boxShadow: `0 0 30px -10px ${role.glowColor}, inset 0 1px 0 hsla(0,0%,100%,0.05)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 50px -5px ${role.glowColor}, 0 0 80px -20px ${role.glowColor}, inset 0 1px 0 hsla(0,0%,100%,0.1)`;
              e.currentTarget.style.borderColor = role.iconColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 0 30px -10px ${role.glowColor}, inset 0 1px 0 hsla(0,0%,100%,0.05)`;
              e.currentTarget.style.borderColor = role.borderColor;
            }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-5"
              style={{
                background: role.glowColor,
                border: `1px solid ${role.borderColor}`,
                boxShadow: `0 0 20px -5px ${role.glowColor}`,
              }}
            >
              <role.icon className="h-6 w-6" style={{ color: role.iconColor }} />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1 tracking-wide font-display text-sm uppercase">{role.label}</h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'hsl(220, 20%, 55%)' }}>
              {role.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="h-[2px] w-12 rounded-full" style={{ background: role.accentGradient }} />
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" style={{ color: role.iconColor, opacity: 0.6 }} />
            </div>
          </button>
        ))}
      </div>

      <p className="mt-16 text-xs tracking-widest uppercase font-display" style={{ color: 'hsl(220, 20%, 35%)' }}>
        Sistema de Gestão de Atividades Complementares
      </p>
    </div>
  );
};

export default Index;
