import React from 'react';
import { useAppTheme } from '@/hooks/useapptheme';

const Footer: React.FC = () => {
  const { colors } = useAppTheme();

  return (
    <footer className="w-full py-4 text-center" style={{ color: colors.textSecondary }}>
      <p className="text-xs tracking-widest uppercase font-display">
        Maestria SGC © 2026 · SENAC · v1.0.0
      </p>
    </footer>
  );
};

export default Footer;
