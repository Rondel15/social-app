import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";

// GET /api/posts — fetch friend feed
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(session.user.id);
    const friendIds = [...user.friends, user._id];

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;

    const posts = await Post.find({ author: { $in: friendIds } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "username name avatar")
      .populate("comments.author", "username name avatar")
      .lean();

    return NextResponse.json({ posts, page });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/posts — create a post
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { content, media, visibility } = await req.json();

    if (!content && (!media || media.length === 0))
      return NextResponse.json({ error: "Post cannot be empty" }, { status: 400 });

    const post = await Post.create({
      author: session.user.id,
      content,
      media: media || [],
      visibility: visibility || "friends",
    });

    const populated = await post.populate("author", "username name avatar");
    return NextResponse.json({ post: populated }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
