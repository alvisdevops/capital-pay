import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { CuentaStatusBadge } from "@/components/cuentas/cuenta-status-badge";
import { StatusChangeDialog } from "@/components/cuentas/status-change-dialog";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { type EstadoCuenta } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Download } from "lucide-react";

interface Props {
  searchParams: Promise<{
    estado?: string;
    instructor?: string;
    sede?: string;
  }>;
}

export default async function AdminCuentasPage({ searchParams }: Props) {
  await requireRole("ADMIN");
  const params = await searchParams;

  const where: Record<string, unknown> = {};
  if (params.estado && params.estado !== "TODOS") {
    where.estado = params.estado as EstadoCuenta;
  }
  if (params.instructor) {
    where.instructorId = params.instructor;
  }
  if (params.sede) {
    where.sedeId = params.sede;
  }

  const [cuentas, instructores, sedes] = await Promise.all([
    prisma.cuentaCobro.findMany({
      where,
      include: {
        instructor: { select: { nombre: true, apellido: true } },
        sede: { select: { nombre: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "INSTRUCTOR" },
      select: { id: true, nombre: true, apellido: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.sede.findMany({
      where: { activa: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  const estados = ["TODOS", "PENDIENTE", "APROBADA", "RECHAZADA", "PAGADA"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuentas de Cobro"
        description={`${cuentas.length} cuenta(s)`}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Estado</label>
          <div className="flex gap-1">
            {estados.map((estado) => (
              <Link
                key={estado}
                href={{
                  pathname: "/admin/cuentas",
                  query: {
                    ...params,
                    estado: estado === "TODOS" ? undefined : estado,
                  },
                }}
              >
                <Button
                  variant={
                    (params.estado || "TODOS") === estado ? "default" : "outline"
                  }
                  size="sm"
                >
                  {estado === "TODOS" ? "Todos" : estado.charAt(0) + estado.slice(1).toLowerCase()}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {cuentas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No se encontraron cuentas de cobro.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuentas.map((cuenta) => (
                <TableRow key={cuenta.id}>
                  <TableCell className="font-medium">
                    {String(cuenta.numero).padStart(5, "0")}
                  </TableCell>
                  <TableCell>
                    {cuenta.instructor.nombre} {cuenta.instructor.apellido}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {cuenta.concepto}
                  </TableCell>
                  <TableCell>{cuenta.sede.nombre}</TableCell>
                  <TableCell className="text-sm">
                    {formatDateShort(cuenta.periodoInicio)} -{" "}
                    {formatDateShort(cuenta.periodoFin)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(cuenta.valor))}
                  </TableCell>
                  <TableCell>
                    <CuentaStatusBadge estado={cuenta.estado} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/cuentas/${cuenta.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <a href={`/api/pdf/${cuenta.id}`} target="_blank">
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                      <StatusChangeDialog
                        cuentaId={cuenta.id}
                        estadoActual={cuenta.estado}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
