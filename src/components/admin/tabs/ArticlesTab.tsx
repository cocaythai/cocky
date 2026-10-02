import React, { useState } from 'react';
import { SiteSettings, Article } from '../../../types/settings';
import { DEFAULT_ARTICLES } from '../../../data/defaultArticles';
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
  BookOpen, 
  Save, 
  Search, 
  Clock, 
  FileText 
} from 'lucide-react';

interface ArticlesTabProps {
  formData: SiteSettings;
  setFormData: React.Dispatch<React.SetStateAction<SiteSettings>>;
  showToast: (type: 'success' | 'error', message: string) => void;
}

export const ArticlesTab: React.FC<ArticlesTabProps> = ({ formData, setFormData, showToast }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [articleSearch, setArticleSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [articleForm, setArticleForm] = useState<Partial<Article>>({
    title: '',
    category: 'water',
    categoryLabel: 'เครื่องกรองน้ำ & RO',
    summary: '',
    readTime: '3 นาที',
    date: 'อัปเดตล่าสุด 2026',
    imageUrl: '',
    keyPoints: [],
    content: [],
    isActive: true,
  });

  const [keyPointsRaw, setKeyPointsRaw] = useState('');
  const [contentRaw, setContentRaw] = useState('');

  const articlesList: Article[] = formData.articles && formData.articles.length > 0
    ? formData.articles
    : DEFAULT_ARTICLES;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, articleId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadKey = articleId || 'form';
    setIsUploading(uploadKey);
    try {
      const oldUrl = articleId ? articlesList.find((a) => a.id === articleId)?.imageUrl : undefined;
      const res = await storageService.uploadImage(file, 'articles', oldUrl);
      if (res.success && res.url) {
        if (articleId) {
          setFormData((prev) => ({
            ...prev,
            articles: (prev.articles || DEFAULT_ARTICLES).map((a) => (a.id === articleId ? { ...a, imageUrl: res.url! } : a)),
          }));
        } else {
          setArticleForm((prev) => ({ ...prev, imageUrl: res.url }));
        }
        const sizeInfo = res.originalSize && res.compressedSize
          ? ` (${formatBytes(res.originalSize)} ➔ ${formatBytes(res.compressedSize)})`
          : '';
        showToast('success', `อัปโหลดรูปภาพบทความลง site-images สำเร็จ!${sizeInfo}`);
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
      articles: (prev.articles || DEFAULT_ARTICLES).map((a) => (a.id === id ? { ...a, isActive: a.isActive === false } : a)),
    }));
  };

  const handleOpenAdd = () => {
    setEditingArticleId(null);
    setArticleForm({
      title: '',
      category: 'water',
      categoryLabel: 'เครื่องกรองน้ำ & RO',
      summary: '',
      readTime: '3 นาที',
      date: 'อัปเดตล่าสุด 2026',
      imageUrl: '',
      keyPoints: [],
      content: [],
      isActive: true,
    });
    setKeyPointsRaw('');
    setContentRaw('');
    setIsAdding(true);
  };

  const handleOpenEdit = (art: Article) => {
    setEditingArticleId(art.id);
    setArticleForm({ ...art });
    setKeyPointsRaw(art.keyPoints ? art.keyPoints.join('\n') : '');
    setContentRaw(art.content ? art.content.join('\n\n') : '');
    setIsAdding(true);
  };

  const handleSaveForm = () => {
    if (!articleForm.title?.trim() || !articleForm.summary?.trim() || !articleForm.imageUrl?.trim()) {
      showToast('error', 'กรุณาระบุหัวข้อ สรุปย่อ และรูปภาพบทความ');
      return;
    }

    const keyPoints = keyPointsRaw.split('\n').map((k) => k.trim()).filter((k) => k.length > 0);
    const content = contentRaw.split('\n\n').map((c) => c.trim()).filter((c) => c.length > 0);

    let catLabel = articleForm.categoryLabel;
    if (!catLabel) {
      if (articleForm.category === 'service') catLabel = 'บริการ Cody Heart Service';
      else if (articleForm.category === 'air') catLabel = 'เครื่องฟอกอากาศ & สุขภาพ';
      else if (articleForm.category === 'health') catLabel = 'ความคุ้มค่า & ไลฟ์สไตล์';
      else catLabel = 'เครื่องกรองน้ำ & RO';
    }

    if (editingArticleId) {
      setFormData((prev) => ({
        ...prev,
        articles: (prev.articles || DEFAULT_ARTICLES).map((a) =>
          a.id === editingArticleId
            ? {
                ...a,
                ...articleForm,
                categoryLabel: catLabel,
                keyPoints: keyPoints.length > 0 ? keyPoints : [articleForm.title!],
                content: content.length > 0 ? content : [articleForm.summary!],
              } as Article
            : a
        ),
      }));
      showToast('success', 'แก้ไขข้อมูลบทความสำเร็จ! (กดบันทึกเพื่อบันทึกลง Supabase)');
    } else {
      const created: Article = {
        id: `article-${Date.now()}`,
        title: articleForm.title || '',
        category: (articleForm.category as any) || 'water',
        categoryLabel: catLabel || 'สาระน่ารู้',
        summary: articleForm.summary || '',
        readTime: articleForm.readTime || '3 นาที',
        date: articleForm.date || 'อัปเดตล่าสุด 2026',
        imageUrl: articleForm.imageUrl || '',
        keyPoints: keyPoints.length > 0 ? keyPoints : [articleForm.title!],
        content: content.length > 0 ? content : [articleForm.summary!],
        isActive: articleForm.isActive !== false,
      };
      setFormData((prev) => ({
        ...prev,
        articles: [created, ...(prev.articles || DEFAULT_ARTICLES)],
      }));
      showToast('success', 'เพิ่มบทความใหม่สำเร็จ! (กดบันทึกเพื่อบันทึกลง Supabase)');
    }
    setIsAdding(false);
    setEditingArticleId(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบทความ "${title}"?`)) return;
    setFormData((prev) => ({
      ...prev,
      articles: (prev.articles || DEFAULT_ARTICLES).filter((a) => a.id !== id),
    }));
    showToast('success', 'ลบบทความออกจากรายการแล้ว');
  };

  const filteredArticles = articlesList.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
      a.summary.toLowerCase().includes(articleSearch.toLowerCase());
    const matchesCat = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <span>จัดการบทความ (Articles Management)</span>
          </h3>
          <p className="text-xs text-slate-500">
            เพิ่ม แก้ไข ลบ เปิด-ปิดการแสดงผล และเปลี่ยนรูปภาพบทความ (Bucket: site-images)
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>➕ เพิ่มบทความใหม่</span>
          </button>
        )}
      </div>

      {!isAdding && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อบทความ หรือเนื้อหา..."
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'water', label: 'เครื่องกรองน้ำ' },
              { id: 'service', label: 'บริการ Cody' },
              { id: 'air', label: 'เครื่องฟอกอากาศ' },
              { id: 'health', label: 'สุขภาพ & ความคุ้มค่า' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isAdding && (
        <div className="p-5 bg-sky-50/70 rounded-3xl border-2 border-sky-300 space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-sky-200">
            <span className="font-bold text-sm text-sky-950">
              {editingArticleId ? '✏️ แก้ไขข้อมูลบทความ' : '➕ เพิ่มบทความใหม่'}
            </span>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">หัวข้อบทความ *</label>
              <input
                type="text"
                value={articleForm.title || ''}
                onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                placeholder="เช่น ทำไมคนรุ่นใหม่ถึงเปลี่ยนจากน้ำขวดแพ็คมาใช้ Coway Subscription?"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">หมวดหมู่</label>
              <select
                value={articleForm.category || 'water'}
                onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500"
              >
                <option value="water">เครื่องกรองน้ำ & RO</option>
                <option value="service">บริการ Cody Heart Service</option>
                <option value="air">เครื่องฟอกอากาศ & PM 2.5</option>
                <option value="health">ความคุ้มค่า & ไลฟ์สไตล์สุขภาพ</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">ระยะเวลาในการอ่าน</label>
              <input
                type="text"
                value={articleForm.readTime || '3 นาที'}
                onChange={(e) => setArticleForm({ ...articleForm, readTime: e.target.value })}
                placeholder="เช่น 3 นาที"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">คำโปรย / สรุปย่อ *</label>
              <textarea
                rows={2}
                value={articleForm.summary || ''}
                onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                placeholder="สรุปเนื้อหาสำคัญ 2-3 บรรทัด..."
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-slate-700 font-semibold">รูปภาพปกบทความ (อัปโหลดเข้า site-images หรือวาง URL) *</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={articleForm.imageUrl || ''}
                  onChange={(e) => setArticleForm({ ...articleForm, imageUrl: e.target.value })}
                  placeholder="https://... หรือกดปุ่มอัปโหลดรูปภาพ"
                  className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500 font-mono text-xs"
                />
                <label className="px-4 py-2 bg-slate-900 hover:bg-sky-600 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors text-xs">
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

              {articleForm.imageUrl && (
                <div className="p-2.5 bg-white rounded-2xl border border-slate-200 flex items-center gap-3">
                  <div className="w-20 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <img src={articleForm.imageUrl} alt="พรีวิวบทความ" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">🟢 รูปภาพพร้อมบันทึก</span>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">จุดเด่น / Key Takeaways (1 บรรทัดต่อ 1 ข้อ)</label>
              <textarea
                rows={2}
                value={keyPointsRaw}
                onChange={(e) => setKeyPointsRaw(e.target.value)}
                placeholder={'ประหยัดเงินปีละนับหมื่นบาท\nบริการล้างถังฟรีทุก 2 เดือน'}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">เนื้อหาบทความฉบับเต็ม (เว้นบรรทัด 2 ครั้งเพื่อขึ้นย่อหน้าใหม่)</label>
              <textarea
                rows={4}
                value={contentRaw}
                onChange={(e) => setContentRaw(e.target.value)}
                placeholder={'ย่อหน้าที่ 1: เกริ่นนำ...\n\nย่อหน้าที่ 2: รายละเอียด...'}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-sky-200">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSaveForm}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingArticleId ? 'อัปเดตบทความ' : 'บันทึกบทความ'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="space-y-3">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-24 sm:w-28 h-18 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative">
                <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(art.id)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                      art.isActive !== false
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {art.isActive !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{art.isActive !== false ? 'เปิดแสดงผล' : 'ปิดการแสดงผล'}</span>
                  </button>

                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded-md">
                    {art.categoryLabel || 'สาระน่ารู้'}
                  </span>
                </div>

                <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                  {art.title}
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                  {art.summary}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0">
              <button
                onClick={() => handleOpenEdit(art)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>แก้ไข</span>
              </button>

              <label className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>{isUploading === art.id ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูป'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, art.id)}
                  className="hidden"
                  disabled={isUploading === art.id}
                />
              </label>

              <button
                onClick={() => handleDelete(art.id, art.title)}
                title="ลบบทความนี้"
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
