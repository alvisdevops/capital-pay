import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { CuentaStatusBadge } from "@/components/cuentas/cuenta-status-badge";
import { formatCurrency, formatDateShort } from "@/lib/utils";
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
import { Eye } from "lucide-react";

export default async function InstructorCuentasPage() {
  const session = await requireRole("INSTRUCTOR");

  const cuentas = await prisma.cuentaCobro.findMany({
    where: { instructorId: session.user.id },
    include: { sede: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Cuentas de Cobro"
        description={`${cuentas.length} cuenta(s) registrada(s)`}
        action={
          <Link href="/instructor/cuentas/nueva">
            <Button>Nueva Cuenta</Button>
          </Link>
        }
      />

      {cuentas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-500">No tienes cuentas de cobro aún.</p>
          <Link href="/instructor/cuentas/nueva">
            <Button className="mt-4">Crear tu primera cuenta</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuentas.map((cuenta) => (
                <TableRow key={cuenta.id}>
                  <TableCell className="font-medium">
                    {String(cuenta.numero).padStart(5, "0")}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
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
                    <Link href={`/instructor/cuentas/${cuenta.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
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
