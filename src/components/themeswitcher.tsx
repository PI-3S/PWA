import { Moon, Sun } from 'lucide-react';
import { useTheme, ThemeName } from '@/contexts/ThemeContext';

const themes: { id: ThemeName; label: string; icon: typeof Moon }[] = [
  { id: 'dark', label: 'Escuro', icon: Moon },
  { id: 'light', label: 'Claro', icon: Sun },
];

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm rounded-full p-1 border border-white/10">
      {themes.map((t) => {
        const active = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.label}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              active ? 'text-white shadow-lg' : 'text-white/50 hover:text-white/80'
            }`}
            style={active ? {
              background: t.id === 'light'
                ? 'linear-gradient(135deg, hsl(220,30%,60%), hsl(220,40%,50%))'
                : 'linear-gradient(135deg, hsl(220,50%,20%), hsl(220,60%,30%))',
            } : {}}
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
