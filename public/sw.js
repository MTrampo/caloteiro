// Service Worker do Caloteiro (Next.js 16 + PWA com Modo de Conferência Offline e Cache de Comprovantes)
const CACHE_NAME = 'caloteiro-cache-v4';
const PAGES_CACHE = 'caloteiro-pages-v4';
const RECEIPTS_CACHE = 'caloteiro-receipts-v3';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

// 1. Instalação: Pré-cacheia a página offline e os ícones essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Ativação: Limpa caches de versões obsoletas preservando os caches vigentes
self.addEventListener('activate', (event) => {
  const allowedCaches = new Set([CACHE_NAME, PAGES_CACHE, RECEIPTS_CACHE]);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !allowedCaches.has(name))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Comunicação: Controle de ativação e limpeza segura de dados no logout
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_USER_CACHE') {
    event.waitUntil(
      Promise.all([
        caches.delete(PAGES_CACHE),
        caches.delete(RECEIPTS_CACHE),
      ])
    );
  }
});

// 4. Interceptação de Requisições com Proteção Total a Server Actions e Next.js Chunks
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // REGRA 1: Métodos de mutação (POST, PUT, DELETE, Server Actions do Next.js)
  // Devem SEMPRE ir direto para a rede sem tocar em cache.
  // Ao responder, descartamos páginas obsoletas do PAGES_CACHE para garantir que a próxima conferência offline reflita a mutação.
  if (request.method !== 'GET') {
    event.respondWith(
      (async () => {
        const res = await fetch(request);
        if (res && res.status >= 200 && res.status < 300) {
          try {
            await caches.delete(PAGES_CACHE);
          } catch {
            // Ignora falha de limpeza de cache
          }
        }
        return res;
      })()
    );
    return;
  }

  // REGRA 2: Chunks internos e compilações do Next.js (_next/*, Turbopack, HMR)
  // O Service Worker NUNCA deve interceptar ou alterar requisições /_next/, evitando ChunkLoadError.
  if (url.pathname.startsWith('/_next/')) {
    return;
  }

  // REGRA 3: Rotas de API internas, autenticação do Supabase e verificações (.well-known)
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/auth/') ||
    url.pathname.startsWith('/.well-known/')
  ) {
    return;
  }

  // REGRA 4: Cache-First de Comprovantes Imutáveis WebP (Storage Supabase)
  // Comprovantes salvos são normalizados pelo pathname (/storage/v1/object/sign/receipts/...)
  // ignorando o token de expiração. Permite visualização em 0ms e funciona offline!
  const isReceiptStorage =
    url.pathname.includes('/storage/v1/object/') &&
    url.pathname.includes('/receipts/');

  if (isReceiptStorage) {
    event.respondWith(
      (async () => {
        const receiptsCache = await caches.open(RECEIPTS_CACHE);
        const normalizedKey = new Request(url.pathname);
        const cached = await receiptsCache.match(normalizedKey);
        if (cached) {
          return cached;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            await receiptsCache.put(normalizedKey, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          return cached || new Response('Comprovante não sincronizado offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // REGRA 5: Requisições de dados dinâmicos do Next.js RSC (Server Components payloads)
  // Em modo online, busca da rede e atualiza o cache de transição offline em PAGES_CACHE.
  // Em modo offline, entrega a versão em cache para permitir conferência sem quebrar transição de abas.
  if (url.searchParams.has('_rsc') || request.headers.get('rsc')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
            const copy = networkResponse.clone();
            caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const pagesCache = await caches.open(PAGES_CACHE);
          const cachedRsc = await pagesCache.match(request);
          if (cachedRsc) {
            return cachedRsc;
          }
          return new Response('', { status: 503 });
        })
    );
    return;
  }

  // REGRA 6: Navegação entre páginas (HTML) - Network-First com Fallback de Conferência Offline
  // Se estiver online, carrega a versão do servidor e atualiza PAGES_CACHE.
  // Se estiver offline, entrega a última página visitada para o Tubarão conferir valores e PIX.
  // Se a rota nunca foi visitada antes, cai no offline.html.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
            const copy = networkResponse.clone();
            caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const pagesCache = await caches.open(PAGES_CACHE);
          const cachedPage = await pagesCache.match(request);
          if (cachedPage) {
            return cachedPage;
          }
          const appCache = await caches.open(CACHE_NAME);
          const cachedOffline = await appCache.match(OFFLINE_URL);
          if (cachedOffline) {
            return cachedOffline;
          }
          return new Response('Sem conexão com a internet', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
    return;
  }

  // REGRA 7: Assets estáticos públicos raiz (ícones da PWA, manifest, offline.html, fontes)
  const isPublicStatic =
    url.origin === self.location.origin && (
      url.pathname.startsWith('/web-app-manifest-') ||
      url.pathname.startsWith('/apple-touch-icon') ||
      url.pathname.startsWith('/favicon') ||
      url.pathname === '/manifest.webmanifest' ||
      url.pathname === '/manifest.json' ||
      url.pathname === '/offline.html' ||
      url.pathname.endsWith('.woff2')
    );

  if (isPublicStatic) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        });
      })
    );
  }
});
