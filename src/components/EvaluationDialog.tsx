import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Submission, categoryLabels, ActivityCategory } from '@/data/data';
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
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto border-0"
        style={{
          background: 'linear-gradient(165deg, hsl(220, 55%, 13%), hsl(225, 50%, 10%))',
          border: '1px solid hsla(200, 80%, 50%, 0.12)',
          boxShadow: '0 0 60px -15px hsla(200, 80%, 50%, 0.15), 0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-display tracking-wider uppercase text-white text-glow">
            Análise de Atividade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student & Activity Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="space-y-3 rounded-lg p-4"
              style={{
                background: 'hsla(220, 50%, 15%, 0.5)',
                border: '1px solid hsla(200, 80%, 50%, 0.08)',
              }}
            >
              <div className="flex items-center gap-2 text-xs tracking-wider uppercase" style={{ color: 'hsl(200, 30%, 50%)' }}>
                <User className="h-4 w-4" /> Aluno
              </div>
              <div>
                <p className="font-semibold text-lg text-white">{submission.studentName}</p>
                <p className="text-sm" style={{ color: 'hsl(200, 20%, 50%)' }}>{submission.course} — Matrícula {submission.studentId}</p>
              </div>
            </div>
            <div
              className="space-y-3 rounded-lg p-4"
              style={{
                background: 'hsla(220, 50%, 15%, 0.5)',
                border: '1px solid hsla(200, 80%, 50%, 0.08)',
              }}
            >
              <div className="flex items-center gap-2 text-xs tracking-wider uppercase" style={{ color: 'hsl(200, 30%, 50%)' }}>
                <FileText className="h-4 w-4" /> Atividade
              </div>
              <div>
                <p className="font-semibold text-white">{submission.activityTitle}</p>
                <Badge variant="outline" className="mt-1 border-cyan-500/30 text-cyan-400">{categoryLabels[submission.category]}</Badge>
              </div>
            </div>
          </div>

          <p className="text-sm" style={{ color: 'hsl(200, 20%, 55%)' }}>{submission.description}</p>

          <Separator style={{ background: 'hsla(200, 80%, 50%, 0.1)' }} />

          {/* Hours comparison */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-white font-display text-sm tracking-wider uppercase">
              <Clock className="h-4 w-4" style={{ color: 'hsl(200, 80%, 60%)' }} /> Comparativo de Carga Horária
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  background: 'hsla(220, 50%, 15%, 0.5)',
                  border: '1px solid hsla(200, 80%, 50%, 0.1)',
                }}
              >
                <p className="text-xs tracking-wider uppercase mb-2" style={{ color: 'hsl(200, 30%, 50%)' }}>Declarado</p>
                <p className="text-3xl font-bold font-mono" style={{ color: 'hsl(200, 80%, 65%)' }}>{submission.hoursRequested}h</p>
              </div>
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  background: submission.hoursRequested !== submission.hoursInDocument
                    ? 'hsla(38, 92%, 50%, 0.08)'
                    : 'hsla(152, 60%, 40%, 0.08)',
                  border: `1px solid ${submission.hoursRequested !== submission.hoursInDocument
                    ? 'hsla(38, 92%, 50%, 0.25)'
                    : 'hsla(152, 60%, 40%, 0.25)'}`,
                }}
              >
                <p className="text-xs tracking-wider uppercase mb-2" style={{ color: 'hsl(200, 30%, 50%)' }}>Documento</p>
                <p className="text-3xl font-bold font-mono" style={{
                  color: submission.hoursRequested !== submission.hoursInDocument
                    ? 'hsl(38, 92%, 60%)'
                    : 'hsl(152, 60%, 55%)',
                }}>{submission.hoursInDocument}h</p>
              </div>
            </div>
            {submission.hoursRequested !== submission.hoursInDocument && (
              <div
                className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg"
                style={{
                  color: 'hsl(38, 92%, 65%)',
                  background: 'hsla(38, 92%, 50%, 0.08)',
                  border: '1px solid hsla(38, 92%, 50%, 0.2)',
                }}
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Divergência de {Math.abs(submission.hoursRequested - submission.hoursInDocument)}h entre o declarado e o documento.
              </div>
            )}
          </div>

          <Separator style={{ background: 'hsla(200, 80%, 50%, 0.1)' }} />

          {/* Student history */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white font-display text-sm tracking-wider uppercase">Histórico — {categoryLabels[submission.category]}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'hsl(200, 20%, 55%)' }}>Horas acumuladas</span>
                <span className="font-mono font-medium" style={{ color: 'hsl(200, 80%, 65%)' }}>{accumulated}h / {limit}h</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
            {exceedsLimit && (
              <div
                className="flex items-start gap-2 text-sm px-4 py-3 rounded-lg"
                style={{
                  color: 'hsl(0, 72%, 65%)',
                  background: 'hsla(0, 72%, 51%, 0.08)',
                  border: '1px solid hsla(0, 72%, 51%, 0.2)',
                }}
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Limite será ultrapassado!</p>
                  <p style={{ color: 'hsl(0, 50%, 60%)' }}>O aluno já tem {accumulated}h e solicita {submission.hoursRequested}h (total: {afterApproval}h). Limite: {limit}h. Sugestão: aprovar apenas <strong>{suggestedHours}h</strong>.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {(Object.keys(submission.studentAccumulatedHours) as ActivityCategory[]).map((cat) => (
                <div
                  key={cat}
                  className="rounded-lg p-3 text-center"
                  style={{
                    background: 'hsla(220, 50%, 15%, 0.5)',
                    border: '1px solid hsla(200, 80%, 50%, 0.08)',
                  }}
                >
                  <p className="text-xs" style={{ color: 'hsl(200, 20%, 50%)' }}>{categoryLabels[cat]}</p>
                  <p className="font-mono font-medium mt-1 text-sm" style={{ color: 'hsl(200, 80%, 65%)' }}>
                    {submission.studentAccumulatedHours[cat]}h / {submission.categoryLimits[cat]}h
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator style={{ background: 'hsla(200, 80%, 50%, 0.1)' }} />

          {/* Document viewer placeholder */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2 text-white font-display text-sm tracking-wider uppercase">
              <FileText className="h-4 w-4" style={{ color: 'hsl(200, 80%, 60%)' }} /> Documento Comprobatório
            </h3>
            <div
              className="rounded-lg flex items-center justify-center h-48"
              style={{
                background: 'hsla(220, 50%, 12%, 0.5)',
                border: '2px dashed hsla(200, 80%, 50%, 0.12)',
              }}
            >
              <div className="text-center">
                <FileText className="h-10 w-10 mx-auto mb-2" style={{ color: 'hsl(200, 30%, 35%)' }} />
                <p className="text-sm" style={{ color: 'hsl(200, 20%, 45%)' }}>Visualizador de documento</p>
                <p className="text-xs" style={{ color: 'hsl(200, 20%, 35%)' }}>PDF/Imagem do certificado será exibido aqui</p>
              </div>
            </div>
          </div>

          <Separator style={{ background: 'hsla(200, 80%, 50%, 0.1)' }} />

          {/* Decision panel */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white font-display text-sm tracking-wider uppercase">Painel de Decisão</h3>

            {decisionMode !== 'none' && (
              <div className="space-y-2">
                <Textarea
                  placeholder={decisionMode === 'reject' ? 'Justificativa técnica para o indeferimento (obrigatório)...' : 'Descreva o ajuste necessário...'}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={3}
                  className="text-white placeholder:text-white/30"
                  style={{
                    background: 'hsla(220, 50%, 15%, 0.5)',
                    borderColor: 'hsla(200, 80%, 50%, 0.15)',
                  }}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {decisionMode === 'none' ? (
                <>
                  <Button
                    onClick={handleApprove}
                    className="gap-2 font-medium"
                    style={{
                      background: 'linear-gradient(135deg, hsl(152, 60%, 35%), hsl(160, 60%, 40%))',
                      boxShadow: '0 0 20px -5px hsla(152, 60%, 40%, 0.4)',
                    }}
                  >
                    <CheckCircle className="h-4 w-4" /> Deferir
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDecisionMode('adjust')}
                    className="gap-2"
                    style={{
                      borderColor: 'hsla(38, 92%, 50%, 0.3)',
                      color: 'hsl(38, 92%, 60%)',
                      background: 'hsla(38, 92%, 50%, 0.05)',
                    }}
                  >
                    <Edit3 className="h-4 w-4" /> Solicitar Ajuste
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDecisionMode('reject')}
                    className="gap-2"
                    style={{
                      borderColor: 'hsla(0, 72%, 51%, 0.3)',
                      color: 'hsl(0, 72%, 60%)',
                      background: 'hsla(0, 72%, 51%, 0.05)',
                    }}
                  >
                    <XCircle className="h-4 w-4" /> Indeferir
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={decisionMode === 'reject' ? handleReject : handleAdjust}
                    className="font-medium"
                    style={{
                      background: decisionMode === 'reject'
                        ? 'linear-gradient(135deg, hsl(0, 72%, 45%), hsl(0, 72%, 55%))'
                        : 'linear-gradient(135deg, hsl(38, 92%, 45%), hsl(38, 92%, 55%))',
                      boxShadow: decisionMode === 'reject'
                        ? '0 0 20px -5px hsla(0, 72%, 51%, 0.4)'
                        : '0 0 20px -5px hsla(38, 92%, 50%, 0.4)',
                    }}
                  >
                    Confirmar {decisionMode === 'reject' ? 'Indeferimento' : 'Solicitação de Ajuste'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { setDecisionMode('none'); setJustification(''); }}
                    className="text-white/50 hover:text-white hover:bg-white/5"
                  >
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
