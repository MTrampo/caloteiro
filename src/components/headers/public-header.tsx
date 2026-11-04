"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { cn } from "@/commons/lib/utils";
import {
  FaBars,
  FaXmark,
  FaUser,
  FaFileContract,
  FaShieldHalved,
  FaCrown,
  FaArrowRight,
  FaRightToBracket,
  FaCompass,
  FaWhatsapp,
  FaQrcode,
  FaBoxesStacked,
  FaScaleBalanced,
} from "react-icons/fa6";
import { trackAccountIntent, trackLoginIntent } from "@/commons/utils/analytics";

const RESOURCE_LINKS = [
  {
    href: "#central-gruta",
    title: "Central da Gruta",
    description: "Visão panorâmica de prazos e acompanhamento de presas.",
    icon: FaCompass,
    iconColor: "text-amber-400",
  },
  {
    href: "#armas-whatsapp",
    title: "Armas de WhatsApp",
    description: "Cobrança ágil em 3 níveis com mensagens prontas.",
    icon: FaWhatsapp,
    iconColor: "text-emerald-400",
  },
  {
    href: "#portal-devedor",
    title: "Link do Devedor",
    description: "Fatura externa com código Pix Copia e Cola em 1 clique.",
    icon: FaQrcode,
    iconColor: "text-sky-400",
  },
  {
    href: "#arsenal",
    title: "Recursos da Gruta",
    description: "Juros automáticos, arquivo de comprovantes e controle total.",
    icon: FaBoxesStacked,
    iconColor: "text-purple-400",
  },
];

const DIRECT_NAV_LINKS = [
  { href: "#comparativo", label: "Caderninho vs. Gruta" },
  { href: "#planos", label: "Planos" },
  { href: "#faq", label: "Dúvidas" },
];

const LEGAL_DOC_LINKS = [
  {
    href: "/documentos/planos",
    title: "Planos & Limites da Gruta",
    description: "Espécies de tubarão, limites de devedores e matriz de recursos.",
    icon: FaCrown,
    iconColor: "text-amber-400",
  },
  {
    href: "/documentos/perguntas-frequentes",
    title: "Dúvidas & Guia Legal",
    description: "Legalidade de juros, cobrança no WhatsApp e validade de provas.",
    icon: FaScaleBalanced,
    iconColor: "text-emerald-400",
  },
  {
    href: "/documentos/termos",
    title: "Termos e Condições de Uso",
    description: "Regras de conduta, trial de 30 dias e responsabilidades do credor.",
    icon: FaFileContract,
    iconColor: "text-sky-400",
  },
  {
    href: "/documentos/privacidade",
    title: "Política de Privacidade (LGPD)",
    description: "Anonimato do credor, sem guarda de IPs e em conformidade estrita.",
    icon: FaShieldHalved,
    iconColor: "text-emerald-400",
  },
];

interface PublicHeaderProps {
  isLoggedIn?: boolean;
}

