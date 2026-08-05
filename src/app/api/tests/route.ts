import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/auth";

// GET - List tests
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    
    // Filter tests by status based on user role
    let tests;
    if (!user || user.role === "STUDENT") {
      tests = await db.test.findMany({
        where: {
          status: { in: ["PUBLISHED", "CLOSED"] },
        },
        orderBy: { opensAt: "asc" },
      });
    } else {
      // Faculty/Admin can see all tests
      tests = await db.test.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ success: true, tests });
  } catch (err: any) {
    console.error("GET Tests Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new test with problems and test cases
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["FACULTY", "ADMIN"]);
    const body = await req.json();
    const { title, subject, difficulty, durationMinutes, opensAt, closesAt, status, languagesAllowed, problems } = body;

    if (!title || !subject || !durationMinutes || !opensAt || !closesAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create within a transaction to maintain integrity
    const newTest = await db.$transaction(async (tx) => {
      const createdTest = await tx.test.create({
        data: {
          title,
          subject,
          createdById: user.userId,
          difficulty: difficulty || "MEDIUM",
          durationMinutes: parseInt(durationMinutes),
          opensAt: new Date(opensAt),
          closesAt: new Date(closesAt),
          status: status || "DRAFT",
          languagesAllowed: languagesAllowed || "cpp,python,javascript",
        },
      });

      // If problems are provided, insert them sequentially
      if (problems && Array.isArray(problems)) {
        for (let i = 0; i < problems.length; i++) {
          const prob = problems[i];
          const createdProblem = await tx.problem.create({
            data: {
              testId: createdTest.id,
              title: prob.title,
              statementMd: prob.statementMd,
              constraints: prob.constraints || "",
              points: prob.points || 50,
              orderIndex: i + 1,
            },
          });

          // Insert test cases for this problem
          if (prob.testCases && Array.isArray(prob.testCases)) {
            await tx.testCase.createMany({
              data: prob.testCases.map((tc: any) => ({
                problemId: createdProblem.id,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isSample: tc.isSample || false,
                points: tc.points || 0,
                generatedBy: tc.generatedBy || "manual",
              })),
            });
          }
        }
      }

      // Write Audit Log
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await tx.auditLog.create({
        data: {
          actorId: user.userId,
          action: "CREATE_TEST",
          entity: "TEST",
          entityId: createdTest.id,
          ipAddress: ip,
        },
      });

      return createdTest;
    });

    return NextResponse.json({ success: true, test: newTest });
  } catch (err: any) {
    console.error("POST Create Test Error:", err);
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
