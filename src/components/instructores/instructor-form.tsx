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

interface Sede {
  id: string;
  nombre: string;
}

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
    const data: Record<string, unknown> = {
      email: formData.get("email"),
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      cedula: formData.get("cedula"),
      telefono: (formData.get("telefono") as string) || undefined,
      direccion: (formData.get("direccion") as string) || undefined,
      ciudadExpedicion: (formData.get("ciudadExpedicion") as string) || undefined,
      sedeId: formData.get("sedeId"),
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
