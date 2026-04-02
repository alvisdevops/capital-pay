import { jsPDF } from "jspdf";
import { numberToSpanishWords } from "./number-to-words";
import { EMPRESA } from "@/lib/constants";

interface CuentaData {
  numero: number;
  concepto: string;
  descripcion: string | null;
  valor: number;
  periodoInicio: Date;
  periodoFin: Date;
  createdAt: Date;
  instructor: {
    nombre: string;
    apellido: string;
    cedula: string;
    ciudadExpedicion: string | null;
    telefono: string | null;
    direccion: string | null;
    banco: string | null;
    tipoCuenta: string | null;
    numeroCuenta: string | null;
  };
  sede: {
    nombre: string;
    direccion: string;
  };
}

function formatDatePDF(date: Date): string {
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const d = new Date(date);
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
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
  let y = 30;

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CUENTA DE COBRO", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(12);
  doc.text(`No. ${String(cuenta.numero).padStart(5, "0")}`, pageWidth / 2, y, { align: "center" });
  y += 15;

  // City and date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${EMPRESA.ciudad}, ${formatDatePDF(cuenta.createdAt)}`, pageWidth - margin, y, { align: "right" });
  y += 15;

  // Addressee
  doc.setFont("helvetica", "bold");
  doc.text("Senores:", margin, y);
  y += 6;
  doc.text(EMPRESA.nombre, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`NIT: ${EMPRESA.nit}`, margin, y);
  y += 6;
  doc.text(`${EMPRESA.direccion}`, margin, y);
  y += 12;

  // Body
  const nombreCompleto = `${cuenta.instructor.nombre} ${cuenta.instructor.apellido}`;
  const ciudadExp = cuenta.instructor.ciudadExpedicion || "Bogota";
  const valorEnLetras = numberToSpanishWords(cuenta.valor);
  const periodoTexto = `${formatDatePDF(cuenta.periodoInicio)} al ${formatDatePDF(cuenta.periodoFin)}`;

  const bodyText =
    `Yo, ${nombreCompleto}, identificado(a) con cedula de ciudadania No. ${cuenta.instructor.cedula} ` +
    `expedida en ${ciudadExp}, presento la siguiente cuenta de cobro por concepto de: ` +
    `${cuenta.concepto}, correspondiente al periodo del ${periodoTexto}, ` +
    `por un valor de ${valorEnLetras} (${formatCurrencyPDF(cuenta.valor)}).`;

  doc.setFontSize(10);
  const bodyLines = doc.splitTextToSize(bodyText, contentWidth);
  doc.text(bodyLines, margin, y);
  y += bodyLines.length * 5 + 5;

  if (cuenta.descripcion) {
    y += 3;
    doc.setFont("helvetica", "bold");
    doc.text("Detalle:", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(cuenta.descripcion, contentWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 5 + 5;
  }

  // Banking info
  if (cuenta.instructor.banco) {
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Datos para el pago:", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    const bankInfo = [
      ["Banco:", cuenta.instructor.banco],
      ["Tipo de cuenta:", cuenta.instructor.tipoCuenta === "AHORROS" ? "Ahorros" : "Corriente"],
      ["No. de cuenta:", cuenta.instructor.numeroCuenta || "N/A"],
      ["Titular:", nombreCompleto],
      ["Cedula:", cuenta.instructor.cedula],
    ];

    bankInfo.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, margin + 5, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, margin + 45, y);
      y += 6;
    });
  }

  // Legal declaration
  y += 10;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const legalText =
    "Declaro bajo la gravedad del juramento que no soy responsable del Impuesto sobre las Ventas - IVA, " +
    "que no estoy obligado(a) a facturar de acuerdo con los articulos 616-2 y 771-2 del Estatuto Tributario " +
    "y que los ingresos recibidos por este concepto no superan los topes establecidos por la ley para " +
    "ser responsable del IVA.";
  const legalLines = doc.splitTextToSize(legalText, contentWidth);
  doc.text(legalLines, margin, y);
  y += legalLines.length * 4 + 20;

  // Signature
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const sigX = margin;
  doc.line(sigX, y, sigX + 70, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text(nombreCompleto, sigX, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text(`C.C. ${cuenta.instructor.cedula}`, sigX, y);
  y += 5;
  if (cuenta.instructor.telefono) {
    doc.text(`Tel: ${cuenta.instructor.telefono}`, sigX, y);
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
