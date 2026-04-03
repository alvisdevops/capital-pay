"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { cambiarPassword } from "@/actions/settings";

interface SettingsFormProps {
  userName: string;
  currentPhoto: string | null;
}

export function SettingsForm({ userName, currentPhoto }: SettingsFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentPhoto);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passError, setPassError] = useState("");

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadMsg("La imagen no puede pesar más de 2MB");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploadLoading(true);
    setUploadMsg("");

    const formData = new FormData();
    formData.append("foto", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.error) {
      setUploadMsg(data.error);
      setPreview(currentPhoto);
    } else {
      setUploadMsg("Foto actualizada");
    }

    setUploadLoading(false);
    router.refresh();
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPassError("");
    setPassMsg("");
    setPassLoading(true);

    const formData = new FormData(e.currentTarget);
    const passwordNueva = formData.get("passwordNueva") as string;
    const confirmarPassword = formData.get("confirmarPassword") as string;

    if (passwordNueva !== confirmarPassword) {
      setPassError("Las contraseñas no coinciden");
      setPassLoading(false);
      return;
    }

    const result = await cambiarPassword({
      passwordActual: formData.get("passwordActual") as string,
      passwordNueva,
    });

    if (result.error) {
      setPassError(result.error);
    } else {
      setPassMsg("Contraseña actualizada");
      e.currentTarget.reset();
    }

    setPassLoading(false);
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Foto */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Foto de perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <button
              onClick={() => inputRef.current?.click()}
              className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center group"
              disabled={uploadLoading}
            >
              {preview ? (
                <img src={preview} alt={userName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-semibold text-muted-foreground">{initials}</span>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </button>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={uploadLoading}
              >
                {uploadLoading ? "Subiendo..." : "Cambiar foto"}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG o WebP. Máximo 2MB.</p>
              {uploadMsg && (
                <p className="mt-1 text-xs text-green-600">{uploadMsg}</p>
              )}
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Contraseña */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cambiar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePassword} className="space-y-4">
            {passError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{passError}</div>
            )}
            {passMsg && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">{passMsg}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="passwordActual">Contraseña actual</Label>
              <Input
                id="passwordActual"
                name="passwordActual"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordNueva">Nueva contraseña</Label>
              <Input
                id="passwordNueva"
                name="passwordNueva"
                type="password"
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarPassword">Confirmar nueva contraseña</Label>
              <Input
                id="confirmarPassword"
                name="confirmarPassword"
                type="password"
                minLength={8}
                required
              />
            </div>
            <Button type="submit" disabled={passLoading}>
              {passLoading ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
