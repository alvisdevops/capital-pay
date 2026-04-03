import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminLayoutClient } from "./layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("ADMIN");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { foto: true },
  });

  return (
    <AdminLayoutClient
      userName={`${session.user.nombre} ${session.user.apellido}`}
      userPhoto={user?.foto || null}
    >
      {children}
    </AdminLayoutClient>
  );
}
