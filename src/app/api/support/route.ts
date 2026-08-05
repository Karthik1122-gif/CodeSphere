import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

// GET - Fetch thread messages
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId"); // Used by faculty to select a student

    let threadId = "";

    if (user.role === "STUDENT") {
      // Students chat with faculty. Let's find a faculty member from the database to route to.
      const firstFaculty = await db.user.findFirst({
        where: { role: "FACULTY" },
      });
      if (!firstFaculty) {
        return NextResponse.json({ success: true, messages: [] });
      }
      
      // Thread ID is alphabetical combination of both user IDs
      threadId = [user.userId, firstFaculty.id].sort().join("_");
    } else {
      // Faculty is reading chat. Must specify which student thread they are opening.
      if (!targetUserId) {
        // Return a list of all distinct threads (conversations) with student details for the inbox listing
        const threads = await db.supportMessage.findMany({
          where: {
            OR: [{ senderId: user.userId }, { recipientId: user.userId }],
          },
          include: {
            sender: { select: { id: true, name: true, role: true, rollNo: true } },
            recipient: { select: { id: true, name: true, role: true, rollNo: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        // Group by conversation
        const activeChatsMap = new Map();
        for (const msg of threads) {
          const otherUser = msg.senderId === user.userId ? msg.recipient : msg.sender;
          if (otherUser.role === "STUDENT" && !activeChatsMap.has(msg.threadId)) {
            activeChatsMap.set(msg.threadId, {
              threadId: msg.threadId,
              student: otherUser,
              lastMessage: msg.body,
              lastMessageTime: msg.createdAt,
            });
          }
        }

        return NextResponse.json({ success: true, threads: Array.from(activeChatsMap.values()) });
      }

      threadId = [user.userId, targetUserId].sort().join("_");
    }

    const messages = await db.supportMessage.findMany({
      where: { threadId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark received messages as read
    await db.supportMessage.updateMany({
      where: {
        threadId,
        recipientId: user.userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, messages });
  } catch (err: any) {
    console.error("GET Support Messages Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Send a new support message
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { body, recipientId } = await req.json();
    if (!body) {
      return NextResponse.json({ error: "Message body is required" }, { status: 400 });
    }

    let finalRecipientId = recipientId;

    if (user.role === "STUDENT") {
      // Default recipient to first faculty
      if (!finalRecipientId) {
        const firstFaculty = await db.user.findFirst({
          where: { role: "FACULTY" },
        });
        if (!firstFaculty) {
          return NextResponse.json({ error: "No faculty available" }, { status: 404 });
        }
        finalRecipientId = firstFaculty.id;
      }
    } else {
      // Faculty sending message must specify the student
      if (!finalRecipientId) {
        return NextResponse.json({ error: "Recipient ID is required" }, { status: 400 });
      }
    }

    const threadId = [user.userId, finalRecipientId].sort().join("_");

    const message = await db.supportMessage.create({
      data: {
        threadId,
        senderId: user.userId,
        recipientId: finalRecipientId,
        body,
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    console.error("POST Support Message Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
