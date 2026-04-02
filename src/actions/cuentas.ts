"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { cuentaCobroSchema, cambiarEstadoSchema } from "@/lib/validators/cuenta";
import { TRANSICIONES_VALIDAS } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function crearCuenta(data: unknown) {
  const session = await requireAuth();
  if (session.user.role !== "INSTRUCTOR") {
    return { error: "Solo los instructores pueden crear cuentas de cobro" };
  }

  const parsed = cuentaCobroSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { sedeId, concepto, descripcion, valor, periodoInicio, periodoFin } = parsed.data;

  const cuenta = await prisma.cuentaCobro.create({
    data: {
      instructorId: session.user.id,
      sedeId,
      concepto,
      descripcion: descripcion || null,
      valor,
      periodoInicio: new Date(periodoInicio),
      periodoFin: new Date(periodoFin),
    },
  });

  revalidatePath("/instructor/cuentas");
  revalidatePath("/instructor/dashboard");
  return { success: true, cuentaId: cuenta.id };
}

export async function actualizarCuenta(cuentaId: string, data: unknown) {
  const session = await requireAuth();

  const cuenta = await prisma.cuentaCobro.findUnique({
    where: { id: cuentaId },
  });

  if (!cuenta) return { error: "Cuenta no encontrada" };
  if (cuenta.instructorId !== session.user.id) return { error: "No autorizado" };
  if (cuenta.estado !== "PENDIENTE") return { error: "Solo se pueden editar cuentas pendientes" };

  const parsed = cuentaCobroSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { sedeId, concepto, descripcion, valor, periodoInicio, periodoFin } = parsed.data;

  await prisma.cuentaCobro.update({
    where: { id: cuentaId },
    data: {
      sedeId,
      concepto,
      descripcion: descripcion || null,
      valor,
      periodoInicio: new Date(periodoInicio),
      periodoFin: new Date(periodoFin),
    },
  });

  revalidatePath("/instructor/cuentas");
  revalidatePath(`/instructor/cuentas/${cuentaId}`);
  return { success: true };
}

export async function eliminarCuenta(cuentaId: string) {
  const session = await requireAuth();

  const cuenta = await prisma.cuentaCobro.findUnique({
    where: { id: cuentaId },
  });

  if (!cuenta) return { error: "Cuenta no encontrada" };
  if (cuenta.instructorId !== session.user.id) return { error: "No autorizado" };
  if (cuenta.estado !== "PENDIENTE") return { error: "Solo se pueden eliminar cuentas pendientes" };

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

  await prisma.cuentaCobro.update({
    where: { id: cuentaId },
    data: {
      estado: nuevoEstado,
      observaciones: observaciones || null,
      fechaPago: nuevoEstado === "PAGADA" ? new Date() : null,
    },
  });

  revalidatePath("/admin/cuentas");
  revalidatePath(`/admin/cuentas/${cuentaId}`);
  return { success: true };
}
