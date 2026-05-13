import { NextResponse } from "next/server";
import { uploadMedia } from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file");
    console.log("File:", file?.name, file?.size);
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    return NextResponse.json({ ok: true, filename: file.name });
  } catch (err) {
    console.error("Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}