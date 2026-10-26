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

      // Extended metadata object to ensure persistence in 'description' column if extended columns don't exist in Supabase
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

      const descriptionWithSpecs = Object.keys(extendedSpecsObj).length > 0
        ? `${baseDesc}\n\n<!-- COWAY_EXTENDED_SPECS:${JSON.stringify(extendedSpecsObj)} -->`
        : baseDesc;

      let insertData: any = {
        name: payload.name,
        price: Number(payload.price) || 0,
        image_url: mainImageUrl,
        images: sanitizedImages,
        description: descriptionWithSpecs,
        category: payload.category || 'water',
      };

      if (payload.water_types && payload.water_types.length > 0) insertData.water_types = payload.water_types;
      if (payload.subscription_options) insertData.subscription_options = payload.subscription_options;
      if (payload.highlights) insertData.highlights = payload.highlights;
      if (payload.tank_capacity !== undefined) insertData.tank_capacity = payload.tank_capacity;
      if (payload.filtration_system !== undefined) insertData.filtration_system = payload.filtration_system;
      if (payload.coverage_area !== undefined) insertData.coverage_area = payload.coverage_area;
      if (payload.dimensions !== undefined) insertData.dimensions = payload.dimensions;
      if (payload.weight !== undefined) insertData.weight = payload.weight;
      if (payload.power_consumption !== undefined) insertData.power_consumption = payload.power_consumption;
      if (payload.cody_cycle !== undefined) insertData.cody_cycle = payload.cody_cycle;
      if (payload.model_code !== undefined) insertData.model_code = payload.model_code;
      if (payload.tagline !== undefined) insertData.tagline = payload.tagline;

      let retries = 0;
      const maxRetries = 20;
      let lastError: any = null;

      while (retries < maxRetries) {
        const { data, error } = await supabase
          .from('products')
          .insert([insertData])
          .select()
          .single();

        if (!error) {
          return { success: true, data, message: `เพิ่มสินค้า "${payload.name}" สำเร็จ!` };
        }

        lastError = error;
        console.warn(`[AdminProductService] Insert attempt ${retries + 1} error:`, error.message);

        // Detect missing column from PostgREST error message
        const missingColMatch = error.message.match(/Could not find the '([^']+)' column/i) || 
                                error.message.match(/'([^']+)' column/i) ||
                                error.message.match(/column '([^']+)'/i);

        let strippedKey = false;
        if (missingColMatch && missingColMatch[1]) {
          const colName = missingColMatch[1];
          if (colName in insertData) {
            console.warn(`[AdminProductService] Stripping missing column '${colName}' from insert payload`);
            delete insertData[colName];
            strippedKey = true;
          }
        }

        if (!strippedKey) {
          // Fallback: check all non-core keys in insertData against error message
          const coreKeys = ['name', 'price', 'image_url', 'description', 'category'];
          for (const key of Object.keys(insertData)) {
            if (coreKeys.includes(key)) continue;
            if (error.message.includes(key)) {
              console.warn(`[AdminProductService] Stripping missing key '${key}' from insert payload`);
              delete insertData[key];
              strippedKey = true;
              break;
            }
          }
        }

        if (!strippedKey) {
          // No recognizable column to strip, stop retry loop
          break;
        }

        retries++;
      }

      return { success: false, message: `เพิ่มสินค้าไม่สำเร็จ: ${lastError?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'}` };
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

      // Clean base description text
      const baseDesc = (payload.description || '').replace(/<!-- COWAY_EXTENDED_SPECS:[\s\S]*? -->/g, '').trim();

      // Extended metadata object to ensure persistence in 'description' column
      const extendedSpecsObj: Record<string, any> = {};
      if (sanitizedImages && sanitizedImages.length > 0) extendedSpecsObj.images = sanitizedImages;
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

      const descriptionWithSpecs = Object.keys(extendedSpecsObj).length > 0
        ? `${baseDesc}\n\n<!-- COWAY_EXTENDED_SPECS:${JSON.stringify(extendedSpecsObj)} -->`
        : baseDesc;

      let updateData: any = {};
      if (payload.name !== undefined) updateData.name = payload.name;
      if (payload.price !== undefined) updateData.price = Number(payload.price) || 0;
      if (mainImageUrl !== undefined) updateData.image_url = mainImageUrl;
      if (payload.description !== undefined) updateData.description = descriptionWithSpecs;
      if (payload.category !== undefined) updateData.category = payload.category;

      if (sanitizedImages) updateData.images = sanitizedImages;
      if (payload.water_types) updateData.water_types = payload.water_types;
      if (payload.subscription_options) updateData.subscription_options = payload.subscription_options;
      if (payload.highlights) updateData.highlights = payload.highlights;
      if (payload.tank_capacity !== undefined) updateData.tank_capacity = payload.tank_capacity;
      if (payload.filtration_system !== undefined) updateData.filtration_system = payload.filtration_system;
      if (payload.coverage_area !== undefined) updateData.coverage_area = payload.coverage_area;
      if (payload.dimensions !== undefined) updateData.dimensions = payload.dimensions;
      if (payload.weight !== undefined) updateData.weight = payload.weight;
      if (payload.power_consumption !== undefined) updateData.power_consumption = payload.power_consumption;
      if (payload.cody_cycle !== undefined) updateData.cody_cycle = payload.cody_cycle;
      if (payload.model_code !== undefined) updateData.model_code = payload.model_code;
      if (payload.tagline !== undefined) updateData.tagline = payload.tagline;

      let retries = 0;
      const maxRetries = 20;
      let lastError: any = null;

      while (retries < maxRetries) {
        const { error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', id);

        if (!error) {
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
        }

        lastError = error;
        console.warn(`[AdminProductService] Update attempt ${retries + 1} error:`, error.message);

        // Detect missing column from PostgREST error message
        const missingColMatch = error.message.match(/Could not find the '([^']+)' column/i) || 
                                error.message.match(/'([^']+)' column/i) ||
                                error.message.match(/column '([^']+)'/i);

        let strippedKey = false;
        if (missingColMatch && missingColMatch[1]) {
          const colName = missingColMatch[1];
          if (colName in updateData) {
            console.warn(`[AdminProductService] Stripping missing column '${colName}' from update payload`);
            delete updateData[colName];
            strippedKey = true;
          }
        }

        if (!strippedKey) {
          // Fallback: check all non-core keys in updateData against error message
          const coreKeys = ['name', 'price', 'image_url', 'description', 'category'];
          for (const key of Object.keys(updateData)) {
            if (coreKeys.includes(key)) continue;
            if (error.message.includes(key)) {
              console.warn(`[AdminProductService] Stripping missing key '${key}' from update payload`);
              delete updateData[key];
              strippedKey = true;
              break;
            }
          }
        }

        if (!strippedKey) {
          break;
        }

        retries++;
      }

      return { success: false, message: `อัปเดตไม่สำเร็จ: ${lastError?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'}` };
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

