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
    <div className="rounded-lg border overflow-hidden" style={{ background: 'hsla(220, 40%, 20%, 0.5)', borderColor: 'hsla(220, 40%, 35%, 0.3)' }}>
      <Table>
        <TableHeader>
          <TableRow style={{ background: 'hsla(220, 40%, 18%, 0.5)' }}>
            <TableHead className="font-semibold">Aluno</TableHead>
            <TableHead className="font-semibold">Categoria</TableHead>
            <TableHead className="font-semibold">Atividade</TableHead>
            <TableHead className="font-semibold text-center">Horas</TableHead>
            <TableHead className="font-semibold">Enviado em</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                Nenhuma solicitação encontrada.
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((sub) => (
              <TableRow
                key={sub.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onSelect(sub)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {sub.status === 'pendente' && isUrgent(sub.submissionDate) && (
                      <AlertTriangle className="h-4 w-4 text-urgent shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">{sub.studentName}</p>
                      <p className="text-xs text-muted-foreground">{sub.course}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{categoryLabels[sub.category]}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm max-w-[200px] truncate block">{sub.activityTitle}</span>
                </TableCell>
                <TableCell className="text-center font-mono font-medium">{sub.hoursRequested}h</TableCell>
                <TableCell className="text-sm text-muted-foreground">
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
