"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { createInstructorSchema, instructorSchema } from "@/lib/validators/instructor";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function crearInstructor(data: unknown) {
  await requireRole("ADMIN");

  const parsed = createInstructorSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { password, ...rest } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: rest.email }, { cedula: rest.cedula }],
    },
  });

  if (existing) {
    return {
      error: existing.email === rest.email
        ? "Ya existe un usuario con ese email"
        : "Ya existe un usuario con esa cédula",
    };
  }

  const hashedPassword = await hash(password, 12);

  await prisma.user.create({
    data: {
      ...rest,
      tipoCuenta: rest.tipoCuenta || null,
      password: hashedPassword,
      role: "INSTRUCTOR",
    },
  });

  revalidatePath("/admin/instructores");
  return { success: true };
}

export async function actualizarInstructor(instructorId: string, data: unknown) {
  await requireRole("ADMIN");

  const parsed = instructorSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const instructor = await prisma.user.findUnique({
    where: { id: instructorId },
  });

  if (!instructor) return { error: "Instructor no encontrado" };

  const { password, ...rest } = parsed.data;

  // Check uniqueness excluding current user
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: rest.email }, { cedula: rest.cedula }],
      NOT: { id: instructorId },
    },
  });

  if (existing) {
    return {
      error: existing.email === rest.email
        ? "Ya existe un usuario con ese email"
        : "Ya existe un usuario con esa cédula",
    };
  }

  const updateData: Record<string, unknown> = {
    ...rest,
    tipoCuenta: rest.tipoCuenta || null,
  };

  if (password) {
    updateData.password = await hash(password, 12);
  }

  await prisma.user.update({
    where: { id: instructorId },
    data: updateData,
  });

  revalidatePath("/admin/instructores");
  revalidatePath(`/admin/instructores/${instructorId}`);
  return { success: true };
}

export async function toggleInstructorActivo(instructorId: string) {
  await requireRole("ADMIN");

  const instructor = await prisma.user.findUnique({
    where: { id: instructorId },
  });

  if (!instructor) return { error: "Instructor no encontrado" };

  await prisma.user.update({
    where: { id: instructorId },
    data: { activo: !instructor.activo },
  });

  revalidatePath("/admin/instructores");
  return { success: true, activo: !instructor.activo };
}

export async function resetPasswordInstructor(instructorId: string, nuevaPassword: string) {
  await requireRole("ADMIN");

  if (!nuevaPassword || nuevaPassword.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  const instructor = await prisma.user.findUnique({
    where: { id: instructorId },
  });

  if (!instructor) return { error: "Instructor no encontrado" };

  const hashedPassword = await hash(nuevaPassword, 12);

  await prisma.user.update({
    where: { id: instructorId },
    data: {
      password: hashedPassword,
      setupCompleto: false,
    },
  });

  revalidatePath("/admin/instructores");
  return { success: true };
}