export function PublicHeader({ isLoggedIn = false }: PublicHeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [prevPathname, setPrevPathname] = React.useState(pathname);

  // Fecha o menu mobile quando o pathname muda sem precisar de useEffect
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  // Rolagem suave para âncoras na mesma página
  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    anchorHref: string
  ) => {
    if (anchorHref.startsWith("#")) {
      if (pathname === "/") {
        e.preventDefault();
        const elementId = anchorHref.replace("#", "");
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
          setIsMobileMenuOpen(false);
          window.history.pushState(null, "", anchorHref);
        }
      }
      // Se não estiver na raiz ("/"), o link href={`/${anchorHref}`} navega até a raiz e desce suavemente pelo scroll-smooth
    }
  };

  const resolveLinkHref = (href: string) => {
    if (href.startsWith("#")) {
      return pathname === "/" ? href : `/${href}`;
    }
    return href;
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center border-b border-border bg-background/90 backdrop-blur-md">
      <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl md:max-w-7xl flex items-center justify-between gap-2 sm:gap-4">
        {/* Logotipo Oficial */}
        <Link href="/" className="cursor-pointer select-none shrink-0">
          <Logo size="sm" showText />
        </Link>

        {/* Navegação Desktop com NavigationMenu Oficial */}
        <div className="hidden lg:flex items-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {/* Dropdown de Recursos da Gruta */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-2.5 py-1.5 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-900 data-popup-open:bg-zinc-900 data-popup-open:text-white data-open:bg-zinc-900 data-open:text-white">
                  Recursos
                </NavigationMenuTrigger>
                <NavigationMenuContent className="p-3 w-[340px] sm:w-[380px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl">
                  <div className="space-y-1">
                    <div className="px-2 py-1.5 text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                      Arsenal de Cobrança
                    </div>
                    {RESOURCE_LINKS.map((res) => {
                      const Icon = res.icon;

                      return (
                        <NavigationMenuLink
                          key={res.href}
                          render={
                            <a
                              href={resolveLinkHref(res.href)}
                              onClick={(e) => handleAnchorClick(e, res.href)}
                            />
                          }
                          className="flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer group hover:bg-zinc-900/80 text-zinc-300 hover:text-white"
                        >
                          <div className="size-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-zinc-700">
                            <Icon className={cn("size-4", res.iconColor)} />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-heading text-xs font-bold text-white block">
                              {res.title}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-400 leading-tight block">
                              {res.description}
                            </span>
                          </div>
                        </NavigationMenuLink>
                      );
                    })}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Links Diretos */}
              {DIRECT_NAV_LINKS.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    render={
                      <a
                        href={resolveLinkHref(link.href)}
                        onClick={(e) => handleAnchorClick(e, link.href)}
                      />
                    }
                    className="px-2.5 py-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-zinc-900"
                  >
                    {link.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}

              {/* Dropdown de Documentos / Jurídico */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-2.5 py-1.5 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-900 data-popup-open:bg-zinc-900 data-popup-open:text-white data-open:bg-zinc-900 data-open:text-white">
                  Documentos
                </NavigationMenuTrigger>
                <NavigationMenuContent className="p-3 w-[340px] sm:w-[380px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl">
                  <div className="space-y-1">
                    <div className="px-2 py-1.5 text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                      Políticas e Diretrizes Legais
                    </div>
                    {LEGAL_DOC_LINKS.map((doc) => {
                      const Icon = doc.icon;
                      const isCurrentDoc = pathname === doc.href;

                      return (
                        <NavigationMenuLink
                          key={doc.href}
                          render={<Link href={doc.href} />}
                          className={cn(
                            "flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer group",
                            isCurrentDoc
                              ? "bg-zinc-900 text-white border border-zinc-800"
                              : "hover:bg-zinc-900/80 text-zinc-300 hover:text-white"
                          )}
                        >
                          <div className="size-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-zinc-700">
                            <Icon className={cn("size-4", doc.iconColor)} />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-heading text-xs font-bold text-white block">
                              {doc.title}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-400 leading-tight block">
                              {doc.description}
                            </span>
                          </div>
                        </NavigationMenuLink>
                      );
                    })}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Ações à Direita & Gatilho Mobile */}
        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn ? (
            <Link
              href="/painel"
              title="Acessar Painel da Gruta"
              aria-label="Acessar Painel da Gruta"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer group"
            >
              <FaRightToBracket className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              <span className="hidden sm:inline">Painel da Gruta</span>
            </Link>
          ) : (
            <Link
              href="/entrar"
              onClick={() => trackLoginIntent("header_desktop")}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"
            >
              <FaUser className="size-3 text-zinc-400" />
              <span>Entrar</span>
            </Link>
          )}

          {/* Botão de Menu Hambúrguer (Mobile) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Fechar Menu" : "Abrir Menu"}
            className="lg:hidden inline-flex items-center justify-center size-9 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer ml-1"
          >
            {isMobileMenuOpen ? (
              <FaXmark className="size-4" />
            ) : (
              <FaBars className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Overlay Mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-14 bg-zinc-950/95 border-b border-zinc-800 backdrop-blur-xl p-4 sm:p-6 space-y-5 max-h-[calc(100dvh-3.5rem)] overflow-y-auto animate-in fade-in slide-in-from-top-3 duration-200 shadow-2xl">
          {/* Seção 1: Navegação na Landing */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block px-2">
              Navegação
            </span>
            <div className="grid grid-cols-1 gap-1">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block px-2 pt-1">
                Recursos
              </span>
              {RESOURCE_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={resolveLinkHref(link.href)}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className="px-3 py-2 text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors block"
                >
                  {link.title}
                </a>
              ))}
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block px-2 pt-2">
                Comparativo & Planos
              </span>
              {DIRECT_NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={resolveLinkHref(link.href)}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className="px-3 py-2 text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors block"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Seção 2: Documentos e Políticas Legais */}
          <div className="space-y-2 pt-3 border-t border-zinc-800/80">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block px-2">
              Documentos & Políticas
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {LEGAL_DOC_LINKS.map((doc) => {
                const Icon = doc.icon;
                const isCurrent = pathname === doc.href;

                return (
                  <Link
                    key={doc.href}
                    href={doc.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-xl transition-all",
                      isCurrent
                        ? "bg-zinc-900 text-white border border-zinc-800 font-bold"
                        : "hover:bg-zinc-900/60 text-zinc-400 hover:text-white"
                    )}
                  >
                    <Icon className={cn("size-3.5 shrink-0", doc.iconColor)} />
                    <span className="text-xs font-mono">{doc.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Seção 3: Ações de Acesso no Mobile */}
          {!isLoggedIn ? (
            <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2">
              <Link
                href="/entrar"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  trackLoginIntent("header_mobile");
                }}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 text-xs font-mono text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl transition-all"
              >
                <FaUser className="size-3.5 text-zinc-400" />
                <span>Entrar</span>
              </Link>
              <Link
                href="/cadastrar"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  trackAccountIntent("header_mobile", "Criar Gruta");
                }}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 text-xs font-heading font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl transition-all"
              >
                <span>Criar Gruta</span>
                <FaArrowRight className="size-3" />
              </Link>
            </div>
          ) : (
            <div className="pt-3 border-t border-zinc-800/80">
              <Link
                href="/painel"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 w-full h-10 px-4 text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 rounded-xl transition-all"
              >
                <FaRightToBracket className="size-3.5" />
                <span>Acessar Painel da Gruta</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

