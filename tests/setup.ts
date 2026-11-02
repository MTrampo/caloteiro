import { vi } from "vitest";

// Mock do pacote 'server-only' para permitir a execução segura dos módulos de src/server em testes unitários Node
vi.mock("server-only", () => ({}));

// Mock do pacote 'next/cache' para permitir a execução transparente de unstable_cache e revalidate em testes
vi.mock("next/cache", () => ({
  unstable_cache: (cb: (...args: any[]) => any) => cb,
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  updateTag: vi.fn(),
}));
