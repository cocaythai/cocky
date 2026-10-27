import { supabase, isSupabaseConfigured } from './supabaseClient';
import { storageService } from './storageService';
import { SubscriptionOption, ProductHighlight, CowayProduct } from '../types/index.ts';
import { localProductStorage } from './localProductStorage';

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
   * Helper to construct a complete CowayProduct domain object from payload
   */
  private buildProductModel(id: string, payload: AdminProductPayload, existing?: Partial<CowayProduct>): CowayProduct {
    const sanitizedImages = (payload.images && payload.images.length > 0)
      ? payload.images.slice(0, 5)
      : (payload.image_url ? [payload.image_url] : (existing?.images || []));
    const mainImageUrl = sanitizedImages[0] || payload.image_url || existing?.image || '';

    const baseDesc = (payload.description || existing?.description || '')
      .replace(/<!-- COWAY_EXTENDED_SPECS:[\s\S]*? -->/g, '')
      .trim();

    const subOptions = payload.subscription_options && payload.subscription_options.length > 0
      ? payload.subscription_options
      : (existing?.subscriptionOptions || [
          {
            years: 5,
            monthlyPrice: Number(payload.price) || 790,
            label: 'สัญญา 5 ปี (แนะนำ)',
            badge: 'ยอดนิยม',
            codyService: 'ดูแลฟรี 5 ปีเต็ม ทำความสะอาดทุก 2 เดือน เปลี่ยนไส้กรองทุก 4 เดือน',
          },
          {
            years: 7,
            monthlyPrice: Math.round((Number(payload.price) || 790) * 0.88),
            label: 'สัญญา 7 ปี (ผ่อนเบาที่สุด)',
            badge: 'ผ่อนสบาย',
            codyService: 'ดูแลฟรี 7 ปีเต็ม ไม่มีค่าใช้จ่ายแอบแฝง',
          },
        ]);

    const validPrices = subOptions
      .map((opt) => Number(opt.monthlyPrice))
      .filter((p) => !isNaN(p) && p > 0);
    const minMonthlyPrice = validPrices.length > 0 ? Math.min(...validPrices) : (Number(payload.price) || 790);

    const highlights = payload.highlights && payload.highlights.length > 0
      ? payload.highlights
      : (existing?.highlights || [
          {
            title: 'RO Membrane กรองบริสุทธิ์',
            description: 'กรองละเอียดถึง 0.0001 ไมครอน ขจัดโลหะหนัก ไวรัส แบคทีเรีย สารเคมีตกค้างได้อย่างหมดจด',
          },
          {
            title: 'บริการ Cody ถึงบ้านฟรี',
            description: 'ผู้เชี่ยวชาญเข้าตรวจเช็ก ล้างระบบด้วยชุดเครื่องมือ Care Kit ฆ่าเชื้อทุก 2 เดือน เปลี่ยนไส้กรองทุก 4 เดือน',
          },
        ]);

    const category = (payload.category as any) || existing?.category || 'water';
    const categoryLabel = category === 'air'
      ? 'เครื่องฟอกอากาศ'
      : category === 'bidet'
      ? 'ฝารองนั่งสุขภัณฑ์'
      : category === 'mattress'
      ? 'เก้าอี้นวด'
      : 'เครื่องกรองน้ำ';

    return {
      id: String(id),
      name: payload.name || existing?.name || 'Coway Product',
      description: baseDesc,
      rawDescription: baseDesc,
      price: Number(payload.price) || existing?.price || 790,
      image: mainImageUrl,
      images: sanitizedImages.length > 0 ? sanitizedImages : [mainImageUrl],
      category,
      categoryLabel,
      features: existing?.features || [
        'ระบบกรองน้ำมาตรฐานสากล ขจัดสารปนเปื้อน 99.99%',
        'บริการ Cody Heart Service ดูแลฟรีตลอดอายุสัญญา',
        'ประหยัดพลังงาน เป็นมิตรต่อสิ่งแวดล้อม',
      ],
      isActive: true,
      modelCode: payload.model_code || existing?.modelCode || `CHP-${String(id).padStart(3, '0')}`,
      tagline: payload.tagline || existing?.tagline || 'นวัตกรรมเพื่อสุขภาพ ดื่มน้ำสะอาดสดชื่นทุกวัน',
      shortDesc: baseDesc || 'นวัตกรรมระบบกรองมาตรฐานระดับโลก ดีไซน์โมเดิร์น พร้อมบริการ Cody ดูแลตลอดสัญญา',
      fullDesc: baseDesc || `${payload.name} มาพร้อมมาตรฐานระดับสากล ผ่านการรับรอง WQA Gold Seal และระบบกรองบริสุทธิ์เพื่อทุกคนในครอบครัว`,
      subscriptionOptions: subOptions,
      startingMonthlyPrice: minMonthlyPrice,
      cashPrice: existing?.cashPrice || (minMonthlyPrice * 45),
      waterTypes: (payload.water_types as any) || existing?.waterTypes || ['hot', 'cold', 'room'],
      tankCapacity: payload.tank_capacity !== undefined ? payload.tank_capacity : (existing?.tankCapacity || '5.8 ลิตร'),
      filtrationSystem: payload.filtration_system !== undefined ? payload.filtration_system : (existing?.filtrationSystem || 'Coway RO Membrane 6 ขั้นตอน'),
      coverageArea: payload.coverage_area !== undefined ? payload.coverage_area : existing?.coverageArea,
      dimensions: payload.dimensions !== undefined ? payload.dimensions : (existing?.dimensions || '260 x 505 x 500 มม.'),
      weight: payload.weight !== undefined ? payload.weight : (existing?.weight || '18.0 กก.'),
      powerConsumption: payload.power_consumption !== undefined ? payload.power_consumption : (existing?.powerConsumption || 'ความร้อน 300W / ความเย็น 0.7A'),
      codyCycle: payload.cody_cycle !== undefined ? payload.cody_cycle : (existing?.codyCycle || 'ทำความสะอาดฆ่าเชื้อถังทุก 2 เดือน / เปลี่ยนไส้กรองทุก 4 เดือน'),
      keyFeatures: existing?.keyFeatures || [
        'ระบบกรองน้ำมาตรฐานสากล ขจัดสารปนเปื้อน 99.99%',
        'บริการ Cody Heart Service ดูแลฟรีตลอดอายุสัญญา',
        'ประหยัดพลังงาน เป็นมิตรต่อสิ่งแวดล้อม',
      ],
      highlights,
      isPopular: existing?.isPopular !== undefined ? existing.isPopular : true,
      isNew: existing?.isNew || false,
      isPromo: existing?.isPromo || false,
      promoText: existing?.promoText || 'ฟรีค่าติดตั้ง + บริการ Cody ดูแลตลอดสัญญา',
      rating: existing?.rating || 4.9,
      reviewCount: existing?.reviewCount || 120,
      order: payload.display_order !== undefined ? payload.display_order : (existing?.order || 999),
    };
  }

  /**
   * Create a new product in Supabase and sync with local storage
   */
  async createProduct(payload: AdminProductPayload): Promise<{ success: boolean; data?: any; message: string }> {
    const tempId = `prod-${Date.now()}`;
    const productModel = this.buildProductModel(tempId, payload);

    // 1. Immediately persist to local storage so the UI updates without delay
    localProductStorage.saveProduct(productModel);

    // 2. Prepare description with embedded specs for Supabase
    const sanitizedImages = (payload.images || [payload.image_url]).slice(0, 5);
    const mainImageUrl = sanitizedImages[0] || payload.image_url;
    const baseDesc = (payload.description || '').replace(/<!-- COWAY_EXTENDED_SPECS:[\s\S]*? -->/g, '').trim();

    const extendedSpecsObj: Record<string, any> = {
      images: sanitizedImages,
      water_types: payload.water_types,
      subscription_options: productModel.subscriptionOptions,
      highlights: productModel.highlights,
      tank_capacity: productModel.tankCapacity,
      filtration_system: productModel.filtrationSystem,
      coverage_area: productModel.coverageArea,
      dimensions: productModel.dimensions,
      weight: productModel.weight,
      power_consumption: productModel.powerConsumption,
      cody_cycle: productModel.codyCycle,
      model_code: productModel.modelCode,
      tagline: productModel.tagline,
      display_order: productModel.order,
      order: productModel.order,
    };

    const descriptionWithSpecs = `${baseDesc}\n\n<!-- COWAY_EXTENDED_SPECS:${JSON.stringify(extendedSpecsObj)} -->`;

    // 3. Attempt insert to Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const insertData: any = {
          name: payload.name,
          price: Number(payload.price) || productModel.startingMonthlyPrice,
          image_url: mainImageUrl,
          description: descriptionWithSpecs,
          category: payload.category || 'water',
        };

        const { data, error } = await supabase
          .from('products')
          .insert([insertData])
          .select()
          .maybeSingle();

        if (!error && data?.id) {
          // Replace temporary ID with Supabase numeric ID
          localProductStorage.deleteProduct(tempId);
          const finalProduct = { ...productModel, id: String(data.id) };
          localProductStorage.saveProduct(finalProduct);
          return {
            success: true,
            data: finalProduct,
            message: `เพิ่มสินค้า "${payload.name}" สำเร็จและบันทึกลง Supabase Database เรียบร้อยแล้ว!`,
          };
        }

        if (error) {
          console.warn('[AdminProductService] Supabase insert warning (saved locally):', error.message);
          return {
            success: true,
            data: productModel,
            message: `เพิ่มสินค้า "${payload.name}" สำเร็จและแสดงผลทันที! (ตรวจพบ Supabase RLS บล็อก แนะนำให้กดคัดลอก SQL ในแท็บสินค้าเพื่อซิงค์ข้ามเครื่อง)`,
          };
        }
      } catch (err: any) {
        console.warn('[AdminProductService] Supabase insert exception:', err);
      }
    }

    return {
      success: true,
      data: productModel,
      message: `เพิ่มสินค้า "${payload.name}" สำเร็จและแสดงผลบนเว็บไซต์ทันที!`,
    };
  }

  /**
   * Update an existing product in Supabase and sync with local storage
   */
  async updateProduct(
    id: string | number,
    payload: Partial<AdminProductPayload>,
    oldImages?: string[] | string
  ): Promise<{ success: boolean; message: string }> {
    const strId = String(id);
    const existingFromLocal = localProductStorage.getOverrides()[strId];

    // 1. Build and save full updated product model to local storage immediately
    const updatedProduct = this.buildProductModel(
      strId,
      payload as AdminProductPayload,
      existingFromLocal
    );
    localProductStorage.saveProduct(updatedProduct);

    // 2. Prepare payload for Supabase
    const targetId = !isNaN(Number(id)) ? Number(id) : id;
    const sanitizedImages = (payload.images && payload.images.length > 0)
      ? payload.images.slice(0, 5)
      : (payload.image_url ? [payload.image_url] : (existingFromLocal?.images || []));
    const mainImageUrl = sanitizedImages[0] || payload.image_url || existingFromLocal?.image || '';

    const baseDesc = (payload.description || existingFromLocal?.description || '')
      .replace(/<!-- COWAY_EXTENDED_SPECS:[\s\S]*? -->/g, '')
      .trim();

    const extendedSpecsObj: Record<string, any> = {
      images: sanitizedImages,
      water_types: payload.water_types || updatedProduct.waterTypes,
      subscription_options: updatedProduct.subscriptionOptions,
      highlights: updatedProduct.highlights,
      tank_capacity: updatedProduct.tankCapacity,
      filtration_system: updatedProduct.filtrationSystem,
      coverage_area: updatedProduct.coverageArea,
      dimensions: updatedProduct.dimensions,
      weight: updatedProduct.weight,
      power_consumption: updatedProduct.powerConsumption,
      cody_cycle: updatedProduct.codyCycle,
      model_code: updatedProduct.modelCode,
      tagline: updatedProduct.tagline,
      display_order: updatedProduct.order,
      order: updatedProduct.order,
    };

    const descriptionWithSpecs = `${baseDesc}\n\n<!-- COWAY_EXTENDED_SPECS:${JSON.stringify(extendedSpecsObj)} -->`;

    const updateData: any = {
      description: descriptionWithSpecs,
    };
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.price !== undefined) updateData.price = Number(payload.price) || updatedProduct.startingMonthlyPrice;
    if (mainImageUrl) updateData.image_url = mainImageUrl;
    if (payload.category !== undefined) updateData.category = payload.category;

    // 3. Clean up removed images from storage
    const oldList: string[] = Array.isArray(oldImages)
      ? oldImages
      : oldImages
      ? [oldImages]
      : [];
    const currentList: string[] = sanitizedImages || (mainImageUrl ? [mainImageUrl] : []);
    const removedUrls = oldList.filter((url) => url && !currentList.includes(url));
    if (removedUrls.length > 0) {
      storageService.deleteMultipleImagesByUrl(removedUrls).catch((err) => {
        console.warn('[AdminProductService] Storage cleanup warning:', err);
      });
    }

    // 4. Update Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        let { data, error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', targetId)
          .select();

        // Retry with string ID if targetId didn't match numeric
        if (!error && (!data || data.length === 0) && typeof targetId !== 'string') {
          const retryRes = await supabase
            .from('products')
            .update(updateData)
            .eq('id', String(id))
            .select();
          data = retryRes.data;
          error = retryRes.error;
        }

        if (!error && data && data.length > 0) {
          return {
            success: true,
            message: 'บันทึกการแก้ไขสินค้าสำเร็จและบันทึกลง Supabase Database แล้ว!',
          };
        }

        if (error || !data || data.length === 0) {
          console.warn('[AdminProductService] Supabase update returned 0 rows or error (saved locally):', error?.message);
          return {
            success: true,
            message: 'บันทึกการแก้ไขสินค้าสำเร็จและแสดงผลบนเว็บไซต์ทันที! (ตรวจพบ Supabase RLS บล็อก แนะนำให้กดคัดลอก SQL ในแท็บสินค้าไปรันใน Supabase เพื่อซิงค์ข้ามเครื่อง)',
          };
        }
      } catch (err: any) {
        console.warn('[AdminProductService] Supabase update exception:', err);
      }
    }

    return {
      success: true,
      message: 'บันทึกการแก้ไขสินค้าสำเร็จและแสดงผลบนเว็บไซต์ทันที!',
    };
  }

  /**
   * Update order of multiple products in Supabase and sync with local storage
   */
  async updateProductsOrder(
    orderedItems: { id: string; order: number; description?: string }[]
  ): Promise<{ success: boolean; message: string }> {
    // 1. Immediately update local storage
    const overrides = localProductStorage.getOverrides();
    for (const item of orderedItems) {
      if (overrides[item.id]) {
        overrides[item.id].order = item.order;
        localProductStorage.saveProduct(overrides[item.id]);
      }
    }

    // 2. Update Supabase
    if (isSupabaseConfigured() && supabase) {
      const client = supabase;
      try {
        const updatePromises = orderedItems.map(async (item) => {
          const targetId = !isNaN(Number(item.id)) ? Number(item.id) : item.id;

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

          return !error;
        });

        await Promise.all(updatePromises);
      } catch (err: any) {
        console.warn('[AdminProductService] Supabase update order exception:', err);
      }
    }

    return {
      success: true,
      message: 'บันทึกลำดับสินค้าสำเร็จเรียบร้อยแล้ว!',
    };
  }

  /**
   * Delete product from local storage and Supabase table 'products'
   */
  async deleteProduct(id: string | number, imagesOrUrl?: string[] | string): Promise<{ success: boolean; message: string }> {
    const strId = String(id);

    // 1. Delete from local storage immediately
    localProductStorage.deleteProduct(strId);

    // 2. Clean up images from storage
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

    // 3. Delete from Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const targetId = !isNaN(Number(id)) ? Number(id) : id;
        await supabase
          .from('products')
          .delete()
          .eq('id', targetId);
      } catch (err: any) {
        console.warn('[AdminProductService] Supabase delete exception:', err);
      }
    }

    return { success: true, message: 'ลบสินค้าเรียบร้อยแล้ว' };
  }
}

export const adminProductService = new AdminProductService();
