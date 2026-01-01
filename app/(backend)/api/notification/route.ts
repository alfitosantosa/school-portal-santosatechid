// model Notification {
//   id        String    @id @default(cuid())
//   userId    String
//   title     String
//   message   String
//   type      String
//   category  String?
//   isRead    Boolean   @default(false)
//   link      String?
//   data      Json?
//   createdAt DateTime  @default(now())
//   readAt    DateTime?
//   user      UserData  @relation(fields: [userId], references: [id], onDelete: Cascade)

//   @@index([userId])
//   @@index([isRead])
//   @@map("notifications")
// }

"use server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, message, type, category, link, data } = await request.json();
    if (!userId || !title || !message || !type) {
      return NextResponse.json({ error: "userId, title, message, and type are required" }, { status: 400 });
    }

    const newNotification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        category,
        link,
        data,
      },
    });

    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
