-- AlterTable
ALTER TABLE "BakeryOrder" ADD COLUMN "itemName" TEXT;
ALTER TABLE "BakeryOrder" ADD COLUMN "unitPrice" DECIMAL(10,2);
ALTER TABLE "BakeryOrder" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH';
ALTER TABLE "BakeryOrder" ADD COLUMN "confirmationNumber" TEXT;

-- CreateIndex
CREATE INDEX "BakeryOrder_confirmationNumber_idx" ON "BakeryOrder"("confirmationNumber");
