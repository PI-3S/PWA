import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, FileCheck, ScrollText, Link2,
  LogOut, X, Menu, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { API_CONFIG } from '@/data/data';
import logoWhite from '@/assets/logo-white.png';
import Footer from '@/components/Footer';
import { useAppTheme } from '@/hooks/useapptheme';
import { useIsMobile } from '@/hooks/use-mobile';
import ThemeSwitcher from '@/components/themeswitcher';
import DashboardSection from '@/components/admin/DashboardSection';
import CursosSection from '@/components/admin/CursosSection';
import UsuariosSection from '@/components/admin/UsuariosSection';
import ValidacaoSection from '@/components/admin/ValidacaoSection';
import RegrasSection from '@/components/admin/RegrasSection';
import CoordenadoresSection from '@/components/admin/CoordenadoresSection';
import ConfiguracoesSection from '@/components/admin/ConfiguracoesSection';

const API_BASE = API_CONFIG.BASE_URL;

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Gestão de Cursos', icon: BookOpen },
  { id: 'users', label: 'Gestão de Usuários', icon: Users },
  { id: 'validation', label: 'Validação', icon: FileCheck },
  { id: 'rules', label: 'Regras de Atividades', icon: ScrollText },
  { id: 'coordinators', label: 'Coordenadores', icon: Link2 },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

const accentBlue = 'hsl(210, 80%, 55%)';
const accentOrange = 'hsl(30, 95%, 55%)';

const toastStyle = {
  background: 'hsl(220, 45%, 14%)',
  color: 'white',
  border: `1px solid hsla(200, 60%, 40%, 0.3)`,
};
const toastSuccess = (msg: string) => toast.success(msg, { style: toastStyle });
const toastError = (msg: string) => toast.error(msg, { style: { ...toastStyle, border: '1px solid hsla(0,70%,50%,0.4)' } });

const Admin = () => {
  const navigate = useNavigate();
  const { user, token, signOut } = useAuth();
  const userName = user?.nome || 'Admin';
  const { colors } = useAppTheme();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [section, setSection] = useState('dashboard');

  // Welcome toast
  useEffect(() => {
    const welcomed = sessionStorage.getItem('welcomed_admin');
    if (!welcomed) {
      toastSuccess(`Bem-vindo, ${userName}!`);
      sessionStorage.setItem('welcomed_admin', 'true');
    }
  }, []);

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
    sessionStorage.removeItem('welcomed_admin');
    signOut();
  };

  return (
    <div className="min-h-screen flex transition-colors duration-300 w-full overflow-x-hidden" style={{ background: colors.pageBg }}>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        ${isMobile ? 'fixed left-0 top-0 h-full z-50 transform transition-transform duration-300' : ''}
        ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        w-64 shrink-0 flex flex-col border-r
      `} style={{ background: colors.sidebarBg, borderColor: colors.sidebarBorder }}>
        {isMobile && (
          <div className="flex justify-end p-4">
            <button onClick={() => setSidebarOpen(false)} className="p-2">
              <X className="h-5 w-5" style={{ color: colors.sidebarText }} />
            </button>
          </div>
        )}

        <div className="p-5 flex items-center gap-3 border-b" style={{ borderColor: colors.sidebarBorder }}>
          <img src={logoWhite} alt="Logo" className="h-9 w-auto" style={{ filter: colors.logoFilter }} />
          <div>
            <p className="text-xs font-display tracking-widest uppercase" style={{ color: colors.sidebarTextActive }}>Atividades</p>
            <p className="text-[10px] font-display tracking-[0.2em] uppercase" style={{ color: accentOrange }}>SENAC</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setSection(item.id);
                if (isMobile) setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
              style={section === item.id ? { background: `${accentBlue}18`, border: `1px solid ${accentBlue}33`, color: colors.sidebarTextActive } : { color: colors.sidebarText }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: colors.sidebarBorder }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))` }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm" style={{ color: colors.sidebarTextActive }}>{userName}</p>
              <p className="text-[10px]" style={{ color: colors.labelColor }}>Super Admin</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs uppercase" style={{ background: 'hsla(0, 70%, 50%, 0.12)', color: 'hsl(0, 70%, 65%)' }}>
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b" style={{ background: colors.headerBg, borderColor: colors.headerBorder }}>
          <div className="flex items-center gap-3">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="p-2" style={{ color: colors.textPrimary }}>
                <Menu className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-sm uppercase tracking-widest" style={{ color: colors.textPrimary }}>{navItems.find(n => n.id === section)?.label}</h1>
          </div>
          <ThemeSwitcher />
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {section === 'dashboard' && (
            <DashboardSection
              apiFetch={apiFetch}
              colors={colors}
              toastError={toastError}
              accentBlue={accentBlue}
              accentOrange={accentOrange}
            />
          )}

          {section === 'courses' && (
            <CursosSection
              apiFetch={apiFetch}
              colors={colors}
              toastSuccess={toastSuccess}
              toastError={toastError}
              accentBlue={accentBlue}
            />
          )}

          {section === 'users' && (
            <UsuariosSection
              apiFetch={apiFetch}
              colors={colors}
              toastSuccess={toastSuccess}
              toastError={toastError}
              accentBlue={accentBlue}
              accentOrange={accentOrange}
            />
          )}

          {section === 'validation' && (
            <ValidacaoSection
              apiFetch={apiFetch}
              colors={colors}
              toastSuccess={toastSuccess}
              toastError={toastError}
              accentBlue={accentBlue}
              accentOrange={accentOrange}
            />
          )}

          {section === 'rules' && (
            <RegrasSection
              apiFetch={apiFetch}
              colors={colors}
              toastSuccess={toastSuccess}
              toastError={toastError}
              accentBlue={accentBlue}
              accentOrange={accentOrange}
            />
          )}

          {section === 'coordinators' && (
            <CoordenadoresSection
              apiFetch={apiFetch}
              colors={colors}
              toastSuccess={toastSuccess}
              toastError={toastError}
              accentBlue={accentBlue}
              accentOrange={accentOrange}
            />
          )}

          {section === 'settings' && (
            <ConfiguracoesSection
              apiFetch={apiFetch}
              colors={colors}
              toastSuccess={toastSuccess}
              toastError={toastError}
              accentBlue={accentBlue}
              accentOrange={accentOrange}
            />
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Admin;
