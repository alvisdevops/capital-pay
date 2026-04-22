import { formatDate } from "@/lib/utils";
import { ESTADOS_CUENTA } from "@/lib/constants";
import { type EstadoCuenta } from "@prisma/client";
import { ArrowRight } from "lucide-react";

interface HistorialItem {
  id: string;
  estadoAnterior: EstadoCuenta;
  estadoNuevo: EstadoCuenta;
  observacion: string | null;
  createdAt: Date;
  cambiadoPor: { nombre: string; apellido: string; role: string };
}

export function HistorialEstadoList({ historial }: { historial: HistorialItem[] }) {
  if (historial.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Sin cambios de estado registrados.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {historial.map((h) => (
        <li key={h.id} className="flex gap-3 text-sm">
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{ESTADOS_CUENTA[h.estadoAnterior].label}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{ESTADOS_CUENTA[h.estadoNuevo].label}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {formatDate(h.createdAt)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Por {h.cambiadoPor.nombre} {h.cambiadoPor.apellido} ({h.cambiadoPor.role.toLowerCase()})
            </p>
            {h.observacion && (
              <p className="mt-1 text-sm bg-muted/40 rounded px-2 py-1">{h.observacion}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
