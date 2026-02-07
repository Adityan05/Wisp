
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(request, { params }) {

    try {
        const { code } = await params;
        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }
        const result = await query("SELECT * FROM uploads WHERE code = $1", [code]);
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Invalid code or not found" }, { status: 404 });
        }
        const upload = result.rows[0];

        //check expiry
        const now = new Date();
        const expiresAt = new Date(upload.expires_at);

        if (now > expiresAt) {
            return NextResponse.json({ error: "This drop has expired" }, { status: 410 });
        }

        //if type is file, read it from disk and return it
        if (upload.type === "file") {
            const relPath = upload.file_path.startsWith("/") || upload.file_path.startsWith("\\") ? upload.file_path.slice(1) : upload.file_path;
            const fullPath = path.join(process.cwd(), "public", relPath);
            if (!existsSync(fullPath)) {
                return NextResponse.json({ error: "File missing form server storage" }, { status: 404 });
            }
            const fileBuffer = await readFile(fullPath);
            return new NextResponse(fileBuffer, {
                headers: {
                    "Content-Type": upload.mime_type || "application/octet-stream",
                    "Content-Disposition": `attachment; filename="${upload.original_name}"`, // Forces download with original name
                    "Content-Length": upload.size_bytes ? upload.size_bytes.toString() : undefined,
                },
            });

        }
        //handle text and link
        else {
            return NextResponse.json({
                success: true,
                type: upload.type,
                content: upload.text_data,
                expires_at: upload.expires_at,
            });
        }

    } catch (error) {
        console.error("Access API error", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

}