import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Only allow Admin or Faculty to view audit logs
    const user = await requireAuth(["ADMIN", "FACULTY"]);

    const logs = await db.auditLog.findMany({
      include: {
        actor: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to 100 recent actions
    });

    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    console.error("GET Audit Logs Error:", err);
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
