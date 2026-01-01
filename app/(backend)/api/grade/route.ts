// model Grade {
//   id          String    @id @default(cuid())
//   studentId   String
//   scheduleId  String
//   subjectId   String
//   gradeTypeId String
//   score       Decimal
//   maxScore    Decimal   @default(100)
//   title       String?
//   description String?   @db.Text
//   date        DateTime
//   createdAt   DateTime  @default(now())
//   updatedAt   DateTime  @updatedAt
//   createdBy   String
//   gradeType   GradeType @relation(fields: [gradeTypeId], references: [id])
//   schedule    Schedule  @relation(fields: [scheduleId], references: [id])
//   student     UserData  @relation("StudentGrade", fields: [studentId], references: [id], onDelete: Cascade)
//   subject     Subject   @relation(fields: [subjectId], references: [id])

//   @@index([studentId])
//   @@index([scheduleId])
//   @@index([subjectId])
//   @@index([gradeTypeId])
//   @@index([date])
//   @@map("grades")
// }

"use server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const grades = await prisma.grade.findMany({
      include: {
        gradeType: true,
        schedule: true,
        student: true,
        subject: true,
      },
    });
    return NextResponse.json(grades);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 400 });
  }
}
