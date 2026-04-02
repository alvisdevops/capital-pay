import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ToggleActivoButton } from "@/components/instructores/toggle-activo-button";
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
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Cuentas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructores.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell className="font-medium">
                    {instructor.nombre} {instructor.apellido}
                  </TableCell>
                  <TableCell>{instructor.cedula}</TableCell>
                  <TableCell>{instructor.email}</TableCell>
                  <TableCell>{instructor.sede?.nombre || "-"}</TableCell>
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
      )}
    </div>
  );
}
