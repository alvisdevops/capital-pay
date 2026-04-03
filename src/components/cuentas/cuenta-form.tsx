"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crearCuenta, actualizarCuenta } from "@/actions/cuentas";

interface Sede {
  id: string;
  nombre: string;
}

interface CuentaFormProps {
  sedes: Sede[];
  defaultValues?: {
    id: string;
    sedeId: string;
    concepto: string;
    descripcion: string | null;
    valor: string;
    periodoInicio: string;
    periodoFin: string;
  };
}

export function CuentaForm({ sedes, defaultValues }: CuentaFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!defaultValues;
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      sedeId: formData.get("sedeId") as string,
      concepto: formData.get("concepto") as string,
      descripcion: (formData.get("descripcion") as string) || undefined,
      valor: parseFloat(formData.get("valor") as string),
      periodoInicio: formData.get("periodoInicio") as string,
      periodoFin: formData.get("periodoFin") as string,
    };

    const result = isEditing
      ? await actualizarCuenta(defaultValues.id, data)
      : await crearCuenta(data);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/instructor/cuentas");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar Cuenta de Cobro" : "Nueva Cuenta de Cobro"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sedeId">Sede</Label>
            <Select name="sedeId" defaultValue={defaultValues?.sedeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una sede" />
              </SelectTrigger>
              <SelectContent>
                {sedes.map((sede) => (
                  <SelectItem key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="concepto">Concepto</Label>
            <Input
              id="concepto"
              name="concepto"
              placeholder="Ej: Clases de conducción - Categoría B1"
              defaultValue={defaultValues?.concepto}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              placeholder="Detalle adicional del servicio prestado"
              defaultValue={defaultValues?.descripcion || ""}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor (COP)</Label>
            <Input
              id="valor"
              name="valor"
              type="number"
              min="1"
              step="1"
              placeholder="0"
              defaultValue={defaultValues?.valor}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="periodoInicio">Periodo inicio</Label>
              <Input
                id="periodoInicio"
                name="periodoInicio"
                type="date"
                max={today}
                defaultValue={defaultValues?.periodoInicio}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodoFin">Periodo fin</Label>
              <Input
                id="periodoFin"
                name="periodoFin"
                type="date"
                max={today}
                defaultValue={defaultValues?.periodoFin}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Guardando..."
                : isEditing
                  ? "Actualizar"
                  : "Crear Cuenta de Cobro"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
