-- CreateTable
CREATE TABLE "Syndic" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Syndic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Syndic_username_key" ON "Syndic"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Syndic_email_key" ON "Syndic"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Syndic_phoneNumber_key" ON "Syndic"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Syndic_cpf_key" ON "Syndic"("cpf");

-- AddForeignKey
ALTER TABLE "Syndic" ADD CONSTRAINT "Syndic_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
