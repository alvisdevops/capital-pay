import { requireRole } from "@/lib/auth-guard";
import { PageHeader } from "@/components/shared/page-header";
import { ReportContent } from "./report-content";

export default async function ReportesPage() {
  await requireRole("ADMIN");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Resumen de cuentas de cobro por estado e instructor"
      />
      <ReportContent />
    </div>
  );
}
