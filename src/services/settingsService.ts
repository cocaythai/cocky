import { supabase, isSupabaseConfigured } from './supabaseClient';
import { storageService, STORAGE_BUCKET, UploadResult } from './storageService';
import { SiteSettings, DEFAULT_SITE_SETTINGS, HeroBanner } from '../types/settings';

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
   */
  async getSettings(): Promise<{ settings: SiteSettings; source: 'supabase' | 'default'; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { settings: DEFAULT_SITE_SETTINGS, source: 'default' };
    }

    try {
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
        const banners: HeroBanner[] = Array.isArray(data.banners)
          ? data.banners
          : typeof data.banners === 'string'
          ? JSON.parse(data.banners)
          : DEFAULT_SITE_SETTINGS.banners;

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
          banners: banners && banners.length > 0 ? banners : DEFAULT_SITE_SETTINGS.banners,
          updatedAt: data.updated_at,
        };

        return { settings: merged, source: 'supabase' };
      }

      // If no row exists yet, attempt to bootstrap with default settings
      await this.saveSettings(DEFAULT_SITE_SETTINGS);
      return { settings: DEFAULT_SITE_SETTINGS, source: 'supabase' };
    } catch (err: any) {
      console.error('[SettingsService] Exception reading settings:', err);
      return { settings: DEFAULT_SITE_SETTINGS, source: 'default', error: err.message };
    }
  }

  /**
   * Save / Upsert site settings to Supabase table 'site_settings'
   */
  async saveSettings(settings: SiteSettings): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        message: 'ยังไม่ได้เชื่อมต่อ Supabase หรือยังไม่ได้ระบุ Environment Variables',
      };
    }

    try {
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
        banners: settings.banners,
        updated_at: new Date().toISOString(),
      };

      let { error } = await supabase
        .from('site_settings')
        .upsert(payload, { onConflict: 'id' });

      // Fallback: If optional columns (logo_url, facebook_url, facebook_name) do not exist yet in table, save core columns
      if (error && (error.message.includes('column') && error.message.includes('site_settings'))) {
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
          banners: settings.banners,
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
        message: 'บันทึกการตั้งค่าเว็บไซต์ลง Supabase สำเร็จเรียบร้อยแล้ว!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `เกิดข้อผิดพลาดในการบันทึก: ${err.message}`,
      };
    }
  }

  /**
   * Upload an image to Supabase Storage bucket 'website-assets' with client compression
   */
  async uploadAsset(
    file: File,
    folder: 'banners' | 'products' = 'banners',
    oldUrl?: string
  ): Promise<StorageUploadResult> {
    return storageService.uploadImage(file, folder, oldUrl);
  }
}

export const settingsService = new SettingsService();
