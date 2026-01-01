// model DashboardContent {
//   id          String    @id @default(cuid())
//   title       String
//   description String?
//   imageUrl    String
//   linkUrl     String?
//   order       Int       @default(0)
//   isActive    Boolean   @default(true)
//   isPublished Boolean   @default(false)
//   startDate   DateTime?
//   endDate     DateTime?
//   createdAt   DateTime  @default(now())
//   updatedAt   DateTime  @updatedAt
//   createdBy   String

//   @@map("dashboard_contents")
// }

"use server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dashboardContents = await prisma.dashboardContent.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(dashboardContents);
  } catch (error) {
    console.error("Error fetching dashboard contents:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard contents" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, imageUrl, linkUrl, order, isActive, isPublished, startDate, endDate, userId } = await request.json();
    if (!title || !imageUrl || !userId) {
      return NextResponse.json({ error: "Title, imageUrl, and userId are required" }, { status: 400 });
    }

    const newDashboardContent = await prisma.dashboardContent.create({
      data: {
        title,
        description,
        imageUrl,
        linkUrl,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        isPublished: isPublished !== undefined ? isPublished : false,
        startDate,
        endDate,
        userId,
      },
    });

    return NextResponse.json(newDashboardContent, { status: 201 });
  } catch (error) {
    console.error("Error creating dashboard content:", error);
    return NextResponse.json({ error: "Failed to create dashboard content" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, description, imageUrl, linkUrl, order, isActive, isPublished, startDate, endDate } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required for updating dashboard content" }, { status: 400 });
    }

    const updatedDashboardContent = await prisma.dashboardContent.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        linkUrl,
        order,
        isActive,
        isPublished,
        startDate,
        endDate,
      },
    });

    return NextResponse.json(updatedDashboardContent);
  } catch (error) {
    console.error("Error updating dashboard content:", error);
    return NextResponse.json({ error: "Failed to update dashboard content" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required for deleting dashboard content" }, { status: 400 });
    }

    await prisma.dashboardContent.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Dashboard content deleted successfully" });
  } catch (error) {
    console.error("Error deleting dashboard content:", error);
    return NextResponse.json({ error: "Failed to delete dashboard content" }, { status: 500 });
  }
}
