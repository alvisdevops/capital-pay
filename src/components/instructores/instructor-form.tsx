"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crearInstructor, actualizarInstructor } from "@/actions/instructores";
import { CATEGORIAS, CATEGORIAS_LABELS, type CategoriaKey } from "@/lib/constants";

interface Sede {
  id: string;
  nombre: string;
}

type TarifasMap = Partial<Record<CategoriaKey, number>>;

interface InstructorFormProps {
  sedes: Sede[];
  defaultValues?: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    cedula: string;
    telefono: string | null;
    direccion: string | null;
    ciudadExpedicion: string | null;
    sedeId: string | null;
    tarifas?: TarifasMap;
  };
}

export function InstructorForm({ sedes, defaultValues }: InstructorFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!defaultValues;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const tarifas: TarifasMap = {};
    for (const cat of CATEGORIAS) {
      const raw = (formData.get(`tarifa_${cat}`) as string) || "";
      const n = raw ? Number(raw) : NaN;
      if (Number.isFinite(n) && n > 0) tarifas[cat] = n;
    }

    const data: Record<string, unknown> = {
      email: formData.get("email"),
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      cedula: formData.get("cedula"),
      telefono: (formData.get("telefono") as string) || undefined,
      direccion: (formData.get("direccion") as string) || undefined,
      ciudadExpedicion: (formData.get("ciudadExpedicion") as string) || undefined,
      sedeId: formData.get("sedeId"),
      tarifas,
    };

    const password = formData.get("password") as string;
    if (password) {
      data.password = password;
    }

    const result = isEditing
      ? await actualizarInstructor(defaultValues.id, data)
      : await crearInstructor(data);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/admin/instructores");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Instructor" : "Nuevo Instructor"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" defaultValue={defaultValues?.nombre} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" name="apellido" defaultValue={defaultValues?.apellido} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cedula">Cedula</Label>
              <Input id="cedula" name="cedula" defaultValue={defaultValues?.cedula} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciudadExpedicion">Ciudad expedicion</Label>
              <Input id="ciudadExpedicion" name="ciudadExpedicion" defaultValue={defaultValues?.ciudadExpedicion || ""} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={defaultValues?.email} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {isEditing ? "Nueva contrasena (dejar vacio para no cambiar)" : "Contrasena temporal"}
              </Label>
              <Input id="password" name="password" type="password" required={!isEditing} minLength={8} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telefono">Telefono</Label>
              <Input id="telefono" name="telefono" defaultValue={defaultValues?.telefono || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Direccion</Label>
              <Input id="direccion" name="direccion" defaultValue={defaultValues?.direccion || ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sedeId">Sede</Label>
            <Select name="sedeId" defaultValue={defaultValues?.sedeId || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una sede" />
              </SelectTrigger>
              <SelectContent>
                {sedes.map((sede) => (
                  <SelectItem key={sede.id} value={sede.id}>{sede.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <div className="mb-2">
              <Label>Tarifas por categoría (valor hora)</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Dejar vacío si el instructor no dicta esa categoría.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {CATEGORIAS.map((cat) => (
                <div key={cat} className="space-y-1">
                  <Label htmlFor={`tarifa_${cat}`} className="text-sm">
                    {CATEGORIAS_LABELS[cat]}
                  </Label>
                  <Input
                    id={`tarifa_${cat}`}
                    name={`tarifa_${cat}`}
                    type="number"
                    min={0}
                    step={100}
                    placeholder="0"
                    defaultValue={defaultValues?.tarifas?.[cat] ?? ""}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear Instructor"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
