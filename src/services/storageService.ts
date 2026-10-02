import { supabase, isSupabaseConfigured } from './supabaseClient';
import { compressImage } from '../utils/imageCompressor';

export const STORAGE_BUCKET = 'website-assets';

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
   * @param folder Destination subfolder in bucket ('banners' | 'products' | 'articles' | 'logo')
   * @param oldUrl Optional previous image URL to remove after successful upload
   */
  async uploadImage(
    file: File,
    folder: 'banners' | 'products' | 'articles' | 'logo' = 'products',
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

      // 4. Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, compressedFile, {
          cacheControl: '31536000', // 1 year cache for performance
          upsert: true,
          contentType: compressedFile.type,
        });

      if (uploadError) {
        console.error('[StorageService] Upload error:', uploadError);
        let errorMsg = uploadError.message;
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
          errorMsg = `ยังไม่พบ Storage Bucket "${STORAGE_BUCKET}" ใน Supabase (กรุณาสร้าง Bucket ชื่อ website-assets และเปิด Public)`;
        } else if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
          errorMsg = 'ไม่มีสิทธิ์อัปโหลดรูปภาพ กรุณาตรวจสอบ RLS Policy ของ Storage ใน Supabase';
        }
        return {
          success: false,
          error: errorMsg,
        };
      }

      // 5. Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(data.path);

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
        path: data.path,
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
   * Only deletes if URL belongs to our Supabase Storage bucket 'website-assets'.
   * Never deletes external URLs (such as Unsplash, CDN, etc.).
   */
  async deleteImageByUrl(url: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase || !url) return false;

    if (!this.isSupabaseStorageUrl(url)) {
      // Not a Supabase storage URL (e.g. Unsplash stock photo) -> do not attempt deletion
      return false;
    }

    try {
      const path = this.extractPathFromUrl(url);
      if (!path) return false;

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([path]);

      if (error) {
        console.warn(`[StorageService] Failed to remove ${path}:`, error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.warn('[StorageService] Exception deleting image:', err);
      return false;
    }
  }

  /**
   * Check if a URL belongs to this project's Supabase Storage bucket
   */
  isSupabaseStorageUrl(url: string): boolean {
    if (!url) return false;
    return (
      url.includes('/storage/v1/object/public/' + STORAGE_BUCKET) ||
      (url.includes('supabase.co') && url.includes(STORAGE_BUCKET))
    );
  }

  /**
   * Extract internal path from a Supabase Storage public URL
   * Example: https://xyz.supabase.co/storage/v1/object/public/website-assets/products/123.webp
   * Returns: 'products/123.webp'
   */
  extractPathFromUrl(url: string): string | null {
    try {
      const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
      const idx = url.indexOf(marker);
      if (idx !== -1) {
        return decodeURIComponent(url.substring(idx + marker.length));
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const storageService = new StorageService();
