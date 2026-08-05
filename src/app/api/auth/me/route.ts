import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("Auth Me API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
