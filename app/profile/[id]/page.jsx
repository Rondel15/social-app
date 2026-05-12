"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import PostCard from "@/components/post/PostCard";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friendRequest, setFriendRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  useEffect(() => {
    if (id && status === "authenticated") {
      axios.get(`/api/users/${id}`).then(({ data }) => {
        setProfile(data.user);
        setPosts(data.posts);
        setFriendRequest(data.friendRequest);
        setLoading(false);
      });
    }
  }, [id, status]);

  const isOwnProfile = session?.user?.id === id;
  const isFriend = profile?.friends?.some(f => f._id === session?.user?.id);
  const isPending = friendRequest?.status === "pending";

  const handleFriendAction = async () => {
    try {
      if (isFriend) {
        await axios.delete("/api/friends", { data: { friendId: id } });
        toast.success("Unfriended");
        setProfile(prev => ({ ...prev, friends: prev.friends.filter(f => f._id !== session.user.id) }));
      } else if (!isPending) {
        await axios.post("/api/friends", { receiverId: id });
        toast.success("Friend request sent!");
        setFriendRequest({ status: "pending" });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Action failed");
    }
  };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center text-muted">Loading...</div>;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-14">
        <div className="h-40 bg-gradient-to-r from-accent/30 to-purple-900/30 relative">
          {profile?.cover && <img src={profile.cover} className="w-full h-full object-cover" />}
        </div>
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-surface bg-accent flex items-center justify-center text-white text-3xl font-medium overflow-hidden">
              {profile?.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : profile?.username?.[0]?.toUpperCase()}
            </div>
            {!isOwnProfile && (
              <div className="flex gap-2 pb-2">
                <button onClick={handleFriendAction} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isFriend ? "bg-card border border-border text-muted hover:text-red-400" : isPending ? "bg-card border border-border text-muted" : "bg-accent hover:bg-accent-dim text-white"}`}>
                  {isFriend ? "Unfriend" : isPending ? "Request Sent" : "Add Friend"}
                </button>
                <button onClick={() => router.push(`/messages?userId=${id}`)} className="px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border text-soft hover:border-accent transition-colors">
                  Message
                </button>
              </div>
            )}
          </div>
          <h1 className="text-xl font-semibold text-soft">{profile?.name || profile?.username}</h1>
          <p className="text-muted text-sm">@{profile?.username}</p>
          {profile?.bio && <p className="text-soft text-sm mt-2">{profile.bio}</p>}
          <div className="flex gap-4 mt-3 text-sm text-muted">
            <span><strong className="text-soft">{profile?.friends?.length || 0}</strong> Friends</span>
            <span><strong className="text-soft">{posts.length}</strong> Posts</span>
          </div>
          <div className="mt-6 space-y-4">
            {posts.length === 0 && <p className="text-muted text-sm text-center py-8">No posts yet</p>}
            {posts.map(post => <PostCard key={post._id} post={post} onDelete={(pid) => setPosts(prev => prev.filter(p => p._id !== pid))} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
