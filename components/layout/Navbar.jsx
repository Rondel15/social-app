"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import NotificationBell from "@/components/notification/NotificationBell";

export default function Navbar() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");

  if (!session) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-panel border-b border-border h-14 flex items-center px-4 gap-4">
      <Link href="/feed" className="text-accent font-semibold text-lg flex-shrink-0">SocialApp</Link>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search people..."
        className="flex-1 max-w-xs bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-soft placeholder-muted focus:outline-none focus:border-accent"
      />
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
