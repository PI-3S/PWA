import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Submission, categoryLabels, ActivityCategory } from '@/data/mockData';
import { CheckCircle, XCircle, Edit3, AlertTriangle, FileText, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

interface EvaluationDialogProps {
  submission: Submission | null;
  open: boolean;
  onClose: () => void;
  onDecision: (id: string, status: 'deferido' | 'indeferido' | 'ajuste', justification?: string) => void;
}

const EvaluationDialog = ({ submission, open, onClose, onDecision }: EvaluationDialogProps) => {
  const [justification, setJustification] = useState('');
  const [decisionMode, setDecisionMode] = useState<'none' | 'reject' | 'adjust'>('none');

  if (!submission) return null;

  const accumulated = submission.studentAccumulatedHours[submission.category];
  const limit = submission.categoryLimits[submission.category];
  const afterApproval = accumulated + submission.hoursRequested;
  const exceedsLimit = afterApproval > limit;
  const suggestedHours = Math.max(0, limit - accumulated);
  const progressPercent = Math.min(100, (accumulated / limit) * 100);

  const handleApprove = () => {
    if (exceedsLimit) {
      toast.warning(`Limite excedido! Sugerimos aprovar apenas ${suggestedHours}h.`);
    }
    onDecision(submission.id, 'deferido');
    resetAndClose();
  };

  const handleReject = () => {
    if (!justification.trim()) {
      toast.error('A justificativa é obrigatória para indeferimento.');
      return;
    }
    onDecision(submission.id, 'indeferido', justification);
    resetAndClose();
  };

  const handleAdjust = () => {
    if (!justification.trim()) {
      toast.error('Descreva o ajuste necessário.');
      return;
    }
    onDecision(submission.id, 'ajuste', justification);
    resetAndClose();
  };

  const resetAndClose = () => {
    setJustification('');
    setDecisionMode('none');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Análise de Atividade</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student & Activity Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" /> Aluno
              </div>
              <div>
                <p className="font-semibold text-lg">{submission.studentName}</p>
                <p className="text-sm text-muted-foreground">{submission.course} — Matrícula {submission.studentId}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" /> Atividade
              </div>
              <div>
                <p className="font-semibold">{submission.activityTitle}</p>
                <Badge variant="outline" className="mt-1">{categoryLabels[submission.category]}</Badge>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{submission.description}</p>

          <Separator />

          {/* Hours comparison */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" /> Comparativo de Carga Horária
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Declarado pelo aluno</p>
                <p className="text-3xl font-bold font-mono">{submission.hoursRequested}h</p>
              </div>
              <div className={`rounded-lg border p-4 text-center ${submission.hoursRequested !== submission.hoursInDocument ? 'border-warning bg-warning/5' : 'border-approved bg-approved/5'}`}>
                <p className="text-sm text-muted-foreground mb-1">Consta no documento</p>
                <p className="text-3xl font-bold font-mono">{submission.hoursInDocument}h</p>
              </div>
            </div>
            {submission.hoursRequested !== submission.hoursInDocument && (
              <div className="flex items-center gap-2 text-sm text-warning bg-warning/10 px-3 py-2 rounded-md">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Divergência de {Math.abs(submission.hoursRequested - submission.hoursInDocument)}h entre o declarado e o documento.
              </div>
            )}
          </div>

          <Separator />

          {/* Student history */}
          <div className="space-y-4">
            <h3 className="font-semibold">Histórico do Aluno — {categoryLabels[submission.category]}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Horas acumuladas</span>
                <span className="font-mono font-medium">{accumulated}h / {limit}h</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
            {exceedsLimit && (
              <div className="flex items-start gap-2 text-sm text-urgent bg-urgent/10 px-3 py-2 rounded-md">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Limite será ultrapassado!</p>
                  <p>O aluno já tem {accumulated}h e solicita {submission.hoursRequested}h (total: {afterApproval}h). Limite: {limit}h. Sugestão: aprovar apenas <strong>{suggestedHours}h</strong>.</p>
                </div>
              </div>
            )}

            {/* All categories summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {(Object.keys(submission.studentAccumulatedHours) as ActivityCategory[]).map((cat) => (
                <div key={cat} className="rounded border p-2 text-center text-xs">
                  <p className="text-muted-foreground">{categoryLabels[cat]}</p>
                  <p className="font-mono font-medium mt-1">
                    {submission.studentAccumulatedHours[cat]}h / {submission.categoryLimits[cat]}h
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Document viewer placeholder */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" /> Documento Comprobatório
            </h3>
            <div className="rounded-lg border-2 border-dashed bg-muted/30 flex items-center justify-center h-48">
              <div className="text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Visualizador de documento</p>
                <p className="text-xs">PDF/Imagem do certificado será exibido aqui</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Decision panel */}
          <div className="space-y-4">
            <h3 className="font-semibold">Painel de Decisão</h3>

            {decisionMode !== 'none' && (
              <div className="space-y-2">
                <Textarea
                  placeholder={decisionMode === 'reject' ? 'Justificativa técnica para o indeferimento (obrigatório)...' : 'Descreva o ajuste necessário...'}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {decisionMode === 'none' ? (
                <>
                  <Button onClick={handleApprove} className="bg-approved hover:bg-approved/90 text-approved-foreground gap-2">
                    <CheckCircle className="h-4 w-4" /> Deferir
                  </Button>
                  <Button variant="outline" onClick={() => setDecisionMode('adjust')} className="border-warning text-warning hover:bg-warning/10 gap-2">
                    <Edit3 className="h-4 w-4" /> Solicitar Ajuste
                  </Button>
                  <Button variant="outline" onClick={() => setDecisionMode('reject')} className="border-rejected text-rejected hover:bg-rejected/10 gap-2">
                    <XCircle className="h-4 w-4" /> Indeferir
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={decisionMode === 'reject' ? handleReject : handleAdjust}
                    className={decisionMode === 'reject' ? 'bg-rejected hover:bg-rejected/90 text-rejected-foreground' : 'bg-warning hover:bg-warning/90 text-warning-foreground'}
                  >
                    Confirmar {decisionMode === 'reject' ? 'Indeferimento' : 'Solicitação de Ajuste'}
                  </Button>
                  <Button variant="ghost" onClick={() => { setDecisionMode('none'); setJustification(''); }}>
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationDialog;
