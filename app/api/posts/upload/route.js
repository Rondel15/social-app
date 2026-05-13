import { NextResponse } from "next/server";
import { uploadMedia } from "@/lib/cloudinary";
import { getServerSession } from "next-auth";

export async function POST(req) {
  return NextResponse.json({ ok: true });
}