import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { CuentaForm } from "@/components/cuentas/cuenta-form";
import { PageHeader } from "@/components/shared/page-header";

export default async function NuevaCuentaPage() {
  await requireRole("INSTRUCTOR");

  const sedes = await prisma.sede.findMany({
    where: { activa: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Nueva Cuenta de Cobro" />
      <div className="max-w-2xl">
        <CuentaForm sedes={sedes} />
      </div>
    </div>
  );
}
