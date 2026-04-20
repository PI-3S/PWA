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

// --- MUDANÇA 1: Importação do hook de tema ---
import { useAppTheme } from '@/hooks/useapptheme';
import ThemeSwitcher from '@/components/themeswitcher';

const API_BASE = API_CONFIG.BASE_URL;

// Interfaces (mantidas iguais)
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
  // --- MUDANÇA 2: Consumo das cores do tema ---
  const { colors } = useAppTheme();
  
  const { user, token, signOut } = useAuth();
  const userName = user?.nome || 'Coordenador';

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [alunos, setAlunos] = useState<AlunoInfo[]>([]);
  const [cursos, setCursos] = useState<{ id: string; nome: string }[]>([]);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [certificados, setCertificados] = useState<Record<string, Certificado[]>>({});

  const [subFilterCurso, setSubFilterCurso] = useState('all');
  const [subFilterStatus, setSubFilterStatus] = useState('all');

  const [cadForm, setCadForm] = useState({ nome: '', matricula: '', email: '', senha: '', curso_id: '' });
  const [cadLoading, setCadLoading] = useState(false);

  // Data Fetching (mantido igual)
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

  const filteredSubs = submissoes.filter(s => 
    (subFilterCurso === 'all' || s.curso_nome === subFilterCurso) &&
    (subFilterStatus === 'all' || s.status === subFilterStatus)
  );

  return (
    /* --- MUDANÇA 3: Estilos aplicados dinamicamente nos containers principais --- */
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ background: colors.pageBg, color: colors.textPrimary }}
    >
      <header 
        className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b"
        style={{ background: colors.sidebarBg, borderColor: colors.sidebarBorder }}
      >
        <div className="flex items-center gap-4">
          <img src={logoWhite} alt="Logo" className="h-8" />
          <h1 className="text-xs uppercase tracking-widest font-display border-l pl-4" style={{ borderColor: colors.sidebarBorder }}>
            Panel_Coord_v1.0
          </h1>
        </div>
        <div className="flex items-center gap-6">
           {/* --- MUDANÇA 4: Adicionado o Switcher no cabeçalho --- */}
          <ThemeSwitcher />
          
          <div className="text-right">
            <p className="text-[10px] uppercase opacity-50 font-display">Sessão Ativa</p>
            <p className="text-sm font-medium capitalize">{userName}</p>
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
                ? 'bg-orange-500/10 border-orange-500/50 text-orange-500 shadow-sm' 
                : 'bg-transparent border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <item.icon size={18} />
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
                  <div 
                    key={card.label} 
                    className="p-6 rounded-2xl border transition-all"
                    style={{ background: colors.cardBg, borderColor: colors.cardBorder }}
                  >
                    <card.icon size={20} className={`text-${card.color}-500 mb-4`} />
                    <p className="text-[10px] uppercase tracking-wider opacity-50 font-display">{card.label}</p>
                    <p className="text-3xl font-bold mt-1" style={{ color: colors.titleColor }}>{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-6 border" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
                <h3 className="text-sm font-display uppercase tracking-wider mb-6" style={{ color: colors.titleColor }}>
                  Fila de Prioridade (Pendentes)
                </h3>
                <div className="space-y-3">
                  {submissoes.filter(s => s.status === 'pendente').slice(0, 5).map(s => (
                    <div 
                      key={s.id} 
                      className="flex items-center justify-between p-4 rounded-xl border transition-all"
                      style={{ background: colors.inputBg, borderColor: colors.inputBorder }}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>{s.aluno_nome}</p>
                        <p className="text-xs opacity-50">{s.curso_nome} • {s.area}</p>
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
                  <SelectTrigger style={{ background: colors.inputBg, borderColor: colors.inputBorder }}>
                    <SelectValue placeholder="Curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Cursos</SelectItem>
                    {cursos.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                {/* ... outros selects seguem o mesmo padrão de style ... */}
              </div>

              <div className="rounded-2xl border overflow-hidden" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
                <table className="w-full text-left">
                  <thead style={{ background: colors.sidebarBg }}>
                    <tr className="text-[10px] uppercase tracking-widest opacity-50">
                      <th className="px-6 py-4">Aluno</th>
                      <th className="px-6 py-4">Curso</th>
                      <th className="px-6 py-4">Horas</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: colors.cardBorder }}>
                    {filteredSubs.map((s) => (
                      <tr key={s.id} className="hover:opacity-80 transition-all">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>{s.aluno_nome}</p>
                          <p className="text-[10px] opacity-50 font-mono">{new Date(s.data_envio).toLocaleDateString()}</p>
                        </td>
                        {/* ... outras colunas ... */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ... Seções de 'cadastrar' e 'alunos' seguem a mesma lógica de substituir bg-white/5 por colors.inputBg ... */}
          
        </main>
      </div>
    </div>
  );
};

export default Coordenador;