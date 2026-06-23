import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { genCode } from "@/lib/utils";
import { v4 as uuid } from "uuid";
import { rateLimit } from "@/lib/ratelimit";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request) {
  try {
    //start ip-rl part
    const headerList = await headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "127.0.0.1";
    const { success } = await rateLimit(ip, "upload", 3, 90);
    if (!success) {
      return NextResponse.json(
        { error: "Too many uploads. Try again later." },
        { status: 429 },
      );
    }
    //end ip-rl part

    const formData = await request.formData();
    const type = formData.get("type");
    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }
    let code = genCode();
    let isUnique = false;
    let retries = 0;
    while (!isUnique && retries < 5) {
      const codeCheck = await query("SELECT 1 FROM uploads WHERE code = $1", [
        code,
      ]);
      if (codeCheck.rowCount === 0) {
        isUnique = true;
      } else {
        code = genCode();
        retries++;
      }
    }
    if (!isUnique) {
      return NextResponse.json(
        { error: "Failed to generate unique code" },
        { status: 500 },
      );
    }

    const id = uuid();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    if (type === "file") {
      const file = formData.get("file");
      if (!file) {
        return NextResponse.json(
          { error: "File is required" },
          { status: 400 },
        );
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File exceeds 10MB limit" },
          { status: 400 },
        );
      }

      //Buffer
      //   const buffer = Buffer.from(await file.arrayBuffer());
      if (!supabaseAdmin) {
        console.error("Supabase Admin key missing");
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 },
        );
      }

      const fileName = `${id}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      // Upload using Service Role
      const { error: uploadError } = await supabaseAdmin.storage
        .from("wisp-files") // Ensure this bucket exists and is PRIVATE
        .upload(fileName, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase Upload Error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload file to storage" },
          { status: 500 },
        );
      }

      //Save to PostgreSQL db
      await query(
        "INSERT INTO uploads (id, code, type, file_path, original_name, mime_type, size_bytes, expires_at)   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [id, code, type, fileName, file.name, file.type, file.size, expiresAt],
      );
    } else if (type === "text" || type === "link") {
      const content = formData.get("content");
      if (!content) {
        return NextResponse.json(
          { error: "Content is required" },
          { status: 400 },
        );
      }
      await query(
        "INSERT INTO uploads (id,code,type,text_data,expires_at) VALUES ($1,$2,$3,$4,$5)",
        [id, code, type, content, expiresAt],
      );
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json({ success: true, code, expiresAt });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
