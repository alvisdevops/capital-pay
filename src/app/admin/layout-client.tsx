"use client";

import { Sidebar, adminNavItems } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  userName: string;
}

export function AdminLayoutClient({ children, userName }: AdminLayoutClientProps) {
  return (
    <div className="min-h-screen">
      <Sidebar items={adminNavItems} userName={userName} userRole="Administrador" />
      <Header items={adminNavItems} userName={userName} />
      <main className="md:pl-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
