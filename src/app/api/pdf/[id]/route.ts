import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCuentaCobroPDF } from "@/lib/pdf/generate-cuenta";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const cuenta = await prisma.cuentaCobro.findUnique({
    where: { id },
    include: {
      instructor: true,
      sede: true,
    },
  });

  if (!cuenta) {
    return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
  }

  // Only owner or admin can access
  if (session.user.role !== "ADMIN" && cuenta.instructorId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const pdfBuffer = generateCuentaCobroPDF({
    numero: cuenta.numero,
    concepto: cuenta.concepto,
    descripcion: cuenta.descripcion,
    valor: Number(cuenta.valor),
    periodoInicio: cuenta.periodoInicio,
    periodoFin: cuenta.periodoFin,
    createdAt: cuenta.createdAt,
    instructor: {
      nombre: cuenta.instructor.nombre,
      apellido: cuenta.instructor.apellido,
      cedula: cuenta.instructor.cedula,
      ciudadExpedicion: cuenta.instructor.ciudadExpedicion,
      telefono: cuenta.instructor.telefono,
      direccion: cuenta.instructor.direccion,
      banco: cuenta.instructor.banco,
      tipoCuenta: cuenta.instructor.tipoCuenta,
      numeroCuenta: cuenta.instructor.numeroCuenta,
    },
    sede: {
      nombre: cuenta.sede.nombre,
      direccion: cuenta.sede.direccion,
    },
  });

  const filename = `cuenta-cobro-${String(cuenta.numero).padStart(5, "0")}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
