import React from 'react';
import { CowayProduct } from '../types';
import { Droplets, Wind, Sparkles, Bed, Flame, Snowflake, Check, MessageCircle, Eye, Scale } from 'lucide-react';

interface ProductCardProps {
  product: CowayProduct;
  onViewDetails: (product: CowayProduct) => void;
  onQuickInquiry: (product: CowayProduct) => void;
  isCompared?: boolean;
  onToggleCompare?: (product: CowayProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onQuickInquiry,
  isCompared,
  onToggleCompare,
}) => {
  // Category icon helper
  const renderCategoryIcon = () => {
    switch (product.category) {
      case 'water':
        return <Droplets className="w-3.5 h-3.5 text-sky-500" />;
      case 'air':
        return <Wind className="w-3.5 h-3.5 text-teal-500" />;
      case 'bidet':
        return <Sparkles className="w-3.5 h-3.5 text-blue-500" />;
      case 'mattress':
        return <Bed className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 hover:border-sky-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
      {/* Top Image Canvas */}
      <div className="relative aspect-4/3 bg-slate-50 flex items-center justify-center p-4 overflow-hidden border-b border-slate-100">
        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Multiple Images Indicator Badge */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs pointer-events-none">
            <span>📷 {product.images.length} รูป</span>
          </div>
        )}

        {/* Quiet Top Meta Badges (zero-pill: text based clean strip) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {product.isPopular && (
            <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              ยอดนิยม
            </span>
          )}
          {product.isNew && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              รุ่นใหม่ล่าสุด
            </span>
          )}
        </div>

        {/* Compare Toggle Button */}
        {onToggleCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            aria-label="เปรียบเทียบสินค้ารุ่นนี้"
            className={`absolute top-3 right-3 p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              isCompared
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white/90 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">
              {isCompared ? 'เปรียบเทียบอยู่' : 'เปรียบเทียบ'}
            </span>
          </button>
        )}

        {/* Water temperature indicators if water category */}
        {product.waterTypes && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-md text-[11px] font-medium text-slate-700 border border-slate-200/60 shadow-xs">
            {product.waterTypes.includes('hot') && (
              <span className="flex items-center gap-0.5 text-rose-600" title="น้ำร้อน">
                <Flame className="w-3 h-3" /> ร้อน
              </span>
            )}
            {product.waterTypes.includes('cold') && (
              <span className="flex items-center gap-0.5 text-sky-600" title="น้ำเย็น">
                <Snowflake className="w-3 h-3" /> เย็น
              </span>
            )}
            {product.waterTypes.includes('room') && (
              <span className="flex items-center gap-0.5 text-slate-600" title="น้ำอุณหภูมิห้อง">
                <Droplets className="w-3 h-3" /> ปกติ
              </span>
            )}
            {product.waterTypes.includes('ice') && (
              <span className="flex items-center gap-0.5 text-cyan-600 font-semibold" title="น้ำแข็งบริสุทธิ์">
                🧊 น้ำแข็ง
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category & Model Code Line */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              {renderCategoryIcon()}
              <span>{product.categoryLabel}</span>
            </div>
            <span className="font-mono text-slate-400">{product.modelCode}</span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onViewDetails(product)}
            className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {product.shortDesc}
          </p>

          {/* Key Bullets (2 max) */}
          <ul className="pt-1 space-y-1 text-xs text-slate-500">
            {product.keyFeatures.slice(0, 2).map((feat, idx) => (
              <li key={idx} className="flex items-start gap-1.5 truncate">
                <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                <span className="truncate">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing Block */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Subscription รายเดือน
              </div>
              <div className="flex items-baseline gap-1 text-sky-600 font-bold">
                <span className="text-xs font-medium text-slate-500">เริ่มต้น</span>
                <span className="text-2xl font-bold font-mono tabular-nums">
                  {product.startingMonthlyPrice.toLocaleString()}
                </span>
                <span className="text-xs text-slate-600 font-medium">.- / เดือน</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-400">ราคาซื้อสด</div>
              <div className="text-xs font-mono text-slate-500 tabular-nums">
                ฿{product.cashPrice.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>ฟรีค่าบริการ Cody ดูแลตลอดสัญญา</span>
          </div>
        </div>

        {/* Card CTA Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onViewDetails(product)}
            className="w-full py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer focus:outline-hidden"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span>ดูรายละเอียด</span>
          </button>

          <button
            onClick={() => onQuickInquiry(product)}
            className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs focus:outline-hidden"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>สนใจรุ่นนี้</span>
          </button>
        </div>
      </div>
    </div>
  );
};
