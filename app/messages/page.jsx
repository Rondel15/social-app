"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { io } from "socket.io-client";
import Navbar from "@/components/layout/Navbar";
import { formatDistanceToNow } from "date-fns";

let socket;

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId");
  const [friends, setFriends] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    axios.get("/api/friends").then(({ data }) => {
      setFriends(data.friends);
      if (targetUserId) {
        const user = data.friends.find(f => f._id === targetUserId);
        if (user) setActiveUser(user);
      }
    });
  }, [status, targetUserId]);

  useEffect(() => {
    if (!session?.user) return;
    // socket connection would go here using socket.io
  }, [session]);

  useEffect(() => {
    if (activeUser && session) {
      axios.get(`/api/messages?userId=${activeUser._id}`).then(({ data }) => setMessages(data.messages));
    }
  }, [activeUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeUser) return;
    try {
      const roomId = [session.user.id, activeUser._id].sort().join("-");
      const { data } = await axios.post("/api/messages", { receiverId: activeUser._id, content: input, roomId });
      setMessages(prev => [...prev, { sender: { _id: session.user.id, username: session.user.username }, content: input, createdAt: new Date() }]);
      setInput("");
    } catch {}
  };

  if (status === "loading") return <div className="min-h-screen bg-surface flex items-center justify-center text-muted">Loading...</div>;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <div className="pt-14 flex flex-1 max-w-5xl mx-auto w-full">
        <div className="w-64 border-r border-border flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-soft">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {friends.length === 0 && <p className="text-muted text-xs text-center py-6">Add friends to message them</p>}
            {friends.map(friend => (
              <button key={friend._id} onClick={() => setActiveUser(friend)} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-card transition-colors text-left ${activeUser?._id === friend._id ? "bg-card" : ""}`}>
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {friend.avatar ? <img src={friend.avatar} className="w-full h-full rounded-full object-cover" /> : friend.username?.[0]?.toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-panel ${friend.isOnline ? "bg-green-500" : "bg-muted"}`} />
                </div>
                <span className="text-sm text-soft truncate">{friend.name || friend.username}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {!activeUser ? (
            <div className="flex-1 flex items-center justify-center text-muted text-sm">Select a friend to start chatting</div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-soft">{activeUser.name || activeUser.username}</p>
                <p className="text-xs text-green-500">{activeUser.isOnline ? "Online" : "Offline"}</p>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((msg, i) => {
                  const isOwn = msg.sender?._id === session?.user?.id;
                  return (
                    <div key={i} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${isOwn ? "bg-accent text-white rounded-tr-sm" : "bg-card border border-border text-soft rounded-tl-sm"}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="px-4 py-3 border-t border-border flex gap-3">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder={`Message ${activeUser.name || activeUser.username}...`}
                  className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-soft placeholder-muted focus:outline-none focus:border-accent transition-colors"
                />
                <button onClick={sendMessage} disabled={!input.trim()} className="bg-accent hover:bg-accent-dim disabled:opacity-30 text-white px-4 py-2 rounded-lg text-sm transition-colors">Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
