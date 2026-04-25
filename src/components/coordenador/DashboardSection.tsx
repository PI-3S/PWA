import React, { useState, useCallback } from 'react';
import { FileText, Clock, CheckCircle2, XCircle, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppTheme } from '@/hooks/useapptheme';
import { DashboardMetrics, Submissao } from '@/types/coordenador';

interface DashboardSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  user: { uid: string };
  colors: ReturnType<typeof useAppTheme>['colors'];
  toastSuccess: (msg: string) => void;
  toastError: (msg: string) => void;
  accentBlue: string;
  accentOrange: string;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  apiFetch,
  user,
  colors,
  toastSuccess,
  toastError,
  accentBlue,
  accentOrange,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const [approveDialog, setApproveDialog] = useState(false);
  const [approveSubmissao, setApproveSubmissao] = useState<Submissao | null>(null);
  const [approveHoras, setApproveHoras] = useState(0);

  const [correcaoDialog, setCorrecaoDialog] = useState(false);
  const [correcaoSubmissao, setCorrecaoSubmissao] = useState<Submissao | null>(null);
  const [correcaoObs, setCorrecaoObs] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      const d = await apiFetch('/api/dashboard/coordenador');
      const metricas = d.metricas || d;
      setMetrics({
        total_submissoes: metricas.total_submissoes || 0,
        pendentes: metricas.pendentes || 0,
        aprovadas: metricas.aprovadas || 0,
        reprovadas: metricas.reprovadas || 0,
        por_curso: metricas.por_curso || [],
        total_alunos: metricas.total_alunos || metricas.quantidade_alunos || 0,
      });
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao carregar métricas.');
    }
  }, [apiFetch, toastError]);

  const fetchSubmissoes = useCallback(async () => {
    try {
      const [subsData, usuariosData, regrasData, cursosData] = await Promise.all([
        apiFetch('/api/submissoes'),
        apiFetch('/api/usuarios'),
        apiFetch('/api/regras'),
        apiFetch('/api/cursos'),
      ]);

      const raw = Array.isArray(subsData) ? subsData : subsData.submissoes || subsData.data || [];

      const usuariosMap = new Map<string, string>();
      (Array.isArray(usuariosData) ? usuariosData : (usuariosData.usuarios || [])).forEach((u: any) => {
        usuariosMap.set(u.id, u.nome);
      });

      const regrasMap = new Map<string, { area: string; curso_id: string }>();
      (Array.isArray(regrasData) ? regrasData : (regrasData.regras || [])).forEach((r: any) => {
        regrasMap.set(r.id, { area: r.area, curso_id: r.curso_id });
      });

      const cursosMap = new Map<string, string>();
      (Array.isArray(cursosData) ? cursosData : (cursosData.cursos || [])).forEach((c: any) => {
        cursosMap.set(c.id, c.nome);
      });

      const mapped = raw.map((s: any) => {
        const regra = regrasMap.get(s.regra_id);
        return {
          id: s.id,
          aluno_id: s.aluno_id || s.userId || s.usuario_id || '',
          aluno_nome: s.aluno_nome || s.nome_aluno || s.aluno?.nome || s.usuario?.nome || usuariosMap.get(s.aluno_id) || '—',
          curso_nome: s.curso_nome || s.nome_curso || s.curso?.nome || (regra ? cursosMap.get(regra.curso_id) : '—') || '—',
          area: s.area || s.area_atividade || s.categoria || (regra ? regra.area : '—') || '—',
          horas_solicitadas: s.horas_solicitadas || s.carga_horaria_solicitada || s.carga_horaria || 0,
          status: s.status || 'pendente',
          data_envio: s.data_envio || s.created_at || s.dataCriacao || new Date().toISOString(),
          data_validacao: s.data_validacao || s.updated_at || s.dataAtualizacao,
          descricao: s.descricao || s.description || '',
          observacao: s.observacao || s.observacoes || '',
        };
      });

      setSubmissoes(mapped);
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao carregar submissões.');
    }
  }, [apiFetch, toastError]);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([fetchDashboard(), fetchSubmissoes()]).finally(() => setLoading(false));
  }, [fetchDashboard, fetchSubmissoes]);

  const handleDecision = async (id: string, status: 'aprovado' | 'reprovado' | 'correcao', observacao?: string, horasAprovadas?: number) => {
    setIsActionLoading(id);
    try {
      const body: any = { status, coordenador_id: user?.uid };
      if (status === 'correcao' && observacao) body.observacao = observacao;
      if (status === 'aprovado' && horasAprovadas !== undefined) body.horas_aprovadas = horasAprovadas;

      await apiFetch(`/api/submissoes/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

      const statusLabels = { aprovado: 'aprovada', reprovado: 'reprovada', correcao: 'enviada para correção' };
      toastSuccess(`Submissão ${statusLabels[status]}!`);
      setSubmissoes(prev => prev.map(s => s.id === id ? { ...s, status: status as any, observacao } : s));
      await Promise.all([fetchDashboard(), fetchSubmissoes()]);
      setCorrecaoDialog(false);
      setCorrecaoSubmissao(null);
      setCorrecaoObs('');
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao processar decisão.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const openCorrecaoDialog = (submissao: Submissao) => {
    setCorrecaoSubmissao(submissao);
    setCorrecaoObs('');
    setCorrecaoDialog(true);
  };

  const openApproveDialog = (submissao: Submissao) => {
    setApproveSubmissao(submissao);
    setApproveHoras(submissao.horas_solicitadas || 0);
    setApproveDialog(true);
  };

  const statusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; border: string; icon: any }> = {
      aprovado: { bg: 'hsla(152, 60%, 40%, 0.12)', text: 'hsl(152, 60%, 55%)', border: 'hsla(152, 60%, 40%, 0.3)', icon: CheckCircle2 },
      reprovado: { bg: 'hsla(0, 72%, 50%, 0.12)', text: 'hsl(0, 72%, 60%)', border: 'hsla(0, 72%, 50%, 0.3)', icon: XCircle },
      pendente: { bg: 'hsla(38, 92%, 50%, 0.12)', text: 'hsl(38, 92%, 60%)', border: 'hsla(38, 92%, 50%, 0.3)', icon: Clock },
      correcao: { bg: 'hsla(45, 95%, 50%, 0.12)', text: 'hsl(45, 95%, 55%)', border: 'hsla(45, 95%, 50%, 0.3)', icon: AlertTriangle },
    };
    const config = configs[status] || configs.pendente;
    const Icon = config.icon;
    return (
      <Badge style={{ background: config.bg, color: config.text, border: `1px solid ${config.border}` }}>
        <Icon className="h-3 w-3 mr-1" />
        {status === 'correcao' ? 'Correção' : status}
      </Badge>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: accentOrange }} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total', value: metrics?.total_submissoes || 0, icon: FileText, color: accentBlue },
                { label: 'Pendentes', value: metrics?.pendentes || 0, icon: Clock, color: accentOrange },
                { label: 'Aprovadas', value: metrics?.aprovadas || 0, icon: CheckCircle2, color: 'hsl(152, 60%, 50%)' },
                { label: 'Reprovadas', value: metrics?.reprovadas || 0, icon: XCircle, color: 'hsl(0, 72%, 55%)' },
                { label: 'Total Alunos', value: metrics?.total_alunos || 0, icon: Users, color: 'hsl(280, 60%, 55%)' },
              ].map((card) => (
                <div key={card.label} className="p-5 rounded-xl border transition-all" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
                  <card.icon className="h-5 w-5 mb-3" style={{ color: card.color }} />
                  <p className="text-[10px] uppercase tracking-wider opacity-50 font-display">{card.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: colors.titleColor }}>{card.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-6 border overflow-x-auto" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
              <h3 className="text-sm font-display uppercase tracking-wider mb-4" style={{ color: colors.titleColor }}>
                Fila de Prioridade (Pendentes)
              </h3>
              <div className="space-y-3">
                {submissoes.filter(s => s.status === 'pendente').slice(0, 5).map(s => (
                  <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border" style={{ background: colors.inputBg, borderColor: colors.inputBorder }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>{s.aluno_nome}</p>
                      <p className="text-xs opacity-50">{s.curso_nome} • {s.area}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => openApproveDialog(s)} className="bg-emerald-600 hover:bg-emerald-500 text-white">Aprovar</Button>
                      <Button size="sm" variant="outline" onClick={() => openCorrecaoDialog(s)} style={{ borderColor: 'hsl(45, 95%, 50%)', color: 'hsl(45, 95%, 55%)' }}>
                        <AlertTriangle className="h-3 w-3 mr-1" /> Correção
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDecision(s.id, 'reprovado')} style={{ borderColor: 'hsl(0, 72%, 50%)', color: 'hsl(0, 72%, 60%)' }}>Reprovar</Button>
                    </div>
                  </div>
                ))}
                {submissoes.filter(s => s.status === 'pendente').length === 0 && (
                  <p className="text-center py-8 opacity-50">Nenhuma submissão pendente.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Correção */}
      <Dialog open={correcaoDialog} onOpenChange={setCorrecaoDialog}>
        <DialogContent style={{ background: colors.panelBg, border: `1px solid ${colors.cardBorder}` }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Solicitar Correção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Descreva o que precisa ser corrigido na submissão de <strong>{correcaoSubmissao?.aluno_nome}</strong>.
            </p>
            <Textarea placeholder="Observação obrigatória..." value={correcaoObs} onChange={e => setCorrecaoObs(e.target.value)} style={{ background: colors.inputBg, color: colors.textPrimary, border: `1px solid ${colors.inputBorder}` }} rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCorrecaoDialog(false)}>Cancelar</Button>
            <Button onClick={() => correcaoSubmissao && handleDecision(correcaoSubmissao.id, 'correcao', correcaoObs)} disabled={!correcaoObs.trim() || isActionLoading === correcaoSubmissao?.id} style={{ background: 'hsl(45, 95%, 50%)', color: 'black' }}>
              {isActionLoading === correcaoSubmissao?.id ? <Loader2 className="animate-spin mr-2" /> : null}
              Enviar para Correção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Aprovar com horas */}
      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent style={{ background: colors.panelBg, border: `1px solid ${colors.cardBorder}` }}>
          <DialogHeader>
            <DialogTitle style={{ color: colors.textPrimary }}>Aprovar Submissão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Aluno: <strong>{approveSubmissao?.aluno_nome}</strong>
            </p>
            <div>
              <label className="text-xs mb-1 block" style={{ color: colors.labelColor }}>Horas a aprovar</label>
              <Input type="number" min={1} value={approveHoras} onChange={e => setApproveHoras(Number(e.target.value))} style={{ background: colors.inputBg, color: colors.textPrimary, border: `1px solid ${colors.inputBorder}` }} />
              <p className="text-xs mt-1" style={{ color: colors.labelColor }}>Solicitado: {approveSubmissao?.horas_solicitadas || 0}h</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(false)}>Cancelar</Button>
            <Button onClick={() => { if (approveSubmissao) { handleDecision(approveSubmissao.id, 'aprovado', undefined, approveHoras); setApproveDialog(false); } }} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardSection;
