-- Add customer address and location fields
ALTER TABLE "User"
ADD COLUMN "address" TEXT,
ADD COLUMN "location" TEXT;
