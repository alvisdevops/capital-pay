"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toggleInstructorActivo } from "@/actions/instructores";

export function ToggleActivoButton({
  instructorId,
  activo,
  instructorNombre,
}: {
  instructorId: string;
  activo: boolean;
  instructorNombre?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleToggle() {
    setLoading(true);
    setError("");
    const result = await toggleInstructorActivo(instructorId);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button
        variant={activo ? "destructive" : "default"}
        size="sm"
        onClick={() => setOpen(true)}
      >
        {activo ? "Desactivar" : "Activar"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activo ? "Desactivar instructor" : "Activar instructor"}
            </DialogTitle>
            <DialogDescription>
              {activo
                ? `${instructorNombre || "Este instructor"} no podra iniciar sesion ni enviar cuentas de cobro.`
                : `${instructorNombre || "Este instructor"} podra volver a iniciar sesion y enviar cuentas de cobro.`}
            </DialogDescription>
          </DialogHeader>
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant={activo ? "destructive" : "default"}
              onClick={handleToggle}
              disabled={loading}
            >
              {loading ? "..." : activo ? "Desactivar" : "Activar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
