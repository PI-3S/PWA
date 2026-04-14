import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, FileCheck, ScrollText, Link2,
  LogOut, Search, Plus, Pencil, Trash2, Check, X, ChevronRight, ChevronDown, ChevronUp,
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
import { useAuth } from '@/contexts/AuthContext';
import { API_CONFIG } from '@/data/data';
import logoWhite from '@/assets/logo-white.png';

const API_BASE = API_CONFIG.BASE_URL;

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Gestão de Cursos', icon: BookOpen },
  { id: 'users', label: 'Gestão de Usuários', icon: Users },
  { id: 'validation', label: 'Validação', icon: FileCheck },
  { id: 'rules', label: 'Regras de Atividades', icon: ScrollText },
  { id: 'coordinators', label: 'Coordenadores', icon: Link2 },
];

const panelBg = 'hsl(220, 45%, 11%)';
const cardBg = 'hsla(220, 40%, 15%, 0.7)';
const cardBorder = 'hsla(200, 60%, 40%, 0.12)';
const inputBg = 'hsla(220, 40%, 18%, 0.8)';
const inputBorder = 'hsla(200, 80%, 50%, 0.15)';
const labelColor = 'hsl(220, 20%, 55%)';
const accentBlue = 'hsl(210, 80%, 55%)';
const accentOrange = 'hsl(30, 95%, 55%)';

interface DashboardMetrics {
  total_submissoes: number;
  pendentes: number;
  aprovadas: number;
  reprovadas: number;
  por_area: { area: string; total: number; aprovadas: number; pendentes: number; reprovadas: number }[];
  por_curso: { curso: string; total: number; aprovadas: number; pendentes: number; reprovadas: number }[];
}

interface Curso { id: string; nome: string; carga_horaria_minima: number; }
interface Usuario { id: string; nome: string; email: string; perfil: string; curso_id?: string; matricula?: string; curso_nome?: string; }
interface Submissao { 
  id: string; 
  aluno_id: string; 
  status: string; 
  data_envio: string; 
  descricao?: string; 
  horas_solicitadas?: number;
  carga_horaria_solicitada?: number;
  aluno_nome?: string; 
  curso_nome?: string; 
  area?: string; 
  tipo?: string; 
}
interface Regra { id: string; area: string; limite_horas: number; exige_comprovante: boolean; curso_id: string; curso_nome?: string; }
interface CoordCurso { id: string; usuario_id: string; curso_id: string; coordenador_nome?: string; coordenador_email?: string; curso_nome?: string; }

