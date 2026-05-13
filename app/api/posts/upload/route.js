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
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log("Uploading to Cloudinary...");
    const result = await uploadMedia(buffer, "social-app/posts");
    console.log("Cloudinary result:", result?.secure_url);

    return NextResponse.json({
      url: result.secure_url,
      type: result.resource_type === "video" ? "video" : "image",
    });
  } catch (err) {
    console.error("Cloudinary error:", err.message, JSON.stringify(err));
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}