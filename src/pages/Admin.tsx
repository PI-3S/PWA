import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, FileCheck, ScrollText, Link2,
  LogOut, Search, Plus, Pencil, Trash2, Eye, Check, X, ChevronRight, ChevronDown, ChevronUp,
  GraduationCap, Clock, Award, AlertTriangle, Filter,
  ShieldCheck, UserPlus, Bell, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import logoWhite from '@/assets/logo-white.png';

const API_BASE = 'https://back-end-banco-five.vercel.app';
const getToken = () => localStorage.getItem('authToken') || '';
const getUser = () => { try { return JSON.parse(localStorage.getItem('userData') || '{}'); } catch { return {}; } };
const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

// ── Nav Items ──
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Gestão de Cursos', icon: BookOpen },
  { id: 'users', label: 'Gestão de Usuários', icon: Users },
  { id: 'validation', label: 'Validação', icon: FileCheck },
  { id: 'rules', label: 'Regras de Atividades', icon: ScrollText },
  { id: 'coordinators', label: 'Coordenadores', icon: Link2 },
];

// ── Colors (same as before) ──
const panelBg = 'hsl(220, 45%, 11%)';
const cardBg = 'hsla(220, 40%, 15%, 0.7)';
const cardBorder = 'hsla(200, 60%, 40%, 0.12)';
const inputBg = 'hsla(220, 40%, 18%, 0.8)';
const inputBorder = 'hsla(200, 80%, 50%, 0.15)';
const labelColor = 'hsl(220, 20%, 55%)';
const accentBlue = 'hsl(210, 80%, 55%)';
const accentOrange = 'hsl(30, 95%, 55%)';

// ── Types ──
interface DashboardMetrics {
  total_submissoes: number; pendentes: number; aprovadas: number; reprovadas: number;
  por_area: { area: string; total: number; aprovadas: number; pendentes: number; reprovadas: number }[];
  por_curso: { curso: string; total: number; aprovadas: number; pendentes: number; reprovadas: number }[];
}
interface Curso { id: string; nome: string; carga_horaria_minima: number; }
interface Usuario { id: string; nome: string; email: string; perfil: string; curso_id?: string; curso_nome?: string; matricula?: string; }
interface Submissao { id: string; aluno_id: string; status: string; data_envio: string; descricao?: string; horas_solicitadas?: number; aluno_nome?: string; curso_nome?: string; area?: string; tipo?: string; }
interface Regra { id: string; area: string; limite_horas: number; exige_comprovante: boolean; curso_id: string; curso_nome?: string; }
interface CoordCurso { id: string; usuario_id: string; curso_id: string; coordenador_nome?: string; coordenador_email?: string; curso_nome?: string; }

