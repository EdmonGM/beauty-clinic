/*
  Warnings:

  - You are about to drop the column `beforeAfterImages` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the `BlockedSlot` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "beforeAfterImages";

-- DropTable
DROP TABLE "BlockedSlot";
