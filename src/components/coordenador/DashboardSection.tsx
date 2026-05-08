import React, { useState, useCallback } from 'react';
import { FileText, Clock, CheckCircle2, XCircle, Users, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  onNavigateToSubmissoes?: () => void;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  apiFetch,
  user,
  colors,
  toastSuccess,
  toastError,
  accentBlue,
  accentOrange,
  onNavigateToSubmissoes,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);

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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-display uppercase tracking-wider" style={{ color: colors.titleColor }}>
                  Fila de Prioridade (Pendentes)
                </h3>
                {submissoes.filter(s => s.status === 'pendente').length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onNavigateToSubmissoes}
                    className="text-xs"
                    style={{ color: accentOrange }}
                  >
                    Ver todas <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {submissoes.filter(s => s.status === 'pendente').slice(0, 5).map(s => (
                  <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border" style={{ background: colors.inputBg, borderColor: colors.inputBorder }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>{s.aluno_nome}</p>
                      <p className="text-xs opacity-50">{s.curso_nome} • {s.area}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onNavigateToSubmissoes}
                      style={{ borderColor: colors.cardBorder }}
                    >
                      Avaliar
                    </Button>
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
    </>
  );
};

export default DashboardSection;
