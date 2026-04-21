-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('A2', 'B1', 'C1', 'C2');

-- AlterEnum
ALTER TYPE "EstadoCuenta" ADD VALUE 'BORRADOR';

-- CreateTable
CREATE TABLE "tarifas_instructor" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "valorHora" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarifas_instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuenta_items" (
    "id" TEXT NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "horas" INTEGER NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "valorHora" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuenta_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tarifas_instructor_instructorId_categoria_key" ON "tarifas_instructor"("instructorId", "categoria");

-- CreateIndex
CREATE INDEX "cuenta_items_cuentaId_idx" ON "cuenta_items"("cuentaId");

-- AddForeignKey
ALTER TABLE "tarifas_instructor" ADD CONSTRAINT "tarifas_instructor_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_items" ADD CONSTRAINT "cuenta_items_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "cuentas_cobro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
