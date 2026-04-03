import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ToggleActivoButton } from "@/components/instructores/toggle-activo-button";
import { ResetPasswordDialog } from "@/components/instructores/reset-password-dialog";
import { Badge } from "@/components/ui/badge";
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
import { Pencil, Plus } from "lucide-react";

export default async function AdminInstructoresPage() {
  await requireRole("ADMIN");

  const instructores = await prisma.user.findMany({
    where: { role: "INSTRUCTOR" },
    include: {
      sede: { select: { nombre: true } },
      _count: { select: { cuentasCobro: true } },
    },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instructores"
        description={`${instructores.length} instructor(es) registrado(s)`}
        action={
          <Link href="/admin/instructores/nuevo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Instructor
            </Button>
          </Link>
        }
      />

      {instructores.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No hay instructores registrados.</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border rounded-lg border bg-card">
            {instructores.map((instructor) => (
              <div key={instructor.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm shrink-0">
                      {instructor.nombre.charAt(0)}{instructor.apellido.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{instructor.nombre} {instructor.apellido}</p>
                      <p className="text-xs text-muted-foreground truncate">{instructor.email}</p>
                    </div>
                  </div>
                  <Badge variant={instructor.activo ? "default" : "secondary"}>
                    {instructor.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <Link href={`/admin/cuentas?instructor=${instructor.id}`} className="flex items-center justify-between text-sm hover:underline">
                  <span className="text-muted-foreground">{instructor.sede?.nombre || "-"}</span>
                  <span className="text-muted-foreground">{instructor._count.cuentasCobro} cuenta(s) →</span>
                </Link>
                <div className="flex items-center gap-2 pt-1">
                  <Link href={`/admin/instructores/${instructor.id}/editar`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                  </Link>
                  <ResetPasswordDialog
                    instructorId={instructor.id}
                    instructorNombre={`${instructor.nombre} ${instructor.apellido}`}
                  />
                  <ToggleActivoButton
                    instructorId={instructor.id}
                    activo={instructor.activo}
                    instructorNombre={`${instructor.nombre} ${instructor.apellido}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden lg:table-cell">Cedula</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Sede</TableHead>
                  <TableHead>Cuentas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructores.map((instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/cuentas?instructor=${instructor.id}`} className="hover:underline">
                        {instructor.nombre} {instructor.apellido}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{instructor.cedula}</TableCell>
                    <TableCell>{instructor.email}</TableCell>
                    <TableCell className="hidden lg:table-cell">{instructor.sede?.nombre || "-"}</TableCell>
                    <TableCell>{instructor._count.cuentasCobro}</TableCell>
                    <TableCell>
                      <Badge variant={instructor.activo ? "default" : "secondary"}>
                        {instructor.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/instructores/${instructor.id}/editar`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <ResetPasswordDialog
                          instructorId={instructor.id}
                          instructorNombre={`${instructor.nombre} ${instructor.apellido}`}
                        />
                        <ToggleActivoButton
                          instructorId={instructor.id}
                          activo={instructor.activo}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
