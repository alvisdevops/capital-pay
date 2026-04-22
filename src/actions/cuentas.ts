"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { cuentaBorradorSchema, cambiarEstadoSchema } from "@/lib/validators/cuenta";
import { TRANSICIONES_VALIDAS } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import type { Categoria, EstadoCuenta } from "@prisma/client";

export async function guardarBorrador(data: unknown, cuentaId?: string) {
  const session = await requireAuth();
  if (session.user.role !== "INSTRUCTOR") {
    return { error: "Solo los instructores pueden crear cuentas de cobro" };
  }

  const parsed = cuentaBorradorSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { sedeId, descripcion, items } = parsed.data;

  if (cuentaId) {
    const cuenta = await prisma.cuentaCobro.findUnique({ where: { id: cuentaId } });
    if (!cuenta) return { error: "Cuenta no encontrada" };
    if (cuenta.instructorId !== session.user.id) return { error: "No autorizado" };
    if (cuenta.estado !== "BORRADOR") {
      return { error: "Solo se pueden editar cuentas en borrador" };
    }

    await prisma.$transaction([
      prisma.cuentaItem.deleteMany({ where: { cuentaId } }),
      prisma.cuentaCobro.update({
        where: { id: cuentaId },
        data: {
          sedeId,
          descripcion: descripcion || null,
          items: {
            create: items.map((i) => ({
              fecha: new Date(i.fecha),
              horas: i.horas,
              categoria: i.categoria as Categoria,
              valorHora: 0,
              subtotal: 0,
            })),
          },
        },
      }),
    ]);

    revalidatePath("/instructor/cuentas");
    revalidatePath(`/instructor/cuentas/${cuentaId}`);
    return { success: true, cuentaId };
  }

  const hoy = new Date();
  const cuenta = await prisma.cuentaCobro.create({
    data: {
      instructorId: session.user.id,
      sedeId,
      descripcion: descripcion || null,
      valor: 0,
      periodoInicio: hoy,
      periodoFin: hoy,
      estado: "BORRADOR",
      items: {
        create: items.map((i) => ({
          fecha: new Date(i.fecha),
          horas: i.horas,
          categoria: i.categoria as Categoria,
          valorHora: 0,
          subtotal: 0,
        })),
      },
    },
  });

  revalidatePath("/instructor/cuentas");
  revalidatePath("/instructor/dashboard");
  return { success: true, cuentaId: cuenta.id };
}

export async function enviarCuenta(cuentaId: string) {
  const session = await requireAuth();
  if (session.user.role !== "INSTRUCTOR") {
    return { error: "No autorizado" };
  }

  const cuenta = await prisma.cuentaCobro.findUnique({
    where: { id: cuentaId },
    include: { items: true },
  });

  if (!cuenta) return { error: "Cuenta no encontrada" };
  if (cuenta.instructorId !== session.user.id) return { error: "No autorizado" };
  if (cuenta.estado !== "BORRADOR") {
    return { error: "Solo se pueden enviar cuentas en borrador" };
  }
  if (cuenta.items.length === 0) {
    return { error: "Agrega al menos una fila antes de enviar" };
  }

  const tarifas = await prisma.tarifaInstructor.findMany({
    where: { instructorId: session.user.id },
  });
  const tarifaMap = new Map(tarifas.map((t) => [t.categoria, Number(t.valorHora)]));

  const faltantes = cuenta.items
    .filter((i) => !tarifaMap.has(i.categoria))
    .map((i) => i.categoria);
  if (faltantes.length > 0) {
    return {
      error: `El admin no te ha asignado tarifa para: ${Array.from(new Set(faltantes)).join(", ")}`,
    };
  }

  let total = 0;
  const updates = cuenta.items.map((item) => {
    const valorHora = tarifaMap.get(item.categoria)!;
    const subtotal = valorHora * item.horas;
    total += subtotal;
    return prisma.cuentaItem.update({
      where: { id: item.id },
      data: { valorHora, subtotal },
    });
  });

  const fechas = cuenta.items.map((i) => i.fecha.getTime());
  const periodoInicio = new Date(Math.min(...fechas));
  const periodoFin = new Date(Math.max(...fechas));

  await prisma.$transaction([
    ...updates,
    prisma.cuentaCobro.update({
      where: { id: cuentaId },
      data: {
        estado: "PENDIENTE",
        valor: total,
        periodoInicio,
        periodoFin,
      },
    }),
    prisma.historialEstado.create({
      data: {
        cuentaId,
        estadoAnterior: "BORRADOR",
        estadoNuevo: "PENDIENTE",
        cambiadoPorId: session.user.id,
      },
    }),
  ]);

  revalidatePath("/instructor/cuentas");
  revalidatePath(`/instructor/cuentas/${cuentaId}`);
  revalidatePath("/admin/cuentas");
  revalidatePath("/instructor/dashboard");
  return { success: true };
}

