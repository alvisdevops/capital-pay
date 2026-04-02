import { requireRole } from "@/lib/auth-guard";
import { AdminLayoutClient } from "./layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("ADMIN");

  return (
    <AdminLayoutClient
      userName={`${session.user.nombre} ${session.user.apellido}`}
    >
      {children}
    </AdminLayoutClient>
  );
}
