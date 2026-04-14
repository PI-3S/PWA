import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  LogOut, LayoutDashboard, FileText, Users, UserPlus,
  Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  ExternalLink, Loader2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { API_CONFIG } from '@/data/data';
import logoWhite from '@/assets/logo-white.png';

const API_BASE = API_CONFIG.BASE_URL;

// Interfaces
interface DashboardMetrics {
  total_submissoes: number;
  pendentes: number;
  aprovadas: number;
  reprovadas: number;
  por_curso: { curso: string; total: number; aprovadas: number; pendentes: number; reprovadas: number }[];
}

interface Submissao {
  id: string;
  aluno_nome: string;
  curso_nome: string;
  area: string;
  horas_solicitadas: number;
  status: 'pendente' | 'aprovado' | 'reprovado';
  data_envio: string;
  descricao?: string;
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
  submissoes: number;
  horas_aprovadas: number;
  carga_minima: number;
}

const Coordenador = () => {
  const { user, token, signOut } = useAuth();
  const userName = user?.nome || 'Coordenador';

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  // States
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [alunos, setAlunos] = useState<AlunoInfo[]>([]);
  const [cursos, setCursos] = useState<{ id: string; nome: string }[]>([]);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [certificados, setCertificados] = useState<Record<string, Certificado[]>>({});

  // Filters
  const [subFilterCurso, setSubFilterCurso] = useState('all');
  const [subFilterStatus, setSubFilterStatus] = useState('all');

  // Form
  const [cadForm, setCadForm] = useState({ nome: '', matricula: '', email: '', senha: '', curso_id: '' });
  const [cadLoading, setCadLoading] = useState(false);

  // Data Fetching
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/coordenador`, { headers: authHeaders() });
      const data = await res.json();
      setMetrics(data.metricas || data);
    } catch { toast.error('Erro ao carregar métricas.'); }
  }, [authHeaders]);

  const fetchSubmissoes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/submissoes`, { headers: authHeaders() });
      const data = await res.json();
      setSubmissoes(Array.isArray(data) ? data : data.submissoes || []);
    } catch { toast.error('Erro ao carregar submissões.'); }
  }, [authHeaders]);

  const fetchAlunos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/usuarios?perfil=aluno`, { headers: authHeaders() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.usuarios || [];
      setAlunos(list.filter((u: any) => u.perfil === 'aluno'));
    } catch { toast.error('Erro ao carregar alunos.'); }
  }, [authHeaders]);

  const fetchCursos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cursos`, { headers: authHeaders() });
      const data = await res.json();
      setCursos(Array.isArray(data) ? data : data.cursos || []);
    } catch { /* silent */ }
  }, [authHeaders]);

  const fetchCertificados = useCallback(async (submissaoId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/certificados?submissao_id=${submissaoId}`, { headers: authHeaders() });
      const data = await res.json();
      setCertificados(prev => ({ ...prev, [submissaoId]: Array.isArray(data) ? data : data.certificados || [] }));
    } catch { /* silent */ }
  }, [authHeaders]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDashboard(), fetchCursos(), fetchSubmissoes()]).finally(() => setLoading(false));
  }, [fetchDashboard, fetchCursos, fetchSubmissoes]);

  useEffect(() => {
    if (activeSection === 'alunos') fetchAlunos();
  }, [activeSection, fetchAlunos]);

  // Actions
  const handleDecision = async (id: string, status: 'aprovado' | 'reprovado') => {
    setIsActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/api/submissoes/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status, coordenador_id: user?.uid }),
      });
      if (res.ok) {
        toast.success(`Submissão ${status === 'aprovado' ? 'aprovada' : 'reprovada'}!`);
        setSubmissoes(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        await Promise.all([fetchDashboard(), fetchSubmissoes()]);
      } else {
        toast.error('Erro ao processar decisão.');
      }
    } catch { toast.error('Erro de conexão.'); }
    finally { setIsActionLoading(null); }
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
        toast.success('Aluno cadastrado com sucesso!');
        setCadForm({ nome: '', matricula: '', email: '', senha: '', curso_id: '' });
        fetchAlunos();
      } else {
        toast.error('Erro ao cadastrar aluno.');
      }
    } catch { toast.error('Erro de conexão.'); }
    finally { setCadLoading(false); }
  };

  const handleLogout = () => {
    signOut();
  };

  // UI Helpers
  const accentColor = 'hsl(30, 95%, 55%)';
  const accentGlow = 'hsla(30, 95%, 55%, 0.15)';
  const accentBorder = 'hsla(30, 95%, 55%, 0.25)';

  const filteredSubs = submissoes.filter(s => 
    (subFilterCurso === 'all' || s.curso_nome === subFilterCurso) &&
    (subFilterStatus === 'all' || s.status === subFilterStatus)
  );

  return (
    <div className="min-h-screen futuristic-bg grid-pattern text-slate-200">
      <header className="glass-header sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src={logoWhite} alt="Logo" className="h-8" />
          <h1 className="text-xs uppercase tracking-widest font-display text-white border-l pl-4 border-white/20">Panel_Coord_v1.0</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] uppercase text-slate-500 font-display">Sessão Ativa</p>
            <p className="text-sm font-medium text-white capitalize">{userName}</p>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <nav className="w-64 shrink-0 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'submissoes', label: 'Submissões', icon: FileText },
            { id: 'alunos', label: 'Alunos', icon: Users },
            { id: 'cadastrar', label: 'Cadastrar', icon: UserPlus },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all border ${
                activeSection === item.id 
                ? 'bg-orange-500/10 border-orange-500/50 text-white shadow-[0_0_15px_-5px_rgba(249,115,22,0.4)]' 
                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <item.icon size={18} className={activeSection === item.id ? 'text-orange-500' : ''} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total', value: metrics?.total_submissoes || 0, icon: FileText, color: 'blue' },
                  { label: 'Pendentes', value: metrics?.pendentes || 0, icon: Clock, color: 'orange' },
                  { label: 'Aprovadas', value: metrics?.aprovadas || 0, icon: CheckCircle2, color: 'emerald' },
                  { label: 'Reprovadas', value: metrics?.reprovadas || 0, icon: XCircle, color: 'red' },
                ].map((card) => (
                  <div key={card.label} className="glass-card p-6 rounded-2xl border-white/5 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${card.color}-500/5 blur-3xl rounded-full`} />
                    <card.icon size={20} className={`text-${card.color}-500 mb-4`} />
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-display">{card.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="glass-card rounded-2xl p-6 border-white/5">
                <h3 className="text-sm font-display uppercase tracking-wider mb-6">Fila de Prioridade (Pendentes)</h3>
                <div className="space-y-3">
                  {submissoes.filter(s => s.status === 'pendente').slice(0, 5).map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                      <div>
                        <p className="text-sm font-medium text-white">{s.aluno_nome}</p>
                        <p className="text-xs text-slate-500">{s.curso_nome} • {s.area}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleDecision(s.id, 'aprovado')} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500/20">APROVAR</button>
                        <button onClick={() => handleDecision(s.id, 'reprovado')} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20">REPROVAR</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'submissoes' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Select value={subFilterCurso} onValueChange={setSubFilterCurso}>
                  <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Curso" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    <SelectItem value="all">Todos os Cursos</SelectItem>
                    {cursos.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={subFilterStatus} onValueChange={setSubFilterStatus}>
                  <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="reprovado">Reprovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="glass-card rounded-2xl border-white/5 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.03] text-[10px] uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Aluno</th>
                      <th className="px-6 py-4">Curso</th>
                      <th className="px-6 py-4">Horas</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSubs.map((s) => (
                      <tr key={s.id} className="group hover:bg-white/[0.01] transition-all">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-white">{s.aluno_nome}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{new Date(s.data_envio).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">{s.curso_nome}</td>
                        <td className="px-6 py-4 text-sm font-mono text-orange-400">{s.horas_solicitadas}h</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                            s.status === 'aprovado' ? 'bg-emerald-500/10 text-emerald-500' : 
                            s.status === 'reprovado' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => { setExpandedSub(expandedSub === s.id ? null : s.id); fetchCertificados(s.id); }}
                            className="p-2 text-slate-500 hover:text-white transition-colors"
                          >
                            {expandedSub === s.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </td>
                        {expandedSub === s.id && (
                          <tr className="bg-white/[0.02]">
                            <td colSpan={5} className="px-8 py-6">
                              <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <h4 className="text-xs font-display uppercase text-slate-500">Detalhes do Certificado</h4>
                                  {certificados[s.id]?.map(cert => (
                                    <div key={cert.id} className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
                                      <div className="flex justify-between items-center">
                                        <p className="text-xs font-mono text-white truncate">{cert.nome_arquivo}</p>
                                        <a href={cert.url_arquivo} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline text-xs flex items-center gap-1">
                                          <ExternalLink size={12} /> Ver PDF
                                        </a>
                                      </div>
                                      {cert.texto_extraido && (
                                        <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                                          <p className="text-[10px] uppercase text-slate-600 mb-2">OCR - Texto Extraído</p>
                                          <p className="text-[11px] text-slate-400 leading-relaxed max-h-32 overflow-y-auto">{cert.texto_extraido}</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="space-y-4">
                                  <h4 className="text-xs font-display uppercase text-slate-500">Tomar Decisão</h4>
                                  <p className="text-sm text-slate-400 italic">"{s.descricao || 'Sem descrição.'}"</p>
                                  <div className="flex gap-4 pt-4">
                                    <button 
                                      disabled={isActionLoading === s.id}
                                      onClick={() => handleDecision(s.id, 'aprovado')} 
                                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                                    >
                                      {isActionLoading === s.id ? <Loader2 className="animate-spin mx-auto" /> : 'APROVAR HORAS'}
                                    </button>
                                    <button 
                                      disabled={isActionLoading === s.id}
                                      onClick={() => handleDecision(s.id, 'reprovado')} 
                                      className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 py-3 rounded-xl font-bold transition-all"
                                    >
                                      REPROVAR
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'cadastrar' && (
            <div className="max-w-xl mx-auto glass-card p-8 rounded-2xl border-white/5">
              <h2 className="text-xl font-bold text-white mb-6">Novo Cadastro de Aluno</h2>
              <form onSubmit={handleCadastrar} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 uppercase">Nome Completo</label>
                  <Input value={cadForm.nome} onChange={e => setCadForm({...cadForm, nome: e.target.value})} className="bg-white/5 border-white/10" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase">Matrícula</label>
                    <Input value={cadForm.matricula} onChange={e => setCadForm({...cadForm, matricula: e.target.value})} className="bg-white/5 border-white/10" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase">Curso</label>
                    <Select onValueChange={val => setCadForm({...cadForm, curso_id: val})}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        {cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 uppercase">Email Institucional</label>
                  <Input type="email" value={cadForm.email} onChange={e => setCadForm({...cadForm, email: e.target.value})} className="bg-white/5 border-white/10" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 uppercase">Senha Temporária</label>
                  <Input type="password" value={cadForm.senha} onChange={e => setCadForm({...cadForm, senha: e.target.value})} className="bg-white/5 border-white/10" required />
                </div>
                <button 
                  disabled={cadLoading}
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20 flex justify-center items-center gap-2"
                >
                  {cadLoading ? <Loader2 className="animate-spin" /> : <UserPlus size={18} />}
                  CADASTRAR ALUNO
                </button>
              </form>
            </div>
          )}

          {activeSection === 'alunos' && (
            <div className="glass-card rounded-2xl border-white/5 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/[0.03] text-[10px] uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Aluno</th>
                    <th className="px-6 py-4">Matrícula</th>
                    <th className="px-6 py-4">Curso</th>
                    <th className="px-6 py-4">Progresso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {alunos.map((a) => (
                    <tr key={a.id} className="hover:bg-white/[0.01]">
                      <td className="px-6 py-4 text-sm font-medium text-white">{a.nome}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">{a.matricula}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{a.curso_nome}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-500" 
                              style={{ width: `${Math.min((a.horas_aprovadas / a.carga_minima) * 100, 100)}%` }} 
                            />
                          </div>
                          <span className="text-xs font-mono text-white">{a.horas_aprovadas}h</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Coordenador;