import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function categoriasToTexto(categorias: string[]): string {
  const unique = Array.from(new Set(categorias));
  if (unique.length === 0) return "";
  if (unique.length === 1) return unique[0];
  const init = unique.slice(0, -1).join(" ");
  return `${init} Y ${unique[unique.length - 1]}`;
}

export function conceptoDesdeCategorias(categorias: string[]): string {
  const texto = categoriasToTexto(categorias);
  if (!texto) return "Clases de conducción";
  return `Servicios prestados como instructor en técnicas de conducción ${texto}`;
}
