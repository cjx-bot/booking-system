-- DropIndex
DROP INDEX "Booking_eventTypeId_startTime_idx";

-- CreateTable
CREATE TABLE "BookingLock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hostId" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingLock_hostId_startAt_key" ON "BookingLock"("hostId", "startAt");
