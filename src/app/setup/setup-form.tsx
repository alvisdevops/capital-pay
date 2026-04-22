"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { completarSetup } from "@/actions/setup";
import { BANCOS_COLOMBIA } from "@/lib/constants";

interface SetupFormProps {
  userName: string;
}

export function SetupForm({ userName }: SetupFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await completarSetup({
      passwordNueva: formData.get("passwordNueva") as string,
      confirmarPassword: formData.get("confirmarPassword") as string,
      banco: formData.get("banco") as string,
      tipoCuenta: formData.get("tipoCuenta") as string,
      numeroCuenta: formData.get("numeroCuenta") as string,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/instructor/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Bienvenido, {userName}</CardTitle>
        <CardDescription>
          Antes de continuar, configura tu contraseña y datos bancarios para recibir pagos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="passwordNueva">Nueva contraseña</Label>
            <Input id="passwordNueva" name="passwordNueva" type="password" minLength={8} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarPassword">Confirmar contraseña</Label>
            <Input id="confirmarPassword" name="confirmarPassword" type="password" minLength={8} required />
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-medium">Datos bancarios para pago</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="banco">Banco</Label>
                <Select name="banco" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANCOS_COLOMBIA.map((banco) => (
                      <SelectItem key={banco} value={banco}>{banco}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoCuenta">Tipo de cuenta</Label>
                <Select name="tipoCuenta" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AHORROS">Ahorros</SelectItem>
                    <SelectItem value="CORRIENTE">Corriente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroCuenta">Numero de cuenta</Label>
                <Input id="numeroCuenta" name="numeroCuenta" required />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Guardando..." : "Completar configuracion"}
          </Button>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
