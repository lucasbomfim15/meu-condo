-- CreateEnum
CREATE TYPE "OccurrenceStatusType" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "OccurrenceType" AS ENUM ('SUGGESTION', 'COMPLAINT', 'REQUEST', 'OTHERS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "apartmentId" TEXT;

-- CreateTable
CREATE TABLE "occurrences" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "OccurrenceType" NOT NULL,
    "status" "OccurrenceStatusType" NOT NULL DEFAULT 'OPEN',
    "userId" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "occurrences_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
