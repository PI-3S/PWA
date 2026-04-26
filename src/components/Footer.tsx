import React, { useState, useEffect } from 'react';
import { useAppTheme } from '@/hooks/useapptheme';
import { useIsMobile } from '@/hooks/use-mobile';

const Footer: React.FC = () => {
  const { colors } = useAppTheme();
  const isMobile = useIsMobile();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <footer className="w-full py-4 text-center" style={{ color: colors.textSecondary }}>
      {isMobile && deferredPrompt && !isInstalled && (
        <button
          onClick={handleInstall}
          className="mb-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
        >
          📲 Instalar App
        </button>
      )}
      <p className="text-xs tracking-widest uppercase font-display">
        SGC - SENAC © 2026 · v1.0.0
      </p>
    </footer>
  );
};

export default Footer;
