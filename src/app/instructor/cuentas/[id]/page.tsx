import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CuentaStatusBadge } from "@/components/cuentas/cuenta-status-badge";
import { PdfPreviewDialog } from "@/components/cuentas/pdf-preview-dialog";
import { formatCurrency, formatDate, formatDateShort } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Download, Pencil } from "lucide-react";
import { DeleteCuentaButton } from "./delete-button";
import { EnviarCuentaButton } from "./enviar-button";
import { ReabrirCuentaButton } from "./reabrir-button";
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

export default async function CuentaDetailPage({ params }: Props) {
  const session = await requireRole("INSTRUCTOR");
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

  if (!cuenta || cuenta.instructorId !== session.user.id) {
    notFound();
  }

  const isBorrador = cuenta.estado === "BORRADOR";
  const isRechazada = cuenta.estado === "RECHAZADA";
  const totalHoras = cuenta.items.reduce((s, i) => s + i.horas, 0);
  const totalValor = cuenta.items.reduce((s, i) => s + Number(i.subtotal), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${isBorrador ? "Borrador" : "Cuenta de Cobro"} #${String(cuenta.numero).padStart(5, "0")}`}
        action={
          <div className="flex gap-2 flex-wrap">
            {!isBorrador && (
              <PdfPreviewDialog
                cuentaId={cuenta.id}
                cuentaNumero={String(cuenta.numero).padStart(5, "0")}
              >
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Ver PDF
                </Button>
              </PdfPreviewDialog>
            )}
            {isBorrador && (
              <>
                <Link href={`/instructor/cuentas/${cuenta.id}/editar`}>
                  <Button variant="outline">
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </Link>
                <EnviarCuentaButton cuentaId={cuenta.id} />
                <DeleteCuentaButton cuentaId={cuenta.id} />
              </>
            )}
            {isRechazada && <ReabrirCuentaButton cuentaId={cuenta.id} />}
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información General</CardTitle>
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
            {!isBorrador && cuenta.concepto && (
              <div>
                <span className="text-sm text-muted-foreground">Concepto</span>
                <p className="mt-1 text-sm">{cuenta.concepto}</p>
              </div>
            )}
            {cuenta.descripcion && (
              <div>
                <span className="text-sm text-muted-foreground">Notas</span>
                <p className="mt-1 text-sm">{cuenta.descripcion}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Totales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total horas</span>
              <span className="text-sm font-medium">{totalHoras}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                {isBorrador ? "Total estimado" : "Valor"}
              </span>
              <span className="text-lg font-bold text-green-700">
                {formatCurrency(isBorrador ? totalValor : Number(cuenta.valor))}
              </span>
            </div>
            {!isBorrador && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Periodo</span>
                <span className="text-sm font-medium">
                  {formatDate(cuenta.periodoInicio)} - {formatDate(cuenta.periodoFin)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fecha de creación</span>
              <span className="text-sm">{formatDate(cuenta.createdAt)}</span>
            </div>
            {cuenta.fechaPago && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fecha de pago</span>
                <span className="text-sm font-medium text-green-700">
                  {formatDate(cuenta.fechaPago)}
                </span>
              </div>
            )}
            {cuenta.observaciones && (
              <div className="rounded-md bg-yellow-50 p-3">
                <span className="text-sm font-medium text-yellow-800">Observaciones:</span>
                <p className="mt-1 text-sm text-yellow-700">{cuenta.observaciones}</p>
              </div>
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
              Este borrador no tiene filas aún.
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
                      {Number(item.valorHora) > 0
                        ? formatCurrency(Number(item.valorHora))
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {Number(item.subtotal) > 0
                        ? formatCurrency(Number(item.subtotal))
                        : "—"}
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
