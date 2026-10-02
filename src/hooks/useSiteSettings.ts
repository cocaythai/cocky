import { useState, useEffect, useCallback } from 'react';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '../types/settings';
import { settingsService } from '../services/settingsService';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [source, setSource] = useState<'supabase' | 'default'>('default');
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await settingsService.getSettings();
      setSettings(res.settings);
      setSource(res.source);
      if (res.error) {
        setError(res.error);
      } else {
        setError(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (newSettings: SiteSettings) => {
    setSettings(newSettings); // Optimistic UI update
    const res = await settingsService.saveSettings(newSettings);
    if (!res.success) {
      // If error, refetch original
      await fetchSettings();
    }
    return res;
  }, [fetchSettings]);

  return {
    settings,
    loading,
    source,
    error,
    updateSettings,
    refreshSettings: fetchSettings,
  };
}
