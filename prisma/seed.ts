import { PrismaClient, Role, EstadoCuenta, TipoCuenta } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Crear sedes
  const sedeNorte = await prisma.sede.create({
    data: {
      nombre: "Sede Norte",
      direccion: "Calle 127 #15-20, Bogotá D.C.",
    },
  });

  const sedeChapinero = await prisma.sede.create({
    data: {
      nombre: "Sede Chapinero",
      direccion: "Carrera 13 #52-30, Bogotá D.C.",
    },
  });

  const sedeKennedy = await prisma.sede.create({
    data: {
      nombre: "Sede Kennedy",
      direccion: "Avenida 1 de Mayo #38A-15, Bogotá D.C.",
    },
  });

  const sedeSuba = await prisma.sede.create({
    data: {
      nombre: "Sede Suba",
      direccion: "Calle 145 #91-50, Bogotá D.C.",
    },
  });

  // Crear admin
  const adminPassword = await hash("Admin123*", 12);
  await prisma.user.create({
    data: {
      email: "admin@capitalcars.com",
      password: adminPassword,
      nombre: "Administrador",
      apellido: "Capital Cars",
      cedula: "1000000000",
      role: Role.ADMIN,
      telefono: "3001234567",
      direccion: "Bogotá D.C.",
      sedeId: sedeNorte.id,
    },
  });

  // Crear instructores de ejemplo
  const instructorPassword = await hash("Instructor123*", 12);

  const instructor1 = await prisma.user.create({
    data: {
      email: "carlos.martinez@email.com",
      password: instructorPassword,
      nombre: "Carlos",
      apellido: "Martínez",
      cedula: "1023456789",
      telefono: "3109876543",
      direccion: "Calle 80 #45-10, Bogotá D.C.",
      ciudadExpedicion: "Bogotá",
      role: Role.INSTRUCTOR,
      banco: "Bancolombia",
      tipoCuenta: TipoCuenta.AHORROS,
      numeroCuenta: "12345678901",
      sedeId: sedeNorte.id,
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      email: "maria.rodriguez@email.com",
      password: instructorPassword,
      nombre: "María",
      apellido: "Rodríguez",
      cedula: "1098765432",
      telefono: "3201234567",
      direccion: "Carrera 50 #20-15, Bogotá D.C.",
      ciudadExpedicion: "Bogotá",
      role: Role.INSTRUCTOR,
      banco: "Davivienda",
      tipoCuenta: TipoCuenta.CORRIENTE,
      numeroCuenta: "98765432100",
      sedeId: sedeChapinero.id,
    },
  });

  // Crear cuentas de cobro de ejemplo
  await prisma.cuentaCobro.create({
    data: {
      instructorId: instructor1.id,
      sedeId: sedeNorte.id,
      concepto: "Clases de conducción - Categoría B1",
      descripcion: "20 clases prácticas de conducción para vehículo particular",
      valor: 1500000,
      periodoInicio: new Date("2026-03-01"),
      periodoFin: new Date("2026-03-15"),
      estado: EstadoCuenta.PENDIENTE,
    },
  });

  await prisma.cuentaCobro.create({
    data: {
      instructorId: instructor1.id,
      sedeId: sedeNorte.id,
      concepto: "Clases de conducción - Categoría B1",
      descripcion: "18 clases prácticas de conducción para vehículo particular",
      valor: 1350000,
      periodoInicio: new Date("2026-02-15"),
      periodoFin: new Date("2026-02-28"),
      estado: EstadoCuenta.APROBADA,
    },
  });

  await prisma.cuentaCobro.create({
    data: {
      instructorId: instructor2.id,
      sedeId: sedeChapinero.id,
      concepto: "Clases de conducción - Categoría A2",
      descripcion: "15 clases prácticas de conducción para motocicleta",
      valor: 900000,
      periodoInicio: new Date("2026-02-01"),
      periodoFin: new Date("2026-02-15"),
      estado: EstadoCuenta.PAGADA,
      fechaPago: new Date("2026-02-20"),
    },
  });

  console.log("Seed completado exitosamente");
  console.log("Admin: admin@capitalcars.com / Admin123*");
  console.log("Instructor 1: carlos.martinez@email.com / Instructor123*");
  console.log("Instructor 2: maria.rodriguez@email.com / Instructor123*");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
