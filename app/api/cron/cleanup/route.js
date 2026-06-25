import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  // Verify this is being called by Vercel Cron, not a random person
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Missing service role key" },
      { status: 500 },
    );
  }

  try {
    // 1. Fetch all expired rows that have a file in storage
    const { data: expiredFiles, error: fetchError } = await supabaseAdmin
      .from("uploads")
      .select("id, file_path, type")
      .lt("expires_at", new Date().toISOString())
      .eq("type", "file"); // only file uploads have storage objects

    if (fetchError) throw fetchError;

    // 2. Delete from Supabase Storage if there are any expired files
    if (expiredFiles && expiredFiles.length > 0) {
      const filePaths = expiredFiles
        .map((row) => row.file_path)
        .filter(Boolean); // remove any nulls just in case

      if (filePaths.length > 0) {
        const { error: storageError } = await supabaseAdmin.storage
          .from("wisp-files") // ← your bucket name, change if different
          .remove(filePaths);

        if (storageError) throw storageError;
      }
    }

    // 3. Delete ALL expired rows from DB (files + links/text)
    const { data: deletedRows, error: deleteError } = await supabaseAdmin
      .from("uploads")
      .delete()
      .lt("expires_at", new Date().toISOString())
      .select(); // returns what was deleted

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      filesDeleted: expiredFiles?.length ?? 0,
      rowsDeleted: deletedRows?.length ?? 0,
    });
  } catch (err) {
    console.error("Cleanup cron error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
