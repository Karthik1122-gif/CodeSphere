import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    const response = NextResponse.json({ success: true });

    // Clear cookie
    response.cookies.delete("token");

    if (user) {
      // Audit log the logout
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await db.auditLog.create({
        data: {
          actorId: user.userId,
          action: "LOGOUT",
          entity: "USER",
          entityId: user.userId,
          ipAddress: ip,
        },
      });
    }

    return response;
  } catch (err) {
    console.error("Logout API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
