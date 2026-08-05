import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submission = await db.submission.findUnique({
      where: { id },
      include: {
        problem: {
          select: {
            title: true,
            testId: true,
          },
        },
        results: {
          include: {
            testCase: {
              select: {
                isSample: true,
                points: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Role-based security: Student can only view their own submissions
    if (user.role === "STUDENT" && submission.studentId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, submission });
  } catch (err: any) {
    console.error("GET Submission Details Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
