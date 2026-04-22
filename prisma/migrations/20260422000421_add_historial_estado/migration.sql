-- CreateTable
CREATE TABLE "historial_estados" (
    "id" TEXT NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "estadoAnterior" "EstadoCuenta" NOT NULL,
    "estadoNuevo" "EstadoCuenta" NOT NULL,
    "observacion" TEXT,
    "cambiadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historial_estados_cuentaId_idx" ON "historial_estados"("cuentaId");

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "cuentas_cobro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_cambiadoPorId_fkey" FOREIGN KEY ("cambiadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
