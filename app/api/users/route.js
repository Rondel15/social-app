import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const excludeFriends = searchParams.get("excludeFriends") === "true";

    const currentUser = await User.findById(session.user.id).select("friends");
    const excludeIds = excludeFriends ? [...currentUser.friends, session.user.id] : [session.user.id];

    const users = await User.find({
      _id: { $nin: excludeIds },
      ...(search && {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ],
      }),
    }).select("username name avatar isOnline").limit(20);

    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}