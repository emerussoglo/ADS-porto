import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { Readable } from "node:stream";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  return true;
}

export async function uploadPrivateFile(
  file: File,
  publicId: string,
  resourceType: "image" | "raw",
): Promise<UploadApiResponse> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || (resourceType === "raw" ? "application/pdf" : "image/jpeg");
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const isConfigured = configureCloudinary();
  if (!isConfigured) {
    return {
      public_id: dataUri,
      version: 1,
      format: file.name.split(".").pop() || "png",
      resource_type: resourceType,
      created_at: new Date().toISOString(),
      bytes: buffer.byteLength,
      type: "private",
      url: dataUri,
      secure_url: dataUri,
    } as UploadApiResponse;
  }

  try {
    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: resourceType,
          type: "private",
          overwrite: false,
          unique_filename: false,
          use_filename: false,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error("Cloudinary n’a pas retourné le fichier téléversé."));
          }
        },
      );

      Readable.from(buffer).pipe(stream);
    });
  } catch (error) {
    console.warn("Échec upload Cloudinary, repli sur dataUri :", error);
    return {
      public_id: dataUri,
      version: 1,
      format: file.name.split(".").pop() || "png",
      resource_type: resourceType,
      created_at: new Date().toISOString(),
      bytes: buffer.byteLength,
      type: "private",
      url: dataUri,
      secure_url: dataUri,
    } as UploadApiResponse;
  }
}

export function getPrivateFileUrl(
  publicId: string,
  resourceType: "image" | "raw",
  version: string | number,
  format?: string,
) {
  if (!publicId) return null;
  if (publicId.startsWith("data:") || publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId;
  }
  const isConfigured = configureCloudinary();
  if (!isConfigured) {
    return null;
  }
  try {
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      type: "private",
      version: Number(version),
      format,
      secure: true,
      sign_url: true,
    });
  } catch {
    return null;
  }
}

export async function deletePrivateFile(
  publicId: string,
  resourceType: "image" | "raw",
) {
  if (!publicId || publicId.startsWith("data:")) return;
  const isConfigured = configureCloudinary();
  if (!isConfigured) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type: "private",
      invalidate: true,
    });
  } catch (err) {
    console.warn("Impossible de supprimer le fichier Cloudinary :", err);
  }
}

export function isValidFileSignature(
  bytes: Uint8Array,
  mimeType: string,
): boolean {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }
  if (mimeType === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  if (mimeType === "application/pdf") {
    return String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  }
  return false;
}
