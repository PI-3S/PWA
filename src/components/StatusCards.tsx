import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface StatusCardsProps {
  pending: number;
  approved: number;
  rejected: number;
  adjustment: number;
}

const StatusCards = ({ pending, approved, rejected, adjustment }: StatusCardsProps) => {
  const cards = [
    {
      label: 'Pendentes',
      value: pending,
      icon: Clock,
      colorClass: 'text-pending bg-pending/10 border-pending/20',
      iconColor: 'text-pending',
    },
    {
      label: 'Deferidas',
      value: approved,
      icon: CheckCircle,
      colorClass: 'text-approved bg-approved/10 border-approved/20',
      iconColor: 'text-approved',
    },
    {
      label: 'Indeferidas',
      value: rejected,
      icon: XCircle,
      colorClass: 'text-rejected bg-rejected/10 border-rejected/20',
      iconColor: 'text-rejected',
    },
    {
      label: 'Ajustes Solicitados',
      value: adjustment,
      icon: AlertTriangle,
      colorClass: 'text-warning bg-warning/10 border-warning/20',
      iconColor: 'text-warning',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className={`border ${card.colorClass}`} style={{ background: 'hsla(220, 40%, 20%, 0.5)', borderColor: 'hsla(220, 40%, 35%, 0.3)' }}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${card.colorClass}`}>
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'hsl(220, 20%, 60%)' }}>{card.label}</p>
              <p className="text-3xl font-bold tracking-tight text-white">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatusCards;
