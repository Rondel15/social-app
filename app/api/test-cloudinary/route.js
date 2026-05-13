import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const result = await cloudinary.api.ping();
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json({ error: err.message, details: JSON.stringify(err) }, { status: 500 });
  }
}