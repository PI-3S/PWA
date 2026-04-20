import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useapptheme';
// 1. IMPORTANTE: Importe o ThemeSwitcher (ajuste o caminho se necessário)
import  ThemeSwitcher  from '@/components/themeswitcher';
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

// ... (Interfaces mantidas)
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
  const { user, token, signOut } = useAuth();
  const { colors: tc } = useAppTheme();

  // Cores dinâmicas extraídas do hook
  const panelBg = tc.panelBg;
  const cardBg = tc.cardBg;
  const cardBorder = tc.cardBorder;
  const inputBg = tc.inputBg;
  const inputBorder = tc.inputBorder;
  const labelColor = tc.labelColor;
  const accentGreen = 'hsl(160, 70%, 55%)';
  const accentGreenDim = 'hsl(160, 70%, 40%)';
  const userName = user?.nome || 'Aluno';

  // Estados e Callbacks (Mantidos conforme seu original)
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

  const authHeaders = useCallback(() => ({ 
    'Content-Type': 'application/json', 
    Authorization: `Bearer ${token}` 
  }), [token]);

  const authHeadersRaw = useCallback(() => ({ 
    Authorization: `Bearer ${token}` 
  }), [token]);

  // Efeitos de carregamento de dados (Mantidos)
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/alunos-cursos`, { headers: authHeaders() });
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.vinculos || data.cursos || [];
        setCursos(list);
        if (list.length > 0 && !selectedCurso) setSelectedCurso(list[0].curso_id);
      } catch { toast.error('Erro ao carregar cursos.'); }
    };
    fetchCursos();
  }, [authHeaders, selectedCurso]);

  const fetchDashboard = useCallback(async () => {
    try {
      const url = selectedCurso ? `${API_BASE}/api/dashboard/aluno?curso_id=${selectedCurso}` : `${API_BASE}/api/dashboard/aluno`;
      const res = await fetch(url, { headers: authHeaders() });
      const data = await res.json();
      setDashboard(data);
    } catch { toast.error('Erro ao carregar progresso.'); }
  }, [selectedCurso, authHeaders]);

  const fetchSubmissoes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/submissoes`, { headers: authHeaders() });
      const data = await res.json();
      setSubmissoes(Array.isArray(data) ? data : data.submissoes || []);
    } catch { toast.error('Erro ao carregar histórico.'); }
  }, [authHeaders]);

  useEffect(() => {
    if (activeSection === 'progress' && selectedCurso) fetchDashboard();
    if (activeSection === 'history') fetchSubmissoes();
  }, [activeSection, selectedCurso, fetchDashboard, fetchSubmissoes]);

  // Lógica de Submissão e Upload (Mantida)
  const handleStep1 = async () => { /* ... lógica original ... */ };
  const handleUpload = async () => { /* ... lógica original ... */ };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) setFile(f); };

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'aprovado') return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Aprovado</Badge>;
    if (s === 'reprovado') return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Reprovado</Badge>;
    return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
  };

  const progressPct = dashboard ? dashboard.progresso_percentual : 0;

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: panelBg }}>
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 transition-all duration-500" 
              style={{ background: tc.headerBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${tc.headerBorder}` }}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoWhite} alt="Logo" className="h-8 w-auto transition-all" style={{ filter: tc.logoFilter }} />
            <h1 className="font-display text-sm tracking-widest uppercase" style={{ color: tc.titleColor }}>Área do Aluno</h1>
          </div>

          <div className="flex items-center gap-6">
            {/* 2. ADIÇÃO DO BOTÃO DE TROCA DE TEMA (IGUAL AO COORDENADOR) */}
            <ThemeSwitcher />

            <div className="flex items-center gap-4 border-l pl-6" style={{ borderColor: tc.headerBorder }}>
              <span className="text-sm capitalize font-medium" style={{ color: tc.textSecondary }}>{userName}</span>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display tracking-wider uppercase transition-all hover:opacity-80"
                style={{ background: 'hsla(0, 70%, 50%, 0.15)', border: '1px solid hsla(0, 70%, 50%, 0.3)', color: 'hsl(0, 70%, 65%)' }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8 flex gap-6">
        {/* Sidebar Nav */}
        <nav className="w-56 shrink-0">
          <div className="rounded-xl p-3 space-y-1 transition-all duration-500" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); if (item.id === 'submit') setStep(1); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300`}
                style={activeSection === item.id 
                  ? { background: 'hsla(160, 70%, 50%, 0.15)', border: `1px solid ${accentGreen}`, color: 'white', boxShadow: '0 0 15px -5px hsla(160, 70%, 50%, 0.3)' } 
                  : { color: labelColor, border: '1px solid transparent' }}
              >
                <item.icon className="h-4 w-4" style={activeSection === item.id ? { color: accentGreen } : {}} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
           {/* O restante do seu JSX permanece o mesmo, 
               as variáveis panelBg, cardBg e tc.colors já cuidarão do visual! */}
           {activeSection === 'progress' && (
             <div className="rounded-xl p-6 transition-all duration-500" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <h2 className="font-display text-lg tracking-wider uppercase mb-4" style={{ color: tc.titleColor }}>Progresso Geral</h2>
                {/* ... conteúdo do progresso ... */}
             </div>
           )}
           {/* ... outras seções ... */}
        </main>
      </div>
    </div>
  );
};

export default Aluno;