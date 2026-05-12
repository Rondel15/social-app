"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";

export default function CreatePost({ onPost }) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await axios.post("/api/posts/upload", formData);
        return data;
      }));
      setMedia(prev => [...prev, ...uploaded]);
    } catch { toast.error("Upload failed"); }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;
    try {
      const { data } = await axios.post("/api/posts", { content, media });
      onPost?.(data.post);
      setContent("");
      setMedia([]);
      toast.success("Posted!");
    } catch { toast.error("Failed to post"); }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
          {session?.user?.username?.[0]?.toUpperCase()}
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={2}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-soft placeholder-muted focus:outline-none focus:border-accent resize-none transition-colors"
          />
          {media.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {media.map((m, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden">
                  {m.type === "video"
                    ? <video src={m.url} className="w-full h-20 object-cover" />
                    : <img src={m.url} className="w-full h-20 object-cover" />
                  }
                  <button type="button" onClick={() => setMedia(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-black/60 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">x</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-muted hover:text-accent transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {uploading ? "Uploading..." : "Photo / Video"}
            </button>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
            <button type="submit" disabled={!content.trim() && media.length === 0} className="bg-accent hover:bg-accent-dim disabled:opacity-30 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">Post</button>
          </div>
        </form>
      </div>
    </div>
  );
}
