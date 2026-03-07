-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PURCHASER', 'SUPERVISOR', 'FINANCER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SlipStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PAYMENT_PENDING', 'PAYMENT_DONE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseSlip" (
    "id" SERIAL NOT NULL,
    "slipNo" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "farmer" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "totalWeight" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "SlipStatus" NOT NULL DEFAULT 'PENDING',
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseSlip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weight" (
    "id" SERIAL NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "slipId" INTEGER NOT NULL,

    CONSTRAINT "Weight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseSlip_slipNo_key" ON "PurchaseSlip"("slipNo");

-- AddForeignKey
ALTER TABLE "PurchaseSlip" ADD CONSTRAINT "PurchaseSlip_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weight" ADD CONSTRAINT "Weight_slipId_fkey" FOREIGN KEY ("slipId") REFERENCES "PurchaseSlip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
