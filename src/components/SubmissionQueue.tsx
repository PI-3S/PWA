import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Submission, categoryLabels, statusLabels } from '@/data/mockData';
import { AlertTriangle } from 'lucide-react';

interface SubmissionQueueProps {
  submissions: Submission[];
  onSelect: (submission: Submission) => void;
}

const getStatusVariant = (status: Submission['status']) => {
  switch (status) {
    case 'pendente': return 'outline';
    case 'deferido': return 'default';
    case 'indeferido': return 'destructive';
    case 'ajuste': return 'secondary';
  }
};

const getStatusColor = (status: Submission['status']) => {
  switch (status) {
    case 'pendente': return 'border-pending text-pending';
    case 'deferido': return 'bg-approved text-approved-foreground border-approved';
    case 'indeferido': return 'bg-rejected text-rejected-foreground border-rejected';
    case 'ajuste': return 'border-warning text-warning';
  }
};

const isUrgent = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  return diff > 7 * 24 * 60 * 60 * 1000;
};

const SubmissionQueue = ({ submissions, onSelect }: SubmissionQueueProps) => {
  return (
    <div
      className="rounded-xl overflow-hidden scan-line"
      style={{
        background: 'linear-gradient(145deg, hsla(220, 50%, 15%, 0.7), hsla(220, 50%, 12%, 0.8))',
        border: '1px solid hsla(200, 80%, 50%, 0.1)',
        boxShadow: '0 0 30px -10px hsla(200, 80%, 50%, 0.08)',
      }}
    >
      <Table>
        <TableHeader>
          <TableRow style={{ background: 'hsla(220, 50%, 12%, 0.6)', borderColor: 'hsla(200, 80%, 50%, 0.08)' }}>
            <TableHead className="font-semibold text-xs tracking-wider uppercase" style={{ color: 'hsl(200, 30%, 50%)' }}>Aluno</TableHead>
            <TableHead className="font-semibold text-xs tracking-wider uppercase" style={{ color: 'hsl(200, 30%, 50%)' }}>Categoria</TableHead>
            <TableHead className="font-semibold text-xs tracking-wider uppercase" style={{ color: 'hsl(200, 30%, 50%)' }}>Atividade</TableHead>
            <TableHead className="font-semibold text-center text-xs tracking-wider uppercase" style={{ color: 'hsl(200, 30%, 50%)' }}>Horas</TableHead>
            <TableHead className="font-semibold text-xs tracking-wider uppercase" style={{ color: 'hsl(200, 30%, 50%)' }}>Enviado em</TableHead>
            <TableHead className="font-semibold text-center text-xs tracking-wider uppercase" style={{ color: 'hsl(200, 30%, 50%)' }}>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10" style={{ color: 'hsl(200, 20%, 45%)' }}>
                Nenhuma solicitação encontrada.
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((sub) => (
              <TableRow
                key={sub.id}
                className="cursor-pointer transition-all duration-300"
                style={{ borderColor: 'hsla(200, 80%, 50%, 0.06)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsla(200, 80%, 50%, 0.06)';
                  e.currentTarget.style.boxShadow = 'inset 3px 0 0 hsl(200, 80%, 50%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => onSelect(sub)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {sub.status === 'pendente' && isUrgent(sub.submissionDate) && (
                      <AlertTriangle className="h-4 w-4 text-urgent shrink-0 animate-pulse-slow" />
                    )}
                    <div>
                      <p className="font-medium text-white">{sub.studentName}</p>
                      <p className="text-xs" style={{ color: 'hsl(200, 20%, 45%)' }}>{sub.course}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm" style={{ color: 'hsl(200, 20%, 60%)' }}>{categoryLabels[sub.category]}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm max-w-[200px] truncate block" style={{ color: 'hsl(200, 20%, 60%)' }}>{sub.activityTitle}</span>
                </TableCell>
                <TableCell className="text-center font-mono font-semibold" style={{ color: 'hsl(200, 80%, 65%)' }}>{sub.hoursRequested}h</TableCell>
                <TableCell className="text-sm" style={{ color: 'hsl(200, 20%, 45%)' }}>
                  {new Date(sub.submissionDate).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(sub.status)} className={getStatusColor(sub.status)}>
                    {statusLabels[sub.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubmissionQueue;
