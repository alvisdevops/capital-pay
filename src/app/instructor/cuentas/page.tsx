import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { CuentaStatusBadge } from "@/components/cuentas/cuenta-status-badge";
import { formatCurrency, formatDateShort, categoriasToTexto } from "@/lib/utils";
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

const PAGE_SIZE = 10;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function InstructorCuentasPage({ searchParams }: Props) {
  const session = await requireRole("INSTRUCTOR");
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));

  const where = { instructorId: session.user.id };

  const [cuentas, total, tarifas] = await Promise.all([
    prisma.cuentaCobro.findMany({
      where,
      include: { sede: true, items: { select: { categoria: true, horas: true, subtotal: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.cuentaCobro.count({ where }),
    prisma.tarifaInstructor.findMany({ where: { instructorId: session.user.id } }),
  ]);

  const tarifaMap = new Map(tarifas.map((t) => [t.categoria, Number(t.valorHora)]));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const enriched = cuentas.map((c) => {
    const categorias = Array.from(new Set(c.items.map((i) => i.categoria))).sort();
    const totalHoras = c.items.reduce((s, i) => s + i.horas, 0);
    const resumen =
      categorias.length > 0
        ? `${totalHoras}h · ${categoriasToTexto(categorias)}`
        : "Sin filas";
    const totalBorrador = c.items.reduce(
      (s, i) => s + i.horas * (tarifaMap.get(i.categoria) ?? 0),
      0,
    );
    const valor = c.estado === "BORRADOR" ? totalBorrador : Number(c.valor);
    return { ...c, resumen, valorNumero: valor };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Cuentas de Cobro"
        description={`${total} cuenta(s) registrada(s)`}
        action={
          <Link href="/instructor/cuentas/nueva">
            <Button>Nueva Cuenta</Button>
          </Link>
        }
      />

      {enriched.length === 0 && page === 1 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No tienes cuentas de cobro aún.</p>
          <Link href="/instructor/cuentas/nueva">
            <Button className="mt-4">Crear tu primera cuenta</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border rounded-lg border bg-card">
            {enriched.map((cuenta) => (
              <Link key={cuenta.id} href={`/instructor/cuentas/${cuenta.id}`} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">#{String(cuenta.numero).padStart(5, "0")}</span>
                    <CuentaStatusBadge estado={cuenta.estado} />
                  </div>
                  <p className="font-medium truncate">{cuenta.resumen}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{cuenta.sede.nombre}</span>
                    <span className="font-medium">{formatCurrency(cuenta.valorNumero)}</span>
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
                <TableHead>Resumen</TableHead>
                <TableHead className="hidden lg:table-cell">Sede</TableHead>
                <TableHead className="hidden lg:table-cell">Periodo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enriched.map((cuenta) => (
                <TableRow key={cuenta.id}>
                  <TableCell className="font-medium">
                    {String(cuenta.numero).padStart(5, "0")}
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate">
                    {cuenta.resumen}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{cuenta.sede.nombre}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {cuenta.estado === "BORRADOR"
                      ? "—"
                      : `${formatDateShort(cuenta.periodoInicio)} - ${formatDateShort(cuenta.periodoFin)}`}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(cuenta.valorNumero)}
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

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/instructor/cuentas"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}
