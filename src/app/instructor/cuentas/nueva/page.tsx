import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { CuentaForm } from "@/components/cuentas/cuenta-form";
import { PageHeader } from "@/components/shared/page-header";
import { type CategoriaKey } from "@/lib/constants";

export default async function NuevaCuentaPage() {
  const session = await requireRole("INSTRUCTOR");

  const [sedes, tarifas] = await Promise.all([
    prisma.sede.findMany({
      where: { activa: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.tarifaInstructor.findMany({
      where: { instructorId: session.user.id },
      orderBy: { categoria: "asc" },
    }),
  ]);

  const tarifasProp = tarifas.map((t) => ({
    categoria: t.categoria as CategoriaKey,
    valorHora: Number(t.valorHora),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Nueva Cuenta de Cobro" />
      <div className="max-w-3xl">
        <CuentaForm sedes={sedes} tarifas={tarifasProp} />
      </div>
    </div>
  );
}
