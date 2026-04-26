import React from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Submissao } from '@/types/aluno';

interface HistoricoSectionProps {
  submissoes: Submissao[];
  isLoading: boolean;
  colors: ReturnType<typeof useAppTheme>['colors'];
  accentGreen: string;
}

const statusBadge = (status: string, colors: any, accentGreen: string) => {
  const s = status.toLowerCase();
  const configs: Record<string, JSX.Element> = {
    aprovado: (
      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="h-3 w-3 mr-1" />Aprovado
      </Badge>
    ),
    reprovado: (
      <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
        <XCircle className="h-3 w-3 mr-1" />Reprovado
      </Badge>
    ),
    pendente: (
      <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">
        <Clock className="h-3 w-3 mr-1" />Pendente
      </Badge>
    ),
    correcao: (
      <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        <AlertTriangle className="h-3 w-3 mr-1" />Correção
      </Badge>
    ),
  };
  return configs[s] || configs.pendente;
};

const HistoricoSection: React.FC<HistoricoSectionProps> = ({
  submissoes,
  isLoading,
  colors,
  accentGreen,
}) => {
  return (
    <div className="rounded-xl border overflow-x-auto" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <table className="w-full text-left text-sm min-w-[500px]">
          <thead style={{ background: colors.sidebarBg }}>
            <tr className="text-[10px] uppercase font-display" style={{ color: accentGreen }}>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Horas</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: colors.cardBorder }}>
            {submissoes.map(s => (
              <React.Fragment key={s.id}>
                <tr className="hover:opacity-80 transition-colors">
                  <td className="px-6 py-4 font-mono" style={{ color: colors.textSecondary }}>
                    {new Date(s.data_envio).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4" style={{ color: colors.textPrimary }}>{s.tipo}</td>
                  <td className="px-6 py-4 font-bold" style={{ color: colors.titleColor }}>{s.horas_solicitadas}h</td>
                  <td className="px-6 py-4">{statusBadge(s.status, colors, accentGreen)}</td>
                </tr>
                {s.status.toLowerCase() === 'correcao' && s.observacao && (
                  <tr>
                    <td colSpan={4} className="px-6 py-3" style={{ background: 'hsla(45, 95%, 50%, 0.1)' }}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5" style={{ color: 'hsl(45, 95%, 55%)' }} />
                        <div>
                          <p className="text-[10px] uppercase font-bold mb-1" style={{ color: 'hsl(45, 95%, 55%)' }}>
                            Observação do Coordenador
                          </p>
                          <p className="text-sm" style={{ color: colors.textPrimary }}>{s.observacao}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {submissoes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center" style={{ color: colors.labelColor }}>
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