export async function reabrirCuenta(cuentaId: string) {
  const session = await requireAuth();
  if (session.user.role !== "INSTRUCTOR") {
    return { error: "No autorizado" };
  }

  const cuenta = await prisma.cuentaCobro.findUnique({ where: { id: cuentaId } });
  if (!cuenta) return { error: "Cuenta no encontrada" };
  if (cuenta.instructorId !== session.user.id) return { error: "No autorizado" };
  if (cuenta.estado !== "RECHAZADA") {
    return { error: "Solo se pueden reabrir cuentas rechazadas" };
  }

  await prisma.$transaction([
    prisma.cuentaCobro.update({
      where: { id: cuentaId },
      data: { estado: "BORRADOR" },
    }),
    prisma.historialEstado.create({
      data: {
        cuentaId,
        estadoAnterior: "RECHAZADA",
        estadoNuevo: "BORRADOR",
        cambiadoPorId: session.user.id,
      },
    }),
  ]);

  revalidatePath("/instructor/cuentas");
  revalidatePath(`/instructor/cuentas/${cuentaId}`);
  return { success: true, cuentaId };
}

export async function eliminarCuenta(cuentaId: string) {
  const session = await requireAuth();

  const cuenta = await prisma.cuentaCobro.findUnique({
    where: { id: cuentaId },
  });

  if (!cuenta) return { error: "Cuenta no encontrada" };
  if (cuenta.instructorId !== session.user.id) return { error: "No autorizado" };
  if (cuenta.estado !== "BORRADOR") {
    return { error: "Solo se pueden eliminar cuentas en borrador" };
  }

  await prisma.cuentaCobro.delete({ where: { id: cuentaId } });

  revalidatePath("/instructor/cuentas");
  revalidatePath("/instructor/dashboard");
  return { success: true };
}

export async function cambiarEstadoCuenta(data: unknown) {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    return { error: "Solo los administradores pueden cambiar el estado" };
  }

  const parsed = cambiarEstadoSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { cuentaId, nuevoEstado, observaciones } = parsed.data;

  const cuenta = await prisma.cuentaCobro.findUnique({
    where: { id: cuentaId },
  });

  if (!cuenta) return { error: "Cuenta no encontrada" };

  const transicionesPermitidas = TRANSICIONES_VALIDAS[cuenta.estado];
  if (!transicionesPermitidas?.includes(nuevoEstado)) {
    return { error: `No se puede cambiar de ${cuenta.estado} a ${nuevoEstado}` };
  }

  const estadoAnterior = cuenta.estado;

  await prisma.$transaction([
    prisma.cuentaCobro.update({
      where: { id: cuentaId },
      data: {
        estado: nuevoEstado,
        observaciones: observaciones || null,
        fechaPago: nuevoEstado === "PAGADA" ? new Date() : null,
      },
    }),
    prisma.historialEstado.create({
      data: {
        cuentaId,
        estadoAnterior,
        estadoNuevo: nuevoEstado as EstadoCuenta,
        observacion: observaciones || null,
        cambiadoPorId: session.user.id,
      },
    }),
  ]);

  revalidatePath("/admin/cuentas");
  revalidatePath(`/admin/cuentas/${cuentaId}`);
  revalidatePath(`/instructor/cuentas/${cuentaId}`);
  return { success: true };
}
