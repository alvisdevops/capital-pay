import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InstructorForm } from "@/components/instructores/instructor-form";
import { PageHeader } from "@/components/shared/page-header";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarInstructorPage({ params }: Props) {
  await requireRole("ADMIN");
  const { id } = await params;

  const instructor = await prisma.user.findUnique({
    where: { id, role: "INSTRUCTOR" },
  });

  if (!instructor) notFound();

  const sedes = await prisma.sede.findMany({
    where: { activa: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title={`Editar: ${instructor.nombre} ${instructor.apellido}`} />
      <div className="max-w-2xl">
        <InstructorForm
          sedes={sedes}
          defaultValues={{
            id: instructor.id,
            email: instructor.email,
            nombre: instructor.nombre,
            apellido: instructor.apellido,
            cedula: instructor.cedula,
            telefono: instructor.telefono,
            direccion: instructor.direccion,
            ciudadExpedicion: instructor.ciudadExpedicion,
            sedeId: instructor.sedeId,
          }}
        />
      </div>
    </div>
  );
}
