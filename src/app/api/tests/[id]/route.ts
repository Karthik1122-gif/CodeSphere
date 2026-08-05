import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const test = await db.test.findUnique({
      where: { id },
      include: {
        problems: {
          include: {
            testCases: true,
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Security check: Redact hidden test cases for students
    if (user.role === "STUDENT") {
      test.problems.forEach((problem) => {
        // Redact non-sample test cases
        problem.testCases = problem.testCases.map((tc) => {
          if (tc.isSample) {
            return tc;
          } else {
            // Return only placeholder representation without expectedOutput/input
            return {
              id: tc.id,
              problemId: tc.problemId,
              input: "",
              expectedOutput: "",
              isSample: false,
              points: tc.points,
              generatedBy: tc.generatedBy,
              createdAt: tc.createdAt,
            };
          }
        });
      });
    }

    return NextResponse.json({ success: true, test });
  } catch (err: any) {
    console.error("GET Test Details Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const user = await requireAuth(["FACULTY", "ADMIN"]);
    const body = await req.json();
    
    const { title, subject, difficulty, durationMinutes, opensAt, closesAt, status, languagesAllowed } = body;

    const updatedTest = await db.test.update({
      where: { id },
      data: {
        title,
        subject,
        difficulty,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
        opensAt: opensAt ? new Date(opensAt) : undefined,
        closesAt: closesAt ? new Date(closesAt) : undefined,
        status,
        languagesAllowed,
      },
    });

    // Write to Audit Log
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await db.auditLog.create({
      data: {
        actorId: user.userId,
        action: "UPDATE_TEST",
        entity: "TEST",
        entityId: id,
        ipAddress: ip,
      },
    });

    return NextResponse.json({ success: true, test: updatedTest });
  } catch (err: any) {
    console.error("PUT Update Test Error:", err);
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const user = await requireAuth(["FACULTY", "ADMIN"]);

    await db.test.delete({
      where: { id },
    });

    // Write to Audit Log
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await db.auditLog.create({
      data: {
        actorId: user.userId,
        action: "DELETE_TEST",
        entity: "TEST",
        entityId: id,
        ipAddress: ip,
      },
    });

    return NextResponse.json({ success: true, message: "Test deleted successfully" });
  } catch (err: any) {
    console.error("DELETE Test Error:", err);
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
