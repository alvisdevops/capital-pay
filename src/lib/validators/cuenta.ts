import { z } from "zod";

export const cuentaCobroSchema = z.object({
  sedeId: z.string().min(1, "La sede es requerida"),
  concepto: z.string().min(3, "El concepto debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  valor: z
    .number({ error: "El valor debe ser un número" })
    .positive("El valor debe ser mayor a 0")
    .max(999999999999, "El valor excede el límite permitido"),
  periodoInicio: z.string().min(1, "La fecha de inicio es requerida"),
  periodoFin: z.string().min(1, "La fecha de fin es requerida"),
}).refine(
  (data) => new Date(data.periodoFin) >= new Date(data.periodoInicio),
  {
    message: "La fecha de fin debe ser igual o posterior a la fecha de inicio",
    path: ["periodoFin"],
  }
).refine(
  (data) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return new Date(data.periodoInicio) <= today && new Date(data.periodoFin) <= today;
  },
  {
    message: "Las fechas no pueden ser posteriores al día de hoy",
    path: ["periodoFin"],
  }
);

export type CuentaCobroInput = z.infer<typeof cuentaCobroSchema>;

export const cambiarEstadoSchema = z.object({
  cuentaId: z.string().min(1),
  nuevoEstado: z.enum(["PENDIENTE", "APROBADA", "RECHAZADA", "PAGADA"]),
  observaciones: z.string().optional(),
});

export type CambiarEstadoInput = z.infer<typeof cambiarEstadoSchema>;
