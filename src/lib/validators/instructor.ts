import { z } from "zod";

const tarifaValor = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) && n > 0 ? n : null;
  })
  .pipe(z.number().positive().nullable());

export const tarifasSchema = z.object({
  A2: tarifaValor.optional().nullable(),
  B1: tarifaValor.optional().nullable(),
  C1: tarifaValor.optional().nullable(),
  C2: tarifaValor.optional().nullable(),
});

export const instructorSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").optional(),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  cedula: z.string().min(5, "La cédula debe tener al menos 5 caracteres"),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  ciudadExpedicion: z.string().optional(),
  banco: z.string().optional(),
  tipoCuenta: z.enum(["AHORROS", "CORRIENTE"]).optional().nullable(),
  numeroCuenta: z.string().optional(),
  sedeId: z.string().min(1, "La sede es requerida"),
  tarifas: tarifasSchema.optional(),
});

export const createInstructorSchema = instructorSchema.extend({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type InstructorInput = z.infer<typeof instructorSchema>;
export type CreateInstructorInput = z.infer<typeof createInstructorSchema>;
export type TarifasInput = z.infer<typeof tarifasSchema>;
