-- DropIndex
DROP INDEX "Booking_eventTypeId_startTime_key";

-- CreateIndex
CREATE INDEX "Booking_eventTypeId_startTime_idx" ON "Booking"("eventTypeId", "startTime");
