"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import NotificationBell from "@/components/notification/NotificationBell";
import axios from "axios";

export default function Navbar() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!search.trim()) { setResults([]); setOpen(false); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/users?search=${search}`);
        setResults(data.users);
        setOpen(true);
      } catch { setResults([]); }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!session) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-panel border-b border-border h-14 flex items-center px-4 gap-4">
      <Link href="/feed" className="text-accent font-semibold text-lg flex-shrink-0">SocialApp</Link>

      {/* Search */}
      <div className="relative flex-1 max-w-xs" ref={ref}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search people..."
          className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-soft placeholder-muted focus:outline-none focus:border-accent"
        />
        {open && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-panel border border-border rounded-lg shadow-lg overflow-hidden z-50">
            {loading && <p className="text-xs text-muted px-3 py-2">Searching...</p>}
            {!loading && results.length === 0 && <p className="text-xs text-muted px-3 py-2">No users found</p>}
            {results.map(user => (
              <Link
                key={user._id}
                href={`/profile/${user._id}`}
                onClick={() => { setOpen(false); setSearch(""); }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-card transition-colors"
              >
                {user.avatar
                  ? <img src={user.avatar} className="w-7 h-7 rounded-full object-cover" />
                  : <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs">{user.username?.[0]?.toUpperCase()}</div>
                }
                <div>
                  <p className="text-sm text-soft">{user.username}</p>
                  {user.name && <p className="text-xs text-muted">{user.name}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <NotificationBell />
        <Link href={`/profile/${session.user.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {session.user.avatar
            ? <img src={session.user.avatar} className="w-8 h-8 rounded-full object-cover" />
            : <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-medium">{session.user.username?.[0]?.toUpperCase()}</div>
          }
          <span className="text-sm text-soft hidden sm:block">{session.user.username}</span>
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-xs text-muted hover:text-soft transition-colors">Sign out</button>
      </div>
    </nav>
  );
}