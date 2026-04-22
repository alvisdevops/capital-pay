import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CuentaForm } from "@/components/cuentas/cuenta-form";
import { PageHeader } from "@/components/shared/page-header";
import { type CategoriaKey } from "@/lib/constants";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarCuentaPage({ params }: Props) {
  const session = await requireRole("INSTRUCTOR");
  const { id } = await params;

  const cuenta = await prisma.cuentaCobro.findUnique({
    where: { id },
    include: { items: { orderBy: { fecha: "asc" } } },
  });

  if (!cuenta || cuenta.instructorId !== session.user.id) {
    notFound();
  }

  if (cuenta.estado !== "BORRADOR") {
    notFound();
  }

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
      <PageHeader title={`Editar Borrador #${String(cuenta.numero).padStart(5, "0")}`} />
      <div className="max-w-3xl">
        <CuentaForm
          sedes={sedes}
          tarifas={tarifasProp}
          defaultValues={{
            id: cuenta.id,
            sedeId: cuenta.sedeId,
            descripcion: cuenta.descripcion,
            items: cuenta.items.map((i) => ({
              fecha: i.fecha.toISOString().split("T")[0],
              horas: i.horas,
              categoria: i.categoria as CategoriaKey,
            })),
          }}
        />
      </div>
    </div>
  );
}
