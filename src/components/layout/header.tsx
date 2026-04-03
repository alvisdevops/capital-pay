"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LogoIcon } from "@/components/shared/logo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface HeaderProps {
  items: NavItem[];
  userName: string;
}

export function Header({ items, userName }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 md:hidden">
      <div className="flex items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center border-b px-6">
              <div className="flex items-center gap-2">
                <LogoIcon size="sm" />
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-bold" style={{ color: "#E5A800" }}>Capital</span>
                  <span className="text-lg font-extrabold" style={{ color: "#C41E1E" }}>Pay</span>
                </div>
              </div>
            </div>
            <nav className="space-y-1 px-3 py-4">
              {items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 border-t p-4">
              <p className="mb-2 px-3 text-sm font-medium">{userName}</p>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesión
              </button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="ml-3 flex items-baseline gap-0.5">
          <span className="text-lg font-bold" style={{ color: "#E5A800" }}>Capital</span>
          <span className="text-lg font-extrabold" style={{ color: "#C41E1E" }}>Pay</span>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