const Admin = () => {
  const navigate = useNavigate();
  const user = getUser();
  const userName = user?.nome || localStorage.getItem('userEmail')?.split('@')[0]?.replace(/[0-9]/g, '')?.replace(/[._]/g, ' ')?.trim() || 'Admin';

  const [section, setSection] = useState('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [regras, setRegras] = useState<Regra[]>([]);
  const [coordCursos, setCoordCursos] = useState<CoordCurso[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cursoFilter, setCursoFilter] = useState('all');

  // Expanded row for validation
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [certData, setCertData] = useState<{ url_arquivo?: string; texto_extraido?: string } | null>(null);
  const [loadingCert, setLoadingCert] = useState(false);

  // Dialogs / inline forms
  const [courseDialog, setCourseDialog] = useState(false);
  const [editCourse, setEditCourse] = useState<Partial<Curso>>({});
  const [userDialog, setUserDialog] = useState(false);
  const [newUser, setNewUser] = useState<{ nome: string; email: string; senha: string; perfil: string; matricula: string; curso_id: string }>({ nome: '', email: '', senha: '', perfil: 'aluno', matricula: '', curso_id: '' });
  const [ruleDialog, setRuleDialog] = useState(false);
  const [editRule, setEditRule] = useState<Partial<Regra & { exige_comprovante_str: string }>>({});
  const [coordDialog, setCoordDialog] = useState(false);
  const [newCoord, setNewCoord] = useState<{ usuario_id: string; curso_id: string }>({ usuario_id: '', curso_id: '' });

  // ── API Helpers ──
  const apiFetch = useCallback(async (path: string, opts?: RequestInit) => {
    const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders(), ...opts });
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return res.json();
  }, []);

  // ── Load data ──
  const loadDashboard = useCallback(async () => {
    try { const d = await apiFetch('/api/dashboard/coordenador'); setMetrics(d); } catch { }
  }, [apiFetch]);

  const loadCursos = useCallback(async () => {
    try { const d = await apiFetch('/api/cursos'); setCursos(d.cursos || d || []); } catch { }
  }, [apiFetch]);

  const loadUsuarios = useCallback(async () => {
    try {
      const params = roleFilter !== 'all' ? `?perfil=${roleFilter}` : '';
      const d = await apiFetch(`/api/usuarios${params}`);
      setUsuarios(Array.isArray(d) ? d : d.usuarios || []);
    } catch { }
  }, [apiFetch, roleFilter]);

  const loadSubmissoes = useCallback(async () => {
    try { const d = await apiFetch('/api/submissoes'); setSubmissoes(Array.isArray(d) ? d : d.submissoes || []); } catch { }
  }, [apiFetch]);

  const loadRegras = useCallback(async () => {
    try { const d = await apiFetch('/api/regras'); setRegras(Array.isArray(d) ? d : d.regras || []); } catch { }
  }, [apiFetch]);

  const loadCoordCursos = useCallback(async () => {
    try { const d = await apiFetch('/api/coordenadores-cursos'); setCoordCursos(Array.isArray(d) ? d : d.vinculos || []); } catch { }
  }, [apiFetch]);

  useEffect(() => {
    const u = getUser();
    if (u.perfil && u.perfil !== 'super_admin') {
      toast.error('Acesso restrito ao Super Admin.');
      navigate('/login/superadmin');
      return;
    }
    loadDashboard(); loadCursos();
  }, []);

  useEffect(() => {
    if (section === 'users') loadUsuarios();
    if (section === 'validation') loadSubmissoes();
    if (section === 'rules') { loadRegras(); loadCursos(); }
    if (section === 'coordinators') { loadCoordCursos(); loadUsuarios(); loadCursos(); }
    if (section === 'courses') loadCursos();
    if (section === 'dashboard') { loadDashboard(); loadSubmissoes(); }
  }, [section]);

  useEffect(() => { if (section === 'users') loadUsuarios(); }, [roleFilter]);

  // ── Actions ──
  const handleStatusChange = async (id: string, status: 'aprovado' | 'reprovado') => {
    try {
      await apiFetch(`/api/submissoes/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      toast.success(status === 'aprovado' ? 'Submissão aprovada!' : 'Submissão reprovada.');
      loadSubmissoes(); loadDashboard();
    } catch { toast.error('Erro ao atualizar status.'); }
  };

  const handleSaveCourse = async () => {
    if (!editCourse.nome) { toast.error('Nome obrigatório.'); return; }
    try {
      if (editCourse.id) {
        // No PATCH route specified, just update locally
        setCursos(prev => prev.map(c => c.id === editCourse.id ? { ...c, ...editCourse } as Curso : c));
        toast.success('Curso atualizado!');
      } else {
        await apiFetch('/api/cursos', { method: 'POST', body: JSON.stringify({ nome: editCourse.nome, carga_horaria_minima: editCourse.carga_horaria_minima || 200 }) });
        toast.success('Curso cadastrado!');
        loadCursos();
      }
      setCourseDialog(false); setEditCourse({});
    } catch { toast.error('Erro ao salvar curso.'); }
  };

  const handleCreateUser = async () => {
    if (!newUser.nome || !newUser.email || !newUser.senha) { toast.error('Preencha os campos obrigatórios.'); return; }
    try {
      await apiFetch('/api/usuarios', { method: 'POST', body: JSON.stringify(newUser) });
      toast.success('Usuário cadastrado!');
      setUserDialog(false); setNewUser({ nome: '', email: '', senha: '', perfil: 'aluno', matricula: '', curso_id: '' });
      loadUsuarios();
    } catch { toast.error('Erro ao cadastrar usuário.'); }
  };

  const handleSaveRule = async () => {
    if (!editRule.area || !editRule.curso_id) { toast.error('Preencha os campos obrigatórios.'); return; }
    try {
      await apiFetch('/api/regras', { method: 'POST', body: JSON.stringify({ area: editRule.area, limite_horas: editRule.limite_horas || 60, exige_comprovante: editRule.exige_comprovante_str === 'sim', curso_id: editRule.curso_id }) });
      toast.success('Regra salva!');
      setRuleDialog(false); setEditRule({});
      loadRegras();
    } catch { toast.error('Erro ao salvar regra.'); }
  };

  const handleCreateCoordVinculo = async () => {
    if (!newCoord.usuario_id || !newCoord.curso_id) { toast.error('Selecione coordenador e curso.'); return; }
    try {
      await apiFetch('/api/coordenadores-cursos', { method: 'POST', body: JSON.stringify(newCoord) });
      toast.success('Vínculo criado!');
      setCoordDialog(false); setNewCoord({ usuario_id: '', curso_id: '' });
      loadCoordCursos();
    } catch { toast.error('Erro ao criar vínculo.'); }
  };

  const handleRemoveCoordVinculo = async (id: string) => {
    try {
      await apiFetch(`/api/alunos-cursos/${id}`, { method: 'DELETE' });
      toast.success('Vínculo removido!');
      loadCoordCursos();
    } catch { toast.error('Erro ao remover vínculo.'); }
  };

  const loadCertificado = async (submissaoId: string) => {
    setLoadingCert(true); setCertData(null);
    try {
      const d = await apiFetch(`/api/certificados?submissao_id=${submissaoId}`);
      const cert = Array.isArray(d) ? d[0] : (d.certificados?.[0] || d);
      setCertData(cert || null);
    } catch { setCertData(null); }
    setLoadingCert(false);
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) { setExpandedId(null); setCertData(null); }
    else { setExpandedId(id); loadCertificado(id); }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); localStorage.removeItem('userData'); localStorage.removeItem('userEmail');
    navigate('/');
  };

  // ── Filters for validation ──
  const filteredSubmissoes = submissoes.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (cursoFilter !== 'all' && s.curso_nome !== cursoFilter) return false;
    return true;
  });

  const filteredUsuarios = usuarios.filter(u => {
    const matchSearch = u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const coordenadores = usuarios.filter(u => u.perfil === 'coordenador');

  // ── MetricCard ──
  const MetricCard = ({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string | number; color: string; sub?: string }) => (
    <div className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]" style={{ background: cardBg, border: `1px solid ${color}22`, boxShadow: `0 0 25px -10px ${color}33` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <span className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>{label}</span>
      </div>
      <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
      {sub && <p className="text-[11px] mt-1 font-mono" style={{ color: labelColor }}>{sub}</p>}
    </div>
  );

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pendente: { bg: 'hsla(38, 92%, 50%, 0.12)', text: 'hsl(38, 92%, 60%)', border: 'hsla(38, 92%, 50%, 0.3)' },
    aprovado: { bg: 'hsla(152, 60%, 40%, 0.12)', text: 'hsl(152, 60%, 55%)', border: 'hsla(152, 60%, 40%, 0.3)' },
    reprovado: { bg: 'hsla(0, 72%, 50%, 0.12)', text: 'hsl(0, 72%, 60%)', border: 'hsla(0, 72%, 50%, 0.3)' },
  };

  return (
    <div className="min-h-screen flex" style={{ background: `linear-gradient(165deg, hsl(220, 50%, 10%) 0%, hsl(225, 45%, 14%) 40%, hsl(220, 45%, 11%) 100%)` }}>
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r" style={{ background: 'hsl(220, 50%, 9%)', borderColor: cardBorder }}>
        <div className="p-5 flex items-center gap-3 border-b" style={{ borderColor: cardBorder }}>
          <img src={logoWhite} alt="Logo" className="h-9 w-auto" />
          <div>
            <p className="text-xs font-display tracking-widest uppercase text-white">Atividades</p>
            <p className="text-[10px] font-display tracking-[0.2em] uppercase" style={{ color: accentOrange }}>SENAC</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setSearchTerm(''); setStatusFilter('all'); setCursoFilter('all'); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
              style={
                section === item.id
                  ? { background: `${accentBlue}18`, border: `1px solid ${accentBlue}33`, color: 'white', boxShadow: `0 0 20px -8px ${accentBlue}44` }
                  : { color: labelColor, border: '1px solid transparent' }
              }
            >
              <item.icon className="h-4 w-4" style={section === item.id ? { color: accentBlue } : {}} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold font-display" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white capitalize truncate">{userName}</p>
              <p className="text-[10px]" style={{ color: labelColor }}>Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-display tracking-wider uppercase transition-all hover:opacity-80"
            style={{ background: 'hsla(0, 70%, 50%, 0.12)', border: '1px solid hsla(0, 70%, 50%, 0.25)', color: 'hsl(0, 70%, 65%)' }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between px-6 border-b shrink-0" style={{ background: 'hsla(220, 50%, 9%, 0.8)', backdropFilter: 'blur(12px)', borderColor: cardBorder }}>
          <h1 className="font-display text-sm tracking-widest uppercase text-white">
            {navItems.find(n => n.id === section)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg transition-all hover:bg-white/5" style={{ color: labelColor }}>
              <Bell className="h-5 w-5" />
              {metrics && metrics.pendentes > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: 'hsl(0, 72%, 51%)', color: 'white' }}>
                  {metrics.pendentes}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ══════ DASHBOARD ══════ */}
          {section === 'dashboard' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={FileCheck} label="Total Submissões" value={metrics?.total_submissoes || 0} color={accentBlue} />
                <MetricCard icon={Clock} label="Pendentes" value={metrics?.pendentes || 0} color={accentOrange} sub="Aguardando análise" />
                <MetricCard icon={Check} label="Aprovadas" value={metrics?.aprovadas || 0} color="hsl(152, 60%, 50%)" />
                <MetricCard icon={X} label="Reprovadas" value={metrics?.reprovadas || 0} color="hsl(0, 72%, 55%)" />
              </div>

              {/* Por curso + Por área side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <h3 className="font-display text-sm tracking-wider uppercase text-white mb-4">Submissões por Curso</h3>
                  <div className="space-y-3">
                    {(metrics?.por_curso || []).map((c, i) => {
                      const max = Math.max(...(metrics?.por_curso || []).map(x => x.total), 1);
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-white truncate mr-2">{c.curso}</span>
                            <span className="font-mono" style={{ color: accentBlue }}>{c.total}</span>
                          </div>
                          <div className="h-2 rounded-full" style={{ background: 'hsla(220, 40%, 20%, 0.6)' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${(c.total / max) * 100}%`, background: accentBlue }} />
                          </div>
                        </div>
                      );
                    })}
                    {(!metrics?.por_curso || metrics.por_curso.length === 0) && <p className="text-xs" style={{ color: labelColor }}>Nenhum dado disponível.</p>}
                  </div>
                </div>

                <div className="rounded-xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <h3 className="font-display text-sm tracking-wider uppercase text-white mb-4">Submissões por Área</h3>
                  <div className="space-y-2">
                    {(metrics?.por_area || []).map((a, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'hsla(220, 40%, 18%, 0.4)' }}>
                        <span className="text-sm text-white">{a.area}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono" style={{ color: 'hsl(152, 60%, 55%)' }}>{a.aprovadas} apr</span>
                          <span className="text-xs font-mono" style={{ color: accentOrange }}>{a.pendentes} pend</span>
                          <span className="text-sm font-mono font-bold" style={{ color: accentBlue }}>{a.total}</span>
                        </div>
                      </div>
                    ))}
                    {(!metrics?.por_area || metrics.por_area.length === 0) && <p className="text-xs" style={{ color: labelColor }}>Nenhum dado disponível.</p>}
                  </div>
                </div>
              </div>

              {/* Recent pending table */}
              <div className="rounded-xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm tracking-wider uppercase text-white">Pendentes Recentes</h3>
                  <button onClick={() => setSection('validation')} className="text-xs flex items-center gap-1 transition-colors hover:text-white" style={{ color: accentBlue }}>
                    Ver todas <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${cardBorder}` }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                        {['Aluno', 'Curso', 'Área', 'Horas', 'Data', 'Ação'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-[10px] font-display tracking-widest uppercase" style={{ color: accentBlue }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {submissoes.filter(s => s.status === 'pendente').slice(0, 5).map(sub => (
                        <tr key={sub.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: `1px solid ${cardBorder}` }}>
                          <td className="px-5 py-4 text-sm text-white">{sub.aluno_nome || sub.aluno_id}</td>
                          <td className="px-5 py-4 text-xs" style={{ color: labelColor }}>{sub.curso_nome || '—'}</td>
                          <td className="px-5 py-4 text-xs font-mono" style={{ color: labelColor }}>{sub.area || '—'}</td>
                          <td className="px-5 py-4 text-sm font-mono font-bold" style={{ color: accentBlue }}>{sub.horas_solicitadas || 0}h</td>
                          <td className="px-5 py-4 text-xs font-mono" style={{ color: labelColor }}>{new Date(sub.data_envio).toLocaleDateString('pt-BR')}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleStatusChange(sub.id, 'aprovado')} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'hsl(152, 60%, 55%)' }}><Check className="h-4 w-4" /></button>
                              <button onClick={() => handleStatusChange(sub.id, 'reprovado')} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'hsl(0, 72%, 60%)' }}><X className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {submissoes.filter(s => s.status === 'pendente').length === 0 && (
                        <tr><td colSpan={6} className="px-5 py-8 text-center text-xs" style={{ color: labelColor }}>Nenhuma submissão pendente.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ══════ COURSES ══════ */}
          {section === 'courses' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: labelColor }}>Gerencie os cursos da instituição.</p>
                <Button onClick={() => { setEditCourse({}); setCourseDialog(true); }} className="gap-2 text-xs font-display tracking-wider uppercase border-0" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}>
                  <Plus className="h-4 w-4" /> Novo Curso
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                      {['Nome do Curso', 'Carga Horária Mínima', 'Ações'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-display tracking-widest uppercase" style={{ color: accentBlue }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cursos.map(curso => (
                      <tr key={curso.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: `1px solid ${cardBorder}` }}>
                        <td className="px-5 py-4 text-sm text-white">{curso.nome}</td>
                        <td className="px-5 py-4 text-sm font-mono font-bold" style={{ color: accentBlue }}>{curso.carga_horaria_minima}h</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEditCourse(curso); setCourseDialog(true); }} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: accentBlue }}><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => { setCursos(prev => prev.filter(c => c.id !== curso.id)); toast.success('Curso removido.'); }} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'hsl(0, 70%, 60%)' }}><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {cursos.length === 0 && <tr><td colSpan={3} className="px-5 py-8 text-center text-xs" style={{ color: labelColor }}>Nenhum curso cadastrado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ══════ USERS ══════ */}
          {section === 'users' && (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: labelColor }} />
                  <Input placeholder="Buscar por nome ou email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 border-0 text-sm text-white placeholder:text-gray-500 font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
                </div>
                <Select value={roleFilter} onValueChange={v => { setRoleFilter(v); }}>
                  <SelectTrigger className="w-44 border-0 text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                    <Filter className="h-3.5 w-3.5 mr-2" style={{ color: labelColor }} />
                    <SelectValue placeholder="Filtrar por perfil" />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: `1px solid ${inputBorder}` }}>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="coordenador">Coordenadores</SelectItem>
                    <SelectItem value="aluno">Alunos</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setUserDialog(true)} className="gap-2 text-xs font-display tracking-wider uppercase border-0" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}>
                  <UserPlus className="h-4 w-4" /> Novo Usuário
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                      {['Nome', 'Email', 'Perfil', 'Curso', 'Editar'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-display tracking-widest uppercase" style={{ color: accentBlue }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsuarios.map(u => (
                      <tr key={u.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: `1px solid ${cardBorder}` }}>
                        <td className="px-5 py-4 text-sm text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: u.perfil === 'coordenador' ? `${accentOrange}22` : `${accentBlue}22`, color: u.perfil === 'coordenador' ? accentOrange : accentBlue }}>
                            {(u.nome || '?').charAt(0)}
                          </div>
                          {u.nome}
                        </td>
                        <td className="px-5 py-4 text-xs font-mono" style={{ color: labelColor }}>{u.email}</td>
                        <td className="px-5 py-4">
                          <Badge className="text-[10px] border" style={
                            u.perfil === 'coordenador'
                              ? { background: `${accentOrange}12`, color: accentOrange, borderColor: `${accentOrange}33` }
                              : { background: `${accentBlue}12`, color: accentBlue, borderColor: `${accentBlue}33` }
                          }>{u.perfil === 'coordenador' ? 'Coordenador' : 'Aluno'}</Badge>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: labelColor }}>{u.curso_nome || '—'}</td>
                        <td className="px-5 py-4">
                          <button className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: accentBlue }}><Pencil className="h-3.5 w-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsuarios.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-xs" style={{ color: labelColor }}>Nenhum usuário encontrado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ══════ VALIDATION ══════ */}
          {section === 'validation' && (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <Select value={cursoFilter} onValueChange={setCursoFilter}>
                  <SelectTrigger className="w-52 border-0 text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                    <SelectValue placeholder="Filtrar por curso" />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: `1px solid ${inputBorder}` }}>
                    <SelectItem value="all">Todos os cursos</SelectItem>
                    {[...new Set(submissoes.map(s => s.curso_nome).filter(Boolean))].map(c => (
                      <SelectItem key={c} value={c!}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-44 border-0 text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: `1px solid ${inputBorder}` }}>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="reprovado">Reprovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                      {['Aluno', 'Curso', 'Área', 'Tipo', 'Horas', 'Data', 'Status', 'Detalhes'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-display tracking-widest uppercase" style={{ color: accentBlue }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissoes.map(sub => {
                      const sc = statusColors[sub.status] || statusColors.pendente;
                      const isExpanded = expandedId === sub.id;
                      return (
                        <>
                          <tr key={sub.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: `1px solid ${cardBorder}` }}>
                            <td className="px-5 py-4 text-sm text-white">{sub.aluno_nome || sub.aluno_id}</td>
                            <td className="px-5 py-4 text-xs" style={{ color: labelColor }}>{sub.curso_nome || '—'}</td>
                            <td className="px-5 py-4 text-xs font-mono" style={{ color: labelColor }}>{sub.area || '—'}</td>
                            <td className="px-5 py-4 text-xs" style={{ color: labelColor }}>{sub.tipo || '—'}</td>
                            <td className="px-5 py-4 text-sm font-mono font-bold" style={{ color: accentBlue }}>{sub.horas_solicitadas || 0}h</td>
                            <td className="px-5 py-4 text-xs font-mono" style={{ color: labelColor }}>{new Date(sub.data_envio).toLocaleDateString('pt-BR')}</td>
                            <td className="px-5 py-4">
                              <Badge className="text-[10px] border" style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}>
                                {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-5 py-4">
                              <button onClick={() => toggleExpand(sub.id)} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: accentBlue }}>
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${sub.id}-detail`}>
                              <td colSpan={8} className="px-5 py-4" style={{ background: 'hsla(220, 40%, 12%, 0.5)' }}>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-[10px] font-display tracking-wider uppercase mb-1" style={{ color: labelColor }}>Descrição</p>
                                      <p className="text-sm text-white">{sub.descricao || 'Sem descrição.'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-display tracking-wider uppercase mb-1" style={{ color: labelColor }}>Carga Horária Solicitada</p>
                                      <p className="text-sm font-mono font-bold" style={{ color: accentBlue }}>{sub.horas_solicitadas || 0}h</p>
                                    </div>
                                  </div>
                                  {loadingCert && <p className="text-xs" style={{ color: labelColor }}>Carregando certificado...</p>}
                                  {certData && (
                                    <div className="space-y-3">
                                      <div className="rounded-lg h-48 flex items-center justify-center" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                                        {certData.url_arquivo ? (
                                          <iframe src={certData.url_arquivo} className="w-full h-full rounded-lg" title="Preview" />
                                        ) : (
                                          <p className="text-xs" style={{ color: labelColor }}>Sem preview disponível.</p>
                                        )}
                                      </div>
                                      {certData.url_arquivo && (
                                        <a href={certData.url_arquivo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs transition-colors hover:text-white" style={{ color: accentBlue }}>
                                          <ExternalLink className="h-3.5 w-3.5" /> Abrir arquivo
                                        </a>
                                      )}
                                      {certData.texto_extraido && (
                                        <div>
                                          <p className="text-[10px] font-display tracking-wider uppercase mb-1" style={{ color: labelColor }}>Texto Extraído (OCR)</p>
                                          <div className="rounded-lg p-3 text-xs font-mono text-white/80 max-h-32 overflow-y-auto" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                                            {certData.texto_extraido}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {sub.status === 'pendente' && (
                                    <div className="flex gap-3 justify-end pt-2">
                                      <Button onClick={() => handleStatusChange(sub.id, 'reprovado')} className="gap-2 text-xs font-display tracking-wider uppercase border-0" style={{ background: 'hsla(0, 72%, 50%, 0.15)', color: 'hsl(0, 72%, 65%)', border: '1px solid hsla(0, 72%, 50%, 0.3)' }}>
                                        <X className="h-4 w-4" /> Reprovar
                                      </Button>
                                      <Button onClick={() => handleStatusChange(sub.id, 'aprovado')} className="gap-2 text-xs font-display tracking-wider uppercase border-0" style={{ background: 'linear-gradient(135deg, hsl(152, 60%, 40%), hsl(160, 60%, 45%))', color: 'white' }}>
                                        <Check className="h-4 w-4" /> Aprovar
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                    {filteredSubmissoes.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-xs" style={{ color: labelColor }}>Nenhuma submissão encontrada.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ══════ RULES ══════ */}
          {section === 'rules' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: labelColor }}>Regras de atividades complementares por curso.</p>
                <Button onClick={() => { setEditRule({}); setRuleDialog(true); }} className="gap-2 text-xs font-display tracking-wider uppercase border-0" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}>
                  <Plus className="h-4 w-4" /> Nova Regra
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regras.map(rule => {
                  const cursoNome = rule.curso_nome || cursos.find(c => c.id === rule.curso_id)?.nome || '—';
                  return (
                    <div key={rule.id} className="rounded-xl p-5 space-y-3" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm tracking-wider uppercase text-white">{rule.area}</h4>
                        <button onClick={() => { setEditRule({ ...rule, exige_comprovante_str: rule.exige_comprovante ? 'sim' : 'nao' }); setRuleDialog(true); }} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: accentBlue }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Badge className="text-[10px] border" style={{ background: `${accentBlue}12`, color: accentBlue, borderColor: `${accentBlue}33` }}>{cursoNome}</Badge>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-[10px] font-display tracking-wider uppercase" style={{ color: labelColor }}>Limite Horas</p>
                          <p className="text-lg font-mono font-bold" style={{ color: accentBlue }}>{rule.limite_horas}h</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-display tracking-wider uppercase" style={{ color: labelColor }}>Comprovante</p>
                          <p className="text-lg font-mono font-bold" style={{ color: rule.exige_comprovante ? 'hsl(152, 60%, 55%)' : accentOrange }}>
                            {rule.exige_comprovante ? 'Sim' : 'Não'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {regras.length === 0 && <p className="text-xs col-span-3" style={{ color: labelColor }}>Nenhuma regra cadastrada.</p>}
              </div>
            </>
          )}

          {/* ══════ COORDINATORS ══════ */}
          {section === 'coordinators' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: labelColor }}>Vínculos entre coordenadores e cursos.</p>
                <Button onClick={() => setCoordDialog(true)} className="gap-2 text-xs font-display tracking-wider uppercase border-0" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}>
                  <Plus className="h-4 w-4" /> Novo Vínculo
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                      {['Coordenador', 'Email', 'Curso Vinculado', 'Ação'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-display tracking-widest uppercase" style={{ color: accentBlue }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {coordCursos.map(cc => (
                      <tr key={cc.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: `1px solid ${cardBorder}` }}>
                        <td className="px-5 py-4 text-sm text-white">{cc.coordenador_nome || cc.usuario_id}</td>
                        <td className="px-5 py-4 text-xs font-mono" style={{ color: labelColor }}>{cc.coordenador_email || '—'}</td>
                        <td className="px-5 py-4 text-sm" style={{ color: labelColor }}>{cc.curso_nome || cursos.find(c => c.id === cc.curso_id)?.nome || '—'}</td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleRemoveCoordVinculo(cc.id)} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'hsl(0, 70%, 60%)' }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {coordCursos.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-xs" style={{ color: labelColor }}>Nenhum vínculo cadastrado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </main>
      </div>

      {/* ── Course Dialog ── */}
      <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
        <DialogContent className="border-0" style={{ background: 'hsl(220, 50%, 12%)', border: `1px solid ${cardBorder}` }}>
          <DialogHeader>
            <DialogTitle className="font-display text-sm tracking-wider uppercase text-white">{editCourse.id ? 'Editar Curso' : 'Novo Curso'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Nome do Curso *</label>
              <Input value={editCourse.nome || ''} onChange={e => setEditCourse({ ...editCourse, nome: e.target.value })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Carga Horária Mínima</label>
              <Input type="number" value={editCourse.carga_horaria_minima || ''} onChange={e => setEditCourse({ ...editCourse, carga_horaria_minima: Number(e.target.value) })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCourseDialog(false)} className="text-xs font-display tracking-wider uppercase" style={{ borderColor: cardBorder, color: labelColor, background: 'transparent' }}>Cancelar</Button>
            <Button onClick={handleSaveCourse} className="text-xs font-display tracking-wider uppercase border-0" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── User Dialog ── */}
      <Dialog open={userDialog} onOpenChange={setUserDialog}>
        <DialogContent className="border-0" style={{ background: 'hsl(220, 50%, 12%)', border: `1px solid ${cardBorder}` }}>
          <DialogHeader>
            <DialogTitle className="font-display text-sm tracking-wider uppercase text-white">Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Nome Completo *</label>
              <Input value={newUser.nome} onChange={e => setNewUser({ ...newUser, nome: e.target.value })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>E-mail *</label>
              <Input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Senha Provisória *</label>
              <Input type="password" value={newUser.senha} onChange={e => setNewUser({ ...newUser, senha: e.target.value })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Perfil</label>
                <Select value={newUser.perfil} onValueChange={v => setNewUser({ ...newUser, perfil: v })}>
                  <SelectTrigger className="border-0 text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}><SelectValue /></SelectTrigger>
                  <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: `1px solid ${inputBorder}` }}>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="aluno">Aluno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Matrícula</label>
                <Input value={newUser.matricula} onChange={e => setNewUser({ ...newUser, matricula: e.target.value })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Curso</label>
              <Select value={newUser.curso_id} onValueChange={v => setNewUser({ ...newUser, curso_id: v })}>
                <SelectTrigger className="border-0 text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}><SelectValue placeholder="Selecionar curso" /></SelectTrigger>
                <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: `1px solid ${inputBorder}` }}>
                  {cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setUserDialog(false)} className="text-xs" style={{ borderColor: cardBorder, color: labelColor, background: 'transparent' }}>Cancelar</Button>
            <Button onClick={handleCreateUser} className="text-xs border-0" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Rule Dialog ── */}
      <Dialog open={ruleDialog} onOpenChange={setRuleDialog}>
        <DialogContent className="border-0" style={{ background: 'hsl(220, 50%, 12%)', border: `1px solid ${cardBorder}` }}>
          <DialogHeader>
            <DialogTitle className="font-display text-sm tracking-wider uppercase text-white">{editRule.id ? 'Editar Regra' : 'Nova Regra'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Curso *</label>
              <Select value={editRule.curso_id || ''} onValueChange={v => setEditRule({ ...editRule, curso_id: v })}>
                <SelectTrigger className="border-0 text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}><SelectValue placeholder="Selecionar curso" /></SelectTrigger>
                <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: `1px solid ${inputBorder}` }}>
                  {cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Área *</label>
              <Input value={editRule.area || ''} onChange={e => setEditRule({ ...editRule, area: e.target.value })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Limite de Horas</label>
                <Input type="number" value={editRule.limite_horas || ''} onChange={e => setEditRule({ ...editRule, limite_horas: Number(e.target.value) })} className="border-0 text-sm text-white font-mono" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Exige Comprovante</label>
                <Select value={editRule.exige_comprovante_str || 'sim'} onValueChange={v => setEditRule({ ...editRule, exige_comprovante_str: v })}>
                  <SelectTrigger className="border-0 text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}><SelectValue /></SelectTrigger>
                  <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: `1px solid ${inputBorder}` }}>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRuleDialog(false)} className="text-xs" style={{ borderColor: cardBorder, color: labelColor, background: 'transparent' }}>Cancelar</Button>
            <Button onClick={handleSaveRule} className="text-xs border-0" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Coord Vínculo Dialog ── */}
      <Dialog open={coordDialog} onOpenChange={setCoordDialog}>
        <DialogContent className="border-0" style={{ background: 'hsl(220, 50%, 12%)', border: `1px solid ${cardBorder}` }}>
          <DialogHeader>
            <DialogTitle className="font-display text-sm tracking-wider uppercase text-white">Novo Vínculo Coordenador–Curso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Coordenador</label>
              <Select value={newCoord.usuario_id} onValueChange={v => setNewCoord({ ...newCoord, usuario_id: v })}>
                <SelectTrigger className="border-0 text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}><SelectValue placeholder="Selecionar coordenador" /></SelectTrigger>
                <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: `1px solid ${inputBorder}` }}>
                  {coordenadores.map(c => <SelectItem key={c.id} value={c.id}>{c.nome} ({c.email})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Curso</label>
              <Select value={newCoord.curso_id} onValueChange={v => setNewCoord({ ...newCoord, curso_id: v })}>
                <SelectTrigger className="border-0 text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}><SelectValue placeholder="Selecionar curso" /></SelectTrigger>
                <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: `1px solid ${inputBorder}` }}>
                  {cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCoordDialog(false)} className="text-xs" style={{ borderColor: cardBorder, color: labelColor, background: 'transparent' }}>Cancelar</Button>
            <Button onClick={handleCreateCoordVinculo} className="text-xs border-0" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))`, color: 'white' }}>Vincular</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
