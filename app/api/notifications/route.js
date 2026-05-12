import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

// GET /api/notifications
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const notifications = await Notification.find({ recipient: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("sender", "username name avatar")
      .lean();
    const unreadCount = await Notification.countDocuments({ recipient: session.user.id, read: false });
    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/notifications — mark all as read
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    await Notification.updateMany({ recipient: session.user.id, read: false }, { read: true });
    return NextResponse.json({ message: "Marked as read" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
