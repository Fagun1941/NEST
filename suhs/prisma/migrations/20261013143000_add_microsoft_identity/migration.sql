ALTER TABLE "User" ADD COLUMN "microsoftId" TEXT;
CREATE UNIQUE INDEX "User_microsoftId_key" ON "User"("microsoftId");
