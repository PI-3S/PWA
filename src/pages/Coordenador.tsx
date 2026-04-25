import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useapptheme';
import { useIsMobile } from '@/hooks/use-mobile';
import ThemeSwitcher from '@/components/themeswitcher';
import {
  LogOut, LayoutDashboard, FileText, Users, UserPlus,
  Clock, CheckCircle2, XCircle, AlertTriangle,
  ExternalLink, Loader2, Menu, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { API_CONFIG } from '@/data/data';
import logoWhite from '@/assets/logo-white.png';

const API_BASE = API_CONFIG.BASE_URL;

// Estilo de toast consistente
const toastStyle = {
  background: 'hsl(220, 45%, 14%)',
  color: 'white',
  border: '1px solid hsla(200, 60%, 40%, 0.3)',
};
const toastSuccess = (msg: string) => toast.success(msg, { style: toastStyle });
const toastError = (msg: string) => toast.error(msg, { style: { ...toastStyle, border: '1px solid hsla(0,70%,50%,0.4)' } });

// Interfaces com mapeamento robusto
interface DashboardMetrics {
  total_submissoes: number;
  pendentes: number;
  aprovadas: number;
  reprovadas: number;
  por_curso: { curso: string; total: number; aprovadas: number; pendentes: number; reprovadas: number }[];
  total_alunos?: number;
}

interface Submissao {
  id: string;
  aluno_id: string;
  aluno_nome: string;
  curso_nome: string;
  area: string;
  horas_solicitadas: number;
  status: 'pendente' | 'aprovado' | 'reprovado' | 'correcao';
  data_envio: string;
  data_validacao?: string;
  descricao?: string;
  observacao?: string;
}

interface Certificado {
  id: string;
  nome_arquivo: string;
  url_arquivo: string;
  texto_extraido: string | null;
}

interface AlunoInfo {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  curso_nome: string;
  horas_aprovadas: number;
  carga_minima: number;
}

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

  const inputStyle = {
    background: colors.inputBg,
    color: colors.textPrimary,
    border: `1px solid ${colors.inputBorder}`,
  };

  // Estado para sidebar mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados principais
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  // Dados
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [alunos, setAlunos] = useState<AlunoInfo[]>([]);
  const [cursos, setCursos] = useState<{ id: string; nome: string; carga_horaria_minima?: number }[]>([]);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [certificados, setCertificados] = useState<Record<string, Certificado[]>>({});

  // Filtros
  const [subFilterCurso, setSubFilterCurso] = useState('all');
  const [subFilterStatus, setSubFilterStatus] = useState('all');

  // Formulário de cadastro
  const [cadForm, setCadForm] = useState({ nome: '', matricula: '', email: '', senha: '', curso_id: '' });
  const [cadLoading, setCadLoading] = useState(false);

  // Modal de correção
  const [correcaoDialog, setCorrecaoDialog] = useState(false);
  const [correcaoSubmissao, setCorrecaoSubmissao] = useState<Submissao | null>(null);
  const [correcaoObs, setCorrecaoObs] = useState('');

  // Modal de aprovação com horas
  const [approveDialog, setApproveDialog] = useState(false);
  const [approveSubmissao, setApproveSubmissao] = useState<Submissao | null>(null);
  const [approveHoras, setApproveHoras] = useState(0);

  // Hooks de autenticação - definidos ANTES dos useEffect
  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  // Função para mapear campos da API com fallback
  const mapSubmissao = useCallback((s: any): Submissao => ({
    id: s.id,
    aluno_nome: s.aluno_nome || s.nome_aluno || s.aluno?.nome || s.usuario?.nome || '—',
    curso_nome: s.curso_nome || s.nome_curso || s.curso?.nome || '—',
    area: s.area || s.area_atividade || s.categoria || '—',
    horas_solicitadas: s.horas_solicitadas || s.carga_horaria_solicitada || s.carga_horaria || 0,
    status: s.status || 'pendente',
    data_envio: s.data_envio || s.created_at || s.dataCriacao || new Date().toISOString(),
    descricao: s.descricao || s.description || '',
    observacao: s.observacao || s.observacoes || '',
  }), []);

  const mapAluno = useCallback((a: any, cursosMap: Record<string, string>): AlunoInfo => ({
    id: a.id,
    nome: a.nome || a.name || '—',
    email: a.email || '',
    matricula: a.matricula || a.numero_matricula || '—',
    curso_nome: a.curso_nome || cursosMap[a.curso_id] || '—',
    horas_aprovadas: a.horas_aprovadas || a.horasAprovadas || 0,
    carga_minima: a.carga_minima || a.cargaHorariaMinima || 200,
  }), []);

  // Data Fetching
  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/coordenador`, { headers: authHeaders() });
      const data = await res.json();

      // Mapeamento robusto para métricas
      const metricas = data.metricas || data;
      setMetrics({
        total_submissoes: metricas.total_submissoes || 0,
        pendentes: metricas.pendentes || 0,
        aprovadas: metricas.aprovadas || 0,
        reprovadas: metricas.reprovadas || 0,
        por_curso: metricas.por_curso || [],
        total_alunos: metricas.total_alunos || metricas.quantidade_alunos || 0,
      });
    } catch { toastError('Erro ao carregar métricas.'); }
  }, [token, authHeaders]);

  const fetchSubmissoes = useCallback(async () => {
    if (!token) return;
    try {
      // Buscar submissões, usuários, regras e cursos em paralelo
      const [subsRes, usuariosRes, regrasRes, cursosRes] = await Promise.all([
        fetch(`${API_BASE}/api/submissoes`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/usuarios`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/regras`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/cursos`, { headers: authHeaders() }),
      ]);

      const subsData = await subsRes.json();
      const usuariosData = await usuariosRes.json();
      const regrasData = await regrasRes.json();
      const cursosData = await cursosRes.json();

      const raw = Array.isArray(subsData) ? subsData : subsData.submissoes || subsData.data || [];

      // Criar maps para enriquecimento
      const usuariosMap = new Map<string, string>();
      (Array.isArray(usuariosData) ? usuariosData : (usuariosData.usuarios || [])).forEach((u: any) => {
        usuariosMap.set(u.id, u.nome);
      });

      const regrasMap = new Map<string, { area: string; curso_id: string }>();
      (Array.isArray(regrasData) ? regrasData : (regrasData.regras || [])).forEach((r: any) => {
        regrasMap.set(r.id, { area: r.area, curso_id: r.curso_id });
      });

      const cursosMap = new Map<string, string>();
      (Array.isArray(cursosData) ? cursosData : (cursosData.cursos || [])).forEach((c: any) => {
        cursosMap.set(c.id, c.nome);
      });

      // Mapear submissões com dados enriquecidos
      const mapped = raw.map((s: any) => {
        const regra = regrasMap.get(s.regra_id);
        return {
          id: s.id,
          aluno_id: s.aluno_id || s.userId || s.usuario_id || '',
          aluno_nome: s.aluno_nome || s.nome_aluno || s.aluno?.nome || s.usuario?.nome || usuariosMap.get(s.aluno_id) || '—',
          curso_nome: s.curso_nome || s.nome_curso || s.curso?.nome || (regra ? cursosMap.get(regra.curso_id) : '—') || '—',
          area: s.area || s.area_atividade || s.categoria || (regra ? regra.area : '—') || '—',
          horas_solicitadas: s.horas_solicitadas || s.carga_horaria_solicitada || s.carga_horaria || 0,
          status: s.status || 'pendente',
          data_envio: s.data_envio || s.created_at || s.dataCriacao || new Date().toISOString(),
          data_validacao: s.data_validacao || s.updated_at || s.dataAtualizacao,
          descricao: s.descricao || s.description || '',
          observacao: s.observacao || s.observacoes || '',
        };
      });

      setSubmissoes(mapped);
    } catch { toastError('Erro ao carregar submissões.'); }
  }, [token, authHeaders]);

  const fetchAlunos = useCallback(async () => {
    if (!token) return;
    try {
      const [resUsers, resCursos] = await Promise.all([
        fetch(`${API_BASE}/api/usuarios?perfil=aluno`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/cursos`, { headers: authHeaders() }),
      ]);
      const dataUsers = await resUsers.json();
      const dataCursos = await resCursos.json();

      const cursosMap: Record<string, string> = {};
      const cursosArray = Array.isArray(dataCursos) ? dataCursos : (dataCursos.cursos || []);
      cursosArray.forEach((c: any) => {
        cursosMap[c.id] = c.nome;
      });

      // Fallback robusto para diferentes formatos de resposta
      const rawList = Array.isArray(dataUsers) ? dataUsers : (dataUsers.usuarios || dataUsers.data || []);
      const alunosList = rawList.filter((u: any) => u.perfil === 'aluno' || u.perfil === 'Aluno');

      const mappedAlunos = alunosList.map((a: any) => ({
        id: a.id,
        nome: a.nome || a.name || '—',
        email: a.email || '',
        matricula: a.matricula || a.numero_matricula || '—',
        curso_nome: a.curso_nome || cursosMap[a.curso_id] || '—',
        horas_aprovadas: a.horas_aprovadas || a.horasAprovadas || 0,
        carga_minima: a.carga_minima || a.cargaHorariaMinima || 200,
      }));

      setAlunos(mappedAlunos);
    } catch { toastError('Erro ao carregar alunos.'); }
  }, [token, authHeaders]);

  const fetchCursos = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/cursos`, { headers: authHeaders() });
      const data = await res.json();
      setCursos(Array.isArray(data) ? data : data.cursos || []);
    } catch { /* silent */ }
  }, [token, authHeaders]);

  const fetchCertificados = useCallback(async (submissaoId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/certificados?submissao_id=${submissaoId}`, { headers: authHeaders() });
      const data = await res.json();
      setCertificados(prev => ({ ...prev, [submissaoId]: Array.isArray(data) ? data : data.certificados || [] }));
    } catch { /* silent */ }
  }, [authHeaders]);

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

  // Carregamento inicial
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([fetchDashboard(), fetchCursos(), fetchSubmissoes()]).finally(() => setLoading(false));
  }, [token, fetchDashboard, fetchCursos, fetchSubmissoes]);

  useEffect(() => {
    if (activeSection === 'alunos' && token) fetchAlunos();
  }, [activeSection, token, fetchAlunos]);

  // Ações
  const handleDecision = async (id: string, status: 'aprovado' | 'reprovado' | 'correcao', observacao?: string, horasAprovadas?: number) => {
    setIsActionLoading(id);
    try {
      const body: any = { status, coordenador_id: user?.uid };
      if (status === 'correcao' && observacao) {
        body.observacao = observacao;
      }
      if (status === 'aprovado' && horasAprovadas !== undefined) {
        body.horas_aprovadas = horasAprovadas;
      }

      const res = await fetch(`${API_BASE}/api/submissoes/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const statusLabels = {
          aprovado: 'aprovada',
          reprovado: 'reprovada',
          correcao: 'enviada para correção',
        };
        toastSuccess(`Submissão ${statusLabels[status]}!`);
        setSubmissoes(prev => prev.map(s => s.id === id ? { ...s, status: status as any, observacao } : s));
        await Promise.all([fetchDashboard(), fetchSubmissoes()]);
        setCorrecaoDialog(false);
        setCorrecaoSubmissao(null);
        setCorrecaoObs('');
      } else {
        toastError('Erro ao processar decisão.');
      }
    } catch { toastError('Erro de conexão.'); }
    finally { setIsActionLoading(null); }
  };

  const openCorrecaoDialog = (submissao: Submissao) => {
    setCorrecaoSubmissao(submissao);
    setCorrecaoObs('');
    setCorrecaoDialog(true);
  };

  const openApproveDialog = (submissao: Submissao) => {
    setApproveSubmissao(submissao);
    setApproveHoras(submissao.horas_solicitadas || 0);
    setApproveDialog(true);
  };

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCadLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/usuarios`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...cadForm, perfil: 'aluno' }),
      });
      if (res.ok) {
        toastSuccess('Aluno cadastrado com sucesso!');
        setCadForm({ nome: '', matricula: '', email: '', senha: '', curso_id: '' });
        fetchAlunos();
      } else {
        const err = await res.json().catch(() => ({}));
        toastError(err.error || err.mensagem || 'Erro ao cadastrar aluno.');
      }
    } catch { toastError('Erro de conexão.'); }
    finally { setCadLoading(false); }
  };

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

  // Filtros
  const filteredSubs = submissoes.filter(s =>
    (subFilterCurso === 'all' || s.curso_nome === subFilterCurso) &&
    (subFilterStatus === 'all' || s.status === subFilterStatus)
  );

  // Calcular progresso do aluno baseado nas submissões aprovadas
  const calcularProgressoAluno = (alunoId: string, cursoNome: string) => {
    const horasAprovadas = submissoes
      .filter(s => s.aluno_id === alunoId && s.status === 'aprovado')
      .reduce((acc, s) => acc + (s.horas_solicitadas || 0), 0);

    const curso = cursos.find(c => c.nome === cursoNome);
    const cargaMinima = curso?.carga_horaria_minima || 200;
    const progresso = Math.min((horasAprovadas / cargaMinima) * 100, 100);

    return { horasAprovadas, progresso: Math.round(progresso), cargaMinima };
  };

  const statusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; border: string; icon: any }> = {
      aprovado: { bg: 'hsla(152, 60%, 40%, 0.12)', text: 'hsl(152, 60%, 55%)', border: 'hsla(152, 60%, 40%, 0.3)', icon: CheckCircle2 },
      reprovado: { bg: 'hsla(0, 72%, 50%, 0.12)', text: 'hsl(0, 72%, 60%)', border: 'hsla(0, 72%, 50%, 0.3)', icon: XCircle },
      pendente: { bg: 'hsla(38, 92%, 50%, 0.12)', text: 'hsl(38, 92%, 60%)', border: 'hsla(38, 92%, 50%, 0.3)', icon: Clock },
      correcao: { bg: 'hsla(45, 95%, 50%, 0.12)', text: 'hsl(45, 95%, 55%)', border: 'hsla(45, 95%, 50%, 0.3)', icon: AlertTriangle },
    };
    const config = configs[status] || configs.pendente;
    const Icon = config.icon;
    return (
      <Badge style={{ background: config.bg, color: config.text, border: `1px solid ${config.border}` }}>
        <Icon className="h-3 w-3 mr-1" />
        {status === 'correcao' ? 'Correção' : status}
      </Badge>
    );
  };

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
        {/* Mobile Sidebar Overlay — inside flex container, below sidebar in DOM order */}
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

          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: accentOrange }} />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Cards de métricas */}
                    {[
                      { label: 'Total', value: metrics?.total_submissoes || 0, icon: FileText, color: accentBlue },
                      { label: 'Pendentes', value: metrics?.pendentes || 0, icon: Clock, color: accentOrange },
                      { label: 'Aprovadas', value: metrics?.aprovadas || 0, icon: CheckCircle2, color: 'hsl(152, 60%, 50%)' },
                      { label: 'Reprovadas', value: metrics?.reprovadas || 0, icon: XCircle, color: 'hsl(0, 72%, 55%)' },
                      { label: 'Total Alunos', value: metrics?.total_alunos || 0, icon: Users, color: 'hsl(280, 60%, 55%)' },
                    ].map((card) => (
                      <div
                        key={card.label}
                        className="p-5 rounded-xl border transition-all"
                        style={{ background: colors.cardBg, borderColor: colors.cardBorder }}
                      >
                        <card.icon className="h-5 w-5 mb-3" style={{ color: card.color }} />
                        <p className="text-[10px] uppercase tracking-wider opacity-50 font-display">{card.label}</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: colors.titleColor }}>{card.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl p-6 border overflow-x-auto" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
                    <h3 className="text-sm font-display uppercase tracking-wider mb-4" style={{ color: colors.titleColor }}>
                      Fila de Prioridade (Pendentes)
                    </h3>
                    <div className="space-y-3">
                      {submissoes.filter(s => s.status === 'pendente').slice(0, 5).map(s => (
                        <div
                          key={s.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border"
                          style={{ background: colors.inputBg, borderColor: colors.inputBorder }}
                        >
                          <div>
                            <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>{s.aluno_nome}</p>
                            <p className="text-xs opacity-50">{s.curso_nome} • {s.area}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => openApproveDialog(s)} className="bg-emerald-600 hover:bg-emerald-500 text-white">Aprovar</Button>
                            <Button size="sm" variant="outline" onClick={() => openCorrecaoDialog(s)} style={{ borderColor: 'hsl(45, 95%, 50%)', color: 'hsl(45, 95%, 55%)' }}>
                              <AlertTriangle className="h-3 w-3 mr-1" /> Correção
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDecision(s.id, 'reprovado')} style={{ borderColor: 'hsl(0, 72%, 50%)', color: 'hsl(0, 72%, 60%)' }}>Reprovar</Button>
                          </div>
                        </div>
                      ))}
                      {submissoes.filter(s => s.status === 'pendente').length === 0 && (
                        <p className="text-center py-8 opacity-50">Nenhuma submissão pendente.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Submissões Section */}
          {activeSection === 'submissoes' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Select value={subFilterCurso} onValueChange={setSubFilterCurso}>
                  <SelectTrigger className="w-48" style={inputStyle}>
                    <SelectValue placeholder="Curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Cursos</SelectItem>
                    {cursos.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={subFilterStatus} onValueChange={setSubFilterStatus}>
                  <SelectTrigger className="w-48" style={inputStyle}>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="reprovado">Reprovado</SelectItem>
                    <SelectItem value="correcao">Correção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-xl border overflow-x-auto" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
                <table className="w-full text-left min-w-[600px]">
                  <thead style={{ background: colors.sidebarBg }}>
                    <tr className="text-[10px] uppercase tracking-widest">
                      <th className="px-6 py-4" style={{ color: accentOrange }}>Aluno</th>
                      <th className="px-6 py-4" style={{ color: accentOrange }}>Curso</th>
                      <th className="px-6 py-4" style={{ color: accentOrange }}>Horas</th>
                      <th className="px-6 py-4" style={{ color: accentOrange }}>Status</th>
                      <th className="px-6 py-4 text-right" style={{ color: accentOrange }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: colors.cardBorder }}>
                    {filteredSubs.map((s) => (
                      <React.Fragment key={s.id}>
                        <tr className="hover:opacity-80 transition-all">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>{s.aluno_nome}</p>
                            <p className="text-[10px] font-mono" style={{ color: colors.labelColor }}>{new Date(s.data_envio).toLocaleDateString()}</p>
                          </td>
                          <td className="px-6 py-4 text-sm" style={{ color: colors.textSecondary }}>{s.curso_nome}</td>
                          <td className="px-6 py-4 text-sm font-mono" style={{ color: accentOrange }}>{s.horas_solicitadas}h</td>
                          <td className="px-6 py-4">{statusBadge(s.status)}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => { setExpandedSub(expandedSub === s.id ? null : s.id); fetchCertificados(s.id); }}
                              className="p-2 transition-colors"
                              style={{ color: colors.labelColor }}
                            >
                              {expandedSub === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </td>
                        </tr>
                        {expandedSub === s.id && (
                          <tr>
                            <td colSpan={5} className="px-8 py-6" style={{ background: 'rgba(0,0,0,0.2)' }}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <h4 className="text-xs font-display uppercase opacity-50">Detalhes do Certificado</h4>
                                  {certificados[s.id]?.map(cert => (
                                    <div key={cert.id} className="p-4 rounded-xl border space-y-3" style={{ background: colors.inputBg, borderColor: colors.inputBorder }}>
                                      <div className="flex justify-between items-center">
                                        <p className="text-xs font-mono truncate" style={{ color: colors.textPrimary }}>{cert.nome_arquivo}</p>
                                        <a href={cert.url_arquivo} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline text-xs flex items-center gap-1">
                                          <ExternalLink className="h-3 w-3" /> Ver PDF
                                        </a>
                                      </div>
                                      {cert.texto_extraido && (
                                        <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                                          <p className="text-[10px] uppercase opacity-50 mb-2">OCR - Texto Extraído</p>
                                          <p className="text-[11px] leading-relaxed max-h-32 overflow-y-auto" style={{ color: colors.textSecondary }}>{cert.texto_extraido}</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {!certificados[s.id]?.length && <p className="text-xs opacity-50">Nenhum certificado anexado.</p>}
                                </div>
                                <div className="space-y-4">
                                  <h4 className="text-xs font-display uppercase opacity-50">Tomar Decisão</h4>
                                  <p className="text-sm italic" style={{ color: colors.textSecondary }}>"{s.descricao || 'Sem descrição.'}"</p>
                                  {s.status === 'correcao' && s.observacao && (
                                    <div className="p-3 rounded-lg border" style={{ background: 'hsla(45, 95%, 50%, 0.1)', borderColor: 'hsla(45, 95%, 50%, 0.3)' }}>
                                      <p className="text-[10px] uppercase font-bold mb-1" style={{ color: 'hsl(45, 95%, 55%)' }}>Observação do Coordenador</p>
                                      <p className="text-sm" style={{ color: colors.textPrimary }}>{s.observacao}</p>
                                    </div>
                                  )}
                                  {(s.status === 'pendente' || s.status === 'correcao') ? (
                                    <div className="flex flex-wrap gap-3 pt-4">
                                      <Button
                                        disabled={isActionLoading === s.id}
                                        onClick={() => openApproveDialog(s)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                      >
                                        {isActionLoading === s.id ? <Loader2 className="animate-spin mr-2" /> : null}
                                        APROVAR HORAS
                                      </Button>
                                      <Button
                                        disabled={isActionLoading === s.id}
                                        variant="outline"
                                        onClick={() => openCorrecaoDialog(s)}
                                        style={{ borderColor: 'hsl(45, 95%, 50%)', color: 'hsl(45, 95%, 55%)' }}
                                      >
                                        CORREÇÃO
                                      </Button>
                                      <Button
                                        disabled={isActionLoading === s.id}
                                        variant="outline"
                                        onClick={() => handleDecision(s.id, 'reprovado')}
                                        style={{ borderColor: 'hsl(0, 72%, 50%)', color: 'hsl(0, 72%, 60%)' }}
                                      >
                                        REPROVAR
                                      </Button>
                                    </div>
                                  ) : (
                                    <p className="text-sm pt-4" style={{ color: colors.labelColor }}>
                                      {s.status === 'aprovado'
                                        ? `✅ Aprovado em ${s.data_validacao ? new Date(s.data_validacao).toLocaleDateString() : '—'}`
                                        : `❌ Reprovado em ${s.data_validacao ? new Date(s.data_validacao).toLocaleDateString() : '—'}`
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cadastrar Section */}
          {activeSection === 'cadastrar' && (
            <div className="max-w-xl mx-auto p-8 rounded-xl border" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: colors.titleColor }}>Novo Cadastro de Aluno</h2>
              <form onSubmit={handleCadastrar} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Nome Completo</label>
                  <Input value={cadForm.nome} onChange={e => setCadForm({...cadForm, nome: e.target.value})} style={inputStyle} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Matrícula</label>
                    <Input value={cadForm.matricula} onChange={e => setCadForm({...cadForm, matricula: e.target.value})} style={inputStyle} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Curso</label>
                    <Select onValueChange={val => setCadForm({...cadForm, curso_id: val})}>
                      <SelectTrigger style={inputStyle}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Email Institucional</label>
                  <Input type="email" value={cadForm.email} onChange={e => setCadForm({...cadForm, email: e.target.value})} style={inputStyle} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Senha Temporária</label>
                  <Input type="password" value={cadForm.senha} onChange={e => setCadForm({...cadForm, senha: e.target.value})} style={inputStyle} required />
                </div>
                <Button type="submit" disabled={cadLoading} className="w-full bg-orange-600 hover:bg-orange-500 text-white">
                  {cadLoading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  CADASTRAR ALUNO
                </Button>
              </form>
            </div>
          )}

          {/* Alunos Section */}
          {activeSection === 'alunos' && (
            <div className="rounded-xl border overflow-x-auto" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
              <table className="w-full text-left min-w-[500px]">
                <thead style={{ background: colors.sidebarBg }}>
                  <tr className="text-[10px] uppercase tracking-widest">
                    <th className="px-6 py-4" style={{ color: accentOrange }}>Aluno</th>
                    <th className="px-6 py-4" style={{ color: accentOrange }}>Matrícula</th>
                    <th className="px-6 py-4" style={{ color: accentOrange }}>Curso</th>
                    <th className="px-6 py-4" style={{ color: accentOrange }}>Progresso</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: colors.cardBorder }}>
                  {alunos.map((a) => {
                    const progresso = calcularProgressoAluno(a.id, a.curso_nome);
                    return (
                      <tr key={a.id} className="hover:opacity-80">
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: colors.textPrimary }}>{a.nome}</td>
                        <td className="px-6 py-4 text-sm font-mono" style={{ color: colors.labelColor }}>{a.matricula}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: colors.textSecondary }}>{a.curso_nome}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: colors.inputBg }}>
                              <div className="h-full bg-orange-500" style={{ width: `${progresso.progresso}%` }} />
                            </div>
                            <span className="text-xs font-mono" style={{ color: colors.textPrimary }}>{progresso.horasAprovadas}h</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Modal de Correção */}
      <Dialog open={correcaoDialog} onOpenChange={setCorrecaoDialog}>
        <DialogContent style={{ background: colors.panelBg, border: `1px solid ${colors.cardBorder}` }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Solicitar Correção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Descreva o que precisa ser corrigido na submissão de <strong>{correcaoSubmissao?.aluno_nome}</strong>.
            </p>
            <Textarea
              placeholder="Observação obrigatória..."
              value={correcaoObs}
              onChange={e => setCorrecaoObs(e.target.value)}
              style={inputStyle}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCorrecaoDialog(false)}>Cancelar</Button>
            <Button
              onClick={() => correcaoSubmissao && handleDecision(correcaoSubmissao.id, 'correcao', correcaoObs)}
              disabled={!correcaoObs.trim() || isActionLoading === correcaoSubmissao?.id}
              style={{ background: 'hsl(45, 95%, 50%)', color: 'black' }}
            >
              {isActionLoading === correcaoSubmissao?.id ? <Loader2 className="animate-spin mr-2" /> : null}
              Enviar para Correção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog: Aprovar com horas */}
      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent style={{ background: colors.panelBg, border: `1px solid ${colors.cardBorder}` }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Aprovar Submissão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Aluno: <strong>{approveSubmissao?.aluno_nome}</strong>
            </p>
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>
                Horas a aprovar
              </label>
              <Input
                type="number"
                min={1}
                value={approveHoras}
                onChange={e => setApproveHoras(Number(e.target.value))}
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={{ color: colors.labelColor }}>
                Solicitado: {approveSubmissao?.horas_solicitadas || 0}h
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (approveSubmissao) {
                  handleDecision(approveSubmissao.id, 'aprovado', undefined, approveHoras);
                  setApproveDialog(false);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Coordenador;