/*
  Warnings:

  - You are about to drop the `Syndic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Syndic" DROP CONSTRAINT "Syndic_condominiumId_fkey";

-- DropTable
DROP TABLE "Syndic";
