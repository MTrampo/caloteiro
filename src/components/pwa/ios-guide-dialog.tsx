"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FaArrowUpFromBracket,
  FaSquarePlus,
  FaCheck,
  FaShieldHalved,
} from "react-icons/fa6";

interface IosGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IosGuideDialog({ open, onOpenChange }: IosGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-zinc-800 bg-zinc-950 p-5 sm:p-7 text-zinc-100 shadow-2xl">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
            <FaShieldHalved className="size-3.5" />
            <span>A Gruta do Tubarão no seu iOS</span>
          </div>
          <DialogTitle className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
            Como instalar no seu iPhone
          </DialogTitle>
          <DialogDescription className="font-mono text-xs sm:text-sm text-zinc-400 leading-relaxed">
            O Caloteiro funciona como um aplicativo nativo no iOS, direto pelo
            Safari e sem passar pela App Store. Siga estes 3 passos:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-3">
          {/* Passo 1 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-700 text-emerald-400">
              <FaArrowUpFromBracket className="size-3.5" />
            </div>
            <div className="text-xs font-mono">
              <p className="font-heading font-bold text-white text-sm">
                1. Toque em Compartilhar
              </p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                Na barra inferior do Safari, toque no ícone de compartilhamento
                (o quadrado com uma seta para cima).
              </p>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-700 text-emerald-400">
              <FaSquarePlus className="size-3.5" />
            </div>
            <div className="text-xs font-mono">
              <p className="font-heading font-bold text-white text-sm">
                2. Adicionar à Tela de Início
              </p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                Role o menu de opções para baixo e selecione a opção{" "}
                <strong className="text-white">
                  &ldquo;Adicionar à Tela de Início&rdquo;
                </strong>
                .
              </p>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-700 text-emerald-400">
              <FaCheck className="size-3.5" />
            </div>
            <div className="text-xs font-mono">
              <p className="font-heading font-bold text-white text-sm">
                3. Confirmar e Abrir
              </p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                Toque em <strong className="text-white">&ldquo;Adicionar&rdquo;</strong>{" "}
                no canto superior direito. Pronto! O ícone estará salvo na tela do seu celular.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl h-11 text-xs sm:text-sm cursor-pointer shadow-md transition-colors"
        >
          Entendido, vou adicionar!
        </button>
      </DialogContent>
    </Dialog>
  );
}
