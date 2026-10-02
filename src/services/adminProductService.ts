import { supabase, isSupabaseConfigured } from './supabaseClient';
import { storageService } from './storageService';
import { CowayProduct } from '../types/index.ts';

export interface AdminProductPayload {
  name: string;
  price: number;
  image_url: string;
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
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: payload.name,
            price: Number(payload.price) || 0,
            image_url: payload.image_url,
            description: payload.description || '',
            category: payload.category || 'water',
          },
        ])
        .select()
        .single();

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
    oldImageUrl?: string
  ): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: payload.name,
          price: Number(payload.price) || 0,
          image_url: payload.image_url,
          description: payload.description,
          category: payload.category,
        })
        .eq('id', id);

      if (error) {
        return { success: false, message: `อัปเดตไม่สำเร็จ: ${error.message}` };
      }

      // If image changed and previous image was stored in Supabase Storage, delete old image
      if (oldImageUrl && payload.image_url && oldImageUrl !== payload.image_url) {
        storageService.deleteImageByUrl(oldImageUrl).catch((err) => {
          console.warn('[AdminProductService] Failed to clean up old product image:', err);
        });
      }

      return { success: true, message: 'บันทึกการแก้ไขสินค้าสำเร็จ!' };
    } catch (err: any) {
      return { success: false, message: `เกิดข้อผิดพลาด: ${err.message}` };
    }
  }

  /**
   * Delete product from Supabase table 'products' and clean up image from storage
   */
  async deleteProduct(id: string | number, imageUrl?: string): Promise<{ success: boolean; message: string }> {
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

      // Clean up image file from Supabase storage if applicable
      if (imageUrl) {
        storageService.deleteImageByUrl(imageUrl).catch((err) => {
          console.warn('[AdminProductService] Failed to clean up deleted product image:', err);
        });
      }

      return { success: true, message: 'ลบสินค้าเรียบร้อยแล้ว' };
    } catch (err: any) {
      return { success: false, message: `เกิดข้อผิดพลาด: ${err.message}` };
    }
  }
}

export const adminProductService = new AdminProductService();

