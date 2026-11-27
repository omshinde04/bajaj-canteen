import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

// In-Memory Rate Limiter: max 30 uploads per minute per IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_UPLOADS_PER_WINDOW = 30;
const ipUploadLog = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const timestamps = ipUploadLog.get(ip) || [];
  
  // Prune timestamps older than window
  const activeTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (activeTimestamps.length >= MAX_UPLOADS_PER_WINDOW) {
    ipUploadLog.set(ip, activeTimestamps);
    return false;
  }
  
  activeTimestamps.push(now);
  ipUploadLog.set(ip, activeTimestamps);

  // Periodically clean up stale entries if map grows
  if (ipUploadLog.size > 1000) {
    for (const [key, list] of ipUploadLog.entries()) {
      const valid = list.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (valid.length === 0) ipUploadLog.delete(key);
      else ipUploadLog.set(key, valid);
    }
  }

  return true;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Megabytes

export async function POST(req) {
  try {
    // 1. Rate Limiting Check
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Upload rate limit reached (30 requests/minute). Please retry shortly.",
        },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        }
      );
    }

    // 2. Parse Multipart Form Data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided in form data." },
        { status: 400 }
      );
    }

    // 3. Validate MIME Type
    const mimeType = (file.type || "").toLowerCase();
    if (mimeType && !ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported image format (${mimeType || "unknown"}). Allowed formats: JPEG, PNG, WebP, HEIC.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Validate Size (Max 10MB)
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `Image size (${Math.round(buffer.length / (1024 * 1024))}MB) exceeds maximum allowable 10MB limit.`,
        },
        { status: 400 }
      );
    }

    if (buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Received empty file." },
        { status: 400 }
      );
    }

    const rawExt = file.name ? path.extname(file.name) || ".jpg" : ".jpg";
    const filename = `evidence_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${rawExt}`;

    // 5. Cloudinary Production Upload with Graceful Fallback
    if (isCloudinaryConfigured) {
      try {
        const cloudResult = await uploadToCloudinary(buffer, {
          filename,
          folder: process.env.CLOUDINARY_FOLDER || "bajaj_canteen/evidence",
          tags: ["bajaj_canteen", "production_evidence"],
        });

        return NextResponse.json({
          success: true,
          url: cloudResult.secure_url,
          publicId: cloudResult.public_id,
          filename,
          sizeKb: Math.round(cloudResult.bytes / 1024),
          width: cloudResult.width,
          height: cloudResult.height,
          format: cloudResult.format,
          mimeType: file.type || "image/jpeg",
          provider: "cloudinary",
        });
      } catch (cloudErr) {
        console.warn(
          "Cloudinary upload failed, triggering fallback to local storage:",
          cloudErr.message
        );
      }
    }

    // Fallback: Local Server Storage
    const uploadDir = path.join(process.cwd(), "public", "uploads", "evidence");
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/evidence/${filename}`,
      filename,
      sizeKb: Math.round(buffer.length / 1024),
      mimeType: file.type || "image/jpeg",
      provider: "local",
    });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process photo upload" },
      { status: 500 }
    );
  }
}
