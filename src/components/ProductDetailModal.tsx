import React, { useState } from 'react';
import { CowayProduct, SubscriptionOption } from '../types';
import {
  X,
  Check,
  ShieldCheck,
  Clock,
  Sparkles,
  Droplets,
  Flame,
  Snowflake,
  MessageCircle,
  Phone,
  ShoppingBag,
  Share2,
  Calendar,
  Layers,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: CowayProduct | null;
  onClose: () => void;
  onAddToInquiry: (product: CowayProduct, option: SubscriptionOption) => void;
  onDirectContact: (product: CowayProduct, option: SubscriptionOption) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToInquiry,
  onDirectContact,
}) => {
  if (!product) return null;

  // Selected subscription option (default to first/popular)
  const [selectedOption, setSelectedOption] = useState<SubscriptionOption>(
    product.subscriptionOptions[0]
  );
  const [copied, setCopied] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Get list of up to 5 images, fallback to single product.image
  const allImages = (product.images && product.images.length > 0)
    ? product.images.slice(0, 5)
    : (product.image ? [product.image] : []);

  // Reset active image index whenever opened product changes
  React.useEffect(() => {
    setActiveImageIdx(0);
  }, [product?.id]);

  const activeImage = allImages[activeImageIdx] || product.image;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineChatUrl = `https://line.me/R/ti/p/@cowayth?text=${encodeURIComponent(
    `สวัสดีครับ/ค่ะ สนใจสั่งซื้อสินค้า Coway รุ่น ${product.name} (${product.modelCode}) แพ็กเกจ ${selectedOption.label} ราคา ${selectedOption.monthlyPrice} บาท/เดือน ขอทราบโปรโมชั่นพิเศษและคิวติดตั้งครับ`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md">
              {product.categoryLabel}
            </span>
            <span className="font-mono text-xs text-slate-400">
              รหัสรุ่น: {product.modelCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="แชร์ลิงก์สินค้ารุ่นนี้"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Content (Scrollable) */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Top Two Column Layout: Image + Buying Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Product Image Gallery */}
            <div className="md:col-span-6 bg-slate-50 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center border border-slate-100 relative group">
              {/* Main Image Viewport */}
              <div className="relative w-full aspect-square sm:max-h-[340px] flex items-center justify-center overflow-hidden">
                <img
                  src={activeImage}
                  alt={`${product.name} รูปที่ ${activeImageIdx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-md transition-all duration-300"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                {/* Left/Right Arrow Navigation (Only when > 1 image) */}
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                      aria-label="รูปก่อนหน้า"
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all hover:scale-110 cursor-pointer focus:outline-hidden"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIdx((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                      aria-label="รูปถัดไป"
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all hover:scale-110 cursor-pointer focus:outline-hidden"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Counter Badge */}
                    <div className="absolute top-2 right-2 bg-slate-900/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full font-mono">
                      {activeImageIdx + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails Strip (Only when > 1 image) */}
              {allImages.length > 1 && (
                <div className="mt-3.5 w-full flex items-center justify-center gap-2 overflow-x-auto py-1">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden p-1 bg-white border-2 transition-all cursor-pointer shrink-0 ${
                        activeImageIdx === idx
                          ? 'border-sky-500 ring-2 ring-sky-300 shadow-xs scale-105'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                      title={`ดูรูปที่ ${idx + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt={`ภาพย่อ ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-sky-600/90 text-[8px] text-white text-center font-bold py-0.2 leading-tight">
                          รูปหลัก
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Water Types Tag Pills */}
              {product.waterTypes && (
                <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs font-medium">
                  {product.waterTypes.includes('hot') && (
                    <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                      <Flame className="w-3.5 h-3.5 text-rose-500" /> น้ำร้อน
                    </span>
                  )}
                  {product.waterTypes.includes('cold') && (
                    <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                      <Snowflake className="w-3.5 h-3.5 text-sky-500" /> น้ำเย็น
                    </span>
                  )}
                  {product.waterTypes.includes('room') && (
                    <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      <Droplets className="w-3.5 h-3.5 text-slate-500" /> น้ำปกติ
                    </span>
                  )}
                  {product.waterTypes.includes('ice') && (
                    <span className="inline-flex items-center gap-1 text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-100 font-semibold">
                      🧊 น้ำแข็งใสสะอาด
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right: Product Details & Subscription Selector */}
            <div className="md:col-span-6 space-y-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {product.name}
                </h1>
                <p className="text-sm font-medium text-sky-600 mt-1">
                  {product.tagline}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {product.fullDesc}
                </p>
              </div>

              {/* Subscription Options Selection */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  เลือกแพ็กเกจสัญญาบริการ (Coway Subscription):
                </div>

                <div className="space-y-2">
                  {product.subscriptionOptions.map((opt, i) => {
                    const isSelected = selectedOption.years === opt.years;
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedOption(opt)}
                        className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-semibold text-slate-900">
                              {opt.label}
                            </span>
                            {opt.badge && (
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 leading-tight">
                            {opt.codyService}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-base sm:text-lg font-bold text-sky-600 font-mono tabular-nums">
                            ฿{opt.monthlyPrice.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500">/ เดือน</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cash Price Notice */}
              <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                <span>ราคาชำระเงินสด (พร้อมแพ็กเกจบริการ 1 ปี):</span>
                <span className="font-mono font-semibold text-slate-700">
                  ฿{product.cashPrice.toLocaleString()}
                </span>
              </div>

              {/* Action Buttons Row */}
              <div className="space-y-2 pt-3">
                <a
                  href={lineChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-[#06c755] hover:bg-[#05b34c] text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>แอด LINE สั่งซื้อ / ปรึกษาโปรโมชั่น</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onAddToInquiry(product, selectedOption)}
                    className="py-3 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-sky-200 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>เพิ่มในรายการที่สนใจ</span>
                  </button>

                  <a
                    href="tel:0829988998"
                    className="py-3 px-3 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>โทรติดต่อทันที</span>
                  </a>
                </div>
              </div>

              {copied && (
                <div className="text-xs text-center text-emerald-600 font-medium animate-in fade-in">
                  คัดลอกลิงก์เรียบร้อยแล้ว!
                </div>
              )}
            </div>
          </div>

          {/* Highlights Section */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>จุดเด่นและนวัตกรรมเฉพาะของรุ่น {product.name}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {product.highlights.map((hl, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                    {hl.title}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {hl.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specifications Table */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>ข้อมูลสเปกทางเทคนิค</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              {product.tankCapacity && (
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">ความจุถังน้ำ:</span>
                  <span className="font-medium text-slate-900 text-right">{product.tankCapacity}</span>
                </div>
              )}
              {product.coverageArea && (
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">พื้นที่การฟอกอากาศ:</span>
                  <span className="font-medium text-slate-900">{product.coverageArea}</span>
                </div>
              )}
              {product.filtrationSystem && (
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">ระบบการกรอง:</span>
                  <span className="font-medium text-slate-900 text-right">{product.filtrationSystem}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">ขนาดตัวเครื่อง (ก x ล x ส):</span>
                <span className="font-medium text-slate-900">{product.dimensions}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">น้ำหนักตัวเครื่อง:</span>
                <span className="font-medium text-slate-900">{product.weight}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">อัตราการกินไฟ:</span>
                <span className="font-medium text-slate-900">{product.powerConsumption}</span>
              </div>
              <div className="col-span-1 sm:col-span-2 flex justify-between py-1.5 pt-2">
                <span className="text-slate-500">รอบการบริการ Cody:</span>
                <span className="font-medium text-sky-700">{product.codyCycle}</span>
              </div>
            </div>
          </div>

          {/* Cody Heart Service Guarantee Callout */}
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-xs text-sky-900 leading-relaxed">
              <strong className="font-semibold">สิทธิประโยชน์พิเศษตลอดสัญญา:</strong> ฟรีค่าติดตั้งอุปกรณ์ถึงบ้าน, ฟรีบริการทำความสะอาดและฆ่าเชื้อถังน้ำทุก 2 เดือน, ฟรีเปลี่ยนไส้กรองแท้ทุก 4 เดือน, ฟรีรับประกันตัวเครื่องและอะไหล่แท้ 100% ตลอดสัญญา ไม่เสียค่าใช้จ่ายแอบแฝง
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
