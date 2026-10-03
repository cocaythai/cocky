import { supabase, isSupabaseConfigured } from './supabaseClient';
import { storageService, STORAGE_BUCKET } from './storageService';
import { bannerService } from './bannerService';
import { SiteSettings, DEFAULT_SITE_SETTINGS, HeroBanner } from '../types/settings';
import { DEFAULT_ARTICLES } from '../data/defaultArticles';
import { DEFAULT_KNOWLEDGE_TIPS } from '../data/defaultKnowledge';
import { DEFAULT_CUSTOMER_REVIEWS } from '../data/defaultReviews';

export interface StorageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  originalSize?: number;
  compressedSize?: number;
}

class SettingsService {
  /**
   * Fetch site settings from Supabase table 'site_settings'
   * Note: 'articles', 'knowledge_tips', and 'customer_reviews' are kept separate and not queried from site_settings
   */
  async getSettings(): Promise<{ settings: SiteSettings; source: 'supabase' | 'default'; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { settings: DEFAULT_SITE_SETTINGS, source: 'default' };
    }

    try {
      // 1. Fetch site_settings - only query existing columns
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

      // 2. Fetch banners from dedicated bannerService (Requirement 4)
      const banners: HeroBanner[] = await bannerService.getBanners();

      if (data) {
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
          banners: banners.length > 0 ? banners : DEFAULT_SITE_SETTINGS.banners,
          articles: DEFAULT_ARTICLES,
          knowledgeTips: DEFAULT_KNOWLEDGE_TIPS,
          customerReviews: DEFAULT_CUSTOMER_REVIEWS,
          updatedAt: data.updated_at,
        };

        return { settings: merged, source: 'supabase' };
      }

      // If no row exists yet, bootstrap with core default settings
      await this.saveSettings(DEFAULT_SITE_SETTINGS);
      return { settings: DEFAULT_SITE_SETTINGS, source: 'supabase' };
    } catch (err: any) {
      console.error('[SettingsService] Exception reading settings:', err);
      return { settings: DEFAULT_SITE_SETTINGS, source: 'default', error: err.message };
    }
  }

  /**
   * Save / Upsert site settings to Supabase table 'site_settings'
   * CRITICAL REQUIREMENT 1 & 2:
   * 1. Never send 'articles' field to site_settings (column does not exist)
   * 2. Never send 'knowledge_tips' or 'customer_reviews'
   * 3. Never send Base64
   */
  async saveSettings(settings: SiteSettings): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        message: 'ยังไม่ได้เชื่อมต่อ Supabase หรือยังไม่ได้ระบุ Environment Variables',
      };
    }

    try {
      // Format banners safely
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

      // ONLY include columns that actually exist in 'site_settings' table!
      // (NO articles, NO knowledge_tips, NO customer_reviews)
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
        updated_at: new Date().toISOString(),
      };

      let { error } = await supabase
        .from('site_settings')
        .upsert(payload, { onConflict: 'id' });

      // Core fallback if extra columns (like agent_line_url) don't exist yet
      if (error && error.message.includes('column') && error.message.includes('site_settings')) {
        const corePayload = {
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
          updated_at: new Date().toISOString(),
        };

        const retryRes = await supabase
          .from('site_settings')
          .upsert(corePayload, { onConflict: 'id' });
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
        message: 'บันทึกข้อมูลเว็บไซต์ลง Supabase Database สำเร็จเรียบร้อยแล้ว!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `เกิดข้อผิดพลาดในการบันทึก: ${err.message}`,
      };
    }
  }

  /**
   * Upload asset with compression
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
