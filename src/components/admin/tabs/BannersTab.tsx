import React, { useState } from 'react';
import { HeroBanner, SiteSettings } from '../../../types/settings';
import { storageService } from '../../../services/storageService';
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
  Save
} from 'lucide-react';

interface BannersTabProps {
  formData: SiteSettings;
  setFormData: React.Dispatch<React.SetStateAction<SiteSettings>>;
  showToast: (type: 'success' | 'error', message: string) => void;
}

export const BannersTab: React.FC<BannersTabProps> = ({ formData, setFormData, showToast }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState<Partial<HeroBanner>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    buttonText: 'ดูรายละเอียด',
    buttonLink: '#products',
    isActive: true,
  });

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, bannerId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadKey = bannerId || 'form';
    setIsUploading(uploadKey);
    try {
      const oldUrl = bannerId ? formData.banners.find((b) => b.id === bannerId)?.imageUrl : undefined;
      const res = await storageService.uploadImage(file, 'banners', oldUrl);
      if (res.success && res.url) {
        if (bannerId) {
          setFormData((prev) => ({
            ...prev,
            banners: prev.banners.map((b) => (b.id === bannerId ? { ...b, imageUrl: res.url! } : b)),
          }));
        } else {
          setBannerForm((prev) => ({ ...prev, imageUrl: res.url }));
        }
        const sizeInfo = res.originalSize && res.compressedSize
          ? ` (${formatBytes(res.originalSize)} ➔ ${formatBytes(res.compressedSize)})`
          : '';
        showToast('success', `อัปโหลดรูปภาพลง Storage site-images สำเร็จ!${sizeInfo}`);
      } else {
        showToast('error', res.error || 'อัปโหลดรูปภาพไม่สำเร็จ');
      }
    } catch (err: any) {
      showToast('error', err.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setIsUploading(null);
    }
  };

  const handleToggleActive = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      banners: prev.banners.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)),
    }));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const list = [...formData.banners];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setFormData((prev) => ({ ...prev, banners: list }));
  };

  const handleOpenAdd = () => {
    setEditingBannerId(null);
    setBannerForm({
      title: '',
      subtitle: '',
      imageUrl: '',
      buttonText: 'ดูรายละเอียด',
      buttonLink: '#products',
      isActive: true,
    });
    setIsAdding(true);
  };

  const handleOpenEdit = (b: HeroBanner) => {
    setEditingBannerId(b.id);
    setBannerForm({ ...b });
    setIsAdding(true);
  };

  const handleSaveForm = () => {
    if (!bannerForm.title?.trim() || !bannerForm.imageUrl?.trim()) {
      showToast('error', 'กรุณาระบุหัวข้อและรูปภาพแบนเนอร์');
      return;
    }

    if (editingBannerId) {
      setFormData((prev) => ({
        ...prev,
        banners: prev.banners.map((b) => (b.id === editingBannerId ? ({ ...b, ...bannerForm } as HeroBanner) : b)),
      }));
      showToast('success', 'แก้ไขแบนเนอร์แล้ว (กดบันทึกเพื่อบันทึกลง Supabase)');
    } else {
      const created: HeroBanner = {
        id: `banner-${Date.now()}`,
        title: bannerForm.title || '',
        subtitle: bannerForm.subtitle || '',
        imageUrl: bannerForm.imageUrl || '',
        buttonText: bannerForm.buttonText || 'ดูรายละเอียด',
        buttonLink: bannerForm.buttonLink || '#products',
        isActive: bannerForm.isActive !== false,
        order: formData.banners.length + 1,
      };
      setFormData((prev) => ({ ...prev, banners: [...prev.banners, created] }));
      showToast('success', 'เพิ่มแบนเนอร์ใหม่แล้ว (กดบันทึกเพื่อบันทึกลง Supabase)');
    }
    setIsAdding(false);
    setEditingBannerId(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบแบนเนอร์นี้?')) return;
    setFormData((prev) => ({
      ...prev,
      banners: prev.banners.filter((b) => b.id !== id),
    }));
    showToast('success', 'ลบแบนเนอร์ออกจากรายการแล้ว');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            <span>จัดการแบนเนอร์หน้าแรก (Hero Banners)</span>
          </h3>
          <p className="text-xs text-slate-500">
            เพิ่ม แก้ไข ลบ เปิด-ปิดการแสดงผล และเปลี่ยนรูปภาพแบนเนอร์ (เก็บใน Bucket: site-images)
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>➕ เพิ่มแบนเนอร์ใหม่</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="p-5 bg-purple-50/70 rounded-3xl border-2 border-purple-300 space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-purple-200">
            <span className="font-bold text-sm text-purple-950">
              {editingBannerId ? '✏️ แก้ไขข้อมูลแบนเนอร์' : '➕ เพิ่มแบนเนอร์ใหม่'}
            </span>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">หัวข้อแบนเนอร์ *</label>
              <input
                type="text"
                value={bannerForm.title || ''}
                onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                placeholder="เช่น Coway Neo Plus นวัตกรรมน้ำสะอาด RO"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">ข้อความย่อย/โปรโมชั่น</label>
              <input
                type="text"
                value={bannerForm.subtitle || ''}
                onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                placeholder="เช่น ผ่อนเบาเพียง 790.-/เดือน ฟรีไส้กรองตลอด 5 ปี"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">ข้อความบนปุ่ม</label>
              <input
                type="text"
                value={bannerForm.buttonText || ''}
                onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                placeholder="ดูรายละเอียด"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">ลิงก์ของปุ่ม</label>
              <input
                type="text"
                value={bannerForm.buttonLink || ''}
                onChange={(e) => setBannerForm({ ...bannerForm, buttonLink: e.target.value })}
                placeholder="#products"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-purple-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-slate-700 font-semibold">รูปภาพแบนเนอร์ (อัปโหลดเข้า site-images หรือวาง URL) *</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={bannerForm.imageUrl || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                  placeholder="https://... หรือกดปุ่มอัปโหลดรูปภาพ"
                  className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-purple-500 text-xs"
                />
                <label className="px-4 py-2 bg-slate-900 hover:bg-purple-600 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors text-xs">
                  {isUploading === 'form' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังอัปโหลด...</span>
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

              {bannerForm.imageUrl && (
                <div className="p-2.5 bg-white rounded-2xl border border-slate-200 flex items-center gap-3">
                  <div className="w-24 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <img src={bannerForm.imageUrl} alt="พรีวิวแบนเนอร์" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">🟢 รูปภาพพร้อมบันทึก</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-purple-200">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSaveForm}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingBannerId ? 'อัปเดตแบนเนอร์' : 'ยืนยันการเพิ่มแบนเนอร์'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Banner List */}
      <div className="space-y-3">
        {formData.banners.map((banner, index) => (
          <div
            key={banner.id}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              {/* Order buttons */}
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded cursor-pointer"
                  title="เลื่อนขึ้น"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === formData.banners.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded cursor-pointer"
                  title="เลื่อนลง"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Image */}
              <div className="w-24 sm:w-28 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(banner.id)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                      banner.isActive
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {banner.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{banner.isActive ? 'กำลังแสดงผล' : 'ปิดการแสดงผล'}</span>
                  </button>
                </div>
                <div className="font-semibold text-slate-900 text-xs sm:text-sm mt-1 truncate">
                  {banner.title}
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                  {banner.subtitle}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0">
              <button
                onClick={() => handleOpenEdit(banner)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>แก้ไข</span>
              </button>

              <label className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>{isUploading === banner.id ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูป'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBannerUpload(e, banner.id)}
                  className="hidden"
                  disabled={isUploading === banner.id}
                />
              </label>

              <button
                onClick={() => handleDelete(banner.id)}
                title="ลบแบนเนอร์นี้"
                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
