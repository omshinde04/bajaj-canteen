import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate size (max 8MB)
    if (buffer.length > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image file exceeds maximum allowable size of 8MB" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "evidence");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name ? path.extname(file.name) || ".jpg" : ".jpg";
    const filename = `evidence_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/evidence/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      sizeKb: Math.round(buffer.length / 1024),
      mimeType: file.type || "image/jpeg",
    });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
