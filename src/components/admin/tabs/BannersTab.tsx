import React, { useState, useEffect, useCallback } from 'react';
import { HeroBanner, SiteSettings } from '../../../types/settings';
import { storageService, PRIMARY_STORAGE_BUCKET } from '../../../services/storageService';
import { bannerService } from '../../../services/bannerService';
import { formatBytes } from '../../../utils/imageCompressor';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Edit, 
  X, 
  Loader2, 
  Image as ImageIcon,
  Save,
  CheckCircle2,
  Database,
  Layers,
  Copy,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface BannersTabProps {
  formData: SiteSettings;
  setFormData: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onSaveSettings?: (settings: SiteSettings) => Promise<{ success: boolean; message: string }>;
  onRefreshSettings?: () => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}

export const BannersTab: React.FC<BannersTabProps> = ({ 
  formData, 
  setFormData, 
  onRefreshSettings,
  showToast 
}) => {
  const [banners, setBanners] = useState<HeroBanner[]>(formData.banners || []);
  const [isLoadingBanners, setIsLoadingBanners] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<string>('');
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const [bannerForm, setBannerForm] = useState<Partial<HeroBanner>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    image_url: '',
    buttonText: 'ดูรายละเอียด',
    button_text: 'ดูรายละเอียด',
    buttonLink: '#products',
    button_link: '#products',
    isActive: true,
    is_active: true,
  });

  // Load banners from dedicated bannerService on mount
  const refreshBanners = useCallback(async () => {
    setIsLoadingBanners(true);
    try {
      const data = await bannerService.getBanners();
      setBanners(data);
      setFormData((prev) => ({ ...prev, banners: data }));
    } catch (err: any) {
      console.warn('Failed to load banners:', err);
    } finally {
      setIsLoadingBanners(false);
    }
  }, [setFormData]);

  useEffect(() => {
    refreshBanners();
  }, [refreshBanners]);

  // Keep sorted by order
  const sortedBanners = [...banners].sort((a, b) => (a.order || 0) - (b.order || 0));

  /**
   * Handle single banner file upload to Supabase Storage Bucket SITE-IMAGES (Requirement 6)
   * When changing image for an existing banner (Requirement 5):
   * 1. Upload new image to SITE-IMAGES
   * 2. Update URL in banners table
   * 3. Delete old image from SITE-IMAGES
   */
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, bannerId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type && !file.type.startsWith('image/')) {
      showToast('error', 'กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)');
      e.target.value = '';
      return;
    }

    const uploadKey = bannerId || 'form';
    setIsUploading(uploadKey);

    try {
      const existing = bannerId ? banners.find((b) => b.id === bannerId) : undefined;
      const oldUrl = existing?.image_url || existing?.imageUrl;

      // Upload to SITE-IMAGES
      const res = await storageService.uploadImage(file, 'banners', oldUrl);

      if (res.success && res.url) {
        const targetUrl = res.url;
        const sizeInfo = res.originalSize && res.compressedSize
          ? ` (${formatBytes(res.originalSize)} ➔ ${formatBytes(res.compressedSize)})`
          : '';

        if (bannerId && existing) {
          // Requirement 5: Update banner table directly & delete old image
          setIsSavingDb(true);
          const updatedBanner: HeroBanner = {
            ...existing,
            imageUrl: targetUrl,
            image_url: targetUrl,
          };
          const updateRes = await bannerService.updateBanner(updatedBanner, oldUrl);
          setIsSavingDb(false);

          if (updateRes.success) {
            await refreshBanners();
            if (onRefreshSettings) onRefreshSettings();
            showToast('success', `เปลี่ยนรูปภาพใน Storage ${PRIMARY_STORAGE_BUCKET} และอัปเดต Database สำเร็จ!${sizeInfo}`);
          } else {
            showToast('error', updateRes.message);
          }
        } else {
          setBannerForm((prev) => ({ 
            ...prev, 
            imageUrl: targetUrl, 
            image_url: targetUrl 
          }));
          showToast('success', `อัปโหลดรูปภาพลง Storage ${PRIMARY_STORAGE_BUCKET} สำเร็จ!${sizeInfo}`);
        }
      } else {
        showToast('error', res.error || 'อัปโหลดรูปภาพไม่สำเร็จ กรุณาตรวจสอบ RLS Policy ของ Storage');
      }
    } catch (err: any) {
      showToast('error', err.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    } finally {
      setIsUploading(null);
      e.target.value = '';
    }
  };

  /**
   * Handle Batch Multi-Image Upload (Requirement 6)
   * Uploads multiple banner files at once to SITE-IMAGES and saves each to banners table.
   */
  const handleBatchMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setIsBatchUploading(true);
    setBatchProgress(`กำลังเตรียมอัปโหลด ${files.length} รายการ...`);

    try {
      const results = await storageService.uploadMultipleImages(
        files,
        'banners',
        (completed, total) => {
          setBatchProgress(`กำลังอัปโหลดเข้า ${PRIMARY_STORAGE_BUCKET}: ${completed}/${total} รูป...`);
        }
      );

      const successfulUploads = results.filter((r) => r.success && r.url);

      if (successfulUploads.length === 0) {
        showToast('error', 'ไม่สามารถอัปโหลดรูปภาพได้ กรุณาตรวจสอบ Storage Bucket SITE-IMAGES');
        return;
      }

      setIsSavingDb(true);
      const startOrder = banners.length + 1;
      let addedCount = 0;

      for (let i = 0; i < successfulUploads.length; i++) {
        const uploadRes = successfulUploads[i];
        const orderNum = startOrder + i;
        const res = await bannerService.addBanner({
          id: `banner-${Date.now()}-${i}`,
          title: `Coway แบนเนอร์ชุดที่ ${orderNum}`,
          subtitle: 'ดื่มน้ำสะอาดและอากาศบริสุทธิ์เพื่อทุกคนในครอบครัว',
          imageUrl: uploadRes.url!,
          image_url: uploadRes.url!,
          buttonText: 'ดูรายละเอียด',
          buttonLink: '#products',
          isActive: true,
          is_active: true,
          order: orderNum,
        });
        if (res.success) addedCount++;
      }

      await refreshBanners();
      if (onRefreshSettings) onRefreshSettings();
      showToast('success', `อัปโหลดแบนเนอร์ใหม่ ${addedCount} รายการเข้า ${PRIMARY_STORAGE_BUCKET} และบันทึกลง Database สำเร็จ!`);
    } catch (err: any) {
      showToast('error', err.message || 'เกิดข้อผิดพลาดในการอัปโหลดหลายรายการ');
    } finally {
      setIsBatchUploading(false);
      setIsSavingDb(false);
      setBatchProgress('');
      e.target.value = '';
    }
  };

  /**
   * Toggle Active / Inactive banner (Requirement 5)
   */
  const handleToggleActive = async (id: string, currentState: boolean) => {
    setIsSavingDb(true);
    try {
      const res = await bannerService.toggleActive(id, currentState);
      if (res.success) {
        await refreshBanners();
        if (onRefreshSettings) onRefreshSettings();
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    } finally {
      setIsSavingDb(false);
    }
  };

  /**
   * Re-order banners Up / Down (Requirement 5)
   */
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const list = [...sortedBanners];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const reordered = list.map((b, i) => ({ ...b, order: i + 1, order_index: i + 1 }));
    setBanners(reordered);

    setIsSavingDb(true);
    try {
      const res = await bannerService.reorderBanners(reordered);
      if (res.success) {
        await refreshBanners();
        if (onRefreshSettings) onRefreshSettings();
        showToast('success', 'สลับลำดับแบนเนอร์แล้ว');
      } else {
        showToast('error', res.message);
      }
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingBannerId(null);
    setBannerForm({
      title: '',
      subtitle: '',
      imageUrl: '',
      image_url: '',
      buttonText: 'ดูรายละเอียด',
      button_text: 'ดูรายละเอียด',
      buttonLink: '#products',
      button_link: '#products',
      isActive: true,
      is_active: true,
    });
    setIsAdding(true);
  };

  const handleOpenEdit = (b: HeroBanner) => {
    setEditingBannerId(b.id);
    setBannerForm({ 
      ...b,
      imageUrl: b.image_url || b.imageUrl || '',
      image_url: b.image_url || b.imageUrl || '',
    });
    setIsAdding(true);
  };

  /**
   * Save Add / Edit Banner Form (Requirement 2, 4, 5)
   * Works strictly with Banner table, NO articles!
   */
  const handleSaveForm = async () => {
    const imageUrl = bannerForm.image_url || bannerForm.imageUrl || '';

    // Requirement 2: Reject Base64
    if (imageUrl.startsWith('data:') || imageUrl.includes(';base64,')) {
      showToast('error', '⚠️ ห้ามใช้รูปภาพแบบ Base64 กรุณาใช้ปุ่ม "เลือกรูปจากอุปกรณ์" เพื่ออัปโหลดเข้า Storage SITE-IMAGES');
      return;
    }

    if (!bannerForm.title?.trim() || !imageUrl.trim()) {
      showToast('error', 'กรุณาระบุหัวข้อและอัปโหลดรูปภาพแบนเนอร์');
      return;
    }

    setIsSavingDb(true);
    try {
      if (editingBannerId) {
        const existing = banners.find((b) => b.id === editingBannerId);
        const oldUrl = existing?.image_url || existing?.imageUrl;
        const updated: HeroBanner = {
          ...existing,
          ...bannerForm,
          id: editingBannerId,
          imageUrl,
          image_url: imageUrl,
          buttonText: bannerForm.buttonText || 'ดูรายละเอียด',
          button_text: bannerForm.buttonText || 'ดูรายละเอียด',
          buttonLink: bannerForm.buttonLink || '#products',
          button_link: bannerForm.buttonLink || '#products',
          isActive: bannerForm.isActive !== false && bannerForm.is_active !== false,
          is_active: bannerForm.isActive !== false && bannerForm.is_active !== false,
          order: existing?.order || 1,
        } as HeroBanner;

        const res = await bannerService.updateBanner(updated, oldUrl);
        if (res.success) {
          await refreshBanners();
          if (onRefreshSettings) onRefreshSettings();
          showToast('success', 'แก้ไขข้อมูลแบนเนอร์สำเร็จ!');
          setIsAdding(false);
          setEditingBannerId(null);
        } else {
          showToast('error', res.message);
        }
      } else {
        const res = await bannerService.addBanner({
          id: `banner-${Date.now()}`,
          title: bannerForm.title || '',
          subtitle: bannerForm.subtitle || '',
          imageUrl,
          image_url: imageUrl,
          buttonText: bannerForm.buttonText || 'ดูรายละเอียด',
          buttonLink: bannerForm.buttonLink || '#products',
          isActive: bannerForm.isActive !== false && bannerForm.is_active !== false,
          order: banners.length + 1,
        });

        if (res.success) {
          await refreshBanners();
          if (onRefreshSettings) onRefreshSettings();
          showToast('success', 'เพิ่มแบนเนอร์ใหม่สำเร็จ!');
          setIsAdding(false);
          setEditingBannerId(null);
        } else {
          showToast('error', res.message);
        }
      }
    } finally {
      setIsSavingDb(false);
    }
  };

  /**
   * Delete banner (Requirement 5 & 7):
   * 1. Delete image from Storage SITE-IMAGES
   * 2. Delete banner row from Database
   * 3. Prevent orphaned files
   */
  const handleDelete = async (banner: HeroBanner) => {
    if (banners.length <= 1) {
      showToast('error', 'ต้องมีแบนเนอร์อย่างน้อย 1 รายการเพื่อแสดงผลหน้าแรก');
      return;
    }

    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${banner.title}" ?\n\nระบบจะลบข้อมูลออกจาก Database และลบไฟล์รูปภาพออกจาก Supabase Storage (${PRIMARY_STORAGE_BUCKET}) ทันที`)) {
      return;
    }

    setIsSavingDb(true);
    try {
      const bannerImg = banner.image_url || banner.imageUrl;
      const res = await bannerService.deleteBanner(banner.id, bannerImg);

      if (res.success) {
        await refreshBanners();
        if (onRefreshSettings) onRefreshSettings();
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    } catch (err: any) {
      showToast('error', err.message || 'เกิดข้อผิดพลาดในการลบแบนเนอร์');
    } finally {
      setIsSavingDb(false);
    }
  };

  const copySqlCode = () => {
    const sql = `-- =========================================================
-- SQL Setup: Table 'banners' and Storage Bucket 'SITE-IMAGES'
-- =========================================================

-- 1. สร้างตาราง banners โดยเฉพาะ (Requirement 4)
CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  button_text TEXT DEFAULT 'ดูรายละเอียด',
  button_link TEXT DEFAULT '#products',
  order_index INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read banners" ON public.banners;
DROP POLICY IF EXISTS "Allow authenticated insert banners" ON public.banners;
DROP POLICY IF EXISTS "Allow authenticated update banners" ON public.banners;
DROP POLICY IF EXISTS "Allow authenticated delete banners" ON public.banners;

CREATE POLICY "Allow public read banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert banners" ON public.banners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update banners" ON public.banners FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete banners" ON public.banners FOR DELETE TO authenticated USING (true);

-- 2. สร้างและเปิด Public ให้ Storage Bucket SITE-IMAGES (Requirement 6)
INSERT INTO storage.buckets (id, name, public)
VALUES ('SITE-IMAGES', 'SITE-IMAGES', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage Policies
DROP POLICY IF EXISTS "Allow public read storage" ON storage.objects;
CREATE POLICY "Allow public read storage" ON storage.objects FOR SELECT
USING (bucket_id IN ('SITE-IMAGES', 'site-images', 'website-assets'));

DROP POLICY IF EXISTS "Allow authenticated upload storage" ON storage.objects;
CREATE POLICY "Allow authenticated upload storage" ON storage.objects FOR INSERT
TO authenticated WITH CHECK (bucket_id IN ('SITE-IMAGES', 'site-images', 'website-assets'));

DROP POLICY IF EXISTS "Allow authenticated update storage" ON storage.objects;
CREATE POLICY "Allow authenticated update storage" ON storage.objects FOR UPDATE
TO authenticated USING (bucket_id IN ('SITE-IMAGES', 'site-images', 'website-assets')) WITH CHECK (bucket_id IN ('SITE-IMAGES', 'site-images', 'website-assets'));

DROP POLICY IF EXISTS "Allow authenticated delete storage" ON storage.objects;
CREATE POLICY "Allow authenticated delete storage" ON storage.objects FOR DELETE
TO authenticated USING (bucket_id IN ('SITE-IMAGES', 'site-images', 'website-assets'));`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
    showToast('success', 'คัดลอกคำสั่ง SQL สำหรับตั้งค่าตาราง banners และ Storage เรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-sky-600" />
              <span>จัดการแบนเนอร์หน้าแรก (Hero Banners)</span>
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1">
              <Database className="w-3 h-3 text-sky-600" />
              <span>Storage Bucket: {PRIMARY_STORAGE_BUCKET}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ระบบแบนเนอร์ทำงานแยกเป็นอิสระ (ไม่แตะ Articles), จัดเก็บรูปภาพใน Bucket SITE-IMAGES และลบไฟล์อัตโนมัติ
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={() => refreshBanners()}
            disabled={isLoadingBanners || isSavingDb}
            className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="รีเฟรชข้อมูลแบนเนอร์"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBanners ? 'animate-spin text-sky-600' : ''}`} />
          </button>

          {/* Policy Checker Button */}
          <button
            onClick={() => setShowPolicyModal(true)}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="ตรวจสอบตาราง banners และสิทธิ์ RLS Policy"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>ตรวจ Schema &amp; Storage</span>
          </button>

          {/* Batch Multi-Upload Button */}
          <label className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
            {isBatchUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                <span>{batchProgress || 'กำลังอัปโหลด...'}</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                <span>อัปโหลดหลายรูปพร้อมกัน</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleBatchMultiUpload}
              className="hidden"
              disabled={isBatchUploading || isSavingDb}
            />
          </label>

          {/* Add Single Banner Button */}
          {!isAdding && (
            <button
              onClick={handleOpenAdd}
              disabled={isSavingDb}
              className="px-4 py-2 bg-slate-900 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มแบนเนอร์</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress & Status Indicators */}
      {isBatchUploading && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-3 text-xs text-sky-800 animate-in fade-in">
          <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
          <span>{batchProgress || 'กำลังประมวลผลและอัปโหลดรูปภาพเข้า Supabase Storage SITE-IMAGES...'}</span>
        </div>
      )}

      {isSavingDb && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 shrink-0" />
          <span>กำลังบันทึกข้อมูลแบนเนอร์ลง Database ทันที...</span>
        </div>
      )}

      {/* Add / Edit Banner Form */}
      {isAdding && (
        <div className="p-5 bg-sky-50/80 rounded-3xl border-2 border-sky-300 space-y-4 animate-in fade-in shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-sky-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-sky-950">
                {editingBannerId ? '✏️ แก้ไขข้อมูลแบนเนอร์' : '➕ เพิ่มแบนเนอร์ใหม่'}
              </span>
              <span className="text-[10px] bg-sky-200 text-sky-900 font-bold px-2 py-0.5 rounded-full">
                Bucket: {PRIMARY_STORAGE_BUCKET}
              </span>
            </div>
            <button 
              onClick={() => setIsAdding(false)} 
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">หัวข้อแบนเนอร์ (Title) *</label>
              <input
                type="text"
                value={bannerForm.title || ''}
                onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                placeholder="เช่น Coway Neo Plus นวัตกรรมน้ำสะอาด RO"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">ข้อความย่อย/โปรโมชั่น (Subtitle)</label>
              <input
                type="text"
                value={bannerForm.subtitle || ''}
                onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                placeholder="เช่น ผ่อนเบาเพียง 790.-/เดือน ฟรีไส้กรองตลอด 5 ปี"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">ข้อความบนปุ่ม (Button Text)</label>
              <input
                type="text"
                value={bannerForm.buttonText || ''}
                onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value, button_text: e.target.value })}
                placeholder="ดูรายละเอียด"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">ลิงก์ของปุ่ม (Button Link)</label>
              <input
                type="text"
                value={bannerForm.buttonLink || ''}
                onChange={(e) => setBannerForm({ ...bannerForm, buttonLink: e.target.value, button_link: e.target.value })}
                placeholder="#products หรือ /#calculator"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500 font-mono"
              />
            </div>

            {/* Image File Selector & Preview */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-slate-700 font-semibold">
                รูปภาพแบนเนอร์ (อัปโหลดเข้า Storage Bucket: {PRIMARY_STORAGE_BUCKET}) *
              </label>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={bannerForm.image_url || bannerForm.imageUrl || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith('data:') || val.includes(';base64,')) {
                      showToast('error', '⚠️ ไม่อนุญาตให้วาง Base64 กรุณาเลือกไฟล์รูปภาพเพื่ออัปโหลดเข้า Supabase Storage');
                      return;
                    }
                    setBannerForm({ ...bannerForm, imageUrl: val, image_url: val });
                  }}
                  placeholder="กดปุ่ม 'เลือกรูปจากอุปกรณ์' เพื่ออัปโหลดเข้า SITE-IMAGES หรือวาง Supabase Storage URL"
                  className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500 text-xs font-mono"
                />
                
                <label className="px-4 py-2 bg-slate-900 hover:bg-sky-600 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors text-xs shadow-xs">
                  {isUploading === 'form' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังอัปโหลดเข้า {PRIMARY_STORAGE_BUCKET}...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>เลือกรูปจากอุปกรณ์</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBannerUpload(e)}
                    className="hidden"
                    disabled={isUploading === 'form'}
                  />
                </label>
              </div>

              {/* Live Preview Before Saving */}
              {(bannerForm.image_url || bannerForm.imageUrl) && (
                <div className="p-3 bg-white rounded-2xl border border-sky-200 flex items-center gap-3.5 animate-in fade-in">
                  <div className="w-28 h-16 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <img 
                      src={bannerForm.image_url || bannerForm.imageUrl} 
                      alt="พรีวิวแบนเนอร์" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-slate-800 block">พรีวิวรูปภาพแบนเนอร์ก่อนบันทึก</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block truncate">
                      🟢 รูปภาพพร้อมบันทึกลง Database
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block truncate">
                      {bannerForm.image_url || bannerForm.imageUrl}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-sky-200">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSaveForm}
              disabled={isSavingDb}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {isSavingDb ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingBannerId ? 'อัปเดตและบันทึก' : 'ยืนยันการเพิ่มแบนเนอร์'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Banner List */}
      <div className="space-y-3">
        {sortedBanners.map((banner, index) => {
          const bannerImg = banner.image_url || banner.imageUrl;
          const isSupabaseUrl = storageService.isSupabaseStorageUrl(bannerImg);

          return (
            <div
              key={banner.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                {/* Order Controls (Up / Down) */}
                <div className="flex flex-col gap-1 items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0 || isSavingDb}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                    title="เลื่อนขึ้น"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold text-slate-600 font-mono">
                    {banner.order || index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === sortedBanners.length - 1 || isSavingDb}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                    title="เลื่อนลง"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Banner Thumbnail */}
                <div className="w-24 sm:w-28 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative group">
                  <img 
                    src={bannerImg} 
                    alt={banner.title} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                  />
                  {isSupabaseUrl && (
                    <span className="absolute bottom-1 right-1 text-[8px] bg-slate-900/80 text-sky-300 font-bold px-1 rounded backdrop-blur-xs">
                      {PRIMARY_STORAGE_BUCKET}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Toggle Active Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(banner.id, banner.isActive !== false && banner.is_active !== false)}
                      disabled={isSavingDb}
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                        (banner.isActive !== false && banner.is_active !== false)
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title="คลิกเพื่อเปิด/ปิดการแสดงผล"
                    >
                      {(banner.isActive !== false && banner.is_active !== false) ? (
                        <>
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>กำลังแสดงผลบนหน้าแรก</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 text-slate-400" />
                          <span>ปิดการแสดงผล</span>
                        </>
                      )}
                    </button>

                    {isSupabaseUrl ? (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Supabase Storage
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        รูปภาพระบบ
                      </span>
                    )}
                  </div>

                  <div className="font-semibold text-slate-900 text-xs sm:text-sm mt-1 truncate">
                    {banner.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                    {banner.subtitle || 'ไม่มีข้อความย่อย'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0">
                {/* Edit Details */}
                <button
                  onClick={() => handleOpenEdit(banner)}
                  disabled={isSavingDb}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500" />
                  <span>แก้ไข</span>
                </button>

                {/* Change Image */}
                <label className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors">
                  {isUploading === banner.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                      <span>กำลังเปลี่ยนรูป...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>เปลี่ยนรูป</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBannerUpload(e, banner.id)}
                    className="hidden"
                    disabled={isUploading === banner.id || isSavingDb}
                  />
                </label>

                {/* Delete Banner */}
                <button
                  onClick={() => handleDelete(banner)}
                  disabled={isSavingDb}
                  title="ลบแบนเนอร์และลบไฟล์จาก Storage"
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Storage Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-base">
                  ตรวจสอบตาราง Banners และ Storage Bucket: {PRIMARY_STORAGE_BUCKET}
                </h4>
              </div>
              <button 
                onClick={() => setShowPolicyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                ระบบแยกการจัดการ Banner ออกจากตาราง <code className="px-1.5 py-0.5 bg-slate-100 rounded text-sky-700 font-bold">site_settings</code> เรียบร้อยแล้ว (ไม่ส่ง field articles) โดยระบบจะบันทึกลงตาราง <code className="px-1.5 py-0.5 bg-slate-100 rounded text-emerald-700 font-bold">public.banners</code> และจัดเก็บรูปภาพใน Bucket <code className="px-1.5 py-0.5 bg-slate-100 rounded text-purple-700 font-bold">{PRIMARY_STORAGE_BUCKET}</code>
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Public Read (SELECT)</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1">ผู้เข้าชมทุกคนเปิดดูรูปภาพแบนเนอร์หน้าแรกได้</p>
                </div>

                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200">
                  <div className="font-bold text-sky-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    <span>Admin Upload (INSERT)</span>
                  </div>
                  <p className="text-[11px] text-sky-700 mt-1">Admin อัปโหลดรูปภาพใหม่หรืออัปโหลดเป็นชุดได้</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Admin Update (UPDATE)</span>
                  </div>
                  <p className="text-[11px] text-purple-700 mt-1">Admin เปลี่ยนรูปภาพแบนเนอร์ได้</p>
                </div>

                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
                  <div className="font-bold text-rose-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-rose-600" />
                    <span>Admin Delete (DELETE)</span>
                  </div>
                  <p className="text-[11px] text-rose-700 mt-1">ลบไฟล์ออกจาก Storage ทันทีเมื่อลบแบนเนอร์ ไม่ให้มีไฟล์ขยะค้าง</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">คำสั่ง SQL (Run in Supabase SQL Editor):</span>
                  <button
                    onClick={copySqlCode}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-sky-600 text-white font-semibold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSql ? 'คัดลอกแล้ว!' : 'คัดลอก SQL'}</span>
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-48 leading-relaxed">
{`CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  button_text TEXT DEFAULT 'ดูรายละเอียด',
  button_link TEXT DEFAULT '#products',
  order_index INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert banners" ON public.banners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update banners" ON public.banners FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete banners" ON public.banners FOR DELETE TO authenticated USING (true);`}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
