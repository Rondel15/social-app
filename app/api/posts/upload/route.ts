import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadMedia } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    console.log("Cloudinary config:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      has_secret: !!process.env.CLOUDINARY_API_SECRET,
    });

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await uploadMedia(buffer, "social-app/posts");

    return NextResponse.json({
      url: (result as any).secure_url,
      type: (result as any).resource_type === "video" ? "video" : "image",
    });
  } catch (err: any) {
    console.error("Upload error:", JSON.stringify(err, null, 2));
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}