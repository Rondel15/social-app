import { NextResponse } from "next/server";
import { uploadMedia } from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}