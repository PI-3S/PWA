import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, FileCheck, ScrollText, Link2,
  LogOut, Search, Plus, Pencil, Trash2, Check, X, ChevronRight, ChevronDown, ChevronUp,
  GraduationCap, Clock, Award, AlertTriangle, Filter,
  ShieldCheck, UserPlus, Bell, ExternalLink, Settings, Save, Mail, Globe, Palette, KeyRound, Menu
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
import Footer from '@/components/Footer';

// --- MUDANÇA 1: Importação do hook de tema ---
import { useAppTheme } from '@/hooks/useapptheme';
import { useIsMobile } from '@/hooks/use-mobile';
import ThemeSwitcher from '@/components/themeswitcher';


const API_BASE = API_CONFIG.BASE_URL;

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Gestão de Cursos', icon: BookOpen },
  { id: 'users', label: 'Gestão de Usuários', icon: Users },
  { id: 'validation', label: 'Validação', icon: FileCheck },
  { id: 'rules', label: 'Regras de Atividades', icon: ScrollText },
  { id: 'coordinators', label: 'Coordenadores', icon: Link2 },
  { id: 'settings', label: 'Configurações', icon: Settings }, // 🆕 ADICIONE ESTA LINHA
];

const accentBlue = 'hsl(210, 80%, 55%)';
const accentOrange = 'hsl(30, 95%, 55%)';



// ─── FIX: Estilo padrão para toasts (fundo escuro + texto branco) ─────────────
const toastStyle = {
  background: 'hsl(220, 45%, 14%)',
  color: 'white',
  border: `1px solid hsla(200, 60%, 40%, 0.3)`,
};
const toastSuccess = (msg: string) => toast.success(msg, { style: toastStyle });
const toastError   = (msg: string) => toast.error(msg,   { style: { ...toastStyle, border: '1px solid hsla(0,70%,50%,0.4)' } });

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
  data_validacao?: string;
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
  const { colors } = useAppTheme();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputStyle = {
    background: colors.inputBg,
    color: colors.textPrimary,
    border: `1px solid ${colors.inputBorder}`,
  };

const [emailConfig, setEmailConfig] = useState({
  host: '',
  port: 587,
  secure: false,
  user: '',
  pass: '',
  from: '',
  ativo: true
});

const [sistemaConfig, setSistemaConfig] = useState({
  nome_sistema: '',
  instituicao: '',
  logo_url: '',
  frontend_url: '',
  cor_primaria: '',
  cor_secundaria: ''
});

const [loadingConfig, setLoadingConfig] = useState(false);
const [testingEmail, setTestingEmail] = useState(false);


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
  const [correcaoDialog, setCorrecaoDialog] = useState(false);
  const [correcaoSubmissao, setCorrecaoSubmissao] = useState<Submissao | null>(null);
  const [correcaoObs, setCorrecaoObs] = useState('');
  const [resetSenhaDialog, setResetSenhaDialog] = useState(false);
  const [resetSenhaUser, setResetSenhaUser] = useState<Usuario | null>(null);
  const [resetSenhaLoading, setResetSenhaLoading] = useState(false);
  const [resetSenhaGerada, setResetSenhaGerada] = useState<string | null>(null);

  const [approveDialog, setApproveDialog] = useState(false);
  const [approveSubmissao, setApproveSubmissao] = useState<Submissao | null>(null);
  const [approveHoras, setApproveHoras] = useState<number>(0);

const generateSecurePassword = () => {
  const length = 12;
  const charset = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%&*'
  };
  
  let password = '';
  const allChars = charset.uppercase + charset.lowercase + charset.numbers + charset.symbols;
  
  // Garante pelo menos um de cada tipo
  password += charset.uppercase.charAt(Math.floor(Math.random() * charset.uppercase.length));
  password += charset.lowercase.charAt(Math.floor(Math.random() * charset.lowercase.length));
  password += charset.numbers.charAt(Math.floor(Math.random() * charset.numbers.length));
  password += charset.symbols.charAt(Math.floor(Math.random() * charset.symbols.length));
  
  // Completa o resto da senha
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Embaralha a senha
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Estado para o modal de confirmação
const [createdUserData, setCreatedUserData] = useState<{nome: string, email: string, senha: string} | null>(null);

  // ─── FIX: Welcome toast com estilo correto ────────────────────────────────
  React.useEffect(() => {
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

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    try { 
      const d = await apiFetch('/api/dashboard/coordenador'); 
      setMetrics(d.metricas || d); 
    } catch (e: any) { 
      if (e.message !== 'Não autorizado') toastError(e.message || "Erro ao carregar métricas."); 
    }
  }, [apiFetch]);

  const loadCursos = useCallback(async () => {
    if (!token) return;
    try { 
      const d = await apiFetch('/api/cursos'); 
      setCursos(d.cursos || []); 
    } catch (e: any) { 
      if (e.message !== 'Não autorizado') toastError(e.message || "Erro ao carregar cursos."); 
    }
  }, [apiFetch]);

  const loadEmailConfig = useCallback(async () => {
  try {
    const doc = await apiFetch('/api/configuracoes/email_config');
    if (doc.config) {
      setEmailConfig(doc.config);
    }
  } catch (e) {
    console.error('Erro ao carregar config de email:', e);
  }
}, [apiFetch]);

