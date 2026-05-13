"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import CreatePost from "@/components/post/CreatePost";
import PostCard from "@/components/post/PostCard";
import FriendRequests from "@/components/friend/FriendRequests";
import PeopleYouMayKnow from "@/components/friend/PeopleYouMayKnow";

export default function FeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      axios.get("/api/posts").then(({ data }) => {
        setPosts(data.posts);
        setLoading(false);
      });
    }
  }, [status]);

  const handleNewPost = (post) => setPosts(prev => [post, ...prev]);
  const handleDelete = (id) => setPosts(prev => prev.filter(p => p._id !== id));

  if (status === "loading") return <div className="min-h-screen bg-surface flex items-center justify-center text-muted">Loading...</div>;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-14 max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <CreatePost onPost={handleNewPost} />
          {loading && <p className="text-muted text-sm text-center py-8">Loading posts...</p>}
          {!loading && posts.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted text-sm">No posts yet. Add some friends to see their posts!</p>
            </div>
          )}
          {posts.map(post => <PostCard key={post._id} post={post} onDelete={handleDelete} />)}
        </div>
        <div className="space-y-4">
          <FriendRequests />
          <PeopleYouMayKnow />
        </div>
      </div>
    </div>
  );
}
