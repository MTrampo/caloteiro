import { vi } from "vitest";

// Mock do pacote 'server-only' para permitir a execução segura dos módulos de src/server em testes unitários Node
vi.mock("server-only", () => ({}));

