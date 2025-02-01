/*
  Warnings:

  - You are about to drop the column `user_id` on the `assets` table. All the data in the column will be lost.
  - The primary key for the `savings_account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `savings_account` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `portfolio_id` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `portfolio_id` to the `savings_account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `portfolio_id` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_user_id_fkey";

-- DropForeignKey
ALTER TABLE "savings_account" DROP CONSTRAINT "savings_account_user_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_user_id_fkey";

-- AlterTable
ALTER TABLE "assets" DROP COLUMN "user_id",
ADD COLUMN     "portfolio_id" BIGINT NOT NULL,
ALTER COLUMN "symbol" SET DATA TYPE TEXT,
ALTER COLUMN "type" SET DATA TYPE TEXT,
ALTER COLUMN "total_invested" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "realized_profit" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "savings_account" DROP CONSTRAINT "savings_account_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "portfolio_id" BIGINT NOT NULL,
ALTER COLUMN "total" SET DATA TYPE DECIMAL(65,30),
ADD CONSTRAINT "savings_account_pkey" PRIMARY KEY ("portfolio_id");

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "user_id",
ADD COLUMN     "portfolio_id" BIGINT NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "type" SET DATA TYPE TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "password" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "portfolio" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "name" TEXT,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_user_id_key" ON "portfolio"("user_id");

-- AddForeignKey
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_account" ADD CONSTRAINT "savings_account_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
