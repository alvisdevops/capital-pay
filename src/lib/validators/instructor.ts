import { z } from "zod";

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
});

export const createInstructorSchema = instructorSchema.extend({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type InstructorInput = z.infer<typeof instructorSchema>;
export type CreateInstructorInput = z.infer<typeof createInstructorSchema>;
