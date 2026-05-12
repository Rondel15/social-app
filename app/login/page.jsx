"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { ...form, redirect: false });
    if (res?.error) { setError("Invalid email or password"); setLoading(false); }
    else router.push("/feed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold text-soft mb-1">Welcome back</h1>
        <p className="text-muted text-sm mb-8">Sign in to your account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg">{error}</div>}
          {[{ key: "email", label: "Email", type: "email", placeholder: "you@example.com" }, { key: "password", label: "Password", type: "password", placeholder: "..." }].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} required className="w-full bg-panel border border-border rounded-lg px-4 py-2.5 text-sm text-soft placeholder-muted focus:outline-none focus:border-accent transition-colors" />
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent-dim text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">{loading ? "Signing in..." : "Sign in"}</button>
        </form>
        <p className="text-center text-muted text-sm mt-6">No account? <Link href="/register" className="text-accent hover:underline">Register</Link></p>
      </div>
    </div>
  );
}
