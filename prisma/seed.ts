import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPass) {
    throw new Error("ADMIN_EMAIL y ADMIN_PASSWORD son requeridos");
  }

  // Crear sedes
  const sedeNorte = await prisma.sede.upsert({
    where: { id: "sede-norte" },
    update: {},
    create: {
      id: "sede-norte",
      nombre: "Sede Norte",
      direccion: "Calle 127 #15-20, Bogotá D.C.",
    },
  });

  const sedeChapinero = await prisma.sede.upsert({
    where: { id: "sede-chapinero" },
    update: {},
    create: {
      id: "sede-chapinero",
      nombre: "Sede Chapinero",
      direccion: "Carrera 13 #52-30, Bogotá D.C.",
    },
  });

  await prisma.sede.upsert({
    where: { id: "sede-kennedy" },
    update: {},
    create: {
      id: "sede-kennedy",
      nombre: "Sede Kennedy",
      direccion: "Avenida 1 de Mayo #38A-15, Bogotá D.C.",
    },
  });

  await prisma.sede.upsert({
    where: { id: "sede-suba" },
    update: {},
    create: {
      id: "sede-suba",
      nombre: "Sede Suba",
      direccion: "Calle 145 #91-50, Bogotá D.C.",
    },
  });

  // Crear admin
  const adminPassword = await hash(adminPass, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: adminPassword },
    create: {
      email: adminEmail,
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

  console.log("Seed completado exitosamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
