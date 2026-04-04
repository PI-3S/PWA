import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, LogOut, LayoutDashboard, FileText, Users, UserPlus,
  Clock, CheckCircle2, XCircle, AlertTriangle, Eye, ChevronDown, ChevronUp,
  ExternalLink, Search, Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import logoWhite from '@/assets/logo-white.png';

const API_BASE = 'https://back-end-banco-five.vercel.app';

const getToken = () => localStorage.getItem('authToken') || '';
const getUser = () => {
  try { return JSON.parse(localStorage.getItem('userData') || '{}'); } catch { return {}; }
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// Types
interface DashboardMetrics {
  total_submissoes: number;
  pendentes: number;
  aprovadas: number;
  reprovadas: number;
  por_area: { area: string; total: number; aprovadas: number; pendentes: number; reprovadas: number }[];
  por_curso: { curso: string; total: number; aprovadas: number; pendentes: number; reprovadas: number }[];
}

interface Submissao {
  id: string;
  aluno_id: string;
  coordenador_id: string | null;
  regra_id: string | null;
  status: string;
  data_envio: string;
  data_validacao: string | null;
  descricao?: string;
  horas_solicitadas?: number;
  aluno_nome?: string;
  curso_nome?: string;
  area?: string;
}

interface Certificado {
  id: string;
  submissao_id: string;
  nome_arquivo: string;
  url_arquivo: string;
  processado_ocr: boolean;
  texto_extraido: string | null;
  created_at: string;
}

interface AlunoInfo {
  id?: string;
  uid?: string;
  user_id?: string;
  nome: string;
  email: string;
  matricula: string;
  curso_nome?: string;
  curso_id?: string;
  submissoes?: number;
  horas_aprovadas?: number;
  carga_minima?: number;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'submissoes', label: 'Submissões', icon: FileText },
  { id: 'alunos', label: 'Alunos', icon: Users },
  { id: 'cadastrar', label: 'Cadastrar Aluno', icon: UserPlus },
];

