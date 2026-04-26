import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardAluno, AlunoCurso } from '@/types/aluno';

interface ProgressoSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  cursos: AlunoCurso[];
  selectedCurso: string;
  onSelectCurso: (id: string) => void;
  toastSuccess?: (msg: string) => void;
  toastError: (msg: string) => void;
  colors: ReturnType<typeof useAppTheme>['colors'];
  accentGreen: string;
  accentGreenDim: string;
}

const ProgressoSection: React.FC<ProgressoSectionProps> = ({
  apiFetch,
  cursos,
  selectedCurso,
  onSelectCurso,
  toastError,
  colors,
  accentGreen,
  accentGreenDim,
}) => {
  const [dashboard, setDashboard] = useState<DashboardAluno | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!selectedCurso) return;
    setIsLoading(true);
    try {
      const data = await apiFetch(`/api/dashboard/aluno?curso_id=${selectedCurso}`);
      const metricas = data.metricas || data;
      setDashboard({
        total_submissoes: metricas.total_submissoes || 0,
        pendentes: metricas.pendentes || 0,
        aprovadas: metricas.aprovadas || 0,
        reprovadas: metricas.reprovadas || 0,
        total_horas_aprovadas: metricas.total_horas_aprovadas || metricas.horas_aprovadas || 0,
        carga_horaria_minima: metricas.carga_horaria_minima || metricas.cargaMinima || 200,
        progresso_percentual: metricas.progresso_percentual || metricas.progresso || 0,
        horas_por_area: metricas.horas_por_area || [],
      });
    } catch {
      toastError('Erro ao carregar dashboard.');
    }
    setIsLoading(false);
  }, [selectedCurso, apiFetch, toastError]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const inputStyle = { background: colors.inputBg, color: colors.textPrimary, border: `1px solid ${colors.inputBorder}` };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <>
      {/* Seletor de curso */}
      <div className="rounded-xl p-4" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
        <label className="text-xs uppercase mb-2 block" style={{ color: colors.labelColor }}>Selecione o Curso</label>
        <Select value={selectedCurso} onValueChange={onSelectCurso}>
          <SelectTrigger style={inputStyle}>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {cursos.map(c => (
              <SelectItem key={c.curso_id} value={c.curso_id}>{c.curso_nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Card de progresso */}
      <div className="rounded-xl p-6" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="font-display text-lg tracking-wider uppercase" style={{ color: colors.titleColor }}>Seu Progresso</h2>
          <span className="font-mono text-2xl font-bold" style={{ color: accentGreen }}>
            {dashboard?.total_horas_aprovadas || 0}h <span className="text-sm font-normal" style={{ color: colors.labelColor }}>/ {dashboard?.carga_horaria_minima || 0}h</span>
          </span>
        </div>
        <div className="relative h-4 rounded-full overflow-hidden" style={{ background: colors.inputBg }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(dashboard?.progresso_percentual || 0, 100)}%`,
              background: `linear-gradient(90deg, ${accentGreenDim}, ${accentGreen})`,
              boxShadow: '0 0 15px rgba(16,185,129,0.3)'
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: colors.labelColor }}>
          {dashboard?.progresso_percentual?.toFixed(1) || 0}% completo
        </p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Envios', value: dashboard?.total_submissoes || 0, color: 'hsl(210, 80%, 55%)' },
          { label: 'Pendentes', value: dashboard?.pendentes || 0, color: 'hsl(38, 92%, 55%)' },
          { label: 'Aprovadas', value: dashboard?.aprovadas || 0, color: 'hsl(152, 60%, 45%)' },
          { label: 'Reprovadas', value: dashboard?.reprovadas || 0, color: 'hsl(0, 72%, 55%)' },
        ].map(m => (
          <div key={m.label} className="rounded-xl p-5 border" style={{ background: colors.cardBg, borderColor: colors.cardBorder }}>
            <p className="text-[10px] font-display tracking-widest uppercase mb-1" style={{ color: m.color }}>{m.label}</p>
            <p className="font-mono text-2xl font-bold" style={{ color: colors.titleColor }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Horas por área */}
      {dashboard?.horas_por_area && dashboard.horas_por_area.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboard.horas_por_area.map((area) => (
            <div key={area.area} className="rounded-xl p-5 border" style={{ background: colors.inputBg, borderColor: colors.inputBorder }}>
              <p className="text-xs font-display mb-2" style={{ color: colors.labelColor }}>{area.area}</p>
              <div className="font-mono text-lg font-bold" style={{ color: colors.titleColor }}>
                {area.horas}h <span className="text-xs font-normal" style={{ color: colors.labelColor }}>/ {area.limite}h</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: colors.cardBorder }}>
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min((area.horas / area.limite) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ProgressoSection;
