import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { username, email, password, name } = await req.json();

    if (!username || !email || !password)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists)
      return NextResponse.json({ error: "Username or email already taken" }, { status: 409 });

    const user = await User.create({ username, email, password, name: name || username });
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
