import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Notification from "@/models/Notification";

// DELETE /api/posts/[id]
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const post = await Post.findById(params.id);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.author.toString() !== session.user.id)
      return NextResponse.json({ error: "Not your post" }, { status: 403 });

    await post.deleteOne();
    return NextResponse.json({ message: "Post deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/posts/[id] — like or comment
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { action, content } = await req.json();
    const post = await Post.findById(params.id);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const userId = session.user.id;

    if (action === "like") {
      const liked = post.likes.includes(userId);
      if (liked) {
        post.likes.pull(userId);
      } else {
        post.likes.push(userId);
        // notify post author
        if (post.author.toString() !== userId) {
          await Notification.create({
            recipient: post.author,
            sender: userId,
            type: "like",
            reference: post._id,
            referenceModel: "Post",
          });
        }
      }
    }

    if (action === "comment" && content) {
      post.comments.push({ author: userId, content });
      if (post.author.toString() !== userId) {
        await Notification.create({
          recipient: post.author,
          sender: userId,
          type: "comment",
          reference: post._id,
          referenceModel: "Post",
        });
      }
    }

    await post.save();
    await post.populate("author", "username name avatar");
    await post.populate("comments.author", "username name avatar");
    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
