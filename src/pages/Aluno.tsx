import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext'; // Integrando o contexto
import {
  LogOut, BarChart3, Send, FileText,
  Clock, CheckCircle2, XCircle, AlertTriangle,
  CloudUpload, Upload, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import logoWhite from '@/assets/logo-white.png';

const API_BASE = 'https://back-end-banco-five.vercel.app';

// --- MANTENDO SEUS ESTILOS ORIGINAIS ---
const panelBg = 'hsl(220, 45%, 11%)';
const cardBg = 'hsla(220, 40%, 15%, 0.7)';
const cardBorder = 'hsla(200, 60%, 40%, 0.12)';
const inputBg = 'hsla(220, 40%, 18%, 0.8)';
const inputBorder = 'hsla(200, 80%, 50%, 0.15)';
const labelColor = 'hsl(220, 20%, 55%)';
const accentGreen = 'hsl(160, 70%, 55%)';
const accentGreenDim = 'hsl(160, 70%, 40%)';

// --- MANTENDO SUAS INTERFACES ---
interface AlunoCurso { id: string; curso_id: string; curso_nome: string; carga_horaria_minima?: number; }
interface DashboardAluno { total_submissoes: number; pendentes: number; aprovadas: number; reprovadas: number; total_horas_aprovadas: number; carga_horaria_minima: number; progresso_percentual: number; horas_por_area: { area: string; horas: number; limite: number }[]; }
interface Regra { id: string; area: string; limite_horas: number; curso_id: string; }
interface Submissao { id: string; data_envio: string; tipo?: string; descricao?: string; horas_solicitadas?: number; status: string; }

const navItems = [
  { id: 'progress', label: 'Meu Progresso', icon: BarChart3 },
  { id: 'submit', label: 'Nova Submissão', icon: Send },
  { id: 'history', label: 'Histórico', icon: FileText },
];

const Aluno = () => {
  const navigate = useNavigate();
  const { user, token, signOut } = useAuth(); // Agora usamos o Hook global
  
  // Mantendo sua lógica de formatação de nome, mas priorizando o dado do Contexto
  const userName = user?.nome || localStorage.getItem('userEmail')?.split('@')[0]?.replace(/[0-9]/g, '')?.replace(/[._]/g, ' ')?.trim() || 'Aluno';

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
  const [submitting, setSubmitting] = useState(false);
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);

  // Helpers de Headers centralizados usando o token do contexto
  const authHeaders = useCallback(() => ({ 
    'Content-Type': 'application/json', 
    Authorization: `Bearer ${token}` 
  }), [token]);

  const authHeadersRaw = useCallback(() => ({ 
    Authorization: `Bearer ${token}` 
  }), [token]);

  // Load cursos
  const fetchCursos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/alunos-cursos`, { headers: authHeaders() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.vinculos || data.cursos || [];
      setCursos(list);
      if (list.length > 0 && !selectedCurso) setSelectedCurso(list[0].curso_id);
    } catch { toast.error('Erro ao carregar cursos.'); }
  }, [selectedCurso, authHeaders]);

  // Load dashboard
  const fetchDashboard = useCallback(async () => {
    try {
      const url = selectedCurso
        ? `${API_BASE}/api/dashboard/aluno?curso_id=${selectedCurso}`
        : `${API_BASE}/api/dashboard/aluno`;
      const res = await fetch(url, { headers: authHeaders() });
      const data = await res.json();
      setDashboard(data);
    } catch { toast.error('Erro ao carregar progresso.'); }
  }, [selectedCurso, authHeaders]);

  // Load regras
  const fetchRegras = useCallback(async () => {
    if (!selectedCurso) return;
    try {
      const res = await fetch(`${API_BASE}/api/regras?curso_id=${selectedCurso}`, { headers: authHeaders() });
      const data = await res.json();
      setRegras(Array.isArray(data) ? data : data.regras || []);
    } catch { toast.error('Erro ao carregar regras.'); }
  }, [selectedCurso, authHeaders]);

  // Load history
  const fetchSubmissoes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/submissoes`, { headers: authHeaders() });
      const data = await res.json();
      setSubmissoes(Array.isArray(data) ? data : data.submissoes || []);
    } catch { toast.error('Erro ao carregar histórico.'); }
  }, [authHeaders]);

  useEffect(() => { fetchCursos(); }, [fetchCursos]);

  useEffect(() => {
    if (activeSection === 'progress' && selectedCurso) fetchDashboard();
    if (activeSection === 'submit' && selectedCurso) fetchRegras();
    if (activeSection === 'history') fetchSubmissoes();
  }, [activeSection, selectedCurso, fetchDashboard, fetchRegras, fetchSubmissoes]);

  // Step 1: create submission
  const handleStep1 = async () => {
    if (!subForm.regra_id || !subForm.carga_horaria_solicitada || !subForm.tipo) {
      toast.error('Preencha os campos obrigatórios.'); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/submissoes`, {
        method: 'POST', headers: authHeaders(),
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
        toast.success('Dados salvos! Agora envie o certificado.');
      } else {
        toast.error('Erro ao criar submissão.');
      }
    } catch { toast.error('Erro ao criar submissão.'); }
    setSubmitting(false);
  };

  // Step 2: upload certificate
  const handleUpload = async () => {
    if (!file) { toast.error('Selecione um arquivo.'); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error('Arquivo excede 4MB.'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('submissao_id', createdSubId);
      fd.append('arquivo', file);
      const res = await fetch(`${API_BASE}/api/certificados`, {
        method: 'POST', headers: authHeadersRaw(), body: fd,
      });
      if (res.ok) {
        toast.success('Certificado enviado com sucesso!');
        setStep(1);
        setSubForm({ regra_id: '', carga_horaria_solicitada: '', tipo: '', descricao: '' });
        setFile(null);
        setCreatedSubId('');
        setActiveSection('history');
        fetchSubmissoes();
      } else {
        toast.error('Erro ao enviar certificado.');
      }
    } catch { toast.error('Erro ao enviar certificado.'); }
    setSubmitting(false);
  };

  // Handlers de Drag/Drop (sem alterações)
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) setFile(f); };

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'aprovado') return <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Aprovado</Badge>;
    if (s === 'reprovado') return <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"><XCircle className="h-3 w-3 mr-1" />Reprovado</Badge>;
    return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
  };

  const progressPct = dashboard ? dashboard.progresso_percentual : 0;

  return (
    <div className="min-h-screen" style={{ background: panelBg }}>
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoWhite} alt="Logo" className="h-8 w-auto" />
            <h1 className="font-display text-sm tracking-widest uppercase text-white">Área do Aluno</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm capitalize" style={{ color: 'hsl(220, 20%, 60%)' }}>{userName}</span>
            <button
              onClick={signOut} // Usando o signOut do AuthContext
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display tracking-wider uppercase transition-all hover:opacity-80"
              style={{ background: 'hsla(0, 70%, 50%, 0.15)', border: '1px solid hsla(0, 70%, 50%, 0.3)', color: 'hsl(0, 70%, 65%)' }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* ... MANTENDO O RESTANTE DO JSX EXATAMENTE IGUAL ... */}
      <div className="max-w-[1400px] mx-auto px-6 py-8 flex gap-6">
        <nav className="w-56 shrink-0">
          <div className="rounded-xl p-3 space-y-1" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); if (item.id === 'submit') setStep(1); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${activeSection === item.id ? 'text-white' : ''}`}
                style={activeSection === item.id ? { background: 'hsla(160, 70%, 50%, 0.15)', border: '1px solid hsla(160, 70%, 50%, 0.25)', boxShadow: '0 0 20px -5px hsla(160, 70%, 50%, 0.2)' } : { color: labelColor, border: '1px solid transparent' }}
              >
                <item.icon className="h-4 w-4" style={activeSection === item.id ? { color: accentGreen } : {}} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <main className="flex-1 space-y-6">
          {/* SEÇÕES (Progress, Submit, History) MANTIDAS INTEGRALMENTE */}
          {activeSection === 'progress' && (
            <>
              {cursos.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {cursos.map(c => (
                    <button key={c.curso_id} onClick={() => setSelectedCurso(c.curso_id)} className="px-4 py-2 rounded-full text-xs font-display tracking-wider uppercase transition-all" style={selectedCurso === c.curso_id ? { background: 'hsla(160, 70%, 50%, 0.2)', border: '1px solid hsla(160, 70%, 50%, 0.4)', color: accentGreen } : { background: cardBg, border: `1px solid ${cardBorder}`, color: labelColor }}>
                      {c.curso_nome}
                    </button>
                  ))}
                </div>
              )}

              <div className="rounded-xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg tracking-wider uppercase text-white">Progresso Geral</h2>
                  <span className="font-mono text-2xl font-bold" style={{ color: accentGreen }}>
                    {dashboard?.total_horas_aprovadas || 0}h <span className="text-sm font-normal" style={{ color: labelColor }}>/ {dashboard?.carga_horaria_minima || 0}h</span>
                  </span>
                </div>
                <div className="relative h-4 rounded-full overflow-hidden" style={{ background: 'hsla(220, 40%, 20%, 0.8)' }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(progressPct, 100)}%`, background: `linear-gradient(90deg, ${accentGreenDim}, ${accentGreen}, hsl(180, 70%, 50%))`, boxShadow: '0 0 20px hsla(160, 70%, 50%, 0.4)' }} />
                </div>
                <p className="mt-2 text-xs font-mono" style={{ color: labelColor }}>
                  {Math.round(progressPct)}% concluído — Faltam {Math.max(0, (dashboard?.carga_horaria_minima || 0) - (dashboard?.total_horas_aprovadas || 0))}h
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total', value: dashboard?.total_submissoes || 0, color: 'hsl(210, 80%, 55%)', bg: 'hsla(210, 80%, 55%, 0.1)', border: 'hsla(210, 80%, 55%, 0.2)' },
                  { label: 'Pendentes', value: dashboard?.pendentes || 0, color: 'hsl(38, 92%, 55%)', bg: 'hsla(38, 92%, 55%, 0.1)', border: 'hsla(38, 92%, 55%, 0.2)' },
                  { label: 'Aprovadas', value: dashboard?.aprovadas || 0, color: 'hsl(152, 60%, 45%)', bg: 'hsla(152, 60%, 45%, 0.1)', border: 'hsla(152, 60%, 45%, 0.2)' },
                  { label: 'Reprovadas', value: dashboard?.reprovadas || 0, color: 'hsl(0, 72%, 55%)', bg: 'hsla(0, 72%, 55%, 0.1)', border: 'hsla(0, 72%, 55%, 0.2)' },
                ].map(m => (
                  <div key={m.label} className="rounded-xl p-5" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
                    <p className="text-xs font-display tracking-wider uppercase mb-1" style={{ color: m.color }}>{m.label}</p>
                    <p className="font-mono text-2xl font-bold text-white">{m.value}</p>
                  </div>
                ))}
              </div>

              {dashboard?.horas_por_area && dashboard.horas_por_area.length > 0 && (
                <div>
                  <h3 className="font-display text-sm tracking-wider uppercase text-white mb-4">Progresso por Área</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboard.horas_por_area.map((area) => {
                      const pct = area.limite > 0 ? (area.horas / area.limite) * 100 : 0;
                      const nearLimit = pct >= 80;
                      return (
                        <div key={area.area} className="rounded-xl p-5 transition-all hover:scale-[1.01]" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                          <p className="text-xs font-display tracking-wider uppercase text-white mb-2">{area.area}</p>
                          <div className="font-mono text-lg font-bold" style={{ color: accentGreen }}>{area.horas}h <span className="text-xs font-normal" style={{ color: labelColor }}>/ {area.limite}h</span></div>
                          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'hsla(220, 40%, 20%, 0.8)' }}>
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, background: nearLimit ? 'hsl(38, 92%, 55%)' : accentGreen, boxShadow: `0 0 10px ${nearLimit ? 'hsla(38, 92%, 55%, 0.5)' : 'hsla(160, 70%, 50%, 0.5)'}` }} />
                          </div>
                          {nearLimit && (
                            <div className="flex items-center gap-1 mt-2">
                              <AlertTriangle className="h-3 w-3" style={{ color: 'hsl(38, 92%, 55%)' }} />
                              <p className="text-[10px] font-mono" style={{ color: 'hsl(38, 92%, 55%)' }}>Próximo do limite</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {activeSection === 'submit' && (
            <div className="rounded-xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: step >= 1 ? 'hsla(160, 70%, 50%, 0.2)' : inputBg, border: `2px solid ${step >= 1 ? accentGreen : 'hsla(220, 20%, 30%, 0.5)'}`, color: step >= 1 ? accentGreen : labelColor }}>1</div>
                  <span className="text-xs font-display tracking-wider uppercase" style={{ color: step >= 1 ? 'white' : labelColor }}>Dados</span>
                </div>
                <div className="flex-1 h-px" style={{ background: step >= 2 ? accentGreen : 'hsla(220, 20%, 30%, 0.5)' }} />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: step >= 2 ? 'hsla(160, 70%, 50%, 0.2)' : inputBg, border: `2px solid ${step >= 2 ? accentGreen : 'hsla(220, 20%, 30%, 0.5)'}`, color: step >= 2 ? accentGreen : labelColor }}>2</div>
                  <span className="text-xs font-display tracking-wider uppercase" style={{ color: step >= 2 ? 'white' : labelColor }}>Certificado</span>
                </div>
              </div>

              {step === 1 && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'hsla(160, 70%, 50%, 0.15)', border: '1px solid hsla(160, 70%, 50%, 0.3)' }}><Send className="h-5 w-5" style={{ color: accentGreen }} /></div>
                    <div>
                      <h2 className="font-display text-lg tracking-wider uppercase text-white">Dados da Atividade</h2>
                      <p className="text-xs" style={{ color: labelColor }}>Preencha as informações da atividade complementar</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Área / Regra *</label>
                      <Select value={subForm.regra_id} onValueChange={(v) => setSubForm({ ...subForm, regra_id: v })}>
                        <SelectTrigger className="border-0 font-mono text-sm text-white" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}><SelectValue placeholder="Selecione a área" /></SelectTrigger>
                        <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: '1px solid hsla(200, 80%, 50%, 0.2)' }}>
                          {regras.map(r => (<SelectItem key={r.id} value={r.id}>{r.area} (máx {r.limite_horas}h)</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Carga Horária (h) *</label>
                      <Input type="number" min={1} placeholder="Ex: 40" value={subForm.carga_horaria_solicitada} onChange={(e) => setSubForm({ ...subForm, carga_horaria_solicitada: e.target.value })} className="border-0 font-mono text-sm text-white placeholder:text-gray-500" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Tipo *</label>
                      <Input placeholder="Ex: Curso, Palestra, Monitoria" value={subForm.tipo} onChange={(e) => setSubForm({ ...subForm, tipo: e.target.value })} className="border-0 font-mono text-sm text-white placeholder:text-gray-500" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-display tracking-wider uppercase" style={{ color: labelColor }}>Descrição (opcional)</label>
                      <Textarea placeholder="Descrição da atividade" value={subForm.descricao} onChange={(e) => setSubForm({ ...subForm, descricao: e.target.value })} className="border-0 font-mono text-sm text-white placeholder:text-gray-500 min-h-[80px]" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} />
                    </div>
                  </div>
                  <Button onClick={handleStep1} disabled={submitting} className="w-full py-6 text-sm font-display tracking-widest uppercase rounded-xl transition-all duration-300 hover:scale-[1.01] border-0" style={{ background: `linear-gradient(135deg, ${accentGreenDim}, hsl(180, 60%, 40%))`, boxShadow: '0 0 30px -5px hsla(160, 70%, 50%, 0.3)', color: 'white' }}>
                    <ChevronRight className="h-4 w-4 mr-2" /> {submitting ? 'Salvando...' : 'Próximo'}
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'hsla(160, 70%, 50%, 0.15)', border: '1px solid hsla(160, 70%, 50%, 0.3)' }}><Upload className="h-5 w-5" style={{ color: accentGreen }} /></div>
                    <div>
                      <h2 className="font-display text-lg tracking-wider uppercase text-white">Upload do Certificado</h2>
                      <p className="text-xs" style={{ color: labelColor }}>Envie o comprovante da atividade. O OCR extrairá o texto automaticamente.</p>
                    </div>
                  </div>
                  <div className={`relative rounded-xl p-10 text-center cursor-pointer transition-all duration-300 mb-4 ${dragActive ? 'scale-[1.01]' : ''}`} style={{ border: `2px dashed ${dragActive ? accentGreen : 'hsla(200, 80%, 50%, 0.2)'}`, background: dragActive ? 'hsla(160, 70%, 50%, 0.05)' : 'hsla(220, 40%, 15%, 0.4)' }} onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDrop} onClick={() => document.getElementById('file-input')?.click()}>
                    <input id="file-input" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileInput} />
                    <CloudUpload className="h-10 w-10 mx-auto mb-3" style={{ color: dragActive ? accentGreen : 'hsl(220, 20%, 40%)' }} />
                    {file ? (<p className="font-mono text-sm" style={{ color: accentGreen }}><FileText className="inline h-4 w-4 mr-1" /> {file.name}</p>) : (<><p className="text-sm text-white mb-1">Arraste seu certificado aqui ou clique para upload</p><p className="text-xs" style={{ color: labelColor }}>PDF, JPG ou PNG — máx. 4MB</p></>)}
                  </div>
                  <div className="rounded-lg p-3 mb-6 flex items-start gap-2" style={{ background: 'hsla(210, 80%, 55%, 0.08)', border: '1px solid hsla(210, 80%, 55%, 0.15)' }}>
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'hsl(210, 80%, 55%)' }} />
                    <p className="text-xs" style={{ color: 'hsl(210, 80%, 65%)' }}>Após o envio, o sistema extrairá automaticamente o texto do certificado via OCR para validação.</p>
                  </div>
                  <Button onClick={handleUpload} disabled={submitting || !file} className="w-full py-6 text-sm font-display tracking-widest uppercase rounded-xl transition-all duration-300 hover:scale-[1.01] border-0" style={{ background: `linear-gradient(135deg, ${accentGreenDim}, hsl(180, 60%, 40%))`, boxShadow: '0 0 30px -5px hsla(160, 70%, 50%, 0.3)', color: 'white' }}>
                    <Send className="h-4 w-4 mr-2" /> {submitting ? 'Enviando...' : 'Enviar para Avaliação'}
                  </Button>
                </>
              )}
            </div>
          )}

          {activeSection === 'history' && (
            <div className="rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <div className="p-6 pb-4">
                <h2 className="font-display text-lg tracking-wider uppercase text-white">Meus Envios</h2>
                <p className="text-xs mt-1" style={{ color: labelColor }}>Acompanhe o status das suas submissões</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                      {['Data de Envio', 'Tipo', 'Descrição', 'Horas', 'Status'].map(h => (<th key={h} className="text-left px-6 py-3 text-[10px] font-display tracking-widest uppercase" style={{ color: 'hsl(210, 80%, 55%)' }}>{h}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {submissoes.length === 0 && (<tr><td colSpan={5} className="px-6 py-8 text-center text-sm" style={{ color: labelColor }}>Nenhuma submissão encontrada.</td></tr>)}
                    {submissoes.map((s) => (
                      <tr key={s.id} className="transition-colors duration-200" style={{ borderBottom: '1px solid hsla(220, 40%, 20%, 0.5)' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'hsla(220, 40%, 20%, 0.3)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <td className="px-6 py-4 text-xs font-mono" style={{ color: labelColor }}>{s.data_envio ? new Date(s.data_envio).toLocaleDateString('pt-BR') : '—'}</td>
                        <td className="px-6 py-4 text-sm text-white">{s.tipo || '—'}</td>
                        <td className="px-6 py-4 text-sm text-white truncate max-w-[200px]">{s.descricao || '—'}</td>
                        <td className="px-6 py-4 text-sm font-mono font-bold" style={{ color: accentGreen }}>{s.horas_solicitadas || 0}h</td>
                        <td className="px-6 py-4">{statusBadge(s.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Aluno;