import { supabase, isSupabaseConfigured } from './supabaseClient';
import { storageService } from './storageService';
import { CowayProduct } from '../types/index.ts';

export interface AdminProductPayload {
  name: string;
  price: number;
  image_url: string;
  images?: string[]; // Up to 5 product images
  description?: string;
  category?: string;
}

class AdminProductService {
  /**
   * Create a new product in Supabase table 'products'
   */
  async createProduct(payload: AdminProductPayload): Promise<{ success: boolean; data?: any; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const sanitizedImages = (payload.images || [payload.image_url]).slice(0, 5);
      const mainImageUrl = sanitizedImages[0] || payload.image_url;

      // 1. Attempt insert with images array
      let insertData: any = {
        name: payload.name,
        price: Number(payload.price) || 0,
        image_url: mainImageUrl,
        images: sanitizedImages,
        description: payload.description || '',
        category: payload.category || 'water',
      };

      let { data, error } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .single();

      // If 'images' column doesn't exist yet in Supabase table, retry without 'images' column
      if (error && (error.message.includes('images') || error.code === '42703')) {
        console.warn('[AdminProductService] Column "images" not found, falling back to image_url only:', error.message);
        delete insertData.images;
        const retryResult = await supabase
          .from('products')
          .insert([insertData])
          .select()
          .single();
        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        return { success: false, message: `เพิ่มสินค้าไม่สำเร็จ: ${error.message}` };
      }

      return { success: true, data, message: `เพิ่มสินค้า "${payload.name}" สำเร็จ!` };
    } catch (err: any) {
      return { success: false, message: `เกิดข้อผิดพลาด: ${err.message}` };
    }
  }

  /**
   * Update an existing product in Supabase table 'products'
   */
  async updateProduct(
    id: string | number,
    payload: Partial<AdminProductPayload>,
    oldImages?: string[] | string
  ): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const sanitizedImages = payload.images ? payload.images.slice(0, 5) : undefined;
      const mainImageUrl = sanitizedImages?.[0] || payload.image_url;

      let updateData: any = {
        name: payload.name,
        price: Number(payload.price) || 0,
        image_url: mainImageUrl,
        description: payload.description,
        category: payload.category,
      };

      if (sanitizedImages) {
        updateData.images = sanitizedImages;
      }

      let { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      // If 'images' column doesn't exist yet, retry without 'images' column
      if (error && (error.message.includes('images') || error.code === '42703')) {
        console.warn('[AdminProductService] Column "images" not found during update, falling back to image_url only:', error.message);
        delete updateData.images;
        const retryResult = await supabase
          .from('products')
          .update(updateData)
          .eq('id', id);
        error = retryResult.error;
      }

      if (error) {
        return { success: false, message: `อัปเดตไม่สำเร็จ: ${error.message}` };
      }

      // Clean up removed images from Supabase Storage so no orphaned files accumulate
      const oldList: string[] = Array.isArray(oldImages)
        ? oldImages
        : oldImages
        ? [oldImages]
        : [];
      const currentList: string[] = sanitizedImages || (mainImageUrl ? [mainImageUrl] : []);

      const removedUrls = oldList.filter((url) => url && !currentList.includes(url));
      if (removedUrls.length > 0) {
        storageService.deleteMultipleImagesByUrl(removedUrls).catch((err) => {
          console.warn('[AdminProductService] Failed to clean up removed images from storage:', err);
        });
      }

      return { success: true, message: 'บันทึกการแก้ไขสินค้าสำเร็จ!' };
    } catch (err: any) {
      return { success: false, message: `เกิดข้อผิดพลาด: ${err.message}` };
    }
  }

  /**
   * Delete product from Supabase table 'products' and clean up all its images from storage
   */
  async deleteProduct(id: string | number, imagesOrUrl?: string[] | string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, message: `ลบสินค้าไม่สำเร็จ: ${error.message}` };
      }

      // Clean up all images from Supabase storage if applicable
      const toDelete: string[] = Array.isArray(imagesOrUrl)
        ? imagesOrUrl
        : imagesOrUrl
        ? [imagesOrUrl]
        : [];

      if (toDelete.length > 0) {
        storageService.deleteMultipleImagesByUrl(toDelete).catch((err) => {
          console.warn('[AdminProductService] Failed to clean up deleted product images:', err);
        });
      }

      return { success: true, message: 'ลบสินค้าเรียบร้อยแล้ว' };
    } catch (err: any) {
      return { success: false, message: `เกิดข้อผิดพลาด: ${err.message}` };
    }
  }
}

export const adminProductService = new AdminProductService();

