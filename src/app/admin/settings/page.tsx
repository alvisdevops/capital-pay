import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function AdminSettingsPage() {
  const session = await requireRole("ADMIN");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { foto: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" />
      <SettingsForm
        userName={`${session.user.nombre} ${session.user.apellido}`}
        currentPhoto={user?.foto || null}
      />
    </div>
  );
}
