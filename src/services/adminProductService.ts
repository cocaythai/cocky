import { supabase, isSupabaseConfigured } from './supabaseClient';
import { storageService } from './storageService';
import { SubscriptionOption, ProductHighlight, CowayProduct } from '../types/index.ts';

export interface AdminProductPayload {
  name: string;
  price: number;
  image_url: string;
  images?: string[]; // Up to 5 product images
  description?: string;
  category?: string;
  water_types?: string[];
  model_code?: string;
  tagline?: string;
  full_desc?: string;
  subscription_options?: SubscriptionOption[];
  highlights?: ProductHighlight[];
  tank_capacity?: string;
  filtration_system?: string;
  coverage_area?: string;
  dimensions?: string;
  weight?: string;
  power_consumption?: string;
  cody_cycle?: string;
  display_order?: number;
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

      // Clean base description text
      const baseDesc = (payload.description || '').replace(/<!-- COWAY_EXTENDED_SPECS:[\s\S]*? -->/g, '').trim();

      // Extended metadata object stored safely in 'description' column
      const extendedSpecsObj: Record<string, any> = {};
      if (sanitizedImages.length > 0) extendedSpecsObj.images = sanitizedImages;
      if (payload.water_types) extendedSpecsObj.water_types = payload.water_types;
      if (payload.subscription_options) extendedSpecsObj.subscription_options = payload.subscription_options;
      if (payload.highlights) extendedSpecsObj.highlights = payload.highlights;
      if (payload.tank_capacity !== undefined) extendedSpecsObj.tank_capacity = payload.tank_capacity;
      if (payload.filtration_system !== undefined) extendedSpecsObj.filtration_system = payload.filtration_system;
      if (payload.coverage_area !== undefined) extendedSpecsObj.coverage_area = payload.coverage_area;
      if (payload.dimensions !== undefined) extendedSpecsObj.dimensions = payload.dimensions;
      if (payload.weight !== undefined) extendedSpecsObj.weight = payload.weight;
      if (payload.power_consumption !== undefined) extendedSpecsObj.power_consumption = payload.power_consumption;
      if (payload.cody_cycle !== undefined) extendedSpecsObj.cody_cycle = payload.cody_cycle;
      if (payload.model_code !== undefined) extendedSpecsObj.model_code = payload.model_code;
      if (payload.tagline !== undefined) extendedSpecsObj.tagline = payload.tagline;
      if (payload.display_order !== undefined) {
        extendedSpecsObj.display_order = payload.display_order;
        extendedSpecsObj.order = payload.display_order;
      }

      const descriptionWithSpecs = Object.keys(extendedSpecsObj).length > 0
        ? `${baseDesc}\n\n<!-- COWAY_EXTENDED_SPECS:${JSON.stringify(extendedSpecsObj)} -->`
        : baseDesc;

      const insertData: any = {
        name: payload.name,
        price: Number(payload.price) || 0,
        image_url: mainImageUrl,
        description: descriptionWithSpecs,
        category: payload.category || 'water',
      };

