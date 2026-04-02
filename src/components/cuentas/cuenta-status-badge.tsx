import { Badge } from "@/components/ui/badge";
import { ESTADOS_CUENTA } from "@/lib/constants";
import { type EstadoCuenta } from "@prisma/client";
import { cn } from "@/lib/utils";

interface CuentaStatusBadgeProps {
  estado: EstadoCuenta;
}

export function CuentaStatusBadge({ estado }: CuentaStatusBadgeProps) {
  const config = ESTADOS_CUENTA[estado];

  return (
    <Badge variant="outline" className={cn("font-medium", config.color)}>
      {config.label}
    </Badge>
  );
}
