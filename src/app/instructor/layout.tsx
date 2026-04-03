import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InstructorLayoutClient } from "./layout-client";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("INSTRUCTOR");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { foto: true, setupCompleto: true },
  });

  if (!user?.setupCompleto) {
    redirect("/setup");
  }

  return (
    <InstructorLayoutClient
      userName={`${session.user.nombre} ${session.user.apellido}`}
      userPhoto={user?.foto || null}
    >
      {children}
    </InstructorLayoutClient>
  );
}
