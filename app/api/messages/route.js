import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User";

// GET /api/messages?userId=xxx
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const roomId = [session.user.id, userId].sort().join("-");
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 }).populate("sender", "username name avatar").lean();
    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/messages/conversations — list all DM threads
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const userId = session.user.id;
    // Get last message per conversation
    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$roomId", lastMessage: { $first: "$$ROOT" } } },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);
    return NextResponse.json({ conversations });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
