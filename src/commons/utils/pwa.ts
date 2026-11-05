/**
 * Utilitário de registro e gerenciamento do Service Worker e PWA da Gruta do Caloteiro
 */

export function registerPwaServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Registra após o carregamento da página para não interferir no First Contentful Paint (FCP)
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Força verificação de nova versão ao abrir e ao retornar o app para primeiro plano
        registration.update().catch(() => {});
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        });

        // Escuta novas versões sendo instaladas
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (
                installingWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // Notifica a aplicação que há uma atualização disponível
                window.dispatchEvent(new CustomEvent('pwa-update-available'));
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('Registro do Service Worker falhou:', err);
      });
  });
}

export async function clearPwaCache(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  } catch (error) {
    console.error('Erro ao limpar cache do PWA:', error);
  }
}

/**
 * Atualiza o contador de parcelas vencidas ou presas pendentes no ícone do aplicativo no celular (App Badging API)
 */
export async function setAppBadgeCount(count: number): Promise<void> {
  if (typeof window === 'undefined' || !('setAppBadge' in navigator)) {
    return;
  }

  try {
    if (count > 0) {
      await navigator.setAppBadge(count);
    } else {
      await navigator.clearAppBadge();
    }
  } catch {
    // Ignora silenciosamente se a permissão não for concedida ou a plataforma não suportar
  }
}

/**
 * Limpa o badge do ícone do aplicativo
 */
export async function clearAppBadgeCount(): Promise<void> {
  if (typeof window === 'undefined' || !('clearAppBadge' in navigator)) {
    return;
  }

  try {
    await navigator.clearAppBadge();
  } catch {
    // Ignora silenciosamente
  }
}
