import { Moon, Sun } from 'lucide-react';
import { useTheme, ThemeName } from '@/contexts/ThemeContext';
import { useAppTheme } from '@/hooks/useapptheme';

const themes: { id: ThemeName; label: string; icon: typeof Moon }[] = [
  { id: 'dark', label: 'Escuro', icon: Moon },
  { id: 'light', label: 'Claro', icon: Sun },
];

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const { colors } = useAppTheme();

  return (
    <div
      className="flex items-center gap-1.5 backdrop-blur-sm rounded-full p-1"
      style={{ background: colors.headerBg, border: `1px solid ${colors.headerBorder}` }}
    >
      {themes.map((t) => {
        const active = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.label}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
            style={active ? {
              background: t.id === 'light'
                ? 'linear-gradient(135deg, hsl(45,80%,55%), hsl(35,90%,60%))'
                : 'linear-gradient(135deg, hsl(220,50%,35%), hsl(220,60%,45%))',
              color: 'white',
            } : {
              color: colors.labelColor,
              background: 'transparent',
            }}
          >
            <t.icon className="h-3.5 w-3.5" />
            {active && <span>{t.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSwitcher;
