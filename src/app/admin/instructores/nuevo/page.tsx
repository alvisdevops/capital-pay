import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { InstructorForm } from "@/components/instructores/instructor-form";
import { PageHeader } from "@/components/shared/page-header";

export default async function NuevoInstructorPage() {
  await requireRole("ADMIN");

  const sedes = await prisma.sede.findMany({
    where: { activa: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Nuevo Instructor" />
      <div className="max-w-2xl">
        <InstructorForm sedes={sedes} />
      </div>
    </div>
  );
}
