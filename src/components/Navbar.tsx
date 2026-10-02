import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Menu, X, ShoppingBag, ArrowRight, Settings, UserCheck } from 'lucide-react';
import { CowayProduct } from '../types';
import { SiteSettings } from '../types/settings';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  inquiryCount: number;
  onOpenInquiry: () => void;
  siteSettings?: SiteSettings;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  inquiryCount,
  onOpenInquiry,
  siteSettings,
  onOpenAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Secret 5-click mechanism on logo to enter Admin portal
  const [logoClickCount, setLogoClickCount] = useState(0);
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    handleLinkClick('hero');

    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    if (newCount >= 5) {
      setLogoClickCount(0);
      if (onOpenAdmin) {
        onOpenAdmin();
      }
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        setLogoClickCount(0);
      }, 3000);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'hero', label: 'หน้าแรก' },
    { id: 'products', label: 'สินค้าทั้งหมด' },
    { id: 'services', label: 'บริการ Cody' },
    { id: 'calculator', label: 'คำนวณความคุ้มค่า' },
    { id: 'articles', label: 'บทความ & สาระน่ารู้' },
    { id: 'about', label: 'เกี่ยวกับเรา' },
    { id: 'contact', label: 'ติดต่อเรา' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100 py-3'
          : 'bg-white/90 backdrop-blur-xs border-b border-slate-100/60 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Zone 1: Single text element wordmark or Custom Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-1.5 text-left group cursor-pointer focus:outline-hidden active:scale-95 transition-transform select-none"
            title="COWAY THAIPLUS"
          >
            {siteSettings?.logoUrl ? (
              <img
                src={siteSettings.logoUrl}
                alt={siteSettings.siteName || 'COWAY THAIPLUS'}
                className="h-8 max-w-[160px] object-contain"
              />
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tracking-tight text-sky-600 transition-colors">
                  COWAY
                </span>
                <span className="text-sm font-bold text-sky-500 tracking-wider">
                  THAIPLUS
                </span>
              </div>
            )}
          </button>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`transition-colors hover:text-sky-600 cursor-pointer relative py-1 focus:outline-hidden ${
                  activeSection === link.id
                    ? 'text-sky-600 font-semibold'
                    : 'text-slate-600'
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Inquiry Wishlist Button */}
            <button
              onClick={onOpenInquiry}
              aria-label="รายการที่สนใจ"
              className="relative p-2 text-slate-700 hover:text-sky-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {inquiryCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sky-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {inquiryCount}
                </span>
              )}
            </button>

            {/* Direct Line Chat CTA - Green */}
            <a
              href={siteSettings?.lineUrl || "https://line.me"}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#06c755] hover:bg-[#05b34c] rounded-lg transition-all shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span className="whitespace-nowrap">แอด LINE</span>
            </a>

            {/* สมัครตัวแทนขาย (ตำแหน่งที่ 1: Header Bar) */}
            <a
              href={siteSettings?.agentLineUrl || siteSettings?.lineUrl || "https://line.me"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 bg-linear-to-r from-amber-100 via-amber-200 to-amber-100 hover:from-amber-200 hover:to-amber-300 border border-amber-300/90 rounded-lg transition-all shadow-xs hover:shadow-sm shrink-0"
              title="สมัครตัวแทนขาย Coway"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-800" />
              <span className="whitespace-nowrap">สมัครตัวแทนขาย</span>
            </a>

            {/* Direct Call CTA - Black */}
            <a
              href={`tel:${siteSettings?.phoneNumber || '020000000'}`}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-black hover:bg-slate-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-white" />
              <span>{siteSettings?.phoneDisplay || '02-000-0000'}</span>
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-hidden"
              aria-label="เปิดเมนู"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  activeSection === link.id
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100 space-y-2.5">
            {/* ปุ่มสมัครตัวแทนขายบนมือถือ */}
            <a
              href={siteSettings?.agentLineUrl || siteSettings?.lineUrl || "https://line.me"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-linear-to-r from-amber-500 to-amber-600 text-white rounded-xl text-sm font-bold shadow-xs hover:from-amber-600 hover:to-amber-700 transition-all"
            >
              <UserCheck className="w-4 h-4 text-amber-100" />
              <span>สมัครตัวแทนขาย Coway (คลิก)</span>
            </a>

            <a
              href={`tel:${siteSettings?.phoneNumber || '020000000'}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Phone className="w-4 h-4 text-white" />
              <span>โทรปรึกษาด่วน {siteSettings?.phoneDisplay || '02-000-0000'}</span>
            </a>
            <a
              href={siteSettings?.lineUrl || "https://line.me"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#06c755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>แอด LINE ({siteSettings?.lineId || '@cowaythailand'})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
