import { supabase, isSupabaseConfigured } from './supabaseClient';
import { storageService, STORAGE_BUCKET, UploadResult } from './storageService';
import { SiteSettings, DEFAULT_SITE_SETTINGS, HeroBanner, Article, KnowledgeTip, CustomerReviewItem } from '../types/settings';
import heroImgFallback from '../assets/images/hero_coway_kitchen_1790923059004.jpg';
import neoPlusImg from '../assets/images/coway_neo_plus_1790923072942.jpg';
import myIceImg from '../assets/images/coway_my_ice_1790923084460.jpg';

export interface StorageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  originalSize?: number;
  compressedSize?: number;
}

class SettingsService {
  /**
   * Helper to normalize banner data from Supabase, removing Unsplash and supporting both camelCase and snake_case
   */
  private normalizeBanner(b: any, index: number): HeroBanner {
    let imageUrl = b.imageUrl || b.image_url || '';

    // Requirement 7: Replace Unsplash or dummy URL with actual Coway image
    if (!imageUrl || imageUrl.includes('unsplash.com')) {
      imageUrl = index === 0 ? neoPlusImg : index === 1 ? myIceImg : heroImgFallback;
    }

    const isActive = b.isActive !== undefined ? Boolean(b.isActive) : (b.is_active !== undefined ? Boolean(b.is_active) : true);
    const order = typeof b.order === 'number' ? b.order : (typeof b.order_index === 'number' ? b.order_index : index + 1);

    return {
      id: b.id || `banner-${Date.now()}-${index}`,
      title: b.title || `แบนเนอร์ Coway ${index + 1}`,
      subtitle: b.subtitle || '',
      imageUrl,
      image_url: imageUrl,
      buttonText: b.buttonText || b.button_text || 'ดูรายละเอียด',
      button_text: b.buttonText || b.button_text || 'ดูรายละเอียด',
      buttonLink: b.buttonLink || b.button_link || '#products',
      button_link: b.buttonLink || b.button_link || '#products',
      isActive,
      is_active: isActive,
      order,
    };
  }

  /**
   * Fetch site settings from Supabase table 'site_settings'
   */
  async getSettings(): Promise<{ settings: SiteSettings; source: 'supabase' | 'default'; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { settings: DEFAULT_SITE_SETTINGS, source: 'default' };
    }

    try {
      // 1. Try fetching from site_settings
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'main')
        .maybeSingle();

      if (error) {
        console.warn('[SettingsService] Could not fetch site_settings:', error.message);
        return {
          settings: DEFAULT_SITE_SETTINGS,
          source: 'default',
          error: error.message,
        };
      }

