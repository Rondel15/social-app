"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/auth/register", form);
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/feed");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold text-soft mb-1">Create account</h1>
        <p className="text-muted text-sm mb-8">Join and connect with friends</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[{ key: "name", label: "Full Name", type: "text", placeholder: "John Doe" }, { key: "username", label: "Username", type: "text", placeholder: "johndoe" }, { key: "email", label: "Email", type: "email", placeholder: "you@example.com" }, { key: "password", label: "Password", type: "password", placeholder: "..." }].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} required className="w-full bg-panel border border-border rounded-lg px-4 py-2.5 text-sm text-soft placeholder-muted focus:outline-none focus:border-accent transition-colors" />
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent-dim text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">{loading ? "Creating..." : "Create account"}</button>
        </form>
        <p className="text-center text-muted text-sm mt-6">Already have an account? <Link href="/login" className="text-accent hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
