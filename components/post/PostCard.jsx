"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import Link from "next/link";

function PostModal({ post, onClose, likes, comments, isLiked, isOwn, onLike, onComment, onDelete }) {
  const [comment, setComment] = useState("");

  const handleComment = async (e) => {
    e.preventDefault();
    await onComment(comment);
    setComment("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted hover:text-soft transition-colors z-10">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-5">
          {/* Author */}
          <div className="flex items-center justify-between mb-4">
            <Link href={`/profile/${post.author?._id}`} onClick={onClose} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
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
              <button onClick={onDelete} className="text-xs text-muted hover:text-red-400 transition-colors">Delete</button>
            )}
          </div>

          {/* Content */}
          {post.content && <p className="text-sm text-soft mb-4 leading-relaxed">{post.content}</p>}

          {/* Media */}
          {post.media?.length > 0 && (
            <div className={`grid gap-2 mb-4 ${post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {post.media.map((m, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-surface">
                  {m.type === "video"
                    ? <video src={m.url} controls className="w-full object-contain max-h-96" />
                    : <img src={m.url} alt="" className="w-full object-contain max-h-96" />
                  }
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 py-3 border-t border-b border-border mb-4">
            <button onClick={onLike} className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? "text-accent" : "text-muted hover:text-soft"}`}>
              <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              {likes.length} {likes.length === 1 ? "Like" : "Likes"}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </span>
          </div>

          {/* Comments */}
          <div className="space-y-3 mb-4">
            {comments.length === 0 && <p className="text-xs text-muted text-center py-2">No comments yet. Be the first!</p>}
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
          </div>

          {/* Comment form */}
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-soft placeholder-muted focus:outline-none focus:border-accent"
            />
            <button type="submit" className="bg-accent hover:bg-accent-dim text-white text-xs px-3 py-2 rounded-lg transition-colors">Post</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PostCard({ post, onDelete }) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isLiked = likes.includes(session?.user?.id);
  const isOwn = post.author?._id === session?.user?.id;

  const handleLike = async () => {
    try {
      const { data } = await axios.patch(`/api/posts/${post._id}`, { action: "like" });
      setLikes(data.post.likes);
    } catch { toast.error("Failed to like post"); }
  };

  const handleComment = async (content) => {
    if (!content.trim()) return;
    try {
      const { data } = await axios.patch(`/api/posts/${post._id}`, { action: "comment", content });
      setComments(data.post.comments);
    } catch { toast.error("Failed to comment"); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await axios.delete(`/api/posts/${post._id}`);
      toast.success("Post deleted");
      onDelete?.(post._id);
      setShowModal(false);
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <>
      {showModal && (
        <PostModal
          post={post}
          onClose={() => setShowModal(false)}
          likes={likes}
          comments={comments}
          isLiked={isLiked}
          isOwn={isOwn}
          onLike={handleLike}
          onComment={handleComment}
          onDelete={handleDelete}
        />
      )}

      <div className="bg-card border border-border rounded-xl p-4 post-enter cursor-pointer" onClick={() => setShowModal(true)}>
        <div className="flex items-center justify-between mb-3">
          <Link href={`/profile/${post.author?._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={e => e.stopPropagation()}>
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
            <button onClick={e => { e.stopPropagation(); handleDelete(); }} className="text-xs text-muted hover:text-red-400 transition-colors">Delete</button>
          )}
        </div>

        {post.content && <p className="text-sm text-soft mb-3 leading-relaxed">{post.content}</p>}

        {post.media?.length > 0 && (
          <div className={`grid gap-2 mb-3 ${post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {post.media.map((m, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-surface">
                {m.type === "video"
                  ? <video src={m.url} controls className="w-full max-h-80 object-contain" onClick={e => e.stopPropagation()} />
                  : <img src={m.url} alt="" className="w-full max-h-80 object-contain" />
                }
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <button onClick={e => { e.stopPropagation(); handleLike(); }} className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? "text-accent" : "text-muted hover:text-soft"}`}>
            <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {likes.length}
          </button>
          <button onClick={e => { e.stopPropagation(); setShowComments(!showComments); }} className="flex items-center gap-1.5 text-sm text-muted hover:text-soft transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            {comments.length}
          </button>
        </div>

        {showComments && (
          <div className="mt-3 space-y-2" onClick={e => e.stopPropagation()}>
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
            <form onSubmit={e => { e.preventDefault(); handleComment(comment); setComment(""); }} className="flex gap-2 mt-2">
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
    </>
  );
}