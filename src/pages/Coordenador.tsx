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
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, hsl(220 60% 12%) 0%, hsl(220 60% 18%) 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40" style={{ background: 'hsla(220, 60%, 10%, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid hsla(220, 40%, 30%, 0.3)' }}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              style={{ color: 'hsl(220, 20%, 65%)', background: 'hsla(220, 40%, 25%, 0.4)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <div className="h-6 w-px" style={{ background: 'hsla(220, 40%, 40%, 0.3)' }} />
            <img src={logoWhite} alt="Logo" className="h-9 w-auto" />
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">Atividades Complementares</h1>
              <p className="text-xs" style={{ color: 'hsl(220, 20%, 55%)' }}>Painel do Coordenador</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg transition-colors" style={{ color: 'hsl(220, 20%, 65%)' }}>
              <Bell className="h-5 w-5" />
              {counts.pending > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-urgent text-urgent-foreground border-2" style={{ borderColor: 'hsl(220, 60%, 10%)' }}>
                  {counts.pending}
                </Badge>
              )}
            </button>
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: 'hsl(35, 95%, 55%)', color: 'hsl(220, 60%, 12%)' }}>
              C
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Visão Geral</h2>
          <p className="text-sm mt-1" style={{ color: 'hsl(220, 20%, 55%)' }}>Resumo das solicitações de atividades complementares</p>
        </div>

        <StatusCards
          pending={counts.pending}
          approved={counts.approved}
          rejected={counts.rejected}
          adjustment={counts.adjustment}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-white">Fila de Análise</h2>
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
