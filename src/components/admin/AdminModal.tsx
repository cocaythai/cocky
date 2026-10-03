import React, { useState } from 'react';
import { SiteSettings, HeroBanner } from '../../types/settings';
import { Article } from '../../types/article';
import { DEFAULT_ARTICLES } from '../../data/defaultArticles';
import { DEFAULT_KNOWLEDGE_TIPS } from '../../data/defaultKnowledge';
import { DEFAULT_CUSTOMER_REVIEWS } from '../../data/defaultReviews';
import { CowayProduct } from '../../types/index.ts';
import { settingsService } from '../../services/settingsService';
import { adminProductService } from '../../services/adminProductService';
import { storageService, STORAGE_BUCKET } from '../../services/storageService';
import { formatBytes } from '../../utils/imageCompressor';
import { BannersTab } from './tabs/BannersTab';
import { ArticlesTab } from './tabs/ArticlesTab';
import { KnowledgeTab } from './tabs/KnowledgeTab';
import { ReviewsTab } from './tabs/ReviewsTab';
import {
  X,
  Settings,
  Package,
  Upload,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  Image as ImageIcon,
  Edit,
  ExternalLink,
  Globe,
  Sliders,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  User,
  ArrowLeft,
  LayoutDashboard,
  Database,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Share2,
  Sparkles,
  UserCheck,
  BookOpen,
  FileText,
  Clock,
  Lightbulb,
  MessageSquareQuote,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';

export type AdminMenuTab = 'dashboard' | 'products' | 'banners' | 'articles' | 'knowledge' | 'reviews' | 'contact' | 'settings';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings: SiteSettings;
  onSaveSettings: (newSettings: SiteSettings) => Promise<{ success: boolean; message: string }>;
  products: CowayProduct[];
  onRefreshProducts: () => void;
  onRefreshSettings: () => void;
  userEmail?: string;
  onLogout?: () => void;
  isStandalonePage?: boolean;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  siteSettings,
  onSaveSettings,
  products,
  onRefreshProducts,
  onRefreshSettings,
  userEmail,
  onLogout,
  isStandalonePage = false,
}) => {
  const [activeTab, setActiveTab] = useState<AdminMenuTab>('dashboard');
  const [formData, setFormData] = useState<SiteSettings>({ ...siteSettings });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Product Management State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: 790,
    imageUrl: '',
    images: [] as string[], // Up to 5 product images
    description: '',
    category: 'water',
  });
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);
  const [productImageUploading, setProductImageUploading] = useState(false);
  const [productImageUploadProgress, setProductImageUploadProgress] = useState<string | null>(null);
  const [productImageStats, setProductImageStats] = useState<string | null>(null);
  const [inputImageUrl, setInputImageUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);

  // Article Management State
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
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
  });
  const [articleKeyPointsRaw, setArticleKeyPointsRaw] = useState('');
  const [articleContentRaw, setArticleContentRaw] = useState('');
  const [articleSearch, setArticleSearch] = useState('');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState('all');
  const [articleImageUploading, setArticleImageUploading] = useState(false);
  const [articleImageStats, setArticleImageStats] = useState<string | null>(null);

  // Sync formData whenever modal opens or siteSettings changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({ ...siteSettings });
      setFeedback(null);
    }
  }, [isOpen, siteSettings]);

  if (!isOpen) return null;

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ==========================================
  // 1. LOGO UPLOAD ACTION
  // ==========================================
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      const res = await storageService.uploadImage(file, 'banners', formData.logoUrl);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, logoUrl: res.url }));
        showToast('success', 'อัปโหลด Logo สำเร็จ! (กดบันทึกเพื่อใช้งานบนเว็บไซต์)');
      } else {
        showToast('error', res.error || 'อัปโหลด Logo ไม่สำเร็จ');
      }
    } catch (err: any) {
      showToast('error', err.message || 'เกิดข้อผิดพลาดในการอัปโหลด Logo');
    } finally {
      setLogoUploading(false);
    }
  };

  // ==========================================
  // 3. PRODUCT ACTIONS & MULTI-IMAGE MANAGEMENT (Max 5 images)
  // ==========================================
  const handleProductFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const currentCount = productForm.images.length;
    if (currentCount >= 5) {
      showToast('error', '⚠️ สินค้า 1 รายการสามารถเพิ่มรูปภาพได้สูงสุด 5 รูปเท่านั้น กรุณาลบรูปที่ไม่ต้องการออกก่อนเพิ่มใหม่');
      e.target.value = '';
      return;
    }

    const availableSlots = 5 - currentCount;
    if (files.length > availableSlots) {
      showToast('error', `⚠️ จำกัดสูงสุด 5 รูปต่อสินค้า! คุณเลือกมา ${files.length} รูป แต่เหลือโควตาเพียง ${availableSlots} รูป (ระบบจะอัปโหลดเฉพาะ ${availableSlots} รูปแรก)`);
    }

    const filesToUpload = files.slice(0, availableSlots);
    setProductImageUploading(true);
    setProductImageUploadProgress(`กำลังอัปโหลด 0/${filesToUpload.length} รูป...`);

    try {
      const results = await storageService.uploadMultipleImages(
        filesToUpload,
        'products',
        (completed, total) => {
          setProductImageUploadProgress(`กำลังอัปโหลด ${completed}/${total} รูป...`);
        }
      );

      const successfulUrls: string[] = [];
      let compressedInfo = '';
      for (const res of results) {
        if (res.success && res.url) {
          successfulUrls.push(res.url);
          if (res.originalSize && res.compressedSize) {
            compressedInfo = `บีบอัดรูปภาพเฉลี่ยจาก ${formatBytes(res.originalSize)} เหลือ ${formatBytes(res.compressedSize)}`;
          }
        }
      }

      if (successfulUrls.length > 0) {
        setProductForm((prev) => {
          const combined = [...prev.images, ...successfulUrls].slice(0, 5);
          return {
            ...prev,
            images: combined,
            imageUrl: combined[0] || '',
          };
        });
        setProductImageStats(compressedInfo || `อัปโหลด ${successfulUrls.length} รูปภาพสำเร็จ`);
        showToast('success', `อัปโหลดรูปภาพสินค้าเข้า Supabase Storage สำเร็จ ${successfulUrls.length} รูป (รูปแรกกำหนดเป็นรูปหลักอัตโนมัติ)`);
      } else {
        showToast('error', 'อัปโหลดรูปภาพไม่สำเร็จ กรุณาตรวจสอบสิทธิ์และการเชื่อมต่อ Supabase Storage');
      }
    } catch (err: any) {
      showToast('error', err.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    } finally {
      setProductImageUploading(false);
      setProductImageUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const url = inputImageUrl.trim();
    if (!url) return;
    if (productForm.images.length >= 5) {
      showToast('error', '⚠️ สินค้า 1 รายการสามารถเพิ่มรูปภาพได้สูงสุด 5 รูปเท่านั้น');
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      showToast('error', 'กรุณาระบุ URL รูปภาพที่ถูกต้อง (ขึ้นต้นด้วย https:// หรือ http://)');
      return;
    }

    setProductForm((prev) => {
      const updated = [...prev.images, url].slice(0, 5);
      return {
        ...prev,
        images: updated,
        imageUrl: updated[0] || '',
      };
    });
    setInputImageUrl('');
    showToast('success', 'เพิ่ม URL รูปภาพเรียบร้อยแล้ว (สามารถจัดลำดับหรือตั้งเป็นรูปหลักได้)');
  };

  const handleMoveProductImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...productForm.images];
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newImages.length) return;

    const temp = newImages[index];
    newImages[index] = newImages[targetIdx];
    newImages[targetIdx] = temp;

    setProductForm((prev) => ({
      ...prev,
      images: newImages,
      imageUrl: newImages[0] || '',
    }));
  };

  const handleSetMainProductImage = (index: number) => {
    if (index === 0) return;
    const newImages = [...productForm.images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);

    setProductForm((prev) => ({
      ...prev,
      images: newImages,
      imageUrl: newImages[0] || '',
    }));
    showToast('success', 'กำหนดเป็นรูปหลัก (Main Image) เรียบร้อยแล้ว');
  };

  const handleDeleteProductImage = (index: number) => {
    const newImages = productForm.images.filter((_, idx) => idx !== index);

    setProductForm((prev) => ({
      ...prev,
      images: newImages,
      imageUrl: newImages[0] || '',
    }));
    showToast('success', 'ลบรูปภาพออกจากสินค้าแล้ว (หากกดบันทึก ระบบจะลบไฟล์ที่ไม่ได้ใช้ออกจาก Storage อัตโนมัติ)');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) {
      showToast('error', 'กรุณากรอกชื่อสินค้า');
      return;
    }

    const currentImages = productForm.images.length > 0
      ? productForm.images.slice(0, 5)
      : (productForm.imageUrl ? [productForm.imageUrl] : []);

    if (currentImages.length === 0) {
      showToast('error', 'กรุณาใส่รูปสินค้าอย่างน้อย 1 รูป (สูงสุด 5 รูป)');
      return;
    }

    setIsProductSubmitting(true);
    try {
      if (editingProductId) {
        const oldProduct = products.find((p) => p.id === editingProductId);
        const oldImages = oldProduct?.images && oldProduct.images.length > 0
          ? oldProduct.images
          : (oldProduct?.image ? [oldProduct.image] : []);

        const res = await adminProductService.updateProduct(
          editingProductId,
          {
            name: productForm.name,
            price: Number(productForm.price),
            image_url: currentImages[0],
            images: currentImages,
            description: productForm.description,
            category: productForm.category,
          },
          oldImages
        );
        if (res.success) {
          showToast('success', res.message);
          setIsAddingProduct(false);
          setEditingProductId(null);
          onRefreshProducts();
        } else {
          showToast('error', res.message);
        }
      } else {
        const res = await adminProductService.createProduct({
          name: productForm.name,
          price: Number(productForm.price),
          image_url: currentImages[0],
          images: currentImages,
          description: productForm.description,
          category: productForm.category,
        });
        if (res.success) {
          showToast('success', res.message);
          setIsAddingProduct(false);
          setProductForm({ name: '', price: 790, imageUrl: '', images: [], description: '', category: 'water' });
          onRefreshProducts();
        } else {
          showToast('error', res.message);
        }
      }
    } catch (err: any) {
      showToast('error', err.message || 'เกิดข้อผิดพลาดในการบันทึกสินค้า');
    } finally {
      setIsProductSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${name}" ออกจาก Supabase?`)) {
      return;
    }
    try {
      const target = products.find((p) => p.id === id);
      const targetImages = target?.images && target.images.length > 0
        ? target.images
        : (target?.image ? [target.image] : []);

      const res = await adminProductService.deleteProduct(id, targetImages);
      if (res.success) {
        showToast('success', res.message);
        onRefreshProducts();
      } else {
        showToast('error', res.message);
      }
    } catch (err: any) {
      showToast('error', err.message || 'ลบสินค้าไม่สำเร็จ');
    }
  };

  // ==========================================
  // 3. ARTICLE ACTIONS
  // ==========================================
  const handleArticleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArticleImageUploading(true);
    setArticleImageStats(null);
    try {
      const res = await storageService.uploadImage(file, 'articles', articleForm.imageUrl);
      if (res.success && res.url) {
        setArticleForm((prev) => ({ ...prev, imageUrl: res.url }));
        const stats = res.originalSize && res.compressedSize
          ? `บีบอัดจาก ${formatBytes(res.originalSize)} เหลือ ${formatBytes(res.compressedSize)}`
          : 'อัปโหลดสำเร็จ';
        setArticleImageStats(stats);
        showToast('success', `อัปโหลดรูปภาพบทความสำเร็จ! (${stats})`);
      } else {
        showToast('error', res.error || 'อัปโหลดรูปภาพไม่สำเร็จ');
      }
    } catch (err: any) {
      showToast('error', err.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูป');
    } finally {
      setArticleImageUploading(false);
    }
  };

  const handleOpenAddArticle = () => {
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
    });
    setArticleKeyPointsRaw('');
    setArticleContentRaw('');
    setArticleImageStats(null);
    setIsAddingArticle(true);
  };

  const handleOpenEditArticle = (art: Article) => {
    setEditingArticleId(art.id);
    setArticleForm({ ...art });
    setArticleKeyPointsRaw(art.keyPoints ? art.keyPoints.join('\n') : '');
    setArticleContentRaw(art.content ? art.content.join('\n\n') : '');
    setArticleImageStats(null);
    setIsAddingArticle(true);
  };

  const handleSaveArticleForm = () => {
    if (!articleForm.title?.trim()) {
      showToast('error', 'กรุณาระบุชื่อหัวข้อบทความ');
      return;
    }
    if (!articleForm.summary?.trim()) {
      showToast('error', 'กรุณาระบุเนื้อหาเกริ่นนำ (Summary)');
      return;
    }
    if (!articleForm.imageUrl?.trim()) {
      showToast('error', 'กรุณาระบุหรืออัปโหลดรูปภาพบทความ');
      return;
    }

    const keyPoints = articleKeyPointsRaw
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const content = articleContentRaw
      .split('\n\n')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const finalKeyPoints = keyPoints.length > 0 ? keyPoints : [articleForm.title!];
    const finalContent = content.length > 0 ? content : [articleForm.summary!];

    // Category label fallback
    let catLabel = articleForm.categoryLabel;
    if (!catLabel) {
      if (articleForm.category === 'water') catLabel = 'เครื่องกรองน้ำ & RO';
      else if (articleForm.category === 'service') catLabel = 'บริการ Cody Heart Service';
      else if (articleForm.category === 'air') catLabel = 'เครื่องฟอกอากาศ & สุขภาพ';
      else catLabel = 'สาระสุขภาพ & ความคุ้มค่า';
    }

    const existingArticles = formData.articles && formData.articles.length > 0
      ? formData.articles
      : DEFAULT_ARTICLES;

    let updatedArticles: Article[];
    if (editingArticleId) {
      updatedArticles = existingArticles.map((art) =>
        art.id === editingArticleId
          ? {
              ...art,
              title: articleForm.title || art.title,
              category: (articleForm.category as any) || art.category,
              categoryLabel: catLabel || art.categoryLabel,
              summary: articleForm.summary || art.summary,
              readTime: articleForm.readTime || '3 นาที',
              date: articleForm.date || 'อัปเดตล่าสุด 2026',
              imageUrl: articleForm.imageUrl || art.imageUrl,
              keyPoints: finalKeyPoints,
              content: finalContent,
            }
          : art
      );
      showToast('success', 'แก้ไขข้อมูลบทความสำเร็จ! (กดบันทึกเพื่ออัปเดตลง Supabase)');
    } else {
      const newArticle: Article = {
        id: `article-${Date.now()}`,
        title: articleForm.title || '',
        category: (articleForm.category as any) || 'water',
        categoryLabel: catLabel || 'สาระน่ารู้',
        summary: articleForm.summary || '',
        readTime: articleForm.readTime || '3 นาที',
        date: articleForm.date || 'อัปเดตล่าสุด 2026',
        imageUrl: articleForm.imageUrl || '',
        keyPoints: finalKeyPoints,
        content: finalContent,
      };
      updatedArticles = [newArticle, ...existingArticles];
      showToast('success', 'เพิ่มบทความใหม่เรียบร้อยแล้ว! (กดบันทึกเพื่ออัปเดตลง Supabase)');
    }

    setFormData((prev) => ({
      ...prev,
      articles: updatedArticles,
    }));

    setIsAddingArticle(false);
    setEditingArticleId(null);
  };

  const handleDeleteArticle = (id: string, title: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบทความ "${title}"?`)) {
      return;
    }
    const existingArticles = formData.articles && formData.articles.length > 0
      ? formData.articles
      : DEFAULT_ARTICLES;

    const filtered = existingArticles.filter((a) => a.id !== id);
    setFormData((prev) => ({
      ...prev,
      articles: filtered,
    }));
    showToast('success', 'ลบบทความออกจากรายการแล้ว (กดบันทึกเพื่อยืนยันลง Supabase)');
  };

  // ==========================================
  // 4. SAVE ALL SETTINGS TO SUPABASE
  // ==========================================
  const handleSaveAllSettings = async () => {
    setIsSaving(true);
    try {
      const res = await onSaveSettings(formData);
      if (res.success) {
        showToast('success', 'บันทึกสำเร็จ! ข้อมูลถูกอัปเดตลง Supabase เรียบร้อยแล้ว');
        onRefreshSettings();
      } else {
        showToast('error', res.message);
      }
    } catch (err: any) {
      showToast('error', err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Products for Catalog Management Tab
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeBannersCount = formData.banners.filter((b) => b.isActive).length;

  const wrapperClass = isStandalonePage
    ? 'min-h-screen bg-slate-900 py-4 sm:py-8 px-2 sm:px-6 flex justify-center items-start'
    : 'fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center items-start sm:p-4 p-0';

  return (
    <div className={wrapperClass}>
      <div className="bg-white w-full max-w-5xl min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* ========================================================= */}
        {/* TOP HEADER */}
        {/* ========================================================= */}
        <header className="bg-slate-900 text-white p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">ระบบจัดการเว็บไซต์ (Admin Portal)</h2>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Supabase Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                จัดการสินค้า แบนเนอร์ ข้อมูลติดต่อ และการตั้งค่าเว็บไซต์อย่างสมบูรณ์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userEmail && (
              <span className="text-[11px] text-slate-300 hidden md:inline-flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span className="max-w-[140px] truncate">{userEmail}</span>
              </span>
            )}

            {/* View Website Button */}
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              title="กลับสู่หน้าเว็บไซต์หลัก"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>ดูเว็บไซต์</span>
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="ออกจากระบบ"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>ออกจากระบบ</span>
              </button>
            )}

            {!isStandalonePage && (
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        {/* ========================================================= */}
        {/* SUB-NAVIGATION TABS (Thumb-friendly & Scrollable) */}
        {/* ========================================================= */}
        <nav className="flex border-b border-slate-200 bg-slate-50 px-2 sm:px-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3.5 px-3 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3.5 px-3 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>สินค้า ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`py-3.5 px-3 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'banners'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>แบนเนอร์ ({formData.banners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`py-3.5 px-3 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'articles'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>บทความ ({formData.articles?.length || DEFAULT_ARTICLES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`py-3.5 px-3 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'knowledge'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>สาระน่ารู้ ({formData.knowledgeTips?.length || DEFAULT_KNOWLEDGE_TIPS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3.5 px-3 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4 text-emerald-600" />
            <span>รีวิว ({formData.customerReviews?.length || DEFAULT_CUSTOMER_REVIEWS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`py-3.5 px-3 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>ข้อมูลติดต่อ</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-3 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>ตั้งค่าเว็บไซต์</span>
          </button>
        </nav>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`mx-4 sm:mx-6 mt-4 p-3.5 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-medium animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB BODY CONTENTS */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* ------------------------------------------------------- */}
          {/* TAB 1: DASHBOARD */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    ภาพรวมระบบ (Dashboard)
                  </h3>
                  <p className="text-xs text-slate-500">
                    สรุปสถานะสินค้า แบนเนอร์ และความพร้อมของฐานข้อมูล Supabase
                  </p>
                </div>
                <div className="text-xs text-slate-400">
                  อัปเดตล่าสุด: {formData.updatedAt ? new Date(formData.updatedAt).toLocaleString('th-TH') : 'เพิ่งเริ่มต้น'}
                </div>
              </div>

              {/* 4 Overview Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Products Stat */}
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">จำนวนสินค้า</span>
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-900">{products.length}</div>
                    <div className="text-xs text-slate-500 mt-1">รายการสินค้าในตาราง `products`</div>
                  </div>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="w-full py-2 bg-white hover:bg-slate-100 rounded-xl text-xs font-semibold text-sky-600 border border-slate-200 transition-colors cursor-pointer"
                  >
                    จัดการสินค้า →
                  </button>
                </div>

                {/* 2. Banners Stat */}
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">จำนวนแบนเนอร์</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-900">{formData.banners.length}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      กำลังแสดงผลบนหน้าแรก <strong className="text-emerald-600 font-semibold">{activeBannersCount}</strong> ภาพ
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('banners')}
                    className="w-full py-2 bg-white hover:bg-slate-100 rounded-xl text-xs font-semibold text-purple-600 border border-slate-200 transition-colors cursor-pointer"
                  >
                    จัดการแบนเนอร์ →
                  </button>
                </div>

                {/* 3. Articles Stat */}
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">จำนวนบทความ</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-900">
                      {formData.articles?.length || DEFAULT_ARTICLES.length}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      บทความ & สาระน่ารู้เพื่อสุขภาพ
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('articles')}
                    className="w-full py-2 bg-white hover:bg-slate-100 rounded-xl text-xs font-semibold text-blue-600 border border-slate-200 transition-colors cursor-pointer"
                  >
                    จัดการบทความ →
                  </button>
                </div>

                {/* 4. Supabase Connection Status */}
                <div className="bg-emerald-50/60 p-5 rounded-3xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800">สถานะการเชื่อมต่อ</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-base font-bold text-emerald-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Supabase Live</span>
                    </div>
                    <div className="text-xs text-emerald-700/80 mt-1">
                      Storage: <span className="font-mono font-medium">{STORAGE_BUCKET}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-700 bg-white/80 p-2 rounded-xl border border-emerald-100">
                    สิทธิ์: RLS Authenticated
                  </div>
                </div>

              </div>

              {/* Quick Action Shortcuts */}
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  ⚡ ทางลัดจัดการด่วน (Quick Actions)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setIsAddingProduct(true);
                    }}
                    className="p-3 bg-white hover:bg-sky-50 hover:border-sky-300 rounded-2xl border border-slate-200 text-slate-800 text-left transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-sky-600 mb-1" />
                    <span className="font-semibold block">เพิ่มสินค้าใหม่</span>
                    <span className="text-[10px] text-slate-500">ลงตาราง products</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('banners')}
                    className="p-3 bg-white hover:bg-sky-50 hover:border-sky-300 rounded-2xl border border-slate-200 text-slate-800 text-left transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-sky-600 mb-1" />
                    <span className="font-semibold block">เพิ่มแบนเนอร์ใหม่</span>
                    <span className="text-[10px] text-slate-500">อัปโหลดเข้า Storage</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('contact')}
                    className="p-3 bg-white hover:bg-sky-50 hover:border-sky-300 rounded-2xl border border-slate-200 text-slate-800 text-left transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-sky-600 mb-1" />
                    <span className="font-semibold block">แก้ไขเบอร์โทร/LINE</span>
                    <span className="text-[10px] text-slate-500">อัปเดตทุกปุ่มบนเว็บ</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="p-3 bg-white hover:bg-sky-50 hover:border-sky-300 rounded-2xl border border-slate-200 text-slate-800 text-left transition-all cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-sky-600 mb-1" />
                    <span className="font-semibold block">ตั้งค่าชื่อร้าน &amp; Logo</span>
                    <span className="text-[10px] text-slate-500">ปรับข้อความสำคัญ</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* TAB 2: จัดการสินค้า (PRODUCTS) */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    จัดการสินค้า (Product Management)
                  </h3>
                  <p className="text-xs text-slate-500">
                    เพิ่ม แก้ไข ลบ และเปลี่ยนรูปสินค้า โดยข้อมูลเชื่อมต่อกับตาราง `products` จริง
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAddingProduct(true);
                    setEditingProductId(null);
                    setProductForm({ name: '', price: 790, imageUrl: '', images: [], description: '', category: 'water' });
                    setInputImageUrl('');
                    setProductImageStats(null);
                  }}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มสินค้าใหม่</span>
                </button>
              </div>

              {/* Product Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="ค้นหาชื่อสินค้า..."
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-sky-500"
                  />
                </div>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-sky-500"
                >
                  <option value="all">ทุกหมวดหมู่ ({products.length})</option>
                  <option value="water">เครื่องกรองน้ำ (Water)</option>
                  <option value="air">เครื่องฟอกอากาศ (Air)</option>
                  <option value="bidet">ฝารองนั่งสุขภัณฑ์ (Bidet)</option>
                  <option value="mattress">ที่นอน (Mattress)</option>
                </select>
              </div>

              {/* Product Form Modal / Section */}
              {isAddingProduct && (
                <form
                  onSubmit={handleSaveProduct}
                  className="p-5 bg-sky-50/60 rounded-3xl border-2 border-sky-200 space-y-4 animate-in fade-in"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-slate-900">
                      {editingProductId ? '✏️ แก้ไขข้อมูลสินค้า' : '➕ เพิ่มสินค้าใหม่ลง Supabase'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ชื่อสินค้า *</label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="เช่น Coway Gracie (CHP-6200N)"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ราคาเริ่มต้นรายเดือน (บาท/เดือน) *</label>
                      <input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        placeholder="790"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">หมวดหมู่สินค้า</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500"
                      >
                        <option value="water">เครื่องกรองน้ำ (Water)</option>
                        <option value="air">เครื่องฟอกอากาศ (Air)</option>
                        <option value="bidet">ฝารองนั่งสุขภัณฑ์ (Bidet)</option>
                        <option value="mattress">ที่นอนและเตียง (Mattress)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <label className="block font-semibold text-slate-900 text-xs">
                            รูปภาพสินค้า (สูงสุด 5 รูป) <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[11px] text-slate-500 block">
                            รูปแรก (ตำแหน่ง 1) จะถูกใช้เป็น <strong className="text-sky-600 font-bold">รูปหลัก (Main Image)</strong> บนหน้าเว็บไซต์ สามารถคลิกเพื่อสลับตำแหน่งหรือลบรูปได้
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                            productForm.images.length >= 5
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}>
                            {productForm.images.length}/5 รูป
                          </span>
                        </div>
                      </div>

                      {/* Upload & Add URL Toolbar */}
                      <div className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-2xl border border-slate-200">
                        {/* Multiple File Upload Button */}
                        <label className={`px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all text-xs shrink-0 ${
                          productForm.images.length >= 5
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-slate-900 hover:bg-sky-600 text-white shadow-xs'
                        }`}>
                          {productImageUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                              <span>{productImageUploadProgress || 'กำลังอัปโหลด...'}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>
                                {productForm.images.length >= 5 ? 'ครบโควตา 5 รูปแล้ว' : 'อัปโหลดรูป (เลือกหลายรูปพร้อมกันได้)'}
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={productImageUploading || productForm.images.length >= 5}
                            onChange={handleProductFilesUpload}
                            className="hidden"
                          />
                        </label>

                        {/* Direct URL Input */}
                        <div className="flex flex-1 gap-2">
                          <input
                            type="url"
                            value={inputImageUrl}
                            onChange={(e) => setInputImageUrl(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddImageUrl();
                              }
                            }}
                            disabled={productForm.images.length >= 5}
                            placeholder={
                              productForm.images.length >= 5
                                ? 'ครบโควตา 5 รูปแล้ว (ลบรูปเดิมเพื่อเพิ่มใหม่)'
                                : 'หรือวาง URL รูปภาพที่นี่ (https://...)'
                            }
                            className="flex-1 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-sky-500 disabled:opacity-60"
                          />
                          <button
                            type="button"
                            onClick={handleAddImageUrl}
                            disabled={!inputImageUrl.trim() || productForm.images.length >= 5}
                            className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
                          >
                            + เพิ่ม URL
                          </button>
                        </div>
                      </div>

                      {/* Compression / Storage Status Badge */}
                      {productImageStats && (
                        <div className="text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{productImageStats}</span>
                        </div>
                      )}

                      {/* 5-Images Preview Grid & Sorting / Management */}
                      {productForm.images.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-[11px] text-slate-500 font-medium">
                            พรีวิวรูปภาพก่อนบันทึก (สามารถคลิกเลื่อนซ้าย-ขวาเพื่อจัดลำดับ หรือคลิกตั้งเป็นรูปหลัก):
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {productForm.images.map((imgUrl, idx) => {
                              const isMain = idx === 0;
                              return (
                                <div
                                  key={`${imgUrl}-${idx}`}
                                  className={`relative bg-white rounded-2xl p-2 border-2 transition-all flex flex-col justify-between group/card shadow-2xs ${
                                    isMain
                                      ? 'border-sky-500 ring-2 ring-sky-200'
                                      : 'border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  {/* Badge on top */}
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    {isMain ? (
                                      <span className="bg-sky-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                                        <Star className="w-2.5 h-2.5 fill-current" /> รูปหลัก
                                      </span>
                                    ) : (
                                      <span className="bg-slate-100 text-slate-600 text-[9px] font-semibold px-1.5 py-0.5 rounded">
                                        รูปที่ {idx + 1}
                                      </span>
                                    )}

                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProductImage(idx)}
                                      className="w-5 h-5 rounded-md bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                      title="ลบรูปนี้"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Image View */}
                                  <div className="w-full h-24 sm:h-28 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-1 border border-slate-100">
                                    <img
                                      src={imgUrl}
                                      alt={`รูปสินค้า ${idx + 1}`}
                                      className="max-h-full max-w-full object-contain"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src =
                                          'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80';
                                      }}
                                    />
                                  </div>

                                  {/* Reordering Controls */}
                                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-0.5">
                                      {/* Move Left */}
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => handleMoveProductImage(idx, 'left')}
                                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                        title="เลื่อนไปข้างหน้า"
                                      >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                      </button>
                                      {/* Move Right */}
                                      <button
                                        type="button"
                                        disabled={idx === productForm.images.length - 1}
                                        onClick={() => handleMoveProductImage(idx, 'right')}
                                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                        title="เลื่อนไปข้างหลัง"
                                      >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {!isMain && (
                                      <button
                                        type="button"
                                        onClick={() => handleSetMainProductImage(idx)}
                                        className="text-[9px] font-semibold text-sky-600 hover:text-sky-800 hover:underline px-1 py-0.5 rounded cursor-pointer"
                                        title="ตั้งเป็นรูปหลัก"
                                      >
                                        ตั้งรูปหลัก
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-2">
                          <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-xs font-semibold text-slate-700">
                            ยังไม่มีรูปภาพสินค้าในรายการ
                          </p>
                          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                            คลิกปุ่ม "อัปโหลดรูป" ด้านบนเพื่อเลือกรูปภาพจากเครื่อง (เลือกได้หลายรูปพร้อมกัน สูงสุด 5 รูป) หรือวาง URL รูปภาพ
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">รายละเอียดสินค้าสั้นๆ</label>
                      <textarea
                        rows={2}
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        placeholder="ระบบกรอง RO นวัตกรรมเกาหลี ดีไซน์มินิมอล..."
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded-xl"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isProductSubmitting}
                      className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isProductSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>กำลังบันทึก...</span>
                        </>
                      ) : (
                        <span>บันทึกสินค้าลง Supabase</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Product List */}
              <div className="space-y-3">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 p-1 flex items-center justify-center">
                        <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            ID: {p.id}
                          </span>
                          <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded font-medium">
                            📷 {p.images?.length || 1} รูป
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          เริ่มต้น <span className="font-bold text-sky-600">฿{p.startingMonthlyPrice.toLocaleString()}</span> / เดือน · หมวดหมู่: {p.categoryLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0">
                      <button
                        onClick={() => {
                          const existingImages = (p.images && p.images.length > 0)
                            ? [...p.images]
                            : (p.image ? [p.image] : []);

                          setEditingProductId(p.id);
                          setProductForm({
                            name: p.name,
                            price: p.startingMonthlyPrice,
                            imageUrl: existingImages[0] || '',
                            images: existingImages,
                            description: p.description,
                            category: p.category,
                          });
                          setInputImageUrl('');
                          setProductImageStats(null);
                          setIsAddingProduct(true);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                        title="ลบสินค้านี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* TAB 3: จัดการแบนเนอร์ (BANNERS) */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'banners' && (
            <BannersTab
              formData={formData}
              setFormData={setFormData}
              onSaveSettings={onSaveSettings}
              onRefreshSettings={onRefreshSettings}
              showToast={showToast}
            />
          )}

          {/* ------------------------------------------------------- */}
          {/* TAB 4: จัดการบทความ (ARTICLES MANAGEMENT) */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'articles' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-sky-600" />
                    <span>จัดการบทความ & สาระน่ารู้เพื่อสุขภาพ</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    เพิ่ม แก้ไข ลบ และเปลี่ยนรูปภาพบทความที่สนับสนุนให้ลูกค้าตัดสินใจเลือกใช้ Coway
                  </p>
                </div>
                {!isAddingArticle && (
                  <button
                    onClick={handleOpenAddArticle}
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>➕ เพิ่มบทความใหม่</span>
                  </button>
                )}
              </div>

              {/* Search & Category Filter Toolbar */}
              {!isAddingArticle && (
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
                        onClick={() => setArticleCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          articleCategoryFilter === cat.id
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

              {/* Add / Edit Article Form */}
              {isAddingArticle && (
                <div className="p-5 sm:p-7 bg-sky-50/70 rounded-3xl border-2 border-sky-300 space-y-5 animate-in fade-in">
                  <div className="flex justify-between items-center pb-3 border-b border-sky-200">
                    <span className="font-bold text-base text-sky-950 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-sky-600" />
                      <span>{editingArticleId ? '✏️ แก้ไขข้อมูลบทความ' : '➕ เพิ่มบทความใหม่ลงเว็บไซต์'}</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsAddingArticle(false);
                        setEditingArticleId(null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 bg-white rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Article Title */}
                    <div className="sm:col-span-2">
                      <label className="block text-slate-800 font-bold mb-1">
                        หัวข้อบทความ (Title) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={articleForm.title || ''}
                        onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                        placeholder="เช่น ทำไมคนรุ่นใหม่ถึงเปลี่ยนจากน้ำขวดแพ็คมาใช้ Coway Subscription?"
                        className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-sky-500 text-xs sm:text-sm font-semibold text-slate-900"
                      />
                    </div>

                    {/* Category Selector */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">หมวดหมู่บทความ</label>
                      <select
                        value={articleForm.category || 'water'}
                        onChange={(e) => {
                          const cat = e.target.value as any;
                          let label = 'เครื่องกรองน้ำ & RO';
                          if (cat === 'service') label = 'บริการ Cody Heart Service';
                          else if (cat === 'air') label = 'เครื่องฟอกอากาศ & สุขภาพ';
                          else if (cat === 'health') label = 'ความคุ้มค่า & ไลฟ์สไตล์';
                          setArticleForm({
                            ...articleForm,
                            category: cat,
                            categoryLabel: label,
                          });
                        }}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500 cursor-pointer"
                      >
                        <option value="water">เครื่องกรองน้ำ & RO (Water Purifier)</option>
                        <option value="service">บริการหลังการขาย (Cody Heart Service)</option>
                        <option value="air">เครื่องฟอกอากาศ & PM 2.5 (Air Purifier)</option>
                        <option value="health">ความคุ้มค่า & ไลฟ์สไตล์สุขภาพ (Health & Value)</option>
                      </select>
                    </div>

                    {/* Category Label Custom Text */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">ป้ายกำกับหมวดหมู่ (Category Badge)</label>
                      <input
                        type="text"
                        value={articleForm.categoryLabel || ''}
                        onChange={(e) => setArticleForm({ ...articleForm, categoryLabel: e.target.value })}
                        placeholder="เช่น ความคุ้มค่า & ไลฟ์สไตล์"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500"
                      />
                    </div>

                    {/* Read Time */}
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

                    {/* Date / Update Tag */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">วันที่ / แท็กอัปเดต</label>
                      <input
                        type="text"
                        value={articleForm.date || 'อัปเดตล่าสุด 2026'}
                        onChange={(e) => setArticleForm({ ...articleForm, date: e.target.value })}
                        placeholder="เช่น อัปเดตล่าสุด 2026"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-sky-500"
                      />
                    </div>

                    {/* Summary */}
                    <div className="sm:col-span-2">
                      <label className="block text-slate-800 font-bold mb-1">
                        คำโปรย / สรุปย่อของบทความ (Summary) <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={articleForm.summary || ''}
                        onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                        placeholder="สรุปเนื้อหาสำคัญ 2-3 บรรทัด สำหรับแสดงบนการ์ดหน้าเว็บ..."
                        className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-sky-500 leading-relaxed"
                      />
                    </div>

                    {/* Image Upload & URL */}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-slate-800 font-bold">
                        รูปภาพปกบทความ (อัปโหลดเข้า Supabase Storage หรือวาง URL) <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          required
                          value={articleForm.imageUrl || ''}
                          onChange={(e) => setArticleForm({ ...articleForm, imageUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/... หรือกดปุ่มอัปโหลดรูป"
                          className="flex-1 px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-sky-500 font-mono text-xs"
                        />
                        <label className="px-4 py-2.5 bg-slate-900 hover:bg-sky-600 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                          {articleImageUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                              <span>กำลังอัปโหลด...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-white" />
                              <span>เลือกรูปจากอุปกรณ์</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleArticleImageUpload}
                            className="hidden"
                            disabled={articleImageUploading}
                          />
                        </label>
                      </div>

                      {/* Image Preview & Compression Stats */}
                      {articleForm.imageUrl && (
                        <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center gap-3 animate-in fade-in">
                          <div className="w-24 h-16 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                            <img src={articleForm.imageUrl} alt="รูปบทความ" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-slate-800 block truncate">{articleForm.title || 'ตัวอย่างรูปบทความ'}</span>
                            <span className="text-[11px] text-emerald-600 font-medium block">
                              🟢 {articleImageStats || 'รูปภาพพร้อมบันทึกลงฐานข้อมูล Supabase'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Key Takeaways (Bullet Points) */}
                    <div className="sm:col-span-2">
                      <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                        <span>จุดเด่น / สรุปสาระสำคัญ (Key Takeaways)</span>
                        <span className="text-[11px] text-slate-500 font-normal">พิมพ์ 1 ข้อต่อ 1 บรรทัด</span>
                      </label>
                      <textarea
                        rows={3}
                        value={articleKeyPointsRaw}
                        onChange={(e) => setArticleKeyPointsRaw(e.target.value)}
                        placeholder={'ประหยัดกว่าซื้อน้ำขวดปีละ 10,000 บาท\nมีบริการ Cody ล้างถังและเปลี่ยนไส้กรองฟรีถึงบ้าน\nได้มาตรฐานรับรอง WQA Gold Seal'}
                        className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-sky-500 font-sans text-xs leading-relaxed"
                      />
                    </div>

                    {/* Full Content Paragraphs */}
                    <div className="sm:col-span-2">
                      <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                        <span>เนื้อหาบทความฉบับเต็ม (Full Article Content)</span>
                        <span className="text-[11px] text-slate-500 font-normal">เว้นบรรทัด 2 ครั้ง (กด Enter 2 ครั้ง) เพื่อขึ้นย่อหน้าใหม่</span>
                      </label>
                      <textarea
                        rows={5}
                        value={articleContentRaw}
                        onChange={(e) => setArticleContentRaw(e.target.value)}
                        placeholder={'ย่อหน้าที่ 1: เกริ่นนำปัญหาเรื่องค่าน้ำดื่มและการแบกน้ำหนักเข้าบ้าน...\n\nย่อหน้าที่ 2: อธิบายว่าเครื่องกรองน้ำระบบสมาชิก Coway เข้ามาช่วยแก้ปัญหานี้ได้อย่างไร...\n\nย่อหน้าที่ 3: สรุปความคุ้มค่าและบริการ Cody Heart Service ดูแลฟรีตลอดสัญญา...'}
                        className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-sky-500 font-sans text-xs leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-200">
                    <button
                      onClick={() => {
                        setIsAddingArticle(false);
                        setEditingArticleId(null);
                      }}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleSaveArticleForm}
                      className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingArticleId ? 'อัปเดตบทความ' : 'บันทึกบทความ'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Articles Cards Grid List */}
              {!isAddingArticle && (
                <div className="space-y-3">
                  {(() => {
                    const articlesList = formData.articles && formData.articles.length > 0
                      ? formData.articles
                      : DEFAULT_ARTICLES;

                    const filtered = articlesList.filter((a) => {
                      const matchesSearch =
                        a.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
                        a.summary.toLowerCase().includes(articleSearch.toLowerCase());
                      const matchesCat = articleCategoryFilter === 'all' || a.category === articleCategoryFilter;
                      return matchesSearch && matchesCat;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-2">
                          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                          <h4 className="text-sm font-bold text-slate-800">ไม่พบบทความที่ค้นหา</h4>
                          <p className="text-xs text-slate-500">ลองเปลี่ยนคำค้นหาหรือกดปุ่ม "เพิ่มบทความใหม่"</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 gap-3">
                        {filtered.map((art) => (
                          <div
                            key={art.id}
                            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                          >
                            {/* Left: Thumbnail & Info */}
                            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                              <div className="w-24 sm:w-28 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative">
                                <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" />
                              </div>

                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded-md">
                                    {art.categoryLabel || 'สาระน่ารู้'}
                                  </span>
                                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{art.readTime || '3 นาที'}</span>
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate" title={art.title}>
                                  {art.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xl">
                                  {art.summary}
                                </p>
                              </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0">
                              <button
                                onClick={() => handleOpenEditArticle(art)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>แก้ไข</span>
                              </button>

                              <button
                                onClick={() => handleDeleteArticle(art.id, art.title)}
                                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                                title="ลบบทความนี้"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* TAB 5: ข้อมูลติดต่อ (CONTACT & SOCIAL) */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  ข้อมูลการติดต่อและโซเชียล (Contact Channels)
                </h3>
                <p className="text-xs text-slate-500">
                  แก้ไขเบอร์โทรศัพท์, LINE ID, LINE Link, และ Facebook URL โดยหน้าเว็บไซต์จะดึงข้อมูลล่าสุดไปใช้ทันที
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                
                {/* Phone Card */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Phone className="w-4 h-4 text-sky-600" />
                    <span>เบอร์โทรศัพท์สำหรับโทรออก</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                      เบอร์โทรระบบ tel: (เช่น 0812345678 หรือ 020000000)
                    </label>
                    <input
                      type="text"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                      ข้อความแสดงผลบนหน้าเว็บ (เช่น 02-000-0000)
                    </label>
                    <input
                      type="text"
                      value={formData.phoneDisplay}
                      onChange={(e) => setFormData({ ...formData, phoneDisplay: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500 text-xs"
                    />
                  </div>
                  <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>ทดสอบลิงก์:</span>
                    <a href={`tel:${formData.phoneNumber}`} className="text-sky-600 underline font-semibold">
                      tel:{formData.phoneNumber}
                    </a>
                  </div>
                </div>

                {/* LINE OA Card */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>LINE Official Account</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                      LINE ID (เช่น @cowaythailand)
                    </label>
                    <input
                      type="text"
                      value={formData.lineId}
                      onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                      ลิงก์ LINE (เช่น https://line.me/ti/p/~@cowaythailand)
                    </label>
                    <input
                      type="text"
                      value={formData.lineUrl}
                      onChange={(e) => setFormData({ ...formData, lineUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500 text-xs"
                    />
                  </div>
                  <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>ทดสอบเปิด LINE:</span>
                    <a
                      href={formData.lineUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 underline font-semibold flex items-center gap-0.5"
                    >
                      <span>เปิดทดสอบลิงก์</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Agent LINE Card (ลิงก์สมัครตัวแทนขาย) */}
                <div className="bg-linear-to-br from-amber-50 to-orange-50 p-4 sm:p-5 rounded-3xl border border-amber-200 space-y-3 sm:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-amber-950 font-bold">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      <span>ลิงก์ LINE สำหรับ "สมัครตัวแทนขาย"</span>
                    </div>
                    <span className="text-[10px] font-semibold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                      แสดงผลบน Navbar, Hero และ Contact
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    กำหนดลิงก์ LINE หรือ LINE OA แยกเฉพาะสำหรับรับสมัครตัวแทนขาย เมื่อผู้ใช้กดปุ่ม "สมัครตัวแทนขาย" บนหน้าเว็บ จะเปิดไปยังลิงก์นี้ทันที
                  </p>
                  <div>
                    <label className="block text-[11px] text-amber-900 font-semibold mb-1">
                      ลิงก์ LINE สมัครตัวแทนขาย (เช่น https://line.me/ti/p/~@your_agent_line)
                    </label>
                    <input
                      type="text"
                      value={formData.agentLineUrl || ''}
                      onChange={(e) => setFormData({ ...formData, agentLineUrl: e.target.value })}
                      placeholder={formData.lineUrl || 'https://line.me/ti/p/~@cowaythailand'}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 focus:outline-amber-500 text-xs text-slate-900"
                    />
                  </div>
                  <div className="pt-1 text-[11px] text-amber-900/80 flex items-center gap-1.5">
                    <span>ทดสอบเปิดลิงก์:</span>
                    <a
                      href={formData.agentLineUrl || formData.lineUrl || 'https://line.me'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-800 hover:text-amber-950 underline font-semibold flex items-center gap-0.5"
                    >
                      <span>เปิดทดสอบลิงก์สมัครตัวแทนขาย</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Facebook Card */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200 space-y-3 sm:col-span-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>Facebook Page</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                        ชื่อเพจ Facebook ที่แสดงบนเว็บ
                      </label>
                      <input
                        type="text"
                        value={formData.facebookName || ''}
                        onChange={(e) => setFormData({ ...formData, facebookName: e.target.value })}
                        placeholder="Coway Thailand Official Partner"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                        URL เพจ Facebook
                      </label>
                      <input
                        type="text"
                        value={formData.facebookUrl || ''}
                        onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/..."
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* TAB 5: ตั้งค่าเว็บไซต์ (SITE SETTINGS & LOGO) */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  ตั้งค่าเว็บไซต์ (Website Info &amp; Logo)
                </h3>
                <p className="text-xs text-slate-500">
                  ปรับชื่อเว็บไซต์ Logo ข้อความหน้าแรก และข้อมูลบริการ
                </p>
              </div>

              {/* Logo Section */}
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>โลโก้เว็บไซต์ (Website Logo)</span>
                  </div>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: '' })}
                      className="text-xs text-rose-600 hover:underline cursor-pointer"
                    >
                      ลบ Logo (ใช้ตัวอักษรแทน)
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-32 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center p-2 overflow-hidden shrink-0">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">ตัวอักษร COWAY</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="px-4 py-2 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors">
                      {logoUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>กำลังอัปโหลด...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>อัปโหลดรูป Logo ใหม่</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={logoUploading}
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500 mt-1">
                      แนะนำภาพขนาดสัดส่วนแนวนอน พื้นหลังโปร่งใส (PNG หรือ WebP)
                    </p>
                  </div>
                </div>
              </div>

              {/* General Site Copy Grid */}
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">ข้อความหลักของเว็บไซต์</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ชื่อเว็บไซต์ / ชื่อร้าน</label>
                    <input
                      type="text"
                      value={formData.siteName}
                      onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">สโลแกนร้าน</label>
                    <input
                      type="text"
                      value={formData.siteTagline}
                      onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ข้อความ Badge หน้าแรก</label>
                    <input
                      type="text"
                      value={formData.heroBadge}
                      onChange={(e) => setFormData({ ...formData, heroBadge: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">หัวข้อหลักหน้าแรก (Hero Title)</label>
                    <input
                      type="text"
                      value={formData.heroTitle}
                      onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-sky-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">ข้อความอธิบายหน้าแรก (Hero Subtitle)</label>
                    <textarea
                      rows={2}
                      value={formData.heroSubtitle}
                      onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">หัวข้อส่วนติดต่อ</label>
                    <input
                      type="text"
                      value={formData.contactHeading}
                      onChange={(e) => setFormData({ ...formData, contactHeading: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">เวลาทำการ</label>
                    <input
                      type="text"
                      value={formData.contactHours}
                      onChange={(e) => setFormData({ ...formData, contactHours: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-sky-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">พื้นที่ให้บริการ / ที่อยู่</label>
                    <input
                      type="text"
                      value={formData.contactAddress}
                      onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* STICKY BOTTOM ACTIONS BAR (Mobile & Desktop) */}
        {/* ========================================================= */}
        <footer className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 sticky bottom-0 z-20">
          <div className="text-xs text-slate-500 hidden sm:block">
            เมื่อกดบันทึก ข้อมูลจะถูกบันทึกลง Supabase และแสดงผลบนหน้าเว็บไซต์จริงทันที
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={handleSaveAllSettings}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-sky-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึกลง Supabase...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>บันทึกข้อมูลลง Supabase</span>
                </>
              )}
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};
