import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/auth";

// GET - Retrieve grades for a specific test
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("testId");

    let whereClause: any = {};
    if (testId) {
      whereClause.testId = testId;
    }

    // Student can only see their own grade
    if (user.role === "STUDENT") {
      whereClause.studentId = user.userId;
    }

    const grades = await db.grade.findMany({
      where: whereClause,
      include: {
        submission: {
          select: {
            language: true,
            submittedAt: true,
            status: true,
            results: true,
          },
        },
        test: {
          select: {
            title: true,
            subject: true,
          },
        },
        gradedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // If student, and the grade status is PENDING, we might want to redact final marks depending on LMS policy.
    // However, we can return the records as-is or show them.

    return NextResponse.json({ success: true, grades });
  } catch (err: any) {
    console.error("GET Grades Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST/PUT - Override marks (Faculty only)
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["FACULTY", "ADMIN"]);
    const { gradeId, finalMarks, status } = await req.json();

    if (!gradeId) {
      return NextResponse.json({ error: "gradeId is required" }, { status: 400 });
    }

    const currentGrade = await db.grade.findUnique({
      where: { id: gradeId },
    });

    if (!currentGrade) {
      return NextResponse.json({ error: "Grade entry not found" }, { status: 404 });
    }

    const updatedGrade = await db.grade.update({
      where: { id: gradeId },
      data: {
        finalMarks: finalMarks !== undefined ? parseInt(finalMarks) : undefined,
        status: status || undefined,
        gradedById: user.userId,
        gradedAt: new Date(),
      },
    });

    // Write to Audit Log
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await db.auditLog.create({
      data: {
        actorId: user.userId,
        action: "OVERRIDE_GRADE",
        entity: "GRADE",
        entityId: gradeId,
        ipAddress: ip,
        metadataJson: JSON.stringify({
          oldMarks: currentGrade.finalMarks,
          newMarks: finalMarks,
          status,
        }),
      },
    });

    return NextResponse.json({ success: true, grade: updatedGrade });
  } catch (err: any) {
    console.error("POST Override Grade Error:", err);
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
