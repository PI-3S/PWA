import { useState, useMemo } from 'react';
import { mockSubmissions, Submission, SubmissionStatus } from '@/data/mockData';
import StatusCards from '@/components/StatusCards';
import FilterBar from '@/components/FilterBar';
import SubmissionQueue from '@/components/SubmissionQueue';
import EvaluationDialog from '@/components/EvaluationDialog';
import { toast } from 'sonner';
import { Bell, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import logoWhite from '@/assets/logo-white.png';

const Coordenador = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const courses = useMemo(() => [...new Set(submissions.map((s) => s.course))], [submissions]);

  const counts = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const thisMonth = submissions.filter((s) => {
      const d = new Date(s.submissionDate);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    return {
      pending: submissions.filter((s) => s.status === 'pendente').length,
      approved: thisMonth.filter((s) => s.status === 'deferido').length,
      rejected: thisMonth.filter((s) => s.status === 'indeferido').length,
      adjustment: submissions.filter((s) => s.status === 'ajuste').length,
    };
  }, [submissions]);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const matchesSearch =
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.activityTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
      const matchesCourse = courseFilter === 'all' || s.course === courseFilter;
      return matchesSearch && matchesCategory && matchesCourse;
    });
  }, [submissions, searchTerm, categoryFilter, courseFilter]);

  const handleDecision = (id: string, status: SubmissionStatus, justification?: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status, justification: justification || s.justification } : s
      )
    );
    const labels = { deferido: 'deferida', indeferido: 'indeferida', ajuste: 'encaminhada para ajuste' };
    toast.success(`Solicitação ${labels[status as keyof typeof labels]} com sucesso.`);
  };

  return (
    <div className="min-h-screen futuristic-bg grid-pattern relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-10 blur-[150px] pointer-events-none" style={{ background: 'hsl(200, 80%, 50%)' }} />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-[130px] pointer-events-none" style={{ background: 'hsl(30, 95%, 55%)' }} />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-header">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium glow-border hover:bg-white/5"
              style={{ color: 'hsl(200, 30%, 65%)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <div className="h-6 w-px" style={{ background: 'hsla(200, 80%, 50%, 0.15)' }} />
            <img src={logoWhite} alt="Logo" className="h-9 w-auto" />
            <div>
              <h1 className="text-base font-bold tracking-wider text-white font-display uppercase text-xs">Atividades Complementares</h1>
              <p className="text-xs" style={{ color: 'hsl(200, 30%, 50%)' }}>Painel do Coordenador</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg transition-all duration-300 glow-border hover:bg-white/5" style={{ color: 'hsl(200, 30%, 65%)' }}>
              <Bell className="h-5 w-5" />
              {counts.pending > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-urgent text-urgent-foreground border-2 animate-pulse-slow" style={{ borderColor: 'hsl(220, 65%, 8%)' }}>
                  {counts.pending}
                </Badge>
              )}
            </button>
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold font-display"
              style={{
                background: 'linear-gradient(135deg, hsl(30, 95%, 55%), hsl(35, 95%, 65%))',
                color: 'hsl(220, 65%, 8%)',
                boxShadow: '0 0 20px -5px hsla(30, 95%, 55%, 0.4)',
              }}
            >
              C
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 space-y-8 relative z-10">
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-white font-display uppercase text-glow">Visão Geral</h2>
          <p className="text-sm mt-1" style={{ color: 'hsl(200, 30%, 50%)' }}>Resumo das solicitações de atividades complementares</p>
        </div>

        <StatusCards
          pending={counts.pending}
          approved={counts.approved}
          rejected={counts.rejected}
          adjustment={counts.adjustment}
        />

        <div className="space-y-5">
          <h2 className="text-xl font-bold tracking-wider text-white font-display uppercase">Fila de Análise</h2>
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            courseFilter={courseFilter}
            onCourseChange={setCourseFilter}
            courses={courses}
          />
          <SubmissionQueue submissions={filtered} onSelect={setSelectedSubmission} />
        </div>
      </main>

      <EvaluationDialog
        submission={selectedSubmission}
        open={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        onDecision={handleDecision}
      />
    </div>
  );
};

export default Coordenador;
