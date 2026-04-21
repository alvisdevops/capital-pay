"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { createInstructorSchema, instructorSchema, type TarifasInput } from "@/lib/validators/instructor";
import { CATEGORIAS, type CategoriaKey } from "@/lib/constants";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import type { Categoria } from "@prisma/client";

async function syncTarifas(instructorId: string, tarifas: TarifasInput | undefined) {
  if (!tarifas) return;
  for (const categoria of CATEGORIAS) {
    const valor = tarifas[categoria as CategoriaKey];
    if (valor && valor > 0) {
      await prisma.tarifaInstructor.upsert({
        where: { instructorId_categoria: { instructorId, categoria: categoria as Categoria } },
        create: { instructorId, categoria: categoria as Categoria, valorHora: valor },
        update: { valorHora: valor },
      });
    } else {
      await prisma.tarifaInstructor.deleteMany({
        where: { instructorId, categoria: categoria as Categoria },
      });
    }
  }
}

export async function crearInstructor(data: unknown) {
  await requireRole("ADMIN");

  const parsed = createInstructorSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { password, tarifas, ...rest } = parsed.data;

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

  const instructor = await prisma.user.create({
    data: {
      ...rest,
      tipoCuenta: rest.tipoCuenta || null,
      password: hashedPassword,
      role: "INSTRUCTOR",
    },
  });

  await syncTarifas(instructor.id, tarifas);

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

  const { password, tarifas, ...rest } = parsed.data;

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

  await syncTarifas(instructorId, tarifas);

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
