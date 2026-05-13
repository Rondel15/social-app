"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import PostCard from "@/components/post/PostCard";

function EditProfileModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    name: profile?.name || "",
    username: profile?.username || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    website: profile?.website || "",
  });
  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar || null);
  const [coverPreview, setCoverPreview] = useState(profile?.cover || null);
  const [saving, setSaving] = useState(false);
  const avatarRef = useRef();
  const coverRef = useRef();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (type === "avatar") { setAvatar(file); setAvatarPreview(preview); }
    else { setCover(file); setCoverPreview(preview); }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await axios.post("/api/posts/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = profile?.avatar;
      let coverUrl = profile?.cover;
      if (avatar) avatarUrl = await uploadFile(avatar);
      if (cover) coverUrl = await uploadFile(cover);

      const { data } = await axios.patch(`/api/users/${profile._id}`, {
        ...form,
        avatar: avatarUrl,
        cover: coverUrl,
      });
      toast.success("Profile updated!");
      onSave(data.user);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-soft">Edit Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted hover:text-soft transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Cover photo */}
          <div>
            <p className="text-xs text-muted mb-2">Cover Photo</p>
            <div
              className="h-32 rounded-xl bg-gradient-to-r from-accent/30 to-purple-900/30 overflow-hidden relative cursor-pointer group"
              onClick={() => coverRef.current?.click()}
            >
              {coverPreview && <img src={coverPreview} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, "cover")} />
          </div>

          {/* Avatar */}
          <div>
            <p className="text-xs text-muted mb-2">Profile Picture</p>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-medium overflow-hidden relative cursor-pointer group flex-shrink-0"
                onClick={() => avatarRef.current?.click()}
              >
                {avatarPreview
                  ? <img src={avatarPreview} className="w-full h-full object-cover" />
                  : profile?.username?.[0]?.toUpperCase()}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              </div>
              <p className="text-xs text-muted">Click to change your profile picture</p>
            </div>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, "avatar")} />
          </div>

          {/* Form fields */}
          {[
            { label: "Name", key: "name", placeholder: "Your full name" },
            { label: "Username", key: "username", placeholder: "Your username" },
            { label: "Location", key: "location", placeholder: "Where are you based?" },
            { label: "Website", key: "website", placeholder: "https://yourwebsite.com" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-muted block mb-1">{label}</label>
              <input
                value={form[key]}
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-soft placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}

          {/* Bio */}
          <div>
            <label className="text-xs text-muted block mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell people about yourself..."
              rows={3}
              maxLength={200}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-soft placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
            />
            <p className="text-xs text-muted text-right mt-1">{form.bio.length}/200</p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-accent hover:bg-accent-dim disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friendRequest, setFriendRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

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

      {showEdit && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEdit(false)}
          onSave={(updated) => {
            setProfile(updated);
            update({ avatar: updated.avatar, username: updated.username });
          }}
        />
      )}

      <div className="pt-14">
        {/* Cover */}
        <div className="h-40 bg-gradient-to-r from-accent/30 to-purple-900/30 relative">
          {profile?.cover && <img src={profile.cover} className="w-full h-full object-cover" />}
        </div>

        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-end justify-between -mt-12 mb-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full border-4 border-surface bg-accent flex items-center justify-center text-white text-3xl font-medium overflow-hidden">
              {profile?.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : profile?.username?.[0]?.toUpperCase()}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pb-2">
              {isOwnProfile ? (
                <button
                  onClick={() => setShowEdit(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border text-soft hover:border-accent transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button onClick={handleFriendAction} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isFriend ? "bg-card border border-border text-muted hover:text-red-400" : isPending ? "bg-card border border-border text-muted" : "bg-accent hover:bg-accent-dim text-white"}`}>
                    {isFriend ? "Unfriend" : isPending ? "Request Sent" : "Add Friend"}
                  </button>
                  <button onClick={() => router.push(`/messages?userId=${id}`)} className="px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border text-soft hover:border-accent transition-colors">
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile info */}
          <h1 className="text-xl font-semibold text-soft">{profile?.name || profile?.username}</h1>
          <p className="text-muted text-sm">@{profile?.username}</p>
          {profile?.bio && <p className="text-soft text-sm mt-2">{profile.bio}</p>}
          {profile?.location && <p className="text-muted text-xs mt-1">📍 {profile.location}</p>}
          {profile?.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-accent text-xs mt-1 block hover:underline">
              🔗 {profile.website}
            </a>
          )}
          <div className="flex gap-4 mt-3 text-sm text-muted">
            <span><strong className="text-soft">{profile?.friends?.length || 0}</strong> Friends</span>
            <span><strong className="text-soft">{posts.length}</strong> Posts</span>
          </div>

          {/* Posts */}
          <div className="mt-6 space-y-4 pb-10">
            {posts.length === 0 && <p className="text-muted text-sm text-center py-8">No posts yet</p>}
            {posts.map(post => <PostCard key={post._id} post={post} onDelete={(pid) => setPosts(prev => prev.filter(p => p._id !== pid))} />)}
          </div>
        </div>
      </div>
    </div>
  );
}