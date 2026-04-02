import { requireRole } from "@/lib/auth-guard";
import { InstructorLayoutClient } from "./layout-client";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("INSTRUCTOR");

  return (
    <InstructorLayoutClient
      userName={`${session.user.nombre} ${session.user.apellido}`}
    >
      {children}
    </InstructorLayoutClient>
  );
}
