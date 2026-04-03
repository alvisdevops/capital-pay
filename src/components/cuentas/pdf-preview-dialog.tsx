"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";

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
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl h-[85vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Cuenta de Cobro #{cuentaNumero}</DialogTitle>
            <a href={pdfUrl} download={`cuenta-cobro-${cuentaNumero}.pdf`}>
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            </a>
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
