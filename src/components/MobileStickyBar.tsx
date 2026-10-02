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
        {/* Call Quick Action - Black */}
        <a
          href={`tel:${siteSettings?.phoneNumber || '020000000'}`}
          className="flex-1 min-h-[44px] py-2 px-3 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
        >
          <Phone className="w-3.5 h-3.5 text-white" />
          <span>โทรด่วน</span>
        </a>

        {/* LINE Chat Action - Green with Pulsing Indicator */}
        <a
          href={siteSettings?.lineUrl || "https://line.me"}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex-1 min-h-[44px] py-2 px-3 bg-[#06c755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 overflow-hidden"
        >
          {/* Pulsing radar dot indicator */}
          <span className="absolute top-1.5 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <MessageCircle className="w-3.5 h-3.5 text-white animate-pulse" />
          <span>แอด LINE</span>
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
