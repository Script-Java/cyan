/**
 * Optional image processor using sharp
 * Falls back gracefully if sharp is not available (e.g., in Netlify Functions)
 */

interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
}

let sharpAvailable = false;
let Sharp: any = null;

// Try to load sharp, but don't fail if it's not available
try {
  Sharp = require("sharp");
  sharpAvailable = true;
} catch (error) {
  console.warn(
    "Sharp not available - using original image format. This is expected in serverless environments like Netlify.",
  );
}

/**
 * Process image: resize and compress using sharp (if available)
 * If sharp is not available, returns the original buffer unchanged
 * @param buffer - Image buffer to process
 * @param maxWidth - Maximum width (default: 500)
 * @param maxHeight - Maximum height (default: 500)
 * @returns Processed image buffer or original if sharp unavailable
 */
export async function processImage(
  buffer: Buffer,
  maxWidth: number = 500,
  maxHeight: number = 500,
): Promise<Buffer> {
  if (!sharpAvailable || !Sharp) {
    console.log(
      "Image processing skipped - sharp not available. Image will be uploaded as-is.",
    );
    return buffer;
  }

  try {
    const processed = await Sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: "cover",
        withoutEnlargement: false,
      })
      .webp({ quality: 80 })
      .toBuffer();

    console.log(
      `Image processed successfully: ${buffer.length} -> ${processed.length} bytes`,
    );
    return processed;
  } catch (error) {
    console.error("Error processing image with sharp:", error);
    // Return original buffer if processing fails
    return buffer;
  }
}

/**
 * Check if sharp is available in current environment
 */
export function isSharpAvailable(): boolean {
  return sharpAvailable && Sharp !== null;
}