      if (data) {
        let rawBanners: any[] = [];
        if (Array.isArray(data.banners)) {
          rawBanners = data.banners;
        } else if (typeof data.banners === 'string') {
          try {
            rawBanners = JSON.parse(data.banners);
          } catch {
            rawBanners = [];
          }
        }

        // If site_settings has no banners, or if a dedicated 'banners' table exists, check it
        let normalizedBanners: HeroBanner[] = [];
        if (rawBanners && rawBanners.length > 0) {
          normalizedBanners = rawBanners.map((b, i) => this.normalizeBanner(b, i));
        } else {
          // Check dedicated banners table if exists
          try {
            const { data: tableBanners } = await supabase
              .from('banners')
              .select('*')
              .order('order_index', { ascending: true });
            if (tableBanners && tableBanners.length > 0) {
              normalizedBanners = tableBanners.map((b, i) => this.normalizeBanner(b, i));
            }
          } catch {
            // No standalone table
          }
        }

        if (normalizedBanners.length === 0) {
          normalizedBanners = DEFAULT_SITE_SETTINGS.banners.map((b, i) => this.normalizeBanner(b, i));
        }

        const articles: Article[] = Array.isArray(data.articles)
          ? data.articles
          : typeof data.articles === 'string'
          ? JSON.parse(data.articles)
          : (DEFAULT_SITE_SETTINGS.articles || []);

        const knowledgeTips: KnowledgeTip[] = Array.isArray(data.knowledge_tips || data.knowledgeTips)
          ? (data.knowledge_tips || data.knowledgeTips)
          : typeof (data.knowledge_tips || data.knowledgeTips) === 'string'
          ? JSON.parse(data.knowledge_tips || data.knowledgeTips)
          : (DEFAULT_SITE_SETTINGS.knowledgeTips || []);

        const customerReviews: CustomerReviewItem[] = Array.isArray(data.customer_reviews || data.customerReviews)
          ? (data.customer_reviews || data.customerReviews)
          : typeof (data.customer_reviews || data.customerReviews) === 'string'
          ? JSON.parse(data.customer_reviews || data.customerReviews)
          : (DEFAULT_SITE_SETTINGS.customerReviews || []);

        const merged: SiteSettings = {
          id: 'main',
          siteName: data.site_name || DEFAULT_SITE_SETTINGS.siteName,
          siteTagline: data.site_tagline || DEFAULT_SITE_SETTINGS.siteTagline,
          logoUrl: data.logo_url || '',
          phoneNumber: data.phone_number || DEFAULT_SITE_SETTINGS.phoneNumber,
          phoneDisplay: data.phone_display || data.phone_number || DEFAULT_SITE_SETTINGS.phoneDisplay,
          lineId: data.line_id || DEFAULT_SITE_SETTINGS.lineId,
          lineUrl: data.line_url || DEFAULT_SITE_SETTINGS.lineUrl,
          agentLineUrl: data.agent_line_url || data.line_url || DEFAULT_SITE_SETTINGS.agentLineUrl,
          facebookUrl: data.facebook_url || DEFAULT_SITE_SETTINGS.facebookUrl,
          facebookName: data.facebook_name || DEFAULT_SITE_SETTINGS.facebookName,
          heroBadge: data.hero_badge || DEFAULT_SITE_SETTINGS.heroBadge,
          heroTitle: data.hero_title || DEFAULT_SITE_SETTINGS.heroTitle,
          heroSubtitle: data.hero_subtitle || DEFAULT_SITE_SETTINGS.heroSubtitle,
          contactHeading: data.contact_heading || DEFAULT_SITE_SETTINGS.contactHeading,
          contactSubtitle: data.contact_subtitle || DEFAULT_SITE_SETTINGS.contactSubtitle,
          contactAddress: data.contact_address || DEFAULT_SITE_SETTINGS.contactAddress,
          contactHours: data.contact_hours || DEFAULT_SITE_SETTINGS.contactHours,
          banners: normalizedBanners,
          articles: articles && articles.length > 0 ? articles : (DEFAULT_SITE_SETTINGS.articles || []),
          knowledgeTips: knowledgeTips && knowledgeTips.length > 0 ? knowledgeTips : (DEFAULT_SITE_SETTINGS.knowledgeTips || []),
          customerReviews: customerReviews && customerReviews.length > 0 ? customerReviews : (DEFAULT_SITE_SETTINGS.customerReviews || []),
          updatedAt: data.updated_at,
        };

        return { settings: merged, source: 'supabase' };
      }

