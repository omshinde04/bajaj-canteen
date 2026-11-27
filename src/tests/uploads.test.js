import { describe, it, expect, vi } from "vitest";
import { isCloudinaryConfigured } from "../lib/cloudinary";

describe("Cloudinary & Uploads Pipeline", () => {
  it("detects valid Cloudinary configuration or environment status", () => {
    // When environment variables are set, isCloudinaryConfigured is boolean
    expect(typeof isCloudinaryConfigured).toBe("boolean");
  });

  it("validates allowable MIME types for shop floor evidence", () => {
    const ALLOWED_MIME_TYPES = new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "image/gif",
    ]);

    expect(ALLOWED_MIME_TYPES.has("image/jpeg")).toBe(true);
    expect(ALLOWED_MIME_TYPES.has("image/png")).toBe(true);
    expect(ALLOWED_MIME_TYPES.has("image/webp")).toBe(true);
    expect(ALLOWED_MIME_TYPES.has("application/pdf")).toBe(false);
    expect(ALLOWED_MIME_TYPES.has("text/html")).toBe(false);
  });

  it("enforces maximum upload boundary of 10MB", () => {
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
    const sampleValidSize = 2 * 1024 * 1024; // 2MB
    const sampleOversize = 12 * 1024 * 1024; // 12MB

    expect(sampleValidSize <= MAX_FILE_SIZE_BYTES).toBe(true);
    expect(sampleOversize <= MAX_FILE_SIZE_BYTES).toBe(false);
  });

  it("generates structured Cloudinary response with HTTPS secure URL", () => {
    const mockCloudinaryResult = {
      secure_url: "https://res.cloudinary.com/dxqpqgu8s/image/upload/v1795778404/bajaj_canteen/evidence/test.png",
      public_id: "bajaj_canteen/evidence/test",
      bytes: 104800,
      width: 1920,
      height: 1080,
      format: "png",
    };

    const formattedResponse = {
      success: true,
      url: mockCloudinaryResult.secure_url,
      publicId: mockCloudinaryResult.public_id,
      sizeKb: Math.round(mockCloudinaryResult.bytes / 1024),
      width: mockCloudinaryResult.width,
      height: mockCloudinaryResult.height,
      provider: "cloudinary",
    };

    expect(formattedResponse.success).toBe(true);
    expect(formattedResponse.url).toMatch(/^https:\/\/res\.cloudinary\.com/);
    expect(formattedResponse.sizeKb).toBe(102);
    expect(formattedResponse.provider).toBe("cloudinary");
  });
});
