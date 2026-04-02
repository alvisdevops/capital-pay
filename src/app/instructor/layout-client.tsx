"use client";

import { Sidebar, instructorNavItems } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface InstructorLayoutClientProps {
  children: React.ReactNode;
  userName: string;
}

export function InstructorLayoutClient({ children, userName }: InstructorLayoutClientProps) {
  return (
    <div className="min-h-screen">
      <Sidebar items={instructorNavItems} userName={userName} userRole="Instructor" />
      <Header items={instructorNavItems} userName={userName} />
      <main className="md:pl-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
