import { supabase, isSupabaseConfigured } from './supabaseClient';
import { compressImage } from '../utils/imageCompressor';

// Bucket names priority: Primary uppercase 'SITE-IMAGES' as requested by user,
// with lowercase 'site-images' and 'website-assets' as fallbacks
export const PRIMARY_STORAGE_BUCKET = 'SITE-IMAGES';
export const ALT_STORAGE_BUCKET = 'site-images';
export const FALLBACK_STORAGE_BUCKET = 'website-assets';
export const STORAGE_BUCKET = PRIMARY_STORAGE_BUCKET;

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  bucket?: string;
  originalSize?: number;
  compressedSize?: number;
  error?: string;
}

class StorageService {
  private activeBucketName: string | null = null;

  /**
   * Upload an image file to Supabase Storage Bucket (SITE-IMAGES) after client-side compression
   * @param file User-selected file from mobile or desktop
   * @param folder Destination subfolder in bucket ('banners' | 'articles' | 'knowledge' | 'reviews' | 'products' | 'logo')
   * @param oldUrl Optional previous image URL to remove after successful upload to prevent storage waste
   */
  async uploadImage(
    file: File,
    folder: 'banners' | 'articles' | 'knowledge' | 'reviews' | 'products' | 'logo' = 'products',
    oldUrl?: string
  ): Promise<UploadResult> {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        error: 'ยังไม่ได้เชื่อมต่อ Supabase หรือขาดการตั้งค่า Environment Variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)',
      };
    }

    // Guard against Base64 inputs
    if (typeof file === 'string' && ((file as string).startsWith('data:') || (file as string).includes('base64,'))) {
      return {
        success: false,
        error: 'ไม่อนุญาตให้อัปโหลด Base64 กรุณาเลือกไฟล์รูปภาพจริงเพื่อจัดเก็บใน Supabase Storage (SITE-IMAGES)',
      };
    }

    try {
      // 1. Verify user authentication with Supabase Auth
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return {
          success: false,
          error: 'กรุณาเข้าสู่ระบบ Admin ก่อนทำการอัปโหลดรูปภาพ (Supabase Auth)',
        };
      }

      // 2. Client-side image compression
      const isBanner = folder === 'banners';
      const compressionResult = await compressImage(file, {
        maxWidth: isBanner ? 1920 : 1000,
        maxHeight: isBanner ? 1080 : 1000,
        quality: 0.85,
        mimeType: 'image/webp',
      });

      const compressedFile = compressionResult.file;

      // 3. Generate clean, unique filename
      const fileExt = compressedFile.name.split('.').pop() || 'webp';
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const filePath = `${folder}/${timestamp}-${randomStr}.${fileExt}`;

      // 4. Try upload with bucket prioritization:
      // First try SITE-IMAGES -> then site-images -> then website-assets
      const candidateBuckets = [
        this.activeBucketName || PRIMARY_STORAGE_BUCKET,
        PRIMARY_STORAGE_BUCKET,
        ALT_STORAGE_BUCKET,
        FALLBACK_STORAGE_BUCKET,
      ].filter((v, idx, arr) => arr.indexOf(v) === idx);

      let lastError: any = null;
      let finalPath: string | null = null;
      let successBucket: string | null = null;

      for (const bucket of candidateBuckets) {
        try {
          const uploadRes = await supabase.storage
            .from(bucket)
            .upload(filePath, compressedFile, {
              cacheControl: '31536000',
              upsert: true,
              contentType: compressedFile.type,
            });

          if (!uploadRes.error && uploadRes.data?.path) {
            finalPath = uploadRes.data.path;
            successBucket = bucket;
            this.activeBucketName = bucket;
            break;
          } else if (uploadRes.error) {
            lastError = uploadRes.error;
            // If it is NOT a "bucket not found" error, don't try other buckets
            const msg = uploadRes.error.message?.toLowerCase() || '';
            if (!msg.includes('not found') && !msg.includes('bucket')) {
              break;
            }
          }
        } catch (candidateErr) {
          lastError = candidateErr;
        }
      }

      if (!finalPath || !successBucket) {
        console.error('[StorageService] Upload error:', lastError);
        let errorMsg = lastError?.message || 'อัปโหลดรูปภาพไม่สำเร็จ';
        const lowerMsg = errorMsg.toLowerCase();
        if (lowerMsg.includes('bucket not found') || lowerMsg.includes('bucket')) {
          errorMsg = `ยังไม่พบ Storage Bucket "${PRIMARY_STORAGE_BUCKET}" ใน Supabase (กรุณาสร้าง Bucket ชื่อ SITE-IMAGES และเปิดเป็น Public Bucket ในเมนู Storage)`;
        } else if (lowerMsg.includes('row-level security') || lowerMsg.includes('policy')) {
          errorMsg = 'ไม่มีสิทธิ์อัปโหลดรูปภาพ กรุณาตรวจสอบ RLS Policy ของ Bucket SITE-IMAGES ใน Supabase SQL Editor';
        }
        return {
          success: false,
          error: errorMsg,
        };
      }

      // 5. Get public URL from Supabase Storage
      const { data: urlData } = supabase.storage
        .from(successBucket)
        .getPublicUrl(finalPath);

      const newPublicUrl = urlData.publicUrl;

      // 6. When replacing an existing image, safely delete old file from storage to prevent orphaned files
      if (oldUrl && this.isSupabaseStorageUrl(oldUrl)) {
        this.deleteImageByUrl(oldUrl).catch((err) => {
          console.warn('[StorageService] Could not remove old file:', err);
        });
      }

      return {
        success: true,
        url: newPublicUrl,
        path: finalPath,
        bucket: successBucket,
        originalSize: compressionResult.originalSize,
        compressedSize: compressionResult.compressedSize,
      };
    } catch (err: any) {
      console.error('[StorageService] Exception during upload:', err);
      return {
        success: false,
        error: err.message || 'เกิดข้อผิดพลาดในการประมวลผลหรืออัปโหลดรูปภาพ',
      };
    }
  }

  /**
   * Delete an image from Supabase Storage by its full public URL
   * Extracts the bucket name dynamically so it supports 'SITE-IMAGES', 'site-images', etc.
   */
  async deleteImageByUrl(url: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase || !url) return false;

    // Do not delete local assets, base64 strings, or blobs
    if (url.startsWith('data:') || url.startsWith('/') || url.startsWith('blob:')) {
      return false;
    }

    try {
      // Format: https://<project-id>.supabase.co/storage/v1/object/public/<bucket>/<path>
      const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+?)(?:\?.*)?$/);
      if (!match || !match[1] || !match[2]) {
        return false;
      }

      const bucketName = match[1];
      const rawPath = match[2];
      const filePath = decodeURIComponent(rawPath);

      const { error } = await supabase.storage.from(bucketName).remove([filePath]);
      if (error) {
        console.warn(`[StorageService] Failed to delete image from bucket "${bucketName}":`, error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.warn('[StorageService] Exception while deleting image:', err);
      return false;
    }
  }

  /**
   * Upload multiple images sequentially with progress tracking
   */
  async uploadMultipleImages(
    files: File[],
    folder: 'banners' | 'articles' | 'knowledge' | 'reviews' | 'products' | 'logo' = 'banners',
    onProgress?: (completed: number, total: number) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    let completed = 0;
    for (const file of files) {
      const res = await this.uploadImage(file, folder);
      results.push(res);
      completed++;
      if (onProgress) {
        onProgress(completed, files.length);
      }
    }
    return results;
  }

  /**
   * Delete multiple images by their URLs
   */
  async deleteMultipleImagesByUrl(urls: string[]): Promise<number> {
    let deletedCount = 0;
    for (const url of urls) {
      if (this.isSupabaseStorageUrl(url)) {
        const ok = await this.deleteImageByUrl(url);
        if (ok) deletedCount++;
      }
    }
    return deletedCount;
  }

  /**
   * Check if a URL points to a Supabase Storage bucket
   */
  isSupabaseStorageUrl(url?: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.includes('/storage/v1/object/public/') &&
      (lower.includes('/site-images/') || lower.includes('/website-assets/'))
    );
  }

  /**
   * Helper to inspect current storage status
   */
  getActiveBucket(): string {
    return this.activeBucketName || PRIMARY_STORAGE_BUCKET;
  }
}

export const storageService = new StorageService();
