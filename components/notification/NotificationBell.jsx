"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    axios.get("/api/notifications").then(({ data }) => {
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    });
  }, []);

  const markRead = async () => {
    setOpen(true);
    if (unread > 0) {
      await axios.patch("/api/notifications");
      setUnread(0);
    }
  };

  const typeLabel = (type) => {
    const map = { like: "liked your post", comment: "commented on your post", friend_request: "sent you a friend request", friend_accept: "accepted your request", message: "sent you a message" };
    return map[type] || type;
  };

  return (
    <div className="relative">
      <button onClick={markRead} className="relative text-muted hover:text-soft transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-8 w-72 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-soft">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-soft text-xs">Close</button>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 && <p className="text-muted text-sm text-center py-6">No notifications</p>}
            {notifications.map(n => (
              <div key={n._id} className={`px-4 py-3 flex items-center gap-3 ${!n.read ? "bg-accent/5" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs flex-shrink-0">
                  {n.sender?.username?.[0]?.toUpperCase()}
                </div>
                <p className="text-xs text-soft"><span className="font-medium">{n.sender?.username}</span> {typeLabel(n.type)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