const Admin = () => {
  const navigate = useNavigate();
  const { user, token, signOut } = useAuth();
  const userName = user?.nome || 'Admin';

  const [section, setSection] = useState('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [regras, setRegras] = useState<Regra[]>([]);
  const [coordCursos, setCoordCursos] = useState<CoordCurso[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cursoFilter, setCursoFilter] = useState('all');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [certData, setCertData] = useState<{ url_arquivo?: string; texto_extraido?: string } | null>(null);
  const [loadingCert, setLoadingCert] = useState(false);

  const [courseDialog, setCourseDialog] = useState(false);
  const [editCourse, setEditCourse] = useState<Partial<Curso>>({});
  const [userDialog, setUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({ nome: '', email: '', senha: '', perfil: 'aluno', matricula: '', curso_id: '' });
  const [editUser, setEditUser] = useState<Partial<Usuario>>({});
  const [ruleDialog, setRuleDialog] = useState(false);
  const [editRule, setEditRule] = useState<Partial<Regra & { exige_comprovante_str: string }>>({});
  const [coordDialog, setCoordDialog] = useState(false);
  const [newCoord, setNewCoord] = useState({ usuario_id: '', curso_id: '' });

  // Welcome toast on first mount
  React.useEffect(() => {
    const welcomed = sessionStorage.getItem('welcomed_admin');
    if (!welcomed) {
      toast.success(`Bem-vindo, ${userName}!`);
      sessionStorage.setItem('welcomed_admin', 'true');
    }
  }, []);

  const apiFetch = useCallback(async (path: string, opts?: RequestInit) => {
    if (!token) {
      toast.error('Sessão expirada. Faça login novamente.');
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
        toast.error('Sessão expirada. Faça login novamente.');
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

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    try { 
      const d = await apiFetch('/api/dashboard/coordenador'); 
      setMetrics(d.metricas || d); 
    } catch (e: any) { 
      if (e.message !== 'Não autorizado') toast.error(e.message || "Erro ao carregar métricas."); 
    }
  }, [apiFetch]);

  const loadCursos = useCallback(async () => {
    if (!token) return;
    try { 
      const d = await apiFetch('/api/cursos'); 
      setCursos(d.cursos || []); 
    } catch (e: any) { 
      if (e.message !== 'Não autorizado') toast.error(e.message || "Erro ao carregar cursos."); 
    }
  }, [apiFetch]);

  const loadUsuarios = useCallback(async () => {
    if (!token) return;
    try {
      const params = roleFilter !== 'all' ? `?perfil=${roleFilter}` : '';
      const d = await apiFetch(`/api/usuarios${params}`);
      setUsuarios(d.usuarios || []);
    } catch (e: any) { 
      if (e.message !== 'Não autorizado') toast.error(e.message || "Erro ao carregar usuários."); 
    }
  }, [apiFetch, roleFilter]);

  const loadSubmissoes = useCallback(async () => {
    if (!token) return;
    try { 
      const d = await apiFetch('/api/submissoes'); 
      const subs = d.submissoes || [];
      const mappedSubs = subs.map((s: any) => ({
        ...s,
        horas_solicitadas: s.carga_horaria_solicitada || s.horas_solicitadas
      }));
      setSubmissoes(mappedSubs);
    } catch (e: any) { 
      if (e.message !== 'Não autorizado') toast.error(e.message || "Erro ao carregar submissões."); 
    }
  }, [apiFetch]);

  const loadRegras = useCallback(async () => {
    if (!token) return;
    try { 
      const d = await apiFetch('/api/regras'); 
      setRegras(d.regras || []); 
    } catch (e: any) { 
      if (e.message !== 'Não autorizado') toast.error(e.message || "Erro ao carregar regras."); 
    }
  }, [apiFetch]);

  const loadCoordCursos = useCallback(async () => {
    if (!token) return;
    try { 
      const d = await apiFetch('/api/coordenadores-cursos'); 
      setCoordCursos(d.vinculos || []); 
    } catch (e: any) { 
      if (e.message !== 'Não autorizado') toast.error(e.message || "Erro ao carregar vínculos."); 
    }
  }, [apiFetch]);

  useEffect(() => {
    if (!token) return;
    loadDashboard();
    loadCursos();
  }, [loadDashboard, loadCursos]);

  useEffect(() => {
    if (!token) return;
    
    const loadSectionData = async () => {
      switch (section) {
        case 'users': await loadUsuarios(); break;
        case 'validation': await loadSubmissoes(); break;
        case 'rules': await Promise.all([loadRegras(), loadCursos()]); break;
        case 'coordinators': await Promise.all([loadCoordCursos(), loadUsuarios(), loadCursos()]); break;
        case 'courses': await loadCursos(); break;
        case 'dashboard': await Promise.all([loadDashboard(), loadSubmissoes()]); break;
      }
    };
    loadSectionData();
  }, [section]);

  useEffect(() => { 
    if (section === 'users') loadUsuarios();
  }, [roleFilter]);

  const handleStatusChange = async (id: string, status: 'aprovado' | 'reprovado') => {
    try {
      await apiFetch(`/api/submissoes/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      toast.success(status === 'aprovado' ? 'Submissão aprovada!' : 'Submissão reprovada.');
      // Refresh data sequentially to ensure metrics reflect the new state
      await Promise.all([loadSubmissoes(), loadDashboard()]);
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toast.error(e.message || 'Erro ao atualizar status.');
    }
  };

  const handleSaveCourse = async () => {
    if (!editCourse.nome) { toast.error('Nome obrigatório.'); return; }
    try {
      const body = { nome: editCourse.nome, carga_horaria_minima: editCourse.carga_horaria_minima || 200 };
      if (editCourse.id) {
        await apiFetch(`/api/cursos/${editCourse.id}`, { method: 'PUT', body: JSON.stringify(body) });
        toast.success('Curso atualizado!');
      } else {
        await apiFetch('/api/cursos', { method: 'POST', body: JSON.stringify(body) });
        toast.success('Curso cadastrado!');
      }
      loadCursos();
      setCourseDialog(false);
      setEditCourse({});
    } catch (e: any) { 
      if (e.message !== 'Não autorizado') toast.error(e.message || 'Erro ao salvar curso.'); 
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.nome || !newUser.email || !newUser.senha) { toast.error('Preencha os campos obrigatórios.'); return; }
    try {
      await apiFetch('/api/usuarios', { method: 'POST', body: JSON.stringify(newUser) });
      toast.success('Usuário cadastrado!');
      setUserDialog(false);
      setNewUser({ nome: '', email: '', senha: '', perfil: 'aluno', matricula: '', curso_id: '' });
      loadUsuarios();
    } catch (e: any) { 
      if (e.message !== 'Não autorizado') toast.error(e.message || 'Erro ao cadastrar usuário.'); 
    }
  };

  const handleSaveRule = async () => {
    if (!editRule.area || !editRule.curso_id) { toast.error('Preencha os campos obrigatórios.'); return; }
    try {
      await apiFetch('/api/regras', {
        method: 'POST',
        body: JSON.stringify({
          area: editRule.area,
          limite_horas: editRule.limite_horas || 60,
          exige_comprovante: editRule.exige_comprovante_str === 'sim',
          curso_id: editRule.curso_id
        })
      });
      toast.success('Regra salva!');
      setRuleDialog(false);
      setEditRule({});
      loadRegras();
    } catch (e: any) { 
      if (e.message !== 'Não autorizado') toast.error(e.message || 'Erro ao salvar regra.'); 
    }
  };

  const handleCreateCoordVinculo = async () => {
    if (!newCoord.usuario_id || !newCoord.curso_id) { toast.error('Selecione coordenador e curso.'); return; }
    try {
      await apiFetch('/api/coordenadores-cursos', { method: 'POST', body: JSON.stringify(newCoord) });
      toast.success('Vínculo criado!');
      setCoordDialog(false);
      setNewCoord({ usuario_id: '', curso_id: '' });
      loadCoordCursos();
    } catch (e: any) { 
      if (e.message !== 'Não autorizado') toast.error(e.message || 'Erro ao criar vínculo.'); 
    }
  };

  const handleRemoveCoordVinculo = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este vínculo?')) return;
    try {
      await apiFetch(`/api/coordenadores-cursos/${id}`, { method: 'DELETE' });
      toast.success('Vínculo removido!');
      loadCoordCursos();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toast.error(e.message || 'Erro ao remover vínculo.');
    }
  };

  const handleDeleteCourse = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o curso "${nome}"?`)) return;
    try {
      await apiFetch(`/api/cursos/${id}`, { method: 'DELETE' });
      toast.success('Curso excluído!');
      loadCursos();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toast.error(e.message || 'Erro ao excluir curso.');
    }
  };

  const handleDeleteUser = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) return;
    try {
      await apiFetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      toast.success('Usuário excluído!');
      loadUsuarios();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toast.error(e.message || 'Erro ao excluir usuário.');
    }
  };

  const handleEditUser = async () => {
    if (!editUser.id || !editUser.nome || !editUser.email) { toast.error('Preencha os campos obrigatórios.'); return; }
    try {
      await apiFetch(`/api/usuarios/${editUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          nome: editUser.nome,
          email: editUser.email,
          matricula: editUser.matricula,
          curso_id: editUser.curso_id,
          perfil: editUser.perfil,
        }),
      });
      toast.success('Usuário atualizado!');
      setUserDialog(false);
      setEditUser({});
      loadUsuarios();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toast.error(e.message || 'Erro ao atualizar usuário.');
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await apiFetch(`/api/regras/${id}`, { method: 'DELETE' });
      toast.success('Regra excluída!');
      loadRegras();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toast.error(e.message || 'Erro ao excluir regra.');
    }
  };

  const handleEditRule = async () => {
    if (!editRule.id || !editRule.area || !editRule.curso_id) { toast.error('Preencha os campos obrigatórios.'); return; }
    try {
      await apiFetch(`/api/regras/${editRule.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          area: editRule.area,
          limite_horas: editRule.limite_horas || 60,
          exige_comprovante: editRule.exige_comprovante_str === 'sim',
          curso_id: editRule.curso_id,
        }),
      });
      toast.success('Regra atualizada!');
      setRuleDialog(false);
      setEditRule({});
      loadRegras();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toast.error(e.message || 'Erro ao atualizar regra.');
    }
  };

  const loadCertificado = async (submissaoId: string) => {
    setLoadingCert(true);
    setCertData(null);
    try {
      const d = await apiFetch(`/api/certificados?submissao_id=${submissaoId}`);
      const cert = d.certificados?.[0] || null;
      setCertData(cert);
    } catch (e) { 
      setCertData(null); 
    } finally {
      setLoadingCert(false);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) { 
      setExpandedId(null); 
      setCertData(null); 
    } else { 
      setExpandedId(id); 
      loadCertificado(id); 
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('welcomed_admin');
    signOut();
  };

  const filteredSubmissoes = submissoes.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (cursoFilter !== 'all' && s.curso_nome !== cursoFilter) return false;
    return true;
  });

  const filteredUsuarios = usuarios.filter(u => {
    const matchSearch = u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const coordenadores = usuarios.filter(u => u.perfil === 'coordenador');

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
              style={section === item.id ? { background: `${accentBlue}18`, border: `1px solid ${accentBlue}33`, color: 'white' } : { color: labelColor }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${accentBlue}, hsl(220, 70%, 60%))` }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-white">{userName}</p>
              <p className="text-[10px]" style={{ color: labelColor }}>Super Admin</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs uppercase" style={{ background: 'hsla(0, 70%, 50%, 0.12)', color: 'hsl(0, 70%, 65%)' }}>
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 flex items-center px-6 border-b" style={{ background: 'hsla(220, 50%, 9%, 0.8)', borderColor: cardBorder }}>
          <h1 className="text-white text-sm uppercase tracking-widest">{navItems.find(n => n.id === section)?.label}</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* DASHBOARD */}
          {section === 'dashboard' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={FileCheck} label="Total Submissões" value={metrics?.total_submissoes || 0} color={accentBlue} />
                <MetricCard icon={Clock} label="Pendentes" value={metrics?.pendentes || 0} color={accentOrange} />
                <MetricCard icon={Check} label="Aprovadas" value={metrics?.aprovadas || 0} color="hsl(152, 60%, 50%)" />
                <MetricCard icon={X} label="Reprovadas" value={metrics?.reprovadas || 0} color="hsl(0, 72%, 55%)" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <h3 className="text-white text-sm mb-4">Submissões por Curso</h3>
                  {(metrics?.por_curso || []).map((c, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white">{c.curso}</span>
                        <span style={{ color: accentBlue }}>{c.total}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${(c.total / Math.max(...metrics!.por_curso.map(x => x.total), 1)) * 100}%`, background: accentBlue }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <h3 className="text-white text-sm mb-4">Submissões por Área</h3>
                  {(metrics?.por_area || []).map((a, i) => (
                    <div key={i} className="flex justify-between py-2 px-3 rounded-lg bg-white/5">
                      <span className="text-white">{a.area}</span>
                      <span style={{ color: accentBlue }}>{a.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* COURSES */}
          {section === 'courses' && (
            <>
              <div className="flex justify-between">
                <h2 className="text-white text-xl">Gestão de Cursos</h2>
                <Button onClick={() => { setEditCourse({}); setCourseDialog(true); }} style={{ background: accentBlue }}>
                  <Plus className="h-4 w-4 mr-2" /> Novo Curso
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: cardBg }}>
                <table className="w-full">
                  <thead style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                    <tr>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Nome</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Carga Horária</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursos.map(c => (
                      <tr key={c.id} className="border-b" style={{ borderColor: cardBorder }}>
                        <td className="px-5 py-4 text-white">{c.nome}</td>
                        <td className="px-5 py-4" style={{ color: accentBlue }}>{c.carga_horaria_minima}h</td>
                        <td className="px-5 py-4">
                          <button onClick={() => { setEditCourse(c); setCourseDialog(true); }} className="mr-2" style={{ color: accentBlue }}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteCourse(c.id, c.nome)} style={{ color: 'hsl(0, 72%, 60%)' }}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* USERS */}
          {section === 'users' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ background: inputBg }} />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger style={{ background: inputBg, width: 150 }}><SelectValue placeholder="Perfil" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="aluno">Alunos</SelectItem>
                    <SelectItem value="coordenador">Coordenadores</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setUserDialog(true)} style={{ background: accentBlue }}>
                  <UserPlus className="h-4 w-4 mr-2" /> Novo Usuário
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: cardBg }}>
                <table className="w-full">
                  <thead style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                    <tr>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Nome/Email</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Perfil</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Curso</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsuarios.map(u => (
                      <tr key={u.id} className="border-b" style={{ borderColor: cardBorder }}>
                        <td className="px-5 py-4">
                          <p className="text-white">{u.nome}</p>
                          <p className="text-xs" style={{ color: labelColor }}>{u.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <Badge style={{ color: u.perfil === 'coordenador' ? accentOrange : accentBlue }}>{u.perfil}</Badge>
                        </td>
                        <td className="px-5 py-4 text-white">{u.curso_nome || '-'}</td>
                        <td className="px-5 py-4">
                          <button onClick={() => { setEditUser(u); setUserDialog(true); }} className="mr-2" style={{ color: accentBlue }}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteUser(u.id, u.nome)} style={{ color: 'hsl(0, 72%, 60%)' }}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VALIDATION */}
          {section === 'validation' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger style={{ background: inputBg, width: 150 }}><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="aprovado">Aprovadas</SelectItem>
                    <SelectItem value="reprovado">Reprovadas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={cursoFilter} onValueChange={setCursoFilter}>
                  <SelectTrigger style={{ background: inputBg, width: 200 }}><SelectValue placeholder="Curso" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {cursos.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: cardBg }}>
                <table className="w-full">
                  <thead style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                    <tr>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Aluno</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Curso</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Área</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Horas</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Status</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissoes.map(sub => {
                      const sc = statusColors[sub.status] || statusColors.pendente;
                      const isExpanded = expandedId === sub.id;
                      return (
                        <React.Fragment key={sub.id}>
                          <tr className="border-b" style={{ borderColor: cardBorder }}>
                            <td className="px-5 py-4 text-white">{sub.aluno_nome}</td>
                            <td className="px-5 py-4" style={{ color: labelColor }}>{sub.curso_nome}</td>
                            <td className="px-5 py-4" style={{ color: labelColor }}>{sub.area}</td>
                            <td className="px-5 py-4" style={{ color: accentBlue }}>{sub.horas_solicitadas || sub.carga_horaria_solicitada || 0}h</td>
                            <td className="px-5 py-4"><Badge style={{ background: sc.bg, color: sc.text }}>{sub.status}</Badge></td>
                            <td className="px-5 py-4">
                              <button onClick={() => toggleExpand(sub.id)} style={{ color: accentBlue }}>
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="px-8 py-6 bg-black/20">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-white mb-2">Descrição: {sub.descricao || '-'}</p>
                                    <div className="flex gap-2">
                                      <Button onClick={() => handleStatusChange(sub.id, 'reprovado')} style={{ background: 'hsla(0, 72%, 50%, 0.2)', color: 'hsl(0, 72%, 60%)' }}>
                                        <X className="h-4 w-4 mr-2" /> Reprovar
                                      </Button>
                                      <Button onClick={() => handleStatusChange(sub.id, 'aprovado')} style={{ background: 'hsla(152, 60%, 40%, 0.2)', color: 'hsl(152, 60%, 55%)' }}>
                                        <Check className="h-4 w-4 mr-2" /> Aprovar
                                      </Button>
                                    </div>
                                  </div>
                                  <div>
                                    {loadingCert ? (
                                      <p className="text-white">Carregando...</p>
                                    ) : certData?.url_arquivo ? (
                                      <div className="space-y-3">
                                        <a
                                          href={certData.url_arquivo}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors w-fit"
                                        >
                                          <ExternalLink className="h-4 w-4" /> Abrir Certificado
                                        </a>
                                        {certData.texto_extraido && (
                                          <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                                            <p className="text-[10px] uppercase text-slate-500 mb-1">OCR Extraído</p>
                                            <p className="text-xs text-slate-400 leading-relaxed max-h-32 overflow-y-auto">{certData.texto_extraido}</p>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-gray-400">Certificado não disponível</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* RULES */}
          {section === 'rules' && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-white text-xl">Regras de Atividades</h2>
                <Button onClick={() => { setEditRule({}); setRuleDialog(true); }} style={{ background: accentBlue }}>
                  <Plus className="h-4 w-4 mr-2" /> Nova Regra
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regras.map(r => (
                  <div key={r.id} className="p-5 rounded-xl relative" style={{ background: cardBg }}>
                    <div className="absolute top-3 right-3 flex gap-1">
                      <button onClick={() => { setEditRule({ ...r, exige_comprovante_str: r.exige_comprovante ? 'sim' : 'nao' }); setRuleDialog(true); }} style={{ color: accentBlue }}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteRule(r.id)} style={{ color: 'hsl(0, 72%, 60%)' }}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <h4 className="text-white text-lg mb-2">{r.area}</h4>
                    <p style={{ color: labelColor }}>{r.curso_nome}</p>
                    <p className="mt-2" style={{ color: accentBlue }}>Limite: {r.limite_horas}h</p>
                    <Badge style={{ color: r.exige_comprovante ? 'hsl(152, 60%, 55%)' : labelColor }}>
                      {r.exige_comprovante ? 'Exige comprovante' : 'Não exige'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COORDINATORS */}
          {section === 'coordinators' && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-white text-xl">Vínculos de Coordenadores</h2>
                <Button onClick={() => setCoordDialog(true)} style={{ background: accentBlue }}>
                  <Link2 className="h-4 w-4 mr-2" /> Novo Vínculo
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: cardBg }}>
                <table className="w-full">
                  <thead style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                    <tr>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Coordenador</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Curso</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coordCursos.map(c => (
                      <tr key={c.id} className="border-b" style={{ borderColor: cardBorder }}>
                        <td className="px-5 py-4 text-white">{c.coordenador_nome}</td>
                        <td className="px-5 py-4" style={{ color: accentOrange }}>{c.curso_nome}</td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleRemoveCoordVinculo(c.id)} style={{ color: 'hsl(0, 72%, 60%)' }}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* DIALOGS */}
      <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
        <DialogContent style={{ background: 'hsl(220, 50%, 12%)' }}>
          <DialogHeader><DialogTitle className="text-white">{editCourse.id ? 'Editar Curso' : 'Novo Curso'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nome" value={editCourse.nome || ''} onChange={e => setEditCourse({ ...editCourse, nome: e.target.value })} style={{ background: inputBg }} />
            <Input type="number" placeholder="Carga Horária" value={editCourse.carga_horaria_minima || ''} onChange={e => setEditCourse({ ...editCourse, carga_horaria_minima: Number(e.target.value) })} style={{ background: inputBg }} />
          </div>
          <DialogFooter>
            <Button onClick={() => setCourseDialog(false)} variant="outline">Cancelar</Button>
            <Button onClick={handleSaveCourse} style={{ background: accentBlue }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={userDialog} onOpenChange={setUserDialog}>
        <DialogContent style={{ background: 'hsl(220, 50%, 12%)' }}>
          <DialogHeader><DialogTitle className="text-white">{editUser.id ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Nome" value={editUser.id ? (editUser.nome || '') : newUser.nome} onChange={e => editUser.id ? setEditUser({ ...editUser, nome: e.target.value }) : setNewUser({ ...newUser, nome: e.target.value })} style={{ background: inputBg }} />
            <Input placeholder="Email" value={editUser.id ? (editUser.email || '') : newUser.email} onChange={e => editUser.id ? setEditUser({ ...editUser, email: e.target.value }) : setNewUser({ ...newUser, email: e.target.value })} style={{ background: inputBg }} />
            {!editUser.id && <Input type="password" placeholder="Senha" value={newUser.senha} onChange={e => setNewUser({ ...newUser, senha: e.target.value })} style={{ background: inputBg }} />}
            <Input placeholder="Matrícula" value={editUser.id ? (editUser.matricula || '') : newUser.matricula} onChange={e => editUser.id ? setEditUser({ ...editUser, matricula: e.target.value }) : setNewUser({ ...newUser, matricula: e.target.value })} style={{ background: inputBg }} />
            <Select value={editUser.id ? (editUser.perfil || 'aluno') : newUser.perfil} onValueChange={v => editUser.id ? setEditUser({ ...editUser, perfil: v }) : setNewUser({ ...newUser, perfil: v })}>
              <SelectTrigger style={{ background: inputBg }}><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="aluno">Aluno</SelectItem><SelectItem value="coordenador">Coordenador</SelectItem></SelectContent>
            </Select>
            <Select value={editUser.id ? (editUser.curso_id || '') : newUser.curso_id} onValueChange={v => editUser.id ? setEditUser({ ...editUser, curso_id: v }) : setNewUser({ ...newUser, curso_id: v })}>
              <SelectTrigger style={{ background: inputBg }}><SelectValue placeholder="Curso" /></SelectTrigger>
              <SelectContent>{cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={() => { setUserDialog(false); setEditUser({}); }} variant="outline">Cancelar</Button>
            <Button onClick={editUser.id ? handleEditUser : handleCreateUser} style={{ background: accentBlue }}>{editUser.id ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={ruleDialog} onOpenChange={setRuleDialog}>
        <DialogContent style={{ background: 'hsl(220, 50%, 12%)' }}>
          <DialogHeader><DialogTitle className="text-white">{editRule.id ? 'Editar Regra' : 'Nova Regra'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Área" value={editRule.area || ''} onChange={e => setEditRule({ ...editRule, area: e.target.value })} style={{ background: inputBg }} />
            <Input type="number" placeholder="Limite de Horas" value={editRule.limite_horas || ''} onChange={e => setEditRule({ ...editRule, limite_horas: Number(e.target.value) })} style={{ background: inputBg }} />
            <Select value={editRule.exige_comprovante_str} onValueChange={v => setEditRule({ ...editRule, exige_comprovante_str: v })}>
              <SelectTrigger style={{ background: inputBg }}><SelectValue placeholder="Exige comprovante?" /></SelectTrigger>
              <SelectContent><SelectItem value="sim">Sim</SelectItem><SelectItem value="nao">Não</SelectItem></SelectContent>
            </Select>
            <Select value={editRule.curso_id || ''} onValueChange={v => setEditRule({ ...editRule, curso_id: v })}>
              <SelectTrigger style={{ background: inputBg }}><SelectValue placeholder="Curso" /></SelectTrigger>
              <SelectContent>{cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={() => { setRuleDialog(false); setEditRule({}); }} variant="outline">Cancelar</Button>
            <Button onClick={editRule.id ? handleEditRule : handleSaveRule} style={{ background: accentBlue }}>{editRule.id ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={coordDialog} onOpenChange={setCoordDialog}>
        <DialogContent style={{ background: 'hsl(220, 50%, 12%)' }}>
          <DialogHeader><DialogTitle className="text-white">Vincular Coordenador</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select value={newCoord.usuario_id} onValueChange={v => setNewCoord({ ...newCoord, usuario_id: v })}>
              <SelectTrigger style={{ background: inputBg }}><SelectValue placeholder="Coordenador" /></SelectTrigger>
              <SelectContent>{coordenadores.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={newCoord.curso_id} onValueChange={v => setNewCoord({ ...newCoord, curso_id: v })}>
              <SelectTrigger style={{ background: inputBg }}><SelectValue placeholder="Curso" /></SelectTrigger>
              <SelectContent>{cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateCoordVinculo} style={{ background: accentBlue }}>Vincular</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Admin;