import React, { useState } from 'react';
import { SiteSettings, HeroBanner } from '../../types/settings';
import { CowayProduct } from '../../types/index.ts';
import { settingsService } from '../../services/settingsService';
import { adminProductService } from '../../services/adminProductService';
import { storageService, STORAGE_BUCKET } from '../../services/storageService';
import { formatBytes } from '../../utils/imageCompressor';
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
} from 'lucide-react';

export type AdminMenuTab = 'dashboard' | 'products' | 'banners' | 'contact' | 'settings';

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

  // Banner Management State
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [newBanner, setNewBanner] = useState<Partial<HeroBanner>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    buttonText: 'ดูรายละเอียด',
    buttonLink: '#products',
    isActive: true,
  });
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Product Management State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: 790,
    imageUrl: '',
    description: '',
    category: 'water',
  });
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);
  const [productImageUploading, setProductImageUploading] = useState(false);
  const [productImageStats, setProductImageStats] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

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
  // 1. BANNER ACTIONS
  // ==========================================
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, bannerId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadKey = bannerId || 'new';
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
          setNewBanner((prev) => ({ ...prev, imageUrl: res.url }));
        }
        const sizeInfo = res.originalSize && res.compressedSize
          ? ` (บีบอัดจาก ${formatBytes(res.originalSize)} เหลือ ${formatBytes(res.compressedSize)})`
          : '';
        showToast('success', `อัปโหลดรูปภาพลง Supabase Storage สำเร็จ!${sizeInfo}`);
      } else {
        showToast('error', res.error || 'อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err: any) {
      showToast('error', err.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setIsUploading(null);
    }
  };

  const handleAddNewBanner = () => {
    if (!newBanner.title || !newBanner.imageUrl) {
      showToast('error', 'กรุณาระบุหัวข้อและรูปภาพแบนเนอร์');
      return;
    }

    const created: HeroBanner = {
      id: `banner-${Date.now()}`,
      title: newBanner.title || '',
      subtitle: newBanner.subtitle || '',
      imageUrl: newBanner.imageUrl || '',
      buttonText: newBanner.buttonText || 'ดูรายละเอียด',
      buttonLink: newBanner.buttonLink || '#products',
      isActive: true,
      order: formData.banners.length + 1,
    };

    setFormData((prev) => ({
      ...prev,
      banners: [...prev.banners, created],
    }));

    setNewBanner({
      title: '',
      subtitle: '',
      imageUrl: '',
      buttonText: 'ดูรายละเอียด',
      buttonLink: '#products',
      isActive: true,
    });
    setIsAddingBanner(false);
    showToast('success', 'เพิ่มแบนเนอร์ใหม่ในรายการแล้ว (กดบันทึกเพื่อบันทึกลง Supabase)');
  };

  const handleToggleBannerActive = (bannerId: string) => {
    setFormData((prev) => ({
      ...prev,
      banners: prev.banners.map((b) => (b.id === bannerId ? { ...b, isActive: !b.isActive } : b)),
    }));
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    const newBanners = [...formData.banners];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newBanners.length) return;

    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIdx];
    newBanners[targetIdx] = temp;

    // Re-index orders
    const reordered = newBanners.map((b, i) => ({ ...b, order: i + 1 }));
    setFormData((prev) => ({ ...prev, banners: reordered }));
  };

  const handleDeleteBanner = (bannerId: string) => {
    if (formData.banners.length <= 1) {
      showToast('error', 'ต้องมีแบนเนอร์อย่างน้อย 1 รายการ');
      return;
    }
    const targetBanner = formData.banners.find((b) => b.id === bannerId);
    if (targetBanner?.imageUrl) {
      storageService.deleteImageByUrl(targetBanner.imageUrl).catch(() => {});
    }
    setFormData((prev) => ({
      ...prev,
      banners: prev.banners.filter((b) => b.id !== bannerId),
    }));
    showToast('success', 'ลบแบนเนอร์และจัดการไฟล์ใน Storage แล้ว');
  };

  // ==========================================
  // 2. LOGO UPLOAD ACTION
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
  // 3. PRODUCT ACTIONS
  // ==========================================
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.imageUrl) {
      showToast('error', 'กรุณากรอกชื่อสินค้าและรูปภาพ');
      return;
    }

    setIsProductSubmitting(true);
    try {
      if (editingProductId) {
        const oldProduct = products.find((p) => p.id === editingProductId);
        const res = await adminProductService.updateProduct(
          editingProductId,
          {
            name: productForm.name,
            price: Number(productForm.price),
            image_url: productForm.imageUrl,
            description: productForm.description,
            category: productForm.category,
          },
          oldProduct?.image
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
          image_url: productForm.imageUrl,
          description: productForm.description,
          category: productForm.category,
        });
        if (res.success) {
          showToast('success', res.message);
          setIsAddingProduct(false);
          setProductForm({ name: '', price: 790, imageUrl: '', description: '', category: 'water' });
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
      const res = await adminProductService.deleteProduct(id, target?.image);
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
        {/* 5 CLEAR SUB-NAVIGATION TABS (Thumb-friendly & Scrollable) */}
        {/* ========================================================= */}
        <nav className="flex border-b border-slate-200 bg-slate-50 px-2 sm:px-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3.5 px-3.5 sm:px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>1. Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3.5 px-3.5 sm:px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>2. จัดการสินค้า ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`py-3.5 px-3.5 sm:px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'banners'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>3. จัดการแบนเนอร์ ({formData.banners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`py-3.5 px-3.5 sm:px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>4. ข้อมูลติดต่อ</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-3.5 sm:px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'border-sky-600 text-sky-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>5. ตั้งค่าเว็บไซต์</span>
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

              {/* 3 Overview Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
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

                {/* 3. Supabase Connection Status */}
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
                      Storage Bucket: <span className="font-mono font-medium">{STORAGE_BUCKET}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-700 bg-white/80 p-2 rounded-xl border border-emerald-100">
                    สิทธิ์ความปลอดภัย: RLS Authenticated
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
                    onClick={() => {
                      setActiveTab('banners');
                      setIsAddingBanner(true);
                    }}
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
                    setProductForm({ name: '', price: 790, imageUrl: '', description: '', category: 'water' });
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

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        รูปภาพสินค้า (อัปโหลด หรือ URL) *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={productForm.imageUrl}
                          onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                          placeholder="https://... หรือกดอัปโหลดรูป"
                          className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500 text-xs"
                        />
                        <label className="px-3 py-2 bg-slate-900 hover:bg-sky-600 text-white font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors text-xs">
                          {productImageUploading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>กำลังอัปโหลด...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>เลือกรูป</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={productImageUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setProductImageUploading(true);
                              try {
                                const oldUrl = editingProductId
                                  ? products.find((p) => p.id === editingProductId)?.image
                                  : undefined;
                                const res = await storageService.uploadImage(file, 'products', oldUrl);
                                if (res.success && res.url) {
                                  setProductForm((prev) => ({ ...prev, imageUrl: res.url! }));
                                  const sizeInfo = res.originalSize && res.compressedSize
                                    ? `บีบอัดรูปจาก ${formatBytes(res.originalSize)} เหลือ ${formatBytes(res.compressedSize)}`
                                    : 'บีบอัดรูปภาพเสร็จสิ้น';
                                  setProductImageStats(sizeInfo);
                                  showToast('success', `อัปโหลดรูปสินค้าเข้า Supabase Storage สำเร็จ (${sizeInfo})`);
                                } else {
                                  showToast('error', res.error || 'อัปโหลดรูปไม่สำเร็จ');
                                }
                              } catch (err: any) {
                                showToast('error', err.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
                              } finally {
                                setProductImageUploading(false);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Live Image Preview Before Saving */}
                      {productForm.imageUrl && (
                        <div className="mt-2.5 p-2 bg-white rounded-xl border border-slate-200 flex items-center gap-3 animate-in fade-in">
                          <div className="w-14 h-14 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 p-1 flex items-center justify-center shrink-0">
                            <img src={productForm.imageUrl} alt="ตัวอย่างรูปสินค้า" className="max-h-full max-w-full object-contain" />
                          </div>
                          <div className="min-w-0 flex-1 text-xs">
                            <span className="font-bold text-slate-800 block">ตัวอย่างรูปภาพสินค้าก่อนบันทึก</span>
                            <span className="text-[10px] text-emerald-600 font-semibold block truncate">
                              {productImageStats || '🟢 รูปภาพพร้อมบันทึกลงฐานข้อมูล Supabase'}
                            </span>
                          </div>
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
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          เริ่มต้น <span className="font-bold text-sky-600">฿{p.startingMonthlyPrice.toLocaleString()}</span> / เดือน · หมวดหมู่: {p.categoryLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0">
                      <button
                        onClick={() => {
                          setEditingProductId(p.id);
                          setProductForm({
                            name: p.name,
                            price: p.startingMonthlyPrice,
                            imageUrl: p.image,
                            description: p.description,
                            category: p.category,
                          });
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
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    จัดการแบนเนอร์หน้าแรก (Hero Banners)
                  </h3>
                  <p className="text-xs text-slate-500">
                    เพิ่ม เปลี่ยนรูป แก้ไขข้อความ สลับลำดับ และเปิด/ปิดการแสดงผลสไลด์หน้าแรก
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingBanner(true)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มแบนเนอร์ใหม่</span>
                </button>
              </div>

              {/* Banner List */}
              <div className="space-y-3">
                {formData.banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {/* Order Controls */}
                      <div className="flex flex-col gap-1 items-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveBanner(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                          title="เลื่อนขึ้น"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[11px] font-bold text-slate-600 font-mono">{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleMoveBanner(index, 'down')}
                          disabled={index === formData.banners.length - 1}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                          title="เลื่อนลง"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Image Thumbnail */}
                      <div className="w-24 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative">
                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                      </div>

                      {/* Info & Inputs */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleBannerActive(banner.id)}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                              banner.isActive
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                            title="คลิกเพื่อเปิด/ปิดการแสดงผล"
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
                      {/* Change Image */}
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

                      {/* Delete Banner */}
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        title="ลบแบนเนอร์นี้"
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form to add a new banner */}
              {isAddingBanner && (
                <div className="p-4 sm:p-5 bg-sky-50/70 rounded-3xl border-2 border-sky-200 space-y-4 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-sky-900">➕ เพิ่มแบนเนอร์ใหม่</span>
                    <button onClick={() => setIsAddingBanner(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">หัวข้อแบนเนอร์ *</label>
                      <input
                        type="text"
                        value={newBanner.title || ''}
                        onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                        placeholder="เช่น Coway Neo Plus น้ำสะอาด RO อันดับ 1"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">ข้อความย่อย/โปรโมชั่น</label>
                      <input
                        type="text"
                        value={newBanner.subtitle || ''}
                        onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                        placeholder="เช่น ผ่อนเบาเพียง 790.-/เดือน ฟรีไส้กรองตลอด 5 ปี"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">ข้อความบนปุ่ม</label>
                      <input
                        type="text"
                        value={newBanner.buttonText || ''}
                        onChange={(e) => setNewBanner({ ...newBanner, buttonText: e.target.value })}
                        placeholder="ดูรายละเอียด"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">ลิงก์ของปุ่ม</label>
                      <input
                        type="text"
                        value={newBanner.buttonLink || ''}
                        onChange={(e) => setNewBanner({ ...newBanner, buttonLink: e.target.value })}
                        placeholder="#products"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500 font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-semibold mb-1">
                        รูปภาพแบนเนอร์ (อัปโหลด หรือ วาง URL) *
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={newBanner.imageUrl || ''}
                          onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                          placeholder="https://... หรือกดปุ่มอัปโหลดรูป"
                          className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-sky-500 text-xs"
                        />
                        <label className="px-4 py-2 bg-slate-900 hover:bg-sky-600 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors text-xs">
                          {isUploading === 'new' ? (
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
                            disabled={isUploading === 'new'}
                          />
                        </label>
                      </div>

                      {/* Live Image Preview Before Saving */}
                      {newBanner.imageUrl && (
                        <div className="mt-2.5 p-2.5 bg-white rounded-2xl border border-slate-200 flex items-center gap-3 animate-in fade-in">
                          <div className="w-20 h-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                            <img src={newBanner.imageUrl} alt="ตัวอย่างแบนเนอร์" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-bold text-slate-800 block">ตัวอย่างรูปภาพแบนเนอร์ก่อนบันทึก</span>
                            <span className="text-[10px] text-emerald-600 font-semibold block truncate">
                              🟢 รูปภาพพร้อมบันทึกลง Supabase
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsAddingBanner(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleAddNewBanner}
                      className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      ยืนยันการเพิ่มแบนเนอร์
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* TAB 4: ข้อมูลติดต่อ (CONTACT & SOCIAL) */}
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
