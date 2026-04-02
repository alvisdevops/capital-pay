"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

export async function obtenerResumenGeneral(filtros?: {
  desde?: string;
  hasta?: string;
}) {
  await requireRole("ADMIN");

  const where: Record<string, unknown> = {};
  if (filtros?.desde || filtros?.hasta) {
    where.createdAt = {};
    if (filtros.desde) {
      (where.createdAt as Record<string, unknown>).gte = new Date(filtros.desde);
    }
    if (filtros.hasta) {
      (where.createdAt as Record<string, unknown>).lte = new Date(filtros.hasta + "T23:59:59");
    }
  }

  const [porEstado, porInstructor, totalGeneral] = await Promise.all([
    prisma.cuentaCobro.groupBy({
      by: ["estado"],
      where,
      _count: true,
      _sum: { valor: true },
    }),
    prisma.cuentaCobro.groupBy({
      by: ["instructorId"],
      where,
      _count: true,
      _sum: { valor: true },
    }),
    prisma.cuentaCobro.aggregate({
      where,
      _count: true,
      _sum: { valor: true },
    }),
  ]);

  // Get instructor names
  const instructorIds = porInstructor.map((r) => r.instructorId);
  const instructores = await prisma.user.findMany({
    where: { id: { in: instructorIds } },
    select: { id: true, nombre: true, apellido: true },
  });

  const instructorMap = new Map(
    instructores.map((i) => [i.id, `${i.nombre} ${i.apellido}`])
  );

  return {
    porEstado: porEstado.map((r) => ({
      estado: r.estado,
      cantidad: r._count,
      total: Number(r._sum.valor || 0),
    })),
    porInstructor: porInstructor
      .map((r) => ({
        instructorId: r.instructorId,
        nombre: instructorMap.get(r.instructorId) || "Desconocido",
        cantidad: r._count,
        total: Number(r._sum.valor || 0),
      }))
      .sort((a, b) => b.total - a.total),
    totalGeneral: {
      cantidad: totalGeneral._count,
      total: Number(totalGeneral._sum.valor || 0),
    },
  };
}
