import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { generateAIProblem } from "@/lib/ai";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["FACULTY", "ADMIN"]);
    const { topic, difficulty } = await req.json();

    if (!topic || !difficulty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const problem = await generateAIProblem(topic, difficulty);

    // Log the request to AIChatLog
    await db.aiChatLog.create({
      data: {
        facultyId: user.userId,
        prompt: `Generate a ${difficulty} coding problem on topic: ${topic}`,
        responseJson: JSON.stringify(problem),
        inserted: false,
      },
    });

    return NextResponse.json({ success: true, problem });
  } catch (err: any) {
    console.error("AI Suggest API Error:", err);
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
