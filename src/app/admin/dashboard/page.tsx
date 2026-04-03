import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/utils";
import { FileText, Clock, CheckCircle, DollarSign, Users, CircleX } from "lucide-react";
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
    { label: "Total Cuentas", sub: "cuentas", value: totalCuentas, icon: FileText, iconColor: "#1E88E5", iconBg: "#1E3A5F20", barColor: "#1E88E5", href: "/admin/cuentas" },
    { label: "Pendientes", sub: "pendientes", value: pendientes, icon: Clock, iconColor: "#FF9800", iconBg: "#5F3A1E20", barColor: "#FF9800", href: "/admin/cuentas?estado=PENDIENTE" },
    { label: "Aprobadas", sub: "aprobadas", value: aprobadas, icon: CheckCircle, iconColor: "#43A047", iconBg: "#1E5F2A20", barColor: "#43A047", href: "/admin/cuentas?estado=APROBADA" },
    { label: "Rechazadas", sub: "rechazadas", value: rechazadas, icon: CircleX, iconColor: "#E53935", iconBg: "#5F1E1E20", barColor: "#E53935", href: "/admin/cuentas?estado=RECHAZADA" },
    {
      label: "Total Pagado", sub: "pagados", value: formatCurrency(Number(totalPagado._sum.valor || 0)),
      icon: DollarSign, iconColor: "#7C4DFF", iconBg: "#3A1E5F20", barColor: "#7C4DFF", href: "/admin/cuentas?estado=PAGADA",
    },
    { label: "Instructores", sub: "activos", value: totalInstructores, icon: Users, iconColor: "#00BCD4", iconBg: "#1E4F5F20", barColor: "#00BCD4", href: "/admin/instructores" },
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
            <div className="rounded-xl border bg-card p-5 hover:border-primary/50 transition-colors cursor-pointer flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-muted-foreground">{stat.label}</span>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: stat.iconBg }}
                >
                  <stat.icon className="h-[18px] w-[18px]" style={{ color: stat.iconColor }} />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </div>
              <div
                className="h-[3px] w-full rounded-sm"
                style={{ backgroundColor: stat.barColor, opacity: 0.3 }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
