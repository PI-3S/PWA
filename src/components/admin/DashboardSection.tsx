import React, { useState, useCallback } from 'react';
import { useAppTheme } from '@/hooks/useapptheme';
import { FileCheck, Clock, Check, X } from 'lucide-react';
import { DashboardMetrics } from '@/types/admin';

interface MetricCardProps {
  icon: typeof FileCheck;
  label: string;
  value: string | number;
  color: string;
  sub?: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
}

const MetricCard = ({ icon: Icon, label, value, color, sub, colors }: MetricCardProps) => (
  <div className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]" style={{ background: colors.cardBg, border: `1px solid ${color}22`, boxShadow: `0 0 25px -10px ${color}33` }}>
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <span className="text-xs font-display tracking-wider uppercase" style={{ color: colors.labelColor }}>{label}</span>
    </div>
    <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
    {sub && <p className="text-[11px] mt-1 font-mono" style={{ color: colors.labelColor }}>{sub}</p>}
  </div>
);

interface DashboardSectionProps {
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  colors: ReturnType<typeof useAppTheme>['colors'];
  toastError: (msg: string) => void;
  accentBlue: string;
  accentOrange: string;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  apiFetch,
  colors,
  toastError,
  accentBlue,
  accentOrange,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      const d = await apiFetch('/api/dashboard/coordenador');
      setMetrics(d.metricas || d);
    } catch (e: any) {
      if (e.message !== 'Não autorizado') toastError(e.message || 'Erro ao carregar métricas.');
    }
  }, [apiFetch, toastError]);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={FileCheck} label="Total Submissões" value={metrics?.total_submissoes || 0} color={accentBlue} colors={colors} />
        <MetricCard icon={Clock} label="Pendentes" value={metrics?.pendentes || 0} color={accentOrange} colors={colors} />
        <MetricCard icon={Check} label="Aprovadas" value={metrics?.aprovadas || 0} color="hsl(152, 60%, 50%)" colors={colors} />
        <MetricCard icon={X} label="Reprovadas" value={metrics?.reprovadas || 0} color="hsl(0, 72%, 55%)" colors={colors} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl p-6" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
          <h3 className="text-sm mb-4" style={{ color: colors.textPrimary }}>Submissões por Curso</h3>
          {(metrics?.por_curso || []).map((c, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: colors.textPrimary }}>{c.curso}</span>
                <span style={{ color: accentBlue }}>{c.total}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${(c.total / Math.max(...metrics!.por_curso.map(x => x.total), 1)) * 100}%`, background: accentBlue }} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-6" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
          <h3 className="text-sm mb-4" style={{ color: colors.textPrimary }}>Submissões por Área</h3>
          <div className="space-y-2">
            {(metrics?.por_area || []).map((a, i) => (
              <div key={i} className="flex justify-between py-2 px-3 rounded-lg" style={{ background: `${colors.cardBorder}` }}>
                <span style={{ color: colors.textPrimary }}>{a.area}</span>
                <span style={{ color: accentBlue }}>{a.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSection;
