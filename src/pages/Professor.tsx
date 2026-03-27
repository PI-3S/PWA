import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, LogOut, Bell, Search, Eye, CheckCircle2, XCircle, AlertTriangle,
  Pencil, Clock, FileText, Users, ShieldCheck, ChevronRight, X, Send,
  BookOpen, Beaker, GraduationCap, Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import logoWhite from '@/assets/logo-white.png';

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'adjustment';

interface ProfSubmission {
  id: string;
  date: string;
  studentName: string;
  studentId: string;
  category: string;
  activity: string;
  hoursDeclared: number;
  hoursInDoc: number;
  status: SubmissionStatus;
  description: string;
  documentUrl: string;
  verified: boolean;
  accumulatedHours: Record<string, number>;
  categoryLimits: Record<string, number>;
}

const catLimits: Record<string, number> = {
  cursos: 40, palestras: 30, monitoria: 50, extensao: 60, pesquisa: 60, estagios: 60,
};

const mockData: ProfSubmission[] = [
  {
    id: '1', date: '2026-03-22', studentName: 'Ana Clara Ribeiro', studentId: '2021001',
    category: 'cursos', activity: 'Curso de React Avançado', hoursDeclared: 20, hoursInDoc: 18,
    status: 'pending', description: 'Curso online de React com certificação pela plataforma Udemy.',
    documentUrl: '', verified: true,
    accumulatedHours: { cursos: 30, palestras: 10, monitoria: 0, extensao: 5, pesquisa: 0, estagios: 0 },
    categoryLimits: catLimits,
  },
  {
    id: '2', date: '2026-03-18', studentName: 'Carlos Eduardo Santos', studentId: '2021045',
    category: 'palestras', activity: 'Palestra: IA Generativa na Educação', hoursDeclared: 4, hoursInDoc: 4,
    status: 'pending', description: 'Palestra ministrada no evento TechEdu 2026.',
    documentUrl: '', verified: true,
    accumulatedHours: { cursos: 15, palestras: 22, monitoria: 0, extensao: 10, pesquisa: 5, estagios: 20 },
    categoryLimits: catLimits,
  },
  {
    id: '3', date: '2026-03-10', studentName: 'Mariana Costa Lima', studentId: '2020088',
    category: 'monitoria', activity: 'Monitoria de Estrutura de Dados', hoursDeclared: 30, hoursInDoc: 30,
    status: 'pending', description: 'Monitoria realizada no semestre 2025.2 sob orientação do Prof. João.',
    documentUrl: '', verified: false,
    accumulatedHours: { cursos: 20, palestras: 15, monitoria: 45, extensao: 0, pesquisa: 10, estagios: 0 },
    categoryLimits: catLimits,
  },
  {
    id: '4', date: '2026-03-05', studentName: 'Lucas Ferreira', studentId: '2022012',
    category: 'extensao', activity: 'Projeto Comunitário de Educação Digital', hoursDeclared: 15, hoursInDoc: 15,
    status: 'approved', description: 'Projeto de extensão em parceria com a Prefeitura Municipal.',
    documentUrl: '', verified: true,
    accumulatedHours: { cursos: 10, palestras: 5, monitoria: 0, extensao: 55, pesquisa: 0, estagios: 20 },
    categoryLimits: catLimits,
  },
  {
    id: '5', date: '2026-02-28', studentName: 'Beatriz Almeida', studentId: '2021078',
    category: 'pesquisa', activity: 'Iniciação Científica em Machine Learning', hoursDeclared: 40, hoursInDoc: 40,
    status: 'adjustment', description: 'Pesquisa orientada pelo Prof. Carlos sobre redes neurais.',
    documentUrl: '', verified: true,
    accumulatedHours: { cursos: 25, palestras: 20, monitoria: 10, extensao: 15, pesquisa: 30, estagios: 0 },
    categoryLimits: catLimits,
  },
];

const statusConfig: Record<SubmissionStatus, { label: string; icon: typeof Clock; color: string; bg: string; border: string }> = {
  pending: { label: 'Pendente', icon: Clock, color: 'hsl(38, 92%, 55%)', bg: 'hsla(38, 92%, 55%, 0.15)', border: 'hsla(38, 92%, 55%, 0.3)' },
  approved: { label: 'Deferido', icon: CheckCircle2, color: 'hsl(152, 60%, 50%)', bg: 'hsla(152, 60%, 50%, 0.15)', border: 'hsla(152, 60%, 50%, 0.3)' },
  rejected: { label: 'Indeferido', icon: XCircle, color: 'hsl(0, 72%, 55%)', bg: 'hsla(0, 72%, 55%, 0.15)', border: 'hsla(0, 72%, 55%, 0.3)' },
  adjustment: { label: 'Ajuste', icon: Pencil, color: 'hsl(200, 80%, 55%)', bg: 'hsla(200, 80%, 55%, 0.15)', border: 'hsla(200, 80%, 55%, 0.3)' },
};

