import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { judgeSubmission } from "@/lib/judge";

// GET - List submissions (secured per role)
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("testId");
    const problemId = searchParams.get("problemId");

    let whereClause: any = {};

    // Enforce role-based isolation
    if (user.role === "STUDENT") {
      whereClause.studentId = user.userId;
    }

    if (problemId) {
      whereClause.problemId = problemId;
    } else if (testId) {
      whereClause.problem = {
        testId: testId,
      };
    }

    const submissions = await db.submission.findMany({
      where: whereClause,
      include: {
        problem: {
          select: {
            title: true,
            testId: true,
            test: {
              select: {
                title: true,
              },
            },
          },
        },
        student: {
          select: {
            name: true,
            email: true,
            rollNo: true,
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
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ success: true, submissions });
  } catch (err: any) {
    console.error("GET Submissions Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Submit code for judging (runs asynchronously)
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["STUDENT"]);
    const { problemId, language, sourceCode } = await req.json();

    if (!problemId || !language || !sourceCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create a submission record
    const submission = await db.submission.create({
      data: {
        studentId: user.userId,
        problemId,
        language,
        sourceCode,
        status: "QUEUED",
      },
    });

    // 2. Write Audit Log
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await db.auditLog.create({
      data: {
        actorId: user.userId,
        action: "SUBMIT_CODE",
        entity: "SUBMISSION",
        entityId: submission.id,
        ipAddress: ip,
        metadataJson: JSON.stringify({ language, problemId }),
      },
    });

    // 3. Trigger local compilation/execution judge asynchronously
    // This allows returning the response immediately without blocking the browser thread
    judgeSubmission(submission.id).catch((err) => {
      console.error(`Background judge failure for submission ${submission.id}:`, err);
    });

    return NextResponse.json({
      success: true,
      message: "Submission enqueued for judging",
      submissionId: submission.id,
    });
  } catch (err: any) {
    console.error("POST Submit Code Error:", err);
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
