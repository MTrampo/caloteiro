import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Flame,
  PlusCircle,
  Radar,
  ShieldAlert,
  UserX,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Barra de Investigação Superior */}
      <header className="border-b border-border/70 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/10">
              <Radar className="size-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg tracking-wider text-white">
                  CALOTEIRO
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Radar v1.0
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                O Gabinete do Detetive &bull; Cobrança sem rodeios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="size-4 mr-1.5" />
              Novo Suspeito
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8 flex-1 space-y-8 max-w-6xl">
        {/* Banner de Boas-Vindas & Investigação */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 md:p-8">
          <div className="relative z-10 max-w-2xl space-y-2">
            <Badge variant="default" className="font-mono text-[11px]">
              OPERACAO RECUPERA-PIX
            </Badge>
            <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Cadê o dinheiro que tava aqui?
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              O lugar onde a gente rastreia cada centavo prometido pra &ldquo;próxima sexta&rdquo;.
              Chega de desculpas em áudio de 3 minutos: hora de fechar o cerco.
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 size-48 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        </div>

        {/* Métricas do Radar */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Dinheiro na Pista
              </span>
              <DollarSign className="size-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="font-heading text-2xl md:text-3xl font-extrabold text-white">
                R$ 4.850,00
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
                <Flame className="size-3 text-rose-500" /> 3 promessas não cumpridas
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Caloteiros em Fuga
              </span>
              <UserX className="size-4 text-rose-400" />
            </CardHeader>
            <CardContent>
              <div className="font-heading text-2xl md:text-3xl font-extrabold text-rose-400">
                2 figurinhas
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
                <Clock className="size-3 text-rose-500" /> Maior atraso: 18 dias
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur shadow-sm sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Milagres Feitos (Pix Caiu)
              </span>
              <CheckCircle2 className="size-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="font-heading text-2xl md:text-3xl font-extrabold text-emerald-400">
                R$ 1.200,00
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
                Menos uma facada no seu peito
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Fichas dos Suspeitos Recentes */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="font-heading text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <ShieldAlert className="size-5 text-cyan-400" /> Fichas de Suspeitos
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Monitoramento ativo de quem esqueceu de acertar as contas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Suspeito 1: Atrasado Crítico */}
            <Card className="border-slate-800 bg-slate-900/80 backdrop-blur hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-white">
                      Tiago da Impressora
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 font-mono mt-0.5">
                      Promessa: &ldquo;Pai, até sexta o acerto tá na mão&rdquo;
                    </CardDescription>
                  </div>
                  <Badge variant="destructive">Caloteiro em Fuga</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-3 text-sm">
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 text-xs">Valor na Pista:</span>
                  <span className="font-mono font-bold text-rose-400">R$ 650,00</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Atraso: 18 dias</span>
                  <span>Vencimento: 17/09</span>
                </div>
              </CardContent>

              <Separator className="bg-slate-800" />

              <CardFooter className="pt-3 flex gap-2">
                <Button
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                  size="sm"
                >
                  Arrancar Sangue / Dar Baixa
                </Button>
                <Button variant="outline" size="sm" className="border-slate-800 text-slate-300 hover:bg-slate-800">
                  Mandar Recado
                </Button>
              </CardFooter>
            </Card>

            {/* Suspeito 2: Atraso Leve */}
            <Card className="border-slate-800 bg-slate-900/80 backdrop-blur hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-white">
                      Marcos do Churrasco
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 font-mono mt-0.5">
                      Promessa: &ldquo;Dividi o carvão e as carnes&rdquo;
                    </CardDescription>
                  </div>
                  <Badge variant="destructive">Sumido há 3 dias</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-3 text-sm">
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 text-xs">Valor na Pista:</span>
                  <span className="font-mono font-bold text-slate-200">R$ 220,00</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Atraso: 3 dias</span>
                  <span>Vencimento: 02/10</span>
                </div>
              </CardContent>

              <Separator className="bg-slate-800" />

              <CardFooter className="pt-3 flex gap-2">
                <Button
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                  size="sm"
                >
                  Cobrar no WhatsApp
                </Button>
                <Button variant="outline" size="sm" className="border-slate-800 text-slate-300 hover:bg-slate-800">
                  Copiar Pix
                </Button>
              </CardFooter>
            </Card>

            {/* Suspeito 3: Em dia / Milagreiro */}
            <Card className="border-slate-800 bg-slate-900/80 backdrop-blur hover:border-slate-700 transition-colors md:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-white">
                      Dona Cleide (Vizinha)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 font-mono mt-0.5">
                      Parcela 2 de 3 paga antes do meio-dia
                    </CardDescription>
                  </div>
                  <Badge variant="success">Raro / Milagreiro</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-3 text-sm">
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 text-xs">Último Pix Confirmado:</span>
                  <span className="font-mono font-bold text-emerald-400">R$ 300,00</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span className="text-emerald-400/90">&check; Pix caiu direto na conta</span>
                  <span>Próximo capítulo: 15/10</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Rodapé cínico */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-xs text-slate-500 font-mono space-y-1">
          <p>Caloteiro &bull; Eu avisei pra não emprestar, mas agora vamos atrás até o último centavo.</p>
          <p className="text-[11px] text-slate-600">Devo não nego, cobro até você pagar.</p>
        </div>
      </footer>
    </div>
  );
}
