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
      glowColor: 'hsla(38, 92%, 50%, 0.12)',
      borderColor: 'hsla(38, 92%, 50%, 0.25)',
      iconColor: 'hsl(38, 92%, 55%)',
      valueColor: 'hsl(38, 92%, 65%)',
    },
    {
      label: 'Deferidas',
      value: approved,
      icon: CheckCircle,
      glowColor: 'hsla(152, 60%, 40%, 0.12)',
      borderColor: 'hsla(152, 60%, 40%, 0.25)',
      iconColor: 'hsl(152, 60%, 50%)',
      valueColor: 'hsl(152, 60%, 60%)',
    },
    {
      label: 'Indeferidas',
      value: rejected,
      icon: XCircle,
      glowColor: 'hsla(0, 72%, 51%, 0.12)',
      borderColor: 'hsla(0, 72%, 51%, 0.25)',
      iconColor: 'hsl(0, 72%, 58%)',
      valueColor: 'hsl(0, 72%, 65%)',
    },
    {
      label: 'Ajustes',
      value: adjustment,
      icon: AlertTriangle,
      glowColor: 'hsla(38, 92%, 50%, 0.12)',
      borderColor: 'hsla(38, 92%, 50%, 0.25)',
      iconColor: 'hsl(38, 92%, 55%)',
      valueColor: 'hsl(38, 92%, 65%)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="border-0 transition-all duration-500 hover:scale-[1.03]"
          style={{
            background: `linear-gradient(145deg, hsla(220, 50%, 15%, 0.7), hsla(220, 50%, 12%, 0.8))`,
            border: `1px solid ${card.borderColor}`,
            boxShadow: `0 0 25px -8px ${card.glowColor}`,
          }}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className="p-3 rounded-lg"
              style={{
                background: card.glowColor,
                border: `1px solid ${card.borderColor}`,
                boxShadow: `0 0 15px -3px ${card.glowColor}`,
              }}
            >
              <card.icon className="h-6 w-6" style={{ color: card.iconColor }} />
            </div>
            <div>
              <p className="text-xs font-medium tracking-wider uppercase" style={{ color: 'hsl(200, 20%, 50%)' }}>{card.label}</p>
              <p className="text-3xl font-bold tracking-tight font-display" style={{ color: card.valueColor }}>{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatusCards;
