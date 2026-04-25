import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useapptheme';
import { useIsMobile } from '@/hooks/use-mobile';
import ThemeSwitcher from '@/components/themeswitcher';
import {
  LogOut, LayoutDashboard, FileText, Users, UserPlus,
  Menu, X
} from 'lucide-react';
import { API_CONFIG } from '@/data/data';
import logoWhite from '@/assets/logo-white.png';
import Footer from '@/components/Footer';
import DashboardSection from '@/components/coordenador/DashboardSection';
import SubmissoesSection from '@/components/coordenador/SubmissoesSection';
import AlunosSection from '@/components/coordenador/AlunosSection';
import CadastrarSection from '@/components/coordenador/CadastrarSection';

const API_BASE = API_CONFIG.BASE_URL;

const toastStyle = {
  background: 'hsl(220, 45%, 14%)',
  color: 'white',
  border: '1px solid hsla(200, 60%, 40%, 0.3)',
};
const toastSuccess = (msg: string) => toast.success(msg, { style: toastStyle });
const toastError = (msg: string) => toast.error(msg, { style: { ...toastStyle, border: '1px solid hsla(0,70%,50%,0.4)' } });

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'submissoes', label: 'Submissões', icon: FileText },
  { id: 'alunos', label: 'Alunos', icon: Users },
  { id: 'cadastrar', label: 'Cadastrar', icon: UserPlus },
];

const Coordenador = () => {
  const navigate = useNavigate();
  const { user, token, signOut } = useAuth();
  const { colors } = useAppTheme();
  const isMobile = useIsMobile();

  const userName = user?.nome || 'Coordenador';
  const accentOrange = 'hsl(30, 95%, 55%)';
  const accentBlue = 'hsl(210, 80%, 55%)';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const apiFetch = useCallback(async (path: string, opts?: RequestInit) => {
    if (!token) {
      toastError('Sessão expirada. Faça login novamente.');
      signOut();
      throw new Error('Token não encontrado');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
    localStorage.removeItem('userData');
    localStorage.removeItem('tokenExpiry');
    signOut();
    navigate('/');
  };

  // Verificação de autenticação inicial
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken') || localStorage.getItem('token');
    const storedUser = localStorage.getItem('usuario') || localStorage.getItem('userData');

    if (!storedToken || !storedUser) {
      navigate('/login/coordenador');
      return;
    }

    try {
      JSON.parse(storedUser);
    } catch {
      navigate('/login/coordenador');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen transition-colors duration-300 w-full overflow-x-hidden" style={{ background: colors.pageBg, color: colors.textPrimary }}>
      {/* Mobile Header */}
      {isMobile && (
        <header className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between" style={{ background: colors.headerBg, borderBottom: `1px solid ${colors.headerBorder}` }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2">
            <Menu className="h-6 w-6" style={{ color: colors.textPrimary }} />
          </button>
          <h1 className="text-xs uppercase tracking-widest font-display" style={{ color: colors.textPrimary }}>
            Painel Coordenador
          </h1>
          <ThemeSwitcher />
        </header>
      )}

      <div className="flex flex-col md:flex-row min-h-screen w-full">
        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className={`
            ${isMobile ? 'fixed left-0 top-0 h-full z-50 transform transition-transform duration-300' : ''}
            ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
            w-64 shrink-0 flex flex-col border-r p-4
          `}
          style={{
            background: colors.sidebarBg,
            borderColor: colors.sidebarBorder,
            ...(isMobile ? {} : { minHeight: '100vh' })
          }}
        >
          {isMobile && (
            <div className="flex justify-end mb-4">
              <button onClick={() => setSidebarOpen(false)} className="p-2">
                <X className="h-6 w-6" style={{ color: colors.sidebarText }} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <img src={logoWhite} alt="Logo" className="h-8" style={{ filter: colors.logoFilter }} />
            <div>
              <p className="text-xs uppercase tracking-widest font-display" style={{ color: colors.sidebarTextActive }}>Coordenador</p>
              <p className="text-[10px]" style={{ color: accentOrange }}>SENAC</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); if (isMobile) setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all border ${
                  activeSection === item.id ? 'border-orange-500/50 shadow-sm' : 'border-transparent'
                }`}
                style={activeSection === item.id ? {
                  background: 'hsla(30, 95%, 55%, 0.15)',
                  color: colors.sidebarTextActive,
                } : { color: colors.sidebarText }}
              >
                <item.icon className="h-4 w-4" style={{ color: activeSection === item.id ? accentOrange : undefined }} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t" style={{ borderColor: colors.sidebarBorder }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${accentOrange}, hsl(30, 80%, 60%))` }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.sidebarTextActive }}>{userName}</p>
                <p className="text-[10px]" style={{ color: colors.labelColor }}>Coordenador</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs uppercase" style={{ background: 'hsla(0, 70%, 50%, 0.12)', color: 'hsl(0, 70%, 65%)' }}>
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto min-w-0">
          {/* Desktop Header */}
          {!isMobile && (
            <header className="sticky top-0 z-40 py-4 mb-4" style={{ background: colors.pageBg }}>
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold" style={{ color: colors.titleColor }}>
                  {navItems.find(n => n.id === activeSection)?.label}
                </h1>
                <ThemeSwitcher />
              </div>
            </header>
          )}

          {activeSection === 'dashboard' && (
            <DashboardSection
              apiFetch={apiFetch}
              user={{ uid: user?.uid || '' }}
              colors={colors}
              toastSuccess={toastSuccess}
              toastError={toastError}
              accentBlue={accentBlue}
              accentOrange={accentOrange}
            />
          )}

          {activeSection === 'submissoes' && (
            <SubmissoesSection
              apiFetch={apiFetch}
              user={{ uid: user?.uid || '' }}
              colors={colors}
              toastSuccess={toastSuccess}
              toastError={toastError}
              accentBlue={accentBlue}
              accentOrange={accentOrange}
            />
          )}

          {activeSection === 'alunos' && (
            <AlunosSection
              apiFetch={apiFetch}
              colors={colors}
              toastError={toastError}
              accentOrange={accentOrange}
            />
          )}

          {activeSection === 'cadastrar' && (
            <CadastrarSection
              apiFetch={apiFetch}
              colors={colors}
              toastSuccess={toastSuccess}
              toastError={toastError}
              accentOrange={accentOrange}
            />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Coordenador;
