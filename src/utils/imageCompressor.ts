/**
 * Client-side image resizing and compression utility
 * Compresses images before uploading to Supabase Storage to ensure fast upload & fast page load.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/webp' | 'image/jpeg';
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<{ file: File; originalSize: number; compressedSize: number; previewUrl: string }> {
  const {
    maxWidth = 1600,
    maxHeight = 1200,
    quality = 0.82,
    mimeType = 'image/webp',
  } = options;

  const originalSize = file.size;

  // If already SVG or tiny file (< 50KB), no need to compress
  if (file.type === 'image/svg+xml' || (file.size < 50 * 1024 && file.type === 'image/webp')) {
    const previewUrl = URL.createObjectURL(file);
    return { file, originalSize, compressedSize: file.size, previewUrl };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('ไม่สามารถประมวลผลไฟล์รูปภาพได้'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const previewUrl = URL.createObjectURL(file);
          resolve({ file, originalSize, compressedSize: file.size, previewUrl });
          return;
        }

        // Optional: Fill white background for transparent PNG converted to JPEG
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try converting to webp (or fallback to jpeg if webp not supported)
        const targetType = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
          ? mimeType
          : 'image/jpeg';

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              const previewUrl = URL.createObjectURL(file);
              resolve({ file, originalSize, compressedSize: file.size, previewUrl });
              return;
            }

            const ext = targetType === 'image/webp' ? 'webp' : 'jpg';
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
            const compressedFileName = `${baseName}.${ext}`;

            const compressedFile = new File([blob], compressedFileName, {
              type: targetType,
              lastModified: Date.now(),
            });

            const previewUrl = URL.createObjectURL(compressedFile);

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize: compressedFile.size,
              previewUrl,
            });
          },
          targetType,
          quality
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to readable string (e.g. 1.2 MB or 250 KB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
