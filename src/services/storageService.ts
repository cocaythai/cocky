import { supabase, isSupabaseConfigured } from './supabaseClient';
import { compressImage } from '../utils/imageCompressor';

export const STORAGE_BUCKET = 'site-images';
const FALLBACK_BUCKET = 'website-assets';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  originalSize?: number;
  compressedSize?: number;
  error?: string;
}

class StorageService {
  /**
   * Upload an image file to Supabase Storage after client-side compression
   * @param file User-selected file from mobile or desktop
   * @param folder Destination subfolder in bucket ('banners' | 'articles' | 'knowledge' | 'reviews' | 'products' | 'logo')
   * @param oldUrl Optional previous image URL to remove after successful upload
   */
  async uploadImage(
    file: File,
    folder: 'banners' | 'articles' | 'knowledge' | 'reviews' | 'products' | 'logo' = 'products',
    oldUrl?: string
  ): Promise<UploadResult> {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        error: 'ยังไม่ได้เชื่อมต่อ Supabase หรือขาดการตั้งค่า Environment Variables',
      };
    }

    try {
      // 1. Verify that user is currently authenticated with Supabase Auth
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
        quality: 0.82,
        mimeType: 'image/webp',
      });

      const compressedFile = compressionResult.file;

      // 3. Generate clean, unique filename
      const fileExt = compressedFile.name.split('.').pop() || 'webp';
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const filePath = `${folder}/${timestamp}-${randomStr}.${fileExt}`;

      // 4. Try primary bucket 'site-images'
      let targetBucket = STORAGE_BUCKET;
      let uploadResult = await supabase.storage
        .from(targetBucket)
        .upload(filePath, compressedFile, {
          cacheControl: '31536000',
          upsert: true,
          contentType: compressedFile.type,
        });

      // If bucket 'site-images' not found, fallback to 'website-assets'
      if (uploadResult.error && (uploadResult.error.message.includes('Bucket not found') || uploadResult.error.message.includes('bucket'))) {
        targetBucket = FALLBACK_BUCKET;
        uploadResult = await supabase.storage
          .from(targetBucket)
          .upload(filePath, compressedFile, {
            cacheControl: '31536000',
            upsert: true,
            contentType: compressedFile.type,
          });
      }

      if (uploadResult.error) {
        console.error('[StorageService] Upload error:', uploadResult.error);
        let errorMsg = uploadResult.error.message;
        if (uploadResult.error.message.includes('Bucket not found') || uploadResult.error.message.includes('bucket')) {
          errorMsg = `ยังไม่พบ Storage Bucket "${STORAGE_BUCKET}" ใน Supabase (กรุณาสร้าง Bucket ชื่อ site-images และเปิด Public ใน Supabase Storage Dashboard)`;
        } else if (uploadResult.error.message.includes('row-level security') || uploadResult.error.message.includes('policy')) {
          errorMsg = 'ไม่มีสิทธิ์อัปโหลดรูปภาพ กรุณาตรวจสอบ RLS Policy ของ Storage ใน Supabase';
        }
        return {
          success: false,
          error: errorMsg,
        };
      }

      // 5. Get public URL
      const { data: urlData } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(uploadResult.data.path);

      const newPublicUrl = urlData.publicUrl;

      // 6. If replacing an existing image, safely delete old file from storage to free up space
      if (oldUrl && this.isSupabaseStorageUrl(oldUrl)) {
        this.deleteImageByUrl(oldUrl).catch((err) => {
          console.warn('[StorageService] Could not remove old file:', err);
        });
      }

      return {
        success: true,
        url: newPublicUrl,
        path: uploadResult.data.path,
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
   */
  async deleteImageByUrl(url: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase || !url) return false;

    try {
      const bucketPattern = new RegExp(`/(?:${STORAGE_BUCKET}|${FALLBACK_BUCKET})/([^?]+)`);
      const match = url.match(bucketPattern);
      if (!match || !match[1]) return false;

      const path = decodeURIComponent(match[1]);
      const activeBucket = url.includes(`/${STORAGE_BUCKET}/`) ? STORAGE_BUCKET : FALLBACK_BUCKET;

      const { error } = await supabase.storage.from(activeBucket).remove([path]);
      if (error) {
        console.warn(`[StorageService] Failed to delete image from bucket "${activeBucket}":`, error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[StorageService] Exception while deleting image:', err);
      return false;
    }
  }

  /**
   * Upload multiple images sequentially or in parallel
   */
  async uploadMultipleImages(
    files: File[],
    folder: 'banners' | 'articles' | 'knowledge' | 'reviews' | 'products' | 'logo' = 'products',
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
   * Check if a URL points to our Supabase Storage bucket
   */
  isSupabaseStorageUrl(url?: string): boolean {
    if (!url) return false;
    return (
      (url.includes(`/${STORAGE_BUCKET}/`) || url.includes(`/${FALLBACK_BUCKET}/`)) &&
      url.includes('supabase.co/storage/v1/object/public/')
    );
  }
}

export const storageService = new StorageService();
