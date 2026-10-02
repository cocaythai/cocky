import React from 'react';
import { Phone, MessageCircle, ShoppingBag } from 'lucide-react';
import { SiteSettings } from '../types/settings';

interface MobileStickyBarProps {
  inquiryCount: number;
  onOpenInquiry: () => void;
  onContactClick: () => void;
  siteSettings?: SiteSettings;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  inquiryCount,
  onOpenInquiry,
  onContactClick,
  siteSettings,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2.5 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        {/* Call Quick Action */}
        <a
          href={`tel:${siteSettings?.phoneNumber || '020000000'}`}
          className="flex-1 min-h-[44px] py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-slate-700" />
          <span>โทรด่วน</span>
        </a>

        {/* LINE Chat Action */}
        <a
          href={siteSettings?.lineUrl || "https://line.me"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-h-[44px] py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>แชท LINE</span>
        </a>

        {/* Wishlist / Inquiry Items */}
        <button
          onClick={onOpenInquiry}
          aria-label="รายการที่สนใจ"
          className="relative min-h-[44px] py-2 px-3 bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>รายการ</span>
          {inquiryCount > 0 && (
            <span className="bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {inquiryCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
