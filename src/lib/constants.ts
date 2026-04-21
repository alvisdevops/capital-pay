export const EMPRESA = {
  nombre: "Capital Cars",
  razonSocial: "CENTRO DE ENSEÑANZA AUTOMOVILÍSTICA CAPITAL CARS",
  nit: "901580124-0",
  direccion: "Bogotá D.C., Colombia",
  telefono: "(601) XXX XXXX",
  ciudad: "Bogotá D.C.",
} as const;

export const ESTADOS_CUENTA = {
  BORRADOR: { label: "Borrador", color: "bg-gray-100 text-gray-800" },
  PENDIENTE: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  APROBADA: { label: "Aprobada", color: "bg-blue-100 text-blue-800" },
  RECHAZADA: { label: "Rechazada", color: "bg-red-100 text-red-800" },
  PAGADA: { label: "Pagada", color: "bg-green-100 text-green-800" },
} as const;

export const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  BORRADOR: ["PENDIENTE"],
  PENDIENTE: ["APROBADA", "RECHAZADA"],
  APROBADA: ["PAGADA", "RECHAZADA"],
  RECHAZADA: ["BORRADOR"],
  PAGADA: [],
};

export const CATEGORIAS = ["A2", "B1", "C1", "C2"] as const;
export type CategoriaKey = (typeof CATEGORIAS)[number];

export const CATEGORIAS_LABELS: Record<CategoriaKey, string> = {
  A2: "A2 - Motocicletas",
  B1: "B1 - Automóviles particulares",
  C1: "C1 - Vehículos de servicio público",
  C2: "C2 - Camiones y buses",
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
