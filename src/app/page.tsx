import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Cabeçalho Padronizado da Plataforma */}
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border bg-background/90 backdrop-blur-md">
        <div className="w-full mx-auto px-6 max-w-5xl md:max-w-7xl flex items-center justify-between gap-4">
          <Link href="/" className="cursor-pointer select-none">
            <Logo size="md" showText />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/documentos/planos"
              className="hidden sm:inline-flex items-center h-9 px-3 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              Planos
            </Link>
            <Link
              href="/entrar"
              className="inline-flex items-center h-9 px-4 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl transition-all cursor-pointer"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Container Principal com Espaçamento Padronizado Externo */}
      <main className="flex-1 w-full mx-auto px-6 py-12 sm:py-24 max-w-5xl md:max-w-7xl" />

      {/* Rodapé Padronizado */}
      <footer className="border-t border-border/40 py-6 text-center text-xs font-mono text-zinc-500">
        <div className="mx-auto px-6 max-w-5xl md:max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Caloteiro — A Gruta do Tubarão.</p>
          <div className="flex items-center gap-4">
            <Link href="/documentos/planos" className="hover:text-zinc-300 transition-colors">
              Planos & Regras
            </Link>
            <Link href="/entrar" className="hover:text-zinc-300 transition-colors">
              Entrar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
