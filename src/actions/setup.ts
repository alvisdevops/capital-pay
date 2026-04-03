"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function completarSetup(data: {
  passwordNueva: string;
  confirmarPassword: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
}) {
  const session = await requireAuth();

  if (!data.passwordNueva || data.passwordNueva.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  if (data.passwordNueva !== data.confirmarPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  if (!data.banco || !data.tipoCuenta || !data.numeroCuenta) {
    return { error: "Todos los datos bancarios son requeridos" };
  }

  const hashedPassword = await hash(data.passwordNueva, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      password: hashedPassword,
      banco: data.banco,
      tipoCuenta: data.tipoCuenta as "AHORROS" | "CORRIENTE",
      numeroCuenta: data.numeroCuenta,
      setupCompleto: true,
    },
  });

  revalidatePath("/instructor");
  return { success: true };
}