const Coordenador = () => {
  const navigate = useNavigate();
  const user = getUser();
  const userName = user.nome || localStorage.getItem('userEmail')?.split('@')[0]?.replace(/[0-9]/g, '')?.replace(/[._]/g, ' ')?.trim() || 'Coordenador';

  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Dashboard state
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dashboardTab, setDashboardTab] = useState('todos');

  // Submissões state
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [subFilterCurso, setSubFilterCurso] = useState('all');
  const [subFilterStatus, setSubFilterStatus] = useState('all');
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [certificados, setCertificados] = useState<Record<string, Certificado[]>>({});

  // Alunos state
  const [alunos, setAlunos] = useState<AlunoInfo[]>([]);

  // Cadastrar state
  const [cadForm, setCadForm] = useState({ nome: '', matricula: '', email: '', senha: '', curso_id: '' });
  const [cadLoading, setCadLoading] = useState(false);

  // Cursos for select
  const [cursos, setCursos] = useState<{ id: string; nome: string }[]>([]);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/coordenador`, { headers: authHeaders() });
      const data = await res.json();
      if (data.metricas) setMetrics(data.metricas);
      else if (data.total_submissoes !== undefined) setMetrics(data as DashboardMetrics);
    } catch { toast.error('Erro ao carregar dashboard.'); }
  }, []);

  const fetchSubmissoes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/submissoes`, { headers: authHeaders() });
      const data = await res.json();
      setSubmissoes(Array.isArray(data) ? data : data.submissoes || []);
    } catch { toast.error('Erro ao carregar submissões.'); }
  }, []);

  const fetchAlunos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/usuarios`, { headers: authHeaders() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.usuarios || [];
      setAlunos(list.filter((u: any) => u.perfil === 'aluno' || !u.perfil));
    } catch { toast.error('Erro ao carregar alunos.'); }
  }, []);

  const fetchCursos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cursos`, { headers: authHeaders() });
      const data = await res.json();
      setCursos(Array.isArray(data) ? data : data.cursos || []);
    } catch {}
  }, []);

  const fetchCertificados = async (submissaoId: string) => {
    if (certificados[submissaoId]) return;
    try {
      const res = await fetch(`${API_BASE}/api/certificados?submissao_id=${submissaoId}`, { headers: authHeaders() });
      const data = await res.json();
      setCertificados((prev) => ({ ...prev, [submissaoId]: Array.isArray(data) ? data : data.certificados || [] }));
    } catch {}
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDashboard(), fetchCursos()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeSection === 'submissoes') fetchSubmissoes();
    if (activeSection === 'alunos') fetchAlunos();
  }, [activeSection]);

  const handleDecision = async (id: string, status: 'aprovado' | 'reprovado') => {
    try {
      const res = await fetch(`${API_BASE}/api/submissoes/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Submissão ${status === 'aprovado' ? 'aprovada' : 'reprovada'} com sucesso.`);
        fetchSubmissoes();
        fetchDashboard();
      } else {
        toast.error('Erro ao atualizar submissão.');
      }
    } catch { toast.error('Erro de conexão.'); }
  };

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadForm.nome || !cadForm.email || !cadForm.senha || !cadForm.curso_id) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    setCadLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/usuarios`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          nome: cadForm.nome,
          email: cadForm.email,
          senha: cadForm.senha,
          perfil: 'aluno',
          matricula: cadForm.matricula,
          curso_id: cadForm.curso_id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Vincular ao curso
        const userId = data.id || data.uid || data.usuario_id;
        if (userId) {
          await fetch(`${API_BASE}/api/alunos-cursos`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ usuario_id: userId, curso_id: cadForm.curso_id }),
          });
        }
        toast.success('Aluno cadastrado com sucesso!');
        setCadForm({ nome: '', matricula: '', email: '', senha: '', curso_id: '' });
      } else {
        toast.error(data.mensagem || data.message || 'Erro ao cadastrar aluno.');
      }
    } catch { toast.error('Erro de conexão.'); }
    setCadLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  // Filter submissões
  const filteredSubs = submissoes.filter((s) => {
    const matchCurso = subFilterCurso === 'all' || s.curso_nome === subFilterCurso;
    const matchStatus = subFilterStatus === 'all' || s.status === subFilterStatus;
    return matchCurso && matchStatus;
  });

  // Dashboard tab filtering
  const getDashMetrics = () => {
    if (!metrics) return { total: 0, pendentes: 0, aprovadas: 0, reprovadas: 0 };
    if (dashboardTab === 'todos') return { total: metrics.total_submissoes, pendentes: metrics.pendentes, aprovadas: metrics.aprovadas, reprovadas: metrics.reprovadas };
    const curso = metrics.por_curso?.find((c) => c.curso === dashboardTab);
    if (curso) return { total: curso.total, pendentes: curso.pendentes, aprovadas: curso.aprovadas, reprovadas: curso.reprovadas };
    return { total: 0, pendentes: 0, aprovadas: 0, reprovadas: 0 };
  };

  const dashMetrics = getDashMetrics();
  const pendentesRecentes = submissoes.filter((s) => s.status === 'pendente').slice(0, 5);

  const accentColor = 'hsl(30, 95%, 55%)';
  const accentGlow = 'hsla(30, 95%, 55%, 0.15)';
  const accentBorder = 'hsla(30, 95%, 55%, 0.25)';

  return (
    <div className="min-h-screen futuristic-bg grid-pattern">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoWhite} alt="Logo" className="h-8 w-auto" />
            <h1 className="font-display text-sm tracking-widest uppercase text-white">Painel do Coordenador</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm capitalize" style={{ color: 'hsl(220, 20%, 60%)' }}>{userName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display tracking-wider uppercase transition-all hover:opacity-80"
              style={{ background: 'hsla(0, 70%, 50%, 0.15)', border: '1px solid hsla(0, 70%, 50%, 0.3)', color: 'hsl(0, 70%, 65%)' }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8 flex gap-6">
        {/* Sidebar */}
        <nav className="w-56 shrink-0">
          <div className="glass-card rounded-xl p-3 space-y-1 sticky top-24">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${activeSection === item.id ? 'text-white' : ''}`}
                style={
                  activeSection === item.id
                    ? { background: accentGlow, border: `1px solid ${accentBorder}`, boxShadow: `0 0 20px -5px ${accentGlow}` }
                    : { color: 'hsl(220, 20%, 55%)', border: '1px solid transparent' }
                }
              >
                <item.icon className="h-4 w-4" style={activeSection === item.id ? { color: accentColor } : {}} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 space-y-6 min-w-0">

          {/* ===== DASHBOARD ===== */}
          {activeSection === 'dashboard' && (
            <>
              {/* Tabs */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setDashboardTab('todos')}
                  className="px-4 py-2 rounded-lg text-xs font-display tracking-wider uppercase transition-all"
                  style={dashboardTab === 'todos'
                    ? { background: accentGlow, border: `1px solid ${accentBorder}`, color: 'white' }
                    : { background: 'hsla(220, 40%, 18%, 0.5)', border: '1px solid hsla(200, 80%, 50%, 0.1)', color: 'hsl(220, 20%, 55%)' }}
                >
                  Todos os cursos
                </button>
                {(metrics?.por_curso || []).map((c) => (
                  <button
                    key={c.curso}
                    onClick={() => setDashboardTab(c.curso)}
                    className="px-4 py-2 rounded-lg text-xs font-display tracking-wider uppercase transition-all"
                    style={dashboardTab === c.curso
                      ? { background: accentGlow, border: `1px solid ${accentBorder}`, color: 'white' }
                      : { background: 'hsla(220, 40%, 18%, 0.5)', border: '1px solid hsla(200, 80%, 50%, 0.1)', color: 'hsl(220, 20%, 55%)' }}
                  >
                    {c.curso}
                  </button>
                ))}
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total de Submissões', value: dashMetrics.total, icon: FileText, color: 'hsl(200, 80%, 55%)', bg: 'hsla(200, 80%, 55%, 0.12)' },
                  { label: 'Pendentes', value: dashMetrics.pendentes, icon: Clock, color: 'hsl(38, 92%, 55%)', bg: 'hsla(38, 92%, 55%, 0.12)' },
                  { label: 'Aprovadas', value: dashMetrics.aprovadas, icon: CheckCircle2, color: 'hsl(152, 60%, 45%)', bg: 'hsla(152, 60%, 45%, 0.12)' },
                  { label: 'Reprovadas', value: dashMetrics.reprovadas, icon: XCircle, color: 'hsl(0, 72%, 55%)', bg: 'hsla(0, 72%, 55%, 0.12)' },
                ].map((card) => (
                  <div key={card.label} className="glass-card rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]" style={{ borderColor: `${card.color}33`, boxShadow: `0 0 20px -8px ${card.color}33` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: card.bg, border: `1px solid ${card.color}44` }}>
                        <card.icon className="h-4 w-4" style={{ color: card.color }} />
                      </div>
                      <span className="text-xs font-display tracking-wider uppercase text-white">{card.label}</span>
                    </div>
                    <div className="font-mono text-3xl font-bold" style={{ color: card.color }}>
                      {card.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pending Recent Table */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm tracking-wider uppercase text-white">Submissões Pendentes Recentes</h3>
                  <button
                    onClick={() => { setActiveSection('submissoes'); setSubFilterStatus('pendente'); }}
                    className="text-xs font-display tracking-wider uppercase transition-colors hover:text-white"
                    style={{ color: accentColor }}
                  >
                    Ver todas →
                  </button>
                </div>
                {pendentesRecentes.length === 0 ? (
                  <p className="text-sm py-4 text-center" style={{ color: 'hsl(220, 20%, 45%)' }}>Nenhuma submissão pendente.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid hsla(200, 80%, 50%, 0.1)' }}>
                          {['Aluno', 'Curso', 'Área', 'Carga Horária', 'Enviado em', 'Ação'].map((h) => (
                            <th key={h} className="text-left py-3 px-3 text-xs font-display tracking-wider uppercase" style={{ color: 'hsl(220, 20%, 50%)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pendentesRecentes.map((s) => (
                          <tr key={s.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid hsla(200, 80%, 50%, 0.06)' }}>
                            <td className="py-3 px-3 text-white font-medium">{s.aluno_nome || '—'}</td>
                            <td className="py-3 px-3" style={{ color: 'hsl(220, 20%, 60%)' }}>{s.curso_nome || '—'}</td>
                            <td className="py-3 px-3" style={{ color: 'hsl(220, 20%, 60%)' }}>{s.area || '—'}</td>
                            <td className="py-3 px-3 font-mono" style={{ color: 'hsl(220, 20%, 60%)' }}>{s.horas_solicitadas || '—'}h</td>
                            <td className="py-3 px-3 font-mono text-xs" style={{ color: 'hsl(220, 20%, 50%)' }}>{s.data_envio ? new Date(s.data_envio).toLocaleDateString('pt-BR') : '—'}</td>
                            <td className="py-3 px-3">
                              <div className="flex gap-2">
                                <button onClick={() => handleDecision(s.id, 'aprovado')} className="px-3 py-1 rounded text-xs font-semibold transition-all hover:opacity-80" style={{ background: 'hsla(152, 60%, 45%, 0.2)', color: 'hsl(152, 60%, 55%)', border: '1px solid hsla(152, 60%, 45%, 0.3)' }}>Aprovar</button>
                                <button onClick={() => handleDecision(s.id, 'reprovado')} className="px-3 py-1 rounded text-xs font-semibold transition-all hover:opacity-80" style={{ background: 'hsla(0, 72%, 50%, 0.2)', color: 'hsl(0, 72%, 60%)', border: '1px solid hsla(0, 72%, 50%, 0.3)' }}>Reprovar</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ===== SUBMISSÕES ===== */}
          {activeSection === 'submissoes' && (
            <div className="space-y-4">
              <h2 className="font-display text-lg tracking-wider uppercase text-white">Submissões</h2>
              {/* Filters */}
              <div className="flex gap-3 flex-wrap">
                <Select value={subFilterCurso} onValueChange={setSubFilterCurso}>
                  <SelectTrigger className="w-48 border-0 text-sm text-white" style={{ background: 'hsla(220, 40%, 18%, 0.8)', border: '1px solid hsla(200, 80%, 50%, 0.15)' }}>
                    <SelectValue placeholder="Filtrar por curso" />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: '1px solid hsla(200, 80%, 50%, 0.2)' }}>
                    <SelectItem value="all">Todos os cursos</SelectItem>
                    {[...new Set(submissoes.map((s) => s.curso_nome).filter(Boolean))].map((c) => (
                      <SelectItem key={c} value={c!}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={subFilterStatus} onValueChange={setSubFilterStatus}>
                  <SelectTrigger className="w-44 border-0 text-sm text-white" style={{ background: 'hsla(220, 40%, 18%, 0.8)', border: '1px solid hsla(200, 80%, 50%, 0.15)' }}>
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: '1px solid hsla(200, 80%, 50%, 0.2)' }}>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="reprovado">Reprovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="glass-card rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid hsla(200, 80%, 50%, 0.1)' }}>
                      {['Aluno', 'Curso', 'Área', 'Carga Horária', 'Data', 'Status', ''].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-display tracking-wider uppercase" style={{ color: 'hsl(220, 20%, 50%)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubs.length === 0 ? (
                      <tr><td colSpan={7} className="py-8 text-center text-sm" style={{ color: 'hsl(220, 20%, 45%)' }}>Nenhuma submissão encontrada.</td></tr>
                    ) : filteredSubs.map((s) => {
                      const isExpanded = expandedSub === s.id;
                      const certs = certificados[s.id];
                      const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                        pendente: { bg: 'hsla(38, 92%, 55%, 0.15)', text: 'hsl(38, 92%, 60%)', border: 'hsla(38, 92%, 55%, 0.3)' },
                        aprovado: { bg: 'hsla(152, 60%, 45%, 0.15)', text: 'hsl(152, 60%, 55%)', border: 'hsla(152, 60%, 45%, 0.3)' },
                        reprovado: { bg: 'hsla(0, 72%, 50%, 0.15)', text: 'hsl(0, 72%, 60%)', border: 'hsla(0, 72%, 50%, 0.3)' },
                      };
                      const sc = statusColors[s.status] || statusColors.pendente;
                      return (
                        <tr key={s.id} className="group">
                          <td colSpan={7} className="p-0">
                            <div>
                              <div
                                className="flex items-center transition-colors hover:bg-white/[0.02] cursor-pointer"
                                style={{ borderBottom: '1px solid hsla(200, 80%, 50%, 0.06)' }}
                                onClick={() => { setExpandedSub(isExpanded ? null : s.id); if (!isExpanded) fetchCertificados(s.id); }}
                              >
                                <div className="py-3 px-4 flex-1 text-white font-medium">{s.aluno_nome || '—'}</div>
                                <div className="py-3 px-4 flex-1" style={{ color: 'hsl(220, 20%, 60%)' }}>{s.curso_nome || '—'}</div>
                                <div className="py-3 px-4 flex-1" style={{ color: 'hsl(220, 20%, 60%)' }}>{s.area || '—'}</div>
                                <div className="py-3 px-4 w-28 font-mono" style={{ color: 'hsl(220, 20%, 60%)' }}>{s.horas_solicitadas || '—'}h</div>
                                <div className="py-3 px-4 w-28 font-mono text-xs" style={{ color: 'hsl(220, 20%, 50%)' }}>{s.data_envio ? new Date(s.data_envio).toLocaleDateString('pt-BR') : '—'}</div>
                                <div className="py-3 px-4 w-28">
                                  <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                                  </span>
                                </div>
                                <div className="py-3 px-4 w-12">
                                  {isExpanded ? <ChevronUp className="h-4 w-4" style={{ color: 'hsl(220, 20%, 50%)' }} /> : <ChevronDown className="h-4 w-4" style={{ color: 'hsl(220, 20%, 50%)' }} />}
                                </div>
                              </div>
                              {isExpanded && (
                                <div className="px-6 py-5 space-y-4" style={{ background: 'hsla(220, 50%, 12%, 0.5)', borderBottom: '1px solid hsla(200, 80%, 50%, 0.06)' }}>
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-xs font-display tracking-wider uppercase block mb-1" style={{ color: 'hsl(220, 20%, 50%)' }}>Tipo / Área</span>
                                      <span className="text-white">{s.area || '—'}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs font-display tracking-wider uppercase block mb-1" style={{ color: 'hsl(220, 20%, 50%)' }}>Descrição</span>
                                      <span className="text-white">{s.descricao || '—'}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs font-display tracking-wider uppercase block mb-1" style={{ color: 'hsl(220, 20%, 50%)' }}>Carga Horária Solicitada</span>
                                      <span className="text-white font-mono">{s.horas_solicitadas || '—'}h</span>
                                    </div>
                                  </div>

                                  {/* Certificado */}
                                  {certs && certs.length > 0 && (
                                    <div className="space-y-2">
                                      <span className="text-xs font-display tracking-wider uppercase block" style={{ color: 'hsl(220, 20%, 50%)' }}>Certificado</span>
                                      {certs.map((cert) => (
                                        <div key={cert.id} className="rounded-lg p-4" style={{ background: 'hsla(220, 40%, 18%, 0.6)', border: '1px solid hsla(200, 80%, 50%, 0.1)' }}>
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-white font-mono">{cert.nome_arquivo}</span>
                                            <a href={cert.url_arquivo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs transition-colors hover:text-white" style={{ color: accentColor }}>
                                              <ExternalLink className="h-3 w-3" /> Abrir arquivo
                                            </a>
                                          </div>
                                          {cert.texto_extraido && (
                                            <div className="mt-2">
                                              <span className="text-xs font-display tracking-wider uppercase block mb-1" style={{ color: 'hsl(220, 20%, 50%)' }}>Texto Extraído (OCR)</span>
                                              <p className="text-xs font-mono p-3 rounded" style={{ background: 'hsla(220, 40%, 15%, 0.8)', color: 'hsl(220, 20%, 65%)', border: '1px solid hsla(200, 80%, 50%, 0.08)' }}>
                                                {cert.texto_extraido}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Action buttons */}
                                  {s.status === 'pendente' && (
                                    <div className="flex gap-3 pt-2">
                                      <button onClick={() => handleDecision(s.id, 'aprovado')} className="px-5 py-2 rounded-lg text-xs font-display tracking-wider uppercase font-semibold transition-all hover:scale-[1.02]" style={{ background: 'hsla(152, 60%, 45%, 0.2)', color: 'hsl(152, 60%, 55%)', border: '1px solid hsla(152, 60%, 45%, 0.3)' }}>
                                        <CheckCircle2 className="inline h-4 w-4 mr-1" /> Aprovar
                                      </button>
                                      <button onClick={() => handleDecision(s.id, 'reprovado')} className="px-5 py-2 rounded-lg text-xs font-display tracking-wider uppercase font-semibold transition-all hover:scale-[1.02]" style={{ background: 'hsla(0, 72%, 50%, 0.2)', color: 'hsl(0, 72%, 60%)', border: '1px solid hsla(0, 72%, 50%, 0.3)' }}>
                                        <XCircle className="inline h-4 w-4 mr-1" /> Reprovar
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== ALUNOS ===== */}
          {activeSection === 'alunos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg tracking-wider uppercase text-white">Alunos</h2>
                <button
                  onClick={() => setActiveSection('cadastrar')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-display tracking-wider uppercase transition-all hover:scale-[1.02]"
                  style={{ background: accentGlow, border: `1px solid ${accentBorder}`, color: 'white' }}
                >
                  <UserPlus className="h-4 w-4" style={{ color: accentColor }} /> Cadastrar Aluno
                </button>
              </div>

              <div className="glass-card rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid hsla(200, 80%, 50%, 0.1)' }}>
                      {['Nome', 'Curso', 'Email', 'Matrícula', 'Submissões', 'Horas Aprovadas'].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-display tracking-wider uppercase" style={{ color: 'hsl(220, 20%, 50%)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alunos.length === 0 ? (
                      <tr><td colSpan={6} className="py-8 text-center text-sm" style={{ color: 'hsl(220, 20%, 45%)' }}>Nenhum aluno encontrado.</td></tr>
                    ) : alunos.map((a, i) => (
                      <tr key={a.id || a.uid || i} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid hsla(200, 80%, 50%, 0.06)' }}>
                        <td className="py-3 px-4 text-white font-medium">{a.nome}</td>
                        <td className="py-3 px-4" style={{ color: 'hsl(220, 20%, 60%)' }}>{a.curso_nome || '—'}</td>
                        <td className="py-3 px-4 font-mono text-xs" style={{ color: 'hsl(220, 20%, 60%)' }}>{a.email}</td>
                        <td className="py-3 px-4 font-mono" style={{ color: 'hsl(220, 20%, 60%)' }}>{a.matricula || '—'}</td>
                        <td className="py-3 px-4 font-mono" style={{ color: 'hsl(220, 20%, 60%)' }}>{a.submissoes ?? '—'}</td>
                        <td className="py-3 px-4 font-mono">
                          <span style={{ color: 'hsl(152, 60%, 55%)' }}>{a.horas_aprovadas ?? 0}h</span>
                          {a.carga_minima ? <span style={{ color: 'hsl(220, 20%, 45%)' }}> / {a.carga_minima}h</span> : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== CADASTRAR ALUNO ===== */}
          {activeSection === 'cadastrar' && (
            <div className="max-w-lg">
              <h2 className="font-display text-lg tracking-wider uppercase text-white mb-6">Cadastrar Aluno</h2>
              <form onSubmit={handleCadastrar} className="glass-card rounded-xl p-6 space-y-5">
                {[
                  { label: 'Nome completo *', key: 'nome', type: 'text', placeholder: 'Nome do aluno' },
                  { label: 'Matrícula', key: 'matricula', type: 'text', placeholder: 'Número de matrícula' },
                  { label: 'Email *', key: 'email', type: 'email', placeholder: 'aluno@email.com' },
                  { label: 'Senha provisória *', key: 'senha', type: 'password', placeholder: '••••••••' },
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-xs font-display tracking-wider uppercase" style={{ color: 'hsl(220, 20%, 60%)' }}>{field.label}</label>
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={cadForm[field.key as keyof typeof cadForm]}
                      onChange={(e) => setCadForm({ ...cadForm, [field.key]: e.target.value })}
                      required={field.label.includes('*')}
                      className="border-0 font-mono text-sm text-white placeholder:text-gray-500"
                      style={{ background: 'hsla(220, 40%, 18%, 0.8)', border: '1px solid hsla(200, 80%, 50%, 0.15)' }}
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="text-xs font-display tracking-wider uppercase" style={{ color: 'hsl(220, 20%, 60%)' }}>Curso *</label>
                  <Select value={cadForm.curso_id} onValueChange={(v) => setCadForm({ ...cadForm, curso_id: v })}>
                    <SelectTrigger className="border-0 text-sm text-white" style={{ background: 'hsla(220, 40%, 18%, 0.8)', border: '1px solid hsla(200, 80%, 50%, 0.15)' }}>
                      <SelectValue placeholder="Selecione o curso" />
                    </SelectTrigger>
                    <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: '1px solid hsla(200, 80%, 50%, 0.2)' }}>
                      {cursos.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection('alunos')}
                    className="flex-1 py-3 rounded-lg text-xs font-display tracking-wider uppercase transition-all hover:opacity-80"
                    style={{ background: 'hsla(220, 40%, 18%, 0.8)', border: '1px solid hsla(200, 80%, 50%, 0.15)', color: 'hsl(220, 20%, 60%)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={cadLoading}
                    className="flex-1 py-3 rounded-lg text-xs font-display tracking-wider uppercase font-semibold text-white transition-all hover:scale-[1.02] hover:brightness-110 disabled:opacity-50"
                    style={{ background: `linear-gradient(90deg, hsl(30, 95%, 55%), hsl(40, 95%, 65%))`, boxShadow: `0 0 30px -10px ${accentGlow}` }}
                  >
                    {cadLoading ? 'Cadastrando...' : 'Cadastrar Aluno'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Coordenador;
