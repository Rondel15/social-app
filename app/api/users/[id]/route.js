import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import FriendRequest from "@/models/FriendRequest";

// GET /api/users/[id] — get profile
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const user = await User.findById(params.id).select("-password").populate("friends", "username name avatar");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const posts = await Post.find({ author: params.id }).sort({ createdAt: -1 }).populate("author", "username name avatar").lean();
    const friendRequest = await FriendRequest.findOne({
      $or: [{ sender: session.user.id, receiver: params.id }, { sender: params.id, receiver: session.user.id }],
    });
    return NextResponse.json({ user, posts, friendRequest });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/users/[id] — update profile
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { name, username, bio, location, website, avatar, cover } = await req.json();
    const user = await User.findByIdAndUpdate(params.id, { name, username, bio, location, website, avatar, cover }, { new: true }).select("-password");
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
