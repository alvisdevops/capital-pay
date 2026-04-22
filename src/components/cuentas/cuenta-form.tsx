"use client";

import { useMemo, useState } from "react";
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
import { Trash2, Plus } from "lucide-react";
import { guardarBorrador, enviarCuenta } from "@/actions/cuentas";
import { formatCurrency } from "@/lib/utils";
import { type CategoriaKey } from "@/lib/constants";

interface Sede {
  id: string;
  nombre: string;
}

interface TarifaDisponible {
  categoria: CategoriaKey;
  valorHora: number;
}

interface ItemInput {
  fecha: string;
  horas: string;
  categoria: CategoriaKey | "";
}

interface CuentaFormProps {
  sedes: Sede[];
  tarifas: TarifaDisponible[];
  defaultValues?: {
    id: string;
    sedeId: string;
    descripcion: string | null;
    items: Array<{ fecha: string; horas: number; categoria: CategoriaKey }>;
  };
}

function emptyRow(): ItemInput {
  return { fecha: new Date().toISOString().split("T")[0], horas: "1", categoria: "" };
}

export function CuentaForm({ sedes, tarifas, defaultValues }: CuentaFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sedeId, setSedeId] = useState<string>(defaultValues?.sedeId || "");
  const [descripcion, setDescripcion] = useState<string>(defaultValues?.descripcion || "");
  const [items, setItems] = useState<ItemInput[]>(
    defaultValues?.items.length
      ? defaultValues.items.map((i) => ({
          fecha: i.fecha,
          horas: String(i.horas),
          categoria: i.categoria,
        }))
      : [emptyRow()],
  );
  const isEditing = !!defaultValues;
  const today = new Date().toISOString().split("T")[0];

  const tarifaMap = useMemo(
    () => new Map(tarifas.map((t) => [t.categoria, t.valorHora])),
    [tarifas],
  );

  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const horas = Number(it.horas);
      const valor = it.categoria ? tarifaMap.get(it.categoria) ?? 0 : 0;
      return sum + (Number.isFinite(horas) ? horas : 0) * valor;
    }, 0);
  }, [items, tarifaMap]);

  function updateItem(idx: number, patch: Partial<ItemInput>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function addRow() {
    setItems((prev) => [...prev, emptyRow()]);
  }

  function removeRow(idx: number) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  function buildPayload() {
    return {
      sedeId,
      descripcion: descripcion || undefined,
      items: items
        .filter((it) => it.categoria && it.fecha && it.horas)
        .map((it) => ({
          fecha: it.fecha,
          horas: Number(it.horas),
          categoria: it.categoria as CategoriaKey,
        })),
    };
  }

  async function handleGuardar() {
    setError("");
    if (!sedeId) {
      setError("Selecciona una sede");
      return;
    }
    setLoading(true);
    const payload = buildPayload();
    const result = await guardarBorrador(payload, defaultValues?.id);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/instructor/cuentas");
    router.refresh();
  }

  async function handleEnviar() {
    setError("");
    if (!sedeId) {
      setError("Selecciona una sede");
      return;
    }
    const payload = buildPayload();
    if (payload.items.length === 0) {
      setError("Agrega al menos una fila con fecha, horas y categoría");
      return;
    }
    setLoading(true);
    const saved = await guardarBorrador(payload, defaultValues?.id);
    if (saved.error || !saved.cuentaId) {
      setError(saved.error || "Error al guardar");
      setLoading(false);
      return;
    }
    const sent = await enviarCuenta(saved.cuentaId);
    if (sent.error) {
      setError(sent.error);
      setLoading(false);
      return;
    }
    router.push(`/instructor/cuentas/${saved.cuentaId}`);
    router.refresh();
  }

  if (tarifas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-muted-foreground">
            Aún no tienes tarifas asignadas. Pídele al administrador que te asigne el
            valor por hora de al menos una categoría antes de crear una cuenta.
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar Borrador" : "Nueva Cuenta de Cobro"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sedeId">Sede</Label>
            <Select value={sedeId} onValueChange={(v) => setSedeId(v ?? "")}>
              <SelectTrigger id="sedeId">
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
            <Label htmlFor="descripcion">Notas (opcional)</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Notas internas"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Clases dictadas</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar fila
              </Button>
            </div>

            <div className="rounded-md border">
              <div className="hidden md:grid grid-cols-[1.5fr_0.8fr_1.5fr_1fr_auto] gap-2 p-3 bg-muted/40 text-xs font-medium text-muted-foreground">
                <div>Fecha</div>
                <div>Horas</div>
                <div>Categoría</div>
                <div className="text-right">Subtotal</div>
                <div></div>
              </div>
              {items.map((item, idx) => {
                const horas = Number(item.horas) || 0;
                const valorHora = item.categoria ? tarifaMap.get(item.categoria) ?? 0 : 0;
                const subtotal = horas * valorHora;
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-[1.5fr_0.8fr_1.5fr_1fr_auto] gap-2 p-3 border-t items-center"
                  >
                    <div>
                      <Label className="md:hidden text-xs mb-1">Fecha</Label>
                      <Input
                        type="date"
                        max={today}
                        value={item.fecha}
                        onChange={(e) => updateItem(idx, { fecha: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="md:hidden text-xs mb-1">Horas</Label>
                      <Input
                        type="number"
                        min={1}
                        max={24}
                        step={1}
                        value={item.horas}
                        onChange={(e) => updateItem(idx, { horas: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="md:hidden text-xs mb-1">Categoría</Label>
                      <Select
                        value={item.categoria || ""}
                        onValueChange={(v) =>
                          updateItem(idx, { categoria: (v as CategoriaKey | null) ?? "" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {tarifas.map((t) => (
                            <SelectItem key={t.categoria} value={t.categoria}>
                              {t.categoria} — {formatCurrency(t.valorHora)}/h
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="text-right font-medium tabular-nums">
                      {subtotal > 0 ? formatCurrency(subtotal) : "—"}
                    </div>
                    <div className="flex md:justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(idx)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between p-3 border-t bg-muted/20">
                <span className="text-sm font-medium">Total estimado</span>
                <span className="text-lg font-bold text-green-700 tabular-nums">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              El valor hora se congela al momento de enviar la cuenta.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <div className="flex gap-3 sm:ml-auto">
              <Button
                type="button"
                variant="secondary"
                onClick={handleGuardar}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar borrador"}
              </Button>
              <Button type="button" onClick={handleEnviar} disabled={loading}>
                {loading ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