      const { data, error } = await supabase
        .from('products')
        .insert([insertData])
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
    oldImages?: string[] | string
  ): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const targetId = !isNaN(Number(id)) ? Number(id) : id;
      const sanitizedImages = payload.images ? payload.images.slice(0, 5) : undefined;
      const mainImageUrl = sanitizedImages?.[0] || payload.image_url;

      // Clean base description text
      const baseDesc = (payload.description || '').replace(/<!-- COWAY_EXTENDED_SPECS:[\s\S]*? -->/g, '').trim();

      // Read existing specs if present to preserve other untouched metadata
      let existingSpecs: Record<string, any> = {};
      try {
        const { data: currRow } = await supabase
          .from('products')
          .select('description')
          .eq('id', targetId)
          .maybeSingle();

        if (currRow?.description && currRow.description.includes('<!-- COWAY_EXTENDED_SPECS:')) {
          const match = currRow.description.match(/<!-- COWAY_EXTENDED_SPECS:([\s\S]*?) -->/);
          if (match && match[1]) {
            existingSpecs = JSON.parse(match[1]);
          }
        }
      } catch (e) {
        console.warn('[AdminProductService] Could not fetch current product specs:', e);
      }

      // Extended metadata object to ensure persistence in 'description' column
      const extendedSpecsObj: Record<string, any> = {
        ...existingSpecs,
      };

      if (sanitizedImages && sanitizedImages.length > 0) extendedSpecsObj.images = sanitizedImages;
      if (payload.water_types !== undefined) extendedSpecsObj.water_types = payload.water_types;
      if (payload.subscription_options !== undefined) extendedSpecsObj.subscription_options = payload.subscription_options;
      if (payload.highlights !== undefined) extendedSpecsObj.highlights = payload.highlights;
      if (payload.tank_capacity !== undefined) extendedSpecsObj.tank_capacity = payload.tank_capacity;
      if (payload.filtration_system !== undefined) extendedSpecsObj.filtration_system = payload.filtration_system;
      if (payload.coverage_area !== undefined) extendedSpecsObj.coverage_area = payload.coverage_area;
      if (payload.dimensions !== undefined) extendedSpecsObj.dimensions = payload.dimensions;
      if (payload.weight !== undefined) extendedSpecsObj.weight = payload.weight;
      if (payload.power_consumption !== undefined) extendedSpecsObj.power_consumption = payload.power_consumption;
      if (payload.cody_cycle !== undefined) extendedSpecsObj.cody_cycle = payload.cody_cycle;
      if (payload.model_code !== undefined) extendedSpecsObj.model_code = payload.model_code;
      if (payload.tagline !== undefined) extendedSpecsObj.tagline = payload.tagline;
      if (payload.display_order !== undefined) {
        extendedSpecsObj.display_order = payload.display_order;
        extendedSpecsObj.order = payload.display_order;
      }

      const descriptionWithSpecs = Object.keys(extendedSpecsObj).length > 0
        ? `${baseDesc}\n\n<!-- COWAY_EXTENDED_SPECS:${JSON.stringify(extendedSpecsObj)} -->`
        : baseDesc;

      const updateData: any = {
        description: descriptionWithSpecs,
      };
      if (payload.name !== undefined) updateData.name = payload.name;
      if (payload.price !== undefined) updateData.price = Number(payload.price) || 0;
      if (mainImageUrl !== undefined) updateData.image_url = mainImageUrl;
      if (payload.category !== undefined) updateData.category = payload.category;

      let { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', targetId)
        .select();

      // Fallback try with string ID if targetId didn't match
      if (!error && (!data || data.length === 0) && typeof targetId !== 'string') {
        const retryRes = await supabase
          .from('products')
          .update(updateData)
          .eq('id', String(id))
          .select();
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error) {
        return { success: false, message: `อัปเดตไม่สำเร็จ: ${error.message}` };
      }

      if (!data || data.length === 0) {
        return { success: false, message: `ไม่พบสินค้า ID ${id} ใน Supabase Database หรือไม่มีสิทธิ์แก้ไข` };
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
   * Update order/sequence of multiple products in Supabase
   * Preserves all existing specs, highlights, and subscription options
   */
  async updateProductsOrder(
    orderedItems: { id: string; order: number; description?: string }[]
  ): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    const client = supabase;

    try {
      const updatePromises = orderedItems.map(async (item) => {
        const targetId = !isNaN(Number(item.id)) ? Number(item.id) : item.id;

        // Fetch current row to preserve existing specs completely
        let baseDesc = '';
        let extendedSpecsObj: any = {};

        try {
          const { data: curr } = await client
            .from('products')
            .select('description')
            .eq('id', targetId)
            .maybeSingle();

          const descSource = curr?.description || item.description || '';
          if (descSource.includes('<!-- COWAY_EXTENDED_SPECS:')) {
            const match = descSource.match(/<!-- COWAY_EXTENDED_SPECS:([\s\S]*?) -->/);
            if (match && match[1]) {
              try {
                extendedSpecsObj = JSON.parse(match[1]);
              } catch {}
            }
          }
          baseDesc = descSource.replace(/<!-- COWAY_EXTENDED_SPECS:[\s\S]*? -->/g, '').trim();
        } catch {
          baseDesc = (item.description || '').replace(/<!-- COWAY_EXTENDED_SPECS:[\s\S]*? -->/g, '').trim();
        }

        extendedSpecsObj.display_order = item.order;
        extendedSpecsObj.order = item.order;

        const updateData: any = {
          description: `${baseDesc}\n\n<!-- COWAY_EXTENDED_SPECS:${JSON.stringify(extendedSpecsObj)} -->`,
        };

        let { error } = await client
          .from('products')
          .update(updateData)
          .eq('id', targetId);

        if (error && typeof targetId !== 'string') {
          const retryRes = await client
            .from('products')
            .update(updateData)
            .eq('id', String(item.id));
          error = retryRes.error;
        }

        if (error) {
          console.warn(`[AdminProductService] Failed to update order for product ${item.id}:`, error.message);
        }
        return !error;
      });

      const results = await Promise.all(updatePromises);
      const successCount = results.filter(Boolean).length;

      if (successCount === orderedItems.length) {
        return { success: true, message: 'บันทึกลำดับสินค้าลง Supabase สำเร็จเรียบร้อยแล้ว!' };
      } else {
        return {
          success: true,
          message: `บันทึกลำดับสินค้าสำเร็จ (${successCount}/${orderedItems.length} รายการ)`,
        };
      }
    } catch (err: any) {
      return { success: false, message: `เกิดข้อผิดพลาดในการบันทึกลำดับสินค้า: ${err.message}` };
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

