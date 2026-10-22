"use client";

import * as React from "react";
import Image from "next/image";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReceiptViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  title?: string;
}

export function ReceiptViewerDialog({
  open,
  onOpenChange,
  imageUrl,
  title = "Comprovante Pix / Transferência",
}: ReceiptViewerDialogProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-4 sm:p-6 bg-zinc-950 border-zinc-800">
        <DialogHeader className="pb-2 border-b border-zinc-800">
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <FaFileInvoiceDollar className="text-emerald-400 size-4" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex-1 min-h-[300px] max-h-[70vh] w-full overflow-auto rounded-xl bg-zinc-900/60 p-2 flex items-center justify-center">
          <Image
            src={imageUrl}
            alt="Comprovante"
            width={1200}
            height={1600}
            unoptimized
            className="w-auto h-auto max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
