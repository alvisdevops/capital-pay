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
      items: { orderBy: { fecha: "asc" } },
    },
  });

  if (!cuenta) {
    return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
  }

  if (session.user.role !== "ADMIN" && cuenta.instructorId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (cuenta.estado === "BORRADOR") {
    return NextResponse.json(
      { error: "El borrador no puede generar PDF" },
      { status: 400 },
    );
  }

  const pdfBuffer = generateCuentaCobroPDF({
    numero: cuenta.numero,
    valor: Number(cuenta.valor),
    periodoInicio: cuenta.periodoInicio,
    periodoFin: cuenta.periodoFin,
    createdAt: cuenta.createdAt,
    items: cuenta.items.map((i) => ({
      fecha: i.fecha,
      horas: i.horas,
      categoria: i.categoria,
      valorHora: Number(i.valorHora),
      subtotal: Number(i.subtotal),
    })),
    instructor: {
      nombre: cuenta.instructor.nombre,
      apellido: cuenta.instructor.apellido,
      cedula: cuenta.instructor.cedula,
      email: cuenta.instructor.email,
      ciudadExpedicion: cuenta.instructor.ciudadExpedicion,
      telefono: cuenta.instructor.telefono,
      direccion: cuenta.instructor.direccion,
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
