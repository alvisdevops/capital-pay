import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CapitalPay - Capital Cars",
  description: "Sistema de gestión de cuentas de cobro - Capital Cars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-background">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
