import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  LogOut, BarChart3, Send, FileText,
  Clock, CheckCircle2, XCircle, AlertTriangle,
  CloudUpload, Upload, ChevronRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_CONFIG } from '@/data/data';
import logoWhite from '@/assets/logo-white.png';

const API_BASE = API_CONFIG.BASE_URL;

// Estilos mantidos conforme sua identidade visual
const panelBg = 'hsl(220, 45%, 11%)';
const cardBg = 'hsla(220, 40%, 15%, 0.7)';
const cardBorder = 'hsla(200, 60%, 40%, 0.12)';
const inputBg = 'hsla(220, 40%, 18%, 0.8)';
const inputBorder = 'hsla(200, 80%, 50%, 0.15)';
const labelColor = 'hsl(220, 20%, 55%)';
const accentGreen = 'hsl(160, 70%, 55%)';
const accentGreenDim = 'hsl(160, 70%, 40%)';

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
  const { user, token, signOut } = useAuth();
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

  const authHeaders = useCallback(() => ({ 
    'Content-Type': 'application/json', 
    Authorization: `Bearer ${token}` 
  }), [token]);

  const authHeadersRaw = useCallback(() => ({ 
    Authorization: `Bearer ${token}` 
  }), [token]);

  const fetchCursos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/alunos-cursos`, { headers: authHeaders() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.vinculos || data.cursos || [];
      setCursos(list);
      if (list.length > 0 && !selectedCurso) setSelectedCurso(list[0].curso_id);
    } catch (err) { toast.error('Erro ao conectar com o servidor.'); }
  }, [selectedCurso, authHeaders]);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = selectedCurso ? `${API_BASE}/api/dashboard/aluno?curso_id=${selectedCurso}` : `${API_BASE}/api/dashboard/aluno`;
      const res = await fetch(url, { headers: authHeaders() });
      const data = await res.json();
      setDashboard(data.metricas || data);
    } catch { toast.error('Erro ao carregar dashboard.'); }
    setIsLoading(false);
  }, [selectedCurso, authHeaders]);

  const fetchRegras = useCallback(async () => {
    if (!selectedCurso) return;
    try {
      const res = await fetch(`${API_BASE}/api/regras?curso_id=${selectedCurso}`, { headers: authHeaders() });
      const data = await res.json();
      setRegras(Array.isArray(data) ? data : data.regras || []);
    } catch { toast.error('Erro ao carregar regras do curso.'); }
  }, [selectedCurso, authHeaders]);

  const fetchSubmissoes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/submissoes`, { headers: authHeaders() });
      const data = await res.json();
      setSubmissoes(Array.isArray(data) ? data : data.submissoes || []);
    } catch { toast.error('Erro ao carregar histórico.'); }
    setIsLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchCursos(); }, [fetchCursos]);

  useEffect(() => {
    if (activeSection === 'progress' && selectedCurso) fetchDashboard();
    if (activeSection === 'submit' && selectedCurso) fetchRegras();
    if (activeSection === 'history') fetchSubmissoes();
  }, [activeSection, selectedCurso, fetchDashboard, fetchRegras, fetchSubmissoes]);

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
        toast.success('Informações salvas! Agora envie o arquivo.');
      } else { toast.error(data.error || 'Erro ao processar envio.'); }
    } catch { toast.error('Falha na comunicação com o servidor.'); }
    setSubmitting(false);
  };

  const handleUpload = async () => {
    if (!file) { toast.error('Selecione um arquivo.'); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error('Arquivo muito grande (máximo 4MB).'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('submissao_id', createdSubId);
      fd.append('arquivo', file);
      const res = await fetch(`${API_BASE}/api/certificados`, {
        method: 'POST', headers: authHeadersRaw(), body: fd,
      });
      if (res.ok) {
        toast.success('Certificado enviado! Aguarde a avaliação.');
        setStep(1);
        setSubForm({ regra_id: '', carga_horaria_solicitada: '', tipo: '', descricao: '' });
        setFile(null);
        setActiveSection('history');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.mensagem || err.error || 'Erro ao enviar arquivo.');
      }
    } catch { toast.error('Erro na conexão de rede.'); }
    setSubmitting(false);
  };

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    const variants: Record<string, JSX.Element> = {
      aprovado: <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Aprovado</Badge>,
      reprovado: <Badge className="bg-red-500/20 text-red-400 border border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Reprovado</Badge>,
      pendente: <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>
    };
    return variants[s] || variants.pendente;
  };

  return (
    <div className="min-h-screen" style={{ background: panelBg }}>
      <header className="glass-header sticky top-0 z-50 px-6 py-4 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoWhite} alt="Logo Maestria" className="h-8 w-auto" />
            <h1 className="font-display text-sm tracking-widest uppercase text-white hidden sm:block">Maestria Aluno</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-white/60">Olá, <span className="text-white capitalize">{userName}</span></span>
            <button onClick={signOut} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display tracking-wider uppercase transition-all hover:bg-red-500/20 text-red-400 border border-red-500/20">
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col md:flex-row gap-6">
        <nav className="w-full md:w-56 shrink-0 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); if (item.id === 'submit') setStep(1); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${activeSection === item.id ? 'text-white' : 'text-gray-400'}`}
              style={activeSection === item.id ? { background: 'hsla(160, 70%, 50%, 0.15)', border: '1px solid hsla(160, 70%, 50%, 0.25)' } : {}}
            >
              <item.icon className="h-4 w-4" style={activeSection === item.id ? { color: accentGreen } : {}} />
              {item.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 space-y-6">
          {activeSection === 'progress' && (
            <>
              {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
              ) : (
                <>
                  <div className="rounded-xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display text-lg tracking-wider uppercase text-white">Seu Progresso</h2>
                      <span className="font-mono text-2xl font-bold" style={{ color: accentGreen }}>
                        {dashboard?.total_horas_aprovadas || 0}h <span className="text-sm font-normal text-gray-500">/ {dashboard?.carga_horaria_minima || 0}h</span>
                      </span>
                    </div>
                    <div className="relative h-4 rounded-full bg-black/20 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)]" style={{ width: `${Math.min(dashboard?.progresso_percentual || 0, 100)}%`, background: `linear-gradient(90deg, ${accentGreenDim}, ${accentGreen})` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Envios', value: dashboard?.total_submissoes || 0, color: 'hsl(210, 80%, 55%)' },
                      { label: 'Pendentes', value: dashboard?.pendentes || 0, color: 'hsl(38, 92%, 55%)' },
                      { label: 'Aprovadas', value: dashboard?.aprovadas || 0, color: 'hsl(152, 60%, 45%)' },
                      { label: 'Reprovadas', value: dashboard?.reprovadas || 0, color: 'hsl(0, 72%, 55%)' },
                    ].map(m => (
                      <div key={m.label} className="rounded-xl p-5 bg-white/5 border border-white/10">
                        <p className="text-[10px] font-display tracking-widest uppercase mb-1" style={{ color: m.color }}>{m.label}</p>
                        <p className="font-mono text-2xl font-bold text-white">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {dashboard?.horas_por_area && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {dashboard.horas_por_area.map((area) => (
                        <div key={area.area} className="rounded-xl p-5 bg-black/20 border border-white/5">
                          <p className="text-xs font-display text-gray-400 mb-2">{area.area}</p>
                          <div className="font-mono text-lg font-bold text-white">{area.horas}h <span className="text-xs font-normal text-gray-500">/ {area.limite}h</span></div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {activeSection === 'submit' && (
            <div className="rounded-xl p-8" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Send className="h-5 w-5 text-emerald-400" />
                    <h2 className="text-white uppercase font-display tracking-widest">Dados da Atividade</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 uppercase tracking-tighter">Área de Atuação</label>
                      <Select value={subForm.regra_id} onValueChange={(v) => {
                        const selectedRule = regras.find(r => r.id === v);
                        setSubForm({ ...subForm, regra_id: v, tipo: selectedRule?.area || '' });
                      }}>
                        <SelectTrigger className="bg-black/20 border-white/10 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                          {regras.map(r => <SelectItem key={r.id} value={r.id}>{r.area}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 uppercase">Horas do Certificado</label>
                      <Input type="number" value={subForm.carga_horaria_solicitada} onChange={(e) => setSubForm({ ...subForm, carga_horaria_solicitada: e.target.value })} className="bg-black/20 border-white/10 text-white" />
                    </div>
                  </div>
                  <Button onClick={handleStep1} disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-500">
                    {submitting ? <Loader2 className="animate-spin" /> : 'Próximo Passo'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <div className="p-10 border-2 border-dashed border-white/10 rounded-xl bg-black/10">
                    <CloudUpload className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
                    <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-transparent border-0 text-white" />
                  </div>
                  <Button onClick={handleUpload} disabled={submitting || !file} className="w-full bg-emerald-600">
                    {submitting ? 'Enviando...' : 'Finalizar Envio'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeSection === 'history' && (
            <div className="rounded-xl overflow-hidden border border-white/5 bg-black/20">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-emerald-400 text-[10px] uppercase font-display">
                  <tr>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Horas</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {submissoes.map(s => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono">{new Date(s.data_envio).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{s.tipo}</td>
                      <td className="px-6 py-4 font-bold text-white">{s.horas_solicitadas}h</td>
                      <td className="px-6 py-4">{statusBadge(s.status)}</td>
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

export default Aluno;