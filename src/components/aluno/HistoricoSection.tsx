import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Submissao } from '@/types/aluno';

interface HistoricoSectionProps {
  submissoes: Submissao[];
  isLoading: boolean;
  colors: ReturnType<typeof useAppTheme>['colors'];
  accentGreen: string;
  onCorrigir?: (submissao: Submissao) => void;
}

const statusBadge = (status: string, colors: any, accentGreen: string) => {
  const s = status.toLowerCase();
  const configs: Record<string, { bg: string; text: string; border: string; icon: any; label: string }> = {
    aprovado: { bg: 'hsla(152, 60%, 40%, 0.12)', text: 'hsl(152, 60%, 45%)', border: 'hsla(152, 60%, 40%, 0.3)', icon: CheckCircle2, label: 'Aprovado' },
    reprovado: { bg: 'hsla(0, 72%, 50%, 0.12)', text: 'hsl(0, 72%, 50%)', border: 'hsla(0, 72%, 50%, 0.3)', icon: XCircle, label: 'Reprovado' },
    pendente: { bg: 'hsla(38, 92%, 50%, 0.12)', text: 'hsl(38, 80%, 40%)', border: 'hsla(38, 92%, 50%, 0.3)', icon: Clock, label: 'Pendente' },
    correcao: { bg: 'hsla(45, 95%, 50%, 0.12)', text: 'hsl(45, 85%, 38%)', border: 'hsla(45, 95%, 50%, 0.3)', icon: AlertTriangle, label: 'Correção' },
  };
  const config = configs[s] || configs.pendente;
  const Icon = config.icon;
  return (
    <Badge style={{ background: config.bg, color: config.text, border: `1px solid ${config.border}` }}>
      <Icon className="h-3 w-3 mr-1" />{config.label}
    </Badge>
  );
};

const HistoricoSection: React.FC<HistoricoSectionProps> = ({
  submissoes,
  isLoading,
  colors,
  accentGreen,
  onCorrigir,
}) => {
  return (
    <div className="rounded-xl border overflow-x-auto" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: accentGreen }} />
        </div>
      ) : (
        <table className="w-full text-left text-sm min-w-[500px]">
          <thead style={{ background: colors.sidebarBg }}>
            <tr className="text-[10px] uppercase font-display" style={{ color: colors.labelColor }}>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Horas</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: colors.cardBorder }}>
            {submissoes.map(s => {
              const statusLower = s.status.toLowerCase();
              const podeCorrigir = statusLower === 'reprovado' || statusLower === 'correcao';
              return (
                <React.Fragment key={s.id}>
                  <tr className="hover:opacity-80 transition-colors">
                    <td className="px-6 py-4 font-mono" style={{ color: colors.textSecondary }}>
                      {new Date(s.data_envio).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4" style={{ color: colors.textPrimary }}>{s.tipo}</td>
                    <td className="px-6 py-4 font-bold" style={{ color: colors.titleColor }}>{s.horas_solicitadas}h</td>
                    <td className="px-6 py-4">{statusBadge(s.status, colors, accentGreen)}</td>
                    <td className="px-6 py-4 text-right">
                      {podeCorrigir && onCorrigir && (
                        <button
                          type="button"
                          onClick={() => onCorrigir(s)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-opacity hover:opacity-80"
                          style={{ border: `1px solid ${accentGreen}`, color: accentGreen, background: `${accentGreen}12` }}
                        >
                          <RefreshCw className="h-3 w-3" />
                          Corrigir
                        </button>
                      )}
                    </td>
                  </tr>
                  {(statusLower === 'correcao' || statusLower === 'reprovado') && s.observacao && (
                    <tr>
                      <td colSpan={5} className="px-6 py-3" style={{ background: statusLower === 'reprovado' ? 'hsla(0, 72%, 50%, 0.1)' : 'hsla(45, 95%, 50%, 0.1)' }}>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 mt-0.5" style={{ color: statusLower === 'reprovado' ? 'hsl(0, 72%, 60%)' : 'hsl(45, 95%, 55%)' }} />
                          <div>
                            <p className="text-[10px] uppercase font-bold mb-1" style={{ color: statusLower === 'reprovado' ? 'hsl(0, 72%, 60%)' : 'hsl(45, 95%, 55%)' }}>
                              {statusLower === 'reprovado' ? 'Motivo da Reprovação' : 'Observação do Coordenador'}
                            </p>
                            <p className="text-sm" style={{ color: colors.textPrimary }}>{s.observacao}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {submissoes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center" style={{ color: colors.labelColor }}>
                  Nenhuma submissão encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistoricoSection;
