// model TahfidzRecord {
//   id          String    @id @default(cuid())
//   userId      String?
//   surah       String?
//   startVerse  Int?
//   endVerse    Int?
//   grade       String?
//   date        DateTime
//   notes       String?
//   createdAt   DateTime  @default(now())
//   updatedAt   DateTime  @updatedAt
//   user        UserData?  @relation(fields: [userId], references: [id], onDelete: Cascade)

//   @@map("tahfidz_records")
// }

"use server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tahfidzRecords = await prisma.tahfidzRecord.findMany({
      include: {
        user: true,
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(tahfidzRecords);
  } catch (error) {
    console.error("Error fetching tahfidz records:", error);
    return NextResponse.json({ error: "Failed to fetch tahfidz records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, surah, startVerse, endVerse, grade, date, notes } = await request.json();
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const newTahfidzRecord = await prisma.tahfidzRecord.create({
      data: {
        userId,
        surah,
        startVerse,
        endVerse,
        grade,
        date,
        notes,
      },
    });

    return NextResponse.json(newTahfidzRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating tahfidz record:", error);
    return NextResponse.json({ error: "Failed to create tahfidz record" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, userId, surah, startVerse, endVerse, grade, date, notes } = await request.json();
    if (!id || !date) {
      return NextResponse.json({ error: "ID and date are required" }, { status: 400 });
    }

    const updatedTahfidzRecord = await prisma.tahfidzRecord.update({
      where: { id },
      data: {
        userId,
        surah,
        startVerse,
        endVerse,
        grade,
        date,
        notes,
      },
    });

    return NextResponse.json(updatedTahfidzRecord);
  } catch (error) {
    console.error("Error updating tahfidz record:", error);
    return NextResponse.json({ error: "Failed to update tahfidz record" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required for deletion" }, { status: 400 });
    }

    await prisma.tahfidzRecord.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Tahfidz record deleted successfully" });
  } catch (error) {
    console.error("Error deleting tahfidz record:", error);
    return NextResponse.json({ error: "Failed to delete tahfidz record" }, { status: 500 });
  }
}
