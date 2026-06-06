-- CreateEnum
CREATE TYPE "ReceiptPaymentStatus" AS ENUM ('PAY_AT_PICKUP', 'PAID', 'AUTHORIZED');

-- CreateTable
CREATE TABLE "CheckoutReceipt" (
    "id" TEXT NOT NULL,
    "confirmationNumber" TEXT NOT NULL,
    "customerFirstName" TEXT NOT NULL,
    "customerLastName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "ReceiptPaymentStatus" NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "lineItems" JSONB NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutReceipt_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "BakeryOrder" ADD COLUMN "checkoutReceiptId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutReceipt_confirmationNumber_key" ON "CheckoutReceipt"("confirmationNumber");

-- CreateIndex
CREATE INDEX "CheckoutReceipt_createdAt_idx" ON "CheckoutReceipt"("createdAt");

-- CreateIndex
CREATE INDEX "CheckoutReceipt_customerPhone_idx" ON "CheckoutReceipt"("customerPhone");

-- CreateIndex
CREATE INDEX "BakeryOrder_checkoutReceiptId_idx" ON "BakeryOrder"("checkoutReceiptId");

-- AddForeignKey
ALTER TABLE "BakeryOrder" ADD CONSTRAINT "BakeryOrder_checkoutReceiptId_fkey" FOREIGN KEY ("checkoutReceiptId") REFERENCES "CheckoutReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
