import { z } from "zod";

export const cuentaItemSchema = z.object({
  fecha: z.string().min(1, "La fecha es requerida"),
  horas: z.number().int().min(1, "Mínimo 1 hora").max(24, "Máximo 24 horas por día"),
  categoria: z.enum(["A2", "B1", "C1", "C2"]),
});

export const cuentaBorradorSchema = z.object({
  sedeId: z.string().min(1, "La sede es requerida"),
  descripcion: z.string().optional(),
  items: z.array(cuentaItemSchema),
}).refine(
  (data) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return data.items.every((i) => new Date(i.fecha) <= today);
  },
  { message: "Las fechas no pueden ser posteriores al día de hoy", path: ["items"] },
);

export const enviarCuentaSchema = z.object({
  cuentaId: z.string().min(1),
});

export type CuentaItemInput = z.infer<typeof cuentaItemSchema>;
export type CuentaBorradorInput = z.infer<typeof cuentaBorradorSchema>;

export const cambiarEstadoSchema = z.object({
  cuentaId: z.string().min(1),
  nuevoEstado: z.enum(["PENDIENTE", "APROBADA", "RECHAZADA", "PAGADA"]),
  observaciones: z.string().optional(),
});

export type CambiarEstadoInput = z.infer<typeof cambiarEstadoSchema>;
