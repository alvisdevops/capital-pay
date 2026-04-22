"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cambiarEstadoCuenta } from "@/actions/cuentas";
import { type EstadoCuenta } from "@prisma/client";
import { TRANSICIONES_VALIDAS, ESTADOS_CUENTA } from "@/lib/constants";

interface StatusChangeDialogProps {
  cuentaId: string;
  estadoActual: EstadoCuenta;
}

export function StatusChangeDialog({ cuentaId, estadoActual }: StatusChangeDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<string>("");
  const [observaciones, setObservaciones] = useState("");

  const transiciones = (TRANSICIONES_VALIDAS[estadoActual] || []).filter(
    (e) => e !== "BORRADOR",
  );

  if (transiciones.length === 0) return null;

  async function handleSubmit() {
    if (!selectedEstado) return;
    setLoading(true);

    const result = await cambiarEstadoCuenta({
      cuentaId,
      nuevoEstado: selectedEstado,
      observaciones: observaciones || undefined,
    });

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
      <DialogTrigger render={<Button size="sm" />}>
        Cambiar Estado
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Estado</DialogTitle>
          <DialogDescription>
            Estado actual: {ESTADOS_CUENTA[estadoActual].label}
          </DialogDescription>
        </DialogHeader>
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nuevo estado</Label>
            <div className="flex gap-2">
              {transiciones.map((estado) => (
                <Button
                  key={estado}
                  variant={selectedEstado === estado ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedEstado(estado)}
                >
                  {ESTADOS_CUENTA[estado as EstadoCuenta].label}
                </Button>
              ))}
            </div>
          </div>
          {selectedEstado === "RECHAZADA" && (
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (motivo del rechazo)</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Indica el motivo del rechazo..."
                rows={3}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedEstado || loading}>
            {loading ? "Guardando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
