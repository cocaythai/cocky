import { supabase, isSupabaseConfigured } from './supabaseClient';
import { storageService, PRIMARY_STORAGE_BUCKET } from './storageService';
import { HeroBanner, DEFAULT_SITE_SETTINGS } from '../types/settings';
import heroImgFallback from '../assets/images/hero_coway_kitchen_1790923059004.jpg';
import neoPlusImg from '../assets/images/coway_neo_plus_1790923072942.jpg';
import myIceImg from '../assets/images/coway_my_ice_1790923084460.jpg';

class BannerService {
  /**
   * Helper to normalize a banner row into HeroBanner
   * Ensures no Unsplash URLs, no Base64, and both camelCase and snake_case properties
   */
  normalizeBanner(b: any, index: number): HeroBanner {
    let imageUrl = b.image_url || b.imageUrl || '';
    if (!imageUrl || imageUrl.includes('unsplash.com')) {
      imageUrl = index === 0 ? neoPlusImg : index === 1 ? myIceImg : heroImgFallback;
    }

    const isActive = b.is_active !== undefined ? Boolean(b.is_active) : (b.isActive !== undefined ? Boolean(b.isActive) : true);
    const order = typeof b.order_index === 'number' ? b.order_index : (typeof b.order === 'number' ? b.order : index + 1);

    return {
      id: b.id || `banner-${Date.now()}-${index}`,
      title: b.title || `แบนเนอร์ Coway ${index + 1}`,
      subtitle: b.subtitle || '',
      imageUrl,
      image_url: imageUrl,
      buttonText: b.button_text || b.buttonText || 'ดูรายละเอียด',
      button_text: b.button_text || b.buttonText || 'ดูรายละเอียด',
      buttonLink: b.button_link || b.buttonLink || '#products',
      button_link: b.button_link || b.buttonLink || '#products',
      isActive,
      is_active: isActive,
      order,
    };
  }

  /**
   * 1. Get all banners
   * Tries dedicated 'banners' table first (Requirement 4).
   * If table doesn't exist, reads ONLY 'banners' column from 'site_settings' (NO articles!).
   */
  async getBanners(): Promise<HeroBanner[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return DEFAULT_SITE_SETTINGS.banners.map((b, i) => this.normalizeBanner(b, i));
    }