const loadSistemaConfig = useCallback(async () => {
  try {
    const doc = await apiFetch('/api/configuracoes/sistema_config');
    if (doc.config) {
      setSistemaConfig(doc.config);
    }
  } catch (e) {
    console.error('Erro ao carregar config do sistema:', e);
  }
}, [apiFetch]);

  const loadUsuarios = useCallback(async () => {
  if (!token) return;
  try {
    const params = roleFilter !== 'all' ? `?perfil=${roleFilter}` : '';
    const [dUsuarios, dCursos] = await Promise.all([
      apiFetch(`/api/usuarios${params}`),
      apiFetch('/api/cursos'),
    ]);
    const cursosMap: Record<string, string> = {};
    (dCursos.cursos || []).forEach((c: Curso) => { cursosMap[c.id] = c.nome; });

    const usuarios = (dUsuarios.usuarios || []).map((u: any) => ({
      ...u,
      curso_nome: u.curso_nome || (u.curso_id ? cursosMap[u.curso_id] : undefined),
    }));
    setUsuarios(usuarios);
    setCursos(dCursos.cursos || []);
  } catch (e: any) {
    if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao carregar usuários.');
  }
}, [apiFetch, roleFilter]);

  const loadSubmissoes = useCallback(async () => {
    if (!token) return;
    try {
      // Busca submissões, usuários, cursos e regras em paralelo
      const [dSubmissoes, dUsuarios, dCursos, dRegras] = await Promise.all([
        apiFetch('/api/submissoes'),
        apiFetch('/api/usuarios'),
        apiFetch('/api/cursos'),
        apiFetch('/api/regras'),
      ]);

      const raw = dSubmissoes.submissoes || dSubmissoes.data || [];
      const usuarios = dUsuarios.usuarios || [];
      const cursos = dCursos.cursos || [];
      const regras = dRegras.regras || [];

      // Cria Maps para lookup eficiente
      const usuariosMap = new Map<string, { nome: string; curso_id?: string }>();
      usuarios.forEach((u: any) => usuariosMap.set(u.id, { nome: u.nome, curso_id: u.curso_id }));

      const cursosMap = new Map<string, string>();
      cursos.forEach((c: any) => cursosMap.set(c.id, c.nome));

      const regrasMap = new Map<string, { area: string }>();
      regras.forEach((r: any) => regrasMap.set(r.id, { area: r.area }));

      const mapped = raw.map((s: any) => {
        // Busca dados do aluno pelo ID
        const aluno = usuariosMap.get(s.aluno_id || s.usuario_id);
        // Busca nome do curso (prioriza o campo direto, depois lookup)
        const cursoNome = s.curso_nome ||
          s.nome_curso ||
          s.curso?.nome ||
          cursosMap.get(s.curso_id || aluno?.curso_id) ||
          '—';
        // Busca área (prioriza campo direto, depois lookup pela regra)
        const areaNome = s.area ||
          s.area_atividade ||
          s.categoria ||
          s.tipo ||
          (s.regra_id ? regrasMap.get(s.regra_id)?.area : null) ||
          '—';

        return {
          ...s,
          aluno_nome: s.aluno_nome || s.nome_aluno || aluno?.nome || s.usuario?.nome || s.usuario_nome || '—',
          curso_nome: cursoNome,
          area: areaNome,
          horas_solicitadas: s.horas_solicitadas || s.carga_horaria_solicitada || s.carga_horaria || s.horas || 0,
          status: s.status || 'pendente',
          data_validacao: s.data_validacao || s.updated_at || s.dataAtualizacao,
        };
      });
      setSubmissoes(mapped);
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao carregar submissões.');
    }
  }, [apiFetch]);

  const loadRegras = useCallback(async () => {
    if (!token) return;
    try { 
      const d = await apiFetch('/api/regras'); 
      setRegras(d.regras || []); 
    } catch (e: any) { 
      if (e.message !== 'Não autorizado') toastError(e.message || "Erro ao carregar regras."); 
    }
  }, [apiFetch]);

  const loadCoordCursos = useCallback(async () => {
    if (!token) return;
    try {
      const [dVinculos, dUsuarios, dCursos] = await Promise.all([
        apiFetch('/api/coordenadores-cursos'),
        apiFetch('/api/usuarios'),
        apiFetch('/api/cursos'),
      ]);

      const vinculos = (dVinculos.vinculos || []).map((v: any) => {
        const usuario = (dUsuarios.usuarios || []).find((u: any) => u.id === v.usuario_id);
        const curso = (dCursos.cursos || []).find((c: any) => c.id === v.curso_id);
        return {
          ...v,
          coordenador_nome: usuario?.nome || v.usuario_id,
          coordenador_email: usuario?.email || '',
          curso_nome: curso?.nome || v.curso_id,
        };
      });

      setCoordCursos(vinculos);
      setUsuarios(dUsuarios.usuarios || []);
      setCursos(dCursos.cursos || []);
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || "Erro ao carregar vínculos.");
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
      case 'coordinators': await loadCoordCursos(); break;
      case 'courses': await loadCursos(); break;
      case 'dashboard': await Promise.all([loadDashboard(), loadSubmissoes()]); break;
      case 'settings': await Promise.all([loadEmailConfig(), loadSistemaConfig()]); break;
    }
  };
  loadSectionData();
}, [section, token, loadUsuarios, loadSubmissoes, loadRegras, loadCursos, loadCoordCursos, loadDashboard, loadEmailConfig, loadSistemaConfig]);

  useEffect(() => { 
    if (section === 'users') loadUsuarios();
  }, [roleFilter]);

  const handleStatusChange = async (id: string, status: 'aprovado' | 'reprovado', horasAprovadas?: number) => {
    try {
      const body: Record<string, unknown> = { status };
      if (status === 'aprovado' && horasAprovadas !== undefined) {
        body.horas_aprovadas = horasAprovadas;
      }
      await apiFetch(`/api/submissoes/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      toastSuccess(status === 'aprovado' ? 'Submissão aprovada!' : 'Submissão reprovada.');
      await Promise.all([loadSubmissoes(), loadDashboard()]);
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao atualizar status.');
    }
  };



const handleSaveCourse = async () => {
  if (!editCourse.nome?.trim()) { 
    toastError('Nome obrigatório.'); 
    return; 
  }
  
  const body = {
    nome: editCourse.nome.trim(),
    carga_horaria_minima: Number(editCourse.carga_horaria_minima) || 200,
  };

  try {
    if (editCourse.id) {
      await apiFetch(`/api/cursos/${editCourse.id}`, { 
        method: 'PATCH', 
        body: JSON.stringify(body) 
      });
      toastSuccess('Curso atualizado!');
    } else {
      await apiFetch('/api/cursos', { 
        method: 'POST', 
        body: JSON.stringify(body) 
      });
      toastSuccess('Curso cadastrado!');
    }
    
    await loadCursos();
    setCourseDialog(false);
    setEditCourse({});
  } catch (e: any) {
    toastError(e.message || 'Erro ao salvar curso.');
  }
};

  const handleCreateUser = async () => {
  // Validações
  if (!newUser.nome?.trim()) { 
    toastError('Nome é obrigatório.'); 
    return; 
  }
  if (!newUser.email?.trim()) { 
    toastError('Email é obrigatório.'); 
    return; 
  }
  if (!newUser.email.includes('@')) { 
    toastError('Email inválido.'); 
    return; 
  }
  if (!newUser.senha) { 
    toastError('Senha é obrigatória.'); 
    return; 
  }
  if (newUser.senha.length < 6) { 
    toastError('A senha deve ter pelo menos 6 caracteres.'); 
    return; 
  }
  
  try {
    const response = await apiFetch('/api/usuarios', { 
      method: 'POST', 
      body: JSON.stringify({
        nome: newUser.nome.trim(),
        email: newUser.email.trim().toLowerCase(),
        senha: newUser.senha,
        perfil: newUser.perfil,
        matricula: newUser.matricula?.trim() || null,
        curso_id: newUser.curso_id || null
      }) 
    });
    
    // Mostra os dados no modal APENAS como backup
    setCreatedUserData({
      nome: newUser.nome.trim(),
      email: newUser.email.trim().toLowerCase(),
      senha: newUser.senha
    });
    
    toastSuccess(`Usuário criado! Credenciais enviadas para ${newUser.email}`);
    
    setUserDialog(false);
    setNewUser({ 
      nome: '', 
      email: '', 
      senha: '', 
      perfil: 'aluno', 
      matricula: '', 
      curso_id: '' 
    });
    
    await loadUsuarios();
    
  } catch (e: any) { 
    if (e.message !== 'Não autorizado') {
      if (e.message.includes('email')) {
        toastError('Este email já está em uso.');
      } else {
        toastError(e.message || 'Erro ao cadastrar usuário.');
      }
    }
  }
};


  const handleSaveRule = async () => {
  if (!editRule.area || !editRule.curso_id) { 
    toastError('Preencha os campos obrigatórios.'); 
    return; 
  }
  
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
    toastSuccess('Regra criada com sucesso!');
    setRuleDialog(false);
    setEditRule({});
    loadRegras();
  } catch (e: any) { 
    if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao salvar regra.'); 
  }
};


  const handleCreateCoordVinculo = async () => {
    if (!newCoord.usuario_id || !newCoord.curso_id) { toastError('Selecione coordenador e curso.'); return; }
    try {
      await apiFetch('/api/coordenadores-cursos', { method: 'POST', body: JSON.stringify(newCoord) });
      toastSuccess('Vínculo criado!');
      setCoordDialog(false);
      setNewCoord({ usuario_id: '', curso_id: '' });
      loadCoordCursos();
    } catch (e: any) { 
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao criar vínculo.'); 
    }
  };

  const handleRemoveCoordVinculo = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este vínculo?')) return;
    try {
      await apiFetch(`/api/coordenadores-cursos/${id}`, { method: 'DELETE' });
      toastSuccess('Vínculo removido!');
      loadCoordCursos();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao remover vínculo.');
    }
  };

  const handleDeleteCourse = async (id: string, nome: string) => {
  if (!confirm(`Excluir o curso "${nome}"?`)) return;
  
  try {
    await apiFetch(`/api/cursos/${id}`, { method: 'DELETE' });
    toastSuccess('Curso excluído!');
    await loadCursos();
  } catch (e: any) {
    toastError(e.message || 'Erro ao excluir curso.');
  }
};

  const handleDeleteUser = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) return;
    try {
      await apiFetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      toastSuccess('Usuário excluído!');
      loadUsuarios();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao excluir usuário.');
    }
  };

  // 🆕 Carregar configurações


// 🆕 Salvar configuração de email
const saveEmailConfig = async () => {
  setLoadingConfig(true);
  try {
    await apiFetch('/api/configuracoes/email_config', {
      method: 'POST',
      body: JSON.stringify(emailConfig)
    });
    toastSuccess('Configurações de email salvas!');
  } catch (e: any) {
    toastError(e.message || 'Erro ao salvar configurações.');
  } finally {
    setLoadingConfig(false);
  }
};

// 🆕 Salvar configuração do sistema
const saveSistemaConfig = async () => {
  setLoadingConfig(true);
  try {
    await apiFetch('/api/configuracoes/sistema_config', {
      method: 'POST',
      body: JSON.stringify(sistemaConfig)
    });
    toastSuccess('Configurações do sistema salvas!');
  } catch (e: any) {
    toastError(e.message || 'Erro ao salvar configurações.');
  } finally {
    setLoadingConfig(false);
  }
};

// 🆕 Testar envio de email
const testEmailConfig = async () => {
  if (!emailConfig.user) {
    toastError('Configure o email remetente primeiro.');
    return;
  }
  
  setTestingEmail(true);
  try {
    await apiFetch('/api/configuracoes/test-email', {
      method: 'POST',
      body: JSON.stringify({ to: emailConfig.user })
    });
    toastSuccess('Email de teste enviado! Verifique sua caixa de entrada.');
  } catch (e: any) {
    toastError(e.message || 'Erro ao enviar email de teste.');
  } finally {
    setTestingEmail(false);
  }
};

  // ─── handleEditUser: tenta PATCH, fallback para PUT se vier 404/405 ───────────
const handleEditUser = async () => {
  if (!editUser.id || !editUser.nome || !editUser.email) {
    toastError('Preencha os campos obrigatórios.');
    return;
  }
  const body = {
    nome: editUser.nome,
    email: editUser.email,
    matricula: editUser.matricula || '',
    curso_id: editUser.curso_id || '',
    perfil: editUser.perfil,
  };
  try {
    // tenta PATCH primeiro; se não existir, usa PUT
    try {
      await apiFetch(`/api/usuarios/${editUser.id}`, { method: 'PATCH', body: JSON.stringify(body) });
    } catch (patchErr: any) {
      if (patchErr.message?.includes('404') || patchErr.message?.includes('405')) {
        await apiFetch(`/api/usuarios/${editUser.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        throw patchErr;
      }
    }
    toastSuccess('Usuário atualizado!');
    setUserDialog(false);
    setEditUser({});
    await loadUsuarios();
  } catch (e: any) {
    if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao atualizar usuário.');
  }
};

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;
    try {
      await apiFetch(`/api/regras/${id}`, { method: 'DELETE' });
      toastSuccess('Regra excluída!');
      loadRegras();
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao excluir regra.');
    }
  };

  const handleEditRule = async () => {
  if (!editRule.id || !editRule.area || !editRule.curso_id) { 
    toastError('Preencha os campos obrigatórios.'); 
    return; 
  }
  
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
    toastSuccess('Regra atualizada com sucesso!');
    setRuleDialog(false);
    setEditRule({});
    loadRegras();
  } catch (e: any) {
    if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao atualizar regra.');
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

  // Funções para correção de submissão
  const openCorrecaoDialog = (sub: Submissao) => {
    setCorrecaoSubmissao(sub);
    setCorrecaoObs('');
    setCorrecaoDialog(true);
  };

  const openApproveDialog = (sub: Submissao) => {
    setApproveSubmissao(sub);
    setApproveHoras(sub.horas_solicitadas || sub.carga_horaria_solicitada || 0);
    setApproveDialog(true);
  };

  const handleCorrecao = async () => {
    if (!correcaoSubmissao || !correcaoObs.trim()) {
      toastError('Observação é obrigatória para solicitar correção.');
      return;
    }
    try {
      await apiFetch(`/api/submissoes/${correcaoSubmissao.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'correcao', observacao: correcaoObs }),
      });
      toastSuccess('Correção solicitada com sucesso!');
      setCorrecaoDialog(false);
      setCorrecaoSubmissao(null);
      setCorrecaoObs('');
      await Promise.all([loadSubmissoes(), loadDashboard()]);
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao solicitar correção.');
    }
  };

  // Função para resetar senha
  const handleResetSenha = async () => {
    if (!resetSenhaUser) return;
    setResetSenhaLoading(true);
    const novaSenha = generateSecurePassword();
    try {
      await apiFetch(`/api/usuarios/${resetSenhaUser.id}/reset-senha`, {
        method: 'POST',
        body: JSON.stringify({ novaSenha }),
      });
      toastSuccess(`Senha resetada!`);
      setResetSenhaDialog(false);
      setResetSenhaGerada(novaSenha);
      setResetSenhaUser(null);
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao resetar senha.');
    } finally {
      setResetSenhaLoading(false);
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

  // ─── FIX: usa 'welcomed_admin' corretamente ───────────────────────────────
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
    <div className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]" style={{ background: colors.cardBg, border: `1px solid ${color}22`, boxShadow: `0 0 25px -10px ${color}33` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <span className="text-xs font-display tracking-wider uppercase" style={{ color: colors.labelColor }}>{label}</span>
      </div>
      <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
      {sub && <p className="text-[11px] mt-1 font-mono" style={{ color: colors.labelColor }}>{sub}</p>}
    </div>
  );


  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pendente: { bg: 'hsla(38, 92%, 50%, 0.12)', text: 'hsl(38, 92%, 60%)', border: 'hsla(38, 92%, 50%, 0.3)' },
    aprovado: { bg: 'hsla(152, 60%, 40%, 0.12)', text: 'hsl(152, 60%, 55%)', border: 'hsla(152, 60%, 40%, 0.3)' },
    reprovado: { bg: 'hsla(0, 72%, 50%, 0.12)', text: 'hsl(0, 72%, 60%)', border: 'hsla(0, 72%, 50%, 0.3)' },
    correcao: { bg: 'hsla(45, 95%, 50%, 0.12)', text: 'hsl(45, 95%, 55%)', border: 'hsla(45, 95%, 50%, 0.3)' },
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
                setSearchTerm('');
                setStatusFilter('all');
                setCursoFilter('all');
                setRoleFilter('all');
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
                <div className="rounded-xl p-6" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
                  <h3 className="text-sm mb-4" style={{ color: colors.textPrimary }}>Submissões por Curso</h3>
                  {(metrics?.por_curso || []).map((c, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: colors.textPrimary }}>{c.curso}</span>
                        <span style={{ color: accentBlue }}>{c.total}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${(c.total / Math.max(...metrics!.por_curso.map(x => x.total), 1)) * 100}%`, background: accentBlue }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-6" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
                  <h3 className="text-sm mb-4" style={{ color: colors.textPrimary }}>Submissões por Área</h3>
                  <div className="space-y-2">
                    {(metrics?.por_area || []).map((a, i) => (
                      <div key={i} className="flex justify-between py-2 px-3 rounded-lg" style={{ background: `${colors.cardBorder}` }}>
                        <span style={{ color: colors.textPrimary }}>{a.area}</span>
                        <span style={{ color: accentBlue }}>{a.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* COURSES */}
          {section === 'courses' && (
  <>
    <div className="flex justify-between">
      <h2 className="text-xl" style={{ color: colors.textPrimary }}>Gestão de Cursos</h2>
      <Button onClick={() => { setEditCourse({}); setCourseDialog(true); }} style={{ background: accentBlue }}>
        <Plus className="h-4 w-4 mr-2" /> Novo Curso
      </Button>
    </div>
    <div className="rounded-xl overflow-hidden" style={{ background: colors.cardBg }}>
      <table className="w-full">
        <thead style={{ background: colors.tableHeaderBg }}>
          <tr>
            <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Nome</th>
            <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Carga Horária</th>
            <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {cursos.map(c => (
            <tr key={c.id} className="border-b" style={{ borderColor: colors.cardBorder }}>
              <td className="px-5 py-4" style={{ color: colors.textPrimary }}>{c.nome}</td>
              <td className="px-5 py-4" style={{ color: accentBlue }}>{c.carga_horaria_minima}h</td>
              <td className="px-5 py-4">
                {/* ✅ CORRETO: Botões de Editar e Excluir curso */}
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
                {/* FIX: Input de busca com texto branco */}
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={inputStyle}
                />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger style={{ ...inputStyle, width: 150 }}><SelectValue placeholder="Perfil" /></SelectTrigger>
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
              <div className="rounded-xl overflow-hidden" style={{ background: colors.cardBg }}>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead style={{ background: colors.tableHeaderBg }}>
                    <tr>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Nome/Email</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Perfil</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Curso</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsuarios.map(u => (
                      <tr key={u.id} className="border-b" style={{ borderColor: colors.cardBorder }}>
                        <td className="px-5 py-4">
                          <p style={{ color: colors.textPrimary }}>{u.nome}</p>
                          <p className="text-xs" style={{ color: colors.labelColor }}>{u.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <Badge style={{ color: u.perfil === 'coordenador' ? accentOrange : accentBlue }}>{u.perfil}</Badge>
                        </td>
                        <td className="px-5 py-4" style={{ color: colors.textPrimary }}>{u.curso_nome || '-'}</td>
                        <td className="px-5 py-4">
                          <button onClick={() => { setEditUser(u); setUserDialog(true); }} className="mr-2" style={{ color: accentBlue }}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => { setResetSenhaUser(u); setResetSenhaDialog(true); }} className="mr-2" style={{ color: accentOrange }} title="Resetar Senha">
                            <KeyRound className="h-4 w-4" />
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
            </div>
          )}

          {/* VALIDATION */}
{section === 'validation' && (
  <div className="space-y-4">
    <div className="flex gap-2">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger style={{ ...inputStyle, width: 150 }}><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pendente">Pendentes</SelectItem>
          <SelectItem value="aprovado">Aprovadas</SelectItem>
          <SelectItem value="reprovado">Reprovadas</SelectItem>
          <SelectItem value="correcao">Correção</SelectItem>
        </SelectContent>
      </Select>
      <Select value={cursoFilter} onValueChange={setCursoFilter}>
        <SelectTrigger style={{ ...inputStyle, width: 200 }}><SelectValue placeholder="Curso" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {cursos.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    <div className="rounded-xl overflow-hidden" style={{ background: colors.cardBg }}>
      <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead style={{ background: colors.tableHeaderBg }}>
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
                <tr className="border-b" style={{ borderColor: colors.cardBorder }}>
                  <td className="px-5 py-4" style={{ color: colors.textPrimary }}>{sub.aluno_nome}</td>
                  <td className="px-5 py-4" style={{ color: colors.labelColor }}>{sub.curso_nome}</td>
                  <td className="px-5 py-4" style={{ color: colors.labelColor }}>{sub.area}</td>
                  <td className="px-5 py-4" style={{ color: accentBlue }}>{sub.horas_solicitadas || sub.carga_horaria_solicitada || 0}h</td>
                  <td className="px-5 py-4"><Badge style={{ background: sc.bg, color: sc.text }}>{sub.status}</Badge></td>
                  <td className="px-5 py-4">
                    <button 
                      onClick={() => toggleExpand(sub.id)} 
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                      style={{ 
                        background: isExpanded ? `${accentBlue}22` : 'transparent',
                        border: `1px solid ${isExpanded ? accentBlue : 'transparent'}`,
                        color: isExpanded ? accentBlue : colors.labelColor 
                      }}
                      title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={6} className="px-8 py-6 bg-black/20">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="mb-2" style={{ color: colors.textPrimary }}>Descrição: {sub.descricao || '-'}</p>
                          {(sub.status === 'pendente' || sub.status === 'correcao') ? (
                            <div className="flex gap-2 flex-wrap">
                              <Button onClick={() => handleStatusChange(sub.id, 'reprovado')} style={{ background: 'hsla(0, 72%, 50%, 0.2)', color: 'hsl(0, 72%, 60%)' }}>
                                <X className="h-4 w-4 mr-2" /> Reprovar
                              </Button>
                              <Button onClick={() => openCorrecaoDialog(sub)} style={{ background: 'hsla(45, 95%, 50%, 0.2)', color: 'hsl(45, 95%, 55%)' }}>
                                <AlertTriangle className="h-4 w-4 mr-2" /> Correção
                              </Button>
                              <Button onClick={() => openApproveDialog(sub)} style={{ background: 'hsla(152, 60%, 40%, 0.2)', color: 'hsl(152, 60%, 55%)' }}>
                                <Check className="h-4 w-4 mr-2" /> Aprovar
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm" style={{ color: colors.labelColor }}>
                              {sub.status === 'aprovado'
                                ? `✅ Aprovado em ${sub.data_validacao ? new Date(sub.data_validacao).toLocaleDateString() : '—'}`
                                : `❌ Reprovado em ${sub.data_validacao ? new Date(sub.data_validacao).toLocaleDateString() : '—'}`
                              }
                            </p>
                          )}
                        </div>
                        <div>
                          {loadingCert ? (
                            <p style={{ color: colors.textPrimary }}>Carregando certificado...</p>
                          ) : certData?.url_arquivo ? (
                            <div className="space-y-3">
                              <a
                                href={certData.url_arquivo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg hover:opacity-80 transition-colors w-fit"
                                style={{ background: `${colors.cardBorder}`, border: `1px solid ${colors.cardBorder}`, color: colors.textPrimary }}
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
  </div>
)}

          {/* RULES */}
          {section === 'rules' && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl" style={{ color: colors.textPrimary }}>Regras de Atividades</h2>
                <Button onClick={() => { setEditRule({}); setRuleDialog(true); }} style={{ background: accentBlue }}>
                  <Plus className="h-4 w-4 mr-2" /> Nova Regra
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regras.map(r => (
                  <div key={r.id} className="p-5 rounded-xl relative" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
                    <div className="absolute top-3 right-3 flex gap-1">
                      {/* FIX: Botão editar passa exige_comprovante_str corretamente */}
                      <button
                        onClick={() => {
                          setEditRule({
                            ...r,
                            exige_comprovante_str: r.exige_comprovante ? 'sim' : 'nao',
                          });
                          setRuleDialog(true);
                        }}
                        style={{ color: accentBlue }}
                        title="Editar regra"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteRule(r.id)} style={{ color: 'hsl(0, 72%, 60%)' }} title="Excluir regra">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <h4 className="text-lg mb-1 pr-16" style={{ color: colors.textPrimary }}>{r.area}</h4>
                    <p className="text-xs mb-2" style={{ color: colors.labelColor }}>{r.curso_nome}</p>
                    <p className="text-sm mb-2" style={{ color: accentBlue }}>Limite: {r.limite_horas}h</p>
                    <Badge style={{
                      background: r.exige_comprovante ? 'hsla(152, 60%, 40%, 0.15)' : 'hsla(220, 40%, 30%, 0.4)',
                      color: r.exige_comprovante ? 'hsl(152, 60%, 55%)' : colors.labelColor,
                      border: `1px solid ${r.exige_comprovante ? 'hsla(152,60%,40%,0.3)' : 'transparent'}`,
                    }}>
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
                <h2 className="text-xl" style={{ color: colors.textPrimary }}>Vínculos de Coordenadores</h2>
                <Button onClick={() => setCoordDialog(true)} style={{ background: accentBlue }}>
                  <Link2 className="h-4 w-4 mr-2" /> Novo Vínculo
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: colors.cardBg }}>
                <table className="w-full">
                  <thead style={{ background: colors.tableHeaderBg }}>
                    <tr>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Coordenador</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Curso</th>
                      <th className="text-left px-5 py-3 text-xs" style={{ color: accentBlue }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coordCursos.map(c => (
                      <tr key={c.id} className="border-b" style={{ borderColor: colors.cardBorder }}>
                        <td className="px-5 py-4" style={{ color: colors.textPrimary }}>{c.coordenador_nome}</td>
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
            {/* SETTINGS */}
{section === 'settings' && (
  <div className="space-y-6">
    <h2 className="text-xl flex items-center gap-2" style={{ color: colors.textPrimary }}>
      <Settings className="h-5 w-5" />
      Configurações do Sistema
    </h2>
    
    {/* Configurações de Email */}
    <div className="rounded-xl p-6" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
      <h3 className="text-lg mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
        <Mail className="h-5 w-5" style={{ color: accentBlue }} />
        Configurações de Email
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Servidor SMTP</label>
          <Input 
            placeholder="smtp.gmail.com" 
            value={emailConfig.host}
            onChange={e => setEmailConfig({...emailConfig, host: e.target.value})}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Porta</label>
          <Input 
            type="number"
            placeholder="587" 
            value={emailConfig.port}
            onChange={e => setEmailConfig({...emailConfig, port: Number(e.target.value)})}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Email Remetente</label>
          <Input 
            placeholder="senac@exemplo.com" 
            value={emailConfig.user}
            onChange={e => setEmailConfig({...emailConfig, user: e.target.value})}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Senha de App</label>
          <Input 
            type="password"
            placeholder="••••••••" 
            value={emailConfig.pass}
            onChange={e => setEmailConfig({...emailConfig, pass: e.target.value})}
            style={inputStyle}
          />
        </div>
        <div className="col-span-2">
          <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Nome do Remetente</label>
          <Input 
            placeholder="SGC SENAC <senac@exemplo.com>" 
            value={emailConfig.from}
            onChange={e => setEmailConfig({...emailConfig, from: e.target.value})}
            style={inputStyle}
          />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input 
            type="checkbox" 
            id="email_ativo"
            checked={emailConfig.ativo}
            onChange={e => setEmailConfig({...emailConfig, ativo: e.target.checked})}
            className="w-4 h-4"
          />
          <label htmlFor="email_ativo" className="text-sm" style={{ color: colors.textPrimary }}>Envio de emails ativo</label>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          onClick={saveEmailConfig}
          disabled={loadingConfig}
          style={{ background: accentBlue }}
        >
          <Save className="h-4 w-4 mr-2" />
          {loadingConfig ? 'Salvando...' : 'Salvar Configurações'}
        </Button>

        <Button
          onClick={testEmailConfig}
          disabled={testingEmail}
          variant="outline"
          style={{ borderColor: accentOrange, color: accentOrange }}
        >
          <Mail className="h-4 w-4 mr-2" />
          {testingEmail ? 'Enviando...' : 'Enviar Email de Teste'}
        </Button>
      </div>
      
      <p className="text-xs mt-4" style={{ color: colors.labelColor }}>
        ⚠️ Para Gmail, use "smtp.gmail.com" na porta 587 e uma <strong>senha de app</strong>.
      </p>
    </div>

    {/* Configurações do Sistema */}
    <div className="rounded-xl p-6" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
      <h3 className="text-lg mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
        <Globe className="h-5 w-5" style={{ color: accentBlue }} />
        Configurações do Sistema
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Nome do Sistema</label>
          <Input 
            placeholder="SGC - Sistema de Gestão de Certificados" 
            value={sistemaConfig.nome_sistema}
            onChange={e => setSistemaConfig({...sistemaConfig, nome_sistema: e.target.value})}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Instituição</label>
          <Input 
            placeholder="SENAC" 
            value={sistemaConfig.instituicao}
            onChange={e => setSistemaConfig({...sistemaConfig, instituicao: e.target.value})}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>URL do Frontend</label>
          <Input 
            placeholder="https://seu-app.vercel.app" 
            value={sistemaConfig.frontend_url}
            onChange={e => setSistemaConfig({...sistemaConfig, frontend_url: e.target.value})}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>URL da Logo</label>
          <Input 
            placeholder="/assets/logo-white.png" 
            value={sistemaConfig.logo_url}
            onChange={e => setSistemaConfig({...sistemaConfig, logo_url: e.target.value})}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Cor Primária</label>
          <div className="flex gap-2">
            <Input 
              placeholder="hsl(210, 80%, 55%)" 
              value={sistemaConfig.cor_primaria}
              onChange={e => setSistemaConfig({...sistemaConfig, cor_primaria: e.target.value})}
              style={inputStyle}
            />
            <div 
              className="w-10 h-10 rounded border"
              style={{ background: sistemaConfig.cor_primaria || accentBlue }}
            />
          </div>
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Cor Secundária</label>
          <div className="flex gap-2">
            <Input 
              placeholder="hsl(30, 95%, 55%)" 
              value={sistemaConfig.cor_secundaria}
              onChange={e => setSistemaConfig({...sistemaConfig, cor_secundaria: e.target.value})}
              style={inputStyle}
            />
            <div 
              className="w-10 h-10 rounded border"
              style={{ background: sistemaConfig.cor_secundaria || accentOrange }}
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <Button 
          onClick={saveSistemaConfig} 
          disabled={loadingConfig}
          style={{ background: accentBlue }}
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  </div>
)}
        </main>

        <Footer />
      </div>

      {/* ─── DIALOGS ─────────────────────────────────────────────────────────── */}

      {/* Dialog: Curso */}
      <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader><DialogTitle style={{ color: colors.textPrimary }}>{editCourse.id ? 'Editar Curso' : 'Novo Curso'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* FIX: texto branco nos inputs */}
            <Input placeholder="Nome do curso" value={editCourse.nome || ''} onChange={e => setEditCourse({ ...editCourse, nome: e.target.value })} style={inputStyle} />
            <Input type="number" placeholder="Carga horária mínima (ex: 200)" value={editCourse.carga_horaria_minima || ''} onChange={e => setEditCourse({ ...editCourse, carga_horaria_minima: Number(e.target.value) })} style={inputStyle} />
          </div>
          <DialogFooter>
            <Button onClick={() => setCourseDialog(false)} variant="outline">Cancelar</Button>
            <Button onClick={handleSaveCourse} style={{ background: accentBlue }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Usuário */}
      <Dialog open={userDialog} onOpenChange={setUserDialog}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader><DialogTitle style={{ color: colors.textPrimary }}>{editUser.id ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Nome" value={editUser.id ? (editUser.nome || '') : newUser.nome} onChange={e => editUser.id ? setEditUser({ ...editUser, nome: e.target.value }) : setNewUser({ ...newUser, nome: e.target.value })} style={inputStyle} />
            <Input placeholder="Email" value={editUser.id ? (editUser.email || '') : newUser.email} onChange={e => editUser.id ? setEditUser({ ...editUser, email: e.target.value }) : setNewUser({ ...newUser, email: e.target.value })} style={inputStyle} />
            {!editUser.id && (
  <div className="col-span-2 space-y-2">
    <Input 
      type="password" 
      placeholder="Senha" 
      value={newUser.senha} 
      onChange={e => setNewUser({ ...newUser, senha: e.target.value })} 
      style={inputStyle} 
    />
    <Button
      type="button"
      onClick={() => {
        const senhaForte = generateSecurePassword();
        setNewUser({ ...newUser, senha: senhaForte });
        toast.success('Senha forte gerada!', {
          description: 'A senha foi preenchida automaticamente.'
        });
      }}
      variant="outline"
      size="sm"
      className="w-full"
      style={{ 
        borderColor: accentOrange,
        color: accentOrange
      }}
    >
      🔐 Gerar Senha Forte
    </Button>
  </div>
)}
            <Input placeholder="Matrícula" value={editUser.id ? (editUser.matricula || '') : newUser.matricula} onChange={e => editUser.id ? setEditUser({ ...editUser, matricula: e.target.value }) : setNewUser({ ...newUser, matricula: e.target.value })} style={inputStyle} />
            <Select value={editUser.id ? (editUser.perfil || 'aluno') : newUser.perfil} onValueChange={v => editUser.id ? setEditUser({ ...editUser, perfil: v }) : setNewUser({ ...newUser, perfil: v })}>
              <SelectTrigger style={inputStyle}><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="aluno">Aluno</SelectItem><SelectItem value="coordenador">Coordenador</SelectItem></SelectContent>
            </Select>
            <Select value={editUser.id ? (editUser.curso_id || '') : newUser.curso_id} onValueChange={v => editUser.id ? setEditUser({ ...editUser, curso_id: v }) : setNewUser({ ...newUser, curso_id: v })}>
              <SelectTrigger style={inputStyle}><SelectValue placeholder="Curso" /></SelectTrigger>
              <SelectContent>{cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={() => { setUserDialog(false); setEditUser({}); }} variant="outline">Cancelar</Button>
            <Button onClick={editUser.id ? handleEditUser : handleCreateUser} style={{ background: accentBlue }}>{editUser.id ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Regra — FIX: título dinâmico + todos os inputs com texto branco */}
      <Dialog open={ruleDialog} onOpenChange={(open) => { setRuleDialog(open); if (!open) setEditRule({}); }}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>{editRule.id ? 'Editar Regra' : 'Nova Regra'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Área de Atividade</label>
              <Input placeholder="Ex: Extensão, Pesquisa..." value={editRule.area || ''} onChange={e => setEditRule({ ...editRule, area: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Limite de Horas</label>
              <Input type="number" placeholder="Ex: 60" value={editRule.limite_horas || ''} onChange={e => setEditRule({ ...editRule, limite_horas: Number(e.target.value) })} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Exige Comprovante?</label>
              <Select value={editRule.exige_comprovante_str || ''} onValueChange={v => setEditRule({ ...editRule, exige_comprovante_str: v })}>
                <SelectTrigger style={inputStyle}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Curso</label>
              <Select value={editRule.curso_id || ''} onValueChange={v => setEditRule({ ...editRule, curso_id: v })}>
                <SelectTrigger style={inputStyle}><SelectValue placeholder="Selecione o curso..." /></SelectTrigger>
                <SelectContent>{cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { setRuleDialog(false); setEditRule({}); }} variant="outline">Cancelar</Button>
            <Button onClick={editRule.id ? handleEditRule : handleSaveRule} style={{ background: accentBlue }}>
              {editRule.id ? 'Salvar Alterações' : 'Criar Regra'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Vínculo Coordenador */}
      <Dialog open={coordDialog} onOpenChange={setCoordDialog}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader><DialogTitle style={{ color: colors.textPrimary }}>Vincular Coordenador</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select value={newCoord.usuario_id} onValueChange={v => setNewCoord({ ...newCoord, usuario_id: v })}>
              <SelectTrigger style={inputStyle}><SelectValue placeholder="Coordenador" /></SelectTrigger>
              <SelectContent>{coordenadores.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={newCoord.curso_id} onValueChange={v => setNewCoord({ ...newCoord, curso_id: v })}>
              <SelectTrigger style={inputStyle}><SelectValue placeholder="Curso" /></SelectTrigger>
              <SelectContent>{cursos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateCoordVinculo} style={{ background: accentBlue }}>Vincular</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!createdUserData} onOpenChange={() => setCreatedUserData(null)}>
  <DialogContent style={{ background: 'hsl(220, 50%, 12%)', border: `1px solid ${accentBlue}33` }}>
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2" style={{ color: colors.textPrimary }}>
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="h-5 w-5 text-green-500" />
        </div>
        Usuário Criado com Sucesso!
      </DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-yellow-400 text-sm mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          GUARDE ESTAS INFORMAÇÕES!
        </p>
        
        <div className="space-y-3">
          <div>
            <p className="text-gray-400 text-xs mb-1">Nome:</p>
            <p className="font-medium" style={{ color: colors.textPrimary }}>{createdUserData?.nome}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-xs mb-1">Email:</p>
            <p className="text-blue-400 font-mono text-sm">{createdUserData?.email}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-xs mb-1">Senha:</p>
            <div className="flex items-center gap-2">
              <p className="text-green-400 font-mono text-sm bg-black/30 px-3 py-1 rounded">
                {createdUserData?.senha}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-gray-400 text-xs text-center">
        ⚠️ Esta senha <span className="text-yellow-400 font-bold">não será mostrada novamente</span>.
      </p>
    </div>
    
    <DialogFooter className="flex flex-col sm:flex-row gap-2">
  <Button 
    onClick={() => {
      const dados = `Nome: ${createdUserData?.nome}\nEmail: ${createdUserData?.email}\nSenha: ${createdUserData?.senha}`;
      navigator.clipboard?.writeText(dados);
      toastSuccess('Dados copiados para a área de transferência!');
    }}
    variant="outline"
    style={{ borderColor: accentBlue, color: accentBlue }}
    className="flex-1"
  >
    📋 Copiar Dados
  </Button>
  
  <Button 
    onClick={() => {
      const assunto = `Suas credenciais de acesso - SGC SENAC`;
      const corpo = `Olá ${createdUserData?.nome}!

Suas credenciais de acesso ao Sistema de Gestão de Certificados (SGC) foram criadas com sucesso!

📧 Email: ${createdUserData?.email}
🔐 Senha: ${createdUserData?.senha}

🌐 Acesse o sistema em: ${window.location.origin}

📌 Recomendamos que você troque sua senha no primeiro acesso por segurança.

Atenciosamente,
Equipe SENAC`;
      
      window.open(`mailto:${createdUserData?.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`);
      
      toast.success('Cliente de email aberto!', {
        description: 'Verifique se os dados foram preenchidos corretamente.',
        style: toastStyle
      });
    }}
    variant="outline"
    style={{ borderColor: accentOrange, color: accentOrange }}
    className="flex-1"
  >
    📧 Enviar por Email
  </Button>
  
  {/* 🆕 ADICIONE ESTE BOTÃO */}
  <Button 
    onClick={() => setCreatedUserData(null)} 
    style={{ background: accentBlue }}
    className="flex-1"
  >
    OK
  </Button>
</DialogFooter>
  </DialogContent>
</Dialog>

      {/* Dialog: Solicitar Correção */}
      <Dialog open={correcaoDialog} onOpenChange={setCorrecaoDialog}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Solicitar Correção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.labelColor }}>
              Aluno: <span style={{ color: colors.textPrimary }}>{correcaoSubmissao?.aluno_nome}</span>
            </p>
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Observação para o aluno</label>
              <Textarea
                placeholder="Descreva o que precisa ser corrigido..."
                value={correcaoObs}
                onChange={e => setCorrecaoObs(e.target.value)}
                rows={4}
                style={inputStyle}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCorrecaoDialog(false)} variant="outline">Cancelar</Button>
            <Button onClick={handleCorrecao} style={{ background: 'hsl(45, 95%, 50%)', color: 'black' }}>
              Solicitar Correção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Aprovar com horas */}
      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Aprovar Submissão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.labelColor }}>
              Aluno: <span style={{ color: colors.textPrimary }}>{approveSubmissao?.aluno_nome}</span>
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
                Solicitado: {approveSubmissao?.horas_solicitadas || approveSubmissao?.carga_horaria_solicitada || 0}h
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setApproveDialog(false)} variant="outline">Cancelar</Button>
            <Button
              onClick={() => {
                if (approveSubmissao) {
                  handleStatusChange(approveSubmissao.id, 'aprovado', approveHoras);
                  setApproveDialog(false);
                }
              }}
              style={{ background: 'hsla(152, 60%, 40%, 0.8)', color: 'hsl(152, 60%, 55%)' }}
            >
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Nova Senha Gerada */}
      <Dialog open={!!resetSenhaGerada} onOpenChange={() => setResetSenhaGerada(null)}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Nova Senha Gerada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.labelColor }}>
              Copie a nova senha e envie ao usuário por um canal seguro.
            </p>
            <div className="p-4 rounded-lg text-center" style={{ background: 'hsla(152, 60%, 40%, 0.1)', border: '1px solid hsla(152, 60%, 40%, 0.3)' }}>
              <p className="font-mono text-lg font-bold tracking-widest" style={{ color: 'hsl(152, 60%, 55%)' }}>
                {resetSenhaGerada}
              </p>
            </div>
            <p className="text-xs" style={{ color: colors.labelColor }}>
              Esta senha <strong>não será armazenada</strong> nem mostrada novamente.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(resetSenhaGerada || '');
                toastSuccess('Senha copiada!');
              }}
              style={{ borderColor: accentBlue, color: accentBlue }}
            >
              Copiar
            </Button>
            <Button
              onClick={() => setResetSenhaGerada(null)}
              style={{ background: accentOrange }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Resetar Senha */}
      <Dialog open={resetSenhaDialog} onOpenChange={setResetSenhaDialog}>
        <DialogContent style={{ background: colors.panelBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Resetar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ background: 'hsla(45, 95%, 50%, 0.1)', border: '1px solid hsla(45, 95%, 50%, 0.3)' }}>
              <p className="text-sm flex items-center gap-2" style={{ color: 'hsl(45, 95%, 60%)' }}>
                <AlertTriangle className="h-4 w-4" />
                Atenção: Uma nova senha será gerada e enviada para o email do usuário.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm" style={{ color: colors.labelColor }}>
                Usuário: <span style={{ color: colors.textPrimary }}>{resetSenhaUser?.nome}</span>
              </p>
              <p className="text-sm" style={{ color: colors.labelColor }}>
                Email: <span style={{ color: accentBlue }}>{resetSenhaUser?.email}</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setResetSenhaDialog(false)} variant="outline">Cancelar</Button>
            <Button onClick={handleResetSenha} disabled={resetSenhaLoading} style={{ background: accentOrange }}>
              <KeyRound className="h-4 w-4 mr-2" />
              {resetSenhaLoading ? 'Resetando...' : 'Resetar Senha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Admin;