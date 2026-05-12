"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function FriendRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios.get("/api/friends").then(({ data }) => setRequests(data.requests));
  }, []);

  const handleAction = async (requestId, action) => {
    try {
      await axios.patch("/api/friends", { requestId, action });
      setRequests(prev => prev.filter(r => r._id !== requestId));
      toast.success(action === "accept" ? "Friend added!" : "Request declined");
    } catch { toast.error("Action failed"); }
  };

  if (requests.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-soft mb-3">Friend Requests</h3>
      <div className="space-y-3">
        {requests.map(req => (
          <div key={req._id} className="flex items-center gap-3">
            <Link href={`/profile/${req.sender._id}`} className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-sm font-medium flex-shrink-0 hover:opacity-80">
              {req.sender.avatar ? <img src={req.sender.avatar} className="w-full h-full rounded-full object-cover" /> : req.sender.username?.[0]?.toUpperCase()}
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-soft truncate">{req.sender.name || req.sender.username}</p>
              <div className="flex gap-1.5 mt-1">
                <button onClick={() => handleAction(req._id, "accept")} className="bg-accent hover:bg-accent-dim text-white text-xs px-2.5 py-1 rounded-md transition-colors">Accept</button>
                <button onClick={() => handleAction(req._id, "decline")} className="bg-surface border border-border text-muted hover:text-soft text-xs px-2.5 py-1 rounded-md transition-colors">Decline</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
