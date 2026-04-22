import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { CuentaStatusBadge } from "@/components/cuentas/cuenta-status-badge";
import { StatusChangeDialog } from "@/components/cuentas/status-change-dialog";
import { PdfPreviewDialog } from "@/components/cuentas/pdf-preview-dialog";
import { SearchInput } from "@/components/cuentas/search-input";
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

const PAGE_SIZE = 10;

interface Props {
  searchParams: Promise<{
    estado?: string;
    instructor?: string;
    sede?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function AdminCuentasPage({ searchParams }: Props) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));

  const where: Record<string, unknown> = { estado: { not: "BORRADOR" } };
  if (params.estado && params.estado !== "TODOS") {
    where.estado = params.estado as EstadoCuenta;
  }
  if (params.instructor) {
    where.instructorId = params.instructor;
  }
  if (params.sede) {
    where.sedeId = params.sede;
  }
  if (params.q) {
    where.instructor = {
      OR: [
        { nombre: { contains: params.q, mode: "insensitive" } },
        { apellido: { contains: params.q, mode: "insensitive" } },
      ],
    };
  }

  const [cuentas, total] = await Promise.all([
    prisma.cuentaCobro.findMany({
      where,
      include: {
        instructor: { select: { nombre: true, apellido: true } },
        sede: { select: { nombre: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.cuentaCobro.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const estados = ["TODOS", "PENDIENTE", "APROBADA", "RECHAZADA", "PAGADA"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuentas de Cobro"
        description={`${total} cuenta(s)`}
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Estado</label>
          <div className="flex gap-1 flex-wrap">
            {estados.map((estado) => (
              <Link
                key={estado}
                href={{
                  pathname: "/admin/cuentas",
                  query: {
                    ...params,
                    estado: estado === "TODOS" ? undefined : estado,
                    page: undefined,
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
        <SearchInput basePath="/admin/cuentas" />
      </div>

      {cuentas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No se encontraron cuentas de cobro.</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border rounded-lg border bg-card">
            {cuentas.map((cuenta) => (
              <Link key={cuenta.id} href={`/admin/cuentas/${cuenta.id}`} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">#{String(cuenta.numero).padStart(5, "0")}</span>
                    <CuentaStatusBadge estado={cuenta.estado} />
                  </div>
                  <p className="font-medium truncate">{cuenta.instructor.nombre} {cuenta.instructor.apellido}</p>
                  <p className="text-sm text-muted-foreground truncate">{cuenta.concepto}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{cuenta.sede.nombre}</span>
                    <span className="font-medium">{formatCurrency(Number(cuenta.valor))}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead className="hidden lg:table-cell">Sede</TableHead>
                  <TableHead className="hidden lg:table-cell">Periodo</TableHead>
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
                    <TableCell className="hidden lg:table-cell">{cuenta.sede.nombre}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
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
                        <PdfPreviewDialog
                          cuentaId={cuenta.id}
                          cuentaNumero={String(cuenta.numero).padStart(5, "0")}
                        >
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </PdfPreviewDialog>
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

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/admin/cuentas"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}
