import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CuentaForm } from "@/components/cuentas/cuenta-form";
import { PageHeader } from "@/components/shared/page-header";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarCuentaPage({ params }: Props) {
  const session = await requireRole("INSTRUCTOR");
  const { id } = await params;

  const cuenta = await prisma.cuentaCobro.findUnique({
    where: { id },
  });

  if (!cuenta || cuenta.instructorId !== session.user.id) {
    notFound();
  }

  if (cuenta.estado !== "PENDIENTE") {
    notFound();
  }

  const sedes = await prisma.sede.findMany({
    where: { activa: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Cuenta de Cobro" />
      <div className="max-w-2xl">
        <CuentaForm
          sedes={sedes}
          defaultValues={{
            id: cuenta.id,
            sedeId: cuenta.sedeId,
            concepto: cuenta.concepto,
            descripcion: cuenta.descripcion,
            valor: Number(cuenta.valor).toString(),
            periodoInicio: cuenta.periodoInicio.toISOString().split("T")[0],
            periodoFin: cuenta.periodoFin.toISOString().split("T")[0],
          }}
        />
      </div>
    </div>
  );
}
