"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { enviarCuenta } from "@/actions/cuentas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function EnviarCuentaButton({ cuentaId }: { cuentaId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEnviar() {
    setLoading(true);
    setError("");
    const result = await enviarCuenta(cuentaId);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Send className="mr-2 h-4 w-4" />
        Enviar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar cuenta de cobro</DialogTitle>
          <DialogDescription>
            Al enviar, el valor hora de cada fila queda congelado con la tarifa actual
            y la cuenta pasa a revisión del administrador. No podrás editarla después.
          </DialogDescription>
        </DialogHeader>
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleEnviar} disabled={loading}>
            {loading ? "Enviando..." : "Confirmar envío"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
