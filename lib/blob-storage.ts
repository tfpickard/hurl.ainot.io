import { put, del, list } from '@vercel/blob';

export interface BlobUploadResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

/**
 * Upload an image from a URL to Vercel Blob Storage
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  pathname: string
): Promise<BlobUploadResult> {
  try {
    // Fetch the image from the URL
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();

    // Upload to Vercel Blob
    const result = await put(pathname, blob, {
      access: 'public',
      contentType: blob.type || 'image/png',
    });

    return {
      url: result.url,
      pathname: result.pathname,
      contentType: result.contentType || blob.type,
      size: blob.size,
    };
  } catch (error: any) {
    console.error('Blob upload failed:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Upload a buffer to Vercel Blob Storage
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  pathname: string,
  contentType: string = 'image/png'
): Promise<BlobUploadResult> {
  try {
    const result = await put(pathname, buffer, {
      access: 'public',
      contentType,
    });

    return {
      url: result.url,
      pathname: result.pathname,
      contentType: result.contentType || contentType,
      size: buffer.length,
    };
  } catch (error: any) {
    console.error('Blob upload failed:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Delete an image from Vercel Blob Storage
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error: any) {
    console.error('Blob deletion failed:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * List all blobs with optional prefix
 */
export async function listImages(prefix?: string): Promise<Array<{
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}>> {
  try {
    const { blobs } = await list({
      ...(prefix && { prefix }),
    });

    return blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }));
  } catch (error: any) {
    console.error('Blob listing failed:', error);
    throw new Error(`Failed to list images: ${error.message}`);
  }
}

/**
 * Generate a pathname for a story cover image
 */
export function generateCoverImagePath(storyId: string, timestamp?: number): string {
  const ts = timestamp || Date.now();
  return `covers/${storyId}-${ts}.png`;
}

/**
 * Calculate total storage used in MB
 */
export async function getTotalStorageUsedMb(): Promise<number> {
  try {
    const images = await listImages();
    const totalBytes = images.reduce((sum, img) => sum + img.size, 0);
    return totalBytes / (1024 * 1024); // Convert to MB
  } catch (error) {
    console.error('Failed to calculate storage:', error);
    return 0;
  }
}
