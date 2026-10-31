"use client";

import * as React from "react";
import Image from "next/image";
import { FaFileInvoiceDollar, FaTrashCan, FaCloudArrowUp, FaSpinner, FaEye, FaLock } from "react-icons/fa6";
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "@/components/ui/attachment";
import { uploadDebtReceiptAction } from "@/actions/debts";
import { toast } from "sonner";
import { formatBytes } from "@/commons/utils/format";

interface ReceiptAttachmentFieldProps {
  label: string;
  description?: string;
  folder: "loan" | "payment";
  isLocked?: boolean;
  lockMessage?: string;
  value: string | null;
  onChange: (receiptPath: string | null) => void;
  previewUrl?: string | null;
  onPreviewClick?: (url: string) => void;
}

export function ReceiptAttachmentField({
  label,
  description = "Anexe o print do Pix ou comprovante (PNG, JPG ou JPEG).",
  folder,
  isLocked = false,
  lockMessage = "Disponível a partir do plano Tubarão Branco.",
  value,
  onChange,
  previewUrl,
  onPreviewClick,
}: ReceiptAttachmentFieldProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [localPreview, setLocalPreview] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [fileSizeText, setFileSizeText] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Limpa object URLs no unmount
  React.useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast.error("Formato inválido. Selecione uma imagem PNG, JPG ou JPEG.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("O comprovante não pode exceder 8MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setFileName(file.name);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await uploadDebtReceiptAction(formData);

      if (!res.success || !res.data) {
        toast.error(res.error || "Erro ao salvar comprovante.");
        setLocalPreview(null);
        setFileName(null);
        return;
      }

      onChange(res.data.receiptPath);
      setFileSizeText(
        `Otimizado com sharp (${formatBytes(res.data.compressedSize)})`
      );
      toast.success("Comprovante anexado e otimizado com sucesso!");
    } catch {
      toast.error("Ocorreu um erro no upload do comprovante.");
      setLocalPreview(null);
      setFileName(null);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localPreview && localPreview.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    setFileName(null);
    setFileSizeText(null);
    onChange(null);
  };

  const activeDisplayUrl = localPreview || previewUrl;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-zinc-300">
          {label}
        </label>
        {isLocked && (
          <span className="text-[10px] font-mono font-medium text-amber-400 flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            <FaLock className="size-2.5" /> Exclusivo Planos Pagos
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        disabled={isLocked || isUploading}
        onChange={handleFileSelected}
      />

      {isLocked ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4 text-center">
          <p className="text-xs text-zinc-400">{lockMessage}</p>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            Evolua para Tubarão Branco ou Cabeça Chato para anexar comprovantes.
          </p>
        </div>
      ) : value || activeDisplayUrl ? (
        <Attachment
          size="sm"
          state={isUploading ? "uploading" : "done"}
          className="w-full bg-zinc-900/60 border-zinc-800"
        >
          <AttachmentMedia variant="image" className="bg-zinc-950 border border-zinc-800">
            {activeDisplayUrl ? (
              <Image
                src={activeDisplayUrl}
                alt="Comprovante"
                width={32}
                height={32}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <FaFileInvoiceDollar className="text-emerald-400 size-4" />
            )}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle className="text-xs text-zinc-200">
              {fileName || "Comprovante Anexado"}
            </AttachmentTitle>
            <AttachmentDescription className="text-[11px] text-zinc-400">
              {isUploading ? "Processando comprovante..." : fileSizeText || "Salvo na Gruta"}
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            {activeDisplayUrl && onPreviewClick && (
              <AttachmentAction
                type="button"
                variant="ghost"
                className="text-zinc-400 hover:text-white"
                onClick={() => onPreviewClick(activeDisplayUrl)}
                title="Visualizar Comprovante"
              >
                <FaEye className="size-3" />
              </AttachmentAction>
            )}
            <AttachmentAction
              type="button"
              variant="ghost"
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
              onClick={handleRemove}
              disabled={isUploading}
              title="Remover Comprovante"
            >
              <FaTrashCan className="size-3" />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full group flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors text-xs text-zinc-400 hover:text-zinc-200"
        >
          {isUploading ? (
            <>
              <FaSpinner className="animate-spin size-3.5 text-white" />
              <span>Processando comprovante...</span>
            </>
          ) : (
            <>
              <FaCloudArrowUp className="size-4 text-zinc-400 group-hover:text-white transition-colors" />
              <span>Anexar comprovante Pix / Transferência</span>
            </>
          )}
        </button>
      )}

      {description && !isLocked && !value && (
        <p className="text-[11px] text-zinc-500 font-mono">{description}</p>
      )}
    </div>
  );
}