const categoryLabels: Record<string, string> = {
  cursos: 'Cursos', palestras: 'Palestras', monitoria: 'Monitoria',
  extensao: 'Extensão', pesquisa: 'Pesquisa', estagios: 'Estágios',
};

const categoryIcons: Record<string, typeof BookOpen> = {
  cursos: BookOpen, palestras: Users, monitoria: GraduationCap,
  extensao: Users, pesquisa: Beaker, estagios: FileText,
};

const Professor = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail') || '';
  const userName = userEmail.split('@')[0].replace(/[0-9]/g, '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[._]/g, ' ').trim() || 'Professor';
  const [submissions, setSubmissions] = useState<ProfSubmission[]>(mockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selected, setSelected] = useState<ProfSubmission | null>(null);
  const [justification, setJustification] = useState('');
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [showRejectField, setShowRejectField] = useState(false);
  const [showAdjustField, setShowAdjustField] = useState(false);

  const counts = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return {
      pending: submissions.filter((s) => s.status === 'pending').length,
      approvedMonth: submissions.filter((s) => {
        const d = new Date(s.date);
        return s.status === 'approved' && d.getMonth() === month && d.getFullYear() === year;
      }).length,
      adjustment: submissions.filter((s) => s.status === 'adjustment').length,
    };
  }, [submissions]);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const matchSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.includes(searchTerm);
      const matchCat = categoryFilter === 'all' || s.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [submissions, searchTerm, categoryFilter]);

  const handleApprove = (id: string) => {
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status: 'approved' as SubmissionStatus } : s));
    toast.success('Solicitação deferida com sucesso.');
    setSelected(null);
    resetFields();
  };

  const handleReject = (id: string) => {
    if (!justification.trim()) {
      toast.error('A justificativa é obrigatória para indeferir.');
      return;
    }
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status: 'rejected' as SubmissionStatus } : s));
    toast.success('Solicitação indeferida.');
    setSelected(null);
    resetFields();
  };

  const handleAdjust = (id: string) => {
    if (!adjustmentNote.trim()) {
      toast.error('Descreva o ajuste necessário.');
      return;
    }
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status: 'adjustment' as SubmissionStatus } : s));
    toast.success('Ajuste solicitado ao aluno.');
    setSelected(null);
    resetFields();
  };

  const resetFields = () => {
    setJustification('');
    setAdjustmentNote('');
    setShowRejectField(false);
    setShowAdjustField(false);
  };

  const checkLimitAlert = (sub: ProfSubmission) => {
    const accumulated = sub.accumulatedHours[sub.category] || 0;
    const limit = sub.categoryLimits[sub.category] || 0;
    return accumulated + sub.hoursDeclared > limit;
  };

  const summaryCards = [
    { label: 'Pendentes de Análise', value: counts.pending, color: 'hsl(38, 92%, 55%)', bg: 'hsla(38, 92%, 55%, 0.12)', border: 'hsla(38, 92%, 55%, 0.25)', icon: Clock },
    { label: 'Total Validado (Mês)', value: counts.approvedMonth, color: 'hsl(152, 60%, 50%)', bg: 'hsla(152, 60%, 50%, 0.12)', border: 'hsla(152, 60%, 50%, 0.25)', icon: CheckCircle2 },
    { label: 'Solicitações com Ajuste', value: counts.adjustment, color: 'hsl(200, 80%, 55%)', bg: 'hsla(200, 80%, 55%, 0.12)', border: 'hsla(200, 80%, 55%, 0.25)', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(165deg, hsl(220, 50%, 10%) 0%, hsl(225, 45%, 14%) 40%, hsl(220, 45%, 11%) 100%)' }}>
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm transition-colors hover:text-white"
              style={{ color: 'hsl(200, 80%, 60%)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-display text-xs tracking-wider uppercase">Voltar</span>
            </button>
            <div className="h-5 w-px" style={{ background: 'hsla(200, 80%, 50%, 0.2)' }} />
            <img src={logoWhite} alt="Logo" className="h-8 w-auto" />
            <h1 className="font-display text-sm tracking-widest uppercase text-white">
              Painel do Professor
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg transition-all glow-border hover:bg-white/5" style={{ color: 'hsl(200, 30%, 65%)' }}>
              <Bell className="h-5 w-5" />
              {counts.pending > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse-slow"
                  style={{ background: 'hsl(38, 92%, 50%)', boxShadow: '0 0 10px hsla(38, 92%, 50%, 0.5)' }}>
                  {counts.pending}
                </span>
              )}
            </button>
            <span className="text-sm capitalize" style={{ color: 'hsl(220, 20%, 60%)' }}>Prof. {userName}</span>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display tracking-wider uppercase transition-all hover:opacity-80"
              style={{ background: 'hsla(0, 70%, 50%, 0.15)', border: '1px solid hsla(0, 70%, 50%, 0.3)', color: 'hsl(0, 70%, 65%)' }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-white font-display uppercase">Visão Geral</h2>
          <p className="text-sm mt-1" style={{ color: 'hsl(200, 30%, 50%)' }}>Análise de atividades complementares dos alunos</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="glass-card rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]"
              style={{ borderColor: card.border, boxShadow: `0 0 25px -8px ${card.bg}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                  <card.icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
                <span className="font-mono text-3xl font-bold" style={{ color: card.color }}>
                  {card.value}
                </span>
              </div>
              <p className="text-xs font-display tracking-wider uppercase" style={{ color: 'hsl(220, 20%, 55%)' }}>
                {card.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-[250px]">
            <Search className="h-4 w-4" style={{ color: 'hsl(220, 20%, 45%)' }} />
            <Input
              placeholder="Buscar por nome ou matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent text-white placeholder:text-gray-500 text-sm font-mono focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" style={{ color: 'hsl(220, 20%, 45%)' }} />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] border-0 text-sm text-white font-mono"
                style={{ background: 'hsla(220, 40%, 18%, 0.8)', border: '1px solid hsla(200, 80%, 50%, 0.15)' }}>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent style={{ background: 'hsl(220, 50%, 15%)', border: '1px solid hsla(200, 80%, 50%, 0.2)' }}>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid hsla(200, 80%, 50%, 0.1)' }}>
            <h3 className="font-display text-sm tracking-widest uppercase text-white">Fila de Trabalho</h3>
            <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 50%)' }}>{filtered.length} solicitações</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid hsla(200, 80%, 50%, 0.08)' }}>
                  {['Data de Envio', 'Aluno', 'Atividade', 'Categoria', 'Horas', 'Status', 'Ação'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-display tracking-widest uppercase" style={{ color: 'hsl(220, 20%, 45%)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => {
                  const sc = statusConfig[sub.status];
                  const CatIcon = categoryIcons[sub.category] || FileText;
                  return (
                    <tr key={sub.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid hsla(200, 80%, 50%, 0.05)' }}>
                      <td className="px-5 py-4 text-sm font-mono" style={{ color: 'hsl(220, 20%, 55%)' }}>{sub.date}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">{sub.studentName}</span>
                          {sub.verified && (
                            <ShieldCheck className="h-3.5 w-3.5" style={{ color: 'hsl(152, 60%, 50%)' }} />
                          )}
                        </div>
                        <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 45%)' }}>Mat. {sub.studentId}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-white max-w-[200px] truncate">{sub.activity}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <CatIcon className="h-3.5 w-3.5" style={{ color: 'hsl(200, 80%, 55%)' }} />
                          <span className="text-xs" style={{ color: 'hsl(220, 20%, 55%)' }}>{categoryLabels[sub.category]}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-mono font-bold" style={{ color: 'hsl(200, 80%, 60%)' }}>{sub.hoursDeclared}h</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium"
                          style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}>
                          <sc.icon className="h-3 w-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => { setSelected(sub); resetFields(); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display tracking-wider uppercase transition-all hover:opacity-80"
                          style={{ background: 'hsla(200, 80%, 50%, 0.15)', border: '1px solid hsla(200, 80%, 50%, 0.25)', color: 'hsl(200, 80%, 60%)' }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Analisar
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: 'hsl(220, 20%, 45%)' }}>
                      Nenhuma solicitação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Analysis Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); resetFields(); } }}>
        <DialogContent className="max-w-4xl p-0 border-0 overflow-hidden" style={{ background: 'hsl(220, 50%, 12%)', border: '1px solid hsla(200, 80%, 50%, 0.15)' }}>
          {selected && (() => {
            const limitExceeded = checkLimitAlert(selected);
            const accumulated = selected.accumulatedHours[selected.category] || 0;
            const limit = selected.categoryLimits[selected.category] || 0;
            return (
              <>
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="font-display text-lg tracking-widest uppercase text-white flex items-center gap-3">
                    <Eye className="h-5 w-5" style={{ color: 'hsl(200, 80%, 55%)' }} />
                    Análise de Solicitação
                  </DialogTitle>
                </DialogHeader>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Student Data */}
                  <div className="space-y-5">
                    {/* Alert */}
                    {limitExceeded && (
                      <div className="rounded-xl p-4 flex items-start gap-3"
                        style={{ background: 'hsla(38, 92%, 50%, 0.1)', border: '1px solid hsla(38, 92%, 50%, 0.3)' }}>
                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'hsl(38, 92%, 55%)' }} />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'hsl(38, 92%, 55%)' }}>Limite de Categoria Excedido</p>
                          <p className="text-xs mt-1" style={{ color: 'hsl(38, 70%, 50%)' }}>
                            O aluno já possui {accumulated}h em {categoryLabels[selected.category]} (limite: {limit}h).
                            Com esta solicitação ({selected.hoursDeclared}h), o total seria {accumulated + selected.hoursDeclared}h.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Student Info */}
                    <div className="glass-card rounded-xl p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm"
                          style={{ background: 'linear-gradient(135deg, hsl(200, 80%, 45%), hsl(210, 80%, 55%))', color: 'white' }}>
                          {selected.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-sm">{selected.studentName}</span>
                            {selected.verified && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                                style={{ background: 'hsla(152, 60%, 50%, 0.15)', border: '1px solid hsla(152, 60%, 50%, 0.3)', color: 'hsl(152, 60%, 50%)' }}>
                                <ShieldCheck className="h-3 w-3" /> Verificado
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 50%)' }}>Mat. {selected.studentId}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Categoria', value: categoryLabels[selected.category] },
                          { label: 'Horas Declaradas', value: `${selected.hoursDeclared}h`, mono: true },
                          { label: 'Horas no Documento', value: `${selected.hoursInDoc}h`, mono: true },
                          { label: 'Data de Envio', value: selected.date, mono: true },
                        ].map((item) => (
                          <div key={item.label} className="rounded-lg p-3" style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                            <p className="text-[10px] font-display tracking-wider uppercase mb-1" style={{ color: 'hsl(220, 20%, 45%)' }}>{item.label}</p>
                            <p className={`text-sm text-white ${item.mono ? 'font-mono font-bold' : ''}`}>{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg p-3" style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                        <p className="text-[10px] font-display tracking-wider uppercase mb-1" style={{ color: 'hsl(220, 20%, 45%)' }}>Descrição</p>
                        <p className="text-sm" style={{ color: 'hsl(220, 20%, 70%)' }}>{selected.description}</p>
                      </div>

                      {/* Accumulated hours */}
                      <div className="rounded-lg p-3" style={{ background: 'hsla(220, 40%, 18%, 0.6)' }}>
                        <p className="text-[10px] font-display tracking-wider uppercase mb-2" style={{ color: 'hsl(220, 20%, 45%)' }}>Horas Acumuladas por Categoria</p>
                        <div className="space-y-2">
                          {Object.entries(selected.accumulatedHours).map(([cat, hrs]) => {
                            const catLimit = selected.categoryLimits[cat] || 0;
                            const pct = catLimit > 0 ? (hrs / catLimit) * 100 : 0;
                            const isCurrent = cat === selected.category;
                            return (
                              <div key={cat} className={`flex items-center gap-3 ${isCurrent ? 'opacity-100' : 'opacity-60'}`}>
                                <span className="text-[10px] font-mono w-20 shrink-0" style={{ color: isCurrent ? 'hsl(200, 80%, 60%)' : 'hsl(220, 20%, 50%)' }}>
                                  {categoryLabels[cat] || cat}
                                </span>
                                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'hsla(220, 40%, 20%, 0.8)' }}>
                                  <div className="h-full rounded-full" style={{
                                    width: `${Math.min(pct, 100)}%`,
                                    background: isCurrent ? 'hsl(200, 80%, 55%)' : 'hsl(220, 30%, 40%)',
                                  }} />
                                </div>
                                <span className="text-[10px] font-mono shrink-0" style={{ color: 'hsl(220, 20%, 50%)' }}>
                                  {hrs}h/{catLimit}h
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Document Preview */}
                  <div className="space-y-5">
                    <div className="glass-card rounded-xl p-5 h-72 flex flex-col items-center justify-center" style={{ borderColor: 'hsla(200, 80%, 50%, 0.15)' }}>
                      <FileText className="h-16 w-16 mb-4" style={{ color: 'hsl(220, 20%, 30%)' }} />
                      <p className="text-sm" style={{ color: 'hsl(220, 20%, 45%)' }}>Preview do Documento</p>
                      <p className="text-xs mt-1" style={{ color: 'hsl(220, 20%, 35%)' }}>PDF ou imagem será exibido aqui</p>
                    </div>

                    {/* Decision Panel */}
                    <div className="space-y-3">
                      {/* Reject field */}
                      {showRejectField && (
                        <div className="glass-card rounded-xl p-4 space-y-3" style={{ borderColor: 'hsla(0, 72%, 50%, 0.2)' }}>
                          <p className="text-xs font-display tracking-wider uppercase" style={{ color: 'hsl(0, 72%, 55%)' }}>Justificativa de Indeferimento *</p>
                          <Textarea
                            placeholder="Explique o motivo da reprovação..."
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            className="border-0 text-sm text-white placeholder:text-gray-500 min-h-[80px]"
                            style={{ background: 'hsla(220, 40%, 18%, 0.8)', border: '1px solid hsla(0, 72%, 50%, 0.2)' }}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleReject(selected.id)}
                              className="flex-1 font-display text-xs tracking-wider uppercase border-0"
                              style={{ background: 'hsl(0, 72%, 45%)', color: 'white' }}>
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Confirmar Indeferimento
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowRejectField(false)}
                              className="text-xs" style={{ color: 'hsl(220, 20%, 55%)' }}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Adjustment field */}
                      {showAdjustField && (
                        <div className="glass-card rounded-xl p-4 space-y-3" style={{ borderColor: 'hsla(38, 92%, 50%, 0.2)' }}>
                          <p className="text-xs font-display tracking-wider uppercase" style={{ color: 'hsl(38, 92%, 55%)' }}>Descreva o ajuste necessário *</p>
                          <Textarea
                            placeholder="Ex: Certificado sem assinatura, envie novamente..."
                            value={adjustmentNote}
                            onChange={(e) => setAdjustmentNote(e.target.value)}
                            className="border-0 text-sm text-white placeholder:text-gray-500 min-h-[80px]"
                            style={{ background: 'hsla(220, 40%, 18%, 0.8)', border: '1px solid hsla(38, 92%, 50%, 0.2)' }}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAdjust(selected.id)}
                              className="flex-1 font-display text-xs tracking-wider uppercase border-0"
                              style={{ background: 'hsl(38, 92%, 45%)', color: 'white' }}>
                              <Pencil className="h-3.5 w-3.5 mr-1" /> Solicitar Ajuste
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowAdjustField(false)}
                              className="text-xs" style={{ color: 'hsl(220, 20%, 55%)' }}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      {!showRejectField && !showAdjustField && (
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            onClick={() => handleApprove(selected.id)}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.03]"
                            style={{ background: 'hsla(152, 60%, 50%, 0.12)', border: '1px solid hsla(152, 60%, 50%, 0.25)', color: 'hsl(152, 60%, 55%)' }}
                          >
                            <CheckCircle2 className="h-6 w-6" />
                            <span className="text-xs font-display tracking-wider uppercase">Deferir</span>
                          </button>
                          <button
                            onClick={() => setShowAdjustField(true)}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.03]"
                            style={{ background: 'hsla(38, 92%, 50%, 0.12)', border: '1px solid hsla(38, 92%, 50%, 0.25)', color: 'hsl(38, 92%, 55%)' }}
                          >
                            <Pencil className="h-6 w-6" />
                            <span className="text-xs font-display tracking-wider uppercase">Ajuste</span>
                          </button>
                          <button
                            onClick={() => setShowRejectField(true)}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.03]"
                            style={{ background: 'hsla(0, 72%, 50%, 0.12)', border: '1px solid hsla(0, 72%, 50%, 0.25)', color: 'hsl(0, 72%, 55%)' }}
                          >
                            <XCircle className="h-6 w-6" />
                            <span className="text-xs font-display tracking-wider uppercase">Indeferir</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Professor;
