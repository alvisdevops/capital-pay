import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/utils";
import { FileText, Clock, CheckCircle, DollarSign, Users, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  await requireRole("ADMIN");

  const [
    totalCuentas,
    pendientes,
    aprobadas,
    rechazadas,
    totalPagado,
    totalInstructores,
  ] = await Promise.all([
    prisma.cuentaCobro.count(),
    prisma.cuentaCobro.count({ where: { estado: "PENDIENTE" } }),
    prisma.cuentaCobro.count({ where: { estado: "APROBADA" } }),
    prisma.cuentaCobro.count({ where: { estado: "RECHAZADA" } }),
    prisma.cuentaCobro.aggregate({
      where: { estado: "PAGADA" },
      _sum: { valor: true },
      _count: true,
    }),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
  ]);

  const stats = [
    { label: "Total Cuentas", value: totalCuentas, icon: FileText, color: "text-muted-foreground", href: "/admin/cuentas" },
    { label: "Pendientes", value: pendientes, icon: Clock, color: "text-yellow-600", href: "/admin/cuentas?estado=PENDIENTE" },
    { label: "Aprobadas", value: aprobadas, icon: CheckCircle, color: "text-blue-600", href: "/admin/cuentas?estado=APROBADA" },
    { label: "Rechazadas", value: rechazadas, icon: AlertCircle, color: "text-red-600", href: "/admin/cuentas?estado=RECHAZADA" },
    {
      label: "Total Pagado",
      value: formatCurrency(Number(totalPagado._sum.valor || 0)),
      icon: DollarSign,
      color: "text-green-600",
      href: "/admin/cuentas?estado=PAGADA",
    },
    { label: "Instructores", value: totalInstructores, icon: Users, color: "text-purple-600", href: "/admin/instructores" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de Administración"
        description="Resumen general de Capital Cars"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
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
          </Link>
        ))}
      </div>
    </div>
  );
}
