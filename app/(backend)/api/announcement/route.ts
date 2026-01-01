// model Announcement {
//   id          String    @id @default(cuid())
//   title       String
//   content     String
//   imageUrl    String?
//   linkUrl     String?
//   isActive    Boolean   @default(true)
//   isPublished Boolean   @default(false)
//   startDate   DateTime?
//   endDate     DateTime?
//   createdAt   DateTime  @default(now())
//   updatedAt   DateTime  @updatedAt
//   userId      String?
//   user        UserData?  @relation(fields: [userId], references: [id], onDelete: Cascade)

//   @@map("announcements")
// }

"use server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, imageUrl, linkUrl, isActive, isPublished, startDate, endDate, userId } = await request.json();
    if (!title || !content || !userId) {
      return NextResponse.json({ error: "Title, content, and userId are required" }, { status: 400 });
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        imageUrl,
        linkUrl,
        isActive: isActive !== undefined ? isActive : true,
        isPublished: isPublished !== undefined ? isPublished : false,
        startDate,
        endDate,
        userId,
      },
    });

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, content, imageUrl, linkUrl, isActive, isPublished, startDate, endDate } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 });
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        imageUrl,
        linkUrl,
        isActive,
        isPublished,
        startDate,
        endDate,
      },
    });

    return NextResponse.json(updatedAnnouncement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 });
    }

    await prisma.announcement.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}