    try {
      // 1.1 Try dedicated 'banners' table first
      const { data: tableBanners, error: tableError } = await supabase
        .from('banners')
        .select('*')
        .order('order_index', { ascending: true });

      if (!tableError && tableBanners && tableBanners.length > 0) {
        return tableBanners.map((b, i) => this.normalizeBanner(b, i));
      }

      // 1.2 Fallback: Read ONLY 'banners' column from 'site_settings' (Never query articles!)
      const { data: sData, error: sError } = await supabase
        .from('site_settings')
        .select('banners')
        .eq('id', 'main')
        .maybeSingle();

      if (!sError && sData?.banners) {
        const rawList = Array.isArray(sData.banners)
          ? sData.banners
          : typeof sData.banners === 'string'
          ? JSON.parse(sData.banners)
          : [];

        if (rawList.length > 0) {
          return rawList.map((b: any, i: number) => this.normalizeBanner(b, i));
        }
      }

      return DEFAULT_SITE_SETTINGS.banners.map((b, i) => this.normalizeBanner(b, i));
    } catch (err) {
      console.warn('[BannerService] Failed to load banners from Supabase:', err);
      return DEFAULT_SITE_SETTINGS.banners.map((b, i) => this.normalizeBanner(b, i));
    }
  }

  /**
   * 2. Add a new banner
   * Inserts into 'banners' table. If table does not exist, updates ONLY 'banners' in 'site_settings'.
   * Never sends 'articles'!
   */
  async addBanner(bannerData: Partial<HeroBanner>): Promise<{ success: boolean; banner?: HeroBanner; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, message: 'ไม่ได้เชื่อมต่อ Supabase' };
    }

    const imageUrl = bannerData.image_url || bannerData.imageUrl || '';
    if (imageUrl.startsWith('data:') || imageUrl.includes(';base64,')) {
      return { success: false, message: 'ห้ามใช้ Base64 ในระบบ กรุณาอัปโหลดเข้า Storage SITE-IMAGES' };
    }

    const bannerId = bannerData.id || `banner-${Date.now()}`;
    const newBanner: HeroBanner = {
      id: bannerId,
      title: bannerData.title || 'แบนเนอร์ใหม่',
      subtitle: bannerData.subtitle || '',
      imageUrl,
      image_url: imageUrl,
      buttonText: bannerData.button_text || bannerData.buttonText || 'ดูรายละเอียด',
      button_text: bannerData.button_text || bannerData.buttonText || 'ดูรายละเอียด',
      buttonLink: bannerData.button_link || bannerData.buttonLink || '#products',
      button_link: bannerData.button_link || bannerData.buttonLink || '#products',
      isActive: bannerData.isActive !== false && bannerData.is_active !== false,
      is_active: bannerData.isActive !== false && bannerData.is_active !== false,
      order: bannerData.order || 1,
    };

    try {
      // 2.1 Try inserting into 'banners' table
      const row = {
        id: newBanner.id,
        title: newBanner.title,
        subtitle: newBanner.subtitle,
        image_url: newBanner.image_url,
        button_text: newBanner.button_text,
        button_link: newBanner.button_link,
        order_index: newBanner.order,
        is_active: newBanner.is_active,
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase.from('banners').insert(row);

      if (!insertError) {
        // Also sync to site_settings.banners silently for backward compatibility
        this.syncToSiteSettingsOnly(newBanner, 'add').catch(() => {});
        return { success: true, banner: newBanner, message: 'เพิ่มแบนเนอร์สำเร็จ' };
      }

      // 2.2 If banners table error (e.g. relation "public.banners" does not exist),
      // update ONLY 'banners' column in 'site_settings'
      console.warn('[BannerService] Banners table insert failed, falling back to site_settings.banners:', insertError.message);
      const fallbackRes = await this.syncToSiteSettingsOnly(newBanner, 'add');
      return fallbackRes;
    } catch (err: any) {
      return { success: false, message: err.message || 'เกิดข้อผิดพลาดในการเพิ่มแบนเนอร์' };
    }
  }

  /**
   * 3. Update an existing banner
   * Updates 'banners' table. If image changed, removes old image from SITE-IMAGES.
   */
  async updateBanner(bannerData: HeroBanner, oldImageUrl?: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, message: 'ไม่ได้เชื่อมต่อ Supabase' };
    }

    const newImageUrl = bannerData.image_url || bannerData.imageUrl || '';
    if (newImageUrl.startsWith('data:') || newImageUrl.includes(';base64,')) {
      return { success: false, message: 'ห้ามใช้ Base64 ในระบบ กรุณาอัปโหลดเข้า Storage SITE-IMAGES' };
    }

    // If old image is replaced and was in Supabase storage, delete old file to prevent waste (Requirement 7)
    if (oldImageUrl && oldImageUrl !== newImageUrl && storageService.isSupabaseStorageUrl(oldImageUrl)) {
      storageService.deleteImageByUrl(oldImageUrl).catch((e) => {
        console.warn('[BannerService] Failed to delete old banner image from storage:', e);
      });
    }

    try {
      const row = {
        title: bannerData.title,
        subtitle: bannerData.subtitle || '',
        image_url: newImageUrl,
        button_text: bannerData.button_text || bannerData.buttonText || 'ดูรายละเอียด',
        button_link: bannerData.button_link || bannerData.buttonLink || '#products',
        order_index: bannerData.order || 1,
        is_active: bannerData.isActive !== false && bannerData.is_active !== false,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('banners')
        .update(row)
        .eq('id', bannerData.id);

      if (!error) {
        this.syncToSiteSettingsOnly(bannerData, 'update').catch(() => {});
        return { success: true, message: 'อัปเดตแบนเนอร์สำเร็จ' };
      }

      // Fallback: update ONLY 'banners' column in site_settings
      console.warn('[BannerService] Banners table update failed, falling back to site_settings.banners:', error.message);
      return await this.syncToSiteSettingsOnly(bannerData, 'update');
    } catch (err: any) {
      return { success: false, message: err.message || 'เกิดข้อผิดพลาดในการอัปเดตแบนเนอร์' };
    }
  }

  /**
   * 4. Delete a banner (Requirement 7)
   * Deletes from Storage Bucket SITE-IMAGES and deletes row from Database.
   * Works ONLY on Banner data (Requirement 5).
   */
  async deleteBanner(bannerId: string, imageUrl?: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, message: 'ไม่ได้เชื่อมต่อ Supabase' };
    }

    // 4.1 Delete image from Supabase Storage SITE-IMAGES
    if (imageUrl && storageService.isSupabaseStorageUrl(imageUrl)) {
      await storageService.deleteImageByUrl(imageUrl).catch((err) => {
        console.warn('[BannerService] Failed to delete image from storage:', err);
      });
    }

    try {
      // 4.2 Delete row from 'banners' table
      const { error } = await supabase.from('banners').delete().eq('id', bannerId);

      if (!error) {
        this.syncToSiteSettingsOnly({ id: bannerId } as any, 'delete').catch(() => {});
        return { success: true, message: 'ลบแบนเนอร์และลบไฟล์รูปภาพออกจาก Storage SITE-IMAGES สำเร็จ' };
      }

      // 4.3 Fallback: Delete from 'banners' column in 'site_settings'
      console.warn('[BannerService] Banners table delete failed, falling back to site_settings.banners:', error.message);
      return await this.syncToSiteSettingsOnly({ id: bannerId } as any, 'delete');
    } catch (err: any) {
      return { success: false, message: err.message || 'เกิดข้อผิดพลาดในการลบแบนเนอร์' };
    }
  }

  /**
   * 5. Re-order banners in Database
   */
  async reorderBanners(banners: HeroBanner[]): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: true, message: 'อัปเดตลำดับเรียบร้อย' };
    }

    try {
      // Update each banner's order_index in 'banners' table
      for (let i = 0; i < banners.length; i++) {
        const b = banners[i];
        await supabase
          .from('banners')
          .update({ order_index: i + 1, updated_at: new Date().toISOString() })
          .eq('id', b.id);
      }

      // Also sync banners array in site_settings
      const serialized = banners.map((b, i) => ({
        ...b,
        order: i + 1,
        order_index: i + 1,
      }));
      await supabase
        .from('site_settings')
        .update({ banners: serialized, updated_at: new Date().toISOString() })
        .eq('id', 'main');

      return { success: true, message: 'สลับลำดับแบนเนอร์สำเร็จ' };
    } catch (err: any) {
      return { success: false, message: err.message || 'เกิดข้อผิดพลาดในการสลับลำดับ' };
    }
  }

  /**
   * 6. Toggle banner active status
   */
  async toggleActive(bannerId: string, currentActive: boolean): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: true, message: 'อัปเดตสถานะแบนเนอร์แล้ว' };
    }

    const nextState = !currentActive;
    try {
      await supabase
        .from('banners')
        .update({ is_active: nextState, updated_at: new Date().toISOString() })
        .eq('id', bannerId);

      // Sync site_settings.banners
      const currentBanners = await this.getBanners();
      const updated = currentBanners.map((b) =>
        b.id === bannerId ? { ...b, isActive: nextState, is_active: nextState } : b
      );
      await supabase
        .from('site_settings')
        .update({ banners: updated, updated_at: new Date().toISOString() })
        .eq('id', 'main');

      return { success: true, message: 'อัปเดตสถานะการแสดงผลสำเร็จ' };
    } catch (err: any) {
      return { success: false, message: err.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' };
    }
  }

  /**
   * Internal helper: Sync ONLY the 'banners' column in 'site_settings'
   * CRITICAL: NEVER sends 'articles', 'knowledge_tips', or any non-existent columns!
   */
  private async syncToSiteSettingsOnly(
    targetBanner: HeroBanner,
    action: 'add' | 'update' | 'delete'
  ): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, message: 'ไม่ได้เชื่อมต่อ Supabase' };
    }

    try {
      const { data } = await supabase
        .from('site_settings')
        .select('banners')
        .eq('id', 'main')
        .maybeSingle();

      let currentList: any[] = [];
      if (data?.banners) {
        currentList = Array.isArray(data.banners)
          ? data.banners
          : typeof data.banners === 'string'
          ? JSON.parse(data.banners)
          : [];
      }

      let nextList: any[] = [];
      if (action === 'add') {
        nextList = [...currentList, targetBanner];
      } else if (action === 'update') {
        nextList = currentList.map((b) => (b.id === targetBanner.id ? { ...b, ...targetBanner } : b));
      } else if (action === 'delete') {
        nextList = currentList.filter((b) => b.id !== targetBanner.id);
      }

      // Re-index
      nextList = nextList.map((b, i) => ({
        ...b,
        order: i + 1,
        order_index: i + 1,
      }));

      // Update ONLY the 'banners' column!
      const { error } = await supabase
        .from('site_settings')
        .update({
          banners: nextList,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'main');

      if (error) {
        return { success: false, message: `บันทึกแบนเนอร์ไม่สำเร็จ: ${error.message}` };
      }

      return { success: true, message: 'บันทึกข้อมูลแบนเนอร์สำเร็จ' };
    } catch (err: any) {
      return { success: false, message: err.message || 'ไม่สามารถซิงค์ข้อมูลแบนเนอร์ได้' };
    }
  }
}

export const bannerService = new BannerService();
