import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary SDK
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Upload a Buffer or Base64 string directly to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Upload options (folder, filename, tags, etc.)
 * @returns {Promise<Object>} Cloudinary upload result
 */
export async function uploadToCloudinary(buffer, options = {}) {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary credentials are not configured in environment");
  }

  const folder = options.folder || process.env.CLOUDINARY_FOLDER || "bajaj_canteen/evidence";
  const publicId = options.filename
    ? options.filename.replace(/\.[^/.]+$/, "") // strip extension
    : `evidence_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        transformation: [
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
        tags: options.tags || ["bajaj_canteen", "floor_evidence"],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete an asset from Cloudinary by public ID
 * @param {string} publicId
 * @returns {Promise<Object>}
 */
export async function deleteFromCloudinary(publicId) {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured");
  }
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
