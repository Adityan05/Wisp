import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET() {
  try {
    const [uploads, bytes, downloads] = await Promise.all([
      redis.get("wisp:total_uploads"),
      redis.get("wisp:total_bytes"),
      redis.get("wisp:total_downloads"),
    ]);

    return NextResponse.json({
      uploads: Number(uploads) || 0,
      bytes: Number(bytes) || 0,
      downloads: Number(downloads) || 0,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
