"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PdfPreviewDialogProps {
  cuentaId: string;
  cuentaNumero: string;
  children: React.ReactNode;
}

export function PdfPreviewDialog({ cuentaId, cuentaNumero, children }: PdfPreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const pdfUrl = `/api/pdf/${cuentaId}`;

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Cuenta de Cobro #{cuentaNumero}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-md border"
              title={`Cuenta de Cobro ${cuentaNumero}`}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
