import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useapptheme';
import { useIsMobile } from '@/hooks/use-mobile';
import ThemeSwitcher from '@/components/themeswitcher';
import {
  LogOut, BarChart3, Send, FileText,
  Clock, CheckCircle2, XCircle, AlertTriangle,
  CloudUpload, Upload, Menu, ChevronRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

// Interfaces
interface AlunoCurso {
  id: string;
  curso_id: string;
  curso_nome: string;
  carga_horaria_minima?: number;
}

interface DashboardAluno {
  total_submissoes: number;
  pendentes: number;
  aprovadas: number;
  reprovadas: number;
  total_horas_aprovadas: number;
  carga_horaria_minima: number;
  progresso_percentual: number;
  horas_por_area: { area: string; horas: number; limite: number }[];
}

interface Regra {
  id: string;
  area: string;
  limite_horas: number;
  curso_id: string;
}

interface Submissao {
  id: string;
  data_envio: string;
  tipo?: string;
  descricao?: string;
  horas_solicitadas?: number;
  status: string;
  observacao?: string;
}

const navItems = [
  { id: 'progress', label: 'Meu Progresso', icon: BarChart3 },
  { id: 'submit', label: 'Nova Submissão', icon: Send },
  { id: 'history', label: 'Histórico', icon: FileText },
];

const Aluno = () => {
  const navigate = useNavigate();
  const { user, token, signOut } = useAuth();
  const { colors } = useAppTheme();
  const isMobile = useIsMobile();

  const accentGreen = 'hsl(160, 70%, 55%)';
  const accentGreenDim = 'hsl(160, 70%, 40%)';

  const inputStyle = {
    background: colors.inputBg,
    color: colors.textPrimary,
    border: `1px solid ${colors.inputBorder}`,
  };

  // Estado para sidebar mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados principais
  const [activeSection, setActiveSection] = useState('progress');
  const [cursos, setCursos] = useState<AlunoCurso[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<string>('');
  const [dashboard, setDashboard] = useState<DashboardAluno | null>(null);
  const [step, setStep] = useState(1);
  const [regras, setRegras] = useState<Regra[]>([]);
  const [subForm, setSubForm] = useState({ regra_id: '', carga_horaria_solicitada: '', tipo: '', descricao: '' });
  const [createdSubId, setCreatedSubId] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);

  const userName = user?.nome || 'Aluno';

  // Hooks de autenticação - definidos ANTES dos useEffect
  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const authHeadersRaw = useCallback(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  // Função para mapear campos da API com fallback
  const mapSubmissao = useCallback((s: any): Submissao => ({
    id: s.id,
    data_envio: s.data_envio || s.created_at || s.dataCriacao || new Date().toISOString(),
    tipo: s.tipo || s.type || s.categoria || '—',
    descricao: s.descricao || s.description || '',
    horas_solicitadas: s.horas_solicitadas || s.carga_horaria_solicitada || s.carga_horaria || 0,
    status: s.status || 'pendente',
    observacao: s.observacao || s.observacoes || '',
  }), []);

  // Data Fetching
  const fetchCursos = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/alunos-cursos`, { headers: authHeaders() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.vinculos || data.cursos || [];

      // Mapeamento robusto
      const mappedList = list.map((item: any) => ({
        id: item.id,
        curso_id: item.curso_id,
        curso_nome: item.curso_nome || item.nome_curso || item.curso?.nome || '—',
        carga_horaria_minima: item.carga_horaria_minima || item.cargaMinima || 200,
      }));

      setCursos(mappedList);
      if (mappedList.length > 0 && !selectedCurso) setSelectedCurso(mappedList[0].curso_id);
    } catch { toastError('Erro ao conectar com o servidor.'); }
  }, [token, selectedCurso, authHeaders]);

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const url = selectedCurso ? `${API_BASE}/api/dashboard/aluno?curso_id=${selectedCurso}` : `${API_BASE}/api/dashboard/aluno`;
      const res = await fetch(url, { headers: authHeaders() });
      const data = await res.json();

      // Mapeamento robusto para métricas
      const metricas = data.metricas || data;
      setDashboard({
        total_submissoes: metricas.total_submissoes || 0,
        pendentes: metricas.pendentes || 0,
        aprovadas: metricas.aprovadas || 0,
        reprovadas: metricas.reprovadas || 0,
        total_horas_aprovadas: metricas.total_horas_aprovadas || metricas.horas_aprovadas || 0,
        carga_horaria_minima: metricas.carga_horaria_minima || metricas.cargaMinima || 200,
        progresso_percentual: metricas.progresso_percentual || metricas.progresso || 0,
        horas_por_area: metricas.horas_por_area || [],
      });
    } catch { toastError('Erro ao carregar dashboard.'); }
    setIsLoading(false);
  }, [token, selectedCurso, authHeaders]);

  const fetchRegras = useCallback(async () => {
    if (!token || !selectedCurso) return;
    try {
      const res = await fetch(`${API_BASE}/api/regras?curso_id=${selectedCurso}`, { headers: authHeaders() });
      const data = await res.json();
      setRegras(Array.isArray(data) ? data : data.regras || []);
    } catch { toastError('Erro ao carregar regras do curso.'); }
  }, [token, selectedCurso, authHeaders]);

  const fetchSubmissoes = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/submissoes`, { headers: authHeaders() });
      const data = await res.json();
      const raw = Array.isArray(data) ? data : data.submissoes || data.data || [];
      setSubmissoes(raw.map(mapSubmissao));
    } catch { toastError('Erro ao carregar histórico.'); }
    setIsLoading(false);
  }, [token, authHeaders, mapSubmissao]);

  // Verificação de autenticação inicial
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken') || localStorage.getItem('token');
    const storedUser = localStorage.getItem('usuario') || localStorage.getItem('userData');

    if (!storedToken || !storedUser) {
      navigate('/login/aluno');
      return;
    }

    try {
      JSON.parse(storedUser);
    } catch {
      navigate('/login/aluno');
    }
  }, [navigate]);

  // Carregamento inicial
  useEffect(() => {
    if (token) fetchCursos();
  }, [token, fetchCursos]);

  useEffect(() => {
    if (!token) return;
    if (activeSection === 'progress' && selectedCurso) fetchDashboard();
    if (activeSection === 'submit' && selectedCurso) fetchRegras();
    if (activeSection === 'history') fetchSubmissoes();
  }, [activeSection, selectedCurso, token, fetchDashboard, fetchRegras, fetchSubmissoes]);

  // Ações
  const handleStep1 = async () => {
    if (!subForm.regra_id || !subForm.carga_horaria_solicitada || !subForm.tipo) {
      toastError('Preencha os campos obrigatórios.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/submissoes`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          regra_id: subForm.regra_id,
          tipo: subForm.tipo,
          descricao: subForm.descricao,
          carga_horaria_solicitada: Number(subForm.carga_horaria_solicitada),
        }),
      });
      const data = await res.json();
      if (data.id) {
        setCreatedSubId(data.id);
        setStep(2);
        toastSuccess('Informações salvas! Agora envie o arquivo.');
      } else {
        toastError(data.error || data.mensagem || 'Erro ao processar envio.');
      }
    } catch { toastError('Falha na comunicação com o servidor.'); }
    setSubmitting(false);
  };

  const handleUpload = async () => {
    if (!file) { toastError('Selecione um arquivo.'); return; }
    if (file.size > 4 * 1024 * 1024) { toastError('Arquivo muito grande (máximo 4MB).'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('submissao_id', createdSubId);
      fd.append('arquivo', file);
      const res = await fetch(`${API_BASE}/api/certificados`, {
        method: 'POST',
        headers: authHeadersRaw(),
        body: fd,
      });
      if (res.ok) {
        toastSuccess('Certificado enviado! Aguarde a avaliação.');
        setStep(1);
        setSubForm({ regra_id: '', carga_horaria_solicitada: '', tipo: '', descricao: '' });
        setFile(null);
        setActiveSection('history');
      } else {
        const err = await res.json().catch(() => ({}));
        toastError(err.mensagem || err.error || 'Erro ao enviar arquivo.');
      }
    } catch { toastError('Erro na conexão de rede.'); }
    setSubmitting(false);
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

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    const configs: Record<string, JSX.Element> = {
      aprovado: (
        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />Aprovado
        </Badge>
      ),
      reprovado: (
        <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
          <XCircle className="h-3 w-3 mr-1" />Reprovado
        </Badge>
      ),
      pendente: (
        <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Clock className="h-3 w-3 mr-1" />Pendente
        </Badge>
      ),
      correcao: (
        <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          <AlertTriangle className="h-3 w-3 mr-1" />Correção
        </Badge>
      ),
    };
    return configs[s] || configs.pendente;
  };

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: colors.panelBg }}>
      {/* Mobile Header */}
      {isMobile && (
        <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{ background: colors.headerBg, borderBottom: `1px solid ${colors.headerBorder}` }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2">
            <Menu className="h-6 w-6" style={{ color: colors.sidebarTextActive }} />
          </button>
          <div className="flex items-center gap-3">
            <img src={logoWhite} alt="Logo Maestria" className="h-6 w-auto" style={{ filter: colors.logoFilter }} />
            <h1 className="text-xs uppercase tracking-widest font-display" style={{ color: colors.titleColor }}>Maestria Aluno</h1>
          </div>
          <ThemeSwitcher />
        </header>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="min-h-screen w-full flex">
        {/* Sidebar */}
        <aside
          className={`
            ${isMobile ? 'fixed left-0 top-0 h-full z-50 transform transition-transform duration-300' : ''}
            ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
            w-64 shrink-0 p-4
          `}
          style={{
            background: colors.sidebarBg,
            borderRight: `1px solid ${colors.sidebarBorder}`,
            ...(isMobile ? {} : { minHeight: '100vh' })
          }}
        >
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="self-end mb-4">
              <LogOut className="h-6 w-6" style={{ color: colors.sidebarText }} />
            </button>
          )}

          {!isMobile && (
            <div className="flex items-center gap-4 mb-6">
              <img src={logoWhite} alt="Logo Maestria" className="h-8 w-auto" style={{ filter: colors.logoFilter }} />
              <h1 className="font-display text-sm tracking-widest uppercase" style={{ color: colors.titleColor }}>Maestria Aluno</h1>
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); if (item.id === 'submit') setStep(1); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 border ${
                  activeSection === item.id ? '' : 'border-transparent'
                }`}
                style={activeSection === item.id ? {
                  background: 'hsla(160, 70%, 50%, 0.15)',
                  border: `1px solid ${accentGreen}`,
                  color: colors.sidebarTextActive,
                  boxShadow: '0 0 15px -5px hsla(160, 70%, 50%, 0.3)',
                } : { color: colors.labelColor }}
              >
                <item.icon className="h-4 w-4" style={activeSection === item.id ? { color: accentGreen } : {}} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-4 mt-4 border-t" style={{ borderColor: colors.sidebarBorder }}>
            {!isMobile && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${accentGreen}, ${accentGreenDim})` }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm" style={{ color: colors.sidebarTextActive }}>{userName}</p>
                  <p className="text-[10px]" style={{ color: colors.labelColor }}>Aluno</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs uppercase"
              style={{ background: 'hsla(0, 70%, 50%, 0.15)', border: '1px solid hsla(0, 70%, 50%, 0.3)', color: 'hsl(0, 70%, 65%)' }}
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Desktop Header */}
          {!isMobile && (
            <header className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-bold" style={{ color: colors.titleColor }}>
                {navItems.find(n => n.id === activeSection)?.label}
              </h1>
              <ThemeSwitcher />
            </header>
          )}

          {/* Progress Section */}
          {activeSection === 'progress' && (
            <>
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <>
                  {/* Seletor de curso */}
                  <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
                    <label className="text-xs uppercase mb-2 block" style={{ color: colors.labelColor }}>Selecione o Curso</label>
                    <Select value={selectedCurso} onValueChange={setSelectedCurso}>
                      <SelectTrigger style={inputStyle}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {cursos.map(c => (
                          <SelectItem key={c.curso_id} value={c.curso_id}>{c.curso_nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Card de progresso */}
                  <div className="rounded-xl p-6" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <h2 className="font-display text-lg tracking-wider uppercase" style={{ color: colors.titleColor }}>Seu Progresso</h2>
                      <span className="font-mono text-2xl font-bold" style={{ color: accentGreen }}>
                        {dashboard?.total_horas_aprovadas || 0}h <span className="text-sm font-normal" style={{ color: colors.labelColor }}>/ {dashboard?.carga_horaria_minima || 0}h</span>
                      </span>
                    </div>
                    <div className="relative h-4 rounded-full overflow-hidden" style={{ background: colors.inputBg }}>
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min(dashboard?.progresso_percentual || 0, 100)}%`,
                          background: `linear-gradient(90deg, ${accentGreenDim}, ${accentGreen})`,
                          boxShadow: '0 0 15px rgba(16,185,129,0.3)'
                        }}
                      />
                    </div>
                    <p className="text-xs mt-2" style={{ color: colors.labelColor }}>
                      {dashboard?.progresso_percentual?.toFixed(1) || 0}% completo
                    </p>
                  </div>

                  {/* Cards de métricas */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Envios', value: dashboard?.total_submissoes || 0, color: 'hsl(210, 80%, 55%)' },
                      { label: 'Pendentes', value: dashboard?.pendentes || 0, color: 'hsl(38, 92%, 55%)' },
                      { label: 'Aprovadas', value: dashboard?.aprovadas || 0, color: 'hsl(152, 60%, 45%)' },
                      { label: 'Reprovadas', value: dashboard?.reprovadas || 0, color: 'hsl(0, 72%, 55%)' },
                    ].map(m => (
                      <div key={m.label} className="rounded-xl p-5 border" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
                        <p className="text-[10px] font-display tracking-widest uppercase mb-1" style={{ color: m.color }}>{m.label}</p>
                        <p className="font-mono text-2xl font-bold" style={{ color: colors.titleColor }}>{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Horas por área */}
                  {dashboard?.horas_por_area && dashboard.horas_por_area.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {dashboard.horas_por_area.map((area) => (
                        <div key={area.area} className="rounded-xl p-5 border" style={{ background: colors.inputBg, borderColor: colors.inputBorder }}>
                          <p className="text-xs font-display mb-2" style={{ color: colors.labelColor }}>{area.area}</p>
                          <div className="font-mono text-lg font-bold" style={{ color: colors.titleColor }}>
                            {area.horas}h <span className="text-xs font-normal" style={{ color: colors.labelColor }}>/ {area.limite}h</span>
                          </div>
                          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: colors.cardBorder }}>
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min((area.horas / area.limite) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Submit Section */}
          {activeSection === 'submit' && (
            <div className="rounded-xl p-8" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Send className="h-5 w-5 text-emerald-400" />
                    <h2 className="uppercase font-display tracking-widest" style={{ color: colors.titleColor }}>Dados da Atividade</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-tighter" style={{ color: colors.labelColor }}>Área de Atuação</label>
                      <Select
                        value={subForm.regra_id}
                        onValueChange={(v) => {
                          const selectedRule = regras.find(r => r.id === v);
                          setSubForm({ ...subForm, regra_id: v, tipo: selectedRule?.area || '' });
                        }}
                      >
                        <SelectTrigger style={inputStyle}><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {regras.map(r => <SelectItem key={r.id} value={r.id}>{r.area}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Horas do Certificado</label>
                      <Input
                        type="number"
                        value={subForm.carga_horaria_solicitada}
                        onChange={(e) => setSubForm({ ...subForm, carga_horaria_solicitada: e.target.value })}
                        style={inputStyle}
                        placeholder="Ex: 40"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase" style={{ color: colors.labelColor }}>Descrição (opcional)</label>
                    <Input
                      value={subForm.descricao}
                      onChange={(e) => setSubForm({ ...subForm, descricao: e.target.value })}
                      style={inputStyle}
                      placeholder="Descreva a atividade..."
                    />
                  </div>
                  <Button
                    onClick={handleStep1}
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-500"
                  >
                    {submitting ? <Loader2 className="animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                    Próximo Passo
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-3">
                    <Upload className="h-5 w-5 text-emerald-400" />
                    <h2 className="uppercase font-display tracking-widest" style={{ color: colors.titleColor }}>Enviar Certificado</h2>
                  </div>

                  {/* Aviso sobre limite de tamanho */}
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'hsla(45, 95%, 50%, 0.1)', border: '1px solid hsla(45, 95%, 50%, 0.3)' }}>
                    <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: 'hsl(45, 95%, 55%)' }} />
                    <p className="text-xs" style={{ color: 'hsl(45, 95%, 70%)' }}>
                      Tamanho máximo do arquivo: <strong>4 MB</strong>. Formatos aceitos: PDF, JPG, PNG.
                    </p>
                  </div>

                  {/* Área de upload */}
                  <div
                    className={`relative p-8 border-2 border-dashed rounded-xl transition-all cursor-pointer ${dragActive ? 'border-emerald-500 bg-emerald-500/10' : ''}`}
                    style={{ borderColor: dragActive ? accentGreen : colors.inputBorder, background: colors.inputBg }}
                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const droppedFile = e.dataTransfer.files?.[0];
                      if (droppedFile) setFile(droppedFile);
                    }}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <CloudUpload className="h-12 w-12 mx-auto mb-4" style={{ color: file ? accentGreen : 'hsl(160, 70%, 40%)' }} />
                    {file ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium" style={{ color: accentGreen }}>
                          ✓ Arquivo selecionado
                        </p>
                        <p className="text-xs" style={{ color: colors.textPrimary }}>
                          {file.name}
                        </p>
                        <p className="text-[10px]" style={{ color: colors.labelColor }}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm" style={{ color: colors.textPrimary }}>
                          Arraste o arquivo aqui ou clique para selecionar
                        </p>
                        <p className="text-xs" style={{ color: colors.labelColor }}>
                          PDF, JPG ou PNG (máx. 4 MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Botão para trocar arquivo se já selecionado */}
                  {file && (
                    <div className="flex justify-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-xs underline"
                        style={{ color: colors.labelColor }}
                      >
                        Remover arquivo e selecionar outro
                      </button>
                    </div>
                  )}

                  <div className="flex gap-4 pt-2">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1"
                      style={{ borderColor: colors.cardBorder, color: colors.labelColor }}
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={submitting || !file}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                    >
                      {submitting ? <Loader2 className="animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                      Finalizar Envio
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Section */}
          {activeSection === 'history' && (
            <div className="rounded-xl border overflow-x-auto" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <table className="w-full text-left text-sm min-w-[500px]">
                  <thead style={{ background: colors.sidebarBg }}>
                    <tr className="text-[10px] uppercase font-display" style={{ color: accentGreen }}>
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Tipo</th>
                      <th className="px-6 py-4">Horas</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: colors.cardBorder }}>
                    {submissoes.map(s => (
                      <React.Fragment key={s.id}>
                        <tr className="hover:opacity-80 transition-colors">
                          <td className="px-6 py-4 font-mono" style={{ color: colors.textSecondary }}>
                            {new Date(s.data_envio).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4" style={{ color: colors.textPrimary }}>{s.tipo}</td>
                          <td className="px-6 py-4 font-bold" style={{ color: colors.titleColor }}>{s.horas_solicitadas}h</td>
                          <td className="px-6 py-4">{statusBadge(s.status)}</td>
                        </tr>
                        {/* Linha extra para observação de correção */}
                        {s.status.toLowerCase() === 'correcao' && s.observacao && (
                          <tr>
                            <td colSpan={4} className="px-6 py-3" style={{ background: 'hsla(45, 95%, 50%, 0.1)' }}>
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 mt-0.5" style={{ color: 'hsl(45, 95%, 55%)' }} />
                                <div>
                                  <p className="text-[10px] uppercase font-bold mb-1" style={{ color: 'hsl(45, 95%, 55%)' }}>
                                    Observação do Coordenador
                                  </p>
                                  <p className="text-sm" style={{ color: colors.textPrimary }}>{s.observacao}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {submissoes.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center" style={{ color: colors.labelColor }}>
                          Nenhuma submissão encontrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Aluno;