      // If no row exists yet, bootstrap with default settings
      await this.saveSettings(DEFAULT_SITE_SETTINGS);
      return { settings: DEFAULT_SITE_SETTINGS, source: 'supabase' };
    } catch (err: any) {
      console.error('[SettingsService] Exception reading settings:', err);
      return { settings: DEFAULT_SITE_SETTINGS, source: 'default', error: err.message };
    }
  }

  /**
   * Save / Upsert site settings to Supabase table 'site_settings'
   * Enforces Requirement 2: Strictly forbids Base64 in Database
   */
  async saveSettings(settings: SiteSettings): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        message: 'ยังไม่ได้เชื่อมต่อ Supabase หรือยังไม่ได้ระบุ Environment Variables',
      };
    }

    try {
      // Requirement 2: Strict check - Do NOT allow Base64 in Database
      for (const banner of settings.banners || []) {
        const url = banner.imageUrl || banner.image_url || '';
        if (url.startsWith('data:') || url.includes(';base64,')) {
          return {
            success: false,
            message: 'ข้อผิดพลาด: ห้ามเก็บรูปภาพเป็น Base64 ในฐานข้อมูล กรุณาอัปโหลดรูปภาพผ่านระบบเข้าสู่ Supabase Storage Bucket SITE-IMAGES ก่อนบันทึก',
          };
        }
      }

      // Prepare banner payload with both snake_case and camelCase for maximum compatibility
      const bannersPayload = (settings.banners || []).map((b, i) => ({
        id: b.id || `banner-${Date.now()}-${i}`,
        title: b.title || '',
        subtitle: b.subtitle || '',
        imageUrl: b.imageUrl || b.image_url || '',
        image_url: b.imageUrl || b.image_url || '',
        buttonText: b.buttonText || b.button_text || 'ดูรายละเอียด',
        button_text: b.buttonText || b.button_text || 'ดูรายละเอียด',
        buttonLink: b.buttonLink || b.button_link || '#products',
        button_link: b.buttonLink || b.button_link || '#products',
        isActive: b.isActive !== false && b.is_active !== false,
        is_active: b.isActive !== false && b.is_active !== false,
        order: typeof b.order === 'number' ? b.order : i + 1,
        order_index: typeof b.order === 'number' ? b.order : i + 1,
      }));

      const payload = {
        id: 'main',
        site_name: settings.siteName,
        site_tagline: settings.siteTagline,
        logo_url: settings.logoUrl || '',
        phone_number: settings.phoneNumber,
        phone_display: settings.phoneDisplay || settings.phoneNumber,
        line_id: settings.lineId,
        line_url: settings.lineUrl,
        agent_line_url: settings.agentLineUrl || settings.lineUrl || '',
        facebook_url: settings.facebookUrl || '',
        facebook_name: settings.facebookName || '',
        hero_badge: settings.heroBadge,
        hero_title: settings.heroTitle,
        hero_subtitle: settings.heroSubtitle,
        contact_heading: settings.contactHeading,
        contact_subtitle: settings.contactSubtitle,
        contact_address: settings.contactAddress,
        contact_hours: settings.contactHours,
        banners: bannersPayload,
        articles: settings.articles || [],
        knowledge_tips: settings.knowledgeTips || [],
        customer_reviews: settings.customerReviews || [],
        updated_at: new Date().toISOString(),
      };

      let { error } = await supabase
        .from('site_settings')
        .upsert(payload, { onConflict: 'id' });

      // Fallback: If extra columns do not exist in table yet, try core columns payload
      if (error && (error.message.includes('column') && error.message.includes('site_settings'))) {
        const fallbackPayload = {
          id: 'main',
          site_name: settings.siteName,
          site_tagline: settings.siteTagline,
          phone_number: settings.phoneNumber,
          phone_display: settings.phoneDisplay || settings.phoneNumber,
          line_id: settings.lineId,
          line_url: settings.lineUrl,
          hero_badge: settings.heroBadge,
          hero_title: settings.heroTitle,
          hero_subtitle: settings.heroSubtitle,
          contact_heading: settings.contactHeading,
          contact_subtitle: settings.contactSubtitle,
          contact_address: settings.contactAddress,
          contact_hours: settings.contactHours,
          banners: bannersPayload,
          articles: settings.articles || [],
          updated_at: new Date().toISOString(),
        };
        const retryRes = await supabase
          .from('site_settings')
          .upsert(fallbackPayload, { onConflict: 'id' });
        error = retryRes.error;
      }

      if (error) {
        console.error('[SettingsService] Upsert error:', error);
        return {
          success: false,
          message: `บันทึกไม่สำเร็จ: ${error.message}`,
        };
      }

      return {
        success: true,
        message: 'บันทึกข้อมูลเว็บไซต์และแบนเนอร์ลง Supabase Database สำเร็จเรียบร้อยแล้ว!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `เกิดข้อผิดพลาดในการบันทึก: ${err.message}`,
      };
    }
  }

  /**
   * Save only banners to Supabase Database immediately
   */
  async saveBanners(newBanners: HeroBanner[]): Promise<{ success: boolean; message: string }> {
    const current = await this.getSettings();
    const updated: SiteSettings = {
      ...current.settings,
      banners: newBanners,
    };
    return this.saveSettings(updated);
  }

  /**
   * Delete a banner:
   * 1. Remove file from Supabase Storage (SITE-IMAGES)
   * 2. Remove record from Database
   * Prevents orphaned image files in Storage (Requirement 4)
   */
  async deleteBanner(
    bannerId: string,
    currentBanners: HeroBanner[]
  ): Promise<{ success: boolean; message: string; updatedBanners: HeroBanner[] }> {
    const target = currentBanners.find((b) => b.id === bannerId);
    const targetUrl = target?.imageUrl || target?.image_url;

    // 1. Delete image file from Supabase Storage
    if (targetUrl && storageService.isSupabaseStorageUrl(targetUrl)) {
      await storageService.deleteImageByUrl(targetUrl).catch((err) => {
        console.warn('[SettingsService] Failed to delete banner image from storage:', err);
      });
    }

    // 2. Remove banner from list and reindex orders
    const remaining = currentBanners
      .filter((b) => b.id !== bannerId)
      .map((b, idx) => ({ ...b, order: idx + 1, order_index: idx + 1 }));

    // 3. Save updated banner list to Database
    const res = await this.saveBanners(remaining);
    return {
      success: res.success,
      message: res.success
        ? 'ลบแบนเนอร์และลบไฟล์รูปออกจาก Supabase Storage (SITE-IMAGES) เรียบร้อยแล้ว'
        : res.message,
      updatedBanners: remaining,
    };
  }

  /**
   * Upload an image to Supabase Storage bucket 'SITE-IMAGES' with client compression
   */
  async uploadAsset(
    file: File,
    folder: 'banners' | 'articles' | 'knowledge' | 'reviews' | 'products' | 'logo' = 'banners',
    oldUrl?: string
  ): Promise<StorageUploadResult> {
    return storageService.uploadImage(file, folder, oldUrl);
  }
}

export const settingsService = new SettingsService();
