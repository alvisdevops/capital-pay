import { jsPDF } from "jspdf";
import { numberToSpanishWords } from "./number-to-words";
import { EMPRESA } from "@/lib/constants";
import { categoriasToTexto } from "@/lib/utils";

interface CuentaItemData {
  fecha: Date;
  horas: number;
  categoria: string;
  valorHora: number;
  subtotal: number;
}

interface CuentaData {
  numero: number;
  valor: number;
  periodoInicio: Date;
  periodoFin: Date;
  createdAt: Date;
  items: CuentaItemData[];
  instructor: {
    nombre: string;
    apellido: string;
    cedula: string;
    email: string;
    ciudadExpedicion: string | null;
    telefono: string | null;
    direccion: string | null;
  };
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatDatePDF(date: Date): string {
  const d = new Date(date);
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

function formatDiaMes(date: Date): string {
  const d = new Date(date);
  return `${d.getDate()} de ${MESES[d.getMonth()]}`;
}

function formatCurrencyPDF(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function generateCuentaCobroPDF(cuenta: CuentaData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  const contentWidth = pageWidth - margin * 2;
  const center = pageWidth / 2;
  let y = 25;

  // Header empresa
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(EMPRESA.razonSocial, center, y, { align: "center" });
  y += 5;
  doc.text(`NIT. ${EMPRESA.nit}`, center, y, { align: "center" });
  y += 10;

  // Consecutivo (pequeño, a la derecha — para control interno)
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Consecutivo: ${String(cuenta.numero).padStart(5, "0")}`,
    pageWidth - margin,
    y,
    { align: "right" },
  );
  y += 10;

  // DEBE A:
  const nombreCompleto = `${cuenta.instructor.nombre} ${cuenta.instructor.apellido}`;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DEBE A:", center, y, { align: "center" });
  y += 7;

  doc.setFontSize(11);
  doc.text(nombreCompleto.toUpperCase(), center, y, { align: "center" });
  y += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`C.C ${cuenta.instructor.cedula}`, center, y, { align: "center" });
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("CORREO:", center - 18, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(cuenta.instructor.email, center - 15, y, { align: "left" });
  y += 5;

  const telefono = cuenta.instructor.telefono || "—";
  const direccion = cuenta.instructor.direccion || "—";
  doc.setFont("helvetica", "bold");
  doc.text(`TELEFONO:`, margin + 10, y);
  doc.setFont("helvetica", "normal");
  doc.text(telefono, margin + 32, y);
  doc.setFont("helvetica", "bold");
  doc.text(`DIRECCIÓN:`, margin + 80, y);
  doc.setFont("helvetica", "normal");
  doc.text(direccion, margin + 105, y);
  y += 5;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text("(No Responsable del IVA-Régimen Simplificado)", center, y, { align: "center" });
  y += 12;

  // Cuerpo: LA SUMA DE:
  const categorias = Array.from(new Set(cuenta.items.map((i) => i.categoria))).sort();
  const categoriasTexto = categoriasToTexto(categorias);
  const valorEnLetras = numberToSpanishWords(cuenta.valor).replace(/ PESOS M\/CTE$/, "");
  const periodoTexto = `${formatDiaMes(cuenta.periodoInicio)} al ${formatDatePDF(cuenta.periodoFin)}`;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const prefijo = "LA SUMA DE: ";
  const sumaBold = `${valorEnLetras} PESOS m/cte. ${formatCurrencyPDF(cuenta.valor)} MCTE.`;
  const resto = `, por concepto de: servicios prestados como instructor en técnicas de conducción ${categoriasTexto} desde el: ${periodoTexto}.`;

  const fullText = prefijo + sumaBold + resto;
  const lines = doc.splitTextToSize(fullText, contentWidth);
  doc.text(lines, margin, y, { align: "justify", maxWidth: contentWidth });
  y += lines.length * 5 + 8;

  // TOTAL HORAS + VALOR HORA
  const totalHoras = cuenta.items.reduce((s, i) => s + i.horas, 0);
  const tarifasUnicas = Array.from(new Set(cuenta.items.map((i) => i.valorHora)));

  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL, HORAS DICTADAS: ${totalHoras}`, margin, y);
  y += 6;

  if (tarifasUnicas.length === 1) {
    doc.text(`VALOR HORA: ${formatCurrencyPDF(tarifasUnicas[0])}`, margin, y);
    y += 10;
  } else {
    doc.text("VALOR HORA POR CATEGORÍA:", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const porCategoria = new Map<string, number>();
    for (const it of cuenta.items) porCategoria.set(it.categoria, it.valorHora);
    for (const [cat, val] of Array.from(porCategoria.entries()).sort()) {
      doc.text(`  • ${cat}: ${formatCurrencyPDF(val)}/h`, margin + 4, y);
      y += 5;
    }
    y += 4;
  }

  // Detalle (tabla de items)
  if (cuenta.items.length > 0) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Detalle de clases dictadas:", margin, y);
    y += 5;

    const colX = [margin, margin + 45, margin + 80, margin + 110, margin + 145];
    const headers = ["Fecha", "Categoría", "Horas", "Valor hora", "Subtotal"];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    headers.forEach((h, i) => doc.text(h, colX[i], y));
    y += 2;
    doc.line(margin, y, margin + contentWidth, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    for (const it of cuenta.items) {
      if (y > 250) {
        doc.addPage();
        y = 25;
      }
      const f = new Date(it.fecha);
      const fechaStr = `${String(f.getDate()).padStart(2, "0")}/${String(f.getMonth() + 1).padStart(2, "0")}/${f.getFullYear()}`;
      doc.text(fechaStr, colX[0], y);
      doc.text(it.categoria, colX[1], y);
      doc.text(String(it.horas), colX[2], y);
      doc.text(formatCurrencyPDF(it.valorHora), colX[3], y);
      doc.text(formatCurrencyPDF(it.subtotal), colX[4], y);
      y += 5;
    }
    y += 6;
  }

  // Firma
  if (y > 220) {
    doc.addPage();
    y = 25;
  }
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.line(margin, y, margin + 70, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Firma:", margin, y);
  doc.setFont("helvetica", "normal");
  y += 5;
  doc.text(`CC. ${cuenta.instructor.cedula}`, margin, y);
  y += 8;

  const firmaFecha = new Date(cuenta.createdAt);
  const dia = firmaFecha.getDate();
  const mes = MESES[firmaFecha.getMonth()];
  const anio = firmaFecha.getFullYear();
  const ciudadFirma = EMPRESA.ciudad.replace(/ D\.C\.?/, "");
  doc.text(
    `Se firma en ${ciudadFirma}, a los (${dia}) días del mes de ${mes} de ${anio}.`,
    margin,
    y,
  );
  y += 6;
  const ciudadExp = cuenta.instructor.ciudadExpedicion || "Bogotá DC";
  doc.text(
    `${nombreCompleto} C.C ${cuenta.instructor.cedula} de ${ciudadExp} Colombia`,
    margin,
    y,
  );
  y += 12;

  // Notas legales
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const nota1 =
    "Nota: en virtud de lo contemplado en el artículo 616-2 del ET, quienes no sean responsables de IVA no están obligados a expedir factura de venta por las ventas de bienes o prestación de servicios que realicen.";
  const nota1Lines = doc.splitTextToSize(nota1, contentWidth);
  doc.text(nota1Lines, margin, y);
  y += nota1Lines.length * 4 + 4;

  const nota2 =
    "Declaro bajo la gravedad de juramento que he prestado mis servicios de manera personal y por lo tanto no he contratado ni vinculado dos o más trabajadores asociados a la actividad.";
  const nota2Lines = doc.splitTextToSize(nota2, contentWidth);
  doc.text(nota2Lines, margin, y);

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
