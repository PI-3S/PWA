import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useapptheme';
import { useIsMobile } from '@/hooks/use-mobile';
import { useApi } from '@/hooks/useApi';
import ThemeSwitcher from '@/components/themeswitcher';
import { LogOut, BarChart3, Send, FileText, Menu, X } from 'lucide-react';
import { API_CONFIG } from '@/data/data';
import logoWhite from '@/assets/logo-white.png';
import Footer from '@/components/Footer';
import { toastSuccess, toastError } from '@/lib/toast';
import { ACCENT } from '@/lib/constants';
import ProgressoSection from '@/components/aluno/ProgressoSection';
import SubmissaoSection from '@/components/aluno/SubmissaoSection';
import HistoricoSection from '@/components/aluno/HistoricoSection';
import { Regra, Submissao } from '@/types/aluno';

const navItems = [
  { id: 'progress', label: 'Meu Progresso',   icon: BarChart3 },
  { id: 'submit',   label: 'Nova Submissão',   icon: Send },
  { id: 'history',  label: 'Histórico',        icon: FileText },
];

const Aluno = () => {
  const navigate = useNavigate();
  const { user, token, signOut } = useAuth();
  const { colors } = useAppTheme();
  const isMobile = useIsMobile();
  const { apiFetch } = useApi();

  const apiBase = API_CONFIG.BASE_URL;
  const userName = user?.nome || 'Aluno';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('progress');
  const [cursos, setCursos] = useState<any[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<string>('');
  const [regras, setRegras] = useState<Regra[]>([]);
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submissaoParaEditar, setSubmissaoParaEditar] = useState<Submissao | null>(null);

  const mapSubmissao = useCallback((s: any): Submissao => ({
    id: s.id,
    data_envio: s.data_envio || s.created_at || s.dataCriacao || new Date().toISOString(),
    tipo: s.tipo || s.type || s.categoria || '—',
    descricao: s.descricao || s.description || '',
    horas_solicitadas: s.horas_solicitadas || s.carga_horaria_solicitada || s.carga_horaria || 0,
    status: s.status || 'pendente',
    observacao: s.observacao || s.observacoes || '',
    regra_id: s.regra_id || '',
  }), []);

  const fetchCursos = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch('/api/alunos-cursos');
      const list = Array.isArray(data) ? data : data.vinculos || data.cursos || [];
      const mappedList = list.map((item: any) => ({
        id: item.id,
        curso_id: item.curso_id,
        curso_nome: item.curso_nome || item.nome_curso || item.curso?.nome || '—',
        carga_horaria_minima: item.carga_horaria_minima || item.cargaMinima || 200,
      }));
      setCursos(mappedList);
      if (mappedList.length > 0 && !selectedCurso) setSelectedCurso(mappedList[0].curso_id);
    } catch { toastError('Erro ao conectar com o servidor.'); }
  }, [token, selectedCurso, apiFetch]);

  const fetchRegras = useCallback(async () => {
    if (!token || !selectedCurso) return;
    try {
      const data = await apiFetch(`/api/regras?curso_id=${selectedCurso}`);
      setRegras(Array.isArray(data) ? data : data.regras || []);
    } catch { toastError('Erro ao carregar regras do curso.'); }
  }, [token, selectedCurso, apiFetch]);

  const fetchSubmissoes = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await apiFetch('/api/submissoes');
      const raw = Array.isArray(data) ? data : data.submissoes || data.data || [];
      setSubmissoes(raw.map(mapSubmissao));
    } catch { toastError('Erro ao carregar histórico.'); }
    setIsLoading(false);
  }, [token, apiFetch, mapSubmissao]);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken') || localStorage.getItem('token');
    const storedUser = localStorage.getItem('usuario') || localStorage.getItem('userData');
    if (!storedToken || !storedUser) { navigate('/login/aluno'); return; }
    try { JSON.parse(storedUser); } catch { navigate('/login/aluno'); }
  }, [navigate]);

  useEffect(() => { if (token) fetchCursos(); }, [token, fetchCursos]);

  useEffect(() => {
    if (!token) return;
    if (activeSection === 'submit' && selectedCurso) fetchRegras();
    if (activeSection === 'history') fetchSubmissoes();
  }, [activeSection, selectedCurso, token, fetchRegras, fetchSubmissoes]);

  const handleLogout = useCallback(() => { signOut(); navigate('/'); }, [signOut, navigate]);

  const handleCorrigir = (submissao: Submissao) => {
    setSubmissaoParaEditar(submissao);
    setActiveSection('submit');
  };

  const handleCancelEdit = () => {
    setSubmissaoParaEditar(null);
    setActiveSection('history');
  };

  return (
    <div className="min-h-screen transition-colors duration-500 w-full overflow-x-hidden" style={{ background: colors.panelBg }}>

      {isMobile && (
        <header className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
          style={{ background: colors.headerBg, borderBottom: `1px solid ${colors.headerBorder}` }}>
          <button type="button" onClick={() => setSidebarOpen(true)} className="p-2" title="Abrir menu">
            <Menu className="h-6 w-6" style={{ color: colors.textPrimary }} />
          </button>
          <div className="flex items-center gap-3">
            <img src={logoWhite} alt="Logo" className="h-6 w-auto" style={{ filter: colors.logoFilter }} />
            <h1 className="text-xs uppercase tracking-widest font-display" style={{ color: colors.titleColor }}>Maestria Aluno</h1>
          </div>
          <ThemeSwitcher />
        </header>
      )}

      <div className="min-h-screen w-full flex">
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`
            ${isMobile ? 'fixed left-0 top-0 h-full z-50 transform transition-transform duration-300' : ''}
            ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
            w-64 shrink-0 p-4
          `}
          style={{ background: colors.sidebarBg, borderRight: `1px solid ${colors.sidebarBorder}`, ...(isMobile ? {} : { minHeight: '100vh' }) }}>

          {isMobile && (
            <div className="flex justify-end mb-4">
              <button type="button" onClick={() => setSidebarOpen(false)} className="p-2" title="Fechar menu">
                <X className="h-6 w-6" style={{ color: colors.sidebarText }} />
              </button>
            </div>
          )}

          {!isMobile && (
            <div className="flex items-center gap-4 mb-6">
              <img src={logoWhite} alt="Logo" className="h-8 w-auto" style={{ filter: colors.logoFilter }} />
              <h1 className="font-display text-sm tracking-widest uppercase" style={{ color: colors.titleColor }}>Maestria Aluno</h1>
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => { setActiveSection(item.id); if (isMobile) setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 border ${activeSection === item.id ? '' : 'border-transparent'}`}
                style={activeSection === item.id ? {
                  background: 'hsla(160, 70%, 50%, 0.15)',
                  border: `1px solid ${ACCENT.alunoGreen}`,
                  color: colors.sidebarTextActive,
                  boxShadow: '0 0 15px -5px hsla(160, 70%, 50%, 0.3)',
                } : { color: colors.labelColor }}
              >
                <item.icon className="h-4 w-4" style={activeSection === item.id ? { color: ACCENT.alunoGreen } : {}} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-4 mt-4 border-t" style={{ borderColor: colors.sidebarBorder }}>
            {!isMobile && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: `linear-gradient(135deg, ${ACCENT.alunoGreen}, ${ACCENT.alunoGreenDim})` }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm" style={{ color: colors.sidebarTextActive }}>{userName}</p>
                  <p className="text-[10px]" style={{ color: colors.labelColor }}>Aluno</p>
                </div>
              </div>
            )}
            <button type="button" onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs uppercase"
              style={{ background: 'hsla(0, 70%, 50%, 0.15)', border: '1px solid hsla(0, 70%, 50%, 0.3)', color: 'hsl(0, 70%, 65%)' }}>
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto min-w-0">
          {!isMobile && (
            <header className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-bold" style={{ color: colors.titleColor }}>
                {navItems.find(n => n.id === activeSection)?.label}
              </h1>
              <ThemeSwitcher />
            </header>
          )}

          {activeSection === 'progress' && (
            <ProgressoSection apiFetch={apiFetch} cursos={cursos} selectedCurso={selectedCurso}
              onSelectCurso={setSelectedCurso} toastError={toastError} colors={colors}
              accentGreen={ACCENT.alunoGreen} accentGreenDim={ACCENT.alunoGreenDim} />
          )}
          {activeSection === 'submit' && (
            <SubmissaoSection apiFetch={apiFetch} apiBase={apiBase} token={token} regras={regras}
              toastSuccess={toastSuccess} toastError={toastError}
              onSuccess={() => { setActiveSection('history'); fetchSubmissoes(); setSubmissaoParaEditar(null); }}
              onCancelEdit={handleCancelEdit} colors={colors}
              accentGreen={ACCENT.alunoGreen} submissaoParaEditar={submissaoParaEditar} />
          )}
          {activeSection === 'history' && (
            <HistoricoSection submissoes={submissoes} isLoading={isLoading} colors={colors}
              accentGreen={ACCENT.alunoGreen} onCorrigir={handleCorrigir} />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Aluno;
