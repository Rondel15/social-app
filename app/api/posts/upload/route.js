import { NextResponse } from "next/server";
import { uploadMedia } from "@/lib/cloudinary";

export async function POST(req) {
  return NextResponse.json({ ok: true });
}