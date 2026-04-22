import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SetupForm } from "./setup-form";

export default async function SetupPage() {
  const session = await requireRole("INSTRUCTOR");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      setupCompleto: true,
      telefono: true,
      direccion: true,
      ciudadExpedicion: true,
      banco: true,
      tipoCuenta: true,
      numeroCuenta: true,
    },
  });

  if (!user) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }

  if (user.setupCompleto) {
    redirect("/instructor/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <SetupForm
        userName={`${session.user.nombre} ${session.user.apellido}`}
        defaults={{
          telefono: user.telefono,
          direccion: user.direccion,
          ciudadExpedicion: user.ciudadExpedicion,
          banco: user.banco,
          tipoCuenta: user.tipoCuenta,
          numeroCuenta: user.numeroCuenta,
        }}
      />
    </div>
  );
}
