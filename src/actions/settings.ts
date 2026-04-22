"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { hash, compare } from "bcryptjs";

export async function cambiarPassword(data: {
  passwordActual: string;
  passwordNueva: string;
}) {
  const session = await requireAuth();

  if (!data.passwordActual || !data.passwordNueva) {
    return { error: "Ambos campos son requeridos" };
  }

  if (data.passwordNueva.length < 8) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return { error: "Usuario no encontrado" };

  const isValid = await compare(data.passwordActual, user.password);
  if (!isValid) {
    return { error: "La contraseña actual es incorrecta" };
  }

  const hashedPassword = await hash(data.passwordNueva, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  return { success: true };
}
