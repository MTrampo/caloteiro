"use client";

import * as React from "react";
import {
  FaDownload,
  FaMagnifyingGlassMinus,
  FaMagnifyingGlassPlus,
  FaRotateLeft,
  FaSpinner,
  FaXmark,
} from "react-icons/fa6";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/commons/lib/utils";

interface ReceiptViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  title?: string;
}

const MIN_ZOOM = 100;
const MAX_ZOOM = 400;
const ZOOM_STEP = 25;

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value)));
}

function getTouchDistance(touches: React.TouchList): number {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

export function ReceiptViewerDialog({
  open,
  onOpenChange,
  imageUrl,
  title = "Comprovante Pix / Transferência",
}: ReceiptViewerDialogProps) {
  const [zoomPercent, setZoomPercent] = React.useState<number>(100);
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const dragStartRef = React.useRef<{
    clientX: number;
    clientY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const pinchStartRef = React.useRef<{
    distance: number;
    zoom: number;
  } | null>(null);

  const lastTapRef = React.useRef<number>(0);

  // Reseta zoom e posição sempre que abrir ou trocar de imagem
  React.useEffect(() => {
    if (open) {
      setZoomPercent(100);
      setPan({ x: 0, y: 0 });
      setIsDragging(false);
      dragStartRef.current = null;
      pinchStartRef.current = null;
    }
  }, [open, imageUrl]);

  // Se o zoom voltar para 100%, centraliza a imagem novamente
  const updateZoom = React.useCallback((nextZoom: number) => {
    const clamped = clampZoom(nextZoom);
    setZoomPercent(clamped);
    if (clamped <= 100) {
      setPan({ x: 0, y: 0 });
    }
  }, []);

  const handleResetView = React.useCallback(() => {
    setZoomPercent(100);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleToggleDoubleTapZoom = React.useCallback(() => {
    if (zoomPercent > 100) {
      handleResetView();
    } else {
      setZoomPercent(225);
    }
  }, [zoomPercent, handleResetView]);

  const handleWheel = React.useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      updateZoom(zoomPercent + delta);
    },
    [zoomPercent, updateZoom]
  );

  // Mouse drag para Desktop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || zoomPercent <= 100) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };

  // Touch Gestures (Pinça com 2 dedos + Arraste com 1 dedo + Duplo Toque no Mobile)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // Início de movimento de pinça
      setIsDragging(false);
      dragStartRef.current = null;
      const dist = getTouchDistance(e.touches);
      if (dist > 0) {
        pinchStartRef.current = {
          distance: dist,
          zoom: zoomPercent,
        };
      }
      return;
    }

    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapRef.current < 280) {
        handleToggleDoubleTapZoom();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      if (zoomPercent > 100) {
        setIsDragging(true);
        dragStartRef.current = {
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
          panX: pan.x,
          panY: pan.y,
        };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchStartRef.current) {
      const currentDist = getTouchDistance(e.touches);
      if (currentDist > 0 && pinchStartRef.current.distance > 0) {
        const scaleRatio = currentDist / pinchStartRef.current.distance;
        updateZoom(pinchStartRef.current.zoom * scaleRatio);
      }
      return;
    }

    if (e.touches.length === 1 && isDragging && dragStartRef.current && zoomPercent > 100) {
      const dx = e.touches[0].clientX - dragStartRef.current.clientX;
      const dy = e.touches[0].clientY - dragStartRef.current.clientY;
      setPan({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      pinchStartRef.current = null;
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };

  const handleDownloadReceipt = async () => {
    if (!imageUrl || isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Falha ao buscar imagem para download.");
      }
      const blob = await response.blob();
      const extension = blob.type.includes("png")
        ? "png"
        : blob.type.includes("jpeg") || blob.type.includes("jpg")
          ? "jpg"
          : "webp";
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `comprovante-pix-caloteiro-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("Comprovante baixado com sucesso, Tubarão!");
    } catch {
      // Fallback caso CORS restrinja fetch direto em algum ambiente
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!imageUrl) return null;

  const isModifiedView = zoomPercent !== 100 || pan.x !== 0 || pan.y !== 0;

  return (
    <Dialog
      open={open}
      disablePointerDismissal
      onOpenChange={() => {
        // Bloqueio intencional: o visualizador em tela cheia SÓ fecha ao clicar no botão X explícito.
        // Evita fechamento acidental durante pinça de zoom ou arraste no mobile/desktop.
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="fixed inset-0 left-0 top-0 translate-x-0 translate-y-0 w-screen max-w-none h-dvh max-h-none m-0 p-0 rounded-none border-0 bg-zinc-950/95 backdrop-blur-md flex flex-col overflow-hidden select-none z-50 gap-0"
      >
        {/* Barra Superior: Título + Baixar + Botão X (Único ponto de fechamento) */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/90 shrink-0 z-20">
          <div className="min-w-0 flex-1">
            <DialogTitle className="font-heading text-sm sm:text-base font-bold text-white truncate">
              {title}
            </DialogTitle>
            <p className="text-[10px] sm:text-xs font-mono text-zinc-400 truncate mt-0.5">
              {zoomPercent > 100
                ? "Arraste para inspecionar o comprovante"
                : "Use a barra abaixo, pinça ou duplo toque para dar zoom"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadReceipt}
              disabled={isDownloading}
              title="Baixar comprovante original"
              className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-3 sm:px-4 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-xs font-mono font-bold transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {isDownloading ? (
                <FaSpinner className="size-3.5 animate-spin text-emerald-400" />
              ) : (
                <FaDownload className="size-3.5 text-emerald-400" />
              )}
              <span className="hidden xs:inline sm:inline">Baixar</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar comprovante"
              title="Fechar (X)"
              className="inline-flex items-center justify-center size-9 sm:size-10 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-red-950/60 hover:border-red-500/40 text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <FaXmark className="size-4 sm:size-5" />
            </button>
          </div>
        </div>

        {/* Área Central Interativa de Tela Cheia (Canvas de Zoom e Pan) */}
        <div
          onWheel={handleWheel}
          onDoubleClick={handleToggleDoubleTapZoom}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={cn(
            "relative flex-1 w-full h-full overflow-hidden flex items-center justify-center p-2 sm:p-6 touch-none",
            zoomPercent > 100
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-zoom-in"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            draggable={false}
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomPercent / 100})`,
              transformOrigin: "center center",
            }}
            className={cn(
              "max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl pointer-events-none select-none",
              !isDragging && "transition-transform duration-150 ease-out"
            )}
          />
        </div>

        {/* Dock Inferior de Controle de Zoom (Mobile 320px & Desktop) */}
        <div className="px-3 sm:px-6 py-3 border-t border-zinc-800/80 bg-zinc-950/90 shrink-0 z-20">
          <div className="max-w-md mx-auto flex items-center justify-between gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => updateZoom(zoomPercent - ZOOM_STEP)}
              disabled={zoomPercent <= MIN_ZOOM}
              aria-label="Diminuir zoom"
              className="inline-flex items-center justify-center size-8 sm:size-9 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer shrink-0"
            >
              <FaMagnifyingGlassMinus className="size-3.5" />
            </button>

            <div className="flex-1 px-1 sm:px-2">
              <Slider
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={5}
                value={[zoomPercent]}
                onValueChange={(val) => {
                  const nextVal = Array.isArray(val) ? val[0] : val;
                  if (typeof nextVal === "number") {
                    updateZoom(nextVal);
                  }
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => updateZoom(zoomPercent + ZOOM_STEP)}
              disabled={zoomPercent >= MAX_ZOOM}
              aria-label="Aumentar zoom"
              className="inline-flex items-center justify-center size-8 sm:size-9 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer shrink-0"
            >
              <FaMagnifyingGlassPlus className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={handleResetView}
              disabled={!isModifiedView}
              title="Restaurar tamanho original (100%)"
              className="inline-flex items-center justify-center gap-1 h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 disabled:opacity-50 text-[11px] font-mono font-bold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              <FaRotateLeft className="size-3 text-zinc-400" />
              <span>{zoomPercent}%</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
