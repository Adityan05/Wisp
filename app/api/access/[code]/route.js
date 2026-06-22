import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";
import { supabaseAdmin } from "@/lib/supabase";
import { headers } from "next/headers";

export async function GET(request, { params }) {
  try {
    //start ip-rl part
    const headerList = await headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "127.0.0.1";
    const { success } = await rateLimit(ip, "access", 5, 60);
    if (!success) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 },
      );
    }
    //end ip-rl part

    const { code } = await params;
    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }
    const result = await query("SELECT * FROM uploads WHERE code = $1", [code]);
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Invalid code or not found" },
        { status: 404 },
      );
    }
    const upload = result.rows[0];

    //check expiry
    const now = new Date();
    const expiresAt = new Date(upload.expires_at);

    if (now > expiresAt) {
      return NextResponse.json(
        { error: "This drop has expired" },
        { status: 410 },
      );
    }

    if (upload.type === "file") {
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 },
        );
      }
      // Generate a signed URL that is valid for 60 seconds
      // 'download: true' triggers the browser to download the file with its original name
      const { data, error } = await supabaseAdmin.storage
        .from("wisp-files")
        .createSignedUrl(upload.file_path, 60, {
          download: encodeURIComponent(upload.original_name), // Force Content-Disposition header
        });

      if (error || !data?.signedUrl) {
        console.error("Storage signed URL error:", error);
        return NextResponse.json(
          { error: "Could not generate download link" },
          { status: 500 },
        );
      }

      // Redirect the client to the Supabase temporary URL
      // The frontend 'fetch' will follow this redirect and download the file blob
      return NextResponse.redirect(data.signedUrl);
    } else {
      return NextResponse.json({
        type: upload.type,
        content: upload.text_data,
        expires_at: upload.expires_at,
      });
    }

    //if type is file, read it from disk and return it
    // if (upload.type === "file") {
    //   const relPath =
    //     upload.file_path.startsWith("/") || upload.file_path.startsWith("\\")
    //       ? upload.file_path.slice(1)
    //       : upload.file_path;
    //   const fullPath = path.join(process.cwd(), "public", relPath);
    //   if (!existsSync(fullPath)) {
    //     return NextResponse.json(
    //       { error: "File missing form server storage" },
    //       { status: 404 },
    //     );
    //   }
    //   const fileBuffer = await readFile(fullPath);
    //   return new NextResponse(fileBuffer, {
    //     headers: {
    //       "Content-Type": upload.mime_type || "application/octet-stream",
    //       "Content-Disposition": `attachment; filename="${upload.original_name}"`, // Forces download with original name
    //       "Content-Length": upload.size_bytes
    //         ? upload.size_bytes.toString()
    //         : undefined,
    //     },
    //   });
    // }
    // //handle text and link
    // else {
    //   return NextResponse.json({
    //     success: true,
    //     type: upload.type,
    //     content: upload.text_data,
    //     expires_at: upload.expires_at,
    //   });
    // }
  } catch (error) {
    console.error("Access error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
