"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

export default function PostCard({ post, onDelete }) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const isLiked = likes.includes(session?.user?.id);
  const isOwn = post.author?._id === session?.user?.id;

  const handleLike = async () => {
    try {
      const { data } = await axios.patch(`/api/posts/${post._id}`, { action: "like" });
      setLikes(data.post.likes);
    } catch { toast.error("Failed to like post"); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await axios.patch(`/api/posts/${post._id}`, { action: "comment", content: comment });
      setComments(data.post.comments);
      setComment("");
    } catch { toast.error("Failed to comment"); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await axios.delete(`/api/posts/${post._id}`);
      toast.success("Post deleted");
      onDelete?.(post._id);
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 post-enter">
      <div className="flex items-center justify-between mb-3">
        <Link href={`/profile/${post.author?._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {post.author?.avatar
              ? <img src={post.author.avatar} className="w-full h-full rounded-full object-cover" />
              : post.author?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-soft">{post.author?.name || post.author?.username}</p>
            <p className="text-xs text-muted">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
          </div>
        </Link>
        {isOwn && (
          <button onClick={handleDelete} className="text-xs text-muted hover:text-red-400 transition-colors">Delete</button>
        )}
      </div>

      {post.content && <p className="text-sm text-soft mb-3 leading-relaxed">{post.content}</p>}

      {post.media?.length > 0 && (
        <div className={`grid gap-2 mb-3 ${post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.media.map((m, i) => (
            <div key={i} className="rounded-lg overflow-hidden bg-surface">
              {m.type === "video"
                ? <video src={m.url} controls className="w-full max-h-80 object-cover" />
                : <img src={m.url} alt="" className="w-full max-h-80 object-cover" />
              }
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? "text-accent" : "text-muted hover:text-soft"}`}>
          <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          {likes.length}
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-sm text-muted hover:text-soft transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          {comments.length}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-2">
          {comments.map((c, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-accent/60 flex items-center justify-center text-white text-xs flex-shrink-0">
                {c.author?.username?.[0]?.toUpperCase()}
              </div>
              <div className="bg-surface rounded-lg px-3 py-2 flex-1">
                <p className="text-xs font-medium text-accent">{c.author?.username}</p>
                <p className="text-xs text-soft mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
          <form onSubmit={handleComment} className="flex gap-2 mt-2">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-soft placeholder-muted focus:outline-none focus:border-accent"
            />
            <button type="submit" className="bg-accent hover:bg-accent-dim text-white text-xs px-3 py-1.5 rounded-lg transition-colors">Post</button>
          </form>
        </div>
      )}
    </div>
  );
}
