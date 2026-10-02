import React, { useState } from 'react';
import { SiteSettings, KnowledgeTip } from '../../../types/settings';
import { DEFAULT_KNOWLEDGE_TIPS } from '../../../data/defaultKnowledge';
import { storageService } from '../../../services/storageService';
import { formatBytes } from '../../../utils/imageCompressor';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Eye, 
  EyeOff, 
  Edit, 
  X, 
  Loader2, 
  Lightbulb, 
  Save, 
  Search, 
  Sparkles, 
  Clock 
} from 'lucide-react';

interface KnowledgeTabProps {
  formData: SiteSettings;
  setFormData: React.Dispatch<React.SetStateAction<SiteSettings>>;
  showToast: (type: 'success' | 'error', message: string) => void;
}

export const KnowledgeTab: React.FC<KnowledgeTabProps> = ({ formData, setFormData, showToast }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTipId, setEditingTipId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [tipForm, setTipForm] = useState<Partial<KnowledgeTip>>({
    title: '',
    tag: 'สุขภาพ & การดื่มน้ำ',
    description: '',
    imageUrl: '',
    readTime: '2 นาที',
    keyTakeaway: '',
    isActive: true,
  });

  const tipsList: KnowledgeTip[] = formData.knowledgeTips && formData.knowledgeTips.length > 0
    ? formData.knowledgeTips
    : DEFAULT_KNOWLEDGE_TIPS;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadKey = tipId || 'form';
    setIsUploading(uploadKey);
    try {
      const oldUrl = tipId ? tipsList.find((t) => t.id === tipId)?.imageUrl : undefined;
      const res = await storageService.uploadImage(file, 'knowledge', oldUrl);
      if (res.success && res.url) {
        if (tipId) {
          setFormData((prev) => ({
            ...prev,
            knowledgeTips: (prev.knowledgeTips || DEFAULT_KNOWLEDGE_TIPS).map((t) => (t.id === tipId ? { ...t, imageUrl: res.url! } : t)),
          }));
        } else {
          setTipForm((prev) => ({ ...prev, imageUrl: res.url }));
        }
        const sizeInfo = res.originalSize && res.compressedSize
          ? ` (${formatBytes(res.originalSize)} ➔ ${formatBytes(res.compressedSize)})`
          : '';
        showToast('success', `อัปโหลดรูปภาพสาระน่ารู้ลง site-images สำเร็จ!${sizeInfo}`);
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
      knowledgeTips: (prev.knowledgeTips || DEFAULT_KNOWLEDGE_TIPS).map((t) => (t.id === id ? { ...t, isActive: t.isActive === false } : t)),
    }));
  };

  const handleOpenAdd = () => {
    setEditingTipId(null);
    setTipForm({
      title: '',
      tag: 'สุขภาพ & การดื่มน้ำ',
      description: '',
      imageUrl: '',
      readTime: '2 นาที',
      keyTakeaway: '',
      isActive: true,
    });
    setIsAdding(true);
  };

  const handleOpenEdit = (tip: KnowledgeTip) => {
    setEditingTipId(tip.id);
    setTipForm({ ...tip });
    setIsAdding(true);
  };

  const handleSaveForm = () => {
    if (!tipForm.title?.trim() || !tipForm.description?.trim() || !tipForm.imageUrl?.trim()) {
      showToast('error', 'กรุณาระบุหัวข้อ คำอธิบาย และรูปภาพ');
      return;
    }

    if (editingTipId) {
      setFormData((prev) => ({
        ...prev,
        knowledgeTips: (prev.knowledgeTips || DEFAULT_KNOWLEDGE_TIPS).map((t) =>
          t.id === editingTipId ? ({ ...t, ...tipForm } as KnowledgeTip) : t
        ),
      }));
      showToast('success', 'แก้ไขสาระน่ารู้สำเร็จ! (กดบันทึกเพื่อบันทึกลง Supabase)');
    } else {
      const created: KnowledgeTip = {
        id: `tip-${Date.now()}`,
        title: tipForm.title || '',
        tag: tipForm.tag || 'สาระน่ารู้',
        description: tipForm.description || '',
        imageUrl: tipForm.imageUrl || '',
        readTime: tipForm.readTime || '2 นาที',
        keyTakeaway: tipForm.keyTakeaway || '',
        isActive: tipForm.isActive !== false,
        order: (formData.knowledgeTips?.length || 0) + 1,
      };
      setFormData((prev) => ({
        ...prev,
        knowledgeTips: [created, ...(prev.knowledgeTips || DEFAULT_KNOWLEDGE_TIPS)],
      }));
      showToast('success', 'เพิ่มสาระน่ารู้ใหม่สำเร็จ! (กดบันทึกเพื่อบันทึกลง Supabase)');
    }
    setIsAdding(false);
    setEditingTipId(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสาระน่ารู้ "${title}"?`)) return;
    setFormData((prev) => ({
      ...prev,
      knowledgeTips: (prev.knowledgeTips || DEFAULT_KNOWLEDGE_TIPS).filter((t) => t.id !== id),
    }));
    showToast('success', 'ลบสาระน่ารู้ออกจากรายการแล้ว');
  };

  const filteredTips = tipsList.filter(
    (t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           t.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span>จัดการสาระน่ารู้ & เคล็ดลับสุขภาพ (Knowledge Tips)</span>
          </h3>
          <p className="text-xs text-slate-500">
            เพิ่ม แก้ไข ลบ เปิด-ปิดการแสดงผล และเปลี่ยนรูปภาพสาระน่ารู้ (Bucket: site-images)
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>➕ เพิ่มสาระน่ารู้ใหม่</span>
          </button>
        )}
      </div>

      {!isAdding && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อสาระน่ารู้ หรือแท็ก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-amber-500"
          />
        </div>
      )}

      {isAdding && (
        <div className="p-5 bg-amber-50/70 rounded-3xl border-2 border-amber-300 space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-amber-200">
            <span className="font-bold text-sm text-amber-950">
              {editingTipId ? '✏️ แก้ไขข้อมูลสาระน่ารู้' : '➕ เพิ่มสาระน่ารู้ใหม่'}
            </span>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">หัวข้อสาระน่ารู้ *</label>
              <input
                type="text"
                value={tipForm.title || ''}
                onChange={(e) => setTipForm({ ...tipForm, title: e.target.value })}
                placeholder="เช่น สูตรคำนวณปริมาณน้ำดื่มที่เหมาะสมกับน้ำหนักตัว"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-amber-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">แท็กหมวดหมู่</label>
              <input
                type="text"
                value={tipForm.tag || ''}
                onChange={(e) => setTipForm({ ...tipForm, tag: e.target.value })}
                placeholder="เช่น สุขภาพ & การดื่มน้ำ, PM 2.5"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">ระยะเวลาในการอ่าน</label>
              <input
                type="text"
                value={tipForm.readTime || '2 นาที'}
                onChange={(e) => setTipForm({ ...tipForm, readTime: e.target.value })}
                placeholder="เช่น 2 นาที"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">รายละเอียด / คำแนะนำ *</label>
              <textarea
                rows={3}
                value={tipForm.description || ''}
                onChange={(e) => setTipForm({ ...tipForm, description: e.target.value })}
                placeholder="อธิบายเกร็ดความรู้และเคล็ดลับ..."
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">ข้อสรุปสั้นๆ (Key Takeaway)</label>
              <input
                type="text"
                value={tipForm.keyTakeaway || ''}
                onChange={(e) => setTipForm({ ...tipForm, keyTakeaway: e.target.value })}
                placeholder="เช่น ควรจิบน้ำเป็นระยะตลอดวัน ดีกว่าดื่มครั้งละแก้วใหญ่"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-amber-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-slate-700 font-semibold">รูปภาพประกอบ (อัปโหลดเข้า site-images หรือวาง URL) *</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={tipForm.imageUrl || ''}
                  onChange={(e) => setTipForm({ ...tipForm, imageUrl: e.target.value })}
                  placeholder="https://... หรือกดปุ่มอัปโหลดรูปภาพ"
                  className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-amber-500 font-mono text-xs"
                />
                <label className="px-4 py-2 bg-slate-900 hover:bg-amber-600 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors text-xs">
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
                    onChange={(e) => handleImageUpload(e)}
                    className="hidden"
                    disabled={isUploading === 'form'}
                  />
                </label>
              </div>

              {tipForm.imageUrl && (
                <div className="p-2.5 bg-white rounded-2xl border border-slate-200 flex items-center gap-3">
                  <div className="w-20 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <img src={tipForm.imageUrl} alt="พรีวิวสาระน่ารู้" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">🟢 รูปภาพพร้อมบันทึก</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSaveForm}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingTipId ? 'อัปเดตสาระน่ารู้' : 'บันทึกสาระน่ารู้'}</span>
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filteredTips.map((tip) => (
          <div
            key={tip.id}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-20 sm:w-24 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative">
                <img src={tip.imageUrl} alt={tip.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(tip.id)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                      tip.isActive !== false
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {tip.isActive !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{tip.isActive !== false ? 'เปิดแสดงผล' : 'ปิดการแสดงผล'}</span>
                  </button>

                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md">
                    {tip.tag}
                  </span>
                </div>

                <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                  {tip.title}
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                  {tip.description}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0">
              <button
                onClick={() => handleOpenEdit(tip)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>แก้ไข</span>
              </button>

              <label className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>{isUploading === tip.id ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูป'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, tip.id)}
                  className="hidden"
                  disabled={isUploading === tip.id}
                />
              </label>

              <button
                onClick={() => handleDelete(tip.id, tip.title)}
                title="ลบรายการนี้"
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
