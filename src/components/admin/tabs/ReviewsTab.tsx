import React, { useState } from 'react';
import { SiteSettings, CustomerReviewItem } from '../../../types/settings';
import { DEFAULT_CUSTOMER_REVIEWS } from '../../../data/defaultReviews';
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
  Star, 
  Save, 
  Search, 
  CheckCircle2, 
  MessageSquareQuote 
} from 'lucide-react';

interface ReviewsTabProps {
  formData: SiteSettings;
  setFormData: React.Dispatch<React.SetStateAction<SiteSettings>>;
  showToast: (type: 'success' | 'error', message: string) => void;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({ formData, setFormData, showToast }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingRevId, setEditingRevId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [revForm, setRevForm] = useState<Partial<CustomerReviewItem>>({
    customerName: '',
    location: 'กรุงเทพมหานคร',
    productName: 'Coway Neo Plus',
    rating: 5,
    date: 'อัปเดตล่าสุด',
    comment: '',
    avatarUrl: '',
    verified: true,
    isActive: true,
  });

  const reviewsList: CustomerReviewItem[] = formData.customerReviews && formData.customerReviews.length > 0
    ? formData.customerReviews
    : DEFAULT_CUSTOMER_REVIEWS;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>, revId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadKey = revId || 'form';
    setIsUploading(uploadKey);
    try {
      const oldUrl = revId ? reviewsList.find((r) => r.id === revId)?.avatarUrl : undefined;
      const res = await storageService.uploadImage(file, 'reviews', oldUrl);
      if (res.success && res.url) {
        if (revId) {
          setFormData((prev) => ({
            ...prev,
            customerReviews: (prev.customerReviews || DEFAULT_CUSTOMER_REVIEWS).map((r) => (r.id === revId ? { ...r, avatarUrl: res.url! } : r)),
          }));
        } else {
          setRevForm((prev) => ({ ...prev, avatarUrl: res.url }));
        }
        const sizeInfo = res.originalSize && res.compressedSize
          ? ` (${formatBytes(res.originalSize)} ➔ ${formatBytes(res.compressedSize)})`
          : '';
        showToast('success', `อัปโหลดรูปโปรไฟล์รีวิวลง site-images สำเร็จ!${sizeInfo}`);
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
      customerReviews: (prev.customerReviews || DEFAULT_CUSTOMER_REVIEWS).map((r) => (r.id === id ? { ...r, isActive: r.isActive === false } : r)),
    }));
  };

  const handleOpenAdd = () => {
    setEditingRevId(null);
    setRevForm({
      customerName: '',
      location: 'กรุงเทพมหานคร',
      productName: 'Coway Neo Plus',
      rating: 5,
      date: 'อัปเดตล่าสุด',
      comment: '',
      avatarUrl: '',
      verified: true,
      isActive: true,
    });
    setIsAdding(true);
  };

  const handleOpenEdit = (rev: CustomerReviewItem) => {
    setEditingRevId(rev.id);
    setRevForm({ ...rev });
    setIsAdding(true);
  };

  const handleSaveForm = () => {
    if (!revForm.customerName?.trim() || !revForm.comment?.trim()) {
      showToast('error', 'กรุณาระบุชื่อลูกค้าและข้อความรีวิว');
      return;
    }

    if (editingRevId) {
      setFormData((prev) => ({
        ...prev,
        customerReviews: (prev.customerReviews || DEFAULT_CUSTOMER_REVIEWS).map((r) =>
          r.id === editingRevId ? ({ ...r, ...revForm } as CustomerReviewItem) : r
        ),
      }));
      showToast('success', 'แก้ไขรีวิวลูกค้าสำเร็จ! (กดบันทึกเพื่อบันทึกลง Supabase)');
    } else {
      const created: CustomerReviewItem = {
        id: `rev-${Date.now()}`,
        customerName: revForm.customerName || '',
        location: revForm.location || 'ประเทศไทย',
        productName: revForm.productName || 'Coway',
        rating: revForm.rating || 5,
        date: revForm.date || 'อัปเดตล่าสุด',
        comment: revForm.comment || '',
        avatarUrl: revForm.avatarUrl || '',
        verified: revForm.verified !== false,
        isActive: revForm.isActive !== false,
        order: (formData.customerReviews?.length || 0) + 1,
      };
      setFormData((prev) => ({
        ...prev,
        customerReviews: [created, ...(prev.customerReviews || DEFAULT_CUSTOMER_REVIEWS)],
      }));
      showToast('success', 'เพิ่มรีวิวลูกค้าใหม่สำเร็จ! (กดบันทึกเพื่อบันทึกลง Supabase)');
    }
    setIsAdding(false);
    setEditingRevId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวของ "${name}"?`)) return;
    setFormData((prev) => ({
      ...prev,
      customerReviews: (prev.customerReviews || DEFAULT_CUSTOMER_REVIEWS).filter((r) => r.id !== id),
    }));
    showToast('success', 'ลบรีวิวออกจากรายการแล้ว');
  };

  const filteredReviews = reviewsList.filter(
    (r) => r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
           r.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-emerald-600" />
            <span>จัดการรีวิวลูกค้า (Customer Reviews)</span>
          </h3>
          <p className="text-xs text-slate-500">
            เพิ่ม แก้ไข ลบ เปิด-ปิดการแสดงผล และเปลี่ยนรูปโปรไฟล์รีวิว (Bucket: site-images)
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>➕ เพิ่มรีวิวใหม่</span>
          </button>
        )}
      </div>

      {!isAdding && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อลูกค้า รุ่นสินค้า หรือข้อความรีวิว..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-emerald-500"
          />
        </div>
      )}

      {isAdding && (
        <div className="p-5 bg-emerald-50/70 rounded-3xl border-2 border-emerald-300 space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
            <span className="font-bold text-sm text-emerald-950">
              {editingRevId ? '✏️ แก้ไขข้อมูลรีวิว' : '➕ เพิ่มรีวิวลูกค้าใหม่'}
            </span>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">ชื่อลูกค้า *</label>
              <input
                type="text"
                value={revForm.customerName || ''}
                onChange={(e) => setRevForm({ ...revForm, customerName: e.target.value })}
                placeholder="เช่น คุณวราภรณ์ สุขสถิต"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">จังหวัด / พื้นที่</label>
              <input
                type="text"
                value={revForm.location || ''}
                onChange={(e) => setRevForm({ ...revForm, location: e.target.value })}
                placeholder="เช่น กรุงเทพมหานคร, เชียงใหม่"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">รุ่นสินค้าที่ติดตั้ง</label>
              <input
                type="text"
                value={revForm.productName || ''}
                onChange={(e) => setRevForm({ ...revForm, productName: e.target.value })}
                placeholder="เช่น Coway Neo Plus, Coway My Ice"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">คะแนนความพึงพอใจ (ดาว)</label>
              <select
                value={revForm.rating || 5}
                onChange={(e) => setRevForm({ ...revForm, rating: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-emerald-500"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 ดาว - ประทับใจมากที่สุด)</option>
                <option value={4}>⭐⭐⭐⭐ (4 ดาว - พึงพอใจมาก)</option>
                <option value={3}>⭐⭐⭐ (3 ดาว - ปานกลาง)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">ข้อความรีวิวและความประทับใจ *</label>
              <textarea
                rows={3}
                value={revForm.comment || ''}
                onChange={(e) => setRevForm({ ...revForm, comment: e.target.value })}
                placeholder="พิมพ์ข้อความรีวิว เช่น น้ำสะอาดมาก บริการ Cody มาล้างถังตรงเวลา..."
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-slate-700 font-semibold">รูปโปรไฟล์ / รูปติดตั้ง (อัปโหลดเข้า site-images หรือวาง URL)</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={revForm.avatarUrl || ''}
                  onChange={(e) => setRevForm({ ...revForm, avatarUrl: e.target.value })}
                  placeholder="https://... หรือกดปุ่มอัปโหลดรูปภาพ"
                  className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-emerald-500 font-mono text-xs"
                />
                <label className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors text-xs">
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
                    onChange={(e) => handleAvatarUpload(e)}
                    className="hidden"
                    disabled={isUploading === 'form'}
                  />
                </label>
              </div>

              {revForm.avatarUrl && (
                <div className="p-2.5 bg-white rounded-2xl border border-slate-200 flex items-center gap-3">
                  <img src={revForm.avatarUrl} alt="พรีวิวรูปโปรไฟล์" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                  <span className="text-[11px] text-emerald-600 font-medium">🟢 รูปภาพพร้อมบันทึก</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-emerald-200">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSaveForm}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingRevId ? 'อัปเดตรีวิว' : 'บันทึกรีวิว'}</span>
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              {rev.avatarUrl ? (
                <img src={rev.avatarUrl} alt={rev.customerName} className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-sm">
                  {rev.customerName.charAt(0) || 'C'}
                </div>
              )}

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(rev.id)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                      rev.isActive !== false
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {rev.isActive !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{rev.isActive !== false ? 'เปิดแสดงผล' : 'ปิดการแสดงผล'}</span>
                  </button>

                  <div className="flex items-center">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="text-[11px] text-slate-400">รุ่น {rev.productName}</span>
                </div>

                <div className="font-semibold text-slate-900 text-xs sm:text-sm flex items-center gap-1">
                  <span>{rev.customerName}</span>
                  <span className="text-[11px] text-slate-400">({rev.location})</span>
                </div>
                <div className="text-[11px] text-slate-500 italic line-clamp-1 max-w-xl">
                  "{rev.comment}"
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0">
              <button
                onClick={() => handleOpenEdit(rev)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>แก้ไข</span>
              </button>

              <label className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>{isUploading === rev.id ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูป'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarUpload(e, rev.id)}
                  className="hidden"
                  disabled={isUploading === rev.id}
                />
              </label>

              <button
                onClick={() => handleDelete(rev.id, rev.customerName)}
                title="ลบรีวิวนี้"
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
