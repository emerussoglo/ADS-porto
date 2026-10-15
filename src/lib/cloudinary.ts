import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { Readable } from "node:stream";

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("La configuration Cloudinary est incomplète.");
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

export async function uploadPrivateFile(
  file: File,
  publicId: string,
  resourceType: "image" | "raw",
): Promise<UploadApiResponse> {
  configureCloudinary();
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
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
}

export function getPrivateFileUrl(
  publicId: string,
  resourceType: "image" | "raw",
  version: string | number,
  format?: string,
) {
  configureCloudinary();
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type: "private",
    version: Number(version),
    format,
    secure: true,
    sign_url: true,
  });
}

export async function deletePrivateFile(
  publicId: string,
  resourceType: "image" | "raw",
) {
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type: "private",
    invalidate: true,
  });
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
