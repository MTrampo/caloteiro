'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(display-mode: standalone)');
    const checkStandalone = () => {
      const isNavStandalone = Boolean((window.navigator as NavigatorWithStandalone).standalone);
      return mql.matches || isNavStandalone;
    };

    const updateStandalone = () => {
      setIsStandalone(checkStandalone());
    };

    // Inicializa no microtask assíncrono para evitar cascading render no React 19
    queueMicrotask(() => {
      setIsStandalone(checkStandalone());

      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
      setIsDesktop(!/iphone|ipad|ipod|android/i.test(userAgent));

      const dismissed = sessionStorage.getItem('pwa_install_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    });

    mql.addEventListener('change', updateStandalone);

    // Captura o evento beforeinstallprompt (Android / Chrome Desktop / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      mql.removeEventListener('change', updateStandalone);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        // Aguarda a finalização do ciclo de eventos do ponteiro antes de desmontar o banner
        setTimeout(() => {
          setDeferredPrompt(null);
        }, 150);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Erro ao acionar prompt de instalação:', error);
      return false;
    }
  };

  const dismissBanner = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  };

  // Se JÁ estiver instalado em standalone, NUNCA permite instalar nem mostra banners
  const canInstall = !isStandalone && !isDismissed && (Boolean(deferredPrompt) || isIOS);

  const installTitle = isDesktop ? 'Instalar no Computador' : 'Instalar no Celular';
  const installDescription = isDesktop
    ? 'Abra a Gruta em janela própria e fixe na sua barra de tarefas.'
    : 'Acesse a Gruta e cobre devedores com 1 toque.';

  return {
    canInstall,
    isStandalone,
    isIOS,
    isDesktop,
    installTitle,
    installDescription,
    hasPrompt: Boolean(deferredPrompt),
    installApp,
    dismissBanner,
  };
}
