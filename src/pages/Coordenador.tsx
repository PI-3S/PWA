import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useapptheme';
import { useIsMobile } from '@/hooks/use-mobile';
import { useApi } from '@/hooks/useApi';
import ThemeSwitcher from '@/components/themeswitcher';
import {
  LogOut, LayoutDashboard, FileText, Users, UserPlus, BookOpen,
  Menu, X
} from 'lucide-react';
import logoWhite from '@/assets/logo-white.png';
import Footer from '@/components/Footer';
import { toastSuccess, toastError } from '@/lib/toast';
import { ACCENT } from '@/lib/constants';
import DashboardSection from '@/components/coordenador/DashboardSection';
import SubmissoesSection from '@/components/coordenador/SubmissoesSection';
import AlunosSection from '@/components/coordenador/AlunosSection';
import CadastrarSection from '@/components/coordenador/CadastrarSection';
import RegrasSection from '@/components/coordenador/RegrasSection';

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'submissoes', label: 'Submissões', icon: FileText },
  { id: 'regras',     label: 'Regras',     icon: BookOpen },
  { id: 'alunos',     label: 'Alunos',     icon: Users },
  { id: 'cadastrar',  label: 'Cadastrar',  icon: UserPlus },
];

const Coordenador = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { colors } = useAppTheme();
  const isMobile = useIsMobile();
  const { apiFetch } = useApi();

  const userName = user?.nome || 'Coordenador';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken') || localStorage.getItem('token');
    const storedUser = localStorage.getItem('usuario') || localStorage.getItem('userData');
    if (!storedToken || !storedUser) { navigate('/login/coordenador'); return; }
    try { JSON.parse(storedUser); } catch { navigate('/login/coordenador'); }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    signOut();
    navigate('/');
  }, [signOut, navigate]);

  return (
    <div className="min-h-screen flex transition-colors duration-300 w-full overflow-x-hidden"
      style={{ background: colors.pageBg, color: colors.textPrimary }}>

      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between"
          style={{ background: colors.headerBg, borderBottom: `1px solid ${colors.headerBorder}` }}>
          <button type="button" onClick={() => setSidebarOpen(true)} className="p-2" title="Abrir menu">
            <Menu className="h-6 w-6" style={{ color: colors.textPrimary }} />
          </button>
          <h1 className="text-xs uppercase tracking-widest font-display" style={{ color: colors.textPrimary }}>
            Painel Coordenador
          </h1>
          <ThemeSwitcher />
        </header>
      )}

      <aside className={`
          ${isMobile ? 'fixed left-0 top-0 h-full z-50 transform transition-transform duration-300' : ''}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          w-64 shrink-0 flex flex-col border-r
        `}
        style={{ background: colors.sidebarBg, borderColor: colors.sidebarBorder }}>

        {isMobile && (
          <div className="flex justify-end p-4">
            <button type="button" onClick={() => setSidebarOpen(false)} className="p-2" title="Fechar menu">
              <X className="h-6 w-6" style={{ color: colors.sidebarText }} />
            </button>
          </div>
        )}

        <div className="p-5 flex items-center gap-3 border-b" style={{ borderColor: colors.sidebarBorder }}>
          <img src={logoWhite} alt="Logo" className="h-9 w-auto" style={{ filter: colors.logoFilter }} />
          <div>
            <p className="text-xs font-display tracking-widest uppercase" style={{ color: colors.sidebarTextActive }}>Coordenador</p>
            <p className="text-[10px] font-display tracking-[0.2em] uppercase" style={{ color: ACCENT.orange }}>SENAC</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => { setActiveSection(item.id); if (isMobile) setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
              style={activeSection === item.id
                ? { background: `${ACCENT.orange}18`, border: `1px solid ${ACCENT.orange}33`, color: colors.sidebarTextActive }
                : { color: colors.sidebarText }}
            >
              <item.icon className="h-4 w-4" style={{ color: activeSection === item.id ? ACCENT.orange : undefined }} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: colors.sidebarBorder }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: `linear-gradient(135deg, ${ACCENT.orange}, hsl(30, 80%, 60%))` }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm" style={{ color: colors.sidebarTextActive }}>{userName}</p>
              <p className="text-[10px]" style={{ color: colors.labelColor }}>Coordenador</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs uppercase"
            style={{ background: 'hsla(0, 70%, 50%, 0.12)', color: 'hsl(0, 70%, 65%)' }}>
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {!isMobile && (
          <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b"
            style={{ background: colors.headerBg, borderColor: colors.headerBorder }}>
            <h1 className="text-sm uppercase tracking-widest" style={{ color: colors.textPrimary }}>
              {navItems.find(n => n.id === activeSection)?.label}
            </h1>
            <ThemeSwitcher />
          </header>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {activeSection === 'dashboard' && (
            <DashboardSection apiFetch={apiFetch} user={{ uid: user?.uid || '' }} colors={colors}
              toastSuccess={toastSuccess} toastError={toastError}
              accentBlue={ACCENT.blue} accentOrange={ACCENT.orange}
              onNavigateToSubmissoes={() => setActiveSection('submissoes')} />
          )}
          {activeSection === 'submissoes' && (
            <SubmissoesSection apiFetch={apiFetch} user={{ uid: user?.uid || '' }} colors={colors}
              toastSuccess={toastSuccess} toastError={toastError}
              accentBlue={ACCENT.blue} accentOrange={ACCENT.orange} accentGreen={ACCENT.green} />
          )}
          {activeSection === 'regras' && (
            <RegrasSection apiFetch={apiFetch} user={{ uid: user?.uid || '' }} colors={colors}
              toastSuccess={toastSuccess} toastError={toastError}
              accentBlue={ACCENT.blue} accentOrange={ACCENT.orange} />
          )}
          {activeSection === 'alunos' && (
            <AlunosSection apiFetch={apiFetch} colors={colors}
              toastError={toastError} accentOrange={ACCENT.orange} />
          )}
          {activeSection === 'cadastrar' && (
            <CadastrarSection apiFetch={apiFetch} colors={colors}
              toastSuccess={toastSuccess} toastError={toastError} accentOrange={ACCENT.orange} />
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Coordenador;
