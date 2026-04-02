export const EMPRESA = {
  nombre: "Capital Cars S.A.S",
  nit: "901.XXX.XXX-X",
  direccion: "Bogotá D.C., Colombia",
  telefono: "(601) XXX XXXX",
  ciudad: "Bogotá D.C.",
} as const;

export const ESTADOS_CUENTA = {
  PENDIENTE: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  APROBADA: { label: "Aprobada", color: "bg-blue-100 text-blue-800" },
  RECHAZADA: { label: "Rechazada", color: "bg-red-100 text-red-800" },
  PAGADA: { label: "Pagada", color: "bg-green-100 text-green-800" },
} as const;

export const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  PENDIENTE: ["APROBADA", "RECHAZADA"],
  APROBADA: ["PAGADA", "RECHAZADA"],
  RECHAZADA: ["PENDIENTE"],
  PAGADA: [],
};

export const BANCOS_COLOMBIA = [
  "Bancolombia",
  "Banco de Bogotá",
  "Davivienda",
  "BBVA Colombia",
  "Banco de Occidente",
  "Banco Popular",
  "Banco AV Villas",
  "Scotiabank Colpatria",
  "Banco Caja Social",
  "Nequi",
  "Daviplata",
] as const;
