const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface PreparedImageFile {
  base64: string;
  mimeType: string;
  previewUrl: string;
  name: string;
  sizeLabel: string;
}

export async function readImageFile(file: File): Promise<PreparedImageFile> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Please upload a JPEG, PNG, WebP, or GIF image.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read image file."));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });

  const mimeType = file.type || "image/jpeg";
  const previewUrl = URL.createObjectURL(file);

  return {
    base64,
    mimeType,
    previewUrl,
    name: file.name,
    sizeLabel: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
  };
}

export function revokeImagePreview(previewUrl?: string) {
  if (previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl);
  }
}
