import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { InstructorLayoutClient } from "./layout-client";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("INSTRUCTOR");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { foto: true },
  });

  return (
    <InstructorLayoutClient
      userName={`${session.user.nombre} ${session.user.apellido}`}
      userPhoto={user?.foto || null}
    >
      {children}
    </InstructorLayoutClient>
  );
}
