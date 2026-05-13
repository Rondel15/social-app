"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function PeopleYouMayKnow() {
  const [users, setUsers] = useState([]);
  const [sent, setSent] = useState([]);

  useEffect(() => {
    axios.get("/api/users?excludeFriends=true").then(({ data }) => setUsers(data.users.slice(0, 5)));
  }, []);

  const sendRequest = async (userId) => {
    try {
      await axios.post("/api/friends", { receiverId: userId });
      setSent(prev => [...prev, userId]);
      toast.success("Friend request sent!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send request");
    }
  };

  if (users.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-soft mb-3">People You May Know</h3>
      <div className="space-y-3">
        {users.map(user => (
          <div key={user._id} className="flex items-center gap-3">
            <Link href={`/profile/${user._id}`} className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-sm font-medium flex-shrink-0 hover:opacity-80">
              {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : user.username?.[0]?.toUpperCase()}
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-soft truncate">{user.name || user.username}</p>
              <p className="text-xs text-muted">@{user.username}</p>
            </div>
            <button onClick={() => sendRequest(user._id)} disabled={sent.includes(user._id)} className="bg-accent/20 hover:bg-accent/40 disabled:opacity-40 text-accent text-xs px-2.5 py-1 rounded-md transition-colors flex-shrink-0">
              {sent.includes(user._id) ? "Sent" : "Add"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
