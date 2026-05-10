-- CreateTable
CREATE TABLE "RecurringRule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startsOn" TIMESTAMP(3) NOT NULL,
    "endsOn" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,

    CONSTRAINT "RecurringRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CancelledOccurrence" (
    "id" TEXT NOT NULL,
    "recurringRuleId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,

    CONSTRAINT "CancelledOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CancelledOccurrence_recurringRuleId_dateKey_key" ON "CancelledOccurrence"("recurringRuleId", "dateKey");

-- AddForeignKey
ALTER TABLE "RecurringRule" ADD CONSTRAINT "RecurringRule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancelledOccurrence" ADD CONSTRAINT "CancelledOccurrence_recurringRuleId_fkey" FOREIGN KEY ("recurringRuleId") REFERENCES "RecurringRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
