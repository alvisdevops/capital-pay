import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CuentaStatusBadge } from "@/components/cuentas/cuenta-status-badge";
import { PdfPreviewDialog } from "@/components/cuentas/pdf-preview-dialog";
import { StatusChangeDialog } from "@/components/cuentas/status-change-dialog";
import { formatCurrency, formatDate, formatDateShort, conceptoDesdeCategorias } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { HistorialEstadoList } from "@/components/cuentas/historial-estado";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminCuentaDetailPage({ params }: Props) {
  await requireRole("ADMIN");
  const { id } = await params;

  const cuenta = await prisma.cuentaCobro.findUnique({
    where: { id },
    include: {
      sede: true,
      instructor: true,
      items: { orderBy: { fecha: "asc" } },
      historial: {
        orderBy: { createdAt: "desc" },
        include: {
          cambiadoPor: { select: { nombre: true, apellido: true, role: true } },
        },
      },
    },
  });

  if (!cuenta) notFound();
  if (cuenta.estado === "BORRADOR") notFound();

  const totalHoras = cuenta.items.reduce((s, i) => s + i.horas, 0);
  const categorias = Array.from(new Set(cuenta.items.map((i) => i.categoria))).sort();
  const concepto = conceptoDesdeCategorias(categorias);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Cuenta de Cobro #${String(cuenta.numero).padStart(5, "0")}`}
        action={
          <div className="flex gap-2">
            <PdfPreviewDialog
              cuentaId={cuenta.id}
              cuentaNumero={String(cuenta.numero).padStart(5, "0")}
            >
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Ver PDF
              </Button>
            </PdfPreviewDialog>
            <StatusChangeDialog cuentaId={cuenta.id} estadoActual={cuenta.estado} />
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Estado</span>
              <CuentaStatusBadge estado={cuenta.estado} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sede</span>
              <span className="text-sm font-medium">{cuenta.sede.nombre}</span>
            </div>
            {cuenta.items.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">Concepto</span>
                <p className="mt-1 text-sm">{concepto}</p>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total horas</span>
              <span className="text-sm font-medium">{totalHoras}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valor</span>
              <span className="text-lg font-bold text-green-700">
                {formatCurrency(Number(cuenta.valor))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Periodo</span>
              <span className="text-sm">
                {formatDate(cuenta.periodoInicio)} - {formatDate(cuenta.periodoFin)}
              </span>
            </div>
            {cuenta.descripcion && (
              <div>
                <span className="text-sm text-muted-foreground">Notas</span>
                <p className="mt-1 text-sm">{cuenta.descripcion}</p>
              </div>
            )}
            {cuenta.observaciones && (
              <div className="rounded-md bg-yellow-50 p-3">
                <span className="text-sm font-medium text-yellow-800">Observaciones:</span>
                <p className="mt-1 text-sm text-yellow-700">{cuenta.observaciones}</p>
              </div>
            )}
            {cuenta.fechaPago && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fecha de pago</span>
                <span className="text-sm font-medium text-green-700">
                  {formatDate(cuenta.fechaPago)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Datos del Instructor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nombre</span>
              <span className="text-sm font-medium">
                {cuenta.instructor.nombre} {cuenta.instructor.apellido}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cédula</span>
              <span className="text-sm">{cuenta.instructor.cedula}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm">{cuenta.instructor.email}</span>
            </div>
            {cuenta.instructor.telefono && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Teléfono</span>
                <span className="text-sm">{cuenta.instructor.telefono}</span>
              </div>
            )}
            {cuenta.instructor.banco && (
              <>
                <div className="border-t pt-3">
                  <span className="text-sm font-medium text-muted-foreground">Datos Bancarios</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Banco</span>
                  <span className="text-sm">{cuenta.instructor.banco}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tipo</span>
                  <span className="text-sm">
                    {cuenta.instructor.tipoCuenta === "AHORROS" ? "Ahorros" : "Corriente"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">No. Cuenta</span>
                  <span className="text-sm">{cuenta.instructor.numeroCuenta}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {cuenta.historial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historial</CardTitle>
          </CardHeader>
          <CardContent>
            <HistorialEstadoList historial={cuenta.historial} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clases dictadas ({cuenta.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {cuenta.items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Esta cuenta no tiene items registrados.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Horas</TableHead>
                  <TableHead className="text-right">Valor hora</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuenta.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDateShort(item.fecha)}</TableCell>
                    <TableCell>{item.categoria}</TableCell>
                    <TableCell className="text-right">{item.horas}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(item.valorHora))}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(item.subtotal))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
