import { useNavigate } from 'react-router-dom';
import { ClipboardList, BookOpen, GraduationCap } from 'lucide-react';
import logoWhite from '@/assets/logo-white.png';

const roles = [
  {
    id: 'coordenador',
    label: 'Coordenador',
    description: 'Analise e valide atividades complementares dos alunos',
    icon: ClipboardList,
    path: '/coordenador',
    accentColor: 'bg-orange-500',
  },
  {
    id: 'professor',
    label: 'Professor',
    description: 'Acompanhe as atividades e o progresso dos seus alunos',
    icon: BookOpen,
    path: '/professor',
    accentColor: 'bg-blue-500',
  },
  {
    id: 'aluno',
    label: 'Aluno',
    description: 'Submeta e acompanhe suas atividades complementares',
    icon: GraduationCap,
    path: '/aluno',
    accentColor: 'bg-orange-500',
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(180deg, hsl(220 60% 12%) 0%, hsl(220 60% 18%) 100%)' }}>
      <div className="flex flex-col items-center mb-12">
        {/* Logo */}
        <div className="mb-6">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 10 L70 35 L55 30 L65 55 L40 45 L15 55 L25 30 L10 35 Z" fill="hsl(220, 60%, 40%)" />
            <path d="M40 10 L70 35 L55 30 L50 45 L40 35 Z" fill="hsl(35, 95%, 55%)" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight text-center">
          Atividades Complementares
        </h1>
        <p className="text-sm md:text-base mt-2" style={{ color: 'hsl(220, 20%, 65%)' }}>
          Selecione seu perfil de acesso
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl w-full">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => navigate(role.path)}
            className="group text-left rounded-xl p-6 border transition-all duration-300 hover:scale-[1.03] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{
              background: 'hsla(220, 40%, 25%, 0.5)',
              borderColor: 'hsla(220, 40%, 40%, 0.3)',
            }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
              style={{ background: 'hsla(220, 40%, 35%, 0.6)' }}
            >
              <role.icon className="h-6 w-6" style={{ color: 'hsl(35, 95%, 60%)' }} />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">{role.label}</h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'hsl(220, 20%, 65%)' }}>
              {role.description}
            </p>
            <div className={`h-1 w-10 rounded-full ${role.accentColor}`} />
          </button>
        ))}
      </div>

      <p className="mt-16 text-xs" style={{ color: 'hsl(220, 20%, 50%)' }}>
        Sistema de Gestão de Atividades Complementares
      </p>
    </div>
  );
};

export default Index;
