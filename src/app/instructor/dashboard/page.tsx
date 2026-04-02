import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/utils";
import { FileText, Clock, CheckCircle, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function InstructorDashboard() {
  const session = await requireRole("INSTRUCTOR");

  const [total, pendientes, aprobadas, pagadas] = await Promise.all([
    prisma.cuentaCobro.count({ where: { instructorId: session.user.id } }),
    prisma.cuentaCobro.count({ where: { instructorId: session.user.id, estado: "PENDIENTE" } }),
    prisma.cuentaCobro.count({ where: { instructorId: session.user.id, estado: "APROBADA" } }),
    prisma.cuentaCobro.aggregate({
      where: { instructorId: session.user.id, estado: "PAGADA" },
      _sum: { valor: true },
      _count: true,
    }),
  ]);

  const stats = [
    { label: "Total Cuentas", value: total, icon: FileText, color: "text-muted-foreground" },
    { label: "Pendientes", value: pendientes, icon: Clock, color: "text-yellow-600" },
    { label: "Aprobadas", value: aprobadas, icon: CheckCircle, color: "text-blue-600" },
    {
      label: "Total Pagado",
      value: formatCurrency(Number(pagadas._sum.valor || 0)),
      icon: DollarSign,
      color: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${session.user.nombre}`}
        description="Resumen de tus cuentas de cobro"
        action={
          <Link href="/instructor/cuentas/nueva">
            <Button>Nueva Cuenta de Cobro</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
